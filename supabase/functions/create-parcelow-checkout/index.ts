import { handler } from "../_shared/core/handler.ts";
import { json } from "../_shared/core/http.ts";
import { createAdminClient } from "../_shared/core/supabase.ts";
import { createParcelowCheckout } from "../_shared/payments/application/create-parcelow-checkout.ts";

Deno.serve(handler(async (req) => {
  const body = await req.json();
  if (!body.order_id) throw new Error("order_id é obrigatório. A ordem deve ser pré-criada pelo service.");
  return json(await createParcelowCheckout({ req, supabase: createAdminClient(), ...body }));
}));
