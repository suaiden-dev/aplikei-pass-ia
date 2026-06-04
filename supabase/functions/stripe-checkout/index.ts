import { handler } from "../_shared/core/handler.ts";
import { json } from "../_shared/core/http.ts";
import { createAdminClient } from "../_shared/core/supabase.ts";
import { createStripeCheckout } from "../_shared/payments/application/create-stripe-checkout.ts";

Deno.serve(handler(async (req) => {
  const body = await req.json();
  const result = await createStripeCheckout({ req, body, supabase: createAdminClient() });
  return json(result);
}));
