import { corsHeaders } from "../_shared/core/http.ts";
import { verifyStripeWebhook } from "../_shared/payments/providers/strype.ts";
import { handleStripeWebhook } from "../_shared/payments/application/handle-stripe-webhook.ts";
import { createAdminClient } from "../_shared/core/supabase.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const event = await verifyStripeWebhook(req);
    const supabase = createAdminClient();

    await handleStripeWebhook({
      event,
      supabase,
    });

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);

    console.error("[stripe-webhook]", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
