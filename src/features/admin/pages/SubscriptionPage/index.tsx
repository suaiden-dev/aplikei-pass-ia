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
  RiStackLine,
} from "react-icons/ri";
import {
  getPlanColor,
  normalizePlanDescription,
  replaceAmount,
  type DBPlan,
} from "@features/admin/services/subscriptionPageService";
import { useSubscriptionPage } from "@features/admin/hooks/useSubscriptionPage";

function getPlanIcon(type: string) {
  switch (type) {
    case "FIXED": return <RiSettings4Line className="text-2xl" />;
    case "PERCENTAGE": return <RiPercentLine className="text-2xl" />;
    case "HYBRID": return <RiVipCrown2Line className="text-2xl" />;
    default: return <RiStackLine className="text-2xl" />;
  }
}

function PlanCard({ plan, lang, t, onSelect, showExclusiveBadge = false }: {
  plan: DBPlan;
  lang: string;
  t: any;
  onSelect: (plan: DBPlan) => void;
  showExclusiveBadge?: boolean;
}) {
  const color = getPlanColor(plan.type);
  const colorMap = {
    primary: { border: "border-primary/20 hover:border-primary", icon: "bg-primary/10 text-primary", btn: "bg-primary text-white", check: "text-primary" },
    secondary: { border: "border-secondary/20 hover:border-secondary", icon: "bg-secondary/10 text-secondary", btn: "bg-secondary text-white", check: "text-secondary" },
    warning: { border: "border-warning/20 hover:border-warning", icon: "bg-warning/10 text-warning", btn: "bg-warning text-white shadow-warning/20", check: "text-warning" },
  }[color];

  return (
    <div className={`relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 ${colorMap.border}`}>
      {showExclusiveBadge && plan.is_exclusive && (
        <div className="absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-[9px] font-semibold uppercase tracking-widest text-bg">Exclusive</div>
      )}
      <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${colorMap.icon}`}>
        {getPlanIcon(plan.type)}
      </div>
      <h3 className="mb-2 text-xl font-semibold tracking-tight text-text">{plan.name}</h3>
      <div className="mb-5">
        <span className="text-3xl font-semibold tracking-tight lg:text-4xl">
          {plan.fixed_fee > 0 ? `$${plan.fixed_fee}` : `${plan.percentage_fee}%`}
        </span>
        <span className="mt-1 block text-xs font-medium uppercase tracking-wider text-text-muted">
          {plan.type === "PERCENTAGE" ? t.subscription.plans.percentage.period : t.subscription.plans.fixed.period}
        </span>
      </div>
      <p className="mb-7 flex-grow text-sm font-medium leading-relaxed text-text-muted">
        {normalizePlanDescription(plan.description, plan.type, lang)}
      </p>
      <div className="mb-8 space-y-3">
        {(plan.features || []).map((f, i) => (
          <div key={i} className="flex items-center gap-3 text-sm font-medium text-text/80">
            <RiCheckDoubleLine className={`text-lg ${colorMap.check}`} />
            {f}
          </div>
        ))}
      </div>
      <button
        onClick={() => onSelect(plan)}
        className={`h-11 w-full rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all active:scale-95 ${colorMap.btn}`}
      >
        {t.subscription.onboarding.btn}
      </button>
    </div>
  );
}

export default function SubscriptionPage() {
  const {
    t, lang, urlPlanId,
    showPlansModal, setShowPlansModal,
    showCancelModal, setShowCancelModal,
    planToContract, setPlanToContract,
    availablePlans, billingHistory,
    currentPlan, subLoading, loadingPlans,
    isCancelingSubscription, isActivatingSubscription,
    isActive, planName, currentPeriodEnd, status,
    normalizePlanName,
    handleCancelSubscription, handleSelectPlan, handleConfirmContract,
  } = useSubscriptionPage();

  if (subLoading || loadingPlans) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "none" || (urlPlanId && !isActive)) {
    return (
      <>
        <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 sm:p-6 lg:p-8">
          <div className="mb-10 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-primary">
              <RiVipCrown2Line /> {t.subscription.onboarding.eyebrow}
            </div>
            <h1 className="mx-auto mb-4 max-w-3xl text-3xl font-semibold tracking-tight text-text sm:text-4xl lg:text-5xl">
              {urlPlanId ? "Exclusive Offer Unlocked" : t.subscription.onboarding.title}
            </h1>
            <p className="mx-auto max-w-2xl font-medium text-text-muted">
              {urlPlanId ? "You've accessed a special subscription plan tailored for your office. Choose it below to activate your account." : t.subscription.onboarding.description}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 text-left sm:grid-cols-2 xl:grid-cols-3">
            {availablePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} lang={lang} t={t} onSelect={handleSelectPlan} showExclusiveBadge />
            ))}
          </div>
        </div>

        {planToContract && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-bg p-6 shadow-xl">
              <div className="space-y-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <RiVipCrown2Line className="text-3xl" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-text">Confirm Subscription</h2>
                <p className="text-sm font-medium leading-relaxed text-text-muted">
                  You are about to subscribe to the <strong>{planToContract.name}</strong>.
                  <br /><br />
                  This will activate your account immediately and grant you access to all plan features.
                </p>
                {planToContract.min_fee_per_transaction_usd ? (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-left">
                    <p className="text-xs font-medium leading-relaxed text-text-muted">
                      {replaceAmount(t.subscription.modals.minFeeNotice, planToContract.min_fee_per_transaction_usd)}
                    </p>
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button onClick={() => setPlanToContract(null)} disabled={isActivatingSubscription}
                    className="h-11 rounded-xl border border-border text-[10px] font-semibold uppercase tracking-widest text-text transition-all hover:bg-card disabled:cursor-not-allowed disabled:opacity-60">
                    Cancel
                  </button>
                  <button onClick={handleConfirmContract} disabled={isActivatingSubscription}
                    className="h-11 rounded-xl bg-primary text-[10px] font-semibold uppercase tracking-widest text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
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

  return (
    <>
      <div className="mx-auto max-w-7xl animate-in fade-in duration-700 p-4 pb-20 sm:p-6 lg:p-8">
        <div className="mb-8 text-left">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-text sm:text-4xl">{t.subscription.title}</h1>
          <p className="text-sm font-medium text-text-muted">{t.subscription.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 text-left lg:gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-8">
            {/* Current plan card */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-8">
              <div className="relative z-10">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <RiVipCrown2Line className="text-2xl" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
                        {normalizePlanName(currentPlan.name)}
                      </h2>
                      {isActive ? (
                        <span className="mt-1 inline-flex items-center rounded-full border border-success/20 bg-success/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-success">
                          {t.subscription.status.active}
                        </span>
                      ) : (
                        <span className="mt-1 inline-flex items-center rounded-full border border-danger/20 bg-danger/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-danger">
                          {!isActive && !planName ? t.subscription.status.none : t.subscription.status.inactive}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-3xl font-semibold tracking-tight text-text">{currentPlan.price}</p>
                    <p className="text-xs font-medium uppercase tracking-wider text-text-muted">{currentPlan.period}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 border-y border-border/60 py-6 sm:grid-cols-2">
                  {currentPlan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <RiCheckDoubleLine className="text-xs" />
                      </div>
                      <span className="text-sm font-medium text-text/80">{feature}</span>
                    </div>
                  ))}
                  {currentPlan.minFeePerTransactionUsd ? (
                    <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3 sm:col-span-2">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <RiPercentLine className="text-xs" />
                      </div>
                      <span className="text-sm font-medium leading-relaxed text-text/80">
                        {replaceAmount(t.subscription.features.minFeePerTransaction, currentPlan.minFeePerTransactionUsd)}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  {normalizePlanName(currentPlan.name) !== "Scalable Plan" && currentPeriodEnd && (
                    <div className="flex items-center gap-3">
                      <RiCalendarCheckLine className="text-2xl text-primary" />
                      <div className="text-left">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{t.subscription.modals.expiration}</p>
                        <p className="text-sm font-semibold uppercase text-text">
                          {new Date(currentPeriodEnd).toLocaleDateString("en-US")}
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="ml-auto h-11 rounded-xl border border-danger/25 px-6 text-[10px] font-semibold uppercase tracking-widest text-danger transition-all hover:bg-danger hover:text-white active:scale-95"
                  >
                    {t.subscription.modals.cancelBtn}
                  </button>
                </div>
              </div>
            </div>

            {/* Billing history */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <RiBillLine className="text-2xl text-text-muted" />
                <h3 className="text-lg font-semibold tracking-tight text-text">{t.subscription.billingHistory}</h3>
              </div>
              <div className="space-y-4">
                {billingHistory.length === 0 && (
                  <p className="text-sm text-text-muted font-semibold">{t.subscription.status.none}</p>
                )}
                {billingHistory.map((item) => (
                  <div key={item.id} className="flex cursor-pointer items-center justify-between rounded-xl border border-border/50 bg-bg-subtle/50 p-4 transition-all hover:border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-text-muted">
                        <RiBillLine />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-text">{normalizePlanName(item.planName)}</p>
                        <p className="text-xs font-medium text-text-muted">
                          {t.subscription.paidOn.replace("{{date}}", item.signedAt ? new Date(item.signedAt).toLocaleString("pt-BR") : "-")}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-text">{item.amountLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upgrade sidebar */}
          <div className="space-y-6 text-left xl:sticky xl:top-24 h-fit">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-secondary/30">
              <RiArrowUpDoubleLine className="mb-4 text-3xl text-secondary transition-transform duration-500" />
              <h3 className="mb-2 text-xl font-semibold tracking-tight text-text">{t.subscription.upgrade.title}</h3>
              <p className="mb-6 text-sm font-medium leading-relaxed text-text-muted">{t.subscription.upgrade.description}</p>
              <button
                onClick={() => setShowPlansModal(true)}
                className="h-11 w-full rounded-xl bg-secondary text-[10px] font-semibold uppercase tracking-widest text-white transition-all hover:bg-secondary/90 active:scale-95"
              >
                {t.subscription.upgrade.btn}
              </button>
            </div>
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-warning">
                <RiShieldCheckLine className="text-2xl" />
                <h4 className="text-xs font-semibold uppercase tracking-widest">{t.subscription.security.title}</h4>
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-text-muted">{t.subscription.security.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans modal */}
      {showPlansModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-border bg-bg p-5 shadow-xl sm:p-6 md:p-8">
            <button
              onClick={() => setShowPlansModal(false)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-border text-text-muted transition-all hover:bg-card hover:text-text"
            >
              <RiCloseLine className="text-2xl" />
            </button>
            <div className="mb-8 pr-12 text-left sm:text-center sm:pr-0">
              <h2 className="mb-2 text-2xl font-semibold tracking-tight text-text md:text-4xl">{t.subscription.modals.choosePlan}</h2>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{t.subscription.modals.transitionHint}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-3">
              {availablePlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} lang={lang} t={t} onSelect={handleSelectPlan} />
              ))}
            </div>
            <p className="mt-8 text-center text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              {t.subscription.modals.effectHint}
            </p>
          </div>
        </div>
      )}

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-bg p-6 shadow-xl">
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-danger/10 text-danger">
                <RiCloseLine className="text-3xl" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-text">{t.subscription.modals.cancelTitle}</h2>
              <p className="text-sm font-medium leading-relaxed text-text-muted">{t.subscription.modals.cancelDescription}</p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button onClick={() => setShowCancelModal(false)} disabled={isCancelingSubscription}
                  className="h-11 rounded-xl border border-border text-[10px] font-semibold uppercase tracking-widest text-text transition-all hover:bg-card">
                  {t.subscription.modals.cancelKeep}
                </button>
                <button onClick={handleCancelSubscription} disabled={isCancelingSubscription}
                  className="h-11 rounded-xl bg-danger text-[10px] font-semibold uppercase tracking-widest text-white transition-all hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60">
                  {isCancelingSubscription ? "Registrando..." : t.subscription.modals.cancelConfirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract confirmation modal */}
      {planToContract && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-bg p-6 shadow-xl">
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <RiVipCrown2Line className="text-3xl" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-text">Confirm Subscription</h2>
              <p className="text-sm font-medium leading-relaxed text-text-muted">
                You are about to subscribe to the <strong>{planToContract.name}</strong>.
                <br /><br />
                This will activate your account immediately and grant you access to all plan features.
              </p>
              {planToContract.min_fee_per_transaction_usd ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-left">
                  <p className="text-xs font-medium leading-relaxed text-text-muted">
                    {replaceAmount(t.subscription.modals.minFeeNotice, planToContract.min_fee_per_transaction_usd)}
                  </p>
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button onClick={() => setPlanToContract(null)} disabled={isActivatingSubscription}
                  className="h-11 rounded-xl border border-border text-[10px] font-semibold uppercase tracking-widest text-text transition-all hover:bg-card disabled:cursor-not-allowed disabled:opacity-60">
                  Cancel
                </button>
                <button onClick={handleConfirmContract} disabled={isActivatingSubscription}
                  className="h-11 rounded-xl bg-primary text-[10px] font-semibold uppercase tracking-widest text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
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
