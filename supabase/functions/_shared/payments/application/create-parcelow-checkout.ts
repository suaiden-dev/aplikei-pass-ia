import type { Supabase } from "../../core/supabase.ts";
import { getEnv } from "../../core/env.ts";
import { applyCoupon } from "../domain/fees.ts";
import { getSlugCandidates } from "../domain/catalog.ts";
import { resolveCatalogPricing } from "./resolve-catalog-pricing.ts";
import {
  cleanDocumentNumber,
  createParcelowOrder,
  resolveParcelowEnvironment,
} from "../providers/parcelow.ts";
import { resolveUseAplicei, resolveParcelowConfig } from "../office-payment.ts";
import { isRecoveryChild } from "../../domain/catalog/slugs.ts";
import { createLogger } from "../../core/logger.ts";

const log = createLogger("create-parcelow-checkout");

export type CreateParcelowCheckoutInput = {
  req: Request;
  supabase: Supabase;
  slug: string;
  email: string;
  fullName: string;
  phone?: string;
  dependents?: number;
  cpf?: string;
  payerInfo?: { name?: string; email?: string; cpf?: string; phone?: string } | null;
  paymentMethod?: string;
  origin_url?: string;
  action?: string;
  serviceId?: string;
  processId?: string;
  proc_id?: string;
  order_id: string;
  parent_service_slug?: string;
  coupon_code?: string;
  office_id?: string;
};

export type CreateParcelowCheckoutResult = {
  checkoutUrl: string;
  orderId: string;
};

