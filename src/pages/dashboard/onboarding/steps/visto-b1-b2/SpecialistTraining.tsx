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
  mode?: "training" | "review";
}

import { useAuth } from "@/contexts/AuthContext";

export function SpecialistTraining({
  onBack,
  serviceId,
  mode = "training",
}: SpecialistTrainingProps) {
  const { lang, t } = useLanguage();
  const st = t.onboardingPage.specialistTraining;
  const ig = t.onboardingPage.interviewGuide;
  const { user, loading: authLoading } = useAuth();

  const trainingPackages = [
    {
      id: 1,
      name: st.individual,
      classes: 1,
      price: 49,
      recommended: false,
      description: st.trainingSession,
      features: [
        st.mentoring45 || "45 min de mentoria",
        st.interviewSim || "Simulado de perguntas",
        st.immediateFeedback || "Feedback imediato",
      ],
      calendly:
        "https://calendly.com/infothefutureimmigration/treinamento-entrevista",
    },
    {
      id: 2,
      name: st.bronzePackage,
      classes: 2,
      price: 89,
      recommended: false,
      description: st.sessions2Training || "2 Aulas de Treinamento",
      features: [
        st.mentoring2x45 || "2x 45 min de mentoria",
        st.deepProfileAnalysis || "Análise profunda de perfil",
        st.advancedSim || "Simulado avançado",
        st.whatsappSupport || "Suporte via WhatsApp",
      ],
      calendly:
        "https://calendly.com/infothefutureimmigration/treinamento-entrevista",
    },
    {
      id: 3,
      name: st.goldPackage || "Pacote Gold",
      classes: 3,
      price: 119,
      recommended: true,
      description: st.sessions3Training || "3 Aulas de Treinamento",
      features: [
        st.mentoring3x45 || "3x 45 min de mentoria",
        st.fullPreparation || "Preparação Completa",
        st.responseStrategy || "Estratégia de Resposta",
        st.documentReview || "Revisão de Documentos",
        st.vipSupport || "Suporte VIP",
      ],
      calendly:
        "https://calendly.com/infothefutureimmigration/treinamento-entrevista",
    },
  ];

  const reviewPackages = [
    {
      id: 4,
      name: st.reviewTopic,
      classes: 1,
      price: 49,
      recommended: false,
      description: st.reviewDescShort || "Análise da recusa e plano de ação",
      features: [
        st.detailedRefusalAnalysis || "Análise detalhada da recusa",
        st.specialistMentoring45 || "45 min com especialista",
        st.customActionPlan || "Plano de ação personalizado",
        st.nextStepsGuidance || "Orientação para próximos passos",
      ],
      calendly:
        "https://calendly.com/infothefutureimmigration/treinamento-entrevista",
    },
  ];

  const packages = mode === "review" ? reviewPackages : trainingPackages;
  const dataColumn =
    mode === "review" ? "specialist_review_data" : "specialist_training_data";

  const [step, setStep] = useState<"packages" | "success">("packages");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasedPackage, setPurchasedPackage] = useState<number | null>(null);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [userProfile, setUserProfile] = useState<{
    name?: string;
    email?: string;
  }>({});

  const handleSpecialistSuccess = useCallback(() => {
    setStep("success");
    toast.success(st.paymentProcessed);
    const url = new URL(window.location.href);
    url.searchParams.delete("specialist_success");
    window.history.replaceState({}, document.title, url.toString());
  }, [st.paymentProcessed]);

  useEffect(() => {
    if (authLoading || !user) return;

    const checkSpecialistStatus = async () => {
      if (!serviceId) {
        setIsLoading(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: service } = (await supabase
        .from("user_services")
        .select("specialist_training_data, specialist_review_data")
        .eq("id", serviceId)
        .single()) as any;

      if (service) {
        const relevantData =
          mode === "review"
            ? service.specialist_review_data
            : service.specialist_training_data;

        if (relevantData) {
          const trainingData = relevantData as Record<string, unknown>;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, user?.id, authLoading, handleSpecialistSuccess]);

  useCalendlyEventListener({
    onEventScheduled: (e) => {
      setScheduledCount((prev) => prev + 1);
      toast.success(st.sessionScheduledToast);
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
      toast.error(st.errorStartingPayment);
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
          <div className="p-4 md:p-6 text-center space-y-4">
            <div className="mx-auto h-16 w-16 md:h-20 md:w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-2">
              <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <h2 className="text-title md:text-4xl font-black">
              {st.successTitle}
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground">
              {st.purchasedPkg.replace("{name}", pkg.name).replace("{classes}", pkg.classes.toString())}
            </p>
          </div>

          <div className="p-4 md:p-6 pt-0 space-y-5">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4 md:p-5 space-y-4 text-center">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="font-black text-lg md:text-subtitle text-accent">
                    {st.sessionsScheduled.replace("{count}", scheduledCount.toString()).replace("{total}", pkg.classes.toString())}
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
                <div className="py-6 space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border-2 border-green-100 dark:border-green-900/30">
                    <p className="text-green-600 dark:text-green-400 font-bold text-lg">
                      {st.allScheduled}
                    </p>
                    <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">
                      {st.checkEmail}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center space-y-5">
                  <div className="bg-accent/5 p-4 rounded-3xl border border-accent/10 max-w-sm">
                    <p className="text-accent font-bold text-sm leading-relaxed">
                      {st.mobileAccuracy}
                    </p>
                  </div>

                  <PopupButton
                    url={pkg.calendly}
                    rootElement={document.getElementById("root")!}
                    text={st.scheduleNow}
                    prefill={{
                      email: userProfile.email,
                      name: userProfile.name,
                    }}
                    className="w-full md:w-auto px-6 h-16 md:h-20 bg-accent hover:opacity-90 text-white rounded-md md:rounded-3xl font-black md:text-lg shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={onBack}
              variant="ghost"
              className="w-full h-12 md:h-14 rounded-md md:rounded-md font-bold text-muted-foreground"
            >
              {st.backToDashboard}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 font-bold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {ig.back}
        </Button>
      </div>

      <div className="text-center space-y-4 max-w-3xl mx-auto px-4">
        <h2 className="text-title-xl md:text-5xl font-black tracking-tight">
          {mode === "review"
            ? st.reviewTopic
            : st.mentoringTopic}
        </h2>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          {mode === "review"
            ? st.reviewDesc
            : st.mentoringDesc}
        </p>
      </div>

      <div
        className={cn(
          "grid gap-4 md:gap-5 pt-4 px-4",
          mode === "review" ? "max-w-lg mx-auto" : "md:grid-cols-3",
        )}
      >
        {packages.map((pkg) => (
          <motion.div
            key={pkg.id}
            whileHover={{ y: -8 }}
            className={cn(
              "relative flex flex-col p-5 rounded-[32px] md:rounded-[40px] border-2 transition-all",
              pkg.recommended
                ? "border-accent bg-accent/5 shadow-2xl shadow-accent/10"
                : "border-slate-100 dark:border-slate-800 bg-card hover:border-slate-200",
            )}
          >
            {pkg.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                {st.mostPopular}
              </div>
            )}

            <div className="space-y-4 mb-5">
              <h3 className="text-title font-black">{pkg.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-accent">
                  US$ {pkg.price}
                </span>
                <span className="text-muted-foreground font-bold text-sm">
                  {pkg.id === 1
                    ? st.perSession
                    : st.total}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {pkg.description}
              </p>
            </div>

            <ul className="space-y-4 flex-1 mb-6">
              {pkg.features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 text-sm font-bold items-start"
                >
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handlePayment(pkg.id)}
              disabled={isProcessing}
              className={cn(
                "w-full h-14 rounded-md font-black text-xs tracking-widest gap-2",
                pkg.recommended
                  ? "bg-accent hover:bg-green-dark text-white"
                  : "bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90",
              )}
            >
              {isProcessing ? (
                <Clock className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {st.chooseThis}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-5 pb-12 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-md text-[10px] md:text-xs font-bold text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          {st.securePayment}
        </div>
      </div>
    </div>
  );
}
