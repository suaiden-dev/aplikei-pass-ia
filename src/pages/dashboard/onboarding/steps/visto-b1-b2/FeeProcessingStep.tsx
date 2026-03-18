import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/presentation/components/atoms/card";
import { Button } from "@/presentation/components/atoms/button";
import { Alert, AlertDescription, AlertTitle } from "@/presentation/components/atoms/alert";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/presentation/components/atoms/dialog";
import {
  Mail,
  ShieldCheck,
  Loader2,
  ExternalLink,
  ArrowRight,
  Info,
  Maximize2,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/presentation/components/atoms/badge";
import confirmationEmailImg from "@/assets/email/confirmation_email.png";

interface FeeProcessingStepProps {
  serviceId: string | null;
  hasConsularCredentials?: boolean;
  onComplete?: () => void;
}

export function FeeProcessingStep({
  serviceId,
  hasConsularCredentials,
  onComplete,
}: FeeProcessingStepProps) {
  const { lang, t } = useLanguage();
  const f = t.onboardingPage.feeProcessing;
  const [isSaving, setIsSaving] = useState(false);

  const handleEmailConfirmed = async () => {
    if (!serviceId) return;

    setIsSaving(true);
    try {
      // Advance status to casvPaymentPending
      const { error: statusError } = await supabase
        .from("user_services")
        .update({ status: "casvPaymentPending" })
        .eq("id", serviceId);

      if (statusError) throw statusError;

      toast.success(f.successMsg?.[lang] || "Status updated!");
      if (onComplete) onComplete();

      // Reload to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error confirming email:", error);
      toast.error(f.errorUpdatingStatus?.[lang] || "Error updating status.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-md mb-2">
          <Mail className="h-8 w-8 text-accent" />
        </div>
        <h2 className="text-title md:text-title-xl font-black font-display text-foreground tracking-tight">
          {f.title[lang]}
        </h2>
        <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
          {f.desc[lang]}
        </p>
      </div>

      {hasConsularCredentials ? (
        <Card className="border-border shadow-2xl rounded-[32px] overflow-hidden bg-card/50 backdrop-blur-md relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldCheck className="w-32 h-32" />
          </div>

          <CardHeader className="p-4 sm:p-5 pb-4">
            <Badge
              variant="outline"
              className="w-fit mb-4 border-accent text-accent"
            >
              {f.nextStep[lang]}
            </Badge>
            <CardTitle className="text-title font-bold">
              {f.consularAccountTitle[lang]}
            </CardTitle>
            <CardDescription className="text-base">
              {f.consularAccountDesc[lang]}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 pt-0 space-y-4 sm:space-y-5">
            <div className="grid gap-4">
              <Alert className="bg-slate-50 dark:bg-slate-900 border-none rounded-3xl p-4 sm:p-5 shadow-inner">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-white shrink-0 shadow-lg shadow-accent/20">
                    <span className="text-subtitle font-bold">1</span>
                  </div>
                  <div className="space-y-1">
                    <AlertTitle className="text-base sm:text-lg font-bold">
                      {f.accountEmailTitle[lang]}
                    </AlertTitle>
                    <AlertDescription className="text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed">
                      {f.accountEmailDesc[lang]}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>

              <Alert className="bg-slate-50 dark:bg-slate-900 border-none rounded-3xl p-4 sm:p-5 shadow-inner">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-white shrink-0 shadow-lg shadow-accent/20">
                    <span className="text-subtitle font-bold">2</span>
                  </div>
                  <div className="space-y-3 flex-1">
                    <AlertTitle className="text-base sm:text-lg font-bold">
                      {f.watchEmailTitle[lang]}
                    </AlertTitle>
                    <AlertDescription className="text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed">
                      {f.watchEmailDesc[lang]}
                    </AlertDescription>
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="mt-4 rounded-xl overflow-hidden border border-border shadow-sm relative group cursor-pointer">
                          <img 
                            src={confirmationEmailImg} 
                            alt="Email de Confirmação" 
                            className="w-full h-auto object-cover max-h-[300px] object-top transition-transform duration-300 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <div className="bg-white/20 p-3 rounded-full backdrop-blur-md border border-white/30 text-white">
                              <Maximize2 className="w-6 h-6" />
                            </div>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl w-[95vw] p-1 sm:p-2 bg-transparent border-none shadow-none mt-4">
                        <img 
                          src={confirmationEmailImg} 
                          alt="Email de Confirmação (Completo)" 
                          className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" 
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Alert>
            </div>

            <div className="pt-4 mt-8">
              <Button
                className="w-full h-auto min-h-16 py-4 px-4 bg-accent hover:bg-green-dark text-white rounded-[24px] shadow-xl shadow-accent/30 font-black text-xs sm:text-sm md:text-lg whitespace-normal transition-all active:scale-[0.98] group relative overflow-hidden"
                disabled={isSaving}
                onClick={handleEmailConfirmed}
              >
                {isSaving ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10 flex items-center justify-center gap-2 text-center w-full">
                      {f.alreadyConfirmedEmail[lang]}
                      <ArrowRight className="hidden sm:block h-4 w-4 md:h-5 md:w-5 shrink-0 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground opacity-60">
              <Info className="h-3 w-3" />
              <span>
                {f.securityPriority?.[lang] || "Your data is secure"}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border shadow-xl rounded-2xl md:rounded-[32px] overflow-hidden bg-card/80 backdrop-blur-md">
          <CardContent className="p-4 sm:p-10 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 min-h-[250px] sm:min-h-[300px]">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
              <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-accent animate-spin relative z-10" />
            </div>
            <div className="space-y-3">
              <h3 className="text-title md:text-title-xl font-black font-display text-foreground">
                {f.creatingCredentialsTitle[lang]}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {f.creatingCredentialsDesc[lang]}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
