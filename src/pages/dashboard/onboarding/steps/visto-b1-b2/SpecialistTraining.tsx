import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Users,
  Calendar,
  Clock,
  Video,
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Star,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface SpecialistTrainingProps {
  onBack: () => void;
  serviceId: string | null;
}

export function SpecialistTraining({
  onBack,
  serviceId,
}: SpecialistTrainingProps) {
  const { lang } = useLanguage();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | null>(null);
  const [step, setStep] = useState<"scheduling" | "payment" | "success">(
    "scheduling",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  useEffect(() => {
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
        const trainingData = service.specialist_training_data as any;
        if (trainingData.status === "paid") {
          setDate(new Date(trainingData.date));
          setTime(trainingData.time);
          setStep("success");
        }
      }
      setIsLoading(false);
    };

    checkSpecialistStatus();

    const params = new URLSearchParams(window.location.search);
    if (params.get("specialist_success") === "true") {
      handleSpecialistSuccess();
    }
  }, [serviceId]);

  const handleSpecialistSuccess = async () => {
    if (!serviceId) return;

    setIsProcessing(true);
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    const savedSelection = localStorage.getItem(
      `specialist_selection_${serviceId}`,
    );
    if (savedSelection) {
      const { date: savedDate, time: savedTime } = JSON.parse(savedSelection);

      await supabase
        .from("user_services")
        .update({
          specialist_training_data: {
            status: "paid",
            date: savedDate,
            time: savedTime,
            stripe_session_id: sessionId,
          },
        })
        .eq("id", serviceId);

      setDate(new Date(savedDate));
      setTime(savedTime);
      setStep("success");
      localStorage.removeItem(`specialist_selection_${serviceId}`);

      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
    setIsProcessing(false);
  };

  const handleConfirmScheduling = () => {
    if (!date || !time) {
      toast.error(
        lang === "pt"
          ? "Selecione uma data e horário"
          : "Please select a date and time",
      );
      return;
    }
    setStep("payment");
  };

  const handlePayment = async () => {
    if (!serviceId || !date || !time) return;

    setIsProcessing(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      localStorage.setItem(
        `specialist_selection_${serviceId}`,
        JSON.stringify({
          date: date.toISOString().split("T")[0],
          time,
        }),
      );

      const { data, error } = await supabase.functions.invoke(
        "stripe-specialist-checkout",
        {
          body: {
            email: user.email,
            fullName: user.user_metadata?.full_name || "Cliente",
            serviceId,
            date: date.toISOString().split("T")[0],
            time,
            origin_url: window.location.origin,
          },
        },
      );

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(
        lang === "pt" ? "Erro ao iniciar pagamento" : "Error starting payment",
      );
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
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="border-none bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden">
          <div className="h-2 bg-accent" />
          <CardHeader className="p-10 text-center space-y-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-2">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <CardTitle className="text-4xl font-black">
              {lang === "pt" ? "Agendado!" : "Scheduled!"}
            </CardTitle>
            <CardDescription className="text-lg">
              {lang === "pt"
                ? "Sua mentoria individual foi confirmada com sucesso."
                : "Your 1-on-1 mentoring has been successfully confirmed."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
                <span className="text-muted-foreground font-bold uppercase text-xs tracking-widest">
                  {lang === "pt" ? "DIA E HORA" : "DATE & TIME"}
                </span>
                <span className="font-black text-right">
                  {date?.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  às {time}
                </span>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-muted-foreground font-bold uppercase text-xs tracking-widest">
                  {lang === "pt" ? "LINK DA REUNIÃO" : "MEETING LINK"}
                </span>
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                  <Video className="h-5 w-5 text-accent" />
                  <code className="flex-1 text-sm font-bold text-accent">
                    meet.google.com/abc-defg-hij
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        "meet.google.com/abc-defg-hij",
                      );
                      toast.success(
                        lang === "pt" ? "Link copiado!" : "Link copied!",
                      );
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                {lang === "pt"
                  ? "Um lembrete foi enviado para o seu e-mail."
                  : "A reminder has been sent to your email."}
              </p>
              <Button
                onClick={onBack}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 h-14 rounded-2xl font-black text-xs tracking-widest"
              >
                {lang === "pt" ? "VOLTAR AO PAINEL" : "BACK TO DASHBOARD"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 font-bold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {lang === "pt" ? "Voltar" : "Back"}
        </Button>
        <Badge
          variant="secondary"
          className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-black px-3 py-1"
        >
          {lang === "pt" ? "MEMBRO PREMIUM" : "PREMIUM MEMBER"}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tight">
              {lang === "pt"
                ? "Treinamento com Especialista"
                : "Specialist Training"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {lang === "pt"
                ? "Simule sua entrevista real com um consultor experiente em casos complexos."
                : "Simulate your real interview with a consultant experienced in complex cases."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === "scheduling" ? (
              <motion.div
                key="scheduling"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <Card className="border-none shadow-xl rounded-[32px] overflow-hidden">
                  <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-accent" />
                      {lang === "pt" ? "Escolha o dia" : "Pick a day"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border-none mx-auto"
                      disabled={(date) =>
                        date < new Date() ||
                        date.getDay() === 0 ||
                        date.getDay() === 6
                      }
                    />
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl rounded-[32px] overflow-hidden">
                  <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-accent" />
                      {lang === "pt"
                        ? "Horários disponíveis"
                        : "Available slots"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setTime(slot)}
                          className={cn(
                            "p-4 rounded-2xl border-2 font-bold transition-all",
                            time === slot
                              ? "border-accent bg-accent/5 text-accent"
                              : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700",
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    {!date && (
                      <p className="text-xs text-center text-muted-foreground mt-4">
                        {lang === "pt"
                          ? "Selecione uma data primeiro"
                          : "Select a date first"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="border-none shadow-xl rounded-[32px] overflow-hidden">
                  <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-8">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <CreditCard className="h-6 w-6 text-accent" />
                      {lang === "pt" ? "Pagamento Seguro" : "Secure Payment"}
                    </CardTitle>
                    <CardDescription>
                      {lang === "pt"
                        ? "Sua transação é processada via Stripe com criptografia de ponta."
                        : "Your transaction is processed via Stripe with end-to-end encryption."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                      <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                        <Users className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black">
                          {lang === "pt"
                            ? "Mentoria Individual"
                            : "1-on-1 Mentoring"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {date?.toLocaleDateString()} @ {time}
                        </p>
                      </div>
                      <p className="text-xl font-black text-accent">
                        US$ 99.00
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        {lang === "pt"
                          ? "Garantia de satisfação Aplikei"
                          : "Aplikei satisfaction guarantee"}
                      </div>
                      <Button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full bg-accent text-accent-foreground hover:bg-green-dark h-16 rounded-2xl font-black text-lg gap-3 shadow-button"
                      >
                        {isProcessing ? (
                          <Clock className="h-6 w-6 animate-spin" />
                        ) : (
                          <>
                            {lang === "pt"
                              ? "Pagar com Stripe"
                              : "Pay with Stripe"}
                            <ArrowRight className="h-6 w-6" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-slate-900 text-white rounded-[40px] shadow-2xl overflow-hidden p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-black tracking-widest uppercase text-slate-400">
                O QUE ESTÁ INCLUSO
              </span>
            </div>
            <ul className="space-y-4">
              {[
                {
                  pt: "45 minutos de call individual",
                  en: "45-minute 1-on-1 call",
                },
                {
                  pt: "Simulado real de perguntas",
                  en: "Real interview simulation",
                },
                {
                  pt: "Análise de pontos fracos",
                  en: "Weak point analysis",
                },
                {
                  pt: "Dicas personalizadas para seu caso",
                  en: "Custom tips for your case",
                },
                {
                  pt: "Feedback imediato após a call",
                  en: "Immediate post-call feedback",
                },
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3 text-sm font-medium">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                  {lang === "pt" ? item.pt : item.en}
                </li>
              ))}
            </ul>
            <div className="pt-6 border-t border-slate-800">
              <p className="text-xs text-slate-400 leading-relaxed italic">
                {lang === "pt"
                  ? "Recomendado para casos de negativa anterior, troca de categoria ou dúvidas complexas sobre vínculos."
                  : "Recommended for prior denial cases, category changes, or complex tie questions."}
              </p>
            </div>
          </Card>

          {step === "scheduling" && (
            <Button
              onClick={handleConfirmScheduling}
              className="w-full h-16 rounded-2xl bg-accent text-accent-foreground hover:bg-green-dark font-black text-xs tracking-widest gap-2 shadow-button"
            >
              {lang === "pt" ? "CONFIRMAR AGENDAMENTO" : "CONFIRM SCHEDULING"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
