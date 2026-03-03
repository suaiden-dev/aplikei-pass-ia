import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const statuses = [
  "ds160InProgress",
  "ds160Processing",
  "ds160AwaitingReviewAndSignature",
  "uploadsUnderReview",
  "casvSchedulingPending",
  "casvFeeProcessing",
  "casvPaymentPending",
  "awaitingInterview",
  "approved",
  "rejected",
];

const statusLabels: Record<string, string> = {
  ds160InProgress: "DS-160: Em Andamento",
  ds160Processing: "DS-160: Processando",
  ds160AwaitingReviewAndSignature: "DS-160: Em Revisão",
  uploadsUnderReview: "Documentos em Análise",
  casvSchedulingPending: "Aguardando Agendamento",
  casvFeeProcessing: "Taxa em Processamento",
  casvPaymentPending: "Pagamento Pendente",
  awaitingInterview: "Aguardando Entrevista",
  approved: "Visto Aprovado",
  rejected: "Visto Negado",
  // Legacy mappings
  active: "DS-160: Em Andamento",
  review_pending: "DS-160: Processando",
  review_assign: "DS-160: Em Revisão",
  completed: "Visto Aprovado",
};

const statusDescriptions: Record<string, string> = {
  ds160InProgress:
    "O cliente iniciou o formulário e está preenchendo as informações pessoais.",
  ds160Processing:
    "As informações foram enviadas e estão sendo preparadas para a revisão técnica.",
  ds160AwaitingReviewAndSignature:
    "O formulário está completo e aguarda a conferência final e assinatura digital.",
  uploadsUnderReview:
    "Os documentos de suporte (passaporte, fotos, etc.) estão sendo validados pela nossa equipe.",
  casvSchedulingPending:
    "O sistema está monitorando a abertura de vagas nos postos consulares para agendamento.",
  casvFeeProcessing:
    "A confirmação do pagamento da taxa consular (MRV) está sendo processada pelo banco.",
  casvPaymentPending:
    "O boleto ou link de pagamento foi gerado e aguarda a quitação pelo cliente.",
  awaitingInterview:
    "O agendamento foi realizado com sucesso. O cliente deve comparecer na data e local marcados.",
  approved:
    "O consulado aprovou a solicitação de visto. Processo finalizado com sucesso.",
  rejected:
    "Infelizmente o visto foi negado nesta solicitação. Verifique os motivos com o consulado.",
  // Legacy descriptions
  active: "O cliente iniciou o formulário e está preenchendo as informações.",
  review_pending: "As informações estão sendo preparadas para revisão.",
  review_assign: "O formulário aguarda a conferência final.",
  completed: "Visto aprovado e processo finalizado.",
};

export function AdminStatusTimeline({ status }: { status?: string }) {
  const currentIndex = statuses.indexOf(status || "");
  const isLegacy = currentIndex === -1 && status;

  // If legacy, we might want to map to a logical step
  let effectiveIndex = currentIndex;
  if (isLegacy) {
    if (status === "active") effectiveIndex = 0;
    if (status === "review_pending") effectiveIndex = 1;
    if (status === "review_assign") effectiveIndex = 2;
    if (status === "completed") effectiveIndex = 8; // approved
  }

  const label = statusLabels[status || ""] || "Status Desconhecido";
  const isRejected = status === "rejected";
  const isApproved = status === "approved";

  return (
    <div className="flex flex-col gap-1.5 py-1">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-xs font-bold",
            isApproved
              ? "text-green-600 dark:text-green-400"
              : isRejected
                ? "text-red-500"
                : "text-foreground",
          )}
        >
          {label}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium">
          {effectiveIndex >= 0
            ? `${effectiveIndex + 1}/${statuses.length}`
            : "0/10"}
        </span>
      </div>

      <TooltipProvider>
        <div className="flex gap-1">
          {statuses.map((s, i) => {
            const isActive = effectiveIndex >= i;
            let dotColor = "bg-muted";

            if (isActive) {
              if (isRejected && i === effectiveIndex) {
                dotColor = "bg-red-500";
              } else if (
                isApproved ||
                effectiveIndex > i ||
                currentIndex === i
              ) {
                dotColor = "bg-accent";
              } else {
                dotColor = "bg-accent/40";
              }
            }

            return (
              <Tooltip key={s}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full transition-all duration-300",
                      dotColor,
                      isActive && "ring-1 ring-offset-1 ring-accent/20",
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-[200px] py-2 px-3"
                >
                  <p className="font-bold text-[10px] mb-1">
                    {statusLabels[s]}
                  </p>
                  <p className="text-[10px] leading-tight text-muted-foreground">
                    {statusDescriptions[s]}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
