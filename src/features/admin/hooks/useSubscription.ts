import { useQuery } from "@tanstack/react-query";
import { supabase } from "@shared/lib/supabase";
import { useAuth } from "@shared/hooks/useAuth";
import { adminQueryKeys } from "@features/admin/lib/queryKeys";

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing" | "none";

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  subscriptionId: string | null;
  planId: string | null;
  planVersion: number;
  billingModel: string;
  planName: string;
  planType: "FIXED" | "PERCENTAGE" | "HYBRID";
  fixedFee: number;
  percentageFee: number;
  minFeePerTransactionUsd: number | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  currentPeriodEnd: string | null;
  loading: boolean;
}

interface SubscriptionViewRow {
  subscription_id: string;
  plan_id: string;
  plan_version: number | null;
  billing_model: string | null;
  status: string;
  plan_name: string;
  plan_type: string;
  fixed_fee: number | null;
  percentage_fee: number | null;
  min_fee_per_transaction_usd: number | null;
  effective_from: string | null;
  effective_to: string | null;
  current_period_end: string | null;
}

export function useSubscription() {
  const { user } = useAuth();

  const { data: resolvedOfficeId = null, isLoading: isLoadingOffice } = useQuery({
    queryKey: adminQueryKeys.userOfficeId(user?.id, user?.officeId ?? undefined),
    queryFn: async () => {
      if (user?.officeId) return user.officeId;
      const { data } = await supabase
        .from("offices")
        .select("id")
        .eq("owner_id", user!.id)
        .maybeSingle();
      return data?.id ?? null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: subData, isLoading: isLoadingSub, refetch } = useQuery({
    queryKey: adminQueryKeys.officeSubscription(resolvedOfficeId ?? undefined),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_office_current_subscription")
        .select("subscription_id, office_id, status, plan_id, plan_version, billing_model, plan_name, plan_type, fixed_fee, percentage_fee, min_fee_per_transaction_usd, effective_from, effective_to, current_period_end")
        .eq("office_id", resolvedOfficeId!)
        .maybeSingle();
      if (error) throw error;
      return data as SubscriptionViewRow | null;
    },
    enabled: !!resolvedOfficeId,
  });

  const refreshSubscription = async () => { await refetch(); };

  const status = (subData?.status ?? "none") as SubscriptionStatus;
  const isActive = status === "active" || status === "trialing";
  const isStaff = user?.role === "admin_lawyer" || user?.role === "manager" || user?.role === "seller";

  return {
    status,
    subscriptionId: subData?.subscription_id ?? null,
    planId: subData?.plan_id ?? null,
    planVersion: subData?.plan_version ?? 1,
    billingModel: subData?.billing_model ?? "prepaid",
    planName: subData?.plan_name ?? "",
    planType: (subData?.plan_type ?? "FIXED") as "FIXED" | "PERCENTAGE" | "HYBRID",
    fixedFee: subData?.fixed_fee ?? 0,
    percentageFee: subData?.percentage_fee ?? 0,
    minFeePerTransactionUsd: subData?.min_fee_per_transaction_usd ?? null,
    effectiveFrom: subData?.effective_from ?? null,
    effectiveTo: subData?.effective_to ?? null,
    currentPeriodEnd: subData?.current_period_end ?? null,
    loading: isLoadingOffice || (!!resolvedOfficeId && isLoadingSub),
    officeId: resolvedOfficeId,
    isActive,
    isRestricted: isStaff && !isActive,
    isStaff,
    refreshSubscription,
  };
}
