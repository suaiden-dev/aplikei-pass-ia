import { useEffect, useState } from "react";
import { supabase } from "@shared/lib/supabase";
import { useAuth } from "@shared/hooks/useAuth";

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing" | "none";

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  planName: string;
  planType: "FIXED" | "PERCENTAGE" | "HYBRID";
  fixedFee: number;
  percentageFee: number;
  currentPeriodEnd: string | null;
  loading: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [resolvedOfficeId, setResolvedOfficeId] = useState<string | null>(user?.officeId ?? null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    status: "none",
    planName: "",
    planType: "FIXED",
    fixedFee: 0,
    percentageFee: 0,
    currentPeriodEnd: null,
    loading: true,
  });

  useEffect(() => {
    if (user?.officeId) {
      setResolvedOfficeId(user.officeId);
      return;
    }

    if (!user?.id) {
      setResolvedOfficeId(null);
      return;
    }

    supabase
      .from("offices")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setResolvedOfficeId(data?.id ?? null);
      });
  }, [user?.id, user?.officeId]);

  useEffect(() => {
    async function fetchSubscription() {
      if (!resolvedOfficeId) {
        setSubscription(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const { data, error } = await supabase
          .from("v_office_current_subscription")
          .select("*")
          .eq("office_id", resolvedOfficeId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSubscription({
            status: data.status as SubscriptionStatus,
            planName: data.plan_name,
            planType: data.plan_type,
            fixedFee: data.fixed_fee || 0,
            percentageFee: data.percentage_fee || 0,
            currentPeriodEnd: data.current_period_end,
            loading: false,
          });
        } else {
          setSubscription(prev => ({ ...prev, loading: false, status: "none" }));
        }
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setSubscription(prev => ({ ...prev, loading: false }));
      }
    }

    fetchSubscription();
  }, [resolvedOfficeId]);

  const isActive = subscription.status === "active" || subscription.status === "trialing";
  
  // Roles that should be restricted if subscription is inactive
  const isStaff = user?.role === "admin_lawyer" || user?.role === "manager" || user?.role === "seller";

  // Features are restricted if the user is staff and the subscription is not active
  const isRestricted = isStaff && !isActive;

  return {
    ...subscription,
    officeId: resolvedOfficeId,
    isActive,
    isRestricted,
    isStaff,
  };
}
