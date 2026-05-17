import { supabase } from "@shared/lib/supabase";

export type DiscountType = "percentage" | "fixed";

export interface CouponValidation {
  valid: boolean;
  error?: "INVALID_OR_EXPIRED" | "NOT_APPLICABLE";
  coupon_id?: string;
  discount_type?: DiscountType;
  discount_value?: number;
  min_purchase_usd?: number;
}

export function formatCouponCode(input: string): string {
  return input.toUpperCase().trim().replace(/\s+/g, "");
}

export async function validateCoupon(code: string, slug?: string): Promise<CouponValidation> {
  if (!code.trim()) return { valid: false, error: "INVALID_OR_EXPIRED" };

  const { data, error } = await supabase.rpc("validate_coupon", {
    p_code: formatCouponCode(code),
    p_slug: slug ?? null,
  });

  if (error) {
    console.error("[coupon] Validation error:", error);
    return { valid: false, error: "INVALID_OR_EXPIRED" };
  }

  return data as CouponValidation;
}

export function calculateDiscount(
  subtotalUSD: number,
  discountType: DiscountType,
  discountValue: number,
): number {
  if (discountType === "percentage") {
    return Math.min(subtotalUSD, subtotalUSD * (discountValue / 100));
  }
  return Math.min(subtotalUSD, discountValue);
}
