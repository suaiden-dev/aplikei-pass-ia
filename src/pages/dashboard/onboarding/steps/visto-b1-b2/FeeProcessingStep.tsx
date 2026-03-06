import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Mail,
  ShieldCheck,
  Loader2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FeeProcessingStepProps {
  serviceId: string | null;
  onComplete?: () => void;
}

export function FeeProcessingStep({
  serviceId,
  onComplete,
}: FeeProcessingStepProps) {
  const { lang } = useLanguage();
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

      toast.success(
        lang === "pt"
          ? "Ótimo! Agora vamos para o pagamento."
          : "Great! Now let's proceed to payment.",
      );
      if (onComplete) onComplete();

      // Reload to reflect changes
      window.location.reload();
    } catch (error: any) {
      console.error("Error confirming email:", error);
      toast.error(
        lang === "pt" ? "Erro ao atualizar status." : "Error updating status.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-2xl mb-2">
          <Mail className="h-8 w-8 text-accent animate-bounce" />
        </div>
        <h2 className="text-4xl font-black font-display text-foreground tracking-tight">
          {lang === "pt" ? "Taxa em Processamento" : "Fee Processing"}
        </h2>
        <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
          {lang === "pt"
            ? "Estamos preparando a criação da sua conta no portal oficial do consulado americano."
            : "We are preparing the creation of your account on the official US consulate portal."}
        </p>
      </div>

      <Card className="border-border shadow-2xl rounded-[32px] overflow-hidden bg-card/50 backdrop-blur-md relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <ShieldCheck className="w-32 h-32" />
        </div>

        <CardHeader className="p-8 pb-4">
          <Badge
            variant="outline"
            className="w-fit mb-4 border-accent text-accent"
          >
            {lang === "pt" ? "PRÓXIMA ETAPA" : "NEXT STEP"}
          </Badge>
          <CardTitle className="text-2xl font-bold">
            {lang === "pt"
              ? "Criação de Conta Consular"
              : "Consular Account Creation"}
          </CardTitle>
          <CardDescription className="text-base">
            {lang === "pt"
              ? "Para dar continuidade ao seu visto, criaremos seu acesso oficial."
              : "To continue with your visa, we will create your official access."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-0 space-y-8">
          <div className="grid gap-4">
            <Alert className="bg-slate-50 dark:bg-slate-900 border-none rounded-3xl p-6 shadow-inner">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-white shrink-0 shadow-lg shadow-accent/20">
                  <span className="text-xl font-bold">1</span>
                </div>
                <div className="space-y-1">
                  <AlertTitle className="text-lg font-bold">
                    {lang === "pt"
                      ? "Conta com seu E-mail"
                      : "Account with your Email"}
                  </AlertTitle>
                  <AlertDescription className="text-muted-foreground text-sm uppercase tracking-wide font-medium">
                    {lang === "pt"
                      ? "UMA CONTA SERÁ CRIADA UTILIZANDO SEU EMAIL NO SITE DO CONSULADO"
                      : "AN ACCOUNT WILL BE CREATED USING YOUR EMAIL ON THE CONSULATE SITE"}
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            <Alert className="bg-slate-50 dark:bg-slate-900 border-none rounded-3xl p-6 shadow-inner">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-white shrink-0 shadow-lg shadow-accent/20">
                  <span className="text-xl font-bold">2</span>
                </div>
                <div className="space-y-1">
                  <AlertTitle className="text-lg font-bold">
                    {lang === "pt"
                      ? "Fique Atento ao E-mail"
                      : "Watch your Email"}
                  </AlertTitle>
                  <AlertDescription className="text-muted-foreground text-sm uppercase tracking-wide font-medium">
                    {lang === "pt"
                      ? "FIQUE ATENTO EM SUA CAIXA DE EMAIL PARA CONFIRMAR O SEU EMAIL NO SITE DO CONSULADO"
                      : "STAY TUNED TO YOUR EMAIL INBOX TO CONFIRM YOUR EMAIL ON THE CONSULATE SITE"}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          </div>

          <div className="pt-4">
            <Button
              className="w-full h-auto min-h-16 py-4 px-4 bg-accent hover:bg-green-dark text-white rounded-[24px] shadow-xl shadow-accent/30 font-black text-xs sm:text-sm md:text-lg whitespace-normal transition-all active:scale-[0.98] group relative overflow-hidden"
              disabled={isSaving}
              onClick={handleEmailConfirmed}
            >
              {isSaving ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {lang === "pt"
                      ? "JÁ CONFIRMEI O EMAIL"
                      : "I'VE ALREADY CONFIRMED THE EMAIL"}
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5 shrink-0 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground opacity-60">
            <Info className="h-3 w-3" />
            <span>
              {lang === "pt"
                ? "A segurança dos seus dados é nossa prioridade total."
                : "Data security is our top priority."}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
