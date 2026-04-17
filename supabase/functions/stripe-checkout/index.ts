/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import Stripe from "https://esm.sh/stripe@14.16.0";

// --- EMBEDDED UTILITIES TO ENSURE DEPLOYMENT WITHOUT DOCKER ---
const CARD_FIXED_FEE = 0.30;
const CARD_PERCENTAGE_FEE = 0.039; // 3.9%
const PIX_PROCESSING_FEE = 0.018; // 1.8%
const IOF_RATE = 0.035; // 3.5%

const calculateCardAmountWithFees = (netAmount: number): number => {
    return (netAmount + CARD_FIXED_FEE) / (1 - CARD_PERCENTAGE_FEE);
};

const calculateUSDToPixFinalBRL = (usdNetAmount: number, exchangeRate: number): number => {
    const netBrl = usdNetAmount * exchangeRate;
    const brlWithFees = netBrl / (1 - PIX_PROCESSING_FEE);
    return brlWithFees * (1 + IOF_RATE);
};

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
// --- END EMBEDDED UTILITIES ---

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

    try {
        const body = await req.json();
        
        console.log("Stripe Checkout Request Body:", JSON.stringify(body, null, 2));

        const {
            slug, email, fullName, phone, dependents = 0,
            paymentMethod = 'card', contract_selfie_url, terms_accepted_at,
            action, serviceId, processId, proc_id, discountPct = 0, 
            amount: requestAmount, coupon_code, userId, user_id // <--- ADDED user_id
        } = body;
        
        const targetUserId = user_id || userId;

        let origin_url = body.origin_url || body.originUrl || req.headers.get("origin") || req.headers.get("referer") || "https://aplikei.com";
        if (!origin_url.startsWith("http")) origin_url = `https://${origin_url}`;
        if (origin_url.endsWith("/")) origin_url = origin_url.slice(0, -1);

        if (!slug || !email) {
            throw new Error("Missing required parameters: slug and email are required.");
        }

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

        if (!mainPriceInfo) {
            throw new Error(`Serviço não encontrado no catálogo: ${slug}`);
        }

        // --- LÓGICA DE SEGURANÇA (VALOR DO PROCESSO) ---
        let basePriceUSD = Number(mainPriceInfo.price);

        const targetProcId = proc_id || processId;
        if (targetProcId) {
            const { data: procData, error: procError } = await supabase
                .from("user_services")
                .select("step_data")
                .eq("id", targetProcId)
                .single();
            
            if (procError) {
                console.error("[Segurança] Erro ao validar processo:", procError);
            } else if (procData?.step_data?.motion_proposal_amount) {
                basePriceUSD = Number(procData.step_data.motion_proposal_amount);
                console.log(`[Segurança] Valor validado via DB para o processo ${targetProcId}: $${basePriceUSD}`);
            } else {
                const isDynamicService = ['rfe-support', 'motion-support', 'suporte-rfe-eos', 'suporte-rfe-cos', 'recovery-eos', 'recovery-cos', 'analise-especialista-cos'].includes(slug);
                if (requestAmount && isDynamicService) {
                    basePriceUSD = Number(requestAmount);
                    console.log(`[Checkout] Usando valor dinâmico enviado: $${basePriceUSD}`);
                }
            }
        } else {
            const isDynamicService = ['rfe-support', 'motion-support', 'suporte-rfe-eos', 'suporte-rfe-cos', 'recovery-eos', 'recovery-cos', 'analise-especialista-cos', 'mentoria-individual', 'mentoria-bronze', 'mentoria-gold', 'mentoria-negativa-consular'].includes(slug);
            if (requestAmount && isDynamicService) {
                basePriceUSD = Number(requestAmount);
            }
        }
        // --- FIM DA LÓGICA DE SEGURANÇA ---

        const serviceName = mainPriceInfo.name;
        const depPriceUSD = depPriceInfo ? Number(depPriceInfo.price) : 0;
        const normalizedSlug = slug === 'visa-f1f2' ? 'visto-f1' : slug;

        let subtotalUSD = basePriceUSD + (dependents * depPriceUSD);

        // --- NOVA LÓGICA DE CUPOM (ESTENDIDA) ---
        let finalSubtotalUSD = subtotalUSD;
        let appliedCouponId = null;

        if (coupon_code) {
            const { data: couponData, error: couponError } = await supabase.rpc("validate_coupon", {
                p_code: coupon_code.toUpperCase().trim(),
                p_slug: slug
            });

            if (!couponError && couponData?.valid) {
                const minPurchase = couponData.min_purchase_usd || 0;
                if (subtotalUSD >= minPurchase) {
                    if (couponData.discount_type === "percentage") {
                        finalSubtotalUSD = Math.max(0, subtotalUSD * (1 - (couponData.discount_value / 100)));
                    } else {
                        finalSubtotalUSD = Math.max(0, subtotalUSD - couponData.discount_value);
                    }
                    appliedCouponId = couponData.coupon_id;
                    console.log(`[Coupon] Aplicado ${coupon_code}: $${subtotalUSD} -> $${finalSubtotalUSD}`);
                }
            } else if (couponError) {
                console.error("[Coupon] Erro na validação:", couponError);
            }
        } else if (discountPct > 0) {
            // Suporte legado para discountPct se enviado diretamente e sem cupom
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
            // --- USA finalSubtotalUSD ---
            unitAmount = Math.round(calculateUSDToPixFinalBRL(finalSubtotalUSD, appliedExchangeRate) * 100);
        } else {
            // --- USA finalSubtotalUSD ---
            unitAmount = Math.round(calculateCardAmountWithFees(finalSubtotalUSD) * 100);
        }

        const urlObj = new URL(origin_url);
        const host = urlObj.hostname;
        let env: 'PROD' | 'STAGING' | 'TEST' = 'TEST';
        if (host === 'aplikei.com' || host === 'www.aplikei.com') env = 'PROD';
        else if (host.includes('netlify.app')) env = 'STAGING';

        const stripeSecret = Deno.env.get(`STRIPE_SECRET_KEY_${env}`) || Deno.env.get("STRIPE_SECRET_KEY");
        const stripe = new Stripe(stripeSecret!, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: payment_method_types as any,
            line_items: [{
                price_data: {
                    currency,
                    product_data: {
                        name: serviceName,
                        description: `Serviço Aplikei - ${paymentMethod.toUpperCase()}`,
                    },
                    unit_amount: unitAmount,
                },
                quantity: 1,
            }],
            mode: "payment",
            customer_email: email,
            success_url: `${origin_url}/checkout-success?session_id={CHECKOUT_SESSION_ID}&slug=${normalizedSlug}`,
            cancel_url: `${origin_url}/servicos/${slug}`,
            metadata: {
                user_id: targetUserId || "", // <--- ADDED for webhook
                service_slug: normalizedSlug, // <--- ADDED for webhook
                slug: normalizedSlug,
                email,
                fullName: fullName || "",
                phone: phone || "",
                dependents: dependents.toString(),
                env,
                paymentMethod,
                origin_url: origin_url,
                project: "aplikei",
                action: action || "",
                serviceId: serviceId || "",
                processId: targetProcId || "",
                proc_id: targetProcId || "",
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
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
