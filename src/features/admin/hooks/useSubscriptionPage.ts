import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useSubscription } from "@features/admin/hooks/useSubscription";
import { useLocale, useT } from "@app/app/i18n";
import {
  activateOfficeSubscription,
  cancelOfficeSubscription,
  fetchActiveSubscriptionPlans,
  fetchBillingHistory as fetchOfficeBillingHistory,
  fetchOfficeName,
  normalizePlanName,
  type BillingHistoryItem,
  type DBPlan,
} from "@features/admin/services/subscriptionPageService";
import { notifyMaster } from "@features/notifications/services/notify";

export function useSubscriptionPage() {
  const t = useT("admin");
  const { lang } = useLocale();
  const [searchParams] = useSearchParams();
  const urlPlanId = searchParams.get("planId");

  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [planToContract, setPlanToContract] = useState<DBPlan | null>(null);
  const [dbPlans, setDbPlans] = useState<DBPlan[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isCancelingSubscription, setIsCancelingSubscription] = useState(false);
  const [isActivatingSubscription, setIsActivatingSubscription] = useState(false);
  const [officeName, setOfficeName] = useState<string>("");

  const {
    status, planName, planType, fixedFee, percentageFee, minFeePerTransactionUsd,
    currentPeriodEnd, loading: subLoading, isActive, officeId,
  } = useSubscription();

  useEffect(() => {
    if (!officeId) return;
    fetchOfficeName(officeId).then((name) => { if (name) setOfficeName(name); });
  }, [officeId]);

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    setDbPlans(await fetchActiveSubscriptionPlans());
    setLoadingPlans(false);
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const loadBillingHistory = useCallback(async () => {
    if (!officeId) { setBillingHistory([]); return; }
    try {
      setBillingHistory(await fetchOfficeBillingHistory(officeId, t.subscription.noPlan));
    } catch {
      setBillingHistory([]);
    }
  }, [officeId, t.subscription.noPlan]);

  useEffect(() => { loadBillingHistory(); }, [loadBillingHistory]);

  const displayOfficeName = officeName || officeId || "";
  const availablePlans = dbPlans.filter((p) => !p.is_exclusive || p.id === urlPlanId);

  const currentPlan = {
    name: planName || t.subscription.noPlan,
    price: planType === "FIXED"
      ? `$ ${fixedFee}`
      : planType === "PERCENTAGE"
        ? `${percentageFee}%`
        : `$ ${fixedFee} + ${percentageFee}%`,
    period: planType === "PERCENTAGE" ? t.subscription.plans.percentage.period : t.subscription.plans.fixed.period,
    status,
    minFeePerTransactionUsd,
    features: [
      t.subscription.features.unlimitedProcesses,
      t.subscription.features.membersLimit,
      t.subscription.features.prioritySupport,
      t.subscription.features.customSalesPage,
      t.subscription.features.advancedAi,
    ],
  };

  const handleCancelSubscription = async () => {
    if (!officeId) { toast.error("Your user has no linked office to cancel subscription."); return; }
    setIsCancelingSubscription(true);
    try {
      await cancelOfficeSubscription(officeId);
      await notifyMaster({ link: "/master/offices", category: "billing", action: "subscription_canceled", metadata: { office_id: officeId } });
      toast.success(t.subscription.modals.cancelSuccess);
      setShowCancelModal(false);
      window.location.reload();
    } catch {
      toast.error(t.subscription.modals.cancelError);
    } finally {
      setIsCancelingSubscription(false);
    }
  };

  const handleSelectPlan = (plan: DBPlan) => setPlanToContract(plan);

  const handleConfirmContract = async () => {
    if (!planToContract) return;
    if (!officeId) { toast.error("Your user has no linked office. Link an office to activate subscription."); return; }
    setIsActivatingSubscription(true);
    try {
      await activateOfficeSubscription({ officeId, planId: planToContract.id });
      await notifyMaster({
        title: "Subscription updated",
        body: `Office ${displayOfficeName} activated/changed to plan ${planToContract.name}.`,
        link: "/master/offices",
        category: "billing",
        action: "subscription_updated",
        metadata: { office_id: officeId, plan_name: planToContract.name, plan_id: planToContract.id },
      });
      toast.success(`Plan ${planToContract.name} activated successfully!`);
      setPlanToContract(null);
      setShowPlansModal(false);
      window.location.reload();
    } catch {
      toast.error("Error activating plan. Please try again.");
    } finally {
      setIsActivatingSubscription(false);
    }
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
    isCancelingSubscription,
    isActivatingSubscription,
    isActive,
    planName,
    currentPeriodEnd,
    status,
    normalizePlanName,
    handleCancelSubscription,
    handleSelectPlan,
    handleConfirmContract,
  };
}
