import Stripe from "https://esm.sh/stripe@14.16.0";
import { confirmStripeCheckoutPayment } from "./confirm-stripe-checkout-payment.ts";
import { createLogger } from "../../core/logger.ts";
import type { Supabase } from "../../core/supabase.ts";

const log = createLogger("stripe-webhook");

type HandleStripeWebhookParams = {
  event: Stripe.Event;
  supabase: Supabase;
};

export async function handleStripeWebhook({ event, supabase }: HandleStripeWebhookParams) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      return await confirmStripeCheckoutPayment({ supabase, session, source: "stripe_webhook" });
    }

    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      log.info("checkout not paid", { session_id: session.id, event_type: event.type, payment_status: session.payment_status });
      return { success: false, status: session.payment_status };
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      log.info("payment intent failed", { payment_intent_id: intent.id, checkout_session_id: intent.metadata?.checkout_session_id || null });
      return { success: false, status: "failed" };
    }

    default:
      log.info("unhandled event", { event_type: event.type });
      return { success: true, ignored: true, event_type: event.type };
  }
}
