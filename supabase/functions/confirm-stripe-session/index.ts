/**
 * confirm-stripe-session — verifica uma checkout session no Stripe e atualiza
 * o payment correspondente. Substitui o webhook (não exige cadastro no Stripe).
 *
 * Body: { session_id: string }
 *
 * Segurança: o session_id é um identificador opaco gerado pelo Stripe e só
 * é entregue ao usuário que pagou (via success_url). Validamos:
 *   - O session_id existe no Stripe e está pago.
 *   - O session_id bate com algum payments.external_id no nosso banco.
 *
 * Não exige JWT do usuário porque o token pode expirar durante o Checkout.
 * Por isso esta função deve ser deployada com --no-verify-jwt.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import Stripe from "https://esm.sh/stripe@14.16.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(message: string, status = 400) { return json({ error: message }, status); }

async function syncOrderAfterPayment(
  supabase: ReturnType<typeof createClient>,
  orderId: string,
  paymentStatus: "succeeded" | "failed",
) {
  const { error: syncErr } = await supabase.rpc("sync_order_status", { p_order_id: orderId });
  if (syncErr) throw new Error(`sync order failed: ${syncErr.message}`);

  if (paymentStatus === "succeeded") {
    const { error: fulfillErr } = await supabase.rpc("fulfill_paid_order", { p_order_id: orderId });
    if (fulfillErr) throw new Error(`fulfill paid order failed: ${fulfillErr.message}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase    = createClient(supabaseUrl, serviceKey, { db: { schema: "aplikei" } });

    const body = await req.json() as { session_id?: string };
    const sessionId = body.session_id?.trim();
    if (!sessionId) return err("session_id obrigatório");

    // Recupera a sessão Stripe tentando todas as chaves disponíveis (test/prod)
    const stripeKeys = [
      Deno.env.get("STRIPE_SECRET_KEY_TEST"),
      Deno.env.get("STRIPE_SECRET_KEY_PROD"),
      Deno.env.get("STRIPE_SECRET_KEY"),
    ].filter(Boolean) as string[];

    if (stripeKeys.length === 0) return err("Stripe não configurado", 500);

    let session: Stripe.Checkout.Session | null = null;
    let lastError: unknown = null;

    for (const key of stripeKeys) {
      try {
        const stripe = new Stripe(key, {
          apiVersion: "2023-10-16",
          httpClient: Stripe.createFetchHttpClient(),
        });
        session = await stripe.checkout.sessions.retrieve(sessionId);
        break;
      } catch (e) {
        lastError = e;
      }
    }

    if (!session) {
      const msg = lastError instanceof Error ? lastError.message : "session retrieve failed";
      return err(`Stripe retrieve failed: ${msg}`, 502);
    }

    // Localiza o payment correspondente (criado em process-payment-aplikei)
    const { data: payment, error: payErr } = await supabase
      .from("payments")
      .select("id, order_id, status")
      .eq("external_id", sessionId)
      .maybeSingle();

    if (payErr) return err(`payment lookup failed: ${payErr.message}`, 500);
    if (!payment) return err("payment não encontrado para session_id informado", 404);

    // Idempotência: já confirmado
    if (payment.status === "succeeded") {
      await syncOrderAfterPayment(supabase, payment.order_id, "succeeded");

      const { data: orderNow } = await supabase
        .from("orders")
        .select("status")
        .eq("id", payment.order_id)
        .maybeSingle();

      return json({
        payment_status: "succeeded",
        order_status: orderNow?.status ?? "paid",
        already_confirmed: true,
        stripe_payment_status: session.payment_status,
      });
    }

    // Decide novo status com base no Stripe
    let newStatus: "succeeded" | "failed" | null = null;
    if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
      newStatus = "succeeded";
    } else if (session.status === "expired") {
      newStatus = "failed";
    }

    if (newStatus) {
      const { error: updErr } = await supabase
        .from("payments")
        .update({ status: newStatus })
        .eq("id", payment.id);

      if (updErr) return err(`update payment failed: ${updErr.message}`, 500);

      await syncOrderAfterPayment(supabase, payment.order_id, newStatus);

      await supabase.from("payment_events").insert({
        payment_id: payment.id,
        event_type: `manual_confirm.${session.payment_status ?? session.status}`,
        payload: {
          session_id: sessionId,
          payment_status: session.payment_status,
          status: session.status,
          amount_total: session.amount_total,
        },
      });
    }

    // Relê o order para retornar estado pós-trigger
    const { data: orderAfter } = await supabase
      .from("orders")
      .select("status")
      .eq("id", payment.order_id)
      .maybeSingle();

    return json({
      payment_status: newStatus ?? payment.status,
      order_status: orderAfter?.status ?? "pending",
      stripe_payment_status: session.payment_status,
      stripe_session_status: session.status,
    });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[confirm-stripe-session]", msg);
    return err(msg, 500);
  }
});
