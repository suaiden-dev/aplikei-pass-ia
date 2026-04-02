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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Mapeamento de dependentes por serviço
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
            action, serviceId, discountPct = 0, amount: requestAmount
        } = body;

        // Ensure origin_url is always absolute and contains protocol
        let origin_url = body.origin_url || body.originUrl || req.headers.get("origin") || req.headers.get("referer") || "https://aplikei.com";
        if (!origin_url.startsWith("http")) origin_url = `https://${origin_url}`;
        if (origin_url.endsWith("/")) origin_url = origin_url.slice(0, -1);

        console.log("Normalized Origin URL:", origin_url);

        if (!slug || !email) {
            console.error("Missing required parameters:", { slug, email });
            throw new Error("Missing required parameters: slug and email are required.");
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseKey) {
            console.error("Supabase configuration missing.");
            throw new Error("Supabase configuration missing.");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fallback catalog for add-on products not yet in services_prices
        const FALLBACK_PRICES: Record<string, { name: string; price: number }> = {
            'analise-especialista-cos': { name: 'Análise de Especialista (COS)', price: 50 },
            'analise-especialista-eos': { name: 'Análise de Especialista (EOS)', price: 50 },
            'motion-reconsideracao-cos': { name: 'Motion para Reconsideração (COS)', price: 150 },
            'motion-reconsideracao-eos': { name: 'Motion para Reconsideração (EOS)', price: 150 },
            'rfe-support': { name: 'Apoio Técnico ao RFE', price: 0 },
            'motion-support': { name: 'Motion de Reconsideração', price: 0 },
        };

        // 2. Buscar preços na nova tabela services_prices
        const dependentId = DEPENDENT_SERVICE_MAP[slug] || 'dependente-b1-b2';

        const { data: dbPrices, error: dbError } = await supabase
            .from("services_prices")
            .select("service_id, name, price")
            .in("service_id", [slug, dependentId]);

        if (dbError) {
            console.error("[stripe-checkout] Erro ao buscar preços no banco:", dbError);
            throw new Error("Erro interno ao validar preços.");
        }

        // Use DB prices if found; otherwise fall back to hardcoded catalog
        let mainPriceInfo = dbPrices?.find(p => p.service_id === slug);
        const depPriceInfo = dbPrices?.find(p => p.service_id === dependentId);

        if (!mainPriceInfo && FALLBACK_PRICES[slug]) {
            mainPriceInfo = { service_id: slug, ...FALLBACK_PRICES[slug] };
        }

        if (!mainPriceInfo) {
            console.error("[stripe-checkout] Serviço não encontrado:", slug);
            throw new Error(`Serviço não encontrado no catálogo: ${slug}`);
        }

        const serviceName = mainPriceInfo.name;
        // Prioritize custom amount passed from frontend for support services
        const basePriceUSD = (requestAmount && (slug === 'rfe-support' || slug === 'motion-support')) 
            ? Number(requestAmount) 
            : Number(mainPriceInfo.price);
        
        const depPriceUSD = depPriceInfo ? Number(depPriceInfo.price) : 0;
        const normalizedSlug = slug === 'visa-f1f2' ? 'visto-f1' : slug;

        let subtotalUSD = basePriceUSD + (dependents * depPriceUSD);
        if (discountPct > 0) subtotalUSD = subtotalUSD * (1 - (discountPct / 100));

        let unitAmount: number;
        let currency = "usd";
        let payment_method_types: string[] = ["card"];
        let appliedExchangeRate: number | null = null;

        if (paymentMethod === 'pix') {
            currency = "brl";
            payment_method_types = ["pix"];
            appliedExchangeRate = await getExchangeRate();
            unitAmount = Math.round(calculateUSDToPixFinalBRL(subtotalUSD, appliedExchangeRate) * 100);
        } else {
            unitAmount = Math.round(calculateCardAmountWithFees(subtotalUSD) * 100);
        }

        // Detecting environment
        const urlObj = new URL(origin_url);
        const host = urlObj.hostname;
        let env: 'PROD' | 'STAGING' | 'TEST' = 'TEST';
        if (host === 'aplikei.com' || host === 'www.aplikei.com') env = 'PROD';
        else if (host.includes('netlify.app')) env = 'STAGING';

        const stripeSecret = Deno.env.get(`STRIPE_SECRET_KEY_${env}`) || Deno.env.get("STRIPE_SECRET_KEY");

        if (!stripeSecret) {
            console.error(`Stripe Secret Key not found for environment: ${env} (Host: ${host})`);
            return new Response(JSON.stringify({
                error: `Configuração do Stripe ausente para o ambiente ${env}. Verifique os Secrets no Supabase.`,
                details: { env, host }
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            });
        }

        const stripe = new Stripe(stripeSecret, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        // Create Checkout Session
        console.log(`[stripe-checkout] Creating ${env} session for ${email} on host ${host}`);
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
            },
        });

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: unknown) {
        console.error("Stripe Checkout Error:", error);
        const err = error as Error & { raw?: { message: string } };
        
        // Extract Stripe-specific error if available
        const stripeErrorMessage = err.raw?.message || err.message;

        return new Response(JSON.stringify({
            error: stripeErrorMessage,
            details: "Error in stripe-checkout edge function",
            type: err.constructor.name
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
