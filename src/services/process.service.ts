import { supabase } from "../lib/supabase";
import { notificationService } from "./notification.service";

export interface UserService {
  id: string;
  user_id: string;
  service_slug: string;
  status: string;
  current_step: number | null;
  step_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const processService = {
  async getUserServices(userId: string): Promise<UserService[]> {
    const { data, error } = await supabase
      .from("user_services")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data as UserService[]) ?? [];
  },

  async hasActiveService(userId: string, slug: string): Promise<boolean> {
    const { data } = await supabase
      .from("user_services")
      .select("id")
      .eq("user_id", userId)
      .eq("service_slug", slug)
      .in("status", ["active", "awaiting_review"])
      .maybeSingle();

    return !!data;
  },

  async hasAnyActiveProcess(userId: string): Promise<{ hasActive: boolean; activeSlug?: string }> {
    const { data } = await supabase
      .from("user_services")
      .select("service_slug, step_data, current_step, status")
      .eq("user_id", userId)
      .in("status", ["active", "awaiting_review"]);

    if (!data || data.length === 0) return { hasActive: false };

    const trulyActive = data.filter(proc => {
      // Ignora produtos auxiliares que não têm fluxo de progresso próprio
      if (
        proc.service_slug?.toLowerCase().startsWith("analise-") ||
        proc.service_slug?.toLowerCase().startsWith("mentoria-") ||
        proc.service_slug?.toLowerCase().startsWith("consultoria-") ||
        proc.service_slug?.toLowerCase().startsWith("dependente-adicional-")
      ) return false;

      const stepData = (proc.step_data || {}) as Record<string, unknown>;
      const currentStep = proc.current_step ?? 0;

      const uscisResult = stepData.uscis_official_result as string;
      const rfeResult = stepData.uscis_rfe_result as string;
      const motionResult = stepData.motion_final_result as string;
      const interviewResult = stepData.interview_outcome as string;

      const isApproved = uscisResult === 'approved' || rfeResult === 'approved' || motionResult === 'approved' || interviewResult === 'approved' || proc.status === 'completed';
      const isDenied = proc.status === 'rejected' || proc.status === 'denied' || motionResult === 'denied' || interviewResult === 'rejected' ||
                       (rfeResult === 'denied' && currentStep >= 18 && !uscisResult) || 
                       (uscisResult === 'denied' && currentStep >= 12 && !rfeResult && !motionResult);

      return !isApproved && !isDenied;
    });

    return { hasActive: trulyActive.length > 0, activeSlug: trulyActive[0]?.service_slug };
  },

  async getUserServiceBySlug(userId: string, slug: string): Promise<UserService | null> {
    const { data } = await supabase
      .from("user_services")
      .select("*")
      .eq("user_id", userId)
      .eq("service_slug", slug)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return (data as UserService) ?? null;
  },

