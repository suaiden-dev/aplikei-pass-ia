import { getSupabaseClient } from "../lib/supabase/client";

export type StripePaymentMethod = "card" | "pix" | "zelle" | "parcelow";

// Funções de exibição: o servidor recalcula e cobra; aqui é só estimativa de UI.
export function estimateCardTotal(amount: number) {
  return (amount + 0.3) / (1 - 0.035);
}

export function estimatePixTotal(amount: number, exchangeRate: number) {
  return amount * exchangeRate * 1.04; // 4% markup, espelhando o servidor
}

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment-aplikei`;
const CONFIRM_STRIPE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/confirm-stripe-session`;

async function getAuthToken(): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session?.user) throw new Error("Usuário não autenticado");

  const token = session.access_token;
  if (!token) throw new Error("Token de autenticação não disponível");
  return token;
}

interface BaseCheckoutParams {
  slug: string;
  userId: string;
  product_name?: string;
  dependents?: number;
  coupon_code?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  // Campos extras toleráveis (workflows legados ainda passam email/serviceName/amount).
  // O servidor ignora qualquer amount enviado e recalcula a partir de product_prices.
  [key: string]: unknown;
}

export const paymentService = {
  async createStripeCheckout(params: BaseCheckoutParams & { paymentMethod: StripePaymentMethod }) {
    const token = await getAuthToken();
    const method = params.paymentMethod === "card" ? "stripe_card" : "stripe_pix";

    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_slug: params.slug,
        product_name: params.product_name,
        payment_method: method,
        dependents: params.dependents ?? 0,
        coupon_code: params.coupon_code,
        origin_url: window.location.origin,
        customer_name: params.customer_name,
        customer_email: params.customer_email,
        customer_phone: params.customer_phone,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Erro ao criar sessão de pagamento");
    if (!data.url) throw new Error("URL de pagamento não retornada pelo servidor");

    return { url: data.url as string, order_id: data.order_id as string };
  },

  async createParcelowCheckout(params: BaseCheckoutParams & { cpf?: string }) {
    const token = await getAuthToken();

    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_slug: params.slug,
        product_name: params.product_name,
        payment_method: "parcelow",
        dependents: params.dependents ?? 0,
        coupon_code: params.coupon_code,
        cpf: params.cpf,
        origin_url: window.location.origin,
        customer_name: params.customer_name,
        customer_email: params.customer_email,
        customer_phone: params.customer_phone,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Erro ao criar sessão Parcelow");
    if (!data.url) throw new Error("URL de pagamento Parcelow não retornada");

    return { url: data.url as string, order_id: data.order_id as string };
  },

  async uploadZelleProof(file: File, slug: string): Promise<string> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase client not available");

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `zelle-proofs/${slug}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("payment-proofs")
      .upload(path, file, { upsert: false });

    if (error) throw new Error(`Upload do comprovante falhou: ${error.message}`);

    const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(data.path);
    return urlData.publicUrl;
  },

  async createZellePayment(params: BaseCheckoutParams & { proofPath: string }) {
    const token = await getAuthToken();

    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_slug: params.slug,
        product_name: params.product_name,
        payment_method: "zelle",
        dependents: params.dependents ?? 0,
        coupon_code: params.coupon_code,
        proof_url: params.proofPath,
        origin_url: window.location.origin,
        customer_name: params.customer_name,
        customer_email: params.customer_email,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Erro ao registrar pagamento Zelle");

    return data as { order_id: string; payment_id: string };
  },

  async confirmStripeSession(sessionId: string) {
    // Função pública (deployada com --no-verify-jwt). Tentamos primeiro com o
    // anon key (caso o gateway exija algum bearer). Se a sessão do usuário
    // ainda existir, tudo bem; o que importa é o session_id no body.
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
    const res = await fetch(CONFIRM_STRIPE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(anonKey ? { Authorization: `Bearer ${anonKey}`, apikey: anonKey } : {}),
      },
      body: JSON.stringify({ session_id: sessionId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Falha ao confirmar pagamento");
    return data as {
      payment_status: "succeeded" | "failed" | "pending";
      order_status: "pending" | "paid" | "failed" | "canceled" | "partially_paid" | "refunded";
      stripe_payment_status?: string;
      stripe_session_status?: string;
      already_confirmed?: boolean;
    };
  },

  async verifyOrderActivation(params: {
    orderId?: string | null;
    onSuccess: () => void;
    onError: (msg: string) => void;
    timeoutMs?: number;
    intervalMs?: number;
  }) {
    const { orderId, onSuccess, onError, timeoutMs = 20000, intervalMs = 1500 } = params;

    if (!orderId) {
      onError("Pedido não identificado.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      onError("Conexão indisponível.");
      return;
    }

    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const { data, error } = await supabase
        .schema("aplikei")
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .maybeSingle();

      // Erro só é fatal se for de schema/permission (códigos 42P01, 42501).
      // RLS retornando 0 linhas (sem login) cai em data === null e a gente segue tentando.
      if (error && (error.code === "42P01" || error.code === "42501")) {
        onError(error.message);
        return;
      }

      if (data?.status === "paid") {
        onSuccess();
        return;
      }
      if (data?.status === "failed" || data?.status === "canceled") {
        onError(`Pagamento ${data.status}.`);
        return;
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    }

    onError("Tempo esgotado. Se o pagamento já foi feito, atualize esta página em alguns instantes.");
  },
};
