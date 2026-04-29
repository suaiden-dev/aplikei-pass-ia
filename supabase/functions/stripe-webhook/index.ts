/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import Stripe from "https://esm.sh/stripe@14.16.0";
import { applySuccessfulPayment } from "../_shared/payment-slot-logic.ts";
import { buildNotifContent, getUserLang } from "../_shared/notif-templates.ts";

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

        const candidates = [
            {
                mode: "prod",
                webhookSecret: Deno.env.get("STRIPE_WEBHOOK_SECRET_PROD") || null,
                stripeSecret: Deno.env.get("STRIPE_SECRET_KEY_PROD") || Deno.env.get("STRIPE_SECRET_KEY") || null,
            },
            {
                mode: "test",
                webhookSecret: Deno.env.get("STRIPE_WEBHOOK_SECRET_TEST") || null,
                stripeSecret: Deno.env.get("STRIPE_SECRET_KEY_TEST") || Deno.env.get("STRIPE_SECRET_KEY") || null,
            },
            {
                mode: "default",
                webhookSecret: Deno.env.get("STRIPE_WEBHOOK_SECRET") || null,
                stripeSecret: Deno.env.get("STRIPE_SECRET_KEY") || null,
            },
        ].filter((c) => Boolean(c.webhookSecret) && Boolean(c.stripeSecret));

        if (candidates.length === 0) {
            throw new Error("Stripe secrets are not configured.");
        }

        let selected: (typeof candidates)[number] | null = null;
        let event: Stripe.Event | null = null;
        let lastError: Error | null = null;

        for (const c of candidates) {
            try {
                const stripe = new Stripe(c.stripeSecret!, {
                    apiVersion: "2023-10-16",
                    httpClient: Stripe.createFetchHttpClient(),
                });
                event = await stripe.webhooks.constructEventAsync(body, signature, c.webhookSecret!);
                selected = c;
                lastError = null;
                break;
            } catch (e) {
                lastError = e as Error;
            }
        }

        if (!event || !selected) {
            throw new Error(lastError?.message || "Stripe signature validation failed.");
        }

        console.log(`Processing event: ${event.type}`);

        const relevantEvents = ["checkout.session.completed", "checkout.session.async_payment_succeeded"];

        if (relevantEvents.includes(event.type)) {
            const session = event.data.object as Record<string, unknown>;
            const metadata = session.metadata as Record<string, unknown> | undefined;

            if (!metadata) throw new Error("No metadata in session");

            if (metadata.project !== 'aplikei') {
                console.log(`[IGNORED] Event from another project (Project: ${metadata.project || 'N/A'}) - Session: ${session.id}`);
                return new Response(JSON.stringify({ received: true, ignored: true, sessionId: session.id }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 200,
                });
            }

            const supabaseAdmin = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );

            const orderIdFromMetadata = metadata.order_id || null;
            const { data: eventRegistered, error: eventRegisterError } = await supabaseAdmin
                .rpc("register_payment_event", {
                    p_provider: "stripe",
                    p_event_id: event.id,
                    p_order_id: orderIdFromMetadata,
                    p_payment_id: session.id,
                    p_payload: {
                        type: event.type,
                        session_id: session.id,
                        mode: selected.mode,
                    },
                });

            if (eventRegisterError) throw eventRegisterError;
            if (!eventRegistered) {
                console.log(`[stripe-webhook] Event already registered; ensuring activation for session: ${session.id}`);
            }

            // Idempotency check
            const { data: existingOrder } = await (supabaseAdmin
                .from('orders')
                .select('id, payment_status')
                .eq('stripe_session_id', session.id)
                .maybeSingle() as any);

            if (existingOrder && existingOrder.payment_status === 'paid') {
                console.log(`Order already paid; ensuring service activation for session: ${session.id}`);
            }

            // PIX: wait for async confirmation
            if (metadata.paymentMethod === 'pix' && event.type === 'checkout.session.completed' && session.payment_status === 'unpaid') {
                console.log(`PIX session unpaid yet: ${session.id}`);
                return new Response(JSON.stringify({ received: true, message: "Waiting for confirmation" }), { status: 200 });
            }

            const email = metadata.email || session.customer_details?.email || "";
            const fullName = metadata.fullName || session.customer_details?.name || "Client";
            const phone = metadata.phone || session.customer_details?.phone || "";

            let slug = metadata.service_slug || metadata.slug;
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

            // User discovery
            let userId: string | null = metadata.user_id || metadata.userId || null;

            if (!userId) {
                const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();
                const existingAuthUser = authUsers?.find((u: any) => u.email === email);

                if (existingAuthUser) {
                    userId = existingAuthUser.id;
                } else {
                    const originUrl = metadata.origin_url || Deno.env.get("FRONTEND_URL") || "https://aplikeipass.com";
                    const redirectTo = `${originUrl}/auth/confirm-password`;

                    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
                        email,
                        { redirectTo, data: { full_name: fullName, phone } }
                    );

                    if (!authError && authUser?.user) {
                        userId = authUser.user.id;
                    } else if (authError) {
                        console.error("[stripe-webhook] FALHA AO ENVIAR CONVITE:", authError.message);
                    }
                }
            }

            const totalUSD = netAmountUSD ? parseFloat(netAmountUSD) : (session.amount_total ? session.amount_total / 100 : 0);
            const appliedExchangeRate = exchange_rate ? parseFloat(exchange_rate) : null;
            const totalBRL = appliedExchangeRate ? totalUSD * appliedExchangeRate : null;

            const orderPayload = {
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
            };

            // UPDATE pre-registered order when order_id exists, avoiding duplicate inserts
            const preRegisteredOrderId = metadata.order_id;
            let order: any;

            if (preRegisteredOrderId) {
                const { data, error: orderError } = await (supabaseAdmin
                    .from('orders')
                    .update(orderPayload)
                    .eq('id', preRegisteredOrderId)
                    .select()
                    .single() as any);
                if (orderError) throw orderError;
                order = data;
                console.log(`[stripe-webhook] Updated pre-registered order: ${preRegisteredOrderId}`);
            } else {
                const { data, error: orderError } = await (supabaseAdmin
                    .from('orders')
                    .upsert(orderPayload, { onConflict: 'stripe_session_id' })
                    .select()
                    .single() as any);
                if (orderError) throw orderError;
                order = data;
                console.log(`[stripe-webhook] Upserted order by stripe_session_id: ${session.id}`);
            }

            if (metadata.applied_coupon_id) {
                await supabaseAdmin.rpc("increment_coupon_usage", { p_coupon_id: metadata.applied_coupon_id });
            }

            // Handle user_services
            if (userId) {
                if (slug === 'proposta-rfe-motion') {
                    await applySuccessfulPayment({
                        supabase: supabaseAdmin,
                        user_id: userId,
                        service_slug: slug,
                        payment_method: metadata.paymentMethod === 'pix' ? 'stripe_pix' : 'stripe_card',
                        paid_amount: totalUSD,
                        dependents: parseInt(metadata.dependents || '0', 10),
                        proc_id: metadata.processId || metadata.proc_id,
                        payment_id: session.id,
                        order_id: order?.id || null,
                        parent_service_slug: metadata.parent_service_slug || null,
                    });
                } else if (metadata.serviceId) {
                    // Specialist/action-based flows: update process_services or user_services status directly
                    let { data: psRecord } = await supabaseAdmin
                        .from('process_services')
                        .select('id')
                        .eq('id', metadata.serviceId)
                        .maybeSingle();

                    if (!psRecord) {
                        const { data: psByProcess } = await supabaseAdmin
                            .from('process_services')
                            .select('id')
                            .eq('process_id', metadata.serviceId)
                            .order('created_at', { ascending: false })
                            .limit(1)
                            .maybeSingle();
                        psRecord = psByProcess;
                    }

                    if (psRecord) {
                        const { error: psError } = await supabaseAdmin
                            .from('process_services')
                            .update({
                                status: 'paid',
                                payment_ref: session.id,
                                amount_usd: totalUSD
                            })
                            .eq('id', psRecord.id);

                        if (psError) console.error("[stripe-webhook] Error updating process_services:", psError.message);

                        const { data: parentProcess } = await supabaseAdmin
                            .from('user_services')
                            .select('status, service_slug')
                            .eq('id', metadata.serviceId || metadata.processId)
                            .maybeSingle();

                        if (parentProcess && parentProcess.status?.includes("ANALISE_PENDENTE")) {
                            const prefix = parentProcess.service_slug === 'extensao-status' ? 'EOS' : 'COS';
                            await supabaseAdmin
                                .from('user_services')
                                .update({ status: `${prefix}_CASE_FORM` })
                                .eq('id', metadata.serviceId || metadata.processId);
                        }
                    } else {
                        if (metadata.type === 'specialist_training') {
                            await supabaseAdmin.from('user_services').update({
                                product_type: metadata.product_type || 'COS',
                                specialist_training_data: { status: 'paid', package_type: parseInt(metadata.packageType || '1'), stripe_session_id: session.id, updated_at: new Date().toISOString() }
                            }).eq('id', metadata.serviceId);
                        } else if (metadata.type === 'specialist_review') {
                            await supabaseAdmin.from('user_services').update({
                                product_type: metadata.product_type || 'COS',
                                specialist_review_data: { status: 'paid', stripe_session_id: session.id, updated_at: new Date().toISOString() }
                            }).eq('id', metadata.serviceId);
                        } else if (['cos_analyst', 'eos_analyst'].includes(metadata.action) && metadata.serviceId) {
                            const prefix = metadata.action.startsWith('eos') ? 'EOS' : 'COS';
                            await supabaseAdmin.from('user_services').update({
                                status: `${prefix}_CASE_FORM`,
                                product_type: metadata.product_type || prefix
                            }).eq('id', metadata.serviceId);
                        } else if (metadata.action && ['cos_recovery', 'eos_recovery', 'rfe_recovery', 'cos_motion', 'eos_motion', 'motion_recovery'].includes(metadata.action) && metadata.serviceId) {
                            const actionPrefix = metadata.action.split('_')[0].toUpperCase();
                            const { data: currentService } = await supabaseAdmin.from('user_services').select('status').eq('id', metadata.serviceId).single();
                            const isRfeFlow = currentService?.status?.endsWith('_RFE');
                            const nextStatus = isRfeFlow ? `${actionPrefix}_CASE_FORM` : `${actionPrefix}_MOTION_IN_PROGRESS`;
                            await supabaseAdmin.from('user_services').update({
                                status: nextStatus,
                                product_type: metadata.product_type || (actionPrefix === 'COS' ? 'COS' : 'EOS')
                            }).eq('id', metadata.serviceId);
                        } else if (metadata.action === 'restart' && metadata.serviceId) {
                            await supabaseAdmin.from('user_services').update({ status: 'active', product_type: metadata.product_type || 'COS' }).eq('id', metadata.serviceId);
                        } else if (metadata.action === 'reapply') {
                            await supabaseAdmin.from('user_services').insert({ user_id: userId, service_slug: slug, status: 'active', is_second_attempt: true });
                        } else {
                            await supabaseAdmin.from('user_services').insert({ user_id: userId, service_slug: slug, status: 'active' });
                        }
                    }
                } else {
                    // Standard purchase (including dependents) — shared logic handles slot counting
                    await applySuccessfulPayment({
                        supabase: supabaseAdmin,
                        user_id: userId,
                        service_slug: slug,
                        payment_method: metadata.paymentMethod === 'pix' ? 'stripe_pix' : 'stripe_card',
                        paid_amount: totalUSD,
                        dependents: parseInt(metadata.dependents || '0', 10),
                        proc_id: metadata.processId || metadata.proc_id,
                        payment_id: session.id,
                        order_id: order?.id || null,
                        parent_service_slug: metadata.parent_service_slug || null,
                    });
                }
            }

            if (userId) {
                const lang = await getUserLang(supabaseAdmin, userId);
                const serviceName = slug === "visa-f1f2" ? "F-1/F-2 Visa" : slug?.replace(/-/g, " ").toUpperCase();
                const { title, message } = buildNotifContent("payment_confirmed", { service_name: serviceName }, lang);
                await supabaseAdmin.from('notifications').insert({
                    user_id: userId,
                    target_role: "client",
                    type: "client_action",
                    title,
                    message,
                    email_sent: false,
                    send_email: true,
                    link: '/dashboard'
                });
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
