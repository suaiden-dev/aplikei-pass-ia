import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import Stripe from "https://esm.sh/stripe@14.16.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    console.log("--- WEBHOOK REQUEST RECEIVED ---");
    console.log("Method:", req.method);

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
        console.error("Missing stripe-signature header");
        return new Response("No signature", { status: 400 });
    }


    try {
        const body = await req.text();
        // Detect environment to use correct secret key
        // In local/staging we usually have a fallback or specific env vars
        const host = req.headers.get("host") || "";
        let env = 'TEST';

        const webhookSecret = Deno.env.get(`STRIPE_WEBHOOK_SECRET_TEST`) || Deno.env.get("STRIPE_WEBHOOK_SECRET");
        const stripeSecret = Deno.env.get(`STRIPE_SECRET_KEY_TEST`) || Deno.env.get("STRIPE_SECRET_KEY");

        const stripe = new Stripe(stripeSecret!, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            webhookSecret!
        );

        console.log(`Processing event: ${event.type}`);

        const relevantEvents = ["checkout.session.completed", "checkout.session.async_payment_succeeded"];

        if (relevantEvents.includes(event.type)) {
            const session = event.data.object as Stripe.Checkout.Session;
            const metadata = session.metadata;

            if (!metadata) throw new Error("No metadata in session");

            const supabaseAdmin = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );

            // Redundancy check
            const { data: existingOrder } = await supabaseAdmin
                .from('visa_orders')
                .select('id, payment_status')
                .eq('stripe_session_id', session.id)
                .maybeSingle();

            if (existingOrder && existingOrder.payment_status === 'paid') {
                console.log(`Order already processed for session: ${session.id}`);
                return new Response(JSON.stringify({ received: true }), { status: 200 });
            }

            // PIX Handling: wait for async_payment_succeeded
            if (metadata.paymentMethod === 'pix' && event.type === 'checkout.session.completed' && session.payment_status === 'unpaid') {
                console.log(`PIX session generated but unpaid yet: ${session.id}`);
                return new Response(JSON.stringify({ received: true, message: "Waiting for confirmation" }), { status: 200 });
            }

            // Use metadata but fallback to customer_details for robust testing and parsing
            const email = metadata.email || session.customer_details?.email || "";
            const fullName = metadata.fullName || session.customer_details?.name || "Client";
            const phone = metadata.phone || session.customer_details?.phone || "";
            const slug = metadata.slug || "unknown";
            const exchange_rate = metadata.exchange_rate;
            const netAmountUSD = metadata.netAmountUSD;
            const contract_selfie_url = metadata.contract_selfie_url || null;
            const terms_accepted_at = metadata.terms_accepted_at || null;
            const client_ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null;

            if (!email) {
                console.error("No email found in metadata or customer_details");
                return new Response(JSON.stringify({ error: "No email provided" }), { status: 400 });
            }

            // 1. Find or Create User
            let userId: string | null = null;
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('email', email)
                .maybeSingle();

            if (profile) {
                userId = profile.id;
            } else {
                // Determine origin for redirect from metadata or fallback
                const originUrl = metadata.origin_url || "http://localhost:5173";
                const redirectTo = `${originUrl}/auth/confirm-password`;

                console.log(`Inviting new user: ${email} with redirect to ${redirectTo}`);


                const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
                    email,
                    {
                        redirectTo,
                        data: { full_name: fullName, phone: phone }
                    }
                );

                if (!authError && authUser?.user) {
                    userId = authUser.user.id;
                } else if (authError) {
                    console.error("Error inviting user:", authError.message);
                }
            }

            // 2. Upsert Visa Order
            const totalUSD = netAmountUSD ? parseFloat(netAmountUSD) : (session.amount_total ? session.amount_total / 100 : 0);
            const appliedExchangeRate = exchange_rate ? parseFloat(exchange_rate) : null;
            const totalBRL = appliedExchangeRate ? totalUSD * appliedExchangeRate : null;

            const { data: order, error: orderError } = await supabaseAdmin
                .from('visa_orders')
                .upsert({
                    stripe_session_id: session.id,
                    user_id: userId,
                    client_name: fullName,
                    client_email: email,
                    product_slug: slug,
                    total_price_usd: totalUSD,
                    total_price_brl: totalBRL,
                    exchange_rate: appliedExchangeRate,
                    payment_status: 'paid',
                    payment_method: metadata.paymentMethod === 'pix' ? 'stripe_pix' : 'stripe_card',
                    payment_metadata: {
                        ...metadata,
                        stripe_id: session.id,
                        event_type: event.type
                    },
                    contract_selfie_url,
                    terms_accepted_at,
                    client_ip
                }, { onConflict: 'stripe_session_id' })
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Create User Service (The "Operational" part)
            if (userId) {
                const { error: serviceError } = await supabaseAdmin
                    .from('user_services')
                    .insert({
                        user_id: userId,
                        service_slug: slug,
                        status: 'active'
                    });

                if (serviceError) console.error("Error creating user service:", serviceError.message);
            }

            // 4. Gera o PDF do contrato em background
            try {
                console.log(`[stripe-webhook] Invocando generate-contract-pdf para ordem ${order.id}`);
                const { error: pdfError } = await supabaseAdmin.functions.invoke("generate-contract-pdf", {
                    body: { order_id: order.id }
                });
                if (pdfError) console.error("[stripe-webhook] Erro ao gerar PDF:", pdfError);
            } catch (pdfErr: any) {
                console.error("[stripe-webhook] Erro inesperado ao gerar PDF:", pdfErr.message);
            }

            console.log(`Successfully processed order ${order.order_number} for ${email}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
});
