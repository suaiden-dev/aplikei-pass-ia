import Stripe from "npm:stripe@14.14.0";
import { confirmStripeCheckoutPayment } from "./confirm-stripe-checkout-payment.ts";
import type { Supabase } from "../../core/supabase.ts";

export async function verifyStripeSession(
  supabase: Supabase,
  sessionId: string,
) {
  const session = await retrieveStripeSession(sessionId);

  return await confirmStripeCheckoutPayment({
    supabase,
    session,
    source: "stripe_verify",
  });
}

async function retrieveStripeSession(
  sessionId: string,
): Promise<Stripe.Checkout.Session> {
  const stripeKeys = [
    Deno.env.get("STRIPE_SECRET_KEY"),
    Deno.env.get("STRIPE_SECRET_KEY_TEST"),
    Deno.env.get("STRIPE_SECRET_KEY_PROD"),
  ].filter(Boolean) as string[];

  if (stripeKeys.length === 0) {
    throw new Error("Stripe secret keys are not configured.");
  }

  let lastError: Error | null = null;

  for (const key of stripeKeys) {
    try {
      const stripe = new Stripe(key, {
        apiVersion: "2023-10-16",
      });

      return await stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      lastError = error as Error;
    }
  }

  throw new Error(
    lastError?.message || "Unable to retrieve Stripe session.",
  );
}
