/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import Stripe from "https://esm.sh/stripe@14.16.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
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
        const env = 'TEST';

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
            const session = event.data.object as any;
            const metadata = session.metadata;

            if (!metadata) throw new Error("No metadata in session");

            // --- PROJECT ISOLATION GUARD ---
            // Only process events intended for the 'aplikei' project.
            // If it's another project or missing, skip processing.
            if (metadata.project !== 'aplikei') {
                console.log(`[IGNORED] Stripe event from another project or old session (Project: ${metadata.project || 'N/A'}) - Session: ${session.id} - Checkout Email: ${session.customer_details?.email}`);
                return new Response(JSON.stringify({ received: true, ignored: true, sessionId: session.id }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 200,
                });
            }

            const supabaseAdmin = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );

            const { data: existingOrder } = await (supabaseAdmin
                .from('visa_orders')
                .select('id, payment_status')
                .eq('stripe_session_id', session.id)
                .maybeSingle() as any);

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
            
            let slug = metadata.slug;
            if (!slug) {
                if (metadata.type === 'specialist_training') slug = 'specialist-training';
                else if (metadata.type === 'specialist_review') slug = 'specialist-review';
                else slug = "unknown";
            }
            
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
            const { data: profile } = await (supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('email', email)
                .maybeSingle() as any);

            if (profile) {
                userId = profile.id;
            } else {
                // Determine origin for redirect from metadata or fallback
                const originUrl = metadata.origin_url || Deno.env.get("FRONTEND_URL") || "https://aplikeipass.com";
                const redirectTo = `${originUrl}/auth/confirm-password`;

                console.log(`[stripe-webhook] Criando acc via convite para ${email} (Origin: ${originUrl})`);


                const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
                    email,
                    {
                        redirectTo,
                        data: { full_name: fullName, phone: phone }
                    }
                );

                if (!authError && authUser?.user) {
                    console.log(`[stripe-webhook] Convite enviado com sucesso para: ${email}`);
                    userId = authUser.user.id;
                } else if (authError) {
                    console.error("[stripe-webhook] Erro ao convidar usuário:", authError.message);
                }
            }

            // 2. Upsert Visa Order
            const totalUSD = netAmountUSD ? parseFloat(netAmountUSD) : (session.amount_total ? session.amount_total / 100 : 0);
            const appliedExchangeRate = exchange_rate ? parseFloat(exchange_rate) : null;
            const totalBRL = appliedExchangeRate ? totalUSD * appliedExchangeRate : null;

            const { data: order, error: orderError } = await (supabaseAdmin
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
                .single() as any);

            if (orderError) throw orderError;

            // 3. Handle different types of payments
            if (userId) {
                if (metadata.type === 'specialist_training') {
                    const serviceId = metadata.serviceId;
                    const packageType = parseInt(metadata.packageType || '1');
                    
                    console.log(`Processing specialist training for user ${userId}, service ${serviceId}, package ${packageType}`);
                    
                    const { error: updateError } = await supabaseAdmin
                        .from('user_services')
                        .update({
                            product_type: metadata.product_type || 'COS',
                            specialist_training_data: {
                                status: 'paid',
                                package_type: packageType,
                                stripe_session_id: session.id,
                                updated_at: new Date().toISOString()
                            }
                        })
                        .eq('id', serviceId);
                    if (updateError) console.error("Error updating specialist training data:", updateError.message);
                } else if (metadata.type === 'specialist_review') {
                    const serviceId = metadata.serviceId;
                    
                    console.log(`Processing specialist review for user ${userId}, service ${serviceId}`);
                    
                    const { error: reviewError } = await supabaseAdmin
                        .from('user_services')
                        .update({
                            product_type: metadata.product_type || 'COS',
                            specialist_review_data: {
                                status: 'paid',
                                stripe_session_id: session.id,
                                updated_at: new Date().toISOString()
                            }
                        })
                        .eq('id', serviceId);
                    if (reviewError) console.error("Error updating specialist review data:", reviewError.message);
                } else if (['cos_analyst', 'eos_analyst'].includes(metadata.action) && metadata.serviceId) {
                    const serviceId = metadata.serviceId;
                    const prefix = metadata.action.startsWith('eos') ? 'EOS' : 'COS';
                    const nextStatus = `${prefix}_CASE_FORM`;
                    
                    console.log(`Processing ${metadata.action} specialist analysis payment for user ${userId}, service ${serviceId}, status: ${nextStatus}`);
                    
                    const { error: cosError } = await supabaseAdmin
                        .from('user_services')
                        .update({ 
                            status: nextStatus,
                            product_type: metadata.product_type || (prefix === 'COS' ? 'COS' : 'EOS')
                        })
                        .eq('id', serviceId);

                    if (cosError) console.error(`Error updating ${nextStatus} status:`, cosError.message);
                } else if (metadata.action && ['cos_recovery', 'eos_recovery', 'rfe_recovery', 'cos_motion', 'eos_motion', 'motion_recovery'].includes(metadata.action) && metadata.serviceId) {
                    const serviceId = metadata.serviceId;
                    const actionPrefix = metadata.action.split('_')[0].toUpperCase(); 
                    
                    // Verificamos o status atual para saber se devemos ir para FORM ou MOTION
                    const { data: currentService } = await supabaseAdmin
                        .from('user_services')
                        .select('status')
                        .eq('id', serviceId)
                        .single();
                    
                    const isRfeFlow = currentService?.status?.endsWith('_RFE');
                    const nextStatus = isRfeFlow ? `${actionPrefix}_CASE_FORM` : `${actionPrefix}_MOTION_IN_PROGRESS`;
                    
                    console.log(`Processing ${metadata.action} payment for user ${userId}, current_status: ${currentService?.status}, next_status: ${nextStatus}`);
                    
                    const { error: recoveryError } = await supabaseAdmin
                        .from('user_services')
                        .update({ 
                            status: nextStatus,
                            product_type: metadata.product_type || (actionPrefix === 'COS' ? 'COS' : 'EOS')
                        })
                        .eq('id', serviceId);

                    if (recoveryError) console.error("Error updating recovery status:", recoveryError.message);
                } else if (metadata.action === 'restart' && metadata.serviceId) {
                    console.log(`Processing restart for user ${userId}, service ${metadata.serviceId}`);
                    
                    const { error: restartError } = await supabaseAdmin
                        .from('user_services')
                        .update({
                            status: 'active',
                            product_type: metadata.product_type || 'COS'
                        })
                        .eq('id', metadata.serviceId);

                    if (restartError) console.error("Error restarting user service:", restartError.message);
                } else if (metadata.action === 'reapply') {
                    console.log(`Processing reapply for user ${userId}, old service ${metadata.serviceId}`);
                    
                    // Create NEW service for reapplication
                    const { error: reapplyError } = await supabaseAdmin
                        .from('user_services')
                        .insert({
                            user_id: userId,
                            service_slug: slug,
                            status: 'active',
                            is_second_attempt: true
                        });

                    if (reapplyError) console.error("Error creating reapplied user service:", reapplyError.message);
                } else {
                    // Default behavior for visa orders: Create/Update User Service
                    const { error: serviceError } = await supabaseAdmin
                        .from('user_services')
                        .insert({
                            user_id: userId,
                            service_slug: slug,
                            status: 'active'
                        });

                    if (serviceError) console.error("Error creating user service:", serviceError.message);
                }
            }

            console.log(`Successfully processed order for ${email}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (err: unknown) {
        const error = err as Error;
        console.error(`Webhook Error: ${error.message}`);
        return new Response(`Webhook Error: ${error.message}`, { status: 400 });
    }
});