  async getServiceById(id: string): Promise<UserService | null> {
    const { data, error } = await supabase
      .from("user_services")
      .select(`
        *,
        user_accounts:user_id (full_name)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as UserService) ?? null;
  },

  /**
   * Centralized logic to activate a service (used by SuccessPage and Dashboard Recovery)
   */
  async activateService(userId: string, slug: string, paidDependents: number = 0, options: { 
    paymentId?: string; 
    method?: string; 
    amount?: number;
  } = {}): Promise<void> {
    const { paymentId, method = "activation", amount = 0 } = options;

    const purchaseId = paymentId || `INIT_${slug}_${Date.now()}`;
    const initialPurchase = {
      id: purchaseId,
      method: method,
      amount: amount,
      dependents: paidDependents,
      slug: slug,
      date: new Date().toISOString()
    };

    // ── VÍNCULO AO PROCESSO PRINCIPAL (Para serviços auxiliares) ──
    const isAuxiliary = slug.includes("dependente") || 
                        slug.includes("slot-") ||
                        slug.startsWith("analise-") || 
                        slug.startsWith("apoio-") || 
                        slug.startsWith("revisao-") || 
                        slug.startsWith("mentoria-") ||
                        slug.startsWith("consultoria-") ||
                        slug.includes("rfe-motion") ||
                        slug.includes("-support");

    let targetSlug = slug;
    let fallbackProcId: string | null = null;

    if (isAuxiliary) {
      const isCOS = slug.includes("cos") || slug.includes("eos") || slug.includes("-status");
      const mainSlugsByGroup = {
        cos: ["troca-status", "extensao-status"],
        consular: ["visto-b1-b2", "visto-f1"]
      };
      const group = isCOS ? "cos" : "consular";
      const mainSlugs = mainSlugsByGroup[group];

      const { data: activeMain } = await supabase
        .from("user_services")
        .select("id, service_slug")
        .eq("user_id", userId)
        .in("service_slug", mainSlugs)
        .in("status", ["active", "awaiting_review", "paid"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeMain) {
        fallbackProcId = activeMain.id;
        targetSlug = activeMain.service_slug;
        console.log(`[activateService] Vínculo dinâmico: Atribuindo ${slug} ao processo principal ${activeMain.service_slug}`);
      }
    }

    // Identifica o registro existente (ou pelo fallbackId ou pelo slug)
    const { data: existing } = fallbackProcId 
      ? await supabase.from("user_services").select("id, step_data, service_slug").eq("id", fallbackProcId).single()
      : await supabase
        .from("user_services")
        .select("id, step_data, service_slug")
        .eq("user_id", userId)
        .eq("service_slug", slug)
        .in("status", ["active", "awaiting_review", "awaitingInterview", "casvPaymentPending", "paid"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (existing) {
      console.log(`[activateService] Serviço já existe para o usuário: ${existing.id}. Atualizando histórico.`);
      
      const stepData = (existing.step_data as any) || {};
      const purchases = stepData.purchases || [];
      
      // Idempotency: skip if already exists
      if (purchases.some((p: any) => p.id === purchaseId)) return;

      const isAdditionalSlot = slug.includes("dependente-adicional") || 
                               slug.includes("slot-dependente") ||
                               slug.includes("slot-vip") ||
                               slug.includes("dependente-estudante") ||
                               slug.includes("dependente-f1") ||
                               slug.includes("dependente-b1-b2");

      const currentPaid = parseInt(String(stepData.paid_dependents ?? 0), 10);
      const newPaidCount = isAdditionalSlot ? (currentPaid + paidDependents) : Math.max(currentPaid, paidDependents);

      purchases.push(initialPurchase);
      
      await supabase.from("user_services").update({
        step_data: {
          ...stepData,
          paid_dependents: newPaidCount,
          purchases: purchases
        }
      }).eq("id", existing.id);
      return;
    }

    const { error } = await supabase
      .from("user_services")
      .insert({
        user_id: userId,
        service_slug: slug,
        status: "active",
        current_step: 0,
        step_data: { 
          paid_dependents: paidDependents,
          purchases: [initialPurchase]
        }
      });

    if (error) {
      if (error.code === "23505") {
        // Fallback for race condition: re-run logic as an update
        return this.activateService(userId, slug, paidDependents, options);
      } else {
        throw error;
      }
    }

    // Auto-repair/sync visa_orders status
    try {
      await supabase
        .from("visa_orders")
        .update({ payment_status: "complete" })
        .match({ user_id: userId, product_slug: slug, payment_status: "pending" });
    } catch (e) {
      console.warn("[processService] Repair visa_orders failed:", e);
    }
  },

  async requestStepReview(serviceId: string): Promise<void> {
    if (!serviceId) throw new Error("ID do serviço é obrigatório.");
    
    // Fetch info before updating to get userId and slug
    const { data: service } = await supabase
      .from("user_services")
      .select("user_id, service_slug")
      .eq("id", serviceId)
      .single();

    const { error } = await supabase
      .from("user_services")
      .update({ 
        status: "awaiting_review"
      })
      .eq("id", serviceId);

    if (error) throw new Error(error.message);

    if (service) {
      await notificationService.notifyAdmin({
        title: "Ação Necessária: Avaliação de Etapa",
        body: `O cliente concluiu uma etapa no processo e aguarda sua revisão.`,
        serviceId: serviceId,
        userId: service.user_id,
      });
    }
  },

  async approveStep(serviceId: string, nextStep: number, isFinal: boolean = false, result?: 'approved' | 'denied', additionalData?: Record<string, unknown>): Promise<void> {
    if (!serviceId) throw new Error("ID do serviço é obrigatório.");
    // 1. Fetch current step_data to clear feedback
    const { data: current } = await supabase
      .from("user_services")
      .select("step_data")
      .eq("id", serviceId)
      .single();

    const newStepData = { 
      ...(current?.step_data as Record<string, unknown> || {}),
      ...additionalData 
    };
    delete newStepData['admin_feedback'];
    delete newStepData['rejected_at'];
    
    if (isFinal && result) {
      newStepData.motion_final_result = result;
    }
    
    const { error } = await supabase
      .from("user_services")
      .update({ 
        step_data: newStepData,
        current_step: nextStep,
        status: isFinal ? "completed" : "active"
      })
      .eq("id", serviceId);

    if (error) throw new Error(error.message);

    // Notify Client of Approval
    try {
      const { data: service } = await supabase
        .from("user_services")
        .select("user_id, service_slug")
        .eq("id", serviceId)
        .single();
        
      if (service) {
        await notificationService.notifyClient({
          userId: service.user_id,
          template: "step_approved",
          title: "Etapa Aprovada! 🎉",
          serviceId: serviceId,
          templateData: {
            step_name: `Etapa Anterior`, 
            service_name: service.service_slug
          }
        });
      }
    } catch (e) {
      console.warn("[processService] Notify client of approval failed:", e);
    }
  },

  async rejectStep(serviceId: string, isFinal: boolean = false, result?: 'approved' | 'denied'): Promise<void> {
    if (!serviceId) throw new Error("ID do serviço é obrigatório.");
    
    const updateData: Record<string, unknown> = {
      status: isFinal ? "completed" : "active",
    };

    if (isFinal && result) {
      // Fetch current step_data to merge the result
      const { data: current } = await supabase
        .from("user_services")
        .select("step_data")
        .eq("id", serviceId)
        .single();
      
      updateData.step_data = {
        ...(current?.step_data as object || {}),
        motion_final_result: result
      };
    }

    const { error } = await supabase
      .from("user_services")
      .update(updateData)
      .eq("id", serviceId);

    if (error) throw new Error(error.message);

    // Notify Client of Rejection/Adjustment
    try {
      const { data: service } = await supabase
        .from("user_services")
        .select("user_id, service_slug, step_data")
        .eq("id", serviceId)
        .single();
        
      if (service) {
        const feedback = (service.step_data as any)?.admin_feedback || "Verifique os ajustes necessários no seu painel.";
        
        await notificationService.notifyClient({
          userId: service.user_id,
          template: "step_rejected_feedback",
          title: "Ajustes Necessários ⚠️",
          serviceId: serviceId,
          body: `A etapa atual precisa de sua atenção. Feedback: ${feedback}`,
          templateData: {
            step_name: "Etapa Atual",
            feedback: feedback
          }
        });
      }
    } catch (e) {
      console.warn("[processService] Notify client of rejection failed:", e);
    }
  },

  async updateStepData(serviceId: string, data: Record<string, unknown>): Promise<void> {
    if (!serviceId) throw new Error("ID do serviço é obrigatório.");
    const { data: current, error: fetchError } = await supabase
      .from("user_services")
      .select("step_data")
      .eq("id", serviceId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    const newData = { ...(current.step_data as object || {}), ...data };

    const { error: updateError } = await supabase
      .from("user_services")
      .update({ 
        step_data: newData
      })
      .eq("id", serviceId);

    if (updateError) throw new Error(updateError.message);
  },

  async updateProcessStatus(serviceId: string, status: string): Promise<void> {
    if (!serviceId) throw new Error("ID do serviço é obrigatório.");
    const { error } = await supabase
      .from("user_services")
      .update({ status })
      .eq("id", serviceId);

    if (error) throw new Error(error.message);
  }
};
