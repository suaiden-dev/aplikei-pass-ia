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

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Supabase configuration missing.");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // TODO: Adicionar verificação de token de segurança secreto para o n8n

        const { payment_id, status, admin_notes } = await req.json();

        if (!payment_id || !status) {
            throw new Error("Missing payment_id or status");
        }

        // 1. Fetch current payment info
        const { data: payment, error: fetchError } = await (supabase
            .from("zelle_payments")
            .select("*")
            .eq("id", payment_id)
            .single() as any);

        if (fetchError || !payment) throw new Error("Payment not found");

        // 2. Update status
        const { error: updateError } = await supabase
            .from("zelle_payments")
            .update({
                status,
                admin_notes: admin_notes || payment.admin_notes,
                updated_at: new Date().toISOString()
            })
            .eq("id", payment_id);

        if (updateError) throw updateError;

        // 3. If approved, activate service
        if (status === 'approved') {
            const { error: serviceError } = await supabase
                .from("user_services")
                .upsert({
                    user_id: payment.user_id,
                    service_slug: payment.service_slug,
                    status: 'active',
                    current_step: 0
                }, { onConflict: 'user_id,service_slug' } as any);

            if (serviceError) throw serviceError;
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (err: unknown) {
        console.error("Zelle Callback Error:", err);
        return new Response(JSON.stringify({ error: (err as Error).message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
