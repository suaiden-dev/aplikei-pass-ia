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
    'visa-f1f2': { usd: 350, name: 'Guia Visto Americano F-1', dependentPrice: 100 },
    'extensao-status': { usd: 200, name: 'Guia Extensão de Status', dependentPrice: 100 },
    'troca-status': { usd: 350, name: 'Guia Troca de Status', dependentPrice: 100 },
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const body = await req.json();
        console.log("Stripe Checkout Request Body:", JSON.stringify(body, null, 2));

        const { 
            slug, email, fullName, phone, dependents = 0, origin_url, 
            paymentMethod = 'card', contract_selfie_url, terms_accepted_at, 
            action, serviceId, discountPct = 0 
        } = body;

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

        // Fetch product from database
        console.log("Fetching product for slug:", slug);
        const { data: product, error: productError } = await supabase
            .from("visa_products")
            .select("*")
            .eq("slug", slug)
            .single();

        if (productError) {
          console.log("Product not found in database or error occurred:", productError.message);
        }

        let serviceName: string;
        let basePriceUSD: number;
        let depPriceUSD: number;

        if (product) {
            console.log("Product found in database:", product.name);
            serviceName = product.name;
            basePriceUSD = parseFloat(product.base_price_usd);
            depPriceUSD = parseFloat(product.price_per_dependent_usd);
        } else if (STRIPE_PRICES[slug as keyof typeof STRIPE_PRICES]) {
            console.log("Product found in hardcoded STRIPE_PRICES:", slug);
            const service = STRIPE_PRICES[slug as keyof typeof STRIPE_PRICES];
            serviceName = service.name;
            basePriceUSD = service.usd;
            depPriceUSD = service.dependentPrice;
        } else {
            console.error("Invalid service slug:", slug);
            throw new Error(`Invalid service slug: ${slug}`);
        }

        // Normalize slug for storage consistency
        const normalizedSlug = slug === 'visa-f1f2' ? 'visto-f1' : slug;

        let subtotalUSD = basePriceUSD + (dependents * depPriceUSD);
        
        // Apply discount if provided
        if (discountPct > 0) {
            console.log("Applying discount:", discountPct);
            subtotalUSD = subtotalUSD * (1 - (discountPct / 100));
        }

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
            console.log("PIX Payment calculated:", { subtotalUSD, appliedExchangeRate, unitAmount });
        } else {
            unitAmount = Math.round(calculateCardAmountWithFees(subtotalUSD) * 100);
            console.log("Card Payment calculated:", { subtotalUSD, unitAmount });
        }

        // Detecting environment to use correct secret key
        let host = "localhost";
        try {
          host = new URL(origin_url || req.headers.get("referer") || "http://localhost:5173").hostname;
        } catch (e) {
          console.error("Error parsing origin_url:", origin_url, e);
        }
        
        let env: 'PROD' | 'STAGING' | 'TEST' = 'TEST';
        if (host === 'aplikei.com' || host === 'www.aplikei.com') env = 'PROD';
        else if (host.includes('netlify.app')) env = 'STAGING';

        console.log("Environment detected:", { host, env });

        const stripeSecret = Deno.env.get(`STRIPE_SECRET_KEY_${env}`) || Deno.env.get("STRIPE_SECRET_KEY");

        if (!stripeSecret) {
            console.error(`Stripe Secret Key not found for environment: ${env}`);
            throw new Error(`Stripe Secret Key not found for environment: ${env}`);
        }

        const stripe = new Stripe(stripeSecret, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        // Create Checkout Session
        console.log("Creating Stripe Checkout Session...");
        const session = await stripe.checkout.sessions.create({
            payment_method_types: payment_method_types as any,
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
                slug: normalizedSlug,
                email,
                fullName: fullName || "",
                phone: phone || "",
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
                project: "aplikei",
                action: action || "",
                serviceId: serviceId || "",
            },
        });

        console.log("Stripe Session created successfully:", session.id);

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        console.error("Stripe Checkout Error Implementation Details:", error);
        
        let errorMessage = error.message;
        let errorStack = error.stack;
        
        // If it's a Stripe error, it might have more details
        if (error.raw) {
          console.error("Stripe Raw Error:", JSON.stringify(error.raw, null, 2));
          errorMessage = error.raw.message || errorMessage;
        }

        return new Response(JSON.stringify({ 
            error: errorMessage,
            stack: errorStack,
            raw: error.raw || null,
            details: "Error in stripe-checkout edge function"
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
