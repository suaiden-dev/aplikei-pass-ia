import { supabase } from "@shared/lib/supabase";
import type { DiscountRules } from "../types";

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses: number | null;
  uses_count: number;
  applicable_slugs: string[] | null;
  min_purchase_usd: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface ServiceOption {
  slug: string;
  name: string;
}

export interface CreateCouponInput {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses: number | null;
  applicable_slugs: string[] | null;
  min_purchase_usd: number;
  expires_at: string;
  is_active: boolean;
  created_by: string | null;
  office_id: string | null;
}

export async function fetchUserOfficeId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("user_accounts")
    .select("office_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw Error(error.message);
  return data?.office_id ?? null;
}

export async function listDiscountCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from("discount_coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw Error(error.message);
  return (data ?? []) as Coupon[];
}

export async function listCouponServiceOptions(isSeller: boolean): Promise<ServiceOption[]> {
  let query = supabase
    .from("services")
    .select("slug, name, category")
    .eq("is_active", true)
    .order("name");

  if (isSeller) query = query.eq("category", "main_visa");

  const { data, error } = await query;
  if (error) throw Error(error.message);
  return (data ?? []) as ServiceOption[];
}

export async function fetchOfficeDiscountRulesForCoupons(
  officeId: string,
  fallback: DiscountRules,
): Promise<DiscountRules> {
  const { data, error } = await supabase
    .from("offices")
    .select("discount_rules")
    .eq("id", officeId)
    .single();

  if (error) throw Error(error.message);
  const rules = data?.discount_rules as Partial<DiscountRules> | null | undefined;
  return rules && Object.keys(rules).length > 0 ? { ...fallback, ...rules } : fallback;
}

export async function toggleDiscountCoupon(couponId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from("discount_coupons")
    .update({ is_active: isActive })
    .eq("id", couponId);

  if (error) throw Error(error.message);
}

export async function createDiscountCoupon(input: CreateCouponInput): Promise<void> {
  const { error } = await supabase.from("discount_coupons").insert(input);
  if (error) throw Error(error.message);
}
