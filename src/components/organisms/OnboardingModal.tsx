import { useEffect, useMemo, useRef, useState } from "react";
import { RiArrowLeftLine, RiArrowRightLine, RiBuilding4Line, RiCheckDoubleLine, RiLoader4Line, RiVipCrown2Line } from "react-icons/ri";
import { Button } from "../atoms/button";
import { cn } from "../../utils/cn";

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
  const lastAutoNavigatedStepRef = useRef<string | null>(null);

  const requirementsDone = officeCreated && subscriptionActive;

  const steps: Step[] = useMemo(
    () => [
      {
        id: "welcome",
        title: "Onboarding da operação",
        description:
          "Vamos configurar sua conta em etapas rápidas. Você precisa concluir empresa e assinatura para liberar o restante da plataforma.",
      },
      {
        id: "company",
        title: "Etapa 1: Criar empresa",
        description: officeCreated
          ? "Empresa detectada com sucesso."
          : "Preencha o Company Profile e salve para criar sua empresa.",
      },
      {
        id: "subscription",
        title: "Etapa 2: Ativar inscrição",
        description: subscriptionActive
          ? "Inscrição ativa detectada."
          : "Ative um plano em Subscription para liberar recursos operacionais.",
      },
      {
        id: "tour-overview",
        title: "Tour: Overview",
        description:
          "No Overview você acompanha indicadores principais da operação, receita e andamento geral.",
      },
      {
        id: "tour-processes",
        title: "Tour: Processes",
        description:
          "Em Processes você gerencia o fluxo dos clientes, aprova etapas e acompanha pendências.",
      },
      {
        id: "tour-team",
        title: "Tour: Team",
        description:
          "Em Team você adiciona colaboradores, ajusta permissões e organiza sua estrutura.",
      },
      {
        id: "finish",
        title: "Finalizar onboarding",
        description: requirementsDone
          ? "Tudo pronto. Clique em Finish para concluir."
          : "Finish só será liberado quando empresa e inscrição estiverem concluídas.",
      },
    ],
    [officeCreated, onGoCompany, onGoOverview, onGoProcesses, onGoSubscription, onGoTeam, requirementsDone, subscriptionActive],
  );

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const finishBlocked = isLast && !requirementsDone;

  const handleNext = () => {
    if (step.id === "company" || step.id === "subscription") {
      void handleRefresh();
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
    localStorage.setItem(ONBOARDING_STEP_STORAGE_KEY, String(currentStep));
  }, [currentStep, isOpen]);

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

  return (
    <div className="fixed bottom-6 right-6 z-[120] w-[420px] max-w-[calc(100vw-24px)] rounded-3xl border border-border bg-card shadow-2xl">
      <div className="h-1.5 w-full overflow-hidden rounded-t-3xl bg-bg-subtle">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            {step.id === "company" ? <RiBuilding4Line /> : step.id === "subscription" ? <RiVipCrown2Line /> : <RiCheckDoubleLine />}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">Etapa {currentStep + 1}/{steps.length}</p>
            <h3 className="text-base font-black text-text tracking-tight">{step.title}</h3>
          </div>
        </div>

        <p className="text-sm text-text-muted">{step.description}</p>

        <div className="grid grid-cols-2 gap-2">
          <div className={cn("rounded-xl border px-3 py-2 text-xs font-bold", officeCreated ? "border-green-200 bg-green-500/5 text-green-700" : "border-amber-200 bg-amber-500/5 text-amber-700")}>
            Empresa: {officeCreated ? "OK" : "Pendente"}
          </div>
          <div className={cn("rounded-xl border px-3 py-2 text-xs font-bold", subscriptionActive ? "border-green-200 bg-green-500/5 text-green-700" : "border-amber-200 bg-amber-500/5 text-amber-700")}>
            Inscrição: {subscriptionActive ? "Ativa" : "Pendente"}
          </div>
        </div>

      </div>

      <div className="p-4 border-t border-border flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="rounded-xl"
        >
          <RiArrowLeftLine className="mr-1" /> Voltar
        </Button>
        <Button onClick={handleNext} disabled={finishBlocked} className="rounded-xl">
          {isRefreshing ? (
            <><RiLoader4Line className="animate-spin mr-1" /> Verificando...</>
          ) : isLast ? "Finish" : <>Continuar <RiArrowRightLine className="ml-1" /></>}
        </Button>
      </div>
    </div>
  );
}
