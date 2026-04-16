import { supabase } from "../lib/supabase";
import { ZELLE_RECIPIENT } from "../config/zelle";
import { getServiceBySlug } from "../data/services";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const N8N_BOT_CHECKPROOF = import.meta.env.VITE_N8N_BOT_CHECKPROOF as string;

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

    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    };
    if (session?.access_token) {
      headers["X-Customer-Auth"] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PaymentService] Stripe error response:", errorText);
      throw new Error(errorText || "Erro ao processar Stripe Checkout");
    }

    const data = await response.json();
    if (!data?.url) throw new Error("URL de checkout não retornada.");

    return { url: data.url };
  },

  async createParcelowCheckout(params: ParcelowCheckoutParams): Promise<StripeCheckoutResult> {

    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    };
    if (session?.access_token) {
      headers["X-Customer-Auth"] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-parcelow-checkout`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PaymentService] Parcelow error response:", errorText);
      throw new Error(errorText || "Erro ao processar Parcelow Checkout");
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
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${session?.access_token || SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    };

    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-zelle-payment`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: params.amount,
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
      throw new Error(errorText || "Erro ao processar pagamento Zelle");
    }

    const data = await response.json();
    const paymentId = data.payment_id;

    // --- N8N BOT CHECKPROOF (Síncrono e com Tratamento de Respostas) ---
    let autoApproved = data.auto_approved === true;
    const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/zelle_comprovantes/${params.proofPath}`;
    
    const botPayload = {
      event: "zelle_payment_created",
      payment_id: paymentId,
      user_id: params.userId || null,
      email: params.guestEmail,
      full_name: params.guestName,
      amount: params.amount,
      proof_path: params.proofPath,
      image_url: imageUrl,
      service_slug: params.slug,
      timestamp: new Date().toISOString()
    };

    try {
      console.log("[N8N Bot] Aguardando verificação prévia...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s de limite para verificação síncrona

      const botResponse = await fetch(N8N_BOT_CHECKPROOF, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(botPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const botData = await botResponse.json().catch(() => ({ response: "error" }));
      console.log("[N8N Bot] Resposta:", botData);

      if (botData.response === "approved payment") {
        autoApproved = true;
        console.log("[N8N Bot] Pagamento aprovado automaticamente pelo robô.");
      } else {
        autoApproved = false;
        
        // Enviar para o sistema de notificações (Sininho + E-mail)
        try {
          await supabase.from("notifications").insert({
            type: "client_action",
            target_role: "admin", // Notifica o admin que o robô falhou e precisa de revisão
            user_id: params.userId || null,
            title: "🔍 Zelle: Verificação Automática Falhou",
            message: `O pagamento ${paymentId} ($${params.amount}) não passou na conferência automática do robô. Motivo: ${botData.response}. Uma análise manual é necessária.`,
            send_email: true,
            metadata: {
              payment_id: paymentId,
              bot_response: botData.response
            }
          });
        } catch (notifErr) {
          console.error("[N8N Bot] Erro ao criar notificação de falha:", notifErr);
        }

        toast.info("O comprovante não passou na verificação automática inicial e precisará ser analisado manualmente.", {
          duration: 6000,
        });
      }
    } catch (botErr: unknown) {
      autoApproved = false;
      console.warn("[N8N Bot] Falha ou timeout na verificação:", (botErr as Error).message);
      
      // Notificação de erro técnico para o admin
      try {
        await supabase.from("notifications").insert({
          type: "client_action",
          target_role: "admin",
          user_id: params.userId || null,
          title: "⚠️ Erro Técnico: Robô Zelle Offline",
          message: `Não foi possível contatar o robô de verificação para o pagamento ${paymentId}. O sistema seguirá para conferência manual.`,
          send_email: true
        });
      } catch (notifErr) {
        console.error("[N8N Bot] Erro ao criar notificação de timeout:", notifErr);
      }

      toast.info("Não foi possível verificar seu comprovante agora. Nossa equipe fará a conferência manual em instantes.");
    }

    return { 
      paymentId: paymentId, 
      autoApproved: autoApproved 
    };
  },

  /** 
   * Admin only — approve a pending Zelle payment.
   * Calls 'validate-zelle-payment' with the correct status and payment_id.
   */
  async approveZellePayment(paymentId: string): Promise<void> {

    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    };
    if (session?.access_token) {
      headers["X-Customer-Auth"] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/validate-zelle-payment`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment_id: paymentId,
        status: "approved",
        admin_notes: "Aprovado manualmente via Painel Admin"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PaymentService] Manual Approval failed:", errorText);
      throw new Error(errorText || "Erro ao aprovar pagamento Zelle");
    }
  },

  /** Admin only — reject a Zelle payment */
  async rejectZellePayment(paymentId: string, reason: string): Promise<void> {

    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    };
    if (session?.access_token) {
      headers["X-Customer-Auth"] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/validate-zelle-payment`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment_id: paymentId,
        status: "rejected",
        admin_notes: reason || "Rejeitado manualmente via Painel Admin"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PaymentService] Manual Rejection failed:", errorText);
      throw new Error(errorText || "Erro ao rejeitar pagamento Zelle");
    }
  },

  /** Check the payment status of an order via Polling (Used in Checkout Success Page) */
  async checkOrderPaymentStatus(slug: string, timeoutMs: number = 20000): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    const userEmail = session?.user?.email;
    if (!userEmail) return false;

    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const { data } = await supabase
        .from("visa_orders")
        .select("payment_status")
        .eq("client_email", userEmail)
        .eq("product_slug", slug)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data && data.payment_status === "complete") {
        return true;
      }

      // Wait 3 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    return false; // Timeout
  },
};
