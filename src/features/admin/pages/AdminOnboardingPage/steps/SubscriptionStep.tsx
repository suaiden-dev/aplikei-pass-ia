import { useEffect } from "react";
import { RiLoader4Line, RiVipCrown2Line, RiCheckDoubleLine, RiPercentLine, RiSettings4Line, RiStackLine } from "react-icons/ri";
import { useSubscriptionPage } from "@features/admin/hooks/useSubscriptionPage";
import {
  getPlanColor,
  normalizePlanDescription,
  replaceAmount,
  type DBPlan,
} from "@features/admin/services/subscriptionPageService";
import { useLocale } from "@app/app/i18n";

interface SubscriptionStepProps {
  onSuccess: () => void;
}

function getPlanIcon(type: string) {
  switch (type) {
    case "FIXED": return <RiSettings4Line className="text-2xl" />;
    case "PERCENTAGE": return <RiPercentLine className="text-2xl" />;
    case "HYBRID": return <RiVipCrown2Line className="text-2xl" />;
    default: return <RiStackLine className="text-2xl" />;
  }
}

function PlanCard({ plan, lang, onSelect }: { plan: DBPlan; lang: string; onSelect: (p: DBPlan) => void }) {
  const color = getPlanColor(plan.type);
  const colorMap = {
    primary: { glow: "shadow-primary/20", icon: "bg-primary/10 text-primary", btn: "bg-primary hover:bg-primary/90 shadow-primary/30", check: "text-primary", badge: "bg-primary/10 text-primary border-primary/20" },
    secondary: { glow: "shadow-secondary/20", icon: "bg-secondary/10 text-secondary", btn: "bg-secondary hover:bg-secondary/90 shadow-secondary/30", check: "text-secondary", badge: "bg-secondary/10 text-secondary border-secondary/20" },
    warning: { glow: "shadow-warning/20", icon: "bg-warning/10 text-warning", btn: "bg-warning hover:bg-warning/90 shadow-warning/30", check: "text-warning", badge: "bg-warning/10 text-warning border-warning/20" },
  }[color];

  const price = plan.fixed_fee > 0 ? `$${plan.fixed_fee}` : `${plan.percentage_fee}%`;
  const priceSuffix = plan.type === "PERCENTAGE" ? "per transaction" : "per month";

  return (
    <div className={`relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-xl ${colorMap.glow}`}>
      {/* Top row: icon + name + badge */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorMap.icon}`}>
            {getPlanIcon(plan.type)}
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-text">{plan.name}</h3>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colorMap.badge}`}>
          {plan.type}
        </span>
      </div>

      {/* Price hero */}
      <div className="mb-5 flex items-end gap-2">
        <span className="text-5xl font-bold tracking-tight text-text leading-none">{price}</span>
        <span className="mb-1 text-xs font-medium uppercase tracking-wider text-text-muted">{priceSuffix}</span>
      </div>

      {/* Description */}
      <p className="mb-6 text-sm leading-relaxed text-text-muted border-t border-border pt-4">
        {normalizePlanDescription(plan.description, plan.type, lang)}
      </p>

      {/* Features grid */}
      {(plan.features || []).length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-2.5">
          {(plan.features || []).map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-medium text-text/80">
              <RiCheckDoubleLine className={`text-base shrink-0 ${colorMap.check}`} />
              <span className="text-xs">{f}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => onSelect(plan)}
        className={`mt-auto h-12 w-full rounded-xl text-sm font-semibold tracking-wide text-white transition-all active:scale-[0.98] shadow-lg ${colorMap.btn}`}
      >
        Get Started
      </button>
    </div>
  );
}

export function SubscriptionStep({ onSuccess }: SubscriptionStepProps) {
  const { lang } = useLocale();
  const {
    availablePlans, subLoading, loadingPlans,
    isActive, isActivatingSubscription,
    planToContract, setPlanToContract,
    handleSelectPlan, handleConfirmContract,
  } = useSubscriptionPage();

  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(onSuccess, 800);
    return () => clearTimeout(timer);
  }, [isActive, onSuccess]);

  if (subLoading || loadingPlans) {
    return (
      <div className="flex items-center justify-center py-20">
        <RiLoader4Line className="animate-spin text-3xl text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="text-center space-y-1 mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-primary">
          <RiVipCrown2Line /> Choose your plan
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Activate your subscription</h2>
        <p className="text-sm text-text-muted">Select a plan to unlock the full platform.</p>
      </div>

      <div className={availablePlans.length === 1
        ? "flex justify-center"
        : "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
      }>
        {availablePlans.map((plan) => (
          <div key={plan.id} className={availablePlans.length === 1 ? "w-full max-w-sm" : undefined}>
            <PlanCard plan={plan} lang={lang} onSelect={handleSelectPlan} />
          </div>
        ))}
      </div>

      {/* Confirmation modal */}
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
                    {replaceAmount("Minimum fee per transaction: ${{amount}}", planToContract.min_fee_per_transaction_usd)}
                  </p>
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => setPlanToContract(null)}
                  disabled={isActivatingSubscription}
                  className="h-11 rounded-xl border border-border text-[10px] font-semibold uppercase tracking-widest text-text transition-all hover:bg-card disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmContract}
                  disabled={isActivatingSubscription}
                  className="h-11 rounded-xl bg-primary text-[10px] font-semibold uppercase tracking-widest text-white transition-all hover:bg-primary/90 disabled:opacity-60"
                >
                  {isActivatingSubscription ? "Activating..." : "Confirm & Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
