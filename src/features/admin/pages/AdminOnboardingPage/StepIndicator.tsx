import { cn } from "@shared/utils/cn";
import { RiCheckLine } from "react-icons/ri";

const STEP_LABELS: Record<string, string> = {
  company: "Create your company",
  subscription: "Activate subscription",
  products: "Configure your services",
  done: "You're all set",
};

type Step = "company" | "subscription" | "products" | "done";

interface StepIndicatorProps {
  steps: Step[];
  currentStep: Step;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="w-full max-w-xl mx-auto space-y-3">
      {/* Progress bar */}
      <div className="h-1 w-full bg-bg-subtle rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps row — dots only, no labels per-step */}
      <div className="flex items-center justify-center gap-3">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={step} className="flex items-center gap-3">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 shrink-0",
                  isDone && "bg-success text-white",
                  isCurrent && "bg-primary text-white shadow-md shadow-primary/30",
                  !isDone && !isCurrent && "bg-bg-subtle border-2 border-border text-text-muted",
                )}
              >
                {isDone ? (
                  <RiCheckLine className="text-xs" />
                ) : isCurrent ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div className={cn("w-8 h-px transition-colors duration-500", idx < currentIndex ? "bg-primary/40" : "bg-border")} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current step label — single line, always fits */}
      <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-primary">
        {STEP_LABELS[currentStep]}
      </p>
    </div>
  );
}
