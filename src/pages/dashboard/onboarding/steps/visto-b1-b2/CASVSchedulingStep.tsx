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
  const { lang, t } = useLanguage();
  const o = t.onboardingPage;
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

      toast.success(o.preferredDateSaved[lang]);
      if (onComplete) onComplete();

      // Reload to reflect changes
      window.location.reload();
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      toast.error(o.errorSavingSchedule[lang]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-title-xl font-bold font-display text-foreground tracking-tight">
          {o.casvSchedulingTitle[lang]}
        </h2>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
          {o.casvSchedulingDesc[lang]}
        </p>
      </div>

      <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30 rounded-md [&>svg~*]:pl-9 md:[&>svg~*]:pl-10">
        <Info className="h-5 w-5 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-400 text-sm font-medium leading-relaxed">
          {o.casvSchedulingAlert[lang]}
          <div className="mt-2">
            <a
              href="https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/global-visa-wait-times.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-amber-900 dark:text-amber-300 underline underline-offset-4 hover:text-amber-700 transition-colors"
            >
              {o.officialAvailability[lang]}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <Card className="border-border shadow-xl rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-muted/30 border-b border-border">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-accent" />
              {o.preferenceCalendar[lang]}
            </CardTitle>
            <CardDescription>
              {o.selectDayFits[lang]}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 flex justify-center overflow-x-auto">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border border-border pointer-events-auto max-w-full"
              locale={lang === "pt" ? ptBR : undefined}
              disabled={(date) => date < new Date()}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border shadow-lg rounded-3xl bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">
                {o.activitySummary[lang]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/40 rounded-md border border-border/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">
                    {o.selectedDate[lang]}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-accent/10 text-accent border-none font-bold"
                  >
                    {date
                      ? format(date, "dd/MM/yyyy")
                      : o.none[lang]}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <p>
                      {o.spotsClosest[lang]}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <p>
                      {o.supportContactConfirm[lang]}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-12 md:h-14 bg-accent hover:bg-green-dark text-white rounded-md shadow-lg shadow-accent/20 font-bold text-base md:text-lg transition-all active:scale-95 group"
                disabled={!date || isSaving}
                onClick={handleConfirmSchedule}
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
                ) : (
                  <>
                    {o.confirmPreference[lang]}
                    <CheckCircle2 className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform shrink-0" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <p className="text-[10px] text-center text-muted-foreground px-4 italic">
            {o.monitoringStartDesc[lang]}
          </p>
        </div>
      </div>
    </div>
  );
}
