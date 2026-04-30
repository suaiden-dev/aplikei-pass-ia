/**
 * stripe-webhook — recebe eventos do Stripe e atualiza payments + orders
 *
 * Eventos tratados:
 *   checkout.session.completed   → payment = succeeded
 *   checkout.session.expired     → payment = failed
 *   payment_intent.payment_failed → payment = failed
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import Stripe from "https://esm.sh/stripe@14.16.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { db: { schema: "aplikei" } },
);

async function updatePayment(
  sessionId: string,
  status: "succeeded" | "failed",
  eventType: string,
  payload: unknown,
) {
  // 1. Localiza o payment pelo external_id (session.id do Stripe)
  const { data: payment } = await supabase
    .from("payments")
    .select("id, order_id")
    .eq("external_id", sessionId)
    .maybeSingle();

  if (!payment) {
    console.warn(`[stripe-webhook] Payment not found for session: ${sessionId}`);
    return;
  }

  // 2. Atualiza status do payment
  const { error: updateError } = await supabase
    .from("payments")
    .update({ status })
    .eq("id", payment.id);

  if (updateError) {
    throw new Error(`Payment update failed: ${updateError.message}`);
  }

  const { error: syncError } = await supabase.rpc("sync_order_status", { p_order_id: payment.order_id });
  if (syncError) {
    throw new Error(`Order sync failed: ${syncError.message}`);
  }

  if (status === "succeeded") {
    const { error: fulfillError } = await supabase.rpc("fulfill_paid_order", { p_order_id: payment.order_id });
    if (fulfillError) {
      throw new Error(`Order fulfillment failed: ${fulfillError.message}`);
    }
  }

  // 3. Registra o evento (imutável)
  await supabase.from("payment_events").insert({
    payment_id: payment.id,
    event_type: eventType,
    payload,
  });

  // Os RPCs acima também mantêm a confirmação idempotente caso algum trigger ainda não exista no ambiente.
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  const body      = await req.text();

  // Tenta validar contra ambos os secrets (test e prod). O Stripe assina com
  // o secret do endpoint específico — usamos o que validar primeiro.
  const candidates: Array<{ env: "test" | "prod"; secret: string; key: string }> = [
    {
      env: "test",
      secret: Deno.env.get("STRIPE_WEBHOOK_SECRET_TEST") ?? "",
      key:    Deno.env.get("STRIPE_SECRET_KEY_TEST") ?? "",
    },
    {
      env: "prod",
      secret: Deno.env.get("STRIPE_WEBHOOK_SECRET_PROD") ?? "",
      key:    Deno.env.get("STRIPE_SECRET_KEY_PROD") ?? "",
    },
  ].filter((c) => c.secret && c.key);

  if (candidates.length === 0) {
    console.error("[stripe-webhook] Nenhum par de secret/key configurado");
    return new Response(JSON.stringify({ error: "Webhook não configurado" }), { status: 500 });
  }

  let event: Stripe.Event | null = null;
  let lastError: unknown = null;

  for (const c of candidates) {
    try {
      const stripe = new Stripe(c.key, {
        apiVersion: "2023-10-16",
        httpClient: Stripe.createFetchHttpClient(),
      });
      event = await stripe.webhooks.constructEventAsync(body, signature ?? "", c.secret);
      break;
    } catch (e) {
      lastError = e;
    }
  }

  if (!event) {
    console.error("[stripe-webhook] Signature verification failed:", lastError);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          await updatePayment(session.id, "succeeded", event.type, event.data.object);
        }
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await updatePayment(session.id, "succeeded", event.type, event.data.object);
        break;
      }

      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await updatePayment(session.id, "failed", event.type, event.data.object);
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        // Encontra o checkout session relacionado via metadata
        const sessionId = (intent.metadata as Record<string, string>)?.checkout_session_id;
        if (sessionId) {
          await updatePayment(sessionId, "failed", event.type, event.data.object);
        }
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[stripe-webhook] Handler error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
});
