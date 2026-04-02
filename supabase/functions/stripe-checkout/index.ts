/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import Stripe from "https://esm.sh/stripe@14.16.0";
import { calculateCardAmountWithFees, calculateUSDToPixFinalBRL, getExchangeRate } from "../_shared/stripe-fee-calculator.ts";

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

        // Fallback catalog for add-on products not yet in services_prices
        const FALLBACK_PRICES: Record<string, { name: string; price: number }> = {
            'analise-especialista-cos': { name: 'Análise de Especialista (COS)', price: 50 },
            'motion-reconsideracao-cos': { name: 'Motion para Reconsideração (COS)', price: 150 },
        };

        // 2. Buscar preços na nova tabela services_prices
        const dependentId = DEPENDENT_SERVICE_MAP[slug] || 'dependente-b1-b2';
        
        console.log(`[stripe-checkout] Buscando preços para: ${slug} e ${dependentId}`);
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

        const isDynamicRecovery = action === 'cos_recovery' || action === 'eos_recovery' || action === 'rfe_recovery';
        
        if (isDynamicRecovery) {
            console.log(`[stripe-checkout] Loading dynamic price for recovery case. ServiceId: ${serviceId}`);
            if (!serviceId) {
                throw new Error("Missing serviceId for recovery case");
            }
            
            const { data: recoveryCase, error: rcError } = await supabase
                .from("cos_recovery_cases")
                .select("proposal_value_usd")
                .eq("user_service_id", serviceId)
                .single();
                
            if (rcError || !recoveryCase) {
                console.error("Error fetching recovery case DB price:", rcError);
                throw new Error("Could not verify recovery case pricing in the database.");
            }
            
            mainPriceInfo = { 
                service_id: slug, 
                name: 'Proposta do Especialista', 
                price: Number(recoveryCase.proposal_value_usd) 
            };
        } else {
            if (!mainPriceInfo && FALLBACK_PRICES[slug]) {
                console.log(`[stripe-checkout] Usando preço fallback para: ${slug}`);
                mainPriceInfo = { service_id: slug, ...FALLBACK_PRICES[slug] };
            }

            if (!mainPriceInfo) {
                console.error("[stripe-checkout] Serviço não encontrado:", slug);
                throw new Error(`Serviço não encontrado no catálogo: ${slug}`);
            }
        }

        const serviceName = mainPriceInfo.name;
        const basePriceUSD = Number(mainPriceInfo.price);
        const depPriceUSD = depPriceInfo ? Number(depPriceInfo.price) : 0;

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
            payment_method_types: payment_method_types as unknown as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
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
            success_url: `${origin_url}/checkout-success?session_id={CHECKOUT_SESSION_ID}&slug=${normalizedSlug}`,
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
                product_type: slug === 'troca-status' ? 'COS' : (slug === 'extensao-status' ? 'EOS' : 'B1B2'),
            },
        });

        console.log("Stripe Session created successfully:", session.id);

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: unknown) {
        console.error("Stripe Checkout Error Implementation Details:", error);
        
        const err = error as Error & { raw?: { message: string } };
        let errorMessage = err.message;
        const errorStack = err.stack;
        
        // If it's a Stripe error, it might have more details
        if (err.raw) {
          console.error("Stripe Raw Error:", JSON.stringify(err.raw, null, 2));
          errorMessage = err.raw.message || errorMessage;
        }

        return new Response(JSON.stringify({ 
            error: errorMessage,
            stack: errorStack,
            raw: err.raw || null,
            details: "Error in stripe-checkout edge function"
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
