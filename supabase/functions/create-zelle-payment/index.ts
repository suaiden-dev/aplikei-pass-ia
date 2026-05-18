import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { getOptionalUserId } from "../_shared/core/auth.ts";
import { createAdminClient } from "../_shared/core/supabase.ts";
import { corsHeaders, json, options } from "../_shared/core/http.ts";
import { createZellePayment } from "../_shared/payments/application/create-zelle-payment.ts";

serve(async (req) => {
    if (req.method === "OPTIONS") return options();

    try {
        const supabase = createAdminClient();
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const userId = await getOptionalUserId(req, supabase);

        const body = await req.json();
        const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null;

        return json(await createZellePayment(supabase, {
            ...body,
            userId,
            supabaseUrl,
            clientIp,
        }));

    } catch (err: unknown) {
        console.error("Zelle Payment Error:", err);
        return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
