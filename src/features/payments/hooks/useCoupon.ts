import { useState } from "react";
import { validateCoupon, type CouponValidation } from "../lib/coupon";

export function useCoupon() {
  const [input, setInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [applied, setApplied] = useState<CouponValidation | null>(null);

  const apply = async (slug?: string): Promise<CouponValidation> => {
    if (!input.trim()) return { valid: false, error: "INVALID_OR_EXPIRED" };
    setIsValidating(true);
    try {
      const result = await validateCoupon(input, slug);
      if (result.valid) setApplied(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const remove = () => {
    setApplied(null);
    setInput("");
  };

  return { input, setInput, isValidating, applied, apply, remove };
}
