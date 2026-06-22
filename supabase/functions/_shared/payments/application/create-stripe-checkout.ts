import { calculateCardAmountWithFees, calculateUSDToPixFinalBRL } from "../domain/fees.ts";
import { getUsdToBrl } from "../exchange-rate.ts";
import { normalizeCheckoutInput } from "./normalize-checkout-input.ts";
import { resolveCheckoutPrice } from "./resolve-checkout-price.ts";
import { resolveStripeAccount } from "./resolve-stripe-account.ts";
import { createStripeCheckoutSession } from "../providers/strype.ts";
import type { Supabase } from "../../core/supabase.ts";

type CreateStripeCheckoutParams = {
  req: Request;
  body: Record<string, unknown>;
  supabase: Supabase;
};

export async function createStripeCheckout({
  req,
  body,
  supabase,
}: CreateStripeCheckoutParams) {
  const input = await normalizeCheckoutInput({
    req,
    body,
    supabase,
  });

  const price = await resolveCheckoutPrice({
    supabase,
    input,
  });

  let unitAmount: number;
  let currency = "usd";
  let paymentMethodTypes: string[] = ["card"];
  let appliedExchangeRate: number | null = null;

  if (input.paymentMethod === "pix") {
    currency = "brl";
    paymentMethodTypes = ["pix"];

    appliedExchangeRate = await getUsdToBrl();

    unitAmount = Math.round(
      calculateUSDToPixFinalBRL(price.finalSubtotalUSD, appliedExchangeRate) * 100,
    );
  } else {
    unitAmount = Math.round(
      calculateCardAmountWithFees(price.finalSubtotalUSD) * 100,
    );
  }

  const stripeAccount = await resolveStripeAccount({
    supabase,
    officeId: input.officeId,
    env: input.env,
  });

  const session = await createStripeCheckoutSession({
    stripeSecret: stripeAccount.stripeSecret,
    connectAccountId: stripeAccount.connectAccountId,
    paymentMethodTypes,
    currency,
    unitAmount,
    productName: price.mainPriceName,
    paymentMethod: input.paymentMethod,
    email: input.email,
    originUrl: input.originUrl,
    slug: input.slug,
    orderId: input.orderId,
    metadata: {
      user_id: input.targetUserId || "",
      service_slug: input.slug,
      email: input.email,
      fullName: input.fullName || "",
      phone: input.phone || "",
      dependents: input.dependents.toString(),
      env: input.env,
      paymentMethod: input.paymentMethod,
      origin_url: input.originUrl,
      project: "aplikei",
      action: input.action || "",
      serviceId: input.serviceId || "",
      proc_id: input.targetProcId || "",
      processId: input.targetProcId || "",
      order_id: input.orderId || "",
      office_id: input.officeId || "",
      stripe_connect_account: stripeAccount.connectAccountId || "",
      parent_service_slug: input.parentServiceSlug,
      coupon_code: input.couponCode || "",
      applied_coupon_id: price.appliedCouponId || "",
      original_subtotal: price.subtotalUSD.toString(),
      discount_amount: (price.subtotalUSD - price.finalSubtotalUSD).toString(),
      netAmountUSD: price.finalSubtotalUSD.toString(),
      exchange_rate: appliedExchangeRate ? appliedExchangeRate.toString() : "",
      charged_amount: (unitAmount / 100).toString(),
      charged_currency: currency,
    },
  });

  return {
    url: session.url,
  };
}
