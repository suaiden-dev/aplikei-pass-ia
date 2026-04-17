import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-customer-auth",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * validate-zelle-payment
 *
 * Chamado por:
 *   1. N8N (callback assíncrono) com { payment_id, approved: true/false }
 *   2. Admin Panel (via paymentService) com { payment_id, status: "approved"|"rejected", admin_notes }
 *
 * Fluxo para approved=true / status="approved":
 *   - Atualiza zelle_payments.status = "approved"
 *   - Atualiza visa_orders.payment_status = "succeeded"
 *   - Notifica o cliente via tabela notifications
 *
 * Fluxo para approved=false / status="rejected":
 *   - Atualiza zelle_payments.status = "rejected"
 *   - Notifica o cliente
 */
serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseKey) throw new Error("Supabase configuration missing.");

        const supabase = createClient(supabaseUrl, supabaseKey);

        const authHeader = req.headers.get("X-Customer-Auth") || req.headers.get("Authorization");
        // Embora o admin use a service_role para operações no DB, 
        // validar o token aqui garante que o gateway não bloqueie a requisição.
        
        const body = await req.json();
        const payment_id: string = body.payment_id;
        const admin_notes: string = body.admin_notes || body.reason || "";

        let isApproved: boolean;

        if (body.status === "approved") {
            isApproved = true;
        } else if (body.status === "rejected") {
            isApproved = false;
        } else {
            return new Response(
                JSON.stringify({ error: "Invalid status: provide 'status' as 'approved' or 'rejected'" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (!payment_id) {
            return new Response(
                JSON.stringify({ error: "payment_id is required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // ── Busca dados do pagamento ──────────────────────────────────────────────
        const { data: payment, error: fetchError } = await supabase
            .from("zelle_payments")
            .select("id, user_id, guest_email, guest_name, amount, service_slug, visa_order_id, status")
            .eq("id", payment_id)
            .single();

        if (fetchError || !payment) {
            return new Response(
                JSON.stringify({ error: "Payment not found", details: fetchError?.message }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Evita reprocessar pagamentos já finalizados
        if (payment.status === "approved" || payment.status === "rejected") {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: `Payment already ${payment.status}, no changes made.`
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // ── APROVAÇÃO ─────────────────────────────────────────────────────────────
        if (isApproved) {
            // 1. Atualiza o pagamento Zelle
            const { error: updateError } = await supabase
                .from("zelle_payments")
                .update({
                    status: "approved",
                    admin_notes: admin_notes || "Aprovado via validação automática (n8n) ou admin",
                })
                .eq("id", payment_id);

            if (updateError) throw updateError;

            // 2. Ativa a order vinculada
            if (payment.visa_order_id) {
                await supabase
                    .from("visa_orders")
                    .update({ payment_status: "succeeded" })
                    .eq("id", payment.visa_order_id);
            }

            // --- NOVO: Ativação de Slots / User Services ---
            try {
                const { data: order } = payment.visa_order_id 
                    ? await supabase.from("visa_orders").select("payment_metadata").eq("id", payment.visa_order_id).single()
                    : { data: null };
                
                const meta = order?.payment_metadata as any;
                const dependentsCount = parseInt(String(meta?.dependents ?? 0), 10);
                const proc_id = meta?.proc_id || meta?.processId;

                await handlePaymentSuccess({
                    user_id: payment.user_id,
                    service_slug: payment.service_slug,
                    payment_method: "zelle",
                    paid_amount: payment.amount,
                    dependents: dependentsCount,
                    proc_id: proc_id,
                    payment_id: payment.id,
                    supabase: supabase
                });
            } catch (actErr) {
                console.error("[validate-zelle] Erro ao ativar slots:", actErr.message);
            }

            // 3. Notifica o cliente (se autenticado)
            const clientUserId = payment.user_id || null;
            if (clientUserId) {
                await supabase.from("notifications").insert({
                    type: "admin_action",
                    target_role: "client",
                    user_id: clientUserId,
                    service_id: null,
                    title: "✅ Pagamento Zelle confirmado!",
                    message: `Seu pagamento de $${payment.amount} foi verificado e aprovado. Seu serviço já está ativo no painel.`,
                    send_email: true,
                    email_sent: false,
                    metadata: {
                        payment_id,
                        service_slug: payment.service_slug,
                        amount: payment.amount,
                    }
                });
            }

            console.log(`[validate-zelle] ✅ Payment ${payment_id} APPROVED`);

            return new Response(
                JSON.stringify({ success: true, result: "approved", payment_id }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // ── REJEIÇÃO ──────────────────────────────────────────────────────────────
        else {
            // 1. Atualiza o pagamento para rejected
            const { error: updateError } = await supabase
                .from("zelle_payments")
                .update({
                    status: "rejected",
                    admin_notes: admin_notes || "Rejeitado via n8n ou admin",
                })
                .eq("id", payment_id);

            if (updateError) throw updateError;

            // 2. Reverte a order para pending (não cancela, permite nova tentativa)
            if (payment.visa_order_id) {
                await supabase
                    .from("visa_orders")
                    .update({ payment_status: "pending" })
                    .eq("id", payment.visa_order_id);
            }

            // 3. Notifica o cliente
            const clientUserId = payment.user_id || null;
            if (clientUserId) {
                await supabase.from("notifications").insert({
                    type: "admin_action",
                    target_role: "client",
                    user_id: clientUserId,
                    service_id: null,
                    title: "❌ Problema no pagamento Zelle",
                    message: admin_notes
                        ? `Identificamos um problema com seu pagamento Zelle. Motivo: ${admin_notes}. Entre em contato com o suporte.`
                        : "Identificamos um problema com seu pagamento Zelle. Por favor, entre em contato com nosso suporte.",
                    send_email: true,
                    email_sent: false,
                    metadata: {
                        payment_id,
                        service_slug: payment.service_slug,
                        amount: payment.amount,
                        reason: admin_notes || "Não especificado"
                    }
                });
            }

            console.log(`[validate-zelle] ❌ Payment ${payment_id} REJECTED. Reason: ${admin_notes}`);

            return new Response(
                JSON.stringify({ success: true, result: "rejected", payment_id }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

    } catch (err: any) {
        console.error("[validate-zelle-payment] Error:", err);
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});

// === FUNÇÃO CENTRALIZADA DE ATIVAÇÃO (Ported from payment-webhook) ===
async function handlePaymentSuccess(data: any) {
  const { user_id, service_slug, payment_method, proc_id, paid_amount, dependents, payment_id, supabase } = data;

  if (!user_id || !service_slug) {
    console.error("Dados insuficientes no activation helper:", data);
    return;
  }

  console.log(`🚀 [Zelle] Ativando serviço ${service_slug} para ${user_id}`);

  let targetProcId = proc_id;

  // FALLBACK: Procurar processo principal ativo
  if (!targetProcId && service_slug.includes("dependente-adicional")) {
     const mainSlugs = service_slug.includes("cos") ? ["troca-status", "extensao-status"] : ["visto-b1-b2"];
     const { data: activeMain } = await supabase
       .from("user_services")
       .select("id")
       .eq("user_id", user_id)
       .in("service_slug", mainSlugs)
       .in("status", ["active", "awaiting_review", "awaiting_payment", "paid"])
       .order("created_at", { ascending: false })
       .limit(1)
       .maybeSingle();
     
     if (activeMain) {
       targetProcId = activeMain.id;
     }
  }

  if (!targetProcId) {
    // Verifica se já existe um serviço ativo
    const { data: existing } = await supabase
      .from("user_services")
      .select("id, step_data")
      .eq("user_id", user_id)
      .eq("service_slug", service_slug)
      .in("status", ["active", "awaiting_review", "awaitingInterview", "casvPaymentPending", "paid"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      targetProcId = existing.id;
    } else {
      // Nova Compra
      const newPurchase = {
        id: payment_id || `TRX_${Date.now()}`,
        method: payment_method,
        amount: paid_amount,
        dependents: dependents || 0,
        slug: service_slug,
        date: new Date().toISOString()
      };

      await supabase.from("user_services").insert({
        user_id: user_id,
        service_slug: service_slug,
        status: "active",
        current_step: 0,
        step_data: { 
          paid_dependents: dependents || 0,
          purchases: [newPurchase]
        },
        data: {}
      });
      return;
    }
  }

  if (targetProcId) {
     const { data: currentProc } = await supabase
       .from("user_services")
       .select("step_data")
       .eq("id", targetProcId)
       .single();

     if (currentProc) {
       const stepData = currentProc.step_data || {};
       const purchases = (stepData.purchases as any[]) || [];
       
       if (payment_id && purchases.some((p: any) => p.id === payment_id)) {
         return;
       }

       const currentCount = parseInt(String(stepData.paid_dependents ?? 0), 10);
       let newCount = currentCount;
       const isAdditionalSlot = service_slug.includes("dependente-adicional");

       if (isAdditionalSlot) {
         newCount += (dependents || 1);
       } else if (dependents > currentCount) {
         newCount = dependents;
       }

       const newPurchase = {
         id: payment_id || `TRX_${Date.now()}`,
         method: payment_method,
         amount: paid_amount,
         dependents: dependents || 0,
         slug: service_slug,
         date: new Date().toISOString()
       };
       
       purchases.push(newPurchase);

       await supabase
         .from("user_services")
         .update({ 
           step_data: { 
             ...stepData, 
             paid_dependents: newCount,
             purchases: purchases
           } 
         })
         .eq("id", targetProcId);
     }
  }
}
