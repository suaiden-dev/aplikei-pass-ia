import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { applySuccessfulPayment } from "../_shared/payment-slot-logic.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { autoRefreshToken: false, persistSession: false } },
);

interface ZelleWebhookPayload {
  payment_id: string;
  response: "valid" | "invalid" | "uncertain";
  confidence: number;
  reason?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload: ZelleWebhookPayload = await req.json();

    if (!payload.payment_id) throw new Error("payment_id e obrigatorio");

    const { data: eventRegistered, error: eventRegisterError } = await supabase
      .rpc("register_payment_event", {
        p_provider: "zelle_n8n",
        p_event_id: `${payload.payment_id}:${payload.response}`,
        p_order_id: null,
        p_payment_id: payload.payment_id,
        p_payload: payload as any,
      });

    if (eventRegisterError) throw eventRegisterError;
    if (!eventRegistered) {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const { data: payment, error: fetchError } = await supabase
      .from("zelle_payments")
      .select("*")
      .eq("id", payload.payment_id)
      .single();

    if (fetchError || !payment) throw new Error(`Pagamento nao encontrado: ${fetchError?.message}`);

    await supabase
      .from("zelle_payments")
      .update({
        n8n_confidence: payload.confidence,
        n8n_response: payload.response,
        admin_notes: payload.reason ? `[IA]: ${payload.reason}` : null,
      })
      .eq("id", payload.payment_id);

    const requiresManualApproval = payload.response !== "valid" || payload.confidence < 0.9;
    if (requiresManualApproval) {
      return new Response(
        JSON.stringify({ message: "Recebido. Requer aprovacao manual.", status: "pending_verification" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    let userId: string | null = payment.user_id;
    const email = payment.guest_email;
    const fullName = payment.guest_name ?? "Guest User";

    if (!userId && email) {
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const existingUser = usersData?.users?.find((u: any) => u.email === email);

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const originUrl = Deno.env.get("FRONTEND_URL") || "https://aplikeipass.com";
        const redirectTo = `${originUrl}/auth/confirm-password`;
        const { data: authUser } = await supabase.auth.admin.inviteUserByEmail(email, { redirectTo, data: { full_name: fullName } });
        if (authUser?.user) userId = authUser.user.id;
      }
    }

    await supabase
      .from("zelle_payments")
      .update({
        status: "approved",
        user_id: userId,
        admin_approved_at: new Date().toISOString(),
        admin_notes: `[Aprovado Automaticamente - Confianca IA: ${payload.confidence}]`,
      })
      .eq("id", payload.payment_id);

    if (payment.service_slug && userId) {
      await applySuccessfulPayment({
        supabase,
        user_id: userId,
        service_slug: payment.service_slug,
        payment_method: "zelle_auto",
        paid_amount: payment.amount,
        dependents: 0,
        proc_id: null,
        payment_id: payload.payment_id,
        order_id: payment.visa_order_id || null,
        parent_service_slug: null,
        order_update: {
          payment_method: "zelle",
        },
      });
    }

    return new Response(
      JSON.stringify({ message: "Pagamento processado e servico ativado.", status: "approved" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
