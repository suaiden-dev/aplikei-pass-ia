/**
 * Payment amount calculations shared by edge functions.
 */
export const CARD_FIXED_FEE = 0.30;
export const CARD_PERCENTAGE_FEE = 0.039;
export const PIX_PROCESSING_FEE = 0.018;
export const IOF_RATE = 0.035;

export interface CouponData {
  valid: boolean;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase_usd?: number;
  coupon_id?: string;
}

export function calculateCardAmountWithFees(netAmount: number): number {
  if (netAmount <= 0) return 0;
  return (netAmount + CARD_FIXED_FEE) / (1 - CARD_PERCENTAGE_FEE);
}

export function calculateUSDToPixFinalBRL(
  usdNetAmount: number,
  exchangeRate: number,
): number {
  if (usdNetAmount <= 0) return 0;
  const netBrl = usdNetAmount * exchangeRate;
  const brlWithFees = netBrl / (1 - PIX_PROCESSING_FEE);
  return brlWithFees * (1 + IOF_RATE);
}

export function applyCoupon(
  subtotal: number,
  coupon: CouponData | null,
): { finalAmount: number; discountAmount: number } {
  if (!coupon || !coupon.valid) {
    return { finalAmount: subtotal, discountAmount: 0 };
  }

  const minPurchase = coupon.min_purchase_usd || 0;
  if (subtotal < minPurchase) {
    return { finalAmount: subtotal, discountAmount: 0 };
  }

  const rawAmount = coupon.discount_type === "percentage"
    ? subtotal * (1 - coupon.discount_value / 100)
    : subtotal - coupon.discount_value;
  const finalAmount = Math.max(0, rawAmount);

  return {
    finalAmount,
    discountAmount: subtotal - finalAmount,
  };
}

export function calculateSubtotal(
  basePrice: number,
  dependents: number,
  dependentPrice: number,
): number {
  return basePrice + dependents * dependentPrice;
}
