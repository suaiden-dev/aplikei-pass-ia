/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "https://esm.sh/stripe@14.16.0";
import { corsHeaders } from "../_shared/core/http.ts";
import { createAdminClient } from "../_shared/core/supabase.ts";
import {
    applyCoupon,
    calculateCardAmountWithFees,
    calculateUSDToPixFinalBRL,
    CouponData
} from "../_shared/payments/domain/fees.ts";
import { resolveCatalogPricing } from "../_shared/payments/application/resolve-catalog-pricing.ts";
import { getUsdToBrl } from "../_shared/payments/exchange-rate.ts";
import {
    resolveUseAplicei,
    getOfficeStripeConfig,
} from "../_shared/payments/office-payment.ts";

const NOTIFICATIONS_WEBHOOK = Deno.env.get("NOTIFICATIONS_WEBHOOK_URL");

async function sendAlert(message: string, metadata: any = {}) {
    if (!NOTIFICATIONS_WEBHOOK) return;
    try {
        await fetch(NOTIFICATIONS_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: `🚨 *Erro Crítico no Checkout*\n*Erro:* ${message}\n*Ambiente:* ${metadata.env || 'Desconhecido'}\n*Email:* ${metadata.email}\n*Slug:* ${metadata.slug}`
            })
        });
    } catch (e) {
        console.error("Failed to send alert:", e);
    }
}


Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    const metadata_for_logs: any = { env: 'TEST', email: 'unknown', slug: 'none' };

    try {
        const body = await req.json();
        const {
            order_id, action, serviceId, discountPct = 0, coupon_code,
            paymentMethod = 'card', office_id
        } = body;

        const supabase = createAdminClient();

        // 🔎 Buscar dados do pedido se houver order_id
        let orderData: any = null;
        if (order_id) {
            const { data } = await supabase.from("orders").select("*").eq("id", order_id).single();
            orderData = data;
        }

        if (!orderData && !body.slug) {
            throw new Error("ID do pedido ou Slug do serviço não fornecido.");
        }

        // --- Normalização de Dados (Prioridade para o Banco) ---
        const slug = orderData?.product_slug || body.slug;
        const email = orderData?.client_email || body.email;
        const fullName = orderData?.client_name || body.fullName;
        const targetUserId = orderData?.user_id || body.user_id || body.userId;
        const targetProcId = orderData?.payment_metadata?.proc_id || orderData?.payment_metadata?.parent_process_id || body.proc_id || body.processId;
        const parentServiceSlug = orderData?.payment_metadata?.parent_service_slug || body.parent_service_slug || "";
        const dependents = Number(orderData?.payment_metadata?.dependents || body.dependents || 0);
        const requestAmount = orderData?.total_price_usd || body.amount;
        const phone = orderData?.payment_metadata?.phone || body.phone || "";

        metadata_for_logs.email = email;
        metadata_for_logs.slug = slug;

        let origin_url = body.origin_url || body.originUrl || req.headers.get("origin") || req.headers.get("referer") || "https://aplikei.com";
        if (!origin_url.startsWith("http")) origin_url = `https://${origin_url}`;

        const urlObj = new URL(origin_url);
        metadata_for_logs.env = (urlObj.hostname === 'aplikei.com') ? 'PROD' : 'TEST';

        const pricing = await resolveCatalogPricing({
            supabase,
            slug,
            officeId: office_id,
            serviceId,
        });
        let basePriceUSD = pricing.basePriceUSD;
        const mainPriceName = pricing.mainPriceName;

        // Validação dinâmica de preço (Segurança)
        if (targetProcId) {
            const { data: procData } = await supabase.from("user_services").select("step_data").eq("id", targetProcId).single();
            const rfeAmount = procData?.step_data?.rfe_proposal_amount;
            const motionAmount = procData?.step_data?.motion_amount ?? procData?.step_data?.motion_proposal_amount;
            const parsedAmount = Number(rfeAmount ?? motionAmount);
            if (Number.isFinite(parsedAmount) && parsedAmount > 0) {
                basePriceUSD = parsedAmount;
            } else if (requestAmount && ['rfe-support', 'motion-support', 'suporte-rfe-eos', 'suporte-rfe-cos', 'recovery-eos', 'recovery-cos', 'analise-especialista-cos', 'apoio-rfe-motion-inicio', 'proposta-rfe-motion'].includes(slug)) {
                basePriceUSD = Number(requestAmount);
            }
        } else if (requestAmount) {
            basePriceUSD = Number(requestAmount);
        }

        const depPriceUSD = pricing.dependentPriceUSD;
        const subtotalUSD = basePriceUSD + dependents * depPriceUSD;

        let finalSubtotalUSD = subtotalUSD;
        let appliedCouponId = null;

        if (coupon_code) {
            const { data: couponData, error: couponError } = await supabase.rpc("validate_coupon", {
                p_code: coupon_code.toUpperCase().trim(),
                p_slug: slug
            });

            if (!couponError && couponData?.valid) {
                const { finalAmount } = applyCoupon(subtotalUSD, couponData as CouponData);
                finalSubtotalUSD = finalAmount;
                appliedCouponId = couponData.coupon_id;
            }
        } else if (discountPct > 0) {
            finalSubtotalUSD = subtotalUSD * (1 - (discountPct / 100));
        }

        let unitAmount: number;
        let currency = "usd";
        let payment_method_types: string[] = ["card"];
        let appliedExchangeRate: number | null = null;

        if (paymentMethod === 'pix') {
            currency = "brl";
            payment_method_types = ["pix"];
            appliedExchangeRate = await getUsdToBrl();
            unitAmount = Math.round(calculateUSDToPixFinalBRL(finalSubtotalUSD, appliedExchangeRate) * 100);
        } else {
            unitAmount = Math.round(calculateCardAmountWithFees(finalSubtotalUSD) * 100);
        }

        const platformSecret = Deno.env.get(`STRIPE_SECRET_KEY_${metadata_for_logs.env}`) || Deno.env.get("STRIPE_SECRET_KEY");

        let stripeSecret = platformSecret;
        let connectAccountId: string | null = null;

        if (office_id) {
            const useAplicei = await resolveUseAplicei(supabase, office_id);
            if (!useAplicei) {
                const officeStripe = await getOfficeStripeConfig(supabase, office_id);

                if (officeStripe.accountId) {
                    // Stripe Connect: process on the office's connected account
                    // using the platform key + stripeAccount option
                    connectAccountId = officeStripe.accountId;
                } else if (officeStripe.secretKey) {
                    // Legacy fallback: office has its own secret key
                    stripeSecret = officeStripe.secretKey;
                }
            }
        }

        const stripe = new Stripe(stripeSecret!, { apiVersion: "2023-10-16", httpClient: Stripe.createFetchHttpClient() });

        const sessionOptions = connectAccountId ? { stripeAccount: connectAccountId } : undefined;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: payment_method_types as any,
            line_items: [{
                price_data: {
                    currency,
                    product_data: { name: mainPriceName, description: `Serviço Aplikei - ${paymentMethod.toUpperCase()}` },
                    unit_amount: unitAmount,
                },
                quantity: 1,
            }],
            mode: "payment",
            customer_email: email,
            success_url: `${origin_url}/checkout-success?session_id={CHECKOUT_SESSION_ID}&slug=${slug}&order_id=${order_id || ""}`,
            cancel_url: `${origin_url}/servicos/${slug}`,
            metadata: {
                user_id: targetUserId || "",
                service_slug: slug,
                email,
                fullName: fullName || "",
                phone: phone || "",
                dependents: dependents.toString(),
                env: metadata_for_logs.env,
                paymentMethod,
                origin_url: origin_url,
                project: "aplikei",
                action: action || "",
                serviceId: serviceId || "",
                proc_id: targetProcId || "",
                processId: targetProcId || "",
                order_id: order_id || "",
                office_id: office_id || "",
                stripe_connect_account: connectAccountId || "",
                parent_service_slug: parentServiceSlug,
                coupon_code: coupon_code || "",
                applied_coupon_id: appliedCouponId || "",
                original_subtotal: subtotalUSD.toString(),
                discount_amount: (subtotalUSD - finalSubtotalUSD).toString(),
                netAmountUSD: finalSubtotalUSD.toString(),
                exchange_rate: appliedExchangeRate ? appliedExchangeRate.toString() : "",
                charged_amount: (unitAmount / 100).toString(),
                charged_currency: currency
            },
        }, sessionOptions);

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: unknown) {
        console.error("Stripe Checkout Error:", error);
        await sendAlert((error as Error).message, metadata_for_logs);
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
