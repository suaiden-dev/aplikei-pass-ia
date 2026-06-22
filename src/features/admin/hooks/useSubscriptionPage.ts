import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSubscription } from "@features/admin/hooks/useSubscription";
import { useLocale, useT } from "@app/app/i18n";
import { adminQueryKeys } from "@features/admin/lib/queryKeys";
import {
  activateOfficeSubscription,
  cancelOfficeSubscription,
  fetchActiveSubscriptionPlansWithRules,
  fetchBillingHistory as fetchOfficeBillingHistory,
  fetchOfficeName,
  normalizePlanName,
  type DBPlan,
} from "@features/admin/services/subscriptionPageService";
import { notifyMaster } from "@features/notifications/services/notify";

export function useSubscriptionPage() {
  const t = useT("admin");
  const { lang } = useLocale();
  const [searchParams] = useSearchParams();
  const urlPlanId = searchParams.get("planId");
  const queryClient = useQueryClient();

  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [planToContract, setPlanToContract] = useState<DBPlan | null>(null);

  const {
    status, subscriptionId, planId, planVersion, billingModel, planName, planType, fixedFee, percentageFee, minFeePerTransactionUsd,
    effectiveFrom, effectiveTo, currentPeriodEnd, loading: subLoading, isActive, officeId,
  } = useSubscription();

  const { data: officeName = "" } = useQuery({
    queryKey: adminQueryKeys.officeName(officeId ?? undefined),
    queryFn: () => fetchOfficeName(officeId!),
    enabled: !!officeId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: dbPlans = [], isLoading: loadingPlans } = useQuery({
    queryKey: adminQueryKeys.subscriptionPlans(),
    queryFn: fetchActiveSubscriptionPlansWithRules,
    staleTime: 5 * 60 * 1000,
  });

  const { data: billingHistory = [] } = useQuery({
    queryKey: adminQueryKeys.billingHistory(officeId ?? undefined),
    queryFn: () => fetchOfficeBillingHistory(officeId!, t.subscription.noPlan),
    enabled: !!officeId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!officeId) throw new Error("Your user has no linked office to cancel subscription.");
      return cancelOfficeSubscription(officeId);
    },
    onSuccess: async () => {
      await notifyMaster({
        link: "/master/offices",
        category: "billing",
        action: "subscription_canceled",
        metadata: { office_id: officeId },
      }).catch(() => {});
      toast.success(t.subscription.modals.cancelSuccess);
      setShowCancelModal(false);
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.officeSubscription(officeId ?? undefined) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.billingHistory(officeId ?? undefined) });
    },
    onError: (err: Error) => toast.error(err.message || t.subscription.modals.cancelError),
  });

  const activateMutation = useMutation({
    mutationFn: () => {
      if (!officeId) throw new Error("Your user has no linked office. Link an office to activate subscription.");
      if (!planToContract) throw new Error("No plan selected.");
      return activateOfficeSubscription({ officeId, plan: planToContract });
    },
    onSuccess: async () => {
      const plan = planToContract!;
      await notifyMaster({
        title: "Subscription updated",
        body: `Office ${displayOfficeName} activated/changed to plan ${plan.name}.`,
        link: "/master/offices",
        category: "billing",
        action: "subscription_updated",
        metadata: { office_id: officeId, plan_name: plan.name, plan_id: plan.id },
      }).catch(() => {});
      toast.success(t.subscription.modals.planActivated.replace("{{name}}", plan.name));
      setPlanToContract(null);
      setShowPlansModal(false);
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.officeSubscription(officeId ?? undefined) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.billingHistory(officeId ?? undefined) });
    },
    onError: (err: Error) => toast.error(err.message || t.subscription.modals.activateError),
  });

  const displayOfficeName = officeName || officeId || "";
  const availablePlans = dbPlans.filter((p) => !p.is_exclusive || p.id === urlPlanId);

  const currentPlan = {
    name: planName || t.subscription.noPlan,
    subscriptionId,
    planId,
    planVersion,
    billingModel,
    price: planType === "FIXED"
      ? `$ ${fixedFee}`
      : planType === "PERCENTAGE"
        ? `${percentageFee}%`
        : `$ ${fixedFee} + ${percentageFee}%`,
    period: planType === "PERCENTAGE" ? t.subscription.plans.percentage.period : t.subscription.plans.fixed.period,
    status,
    minFeePerTransactionUsd,
    effectiveFrom,
    effectiveTo,
    features: [
      t.subscription.features.unlimitedProcesses,
      t.subscription.features.membersLimit,
      t.subscription.features.prioritySupport,
      t.subscription.features.customSalesPage,
      t.subscription.features.advancedAi,
    ],
  };

  return {
    t,
    lang,
    urlPlanId,
    showPlansModal, setShowPlansModal,
    showCancelModal, setShowCancelModal,
    planToContract, setPlanToContract,
    availablePlans,
    billingHistory,
    currentPlan,
    subLoading,
    loadingPlans,
    isCancelingSubscription: cancelMutation.isPending,
    isActivatingSubscription: activateMutation.isPending,
    isActive,
    planName,
    currentPeriodEnd,
    status,
    effectiveFrom,
    effectiveTo,
    normalizePlanName,
    handleCancelSubscription: () => cancelMutation.mutate(),
    handleSelectPlan: (plan: DBPlan) => setPlanToContract(plan),
    handleConfirmContract: () => activateMutation.mutate(),
  };
}
