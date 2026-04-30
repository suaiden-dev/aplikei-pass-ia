import { type ElementType } from "react";
import { RiCheckDoubleLine } from "react-icons/ri";
import { cn } from "../utils/cn";

export interface Step {
  id: string;
  title: string;
  icon?: ElementType;
}

interface StepTimelineProps {
  current: number;
  steps: Step[];
  className?: string;
  variant?: "full" | "compact";
}

export function StepTimeline({
  current,
  steps,
  className,
  variant = "full",
}: StepTimelineProps) {
  const progress = Math.round((current / steps.length) * 100);
  const currentStep = steps[current - 1] ?? steps[0];

  return (
    <div
      className={cn(
        "bg-card border border-border/80 shadow-sm overflow-hidden transition-all duration-300",
        variant === "full" ? "rounded-[32px]" : "rounded-3xl",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-6 py-6 border-b border-border",
          variant === "full" && "bg-[linear-gradient(135deg,rgba(26,86,219,0.06),rgba(255,255,255,0.96))]"
        )}
      >
        <div>
          {variant === "full" && (
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-1">
              Etapas do processo
            </p>
          )}
          <h2 className="text-xl font-black text-text tracking-tight uppercase">
            {currentStep?.title}
          </h2>
        </div>

        <div className="min-w-[140px] lg:text-right">
          <p className="text-[11px] font-black uppercase tracking-widest text-text-muted mb-1">
            Progresso
          </p>
          <div className="flex items-end gap-2 lg:justify-end">
            <p className="text-2xl font-black text-text leading-none">{progress}%</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted pb-0.5">
              {current}/{steps.length}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="h-2 rounded-full bg-bg-subtle overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-6 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex min-w-max items-start">
            {steps.map((step, idx) => {
              const stepNumber = idx + 1;
              const isLast = idx === steps.length - 1;
              const isCurrent = stepNumber === current;
              const isComplete = stepNumber < current;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-start">
                  <div className="flex min-w-[140px] flex-col">
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 text-sm font-black transition-all duration-300",
                          isCurrent
                            ? "border-primary/20 bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                            : isComplete
                            ? "border-success/20 bg-success text-white"
                            : "border-border bg-card text-text-muted"
                        )}
                      >
                        {isComplete ? (
                          <RiCheckDoubleLine className="text-lg" />
                        ) : Icon ? (
                          <Icon className="text-lg" />
                        ) : (
                          stepNumber
                        )}
                      </div>

                      {!isLast && (
                        <div className="mx-2 h-1 w-12 rounded-full bg-border overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isComplete ? "bg-success" : "bg-transparent"
                            )}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pr-4">
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-wider transition-colors duration-300",
                        isCurrent ? "text-primary" : isComplete ? "text-success" : "text-text-muted"
                      )}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
