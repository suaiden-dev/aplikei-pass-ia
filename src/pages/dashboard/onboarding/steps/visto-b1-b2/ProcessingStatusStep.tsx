import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface ProcessingStatusStepProps {
  status: string;
}

export function ProcessingStatusStep({ status }: ProcessingStatusStepProps) {
  const { lang } = useLanguage();

  const isPending = status === "review_pending" || status === "ds160Processing";
  const isAwaitingReview =
    status === "ds160AwaitingReviewAndSignature" ||
    status === "uploadsUnderReview";

  const getFriendlyStatus = (rawStatus: string, language: string) => {
    switch (rawStatus) {
      case "review_pending":
      case "ds160Processing":
        return language === "pt" ? "Processando DS-160" : "Processing DS-160";
      case "ds160AwaitingReviewAndSignature":
      case "review_assign":
        return language === "pt" ? "Aguardando Revisão" : "Awaiting Review";
      case "uploadsUnderReview":
        return language === "pt"
          ? "Revisando Documentos"
          : "Reviewing Documents";
      case "casvSchedulingPending":
        return language === "pt"
          ? "Aguardando Agendamento"
          : "Awaiting Scheduling";
      case "ds160upload_documents":
        return language === "pt" ? "Aguardando Upload" : "Awaiting Upload";
      default:
        return rawStatus.replace(/_/g, " ");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto space-y-5 min-h-[400px] flex flex-col justify-center">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-[32px] bg-accent/10 text-accent mb-2">
          {isPending ? (
            <Clock className="h-12 w-12 animate-pulse" />
          ) : (
            <ShieldCheck className="h-12 w-12" />
          )}
        </div>

        <h2 className="text-title md:text-title-xl font-black tracking-tight text-foreground">
          {isPending
            ? lang === "pt"
              ? "Processando seus dados"
              : "Processing your data"
            : lang === "pt"
              ? "Documentos Recebidos!"
              : "Documents Received!"}
        </h2>

        <p className="text-body md:text-subtitle text-muted-foreground max-w-md mx-auto leading-relaxed">
          {isPending
            ? lang === "pt"
              ? "Nossa equipe já recebeu suas informações e está trabalhando no preenchimento do seu formulário DS-160."
              : "Our team has received your information and is working on filling out your DS-160 form."
            : lang === "pt"
              ? "Seus documentos foram enviados para nossa revisão final. Você será notificado assim que o processo avançar."
              : "Your documents have been submitted for our final review. You will be notified as soon as the process advances."}
        </p>
      </div>

      <Card className="border-none bg-slate-50 dark:bg-slate-900/50 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden p-5">
        <CardContent className="p-0 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700">
            <div className="h-10 w-10 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
              <Loader2 className="h-5 w-5 text-accent animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {lang === "pt" ? "Status Atual" : "Current Status"}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                {getFriendlyStatus(status, lang as string)}
              </p>
            </div>
          </div>

          <div className="space-y-4 px-2">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {lang === "pt"
                  ? "Você pode acompanhar o progresso em tempo real pelo seu painel."
                  : "You can track progress in real-time through your dashboard."}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {lang === "pt"
                  ? "Caso precisemos de algum dado extra, entraremos em contato."
                  : "Should we need any extra data, we will contact you."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-xs text-muted-foreground italic">
          {lang === "pt"
            ? "Obrigado por confiar na Aplikei Pass!"
            : "Thank you for trusting Aplikei Pass!"}
        </p>
      </div>
    </div>
  );
}
