import {
  applyCoupon,
  calculateSubtotal,
  CouponData,
} from "../domain/fees.ts";
import { resolveCatalogPricing } from "./resolve-catalog-pricing.ts";
import { NormalizedCheckoutInput } from "./normalize-checkout-input.ts";
import { createLogger } from "../../core/logger.ts";
import type { Supabase } from "../../core/supabase.ts";

const log = createLogger("resolve-checkout-price");

type ResolveCheckoutPriceParams = {
  supabase: Supabase;
  input: NormalizedCheckoutInput;
};

export type ResolvedCheckoutPrice = {
  basePriceUSD: number;
  dependentPriceUSD: number;
  subtotalUSD: number;
  finalSubtotalUSD: number;
  mainPriceName: string;
  appliedCouponId: string | null;
};

const DYNAMIC_AMOUNT_SLUGS = [
  "rfe-support",
  "motion-support",
  "suporte-rfe-eos",
  "suporte-rfe-cos",
  "recovery-eos",
  "recovery-cos",
  "analise-especialista-cos",
  "apoio-rfe-motion-inicio",
  "proposta-rfe-motion",
];

export async function resolveCheckoutPrice({
  supabase,
  input,
}: ResolveCheckoutPriceParams): Promise<ResolvedCheckoutPrice> {
  const pricing = await resolveCatalogPricing({
    supabase,
    slug: input.slug,
    officeId: input.officeId,
    serviceId: input.serviceId,
  });

  let basePriceUSD = pricing.basePriceUSD;
  const dependentPriceUSD = pricing.dependentPriceUSD;
  const mainPriceName = pricing.mainPriceName;

  basePriceUSD = await resolveDynamicBasePrice({
    supabase,
    input,
    defaultBasePriceUSD: basePriceUSD,
  });

  const subtotalUSD = calculateSubtotal(basePriceUSD, input.dependents, dependentPriceUSD)

  let finalSubtotalUSD = subtotalUSD;
  let appliedCouponId: string | null = null;

  if (input.couponCode) {
    const result = await applyCheckoutCoupon({
      supabase,
      couponCode: input.couponCode,
      slug: input.slug,
      subtotalUSD,
    });

    finalSubtotalUSD = result.finalSubtotalUSD;
    appliedCouponId = result.appliedCouponId;
  } else if (input.discountPct > 0) {
    finalSubtotalUSD = subtotalUSD * (1 - input.discountPct / 100);
  }

  return {
    basePriceUSD,
    dependentPriceUSD,
    subtotalUSD,
    finalSubtotalUSD,
    mainPriceName,
    appliedCouponId,
  };
}

async function resolveDynamicBasePrice({
  supabase,
  input,
  defaultBasePriceUSD,
}: {
  supabase: Supabase;
  input: NormalizedCheckoutInput;
  defaultBasePriceUSD: number;
}) {
  if (!input.targetProcId) {
    if (input.requestAmount && DYNAMIC_AMOUNT_SLUGS.includes(input.slug)) {
      return input.requestAmount;
    }

    return defaultBasePriceUSD;
  }

  const { data: procData, error } = await supabase
    .from("user_services")
    .select("step_data")
    .eq("id", input.targetProcId)
    .single();

  if (error) {
    log.warn("process not found for dynamic price", { processId: input.targetProcId, error: error.message });
  }

  const rfeAmount = procData?.step_data?.rfe_proposal_amount;
  const motionAmount =
    procData?.step_data?.motion_amount ??
    procData?.step_data?.motion_proposal_amount;

  const parsedAmount = Number(rfeAmount ?? motionAmount);

  if (Number.isFinite(parsedAmount) && parsedAmount > 0) {
    return parsedAmount;
  }

  if (input.requestAmount && DYNAMIC_AMOUNT_SLUGS.includes(input.slug)) {
    return input.requestAmount;
  }

  return defaultBasePriceUSD;
}

async function applyCheckoutCoupon({
  supabase,
  couponCode,
  slug,
  subtotalUSD,
}: {
  supabase: Supabase;
  couponCode: string;
  slug: string;
  subtotalUSD: number;
}) {
  const { data: couponData, error: couponError } = await supabase.rpc(
    "validate_coupon",
    {
      p_code: couponCode.toUpperCase().trim(),
      p_slug: slug,
    },
  );

  if (couponError || !couponData?.valid) {
    return {
      finalSubtotalUSD: subtotalUSD,
      appliedCouponId: null,
    };
  }

  const { finalAmount } = applyCoupon(
    subtotalUSD,
    couponData as CouponData,
  );

  return {
    finalSubtotalUSD: finalAmount,
    appliedCouponId: couponData.coupon_id ?? null,
  };
}
