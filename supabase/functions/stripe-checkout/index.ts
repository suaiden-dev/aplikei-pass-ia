import { corsHeaders } from "../_shared/core/http.ts";
import { createAdminClient } from "../_shared/core/supabase.ts";
import { createStripeCheckout } from "../_shared/payments/application/create-stripe-checkout.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const supabase = createAdminClient();

    const result = await createStripeCheckout({
      req,
      body,
      supabase,
    });

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    console.error("[stripe-checkout]", message);

    return new Response(JSON.stringify({ error: message }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }
});
