/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import Stripe from "https://esm.sh/stripe@14.16.0";
import { 
    calculateSubtotal, 
    applyCoupon, 
    calculateCardAmountWithFees, 
    calculateUSDToPixFinalBRL,
    CouponData
} from "./payment-logic.ts";

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

async function getExchangeRate(): Promise<number> {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) throw new Error('Failed to fetch exchange rate');
        const data = await response.json();
        const baseRate = parseFloat(data.rates.BRL);
        const exchangeRateWithMarkup = baseRate * 1.04;
        return Math.round(exchangeRateWithMarkup * 1000) / 1000;
    } catch (error: unknown) {
        console.error("Error fetching exchange rate, using fallback:", (error as Error).message);
        return 5.60;
    }
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-customer-auth",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEPENDENT_SERVICE_MAP: Record<string, string> = {
    'visto-b1-b2': 'dependente-b1-b2',
    'visto-f1': 'dependente-estudante',
    'visa-f1f2': 'dependente-estudante',
    'extensao-status': 'dependente-estudante',
    'troca-status': 'dependente-estudante',
};

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    const metadata_for_logs: any = { env: 'TEST', email: 'unknown', slug: 'none' };

    try {
        const body = await req.json();
        const {
            slug, email, fullName, phone, dependents = 0,
            paymentMethod = 'card', action, serviceId, processId, proc_id, discountPct = 0, 
            amount: requestAmount, coupon_code, userId, user_id
        } = body;
        
        metadata_for_logs.email = email;
        metadata_for_logs.slug = slug;
        
        const targetUserId = user_id || userId;
        let origin_url = body.origin_url || body.originUrl || req.headers.get("origin") || req.headers.get("referer") || "https://aplikei.com";
        if (!origin_url.startsWith("http")) origin_url = `https://${origin_url}`;

        const urlObj = new URL(origin_url);
        metadata_for_logs.env = (urlObj.hostname === 'aplikei.com') ? 'PROD' : 'TEST';

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const supabase = createClient(supabaseUrl!, supabaseKey!);

        const FALLBACK_PRICES: Record<string, { name: string; price: number }> = {
            'analise-especialista-cos': { name: 'Análise de Especialista (COS)', price: 50 },
            'analise-especialista-eos': { name: 'Análise de Especialista (EOS)', price: 50 },
            'motion-reconsideracao-cos': { name: 'Motion para Reconsideração (COS)', price: 150 },
            'motion-reconsideracao-eos': { name: 'Motion para Reconsideração (EOS)', price: 150 },
            'rfe-support': { name: 'Apoio Técnico ao RFE', price: 497 },
            'suporte-rfe-eos': { name: 'Suporte ao RFE (EOS)', price: 497 },
            'suporte-rfe-cos': { name: 'Apoio ao RFE (Troca de Status)', price: 497 },
            'recovery-eos': { name: 'Recuperação de Caso - Motion (EOS)', price: 897 },
            'recovery-cos': { name: 'Recuperação de Caso - Motion (Troca de Status)', price: 897 },
            'motion-support': { name: 'Motion de Reconsideração', price: 897 },
            'mentoria-individual': { name: 'Mentoria Individual - 1 Simulado', price: 197 },
            'mentoria-bronze': { name: 'Mentoria Bronze - 2 Simulados', price: 397 },
            'mentoria-gold': { name: 'Mentoria Gold - 3 Simulados', price: 697 },
            'mentoria-negativa-consular': { name: 'Consultoria Especializada (Pós-Negativa)', price: 97 },
            'slot-dependente-cos': { name: 'Dependente Adicional (COS/EOS)', price: 100 },
        };

        const dependentId = DEPENDENT_SERVICE_MAP[slug] || 'dependente-b1-b2';
        const { data: dbPrices } = await supabase.from("services_prices").select("service_id, name, price").in("service_id", [slug, dependentId]);

        let mainPriceInfo = dbPrices?.find(p => p.service_id === slug);
        const depPriceInfo = dbPrices?.find(p => p.service_id === dependentId);

        if (!mainPriceInfo && FALLBACK_PRICES[slug]) {
            mainPriceInfo = { service_id: slug, ...FALLBACK_PRICES[slug] };
        }

        if (!mainPriceInfo) throw new Error(`Serviço não encontrado no catálogo: ${slug}`);

        let basePriceUSD = Number(mainPriceInfo.price);
        const targetProcId = proc_id || processId;

        // Validação dinâmica de preço (Segurança)
        if (targetProcId) {
            const { data: procData } = await supabase.from("user_services").select("step_data").eq("id", targetProcId).single();
            if (procData?.step_data?.motion_proposal_amount) {
                basePriceUSD = Number(procData.step_data.motion_proposal_amount);
            } else if (requestAmount && ['rfe-support', 'motion-support', 'suporte-rfe-eos', 'suporte-rfe-cos', 'recovery-eos', 'recovery-cos', 'analise-especialista-cos'].includes(slug)) {
                basePriceUSD = Number(requestAmount);
            }
        } else if (requestAmount && ['rfe-support', 'motion-support', 'suporte-rfe-eos', 'suporte-rfe-cos', 'recovery-eos', 'recovery-cos', 'analise-especialista-cos', 'mentoria-individual', 'mentoria-bronze', 'mentoria-gold', 'mentoria-negativa-consular'].includes(slug)) {
            basePriceUSD = Number(requestAmount);
        }

        const depPriceUSD = depPriceInfo ? Number(depPriceInfo.price) : 0;
        const subtotalUSD = calculateSubtotal(basePriceUSD, dependents, depPriceUSD);

        let finalSubtotalUSD = subtotalUSD;
        let appliedCouponId = null;

        if (coupon_code) {
            const { data: couponData, error: couponError } = await supabase.rpc("validate_coupon", {
                p_code: coupon_code.toUpperCase().trim(),
                p_slug: slug
            });

            if (!couponError && couponData?.valid) {
                const { finalAmount, discountAmount } = applyCoupon(subtotalUSD, couponData as CouponData);
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
            appliedExchangeRate = await getExchangeRate();
            unitAmount = Math.round(calculateUSDToPixFinalBRL(finalSubtotalUSD, appliedExchangeRate) * 100);
        } else {
            unitAmount = Math.round(calculateCardAmountWithFees(finalSubtotalUSD) * 100);
        }

        const stripeSecret = Deno.env.get(`STRIPE_SECRET_KEY_${metadata_for_logs.env}`) || Deno.env.get("STRIPE_SECRET_KEY");
        const stripe = new Stripe(stripeSecret!, { apiVersion: "2023-10-16", httpClient: Stripe.createFetchHttpClient() });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: payment_method_types as any,
            line_items: [{
                price_data: {
                    currency,
                    product_data: { name: mainPriceInfo.name, description: `Serviço Aplikei - ${paymentMethod.toUpperCase()}` },
                    unit_amount: unitAmount,
                },
                quantity: 1,
            }],
            mode: "payment",
            customer_email: email,
            success_url: `${origin_url}/checkout-success?session_id={CHECKOUT_SESSION_ID}&slug=${slug}`,
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
                processId: targetProcId || "",
                coupon_code: coupon_code || "",
                applied_coupon_id: appliedCouponId || "",
                original_subtotal: subtotalUSD.toString(),
                discount_amount: (subtotalUSD - finalSubtotalUSD).toString()
            },
        });

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
