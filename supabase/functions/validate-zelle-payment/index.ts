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
