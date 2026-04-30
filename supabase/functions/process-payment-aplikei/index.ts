/**
 * process-payment-aplikei — Edge Function unificada
 *
 * Métodos suportados: stripe_card | stripe_pix | zelle | parcelow
 *
 * Preço é SEMPRE recalculado server-side a partir de aplikei.product_prices.
 * O cliente nunca dita o valor cobrado.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import Stripe from "https://esm.sh/stripe@14.16.0";

// ─── CORS ─────────────────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function options() { return new Response("ok", { headers: corsHeaders }); }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(message: string, status = 400) { return json({ error: message }, status); }

// ─── Exchange rate ─────────────────────────────────────────────────────────────

const PIX_MARKUP = 1.04;
const FALLBACK_BRL = 5.65;

async function getUsdToBrl(): Promise<number> {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    if (!res.ok) throw new Error("exchange rate fetch failed");
    const data = await res.json();
    return Math.round(parseFloat(data.rates.BRL) * PIX_MARKUP * 1000) / 1000;
  } catch {
    return FALLBACK_BRL;
  }
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

type PaymentMethod = "stripe_card" | "stripe_pix" | "zelle" | "parcelow";

interface RequestBody {
  product_slug: string;
  product_name?: string;
  payment_method: PaymentMethod;
  dependents?: number;
  coupon_code?: string;
  origin_url?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  cpf?: string;
  proof_url?: string;     // Zelle
}

function withCardFee(usd: number) { return (usd + 0.3) / (1 - 0.035); }

// ─── Origin allowlist ─────────────────────────────────────────────────────────

const PROD_ORIGINS = ["https://aplikei.com", "https://www.aplikei.com"];

function resolveOrigin(req: Request, body: RequestBody): { origin: string; env: "production" | "development" } {
  const headerOrigin = req.headers.get("origin") ?? "";
  const candidate = PROD_ORIGINS.includes(headerOrigin) ? headerOrigin : (body.origin_url ?? headerOrigin ?? "https://aplikei.com");
  const env: "production" | "development" = PROD_ORIGINS.includes(candidate) ? "production" : "development";
  return { origin: candidate, env };
}

// ─── Stripe Checkout ──────────────────────────────────────────────────────────

async function createStripeSession(
  stripe: Stripe,
  method: PaymentMethod,
  productName: string,
  amountUSD: number,
  meta: { orderId: string; paymentId: string; slug: string; email?: string; originUrl: string; },
) {
  const successUrl = `${meta.originUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&slug=${meta.slug}&order_id=${meta.orderId}`;
  const cancelUrl  = `${meta.originUrl}/checkout/${meta.slug}`;

  if (method === "stripe_pix") {
    const rate = await getUsdToBrl();
    const amountBRL = Math.round(amountUSD * rate * 100);
    return stripe.checkout.sessions.create({
      payment_method_types: ["pix"],
      line_items: [{ price_data: { currency: "brl", product_data: { name: productName, description: "Aplikei — Serviço de Visto" }, unit_amount: amountBRL }, quantity: 1 }],
      mode: "payment",
      customer_email: meta.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { order_id: meta.orderId, payment_id: meta.paymentId },
    });
  }

  // Cartão: aplica a fee uma única vez aqui (cliente envia preço base)
  const amountUSDCents = Math.round(withCardFee(amountUSD) * 100);
  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price_data: { currency: "usd", product_data: { name: productName, description: "Aplikei — Serviço de Visto" }, unit_amount: amountUSDCents }, quantity: 1 }],
    mode: "payment",
    customer_email: meta.email,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { order_id: meta.orderId, payment_id: meta.paymentId },
  });
}

// ─── Parcelow ─────────────────────────────────────────────────────────────────

async function createParcelowSession(opts: {
  env: string; reference: string; productName: string; slug: string;
  amountUSD: number; email: string; name: string; cpf: string;
  phone?: string; originUrl: string; orderId: string;
}) {
  const isProduction = opts.env === "production";
  const apiBase = isProduction ? "https://app.parcelow.com" : "https://sandbox-2.parcelow.com.br";
  const clientId = Deno.env.get(isProduction ? "PARCELOW_CLIENT_ID_PRODUCTION" : "PARCELOW_CLIENT_ID_STAGING");
  const clientSecret = Deno.env.get(isProduction ? "PARCELOW_CLIENT_SECRET_PRODUCTION" : "PARCELOW_CLIENT_SECRET_STAGING");

  if (!clientId || !clientSecret) {
    return `${opts.originUrl}/checkout-mock/parcelow?ref=${opts.orderId}`;
  }

  const authRes = await fetch(`${apiBase}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: Number(clientId) || clientId, client_secret: clientSecret, grant_type: "client_credentials" }),
  });
  if (!authRes.ok) throw new Error(`Parcelow auth failed: ${authRes.status}`);
  const { access_token } = await authRes.json();

  const orderRes = await fetch(`${apiBase}/api/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      reference: opts.reference,
      client: { cpf: opts.cpf.replace(/\D/g, ""), name: opts.name, email: opts.email, phone: opts.phone },
      items: [{ reference: opts.slug, description: `Aplikei — ${opts.productName}`, quantity: 1, amount: Math.round(opts.amountUSD * 100) }],
      redirect: {
        success: `${opts.originUrl}/checkout/success?slug=${opts.slug}&order_id=${opts.orderId}`,
        failed: `${opts.originUrl}/checkout/${opts.slug}`,
      },
    }),
  });

  const orderData = await orderRes.json();
  if (!orderRes.ok || !orderData.success) throw new Error(orderData.message || "Parcelow order creation failed");
  return orderData.data?.url_checkout as string;
}

// ─── Resolve preço base (USD) a partir do produto ─────────────────────────────

async function resolveBaseAmount(
  supabase: ReturnType<typeof createClient>,
  slug: string,
  dependents: number,
): Promise<{ amount: number; productName: string }> {
  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, slug, status")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`product lookup failed: ${error.message}`);
  if (!product) throw new Error(`product not found: ${slug}`);
  if (product.status === "archived") throw new Error("product is archived");

  const { data: price, error: priceErr } = await supabase
    .from("product_prices")
    .select("amount, dependent_amount, currency")
    .eq("product_id", product.id)
    .eq("is_default", true)
    .eq("currency", "USD")
    .maybeSingle();

  if (priceErr) throw new Error(`price lookup failed: ${priceErr.message}`);
  if (!price) throw new Error(`no default USD price for ${slug}`);

  const base = Number(price.amount);
  const perDep = Number(price.dependent_amount ?? 0);
  const total = base + Math.max(0, dependents) * perDep;

  if (!(total > 0)) throw new Error(`computed amount is invalid (${total})`);
  return { amount: total, productName: product.name };
}

// ─── Handler principal ────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return options();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase    = createClient(supabaseUrl, serviceKey, { db: { schema: "aplikei" } });

    // Autenticação (auth client usa schema padrão)
    const authClient = createClient(supabaseUrl, serviceKey);
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    let userId: string | null = null;

    if (token && token !== serviceKey) {
      const { data: { user } } = await authClient.auth.getUser(token);
      userId = user?.id ?? null;
    }

    if (!userId) return err("Unauthorized", 401);

    const body: RequestBody = await req.json();
    const {
      product_slug,
      product_name,
      payment_method,
      dependents = 0,
      coupon_code,
      customer_name,
      customer_email,
      customer_phone,
      cpf = "",
      proof_url,
    } = body;

    if (!product_slug) return err("product_slug obrigatório");
    if (!["stripe_card", "stripe_pix", "zelle", "parcelow"].includes(payment_method)) {
      return err("payment_method inválido");
    }
    if (payment_method === "parcelow" && !cpf) return err("CPF obrigatório para Parcelow");
    if (dependents < 0 || dependents > 20) return err("dependents fora do intervalo");

    const { origin: originUrl, env } = resolveOrigin(req, body);

    // Recalcular preço server-side (ignora qualquer amount enviado pelo cliente)
    const { amount, productName: dbProductName } = await resolveBaseAmount(supabase, product_slug, dependents);
    const productDisplayName = product_name ?? dbProductName;

    // Criar order
    const orderInsert = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        total_amount: amount,
        currency: "USD",
        metadata: { product_slug, product_name: productDisplayName, dependents, coupon_code: coupon_code ?? null, payment_method, env },
      })
      .select("id")
      .maybeSingle();

    if (orderInsert.error || !orderInsert.data?.id) {
      console.error("[process-payment] order insert failed:", orderInsert.error?.message);
      return err("falha ao criar pedido", 500);
    }
    const orderId = orderInsert.data.id;

    // Criar payment
    const providerMap: Record<PaymentMethod, string> = { stripe_card: "stripe", stripe_pix: "stripe", zelle: "zelle", parcelow: "parcelow" };
    const methodMap: Record<PaymentMethod, string> = { stripe_card: "credit_card", stripe_pix: "pix", zelle: "zelle", parcelow: "parcelow" };

    const paymentInsert = await supabase
      .from("payments")
      .insert({
        order_id: orderId,
        provider: providerMap[payment_method],
        method: methodMap[payment_method],
        status: "pending",
        amount,
        currency: "USD",
        metadata: { env, proof_url: proof_url ?? null },
      })
      .select("id")
      .maybeSingle();

    if (paymentInsert.error || !paymentInsert.data?.id) {
      console.error("[process-payment] payment insert failed:", paymentInsert.error?.message);
      return err("falha ao registrar pagamento", 500);
    }
    const paymentId = paymentInsert.data.id;

    // ── Stripe ──────────────────────────────────────────────────────────────
    if (payment_method === "stripe_card" || payment_method === "stripe_pix") {
      const stripeKey = Deno.env.get(env === "production" ? "STRIPE_SECRET_KEY_PROD" : "STRIPE_SECRET_KEY_TEST") ?? "";
      if (!stripeKey) return err("Stripe não configurado", 500);

      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16", httpClient: Stripe.createFetchHttpClient() });

      const session = await createStripeSession(stripe, payment_method, productDisplayName, amount, {
        orderId, paymentId, slug: product_slug, email: customer_email, originUrl,
      });

      await supabase.from("payments").update({ external_id: session.id }).eq("id", paymentId);

      return json({ provider: "stripe", url: session.url, order_id: orderId });
    }

    // ── Zelle ────────────────────────────────────────────────────────────────
    if (payment_method === "zelle") {
      const zelleEmail = Deno.env.get("ZELLE_EMAIL") ?? "pagamentos@aplikei.com";
      const zelleName  = Deno.env.get("ZELLE_NAME")  ?? "Aplikei Technologies";
      const memo = `APK-${orderId.slice(0, 8).toUpperCase()}`;

      const n8nUrl = Deno.env.get("N8N_ZELLE_WEBHOOK_URL");
      if (n8nUrl) {
        fetch(n8nUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: orderId, payment_id: paymentId, amount_usd: amount, product: productDisplayName, email: customer_email, name: customer_name, memo, proof_url }),
        }).catch((e) => console.warn("[zelle] N8N notify failed:", e));
      }

      return json({
        provider: "zelle",
        order_id: orderId,
        payment_id: paymentId,
        amount_usd: amount,
        instructions: { email: zelleEmail, name: zelleName, memo, message: "Envie o comprovante para o painel após o pagamento." },
      });
    }

    // ── Parcelow ─────────────────────────────────────────────────────────────
    const checkoutUrl = await createParcelowSession({
      env, reference: `APK_${orderId}`, productName: productDisplayName,
      slug: product_slug, amountUSD: amount,
      email: customer_email ?? "", name: customer_name ?? "",
      cpf, phone: customer_phone, originUrl, orderId,
    });

    await supabase
      .from("payments")
      .update({ external_id: `APK_${orderId}`, metadata: { env, checkout_url: checkoutUrl } })
      .eq("id", paymentId);

    return json({ provider: "parcelow", url: checkoutUrl, order_id: orderId });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[process-payment]", msg);
    return err(msg);
  }
});
