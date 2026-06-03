import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  RiVipCrown2Line,
  RiCalendarCheckLine,
  RiArrowUpDoubleLine,
  RiShieldCheckLine,
  RiBillLine,
  RiCheckDoubleLine,
  RiCloseLine,
  RiPercentLine,
  RiSettings4Line,
  RiStackLine
} from "react-icons/ri";
import { toast } from "sonner";
import { useSubscription } from "@features/admin/hooks/useSubscription";
import { useLocale, useT } from "@app/app/i18n";
import { supabase } from "@shared/lib/supabase";
import { useAuth } from "@shared/hooks/useAuth";
import { notifyMaster } from "@features/notifications/services/notify";

interface DBPlan {
  id: string;
  name: string;
  description: string;
  type: 'FIXED' | 'PERCENTAGE' | 'HYBRID';
  fixed_fee: number;
  percentage_fee: number;
  features: string[];
  is_active: boolean;
  is_exclusive: boolean;
}

interface BillingHistoryItem {
  id: string;
  planName: string;
  amountLabel: string;
  signedAt: string | null;
}

export default function SubscriptionPage() {
  const t = useT("admin");
  const { lang } = useLocale();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const urlPlanId = searchParams.get("planId");

  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [planToContract, setPlanToContract] = useState<DBPlan | null>(null);
  const [dbPlans, setDbPlans] = useState<DBPlan[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const { status, planName, planType, fixedFee, percentageFee, currentPeriodEnd, loading: subLoading, isActive, officeId } = useSubscription();
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isCancelingSubscription, setIsCancelingSubscription] = useState(false);
  const [isActivatingSubscription, setIsActivatingSubscription] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true);

    setDbPlans(data || []);
    setLoadingPlans(false);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const fetchBillingHistory = useCallback(async () => {
    if (!officeId) {
      setBillingHistory([]);
      return;
    }

    const { data, error } = await supabase
      .from("office_subscriptions")
      .select("id, created_at, current_period_start, subscription_plans(name, type, fixed_fee, percentage_fee)")
      .eq("office_id", officeId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching billing history:", error);
      setBillingHistory([]);
      return;
    }

    const rows = (data || []).map((row: any) => {
      const plan = row.subscription_plans;
      const amountLabel = plan?.type === "PERCENTAGE"
        ? `${plan?.percentage_fee ?? 0}%`
        : plan?.type === "HYBRID"
          ? `$ ${plan?.fixed_fee ?? 0} + ${plan?.percentage_fee ?? 0}%`
          : `$ ${plan?.fixed_fee ?? 0}`;

      return {
        id: row.id,
        planName: plan?.name || t.subscription.noPlan,
        amountLabel,
        signedAt: row.current_period_start || row.created_at || null,
      };
    });

    setBillingHistory(rows);
  }, [officeId, t.subscription.noPlan]);

  useEffect(() => {
    fetchBillingHistory();
  }, [fetchBillingHistory]);

  const currentPlan = {
    name: planName || t.subscription.noPlan,
    price: planType === 'FIXED'
      ? `$ ${fixedFee}`
      : (planType === 'PERCENTAGE'
        ? `${percentageFee}%`
        : `$ ${fixedFee} + ${percentageFee}%`),
    period: planType === 'PERCENTAGE' ? t.subscription.plans.percentage.period : t.subscription.plans.fixed.period,
    nextBilling: t.subscription.nextCycle,
    status: status,
    features: [
      t.subscription.features.unlimitedProcesses,
      t.subscription.features.membersLimit,
      t.subscription.features.prioritySupport,
      t.subscription.features.customSalesPage,
      t.subscription.features.advancedAi
    ]
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'FIXED': return <RiSettings4Line className="text-2xl" />;
      case 'PERCENTAGE': return <RiPercentLine className="text-2xl" />;
      case 'HYBRID': return <RiVipCrown2Line className="text-2xl" />;
      default: return <RiStackLine className="text-2xl" />;
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case 'FIXED': return 'primary';
      case 'PERCENTAGE': return 'secondary';
      case 'HYBRID': return 'warning';
      default: return 'primary';
    }
  };

  // Filter plans: show non-exclusive active plans, OR the specific exclusive plan if ID matches
  const availablePlans = dbPlans.filter(p => !p.is_exclusive || p.id === urlPlanId);

  const normalizePlanName = useCallback((name: string) => {
    const key = String(name || "").trim().toLowerCase();
    if (key === "crescimento (variável)" || key === "crescimento (variavel)") return "Scalable Plan";
    if (key === "plano fixo") return "Fixed Plan";
    return name;
  }, []);

  const normalizePlanDescription = useCallback((description: string, type: DBPlan["type"]) => {
    const raw = String(description || "").trim();
    if (lang === "en") {
      if (raw.toLowerCase() === "pague apenas uma porcentagem do que faturar.") {
        return "Pay only a percentage of what you bill.";
      }
      if (type === "PERCENTAGE" && raw) {
        return raw;
      }
    }
    return raw;
  }, [lang]);

  const handleCancelSubscription = async () => {
    if (!officeId) {
      toast.error("Your user has no linked office to cancel subscription.");
      return;
    }

    try {
      setIsCancelingSubscription(true);
      const { error } = await supabase
        .from("office_subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("office_id", officeId)
        .filter("status", "in", '("active","trialing")');

      if (error) throw error;

      await notifyMaster({
        link: "/master/offices",
        category: "billing",
        action: "subscription_canceled",
        metadata: { office_id: officeId },
      });

      toast.success(t.subscription.modals.cancelSuccess);
      setShowCancelModal(false);
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error("Error canceling subscription:", err);
      toast.error(t.subscription.modals.cancelError);
    } finally {
      setIsCancelingSubscription(false);
    }
  };

  const handleSelectPlan = async (plan: DBPlan) => {
    setPlanToContract(plan);
  };

  const handleConfirmContract = async () => {
    if (!planToContract) return;
    if (!officeId) {
      toast.error("Your user has no linked office. Link an office to activate subscription.");
      return;
    }

    try {
      setIsActivatingSubscription(true);
      // Calculate period end (30 days from now)
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);

      const { error } = await supabase
        .from("office_subscriptions")
        .upsert({
          office_id: officeId,
          plan_id: planToContract.id,
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'office_id' });

      if (error) throw error;

      await notifyMaster({
        link: "/master/offices",
        category: "billing",
        action: "subscription_updated",
        metadata: { office_id: officeId, plan_name: planToContract.name, plan_id: planToContract.id },
      });

      toast.success(`Plan ${planToContract.name} activated successfully!`);
      setPlanToContract(null);
      setShowPlansModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Error activating plan:", err);
      toast.error("Error activating plan. Please try again.");
    } finally {
      setIsActivatingSubscription(false);
    }
  };

  if (subLoading || loadingPlans) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    if (status === 'none' || (urlPlanId && !isActive)) {
      return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 mb-6">
              <RiVipCrown2Line /> {t.subscription.onboarding.eyebrow}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-text mb-4 uppercase">
              {urlPlanId ? "Exclusive Offer Unlocked" : t.subscription.onboarding.title}
            </h1>
            <p className="text-text-muted max-w-2xl mx-auto font-medium">
              {urlPlanId ? "You've accessed a special subscription plan tailored for your office. Choose it below to activate your account." : t.subscription.onboarding.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8 text-left">
            {availablePlans.map((plan) => {
              const color = getPlanColor(plan.type);
              return (
                <div
                  key={plan.id}
                  className={`relative p-6 sm:p-8 lg:p-10 rounded-[32px] lg:rounded-[40px] border-2 bg-card transition-all hover:-translate-y-2 flex flex-col shadow-xl shadow-bg-subtle ${color === 'primary' ? 'border-primary/20 hover:border-primary' :
                    color === 'secondary' ? 'border-secondary/20 hover:border-secondary' :
                      'border-warning/20 hover:border-warning'
                    } ${plan.id === urlPlanId ? 'ring-4 ring-amber-500/30' : ''}`}
                >
                  {plan.is_exclusive && (
                    <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-amber-500 text-bg text-[9px] font-black uppercase tracking-widest">Exclusive</div>
                  )}

                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg ${color === 'primary' ? 'bg-primary/10 text-primary' :
                    color === 'secondary' ? 'bg-secondary/10 text-secondary' :
                      'bg-warning/10 text-warning'
                    }`}>
                    {getPlanIcon(plan.type)}
                  </div>

                  <h3 className="text-2xl font-black text-text mb-2 uppercase tracking-tight">
                    {normalizePlanName(plan.name)}
                  </h3>
                  <div className="mb-6">
                    <span className="text-3xl lg:text-4xl font-black tracking-tighter">
                      {plan.fixed_fee > 0 ? `$${plan.fixed_fee}` : `${plan.percentage_fee}%`}
                    </span>
                    <span className="text-xs text-text-muted font-bold block mt-1 uppercase">
                      {plan.type === 'PERCENTAGE' ? t.subscription.plans.percentage.period : t.subscription.plans.fixed.period}
                    </span>
                  </div>

                  {plan.type === 'PERCENTAGE' ? (
                    <div className="space-y-4 mb-8 flex-grow">
                      {[
                        { title: "Unlimited Cases", sub: "Handle as many cases as your business needs." },
                        { title: "Up to 5 Team Members", sub: "Collaborate with your team in a single workspace." },
                        { title: "24/7 Priority Support", sub: "Get fast assistance whenever you need it." },
                        { title: "Custom Sales Page", sub: "Create a fully branded sales experience." },
                        { title: "Advanced AI Integration", sub: "Automate workflows with powerful AI features." },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <RiCheckDoubleLine className={`text-xl mt-0.5 flex-shrink-0 ${color === 'primary' ? 'text-primary' :
                            color === 'secondary' ? 'text-secondary' :
                              'text-warning'
                            }`} />
                          <div>
                            <span className="text-sm font-black text-text">{item.title}</span>
                            <span className="text-xs text-text-muted font-medium block leading-snug">{item.sub}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-text-muted font-medium mb-8 flex-grow leading-relaxed">
                        {normalizePlanDescription(plan.description, plan.type)}
                      </p>
                      <div className="space-y-4 mb-10">
                        {(plan.features || []).map((f, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm font-bold text-text/80">
                            <RiCheckDoubleLine className={`text-xl ${color === 'primary' ? 'text-primary' :
                              color === 'secondary' ? 'text-secondary' :
                                'text-warning'
                              }`} />
                            {f}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${color === 'primary' ? 'bg-primary text-white shadow-primary/20' :
                      color === 'secondary' ? 'bg-secondary text-white shadow-secondary/20' :
                        'bg-warning text-white shadow-warning/20'
                      }`}
                  >
                    {t.subscription.onboarding.btn}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 sm:p-6 lg:p-8 pb-20 max-w-7xl mx-auto animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="mb-10 text-left">
          <h1 className="text-4xl font-black tracking-tight text-text mb-2 uppercase">{t.subscription.title}</h1>
          <p className="text-sm text-text-muted font-semibold uppercase tracking-widest opacity-70">
            {t.subscription.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 text-left">
          {/* Main Subscription Card */}
          <div className="xl:col-span-2 space-y-8">
            <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-8 lg:p-10 shadow-2xl shadow-primary/5">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30">
                      <RiVipCrown2Line className="text-3xl" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-black text-text uppercase tracking-tight">
                        {normalizePlanName(currentPlan.name)}
                      </h2>
                      {isActive ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-widest border border-success/20 mt-1">
                          {t.subscription.status.active}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-danger/10 text-danger text-[10px] font-black uppercase tracking-widest border border-danger/20 mt-1">
                          {!isActive && !planName ? t.subscription.status.none : t.subscription.status.inactive}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-3xl font-black text-text tracking-tighter">{currentPlan.price}</p>
                    <p className="text-xs text-text-muted font-bold uppercase">{currentPlan.period}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-8 border-y border-border/50">
                  {currentPlan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <RiCheckDoubleLine className="text-xs" />
                      </div>
                      <span className="text-sm font-bold text-text/80">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  {normalizePlanName(currentPlan.name) !== "Scalable Plan" && currentPeriodEnd && (
                    <div className="flex items-center gap-3">
                      <RiCalendarCheckLine className="text-2xl text-primary" />
                      <div className="text-left">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t.subscription.modals.expiration}</p>
                        <p className="text-sm font-black text-text uppercase">
                          {new Date(currentPeriodEnd).toLocaleDateString('en-US')}
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="h-12 px-8 rounded-2xl border-2 border-danger/20 text-danger text-[10px] font-black uppercase tracking-widest hover:bg-danger hover:text-white transition-all active:scale-95 ml-auto"
                  >
                    {t.subscription.modals.cancelBtn}
                  </button>
                </div>
              </div>
            </div>

            {/* Billing History Placeholder */}
            <div className="rounded-[28px] sm:rounded-[32px] border border-border bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <RiBillLine className="text-2xl text-text-muted" />
                <h3 className="text-lg font-black text-text uppercase tracking-tight">{t.subscription.billingHistory}</h3>
              </div>
              <div className="space-y-4">
                {billingHistory.length === 0 && (
                  <p className="text-sm text-text-muted font-semibold">
                    {t.subscription.status.none}
                  </p>
                )}
                {billingHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-bg-subtle/50 border border-border/50 hover:border-primary/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-text-muted">
                        <RiBillLine />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-text">{normalizePlanName(item.planName)}</p>
                        <p className="text-xs text-text-muted font-bold">
                          {t.subscription.paidOn.replace("{{date}}", item.signedAt ? new Date(item.signedAt).toLocaleString("pt-BR") : "-")}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-text">{item.amountLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upgrade Sidebar */}
          <div className="space-y-6 text-left xl:sticky xl:top-24 h-fit">
            <div className="rounded-[32px] border border-border bg-card p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-all" />

              <RiArrowUpDoubleLine className="text-4xl text-secondary mb-4 group-hover:-translate-y-1 transition-transform duration-500" />
              <h3 className="text-xl font-black text-text mb-2 uppercase tracking-tight">{t.subscription.upgrade.title}</h3>
              <p className="text-sm text-text-muted font-medium mb-6 leading-relaxed">
                {t.subscription.upgrade.description}
              </p>
              <button
                onClick={() => setShowPlansModal(true)}
                className="w-full h-12 rounded-2xl bg-secondary text-white text-[10px] font-black uppercase tracking-widest hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 active:scale-95"
              >
                {t.subscription.upgrade.btn}
              </button>
            </div>

            <div className="rounded-[32px] border border-border bg-card p-8 shadow-sm border-dashed">
              <div className="flex items-center gap-3 mb-4 text-warning">
                <RiShieldCheckLine className="text-2xl" />
                <h4 className="text-xs font-black uppercase tracking-widest">{t.subscription.security.title}</h4>
              </div>
              <p className="text-[11px] text-text-muted font-bold leading-relaxed opacity-60">
                {t.subscription.security.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderContent()}

      {/* Plans Modal */}
      {showPlansModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-5xl rounded-[40px] border border-border bg-bg p-8 md:p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPlansModal(false)}
              className="absolute top-8 right-8 w-12 h-12 rounded-2xl border border-border flex items-center justify-center text-text-muted hover:text-text hover:bg-card transition-all"
            >
              <RiCloseLine className="text-2xl" />
            </button>

            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-text mb-4 uppercase">{t.subscription.modals.choosePlan}</h2>
              <p className="text-text-muted font-black uppercase tracking-widest text-[10px] opacity-60">{t.subscription.modals.transitionHint}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {availablePlans.map((plan) => {
                const color = getPlanColor(plan.type);
                return (
                  <div
                    key={plan.id}
                    className={`relative p-8 rounded-[32px] border-2 bg-card transition-all hover:-translate-y-2 flex flex-col ${color === 'primary' ? 'border-primary/20 hover:border-primary' :
                      color === 'secondary' ? 'border-secondary/20 hover:border-secondary' :
                        'border-warning/20 hover:border-warning'
                      }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${color === 'primary' ? 'bg-primary/10 text-primary' :
                      color === 'secondary' ? 'bg-secondary/10 text-secondary' :
                        'bg-warning/10 text-warning'
                      }`}>
                      {getPlanIcon(plan.type)}
                    </div>

                    <h3 className="text-xl font-black text-text mb-2 uppercase tracking-tight">{normalizePlanName(plan.name)}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-black tracking-tighter">
                        {plan.fixed_fee > 0 ? `$${plan.fixed_fee}` : `${plan.percentage_fee}%`}
                      </span>
                      <span className="text-[10px] text-text-muted font-black block mt-1 uppercase">
                        {plan.type === 'PERCENTAGE' ? "Commission" : "Monthly"}
                      </span>
                    </div>

                    <p className="text-sm text-text-muted font-medium mb-8 flex-grow leading-relaxed">
                      {normalizePlanDescription(plan.description, plan.type)}
                    </p>

                    <div className="space-y-3 mb-8">
                      {(plan.features || []).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-text/70">
                          <RiCheckDoubleLine className={`text-sm ${color === 'primary' ? 'text-primary' :
                            color === 'secondary' ? 'text-secondary' :
                              'text-warning'
                            }`} />
                          {f}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${color === 'primary' ? 'bg-primary text-white shadow-primary/20' :
                        color === 'secondary' ? 'bg-secondary text-white shadow-secondary/20' :
                          'bg-warning text-white shadow-warning/20'
                        }`}
                    >
                      {t.subscription.modals.changeBtn}
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="mt-12 text-center text-[10px] text-text-muted font-black uppercase tracking-widest opacity-40">
              {t.subscription.modals.effectHint}
            </p>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-[32px] border border-border bg-bg p-8 shadow-2xl relative">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-danger/10 text-danger flex items-center justify-center mx-auto mb-6">
                <RiCloseLine className="text-4xl" />
              </div>

              <h2 className="text-2xl font-black text-text uppercase tracking-tight">{t.subscription.modals.cancelTitle}</h2>
              <p className="text-sm text-text-muted font-medium leading-relaxed">
                {t.subscription.modals.cancelDescription}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelingSubscription}
                  className="h-12 rounded-2xl border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-card transition-all"
                >
                  {t.subscription.modals.cancelKeep}
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={isCancelingSubscription}
                  className="h-12 rounded-2xl bg-danger text-white text-[10px] font-black uppercase tracking-widest hover:bg-danger/90 transition-all shadow-lg shadow-danger/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isCancelingSubscription ? "Registrando..." : t.subscription.modals.cancelConfirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Confirmation Modal */}
      {planToContract && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-[32px] border border-border bg-bg p-8 shadow-2xl relative">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                <RiVipCrown2Line className="text-4xl" />
              </div>

              <h2 className="text-2xl font-black text-text uppercase tracking-tight">Confirm Subscription</h2>
              <p className="text-sm text-text-muted font-medium leading-relaxed">
                You are about to subscribe to the <strong>{planToContract.name}</strong>.
                <br /><br />
                This will activate your account immediately and grant you access to all plan features.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => setPlanToContract(null)}
                  disabled={isActivatingSubscription}
                  className="h-12 rounded-2xl border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-card transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmContract}
                  disabled={isActivatingSubscription}
                  className="h-12 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isActivatingSubscription ? "Registrando..." : "Confirm & Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
