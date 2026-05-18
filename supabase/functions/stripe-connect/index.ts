import { json, options } from "../_shared/core/http.ts";
import { createAdminClient } from "../_shared/core/supabase.ts";
import { handleStripeConnectAction } from "../_shared/billing/application/stripe-connect.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return options();

  try {
    return json(await handleStripeConnectAction(createAdminClient(), await req.json()));
  } catch (error) {
    return json({ error: (error as Error).message }, 400);
  }
});
