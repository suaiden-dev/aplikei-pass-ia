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
  ds160AwaitingReviewAndSignature: "DS-160: Aguardando Revisão/Assinatura",
  uploadsUnderReview: "Uploads: Em Revisão",
  casvSchedulingPending: "CASV: Agendamento Pendente",
  casvFeeProcessing: "CASV: Taxa em Processamento",
  casvPaymentPending: "CASV: Pagamento Pendente",
  awaitingInterview: "Aguardando Entrevista",
  approved: "Aprovado",
  rejected: "Rejeitado",
  // Legacy mappings
  active: "DS-160: Em Andamento",
  review_pending: "DS-160: Processando",
  review_assign: "DS-160: Aguardando Revisão",
  completed: "Aprovado",
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
                <TooltipContent side="bottom" className="text-[10px] py-1 px-2">
                  <p>{statusLabels[s]}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
