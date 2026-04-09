import { supabase } from "../lib/supabase";

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
        proc.service_slug?.startsWith("analise-") ||
        proc.service_slug?.startsWith("mentoria-") ||
        proc.service_slug?.startsWith("consultoria-")
      ) return false;

      const stepData = (proc.step_data || {}) as Record<string, unknown>;
      const currentStep = proc.current_step ?? 0;
      const isConsular = proc.service_slug?.startsWith("visto-b1-b2") || proc.service_slug?.startsWith("visto-f1");
      
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
  async activateService(userId: string, slug: string, paidDependents: number = 0): Promise<void> {
    const { error } = await supabase
      .from("user_services")
      .insert({
        user_id: userId,
        service_slug: slug,
        status: "active",
        current_step: 0,
        step_data: { paid_dependents: paidDependents }
      });

    if (error) {
      if (error.code === "23505") {
        // Fallback to upsert if the constraint still exists
        await supabase.from("user_services").upsert({
          user_id: userId,
          service_slug: slug,
          status: "active",
          current_step: 0,
          step_data: { paid_dependents: paidDependents }
        }, { onConflict: "user_id,service_slug" });
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
    const { error } = await supabase
      .from("user_services")
      .update({ 
        status: "awaiting_review"
      })
      .eq("id", serviceId);

    if (error) throw new Error(error.message);
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
        status: isFinal ? "completed" : "active",
        current_step: nextStep,
        step_data: newStepData
      })
      .eq("id", serviceId);

    if (error) throw new Error(error.message);
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
