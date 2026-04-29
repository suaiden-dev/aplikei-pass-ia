import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import Stripe from "npm:stripe@14.14.0";
import { applySuccessfulPayment } from "../_shared/payment-slot-logic.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-customer-auth",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
        status: 200, 
        headers: corsHeaders 
    });
  }

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id is required" }), { status: 400, headers: corsHeaders });
    }

    console.log(`[VerifySession] Verificando sessão: ${session_id}`);

    // 1. Busca a sessão diretamente no Stripe tentando todas as chaves (test/prod/default)
    const stripeKeys = [
      Deno.env.get("STRIPE_SECRET_KEY"),
      Deno.env.get("STRIPE_SECRET_KEY_TEST"),
      Deno.env.get("STRIPE_SECRET_KEY_PROD"),
    ].filter(Boolean) as string[];

    if (stripeKeys.length === 0) {
      throw new Error("Stripe secret keys are not configured.");
    }

    let session: Stripe.Checkout.Session | null = null;
    let lastError: Error | null = null;

    for (const key of stripeKeys) {
      try {
        const stripe = new Stripe(key, { apiVersion: "2023-10-16" });
        session = await stripe.checkout.sessions.retrieve(session_id);
        lastError = null;
        break;
      } catch (err) {
        lastError = err as Error;
      }
    }

    if (!session) {
      throw new Error(lastError?.message || "Unable to retrieve Stripe session.");
    }

    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
        return new Response(JSON.stringify({ 
            success: false, 
            status: session.payment_status,
            message: "Pagamento ainda não confirmado no Stripe." 
        }), { status: 200, headers: corsHeaders });
    }

    // 2. Extrai metadados (Mesma lógica do Webhook)
    const service_slug = session.metadata?.service_slug || session.metadata?.slug;
    const user_id = session.metadata?.user_id || session.metadata?.userId;
    const dependents = parseInt(session.metadata?.dependents || "0", 10);
    const proc_id = session.metadata?.proc_id || session.metadata?.processId;
    const order_id = session.metadata?.order_id || null;
    const parent_service_slug = session.metadata?.parent_service_slug || null;

    if (!user_id || !service_slug) {
        throw new Error("Sessão válida, mas metadados ausentes (user_id/slug).");
    }

    const { data: eventRegistered, error: eventRegisterError } = await supabase
      .rpc("register_payment_event", {
        p_provider: "stripe_verify",
        p_event_id: session.id,
        p_order_id: order_id,
        p_payment_id: session.id,
        p_payload: {
          session_id: session.id,
        },
      });

    if (eventRegisterError) throw eventRegisterError;
    if (!eventRegistered) {
      console.log(`[VerifySession] Evento já registrado; garantindo ativação da sessão: ${session.id}`);
    }

    // 3. Executa a ativação (Reutilizando a lógica centralizada)
    await applySuccessfulPayment({
        user_id,
        service_slug,
        paid_amount: session.amount_total ? session.amount_total / 100 : 0,
        dependents,
        proc_id,
        order_id,
        parent_service_slug,
        payment_method: "stripe_verify",
        payment_id: session.id,
        supabase,
        order_update: {
          stripe_session_id: session.id,
        },
    });

    return new Response(JSON.stringify({ 
        success: true, 
        message: "Pagamento verificado e serviço ativado com sucesso." 
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("[VerifySession] Erro:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
