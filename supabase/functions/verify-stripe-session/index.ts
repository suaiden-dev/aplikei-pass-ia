import { err, json, options } from "../_shared/core/http.ts";
import { createAdminClient } from "../_shared/core/supabase.ts";
import { verifyStripeSession } from "../_shared/payments/application/verify-stripe-session.ts";

const supabase = createAdminClient();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return options();
  }

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return err("session_id is required", 400);
    }

    console.log(`[VerifySession] Verificando sessão: ${session_id}`);
    return json(await verifyStripeSession(supabase, session_id));

  } catch (error) {
    console.error("[VerifySession] Erro:", error.message);
    return err(error.message, 500);
  }
});
