import { RiCheckLine } from "react-icons/ri";
import { cn } from "@shared/utils/cn";

export interface OnboardingStepperProps {
  slug: string;
  stepIdx: number;
  totalSteps: number;
}

export function OnboardingStepper({ slug, stepIdx, totalSteps }: OnboardingStepperProps) {
  // Define milestones based on process type
  const getMilestones = () => {
    const isCOS = slug.includes("status") || slug.includes("cos") || slug.includes("eos");
    
    if (isCOS) {
      return [
        { label: "Formulário", start: 0, end: 0 },
        { label: "Documentos", start: 1, end: 1 },
        { label: "Análise", start: 2, end: 12 },
        { label: "RFE / Resposta", start: 13, end: 18 },
        { label: "Resultado", start: 19, end: 20 },
      ];
    }
    
    const isF1 = slug.includes("f1");
    if (isF1) {
      return [
        { label: "Formulário DS-160", start: 0, end: 0 },
        { label: "Documentos I-20", start: 1, end: 1 },
        { label: "Revisão e Envio", start: 2, end: 4 },
        { label: "Taxas Consulares", start: 5, end: 9 },
        { label: "Agendamento", start: 10, end: 12 },
      ];
    }

    // Default B1/B2
    return [
      { label: "Formulário DS-160", start: 0, end: 1 },
      { label: "Revisão e Assinatura", start: 2, end: 4 },
      { label: "Credenciais e Taxas", start: 5, end: 8 },
      { label: "Agendamento", start: 9, end: 9 },
      { label: "Preparação Final", start: 10, end: 10 },
    ];
  };

  const milestones = getMilestones();
  
  // Find current active milestone
  const activeMilestoneIdx = milestones.findIndex(
    (m) => stepIdx >= m.start && stepIdx <= m.end
  );
  
  const currentActiveMilestone = milestones[activeMilestoneIdx] || milestones[0];

  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between w-full max-w-2xl mx-auto px-4 py-2">
        {milestones.map((milestone, idx) => {
          const isCompleted = idx < activeMilestoneIdx;
          const isActive = idx === activeMilestoneIdx;
          
          return (
            <div key={milestone.label} className="flex-1 flex items-center last:flex-none">
              {/* Node */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 border-2 shadow-sm",
                    isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : isActive
                      ? "bg-primary border-primary text-white ring-4 ring-primary/20 scale-110"
                      : "bg-card border-border text-text-muted"
                  )}
                >
                  {isCompleted ? (
                    <RiCheckLine className="text-base stroke-[2]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "absolute top-10 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                    isActive ? "text-primary" : "text-text-muted"
                  )}
                >
                  {milestone.label}
                </span>
              </div>
              
              {/* Connector line */}
              {idx < milestones.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-border relative overflow-hidden">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-500",
                      isCompleted ? "w-full" : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="flex md:hidden flex-col gap-1 w-full bg-primary/5 border border-primary/10 rounded-xl px-3 py-2 shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-[9px] font-black uppercase tracking-widest text-primary leading-tight">
          <span>{currentActiveMilestone.label}</span>
          <span>Etapa {stepIdx + 1}/{totalSteps}</span>
        </div>
        <div className="w-full h-1 bg-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((stepIdx + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
