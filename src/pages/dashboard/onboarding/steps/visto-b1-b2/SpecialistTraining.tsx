import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PopupButton, useCalendlyEventListener } from "react-calendly";

interface SpecialistTrainingProps {
  onBack: () => void;
  serviceId: string | null;
}

import { useAuth } from "@/contexts/AuthContext";

export function SpecialistTraining({
  onBack,
  serviceId,
}: SpecialistTrainingProps) {
  const { lang } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<"packages" | "success">("packages");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasedPackage, setPurchasedPackage] = useState<number | null>(null);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [userProfile, setUserProfile] = useState<{
    name?: string;
    email?: string;
  }>({});

  useEffect(() => {
    if (authLoading || !user) return;

    const checkSpecialistStatus = async () => {
      if (!serviceId) {
        setIsLoading(false);
        return;
      }

      const { data: service } = await supabase
        .from("user_services")
        .select("specialist_training_data")
        .eq("id", serviceId)
        .single();

      if (service?.specialist_training_data) {
        const trainingData = service.specialist_training_data as Record<
          string,
          unknown
        >;
        const status = trainingData.status as string | undefined;
        const packageType = trainingData.package_type as number | undefined;
        const totalScheduled = trainingData.total_scheduled as
          | number
          | undefined;

        if (status === "paid") {
          setPurchasedPackage(packageType || 1);
          setScheduledCount(totalScheduled || 0);
          setStep("success");
        }
      }
      setIsLoading(false);
    };

    const fetchUserProfile = async () => {
      if (user) {
        setUserProfile({
          name: user.user_metadata?.full_name || user.email?.split("@")[0],
          email: user.email,
        });
      }
    };

    checkSpecialistStatus();
    fetchUserProfile();

    const params = new URLSearchParams(window.location.search);
    if (params.get("specialist_success") === "true") {
      handleSpecialistSuccess();
    }
  }, [serviceId, user, authLoading, handleSpecialistSuccess]);

  useCalendlyEventListener({
    onEventScheduled: (e) => {
      setScheduledCount((prev) => prev + 1);
      toast.success(
        lang === "pt"
          ? "Aula agendada com sucesso!"
          : "Session scheduled successfully!",
      );
    },
  });

  const handlePayment = async (pkgId: number) => {
    if (!serviceId || !user) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "stripe-specialist-checkout",
        {
          body: {
            email: user.email,
            fullName: user.user_metadata?.full_name || "Cliente",
            serviceId,
            packageType: pkgId,
            origin_url: window.location.origin,
          },
        },
      );

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: unknown) {
      console.error("Payment error:", error);
      toast.error(
        lang === "pt" ? "Erro ao iniciar pagamento" : "Error starting payment",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Clock className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  if (step === "success") {
    const pkg = packages.find((p) => p.id === purchasedPackage) || packages[0];
    const isFullyScheduled = scheduledCount >= pkg.classes;

    return (
      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-white dark:bg-slate-900 md:rounded-[40px] md:shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 md:border-none">
          <div className="h-2 bg-accent" />
          <div className="p-6 md:p-10 text-center space-y-4">
            <div className="mx-auto h-16 w-16 md:h-20 md:w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-2">
              <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <h2 className="text-2xl md:text-4xl font-black">
              {lang === "pt"
                ? "Prepare-se para o Sucesso!"
                : "Get Ready for Success!"}
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground">
              {lang === "pt"
                ? `Você adquiriu o ${pkg.name} (${pkg.classes} aulas).`
                : `You purchased the ${pkg.name} (${pkg.classes} sessions).`}
            </p>
          </div>

          <div className="p-4 md:p-10 pt-0 space-y-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 md:p-8 space-y-6 text-center">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="font-black text-lg md:text-xl text-accent">
                    {scheduledCount} / {pkg.classes}{" "}
                    {lang === "pt" ? "Aulas Agendadas" : "Sessions Scheduled"}
                  </p>
                  <span className="text-xs md:text-sm font-bold opacity-60">
                    {Math.round((scheduledCount / pkg.classes) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(scheduledCount / pkg.classes) * 100}
                  className="h-3"
                />
              </div>

              {isFullyScheduled ? (
                <div className="py-10 space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border-2 border-green-100 dark:border-green-900/30">
                    <p className="text-green-600 dark:text-green-400 font-bold text-lg">
                      {lang === "pt"
                        ? "Todas as suas aulas foram agendadas! ✅"
                        : "All your sessions are scheduled! ✅"}
                    </p>
                    <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">
                      {lang === "pt"
                        ? "Verifique seu e-mail para os links das reuniões."
                        : "Check your email for the meeting links."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center space-y-8">
                  <div className="bg-accent/5 p-6 rounded-3xl border border-accent/10 max-w-sm">
                    <p className="text-accent font-bold text-sm leading-relaxed">
                      {lang === "pt"
                        ? "Para garantir 100% de precisão no celular, o agendamento abrirá em uma janela segura."
                        : "To ensure 100% accuracy on mobile, scheduling will open in a secure window."}
                    </p>
                  </div>

                  <PopupButton
                    url={pkg.calendly}
                    rootElement={document.getElementById("root")!}
                    text={
                      lang === "pt"
                        ? "AGENDAR MINHA AULA AGORA"
                        : "SCHEDULE MY SESSION NOW"
                    }
                    prefill={{
                      email: userProfile.email,
                      name: userProfile.name,
                    }}
                    className="w-full md:w-auto px-10 h-16 md:h-20 bg-accent hover:opacity-90 text-white rounded-2xl md:rounded-3xl font-black md:text-lg shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={onBack}
              variant="ghost"
              className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl font-bold text-muted-foreground"
            >
              {lang === "pt" ? "VOLTAR AO PAINEL" : "BACK TO DASHBOARD"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 font-bold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {lang === "pt" ? "Voltar" : "Back"}
        </Button>
      </div>

      <div className="text-center space-y-4 max-w-3xl mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight">
          {lang === "pt"
            ? "Treinamento com Especialista"
            : "Specialist Training"}
        </h2>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          {lang === "pt"
            ? "Simule sua entrevista real com um consultor experiente. Recomendamos o pacote de 3 aulas para uma preparação completa e segura."
            : "Simulate your real interview with an experienced consultant. We recommend the 3-session package for a complete and secure preparation."}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8 pt-4 px-4">
        {packages.map((pkg) => (
          <motion.div
            key={pkg.id}
            whileHover={{ y: -8 }}
            className={cn(
              "relative flex flex-col p-8 rounded-[32px] md:rounded-[40px] border-2 transition-all",
              pkg.recommended
                ? "border-accent bg-accent/5 shadow-2xl shadow-accent/10"
                : "border-slate-100 dark:border-slate-800 bg-card hover:border-slate-200",
            )}
          >
            {pkg.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-6 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                {lang === "pt"
                  ? "MAIS PROCURADO / IDEAL"
                  : "MOST POPULAR / IDEAL"}
              </div>
            )}

            <div className="space-y-4 mb-8">
              <h3 className="text-2xl font-black">{pkg.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-accent">
                  US$ {pkg.price}
                </span>
                <span className="text-muted-foreground font-bold text-sm">
                  {pkg.id === 1
                    ? lang === "pt"
                      ? "/aula"
                      : "/session"
                    : lang === "pt"
                      ? "/total"
                      : "/total"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {pkg.description}
              </p>
            </div>

            <ul className="space-y-4 flex-1 mb-10">
              {pkg.features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 text-sm font-bold items-start"
                >
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                  {lang === "pt" ? feature.pt : feature.en}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handlePayment(pkg.id)}
              disabled={isProcessing}
              className={cn(
                "w-full h-14 rounded-2xl font-black text-xs tracking-widest gap-2",
                pkg.recommended
                  ? "bg-accent hover:bg-green-dark text-white"
                  : "bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90",
              )}
            >
              {isProcessing ? (
                <Clock className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {lang === "pt" ? "ESCOLHER ESTE" : "CHOOSE THIS ONE"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-8 pb-12 px-4">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-[10px] md:text-xs font-bold text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          {lang === "pt"
            ? "Pagamento seguro via Stripe • Acesso imediato ao agendamento"
            : "Secure payment via Stripe • Immediate scheduling access"}
        </div>
      </div>
    </div>
  );
}
