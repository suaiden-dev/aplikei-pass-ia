/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const n8nWebhookUrl = Deno.env.get("N8N_ZELLE_WEBHOOK_URL");

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Supabase configuration missing.");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const authHeader = req.headers.get("Authorization");
        console.log("Auth Header present:", !!authHeader);

        // Get the user from the authorization header
        const { data: { user }, error: authError } = await supabase.auth.getUser(
            authHeader?.replace("Bearer ", "") ?? ""
        );

        if (authError || !user) {
            console.error("Auth error:", authError);
            return new Response(JSON.stringify({ error: "Unauthorized", details: authError?.message }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const {
            amount,
            confirmation_code,
            payment_date,
            recipient_name,
            recipient_email,
            proof_path,
            service_slug
        } = await req.json();

        const actualPaymentDate = payment_date || new Date().toISOString().split('T')[0];

        const imageUrl = `${supabaseUrl}/storage/v1/object/public/zelle_comprovantes/${proof_path}`;

        // 1. Insert into zelle_payments
        const { data: payment, error: dbError } = await (supabase
            .from("zelle_payments")
            .insert({
                user_id: user.id,
                amount,
                confirmation_code,
                payment_date: actualPaymentDate,
                recipient_name,
                recipient_email,
                proof_path,
                image_url: imageUrl,
                service_slug,
                status: 'pending_verification'
            })
            .select()
            .single() as any);

        if (dbError) throw dbError;
        if (n8nWebhookUrl) {
            try {
                await fetch(n8nWebhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        event: "zelle_payment_created",
                        payment_id: payment.id,
                        user_id: user.id,
                        email: user.email,
                        amount,
                        confirmation_code,
                        proof_path,
                        image_url: imageUrl,
                        service_slug,
                        timestamp: new Date().toISOString()
                    })
                });
            } catch (n8nError) {
                console.error("Failed to notify n8n:", n8nError);
                // We don't throw here to not fail the whole request
            }
        }

        return new Response(JSON.stringify({ success: true, payment_id: payment.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (err: unknown) {
        console.error("Zelle Payment Error:", err);
        return new Response(JSON.stringify({ error: (err as Error).message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
