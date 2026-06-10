import { supabase } from "@shared/lib/supabase";
import type { DiscountRules } from "../types";

export const DEFAULT_DISCOUNT_RULES: DiscountRules = {
  seller_max_pct: 0,
  seller_max_fixed: 0,
  seller_allow_percentage: false,
  seller_allow_fixed: false,
  seller_max_coupons: 0,
  seller_max_uses: 0,
  seller_min_purchase_usd: 0,
};

export async function fetchOfficeDiscountRules(officeId: string): Promise<DiscountRules> {
  const { data, error } = await supabase
    .from("offices")
    .select("discount_rules")
    .eq("id", officeId)
    .single();

  if (error) throw Error(error.message);
  const discountRules = data?.discount_rules as Partial<DiscountRules> | null | undefined;
  return discountRules && Object.keys(discountRules).length > 0
    ? { ...DEFAULT_DISCOUNT_RULES, ...discountRules }
    : DEFAULT_DISCOUNT_RULES;
}

export async function saveOfficeDiscountRules(officeId: string, rules: DiscountRules): Promise<void> {
  const { error } = await supabase
    .from("offices")
    .update({ discount_rules: rules })
    .eq("id", officeId);

  if (error) throw Error(error.message);
}
