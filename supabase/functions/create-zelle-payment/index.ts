import { handler } from "../_shared/core/handler.ts";
import { json } from "../_shared/core/http.ts";
import { getEnv } from "../_shared/core/env.ts";
import { createAdminClient } from "../_shared/core/supabase.ts";
import { getOptionalUserId } from "../_shared/core/auth.ts";
import { createZellePayment } from "../_shared/payments/application/create-zelle-payment.ts";

Deno.serve(handler(async (req) => {
  const supabase = createAdminClient();
  const supabaseUrl = getEnv("SUPABASE_URL");
  const userId = await getOptionalUserId(req, supabase);
  const body = await req.json();
  const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null;
  return json(await createZellePayment(supabase, { ...body, userId, supabaseUrl, clientIp }));
}));
