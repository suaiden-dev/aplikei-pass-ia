import Stripe from "https://esm.sh/stripe@14.16.0";

export async function verifyStripeWebhook(req: Request): Promise<Stripe.Event> {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  const candidates = [
    {
      env: "test",
      secret: Deno.env.get("STRIPE_WEBHOOK_SECRET_TEST") ?? "",
      key: Deno.env.get("STRIPE_SECRET_KEY_TEST") ?? "",
    },
    {
      env: "prod",
      secret: Deno.env.get("STRIPE_WEBHOOK_SECRET_PROD") ?? "",
      key: Deno.env.get("STRIPE_SECRET_KEY_PROD") ?? "",
    },
  ].filter((item) => item.secret && item.key);

  if (candidates.length === 0) {
    throw new Error("Stripe webhook não configurado");
  }

  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      const stripe = new Stripe(candidate.key, {
        apiVersion: "2023-10-16",
        httpClient: Stripe.createFetchHttpClient(),
      });

      return await stripe.webhooks.constructEventAsync(
        body,
        signature ?? "",
        candidate.secret,
      );
    } catch (e) {
      lastError = e;
    }
  }

  throw new Error("Invalid Stripe signature");
}


type CreateStripeCheckoutSessionParams = {
  stripeSecret: string;
  connectAccountId: string | null;
  paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[];
  currency: string;
  unitAmount: number;
  productName: string;
  paymentMethod: string;
  email: string;
  originUrl: string;
  slug: string;
  orderId: string;
  metadata: Record<string, string>;
};

export async function createStripeCheckoutSession({
  stripeSecret,
  connectAccountId,
  paymentMethodTypes,
  currency,
  unitAmount,
  productName,
  paymentMethod,
  email,
  originUrl,
  slug,
  orderId,
  metadata,
}: CreateStripeCheckoutSessionParams) {
  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const sessionOptions = connectAccountId
    ? { stripeAccount: connectAccountId }
    : undefined;

  return await stripe.checkout.sessions.create(
    {
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: productName,
              description: `Serviço Aplikei - ${paymentMethod.toUpperCase()}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email,
      success_url: `${originUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}&slug=${slug}&order_id=${orderId || ""}`,
      cancel_url: `${originUrl}/servicos/${slug}`,
      metadata,
    },
    sessionOptions,
  );
}
