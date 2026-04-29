import Stripe from "https://esm.sh/stripe@14.16.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders, status: 200 });

  try {
    const {
      email,
      fullName,
      serviceId,
      packageType,
      origin_url,
    } = await req.json();

    if (!email || !serviceId || !packageType) {
      throw new Error("Missing required parameters.");
    }

    const packages: Record<number, { name: string; price: number; desc: string }> = {
      1: { name: "Mentoria Individual (1 Aula)", price: 4900, desc: "Sess\u00e3o \u00fanica de treinamento especializado." },
      2: { name: "Pacote Bronze (2 Aulas)", price: 8900, desc: "Duas sess\u00f5es de treinamento especializado." },
      3: { name: "Pacote Gold (3 Aulas)", price: 11900, desc: "Tr\u00eas sess\u00f5es de treinamento - Prepara\u00e7\u00e3o Completa." },
      4: { name: "Revis\u00e3o com Especialista", price: 4900, desc: "Sess\u00e3o \u00fanica de an\u00e1lise de recusa de visto e plano de a\u00e7\u00e3o." }
    };

    const selectedPackage = packages[packageType];
    if (!selectedPackage) throw new Error("Invalid package type.");

    let host = "";
    try {
      host = new URL(origin_url || req.headers.get("referer") || "").hostname;
    } catch {
      console.warn("Could not determine host from origin_url or referer");
    }

    let env = "TEST";
    if (host === "aplikei.com" || host === "www.aplikei.com") env = "PROD";
    else if (host.includes("netlify.app")) env = "STAGING";

    const stripeSecret =
      (env === "PROD"
        ? (Deno.env.get("STRIPE_SECRET_KEY_PROD") || Deno.env.get("STRIPE_SECRET_KEY"))
        : (Deno.env.get("STRIPE_SECRET_KEY_TEST") || Deno.env.get("STRIPE_SECRET_KEY")));

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
    const message = error instanceof Error ? error.message : String(error);
    console.error("Stripe error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