export async function createParcelowCheckout(
  input: CreateParcelowCheckoutInput,
): Promise<CreateParcelowCheckoutResult> {
  const {
    req, supabase, email, fullName, phone, dependents = 0,
    cpf, payerInfo, paymentMethod, origin_url, action, serviceId,
    processId, proc_id, order_id, parent_service_slug, coupon_code, office_id,
  } = input;

  const rawSlug = String(input.slug || "").toLowerCase();
  const slugCandidates = getSlugCandidates(rawSlug);

  if (!rawSlug || !email || (!cpf && !payerInfo?.cpf)) {
    throw new Error("Parâmetros obrigatórios ausentes (slug, email ou CPF do pagador).");
  }

  const pricing = await resolveCatalogPricing({ supabase, slug: rawSlug, slugCandidates, officeId: office_id, serviceId });
  const subtotalUSD = pricing.basePriceUSD + (dependents * pricing.dependentPriceUSD);

  let finalSubtotalUSD = subtotalUSD;
  let appliedCouponId: string | null = null;

  if (coupon_code) {
    const { data: couponData, error: couponError } = await supabase.rpc("validate_coupon", {
      p_code: coupon_code.toUpperCase().trim(),
      p_slug: rawSlug,
    });
    if (couponError) {
      log.error("coupon validation failed", couponError, { coupon_code });
    } else if (couponData?.valid && subtotalUSD >= (couponData.min_purchase_usd || 0)) {
      finalSubtotalUSD = applyCoupon(subtotalUSD, couponData).finalAmount;
      appliedCouponId = couponData.coupon_id;
      log.info("coupon applied", { coupon_code, from: subtotalUSD, to: finalSubtotalUSD });
    }
  }

  const { name: parcelowEnvironment, apiUrl: parcelowApiUrl } = resolveParcelowEnvironment(req, origin_url);
  const envSuffix = parcelowEnvironment === "staging" ? "STAGING" : "PRODUCTION";

  let rawId: string | undefined = getEnv(`PARCELOW_CLIENT_ID_${envSuffix}`);
  let clientSecret: string | undefined = getEnv(`PARCELOW_CLIENT_SECRET_${envSuffix}`);

  if (office_id) {
    const useAplicei = await resolveUseAplicei(supabase, office_id);
    if (!useAplicei) {
      const officeParcelow = await resolveParcelowConfig(supabase, office_id);
      if (officeParcelow.merchant_id && officeParcelow.api_key) {
        rawId = officeParcelow.merchant_id;
        clientSecret = officeParcelow.api_key;
        log.info("using office credentials", { office_id });
      }
    }
  }

  let clientIdToUse: number | string = rawId || "";
  const parsedId = parseInt(rawId || "");
  if (!isNaN(parsedId) && parsedId.toString() === rawId?.trim()) clientIdToUse = parsedId;

  log.info("init", { env: parcelowEnvironment, clientId: clientIdToUse });

  const finalPayerName = payerInfo?.name || fullName;
  const finalPayerEmail = payerInfo?.email || email;
  const finalPayerCpf = cleanDocumentNumber(payerInfo?.cpf || cpf || "");
  const finalPayerPhone = cleanDocumentNumber(payerInfo?.phone || phone || "");

  const parcelowReference = `APK_${order_id}`;

  const { data: existingOrder } = await supabase
    .from("orders")
    .select("payment_metadata")
    .eq("id", order_id)
    .maybeSingle();

  const existingMetadata = (existingOrder?.payment_metadata as Record<string, unknown>) || {};
  const targetProcId = proc_id || processId || (existingMetadata.proc_id as string) || (existingMetadata.parent_process_id as string) || "";
  const parentServiceSlug = parent_service_slug || (existingMetadata.parent_service_slug as string) || "";

  if (isRecoveryChild(rawSlug) && (!targetProcId || !parentServiceSlug)) {
    log.warn("recovery checkout without full parent metadata", { slug: rawSlug, targetProcId: targetProcId || null, parentServiceSlug: parentServiceSlug || null, order_id });
  }

  const { error: orderError } = await supabase
    .from("orders")
    .update({
      order_number: parcelowReference,
      total_price_usd: finalSubtotalUSD,
      payment_method: `parcelow_${paymentMethod || "credit_card"}`,
      office_id: office_id || null,
      payment_metadata: {
        ...existingMetadata,
        dependents,
        phone,
        office_id: office_id || "",
        payerInfo: payerInfo || null,
        parcelow_cpf: finalPayerCpf,
        parcelow_phone: finalPayerPhone,
        action: action || "",
        serviceId: serviceId || "",
        proc_id: targetProcId,
        parent_process_id: targetProcId,
        processId: targetProcId,
        parent_service_slug: parentServiceSlug,
        coupon_code: coupon_code || "",
        applied_coupon_id: appliedCouponId || "",
        original_subtotal: subtotalUSD.toString(),
        discount_amount: (subtotalUSD - finalSubtotalUSD).toString(),
        product_type: rawSlug === "troca-status" || rawSlug === "visa-cos"
          ? "COS"
          : (rawSlug === "extensao-status" || rawSlug === "visa-eos" ? "EOS" : "B1B2"),
      },
    })
    .eq("id", order_id);

  if (orderError) {
    log.error("order update failed", orderError, { order_id });
    throw new Error(`Falha ao atualizar ordem: ${orderError.message || "Erro desconhecido"}`);
  }

  const amountInCents = Math.round(finalSubtotalUSD * 100);
  const parcelowPayload = {
    reference: parcelowReference,
    client: { cpf: finalPayerCpf, name: finalPayerName, email: finalPayerEmail, phone: finalPayerPhone || undefined },
    items: [{
      reference: rawSlug,
      description: `Aplikei Checkout - ${pricing.mainPriceName}${coupon_code ? " (Com Cupom)" : ""}`,
      quantity: 1,
      amount: amountInCents,
    }],
    redirect: {
      success: `${origin_url}/checkout-success?s=s&pid=${order_id}&ce=${btoa(email)}`,
      failed: `${origin_url}/servicos/${rawSlug}`,
    },
  };

  let checkoutUrl = `${origin_url}/checkout-mock/parcelow?ref=${order_id}`;
  let parcelowGenOrderId = `par_${crypto.randomUUID().substring(0, 16)}`;

  if (clientIdToUse && clientSecret) {
    const orderData = await createParcelowOrder({ apiUrl: parcelowApiUrl, clientId: clientIdToUse, clientSecret, payload: parcelowPayload });
    checkoutUrl = orderData.data?.url_checkout || checkoutUrl;
    parcelowGenOrderId = orderData.data?.order_id?.toString() || parcelowGenOrderId;
  }

  await supabase.from("orders").update({ parcelow_order_id: parcelowGenOrderId }).eq("id", order_id);

  return { checkoutUrl, orderId: order_id };
}
