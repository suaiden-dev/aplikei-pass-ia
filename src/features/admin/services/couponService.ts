export type CouponValidation = {
  valid: boolean;
  discount_type?: "percentage" | "fixed";
  discount_value?: number;
  min_purchase_usd?: number;
  error?: string;
};

export async function validateCoupon(code: string, slug: string): Promise<CouponValidation> {
  // Stub: Always invalid for now
  console.log("Validating coupon:", code, "for service:", slug);
  return { valid: false, error: "INVALID" };
}

export function calculateDiscount(subtotal: number, type: "percentage" | "fixed", value: number): number {
  if (type === "percentage") {
    return subtotal * (value / 100);
  }
  return value;
}
