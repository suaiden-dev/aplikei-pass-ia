import { supabase } from "../lib/supabase";
import { ZELLE_RECIPIENT } from "../config/zelle";
import { getServiceBySlug } from "../data/services";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const ZELLE_BUCKET = "zelle_comprovantes";

export type StripePaymentMethod = "card" | "pix";

export interface StripeCheckoutParams {
  slug: string;
  email: string;
  fullName: string;
  phone: string;
  dependents?: number;
  paymentMethod: StripePaymentMethod;
  proc_id?: string;
  userId?: string;
  amount?: number;
  coupon_code?: string;
}

export interface ParcelowCheckoutParams {
  slug: string;
  email: string;
  fullName: string;
  phone: string;
  cpf: string;
  dependents?: number;
  userId?: string;
  amount?: number;
  coupon_code?: string;
  proc_id?: string;
}

export interface StripeCheckoutResult {
  url: string;
}

// Fee constants (mirrors edge function — for display only, final calc is server-side)
const CARD_FIXED_FEE = 0.3;
const CARD_PERCENTAGE_FEE = 0.039;
const PIX_PROCESSING_FEE = 0.018;
const IOF_RATE = 0.035;

export function estimateCardTotal(netUSD: number): number {
  return (netUSD + CARD_FIXED_FEE) / (1 - CARD_PERCENTAGE_FEE);
}

export function estimatePixTotal(netUSD: number, exchangeRate: number): number {
  const netBRL = netUSD * exchangeRate;
  const withFees = netBRL / (1 - PIX_PROCESSING_FEE);
  return withFees * (1 + IOF_RATE);
}

/** Parse "US$ 200,00" → 200 */
export function parsePriceUSD(priceStr: string): number {
  return parseFloat(priceStr.replace(/[^0-9,]/g, "").replace(",", ".")) || 0;
}

export const paymentService = {
  async createStripeCheckout(params: StripeCheckoutParams): Promise<StripeCheckoutResult> {
    const service = getServiceBySlug(params.slug);

    const cleanPhone = params.phone.replace(/\D/g, "");

    const body = {
      ...params,
      phone: cleanPhone,
      product_name: service?.title || params.slug,
      product_description: service?.subtitle || "",
      price: params.amount,
      total: params.amount,
      amount: params.amount,
      unit_amount: params.amount,
      quantity: 1,
      service_slug: params.slug,
      proc_id: params.proc_id,
      dependents: params.dependents ?? 0,
      user_id: params.userId,
      coupon_code: params.coupon_code || undefined,
      origin_url: window.location.origin,
      success_url: `${window.location.origin}/checkout-success?slug=${params.slug}`,
      cancel_url: `${window.location.origin}/checkout/${params.slug}`,
      project: "aplikei",
    };

    const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PaymentService] Stripe error response:", errorText);
      let errorData;
      try { errorData = JSON.parse(errorText); } catch { errorData = { error: errorText }; }
      throw new Error(errorData.error || errorData.message || `Erro de Servidor (Status ${response.status})`);
    }

    const data = await response.json();
    if (!data?.url) throw new Error("URL de checkout não retornada.");

    return { url: data.url };
  },

  async createParcelowCheckout(params: ParcelowCheckoutParams): Promise<StripeCheckoutResult> {

    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-parcelow-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          ...params,
          price: params.amount,
          total: params.amount,
          proc_id: params.proc_id,
          user_id: params.userId,
          coupon_code: params.coupon_code || undefined,
          origin_url: window.location.origin,
          success_url: `${window.location.origin}/checkout-success?slug=${params.slug}`,
          cancel_url: `${window.location.origin}/checkout/${params.slug}`,
          project: "aplikei",
        })
      });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("[PaymentService] Parcelow error response:", errorText);
        throw new Error(`Erro Parcelow: ${errorText}`);
    }

    const data = await response.json();
    if (!data?.checkoutUrl) throw new Error("URL de checkout Parcelow não retornada.");

    return { url: data.checkoutUrl };
  },

  /** Upload proof image to Supabase Storage, returns the storage path */
  async uploadZelleProof(file: File, slug: string): Promise<string> {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${slug}/${Date.now()}_proof.${ext}`;

    const { error } = await supabase.storage
      .from(ZELLE_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) throw new Error(`Erro ao enviar comprovante: ${error.message}`);
    return path;
  },

  async createZellePayment(params: {
    slug: string;
    serviceName: string;
    expectedAmount: number;
    amount: number;
    confirmationCode: string;
    paymentDate: string;
    proofPath: string;
    guestEmail: string;
    guestName: string;
    userId?: string | null;
    dependents?: number;
    proc_id?: string;
    coupon_code?: string;
    phone?: string;
  }): Promise<{ paymentId: string; autoApproved: boolean }> {
    // Busca o token atual para enviar apenas se existir
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    };

    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-zelle-payment`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        amount: params.amount,
        confirmation_code: params.confirmationCode,
        payment_date: params.paymentDate,
        proof_path: params.proofPath,
        service_slug: params.slug,
        guest_email: params.guestEmail,
        guest_name: params.guestName,
        user_id: params.userId ?? null,
        proc_id: params.proc_id,
        coupon_code: params.coupon_code || undefined,
        dependents: params.dependents,
        recipient_name: ZELLE_RECIPIENT.name,
        recipient_email: ZELLE_RECIPIENT.email,
        admin_notes: `Serviço: ${params.serviceName} | Valor esperado: $${params.expectedAmount.toFixed(2)} | Pago: $${params.amount.toFixed(2)}${params.dependents ? ` | Dependentes: ${params.dependents}` : ""}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PaymentService] Zelle error response:", errorText);
      let errorData;
      try { errorData = JSON.parse(errorText); } catch { errorData = { error: errorText }; }
      throw new Error(errorData.error || errorData.message || `Erro de Servidor (Status ${response.status})`);
    }

    const data = await response.json();
    return { 
      paymentId: data.payment_id, 
      autoApproved: data.auto_approved === true 
    };
  },

  /** 
   * Admin only — approve a pending Zelle payment.
   * Calls 'validate-zelle-payment' with the correct status and payment_id.
   */
  async approveZellePayment(paymentId: string): Promise<void> {

    const res = await fetch(`${SUPABASE_URL}/functions/v1/validate-zelle-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        payment_id: paymentId,
        status: "approved",
        admin_notes: "Aprovado manualmente via Painel Admin"
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("[PaymentService] Manual Approval failed:", errorData);
      throw new Error(errorData.error || `Erro de Servidor (Status ${res.status})`);
    }

  },

  /** Admin only — reject a Zelle payment */
  async rejectZellePayment(paymentId: string, reason: string): Promise<void> {

    const res = await fetch(`${SUPABASE_URL}/functions/v1/validate-zelle-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        payment_id: paymentId,
        status: "rejected",
        admin_notes: reason || "Rejeitado manualmente via Painel Admin"
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("[PaymentService] Manual Rejection failed:", errorData);
      throw new Error(errorData.error || `Erro de Servidor (Status ${res.status})`);
    }

  },
};
