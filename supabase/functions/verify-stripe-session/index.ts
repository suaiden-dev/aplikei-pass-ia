import { handler } from "../_shared/core/handler.ts";
import { err, json } from "../_shared/core/http.ts";
import { createAdminClient } from "../_shared/core/supabase.ts";
import { verifyStripeSession } from "../_shared/payments/application/verify-stripe-session.ts";

const supabase = createAdminClient();

Deno.serve(handler(async (req) => {
  const { session_id } = await req.json();
  if (!session_id) return err("session_id is required", 400);
  return json(await verifyStripeSession(supabase, session_id));
}));
