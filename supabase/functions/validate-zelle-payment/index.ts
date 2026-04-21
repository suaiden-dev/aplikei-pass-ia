import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { applySuccessfulPayment } from "../_shared/payment-slot-logic.ts";
import { buildNotifContent, getUserLang } from "../_shared/notif-templates.ts";

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
 */
serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseKey) throw new Error("Supabase configuration missing.");

        const supabase = createClient(supabaseUrl, supabaseKey);

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

        if (payment.status === "approved" || payment.status === "rejected") {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: `Payment already ${payment.status}, no changes made.`
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (isApproved) {
            const { error: updateError } = await supabase
                .from("zelle_payments")
                .update({
                    status: "approved",
                    admin_notes: admin_notes || "Aprovado via validação automática (n8n) ou admin",
                })
                .eq("id", payment_id);

            if (updateError) throw updateError;

            if (payment.visa_order_id) {
                await supabase
                    .from("orders")
                    .update({ payment_status: "paid" })
                    .eq("id", payment.visa_order_id);
            }

            try {
                const { data: order } = payment.visa_order_id 
                    ? await supabase.from("orders").select("payment_metadata").eq("id", payment.visa_order_id).single()
                    : { data: null };
                
                const meta = order?.payment_metadata as any;
                const dependentsCount = parseInt(String(meta?.dependents ?? 0), 10);
                const proc_id = meta?.proc_id || meta?.processId;
                const parent_service_slug = meta?.parent_service_slug || null;

                await applySuccessfulPayment({
                    user_id: payment.user_id,
                    service_slug: payment.service_slug,
                    payment_method: "zelle",
                    paid_amount: payment.amount,
                    dependents: dependentsCount,
                    proc_id,
                    parent_service_slug,
                    payment_id: payment.id,
                    order_id: payment.visa_order_id || null,
                    supabase,
                });

                if (payment.service_slug === "proposta-rfe-motion" && payment.user_id) {
                    const lang = await getUserLang(supabase, payment.user_id);
                    const localized = buildNotifContent("motion_submitted", {}, lang);
                    await supabase.from("notifications").insert({
                        user_id: payment.user_id,
                        target_role: "client",
                        type: "client_action",
                        title: localized.title,
                        message: localized.message,
                        link: "/dashboard",
                        send_email: true,
                        email_sent: false,
                    });
                }
            } catch (actErr) {
                console.error("[validate-zelle] Erro ao ativar slots:", actErr.message);
            }

            const clientUserId = payment.user_id || null;
            if (clientUserId) {
                const lang = await getUserLang(supabase, clientUserId);
                const { title, message } = buildNotifContent("zelle_payment_approved", {
                    amount: String(payment.amount),
                    service_name: payment.service_slug,
                }, lang);
                await supabase.from("notifications").insert({
                    type: "client_action",
                    target_role: "client",
                    user_id: clientUserId,
                    service_id: null,
                    title,
                    message,
                    link: "/dashboard",
                    send_email: true,
                    email_sent: false,
                    metadata: {
                        payment_id,
                        service_slug: payment.service_slug,
                        amount: payment.amount,
                    }
                });
            }

            return new Response(
                JSON.stringify({ success: true, result: "approved", payment_id }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        } else {
            const { error: updateError } = await supabase
                .from("zelle_payments")
                .update({
                    status: "rejected",
                    admin_notes: admin_notes || "Rejeitado via n8n ou admin",
                })
                .eq("id", payment_id);

            if (updateError) throw updateError;

            if (payment.visa_order_id) {
                await supabase
                    .from("orders")
                    .update({ payment_status: "pending" })
                    .eq("id", payment.visa_order_id);
            }

            const clientUserId = payment.user_id || null;
            if (clientUserId) {
                const lang = await getUserLang(supabase, clientUserId);
                const { title, message } = buildNotifContent("zelle_payment_rejected", {
                    reason: admin_notes || "",
                }, lang);
                await supabase.from("notifications").insert({
                    type: "client_action",
                    target_role: "client",
                    user_id: clientUserId,
                    service_id: null,
                    title,
                    message,
                    link: "/dashboard",
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
