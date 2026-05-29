import { supabase } from "@shared/lib/supabase";
import { notifyAdmin } from "@features/notifications/services/notify";
import { ZELLE_RECIPIENT } from "@shared/zelle";
import { toast } from "sonner";
import { getCanonicalSlug, getServiceBySlug, getServiceSlugs } from "@shared/data/services";
import { compressImageForUpload } from "@shared/utils/uploadCompression";

export type StripePaymentMethod = "card" | "pix";

export interface StripeCheckoutParams {
  slug: string;
  email: string;
  fullName: string;
  phone: string;
  dependents?: number;
  paymentMethod: StripePaymentMethod;
  proc_id?: string;
  order_id?: string;
  userId?: string;
  amount?: number;
  coupon_code?: string;
  action?: string;
  serviceId?: string;
  office_id?: string;
  seller_id?: string;
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
  order_id?: string;
  office_id?: string;
  serviceId?: string;
  seller_id?: string;
}

export interface CheckoutResult {
  url: string;
  orderId?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const N8N_BOT_CHECKPROOF = import.meta.env.VITE_N8N_BOT_CHECKPROOF as string;
const ZELLE_BUCKET = "zelle_comprovantes";

function assertOfficeIdForCheckout(officeId?: string): string {
  const normalized = String(officeId || "").trim();
  if (!normalized) {
    throw new Error("Checkout indisponível: é obrigatório ter um office vinculado para realizar compras.");
  }
  return normalized;
}

async function assertProductIsActiveForOffice(officeId: string, slug: string): Promise<void> {
  const allowedSlugs = getServiceSlugs(slug);
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id, slug")
    .in("slug", allowedSlugs);

  if (servicesError) {
    throw new Error("Não foi possível validar a disponibilidade do produto.");
  }

  if (!services || services.length === 0) {
    throw new Error("Produto indisponível para venda.");
  }

  const serviceIds = services.map((service) => service.id);
  const { data: prices, error: pricesError } = await supabase
    .from("user_service_prices")
    .select("is_active")
    .eq("office_id", officeId)
    .in("service_id", serviceIds);

  if (pricesError) {
    throw new Error("Não foi possível validar se o produto está ativo.");
  }

  const hasActiveProduct = (prices || []).some((row) => row.is_active === true || row.is_active === null);
  if (!hasActiveProduct) {
    throw new Error("Produto desativado para este office. Ative o produto antes de iniciar a venda.");
  }
}

async function extractFunctionErrorMessage(error: unknown): Promise<string> {
  const fallback =
    (error as { message?: string })?.message ||
    "Erro ao processar requisição.";

  const context = (error as { context?: unknown })?.context;
  if (!context) return fallback;

  // Supabase Functions errors usually carry a Response in `context`.
  if (typeof Response !== "undefined" && context instanceof Response) {
    try {
      const cloned = context.clone();
      const body = await cloned.json() as { error?: string; message?: string };
      return body?.error || body?.message || `${fallback} (HTTP ${context.status})`;
    } catch {
      return `${fallback} (HTTP ${context.status})`;
    }
  }

  const asObj = context as { message?: string };
  return asObj?.message || fallback;
}

async function resolveCheckoutSlugForUser(userId: string | undefined, slug: string): Promise<string> {
  // Keep the original selected product slug/canonical slug.
  // We no longer force "-reaplicacao" based on previous processes.
  return getCanonicalSlug(slug);
}


async function preRegisterOrder(params: {
  userId?: string;
  fullName: string;
  email: string;
  amount: number;
  slug: string;
  paymentMethod: string;
  dependents?: number;
  procId?: string;
  phone?: string;
  coupon_code?: string;
  office_id?: string;
  serviceId?: string;
  seller_id?: string;
}): Promise<string | undefined> {
  try {
    const isRecoveryChildSlug = (slug: string): boolean => {
      const lower = String(slug || "").toLowerCase();
      return (
        lower.includes("motion") ||
        lower.includes("rfe") ||
        lower.includes("recovery-") ||
        lower.startsWith("analise-") ||
        lower.startsWith("analysis-") ||
        lower.startsWith("apoio-")
      );
    };

    let parentServiceSlug: string | null = null;

    if (params.procId) {
      const { data: parentProcess } = await supabase
        .from("user_services")
        .select("service_slug")
        .eq("id", params.procId)
        .maybeSingle();
      parentServiceSlug = parentProcess?.service_slug ?? null;
    }

    const paymentMetadata = {
      dependents: params.dependents ?? 0,
      proc_id: params.procId,
      parent_process_id: params.procId,
      parent_service_slug: parentServiceSlug,
      phone: params.phone?.replace(/\D/g, ""),
      service_id: params.serviceId,
    };

    if (isRecoveryChildSlug(params.slug) && (!params.procId || !parentServiceSlug)) {
      console.warn("[paymentOps] Recovery checkout missing parent metadata", {
        slug: params.slug,
        procId: params.procId || null,
        parentServiceSlug,
      });
    }

    if (params.userId) {
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id, payment_metadata")
        .eq("user_id", params.userId)
        .eq("product_slug", params.slug)
        .eq("payment_status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingOrder) {
        await supabase
          .from("orders")
          .update({
            user_id: params.userId,
            client_name: params.fullName,
            client_email: params.email,
            total_price_usd: params.amount,
            payment_method: params.paymentMethod,
            coupon_code: params.coupon_code || null,
            office_id: params.office_id || null,
            seller_id: params.seller_id || null,
            payment_metadata: {
              ...(existingOrder.payment_metadata || {}),
              ...paymentMetadata,
            },
          })
          .eq("id", existingOrder.id);
        return existingOrder.id;
      }
    }

    const { data: orderData } = await supabase
      .from("orders")
      .insert({
        user_id: params.userId || null,
        client_name: params.fullName,
        client_email: params.email,
        total_price_usd: params.amount,
        product_slug: params.slug,
        payment_method: params.paymentMethod,
        payment_status: "pending",
        coupon_code: params.coupon_code || null,
        office_id: params.office_id || null,
        seller_id: params.seller_id || null,
        payment_metadata: paymentMetadata,
      })
      .select("id")
      .single();

    return orderData?.id;
  } catch (e) {
    console.error("[paymentOps] preRegisterOrder failed:", e);
    return undefined;
  }
}

export async function createStripeCheckout(
  params: StripeCheckoutParams,
): Promise<CheckoutResult> {
  const officeId = assertOfficeIdForCheckout(params.office_id);
  const resolvedSlug = await resolveCheckoutSlugForUser(params.userId, params.slug);
  await assertProductIsActiveForOffice(officeId, resolvedSlug);

  const orderId = await preRegisterOrder({
    userId: params.userId,
    fullName: params.fullName,
    email: params.email,
    amount: params.amount || 0,
    slug: resolvedSlug,
    paymentMethod: params.paymentMethod === "card" ? "stripe_card" : "stripe_pix",
    dependents: params.dependents,
    procId: params.proc_id,
    phone: params.phone,
    coupon_code: params.coupon_code,
    office_id: officeId,
    seller_id: params.seller_id,
  });

  const { data, error } = await supabase.functions.invoke("stripe-checkout", {
    body: {
      order_id: orderId,
      userId: params.userId,
      slug: resolvedSlug,
      email: params.email,
      fullName: params.fullName,
      amount: params.amount,
      dependents: params.dependents,
      paymentMethod: params.paymentMethod,
      coupon_code: params.coupon_code,
      origin_url: window.location.origin,
      action: params.action || "",
      serviceId: params.serviceId || "",
      proc_id: params.proc_id,
      office_id: officeId,
      seller_id: params.seller_id,
    },
  });

  if (error) {
    const detail = await extractFunctionErrorMessage(error);
    throw new Error(detail || "Erro ao processar Stripe Checkout");
  }

  if (!data?.url) throw new Error("URL de checkout não retornada.");
  return { url: data.url, orderId };
}

export async function createParcelowCheckout(
  params: ParcelowCheckoutParams,
): Promise<CheckoutResult> {
  const officeId = assertOfficeIdForCheckout(params.office_id);
  const resolvedSlug = await resolveCheckoutSlugForUser(params.userId, params.slug);
  await assertProductIsActiveForOffice(officeId, resolvedSlug);

  const orderId = await preRegisterOrder({
    userId: params.userId,
    fullName: params.fullName,
    email: params.email,
    amount: params.amount ?? 0,
    slug: resolvedSlug,
    paymentMethod: "parcelow",
    dependents: params.dependents,
    procId: params.proc_id,
    phone: params.phone,
    coupon_code: params.coupon_code,
    office_id: officeId,
    serviceId: params.serviceId,
    seller_id: params.seller_id,
  });

  const { data, error } = await supabase.functions.invoke("create-parcelow-checkout", {
    body: {
      order_id: orderId,
      userId: params.userId,
      slug: resolvedSlug,
      email: params.email,
      fullName: params.fullName,
      amount: params.amount,
      dependents: params.dependents,
      cpf: params.cpf,
      coupon_code: params.coupon_code,
      origin_url: window.location.origin,
      proc_id: params.proc_id,
      office_id: officeId,
      seller_id: params.seller_id,
    },
  });

  if (error) {
    const detail = await extractFunctionErrorMessage(error);
    throw new Error(detail || "Erro ao processar Parcelow Checkout");
  }

  if (!data?.checkoutUrl) throw new Error("URL de checkout Parcelow não retornada.");
  return { url: data.checkoutUrl, orderId };
}

export async function uploadZelleProof(file: File, slug: string): Promise<string> {
  const fileToUpload = await compressImageForUpload(file);
  const ext = fileToUpload.name.split(".").pop() ?? "jpg";
  const path = `${slug}/${Date.now()}_proof.${ext}`;

  const { error } = await supabase.storage
    .from(ZELLE_BUCKET)
    .upload(path, fileToUpload, { contentType: fileToUpload.type, upsert: false });

  if (error) throw new Error(`Erro ao enviar comprovante: ${error.message}`);
  return path;
}

export async function createZellePayment(params: {
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
  office_id?: string;
  serviceId?: string;
  seller_id?: string;
}): Promise<{ paymentId: string; autoApproved: boolean }> {
  const officeId = assertOfficeIdForCheckout(params.office_id);
  const resolvedSlug = await resolveCheckoutSlugForUser(params.userId ?? undefined, params.slug);
  await assertProductIsActiveForOffice(officeId, resolvedSlug);

  const orderId = await preRegisterOrder({
    userId: params.userId || undefined,
    fullName: params.guestName,
    email: params.guestEmail,
    amount: params.expectedAmount,
    slug: resolvedSlug,
    paymentMethod: "zelle",
    dependents: params.dependents,
    procId: params.proc_id,
    phone: params.phone,
    coupon_code: params.coupon_code,
    office_id: officeId,
    serviceId: params.serviceId,
    seller_id: params.seller_id,
  });

  const { data, error } = await supabase.functions.invoke("create-zelle-payment", {
    body: {
      amount: params.amount,
      payment_date: params.paymentDate,
      proof_path: params.proofPath,
      service_slug: resolvedSlug,
      visa_order_id: orderId,
      guest_email: params.guestEmail,
      guest_name: params.guestName,
      user_id: params.userId ?? null,
      proc_id: params.proc_id,
      coupon_code: params.coupon_code || undefined,
      dependents: params.dependents,
      office_id: officeId,
      service_id: params.serviceId,
      seller_id: params.seller_id,
      recipient_name: ZELLE_RECIPIENT.name,
      recipient_email: ZELLE_RECIPIENT.email,
      admin_notes: `Serviço: ${params.serviceName} | Valor esperado: $${params.expectedAmount.toFixed(2)} | Pago: $${params.amount.toFixed(2)}${params.dependents ? ` | Dependentes: ${params.dependents}` : ""}`,
    },
  });

  if (error) {
    throw new Error(error.message || "Erro ao processar pagamento Zelle");
  }

  const paymentId = data.payment_id;
  let autoApproved: boolean;
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
    service_slug: resolvedSlug,
    timestamp: new Date().toISOString(),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const botResponse = await fetch(N8N_BOT_CHECKPROOF, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(botPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const botData = await botResponse.json().catch(() => ({ response: "error" }));

    if (botData.response === "approved payment") {
      autoApproved = true;
    } else {
      autoApproved = false;
      await notifyAdmin({
        title: "Zelle: automatic verification failed",
        body: `Payment ${paymentId} ($${params.amount}) did not pass automatic bot verification. Reason: ${botData.response}. Manual review is required.`,
        userId: params.userId || undefined,
        metadata: { payment_id: paymentId, bot_response: botData.response },
      });
      toast.info(
        "O comprovante não passou na verificação automática inicial e precisará ser analisado manualmente.",
        { duration: 6000 },
      );
    }
  } catch (botErr: unknown) {
    autoApproved = false;
    console.warn("[paymentOps] Bot timeout:", (botErr as Error).message);
    await notifyAdmin({
      title: "Technical error: Zelle bot offline",
      body: `Could not contact verification bot for payment ${paymentId}. System will proceed with manual review.`,
      userId: params.userId || undefined,
    });
    toast.info(
      "Não foi possível verificar seu comprovante agora. Nossa equipe fará a conferência manual em instantes.",
    );
  }

  return { paymentId, autoApproved };
}

export async function approveZellePayment(paymentId: string): Promise<void> {
  const { error } = await supabase.functions.invoke("validate-zelle-payment", {
    body: {
      payment_id: paymentId,
      status: "approved",
      admin_notes: "Aprovado manualmente via Painel Admin",
    },
  });
  if (error) throw new Error(error.message || "Erro ao aprovar pagamento Zelle");
}

export async function rejectZellePayment(paymentId: string, reason: string): Promise<void> {
  const { error } = await supabase.functions.invoke("validate-zelle-payment", {
    body: {
      payment_id: paymentId,
      status: "rejected",
      admin_notes: reason || "Rejeitado manualmente via Painel Admin",
    },
  });
  if (error) throw new Error(error.message || "Erro ao rejeitar pagamento Zelle");
}

export async function verifyStripeSession(
  sessionId: string,
): Promise<{ success: boolean; orderId?: string }> {
  const { data, error } = await supabase.functions.invoke("verify-stripe-session", {
    body: { session_id: sessionId },
  });
  if (error) throw new Error(error.message);
  return data as { success: boolean; orderId?: string };
}

export async function checkOrderPaymentStatus(
  slug: string,
  timeoutMs: number = 20000,
  orderId?: string | null,
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userEmail = user?.email;
  if (!userEmail && !orderId) return false;

  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    let query = supabase.from("orders").select("payment_status");

    if (orderId) {
      query = query.eq("id", orderId);
    } else {
      query = query.eq("client_email", userEmail!).eq("product_slug", slug);
    }

    const { data } = await query
      .in("payment_status", ["paid", "approved", "complete", "completed", "succeeded"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) return true;

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return false;
}
