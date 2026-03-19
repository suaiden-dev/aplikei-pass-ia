import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

const statuses = [
  {
    id: "ds160InProgress",
    label: "1. DS-160: Preenchimento",
    description:
      "O cliente está preenchendo as informações iniciais do formulário DS-160.",
  },
  {
    id: "ds160Processing",
    label: "2. DS-160: Processando",
    description:
      "O formulário foi enviado para processamento e geração de dados de segurança.",
  },
  {
    id: "ds160upload_documents",
    label: "3. DS-160: Anexar Documentos",
    description:
      "O cliente deve anexar o formulário assinado e o comprovante de envio.",
  },
  {
    id: "ds160AwaitingReviewAndSignature",
    label: "4. DS-160: Revisão e Assinatura",
    description:
      "O administrador está revisando os documentos anexados pelo cliente.",
  },
  {
    id: "casvSchedulingPending",
    label: "CASV: Agendamento Pendente",
    description:
      "Aguardando definição de data para coleta de biometria no CASV.",
  },
  {
    id: "casvFeeProcessing",
    label: "CASV: Taxa em Processamento",
    description:
      "Pagamento da taxa MRV em processamento ou aguardando compensação.",
  },
  {
    id: "casvPaymentPending",
    label: "CASV: Pagamento Pendente",
    description:
      "Aguardando o envio do comprovante de pagamento da taxa pelo cliente.",
  },
  {
    id: "awaitingInterview",
    label: "Aguardando Entrevista",
    description:
      "Agendamento confirmado. O cliente aguarda a data da entrevista no consulado.",
  },
  {
    id: "approved",
    label: "Aprovado",
    description: "Visto aprovado e processo concluído com sucesso.",
  },
  {
    id: "rejected",
    label: "Rejeitado",
    description:
      "O processo foi encerrado devido à negativa do visto ou cancelamento.",
  },
];

interface AdminVerticalTimelineProps {
  currentStatus?: string;
}

export function AdminVerticalTimeline({
  currentStatus,
}: AdminVerticalTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentIndex = statuses.findIndex((s) => s.id === currentStatus);

  // Map legacy statuses if needed
  let effectiveIndex = currentIndex;
  if (currentIndex === -1) {
    if (currentStatus === "active") effectiveIndex = 0;
    else if (currentStatus === "review_pending") effectiveIndex = 1;
    else if (currentStatus === "review_assign") effectiveIndex = 2;
    else if (currentStatus === "uploadsUnderReview") effectiveIndex = 3;
    else if (currentStatus === "completed") effectiveIndex = 8;
  }

  const visibleStatuses = isExpanded
    ? statuses
    : statuses.slice(0, Math.max(effectiveIndex + 1, 3));

  return (
    <div className="space-y-4">
      <div className="relative flex flex-col gap-0">
        {statuses.map((step, index) => {
          const isPast = effectiveIndex > index;
          const isCurrent = effectiveIndex === index;
          const isFuture = effectiveIndex < index;

          if (!isExpanded && index > effectiveIndex && index > 2) return null;

          return (
            <div key={step.id} className="relative flex gap-4 pb-4 last:pb-0">
              {/* Line */}
              {index !==
                (isExpanded
                  ? statuses.length - 1
                  : Math.max(effectiveIndex, 2)) && (
                <div
                  className={cn(
                    "absolute left-[11px] top-6 bottom-0 w-[2px] -ml-[1px]",
                    isPast ? "bg-accent" : "bg-muted",
                  )}
                />
              )}

              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center">
                {isPast ? (
                  <div className="h-[22px] w-[22px] rounded-full bg-accent flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  </div>
                ) : isCurrent ? (
                  <div className="h-[22px] w-[22px] rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  </div>
                ) : (
                  <div className="h-[22px] w-[22px] rounded-full bg-muted border-2 border-muted-foreground/20 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <p
                  className={cn(
                    "text-xs font-bold leading-none mb-1",
                    isCurrent
                      ? "text-accent"
                      : isPast
                        ? "text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-[10px] text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 duration-500">
                    {step.description}
                  </p>
                )}
                {isExpanded && !isCurrent && (
                  <p className="text-[10px] text-muted-foreground leading-relaxed opacity-60">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase tracking-wider text-accent hover:bg-accent/5 rounded-md transition-colors border border-accent/10 border-dashed"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-3 w-3" />
            Recolher Timeline
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3" />
            Ver Todos os Passos
          </>
        )}
      </button>
    </div>
  );
}
