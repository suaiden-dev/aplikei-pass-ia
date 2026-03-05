import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import Stripe from "https://esm.sh/stripe@14.16.0";
import { calculateCardAmountWithFees, calculateUSDToPixFinalBRL, getExchangeRate } from "../_shared/stripe-fee-calculator.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STRIPE_PRICES = {
    'visto-b1-b2': { usd: 200, name: 'Guia Visto Americano B1/B2', dependentPrice: 50 },
    'visto-f1': { usd: 350, name: 'Guia Visto Americano F-1', dependentPrice: 100 },
    'extensao-status': { usd: 200, name: 'Guia Extensão de Status', dependentPrice: 100 },
    'troca-status': { usd: 350, name: 'Guia Troca de Status', dependentPrice: 100 },
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const { slug, email, fullName, phone, dependents = 0, origin_url, paymentMethod = 'card', contract_selfie_url, terms_accepted_at } = await req.json();

        if (!slug || !email) {
            throw new Error("Missing required parameters: slug and email are required.");
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Supabase configuration missing.");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch product from database
        const { data: product, error: productError } = await supabase
            .from("visa_products")
            .select("*")
            .eq("slug", slug)
            .single();

        let serviceName: string;
        let basePriceUSD: number;
        let depPriceUSD: number;

        if (product) {
            serviceName = product.name;
            basePriceUSD = parseFloat(product.base_price_usd);
            depPriceUSD = parseFloat(product.price_per_dependent_usd);
        } else if (STRIPE_PRICES[slug]) {
            const service = STRIPE_PRICES[slug];
            serviceName = service.name;
            basePriceUSD = service.usd;
            depPriceUSD = service.dependentPrice;
        } else {
            throw new Error(`Invalid service slug: ${slug}`);
        }

        const subtotalUSD = basePriceUSD + (dependents * depPriceUSD);
        let unitAmount: number;
        let currency = "usd";
        let payment_method_types: string[] = ["card"];
        let appliedExchangeRate: number | null = null;

        if (paymentMethod === 'pix') {
            currency = "brl";
            payment_method_types = ["pix"];
            // Get dynamic exchange rate with 4% markup
            appliedExchangeRate = await getExchangeRate();
            unitAmount = Math.round(calculateUSDToPixFinalBRL(subtotalUSD, appliedExchangeRate) * 100);
        } else {
            unitAmount = Math.round(calculateCardAmountWithFees(subtotalUSD) * 100);
        }

        // Detecting environment to use correct secret key
        const host = new URL(origin_url || req.headers.get("referer") || "").hostname;
        let env = 'TEST';
        if (host === 'aplikei.com' || host === 'www.aplikei.com') env = 'PROD';
        else if (host.includes('netlify.app')) env = 'STAGING';

        const stripeSecret = Deno.env.get(`STRIPE_SECRET_KEY_${env}`) || Deno.env.get("STRIPE_SECRET_KEY");

        if (!stripeSecret) throw new Error(`Stripe Secret Key not found for environment: ${env}`);

        const stripe = new Stripe(stripeSecret, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types,
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: serviceName,
                            description: `Serviço Aplikei para ${serviceName} (${dependents} dependentes) - ${paymentMethod.toUpperCase()}`,
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            customer_email: email,
            success_url: `${origin_url}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin_url}/servicos/${slug}`,
            metadata: {
                slug,
                email,
                fullName,
                phone,
                dependents: dependents.toString(),
                env,
                basePrice: basePriceUSD.toString(),
                dependentPrice: depPriceUSD.toString(),
                paymentMethod,
                netAmountUSD: subtotalUSD.toString(),
                exchange_rate: appliedExchangeRate ? appliedExchangeRate.toString() : "",
                origin_url: origin_url || "http://localhost:5173",
                contract_selfie_url: contract_selfie_url || "",
                terms_accepted_at: terms_accepted_at || "",
                project: "aplikei"
            },
        });

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Stripe error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
