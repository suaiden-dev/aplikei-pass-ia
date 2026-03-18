import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import Stripe from "https://esm.sh/stripe@14.16.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders, status: 200 });

  try {
    const {
      email,
      fullName,
      serviceId,
      packageType, // 1, 2, or 3
      origin_url,
    } = await req.json();

    if (!email || !serviceId || !packageType) {
      throw new Error("Missing required parameters.");
    }

    const packages: Record<number, { name: string; price: number; desc: string }> = {
      1: { name: "Mentoria Individual (1 Aula)", price: 4900, desc: "Sessão única de treinamento especializado." },
      2: { name: "Pacote Bronze (2 Aulas)", price: 8900, desc: "Duas sessões de treinamento especializado." },
      3: { name: "Pacote Gold (3 Aulas)", price: 11900, desc: "Três sessões de treinamento - Preparação Completa." },
      4: { name: "Revisão com Especialista", price: 4900, desc: "Sessão única de análise de recusa de visto e plano de ação." }
    };

    const selectedPackage = packages[packageType];
    if (!selectedPackage) throw new Error("Invalid package type.");

    let host = "";
    try {
      const url = new URL(origin_url || req.headers.get("referer") || "");
      host = url.hostname;
    } catch (e: unknown) {
      console.warn("Could not determine host from origin_url or referer:", (e as Error).message);
    }

    let env = "TEST";
    if (host === "aplikei.com" || host === "www.aplikei.com") {
      env = "PROD";
    } else if (host.includes("netlify.app")) {
      env = "STAGING";
    }

    const stripeSecret =
      Deno.env.get(`STRIPE_SECRET_KEY_${env}`) ||
      Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeSecret)
      throw new Error(`Stripe Secret Key not found for environment: ${env}`);

    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: selectedPackage.name,
              description: selectedPackage.desc,
            },
            unit_amount: selectedPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email,
      success_url: `${origin_url}/dashboard/onboarding?specialist_success=true&package_type=${packageType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin_url}/dashboard/onboarding`,
      metadata: {
        type: packageType === 4 ? "specialist_review" : "specialist_training",
        slug: packageType === 4 ? "specialist-review" : "specialist-training",
        email,
        fullName,
        serviceId,
        packageType: packageType.toString(),
        env,
        project: "aplikei",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Stripe error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
