import { handler } from "../_shared/core/handler.ts";
import { json } from "../_shared/core/http.ts";
import { createAdminClient } from "../_shared/core/supabase.ts";
import { verifyStripeWebhook } from "../_shared/payments/providers/strype.ts";
import { handleStripeWebhook } from "../_shared/payments/application/handle-stripe-webhook.ts";

// verifyStripeWebhook reads the raw body — handler must not consume it before this point.
Deno.serve(handler(async (req) => {
  const event = await verifyStripeWebhook(req);
  await handleStripeWebhook({ event, supabase: createAdminClient() });
  return json({ received: true });
}));
