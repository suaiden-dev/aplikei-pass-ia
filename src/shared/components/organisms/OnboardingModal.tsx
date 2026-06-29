import { useEffect, useMemo, useRef, useState } from "react";
import { RiAddLine, RiArrowLeftLine, RiArrowRightLine, RiBuilding4Line, RiCheckDoubleLine, RiLoader4Line, RiSubtractLine, RiVipCrown2Line } from "react-icons/ri";
import { Button } from "../atoms/button";
import { cn } from "@shared/utils/cn";
import { toast } from "sonner";

type OnboardingModalProps = {
  isOpen: boolean;
  officeCreated: boolean;
  subscriptionActive: boolean;
  onGoCompany: () => void;
  onGoSubscription: () => void;
  onGoOverview: () => void;
  onGoProcesses: () => void;
  onGoTeam: () => void;
  onRefreshStatus: () => Promise<void>;
  onComplete: () => void;
};

type Step = {
  id: string;
  title: string;
  description: string;
};

const ONBOARDING_STEP_STORAGE_KEY = "admin_lawyer_onboarding_step_v1";
const ONBOARDING_MINIMIZED_STORAGE_KEY = "admin_lawyer_onboarding_minimized_v1";

export function OnboardingModal({
  isOpen,
  officeCreated,
  subscriptionActive,
  onGoCompany,
  onGoSubscription,
  onGoOverview,
  onGoProcesses,
  onGoTeam,
  onRefreshStatus,
  onComplete,
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const lastAutoNavigatedStepRef = useRef<string | null>(null);

  const requirementsDone = officeCreated && subscriptionActive;

  const steps: Step[] = useMemo(
    () => [
      {
        id: "welcome",
        title: "Operations onboarding",
        description:
          "Let’s set up your account in quick steps. You must complete company setup and subscription activation to unlock the rest of the platform.",
      },
      {
        id: "company",
        title: "Step 1: Create company",
        description: officeCreated
          ? "Company detected successfully."
          : "Fill in Company Profile and save to create your company.",
      },
      {
        id: "subscription",
        title: "Step 2: Activate subscription",
        description: subscriptionActive
          ? "Active subscription detected."
          : "Activate a plan in Subscription to unlock operational features.",
      },
      {
        id: "tour-overview",
        title: "Tour: Overview",
        description:
          "In Overview you track key operational metrics, revenue, and overall progress.",
      },
      {
        id: "tour-processes",
        title: "Tour: Processes",
        description:
          "In Processes you manage client flow, approve steps, and track pending items.",
      },
      {
        id: "tour-team",
        title: "Tour: Team",
        description:
          "In Team you add members, adjust permissions, and organize your structure.",
      },
      {
        id: "finish",
        title: "Finish onboarding",
        description: requirementsDone
          ? "Everything is ready. Click Finish to complete."
          : "Finish will only be enabled when company setup and subscription are completed.",
      },
    ],
    [officeCreated, onGoCompany, onGoOverview, onGoProcesses, onGoSubscription, onGoTeam, requirementsDone, subscriptionActive],
  );

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const finishBlocked = isLast && !requirementsDone;
  const isWelcomeStep = step.id === "welcome";
  const isCompanyStep = step.id === "company";
  const isSubscriptionStep = step.id === "subscription";
  const shouldShowSubscriptionStatus = !isWelcomeStep && !isCompanyStep;
  const isRequiredStepBlocked =
    (isCompanyStep && !officeCreated) ||
    (isSubscriptionStep && !subscriptionActive);
  const nextDisabled = finishBlocked || isRequiredStepBlocked;

  const handleNext = () => {
    if (step.id === "company" || step.id === "subscription") {
      void handleRefresh();
    }

    if (isCompanyStep && !officeCreated) {
      toast.error("You need to create a company before continuing.");
      return;
    }

    if (isSubscriptionStep && !subscriptionActive) {
      toast.error("You need to activate the subscription before continuing.");
      return;
    }

    if (!isLast) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    if (!finishBlocked) {
      onComplete();
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshStatus();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const raw = localStorage.getItem(ONBOARDING_STEP_STORAGE_KEY);
    if (!raw) return;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const next = Math.max(0, Math.min(steps.length - 1, Math.floor(parsed)));
    setCurrentStep(next);
  }, [isOpen, steps.length]);

  useEffect(() => {
    if (!isOpen) return;
    const raw = localStorage.getItem(ONBOARDING_MINIMIZED_STORAGE_KEY);
    setIsMinimized(raw === "true");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    localStorage.setItem(ONBOARDING_STEP_STORAGE_KEY, String(currentStep));
  }, [currentStep, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    localStorage.setItem(ONBOARDING_MINIMIZED_STORAGE_KEY, String(isMinimized));
  }, [isMinimized, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (lastAutoNavigatedStepRef.current === step.id) return;

    if (step.id === "company") onGoCompany();
    if (step.id === "subscription") onGoSubscription();
    if (step.id === "tour-overview") onGoOverview();
    if (step.id === "tour-processes") onGoProcesses();
    if (step.id === "tour-team") onGoTeam();

    lastAutoNavigatedStepRef.current = step.id;
  }, [isOpen, onGoCompany, onGoOverview, onGoProcesses, onGoSubscription, onGoTeam, step.id]);

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed right-6 top-6 z-[120] flex max-w-[calc(100vw-24px)] items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-2xl">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
            Operations onboarding
          </p>
          <p className="truncate text-sm font-black text-text">{step.title}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsMinimized(false)}
          className="rounded-xl"
          aria-label="Expand onboarding"
          title="Expand onboarding"
        >
          <RiAddLine className="mr-1" />
          Open
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed right-6 top-6 z-[120] w-[420px] max-w-[calc(100vw-24px)] rounded-3xl border border-border bg-card shadow-2xl">
      <div className="flex items-start justify-between gap-3 rounded-t-3xl border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            {step.id === "company" ? <RiBuilding4Line /> : step.id === "subscription" ? <RiVipCrown2Line /> : <RiCheckDoubleLine />}
          </div>
          <div>
            <h3 className="text-base font-black text-text tracking-tight">{step.title}</h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-subtle text-text-muted transition-colors hover:bg-bg hover:text-text"
          aria-label="Minimize onboarding"
          title="Minimize onboarding"
        >
          <RiSubtractLine className="text-lg" />
        </button>
      </div>

      <div className="h-1.5 w-full overflow-hidden bg-bg-subtle">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm text-text-muted">{step.description}</p>

        <div className="grid grid-cols-2 gap-2">
          <div className={cn("rounded-xl border px-3 py-2 text-xs font-bold", officeCreated ? "border-green-200 bg-green-500/5 text-green-700" : "border-amber-200 bg-amber-500/5 text-amber-700")}>
            Company: {officeCreated ? "OK" : "Pending"}
          </div>
          {shouldShowSubscriptionStatus && (
            <div className={cn("rounded-xl border px-3 py-2 text-xs font-bold", subscriptionActive ? "border-green-200 bg-green-500/5 text-green-700" : "border-amber-200 bg-amber-500/5 text-amber-700")}>
              Subscription: {subscriptionActive ? "Active" : "Pending"}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="rounded-xl"
        >
          <RiArrowLeftLine className="mr-1" /> Back
        </Button>
        <Button onClick={handleNext} disabled={nextDisabled} className="rounded-xl">
          {isRefreshing ? (
            <><RiLoader4Line className="animate-spin mr-1" /> Checking...</>
          ) : isLast ? "Finish" : <>Continue <RiArrowRightLine className="ml-1" /></>}
        </Button>
      </div>
    </div>
  );
}
