export type CouponValidation = {
  valid: boolean;
  discount_type?: "percentage" | "fixed";
  discount_value?: number;
  min_purchase_usd?: number;
  error?: string;
};

export async function validateCoupon(_code: string, _slug: string): Promise<CouponValidation> {
  // Stub: always invalid until coupon service is implemented
  return { valid: false, error: "INVALID" };
}

export function calculateDiscount(subtotal: number, type: "percentage" | "fixed", value: number): number {
  if (type === "percentage") {
    return subtotal * (value / 100);
  }
  return value;
}
