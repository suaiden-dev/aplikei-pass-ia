import Stripe from "https://esm.sh/stripe@14.16.0";
import { confirmStripeCheckoutPayment } from "./confirm-stripe-checkout-payment.ts";

type SupabaseClient = any;

type HandleStripeWebhookParams = {
  event: Stripe.Event;
  supabase: SupabaseClient;
};

export async function handleStripeWebhook({
  event,
  supabase,
}: HandleStripeWebhookParams) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      return await confirmStripeCheckoutPayment({
        supabase,
        session,
        source: "stripe_webhook",
      });
    }

    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;

      return await confirmStripeCheckoutPayment({
        supabase,
        session,
        source: "stripe_webhook",
      });
    }

    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("[stripe-webhook] Checkout not paid", {
        session_id: session.id,
        event_type: event.type,
        payment_status: session.payment_status,
      });

      return {
        success: false,
        status: session.payment_status,
      };
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;

      console.log("[stripe-webhook] Payment intent failed", {
        payment_intent_id: intent.id,
        checkout_session_id: intent.metadata?.checkout_session_id || null,
      });

      return {
        success: false,
        status: "failed",
      };
    }

    default:
      console.log(`[stripe-webhook] Unhandled event: ${event.type}`);

      return {
        success: true,
        ignored: true,
        event_type: event.type,
      };
  }
}
