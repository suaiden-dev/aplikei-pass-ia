import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar as CalendarIcon,
  Info,
  ExternalLink,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CASVSchedulingStepProps {
  serviceId: string | null;
  onComplete?: () => void;
}

export function CASVSchedulingStep({
  serviceId,
  onComplete,
}: CASVSchedulingStepProps) {
  const { lang } = useLanguage();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirmSchedule = async () => {
    if (!serviceId || !date) return;

    setIsSaving(true);
    try {
      const selectedDate = format(date, "yyyy-MM-dd");

      // Save date to onboarding_responses or directly to user_services if we have a column
      const { error: responseError } = await supabase
        .from("onboarding_responses")
        .upsert(
          {
            user_service_id: serviceId,
            step_slug: "casv_scheduling",
            data: { preferred_date: selectedDate },
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_service_id,step_slug" },
        );

      if (responseError) throw responseError;

      // Advance status
      const { error: statusError } = await supabase
        .from("user_services")
        .update({ status: "casvFeeProcessing" })
        .eq("id", serviceId);

      if (statusError) throw statusError;

      toast.success(
        lang === "pt"
          ? "Data preferencial salva com sucesso!"
          : "Preferred date saved successfully!",
      );
      if (onComplete) onComplete();

      // Reload to reflect changes
      window.location.reload();
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      toast.error(
        lang === "pt"
          ? "Erro ao salvar agendamento."
          : "Error saving schedule.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold font-display text-foreground tracking-tight">
          {lang === "pt" ? "Agendamento CASV" : "CASV Scheduling"}
        </h2>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
          {lang === "pt"
            ? "Selecione sua data de preferência para o agendamento no CASV e Consulado."
            : "Select your preferred date for CASV and Consulate scheduling."}
        </p>
      </div>

      <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30 rounded-2xl">
        <Info className="h-5 w-5 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-400 text-sm font-medium leading-relaxed">
          {lang === "pt"
            ? "A DATA E HORÁRIO DEPENDERÃO DA DISPONIBILIDADE. Esta é apenas uma indicação de sua preferência."
            : "THE DATE AND TIME WILL DEPEND ON AVAILABILITY. This is only an indication of your preference."}
          <div className="mt-2">
            <a
              href="https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/global-visa-wait-times.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-amber-900 dark:text-amber-300 underline underline-offset-4 hover:text-amber-700 transition-colors"
            >
              {lang === "pt"
                ? "Confira as disponibilidades oficiais"
                : "Check official availability"}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="border-border shadow-xl rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-muted/30 border-b border-border">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-accent" />
              {lang === "pt"
                ? "Calendário de Preferência"
                : "Preference Calendar"}
            </CardTitle>
            <CardDescription>
              {lang === "pt"
                ? "Selecione o dia que melhor se encaixa para você."
                : "Select the day that best fits you."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-xl border border-border pointer-events-auto"
              locale={lang === "pt" ? ptBR : undefined}
              disabled={(date) => date < new Date()}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border shadow-lg rounded-3xl bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">
                {lang === "pt" ? "Resumo da Atividade" : "Activity Summary"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/40 rounded-2xl border border-border/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">
                    {lang === "pt" ? "Data Selecionada" : "Selected Date"}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-accent/10 text-accent border-none font-bold"
                  >
                    {date
                      ? format(date, "dd/MM/yyyy")
                      : lang === "pt"
                        ? "Nenhuma"
                        : "None"}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <p>
                      {lang === "pt"
                        ? "Iremos buscar as vagas mais próximas desta data."
                        : "We will look for spots closest to this date."}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <p>
                      {lang === "pt"
                        ? "O suporte entrará em contato para confirmar o agendamento final."
                        : "Support will contact you to confirm the final schedule."}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-14 bg-accent hover:bg-green-dark text-white rounded-2xl shadow-lg shadow-accent/20 font-bold text-lg transition-all active:scale-95 group"
                disabled={!date || isSaving}
                onClick={handleConfirmSchedule}
              >
                {isSaving ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    {lang === "pt"
                      ? "Confirmar Preferência"
                      : "Confirm Preference"}
                    <CheckCircle2 className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <p className="text-[10px] text-center text-muted-foreground px-4 italic">
            {lang === "pt"
              ? "Ao confirmar, nossa equipe iniciará o processo de monitoramento de vagas nos sistemas consulares."
              : "By confirming, our team will start the spot monitoring process in the consular systems."}
          </p>
        </div>
      </div>
    </div>
  );
}
