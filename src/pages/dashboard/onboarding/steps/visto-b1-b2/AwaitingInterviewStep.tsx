import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Bot,
  Users,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Package,
  Building2,
  AlertTriangle,
  PartyPopper,
  Loader2,
  Plane,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { InterviewGuide } from "./InterviewGuide";
import { AIInterviewChat } from "./AIInterviewChat";
import { SpecialistTraining } from "./SpecialistTraining";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AwaitingInterviewStepProps {
  serviceId: string | null;
  serviceStatus?: string | null;
}

interface AwaitingInterviewData {
  interview_date: string | null;
  interview_time: string | null;
  interview_location_casv: string | null;
  interview_location_consulate: string | null;
  consulate_interview_date: string | null;
  consulate_interview_time: string | null;
  same_location: boolean | null;
}

export function AwaitingInterviewStep({
  serviceId,
  serviceStatus,
}: AwaitingInterviewStepProps) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [data, setData] = useState<AwaitingInterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showSpecialist, setShowSpecialist] = useState(false);
  const [activeGuide, setActiveGuide] = useState<
    "correios" | "consular" | "entrada_eua" | null
  >(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!serviceId) return;
      const { data: service } = await supabase
        .from("user_services")
        .select(
          "interview_date, interview_time, interview_location_casv, interview_location_consulate, consulate_interview_date, consulate_interview_time, same_location",
        )
        .eq("id", serviceId)
        .single();

      if (service) {
        setData(service as unknown as AwaitingInterviewData);
      }

      setLoading(false);
    };

    fetchData();
  }, [serviceId]);

  const tools = [
    {
      id: "guide",
      title: lang === "pt" ? "Guia de Entrevista" : "Interview Guide",
      description:
        lang === "pt"
          ? "Tudo o que você precisa saber para se sair bem."
          : "Everything you need to know to do well.",
      icon: BookOpen,
      color: "bg-blue-500",
      action: () => setShowGuide(true),
    },
    {
      id: "ai",
      title: lang === "pt" ? "Simulado com IA" : "AI Interview Sim",
      description:
        lang === "pt"
          ? "Treine suas respostas com nossa inteligência artificial."
          : "Practice your answers with our AI.",
      icon: Bot,
      color: "bg-accent",
      action: () => setShowAIChat(true),
    },
    {
      id: "specialist",
      title:
        lang === "pt" ? "Treinar com Especialista" : "Train with Specialist",
      description:
        lang === "pt"
          ? "Mentoria individual para casos complexos."
          : "1-on-1 mentoring for complex cases.",
      icon: Users,
      color: "bg-purple-500",
      tag: "PREMIUM",
      action: () => setShowSpecialist(true),
    },
  ];

  // Priority logic for which date to compare:
  // 1. If locations are different (same_location === false), we MUST wait for consulate_interview_date.
  // 2. If locations are the same (same_location === true), we use interview_date.
  // 3. If same_location is not set yet, we fall back to any available date (safe default).

  const interviewDateToCompare =
    data?.same_location === false
      ? data.consulate_interview_date
      : data?.interview_date;

  const isInterviewDateReached = interviewDateToCompare
    ? (() => {
        // Get today's local date in YYYY-MM-DD format
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const todayStr = `${year}-${month}-${day}`;

        // interviewDateToCompare is YYYY-MM-DD
        return todayStr >= interviewDateToCompare;
      })()
    : false;

  const handleInterviewOutcome = async (outcome: "approved" | "rejected") => {
    if (!serviceId) return;
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("user_services")
        .update({ status: outcome })
        .eq("id", serviceId);

      if (error) throw error;

      // Reload is required to let standard routing pick up the new state
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error(
        lang === "pt" ? "Erro ao atualizar status." : "Error updating status.",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeliveryGuide = (
    guide: "correios" | "consular" | "entrada_eua",
  ) => {
    setActiveGuide(guide);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Clock className="h-8 w-8 animate-spin text-accent/50" />
      </div>
    );
  }

  if (showGuide) {
    return <InterviewGuide onBack={() => setShowGuide(false)} />;
  }

  if (showAIChat) {
    return (
      <AIInterviewChat
        onBack={() => setShowAIChat(false)}
        serviceId={serviceId}
      />
    );
  }

  if (showReview) {
    return (
      <SpecialistTraining
        onBack={() => setShowReview(false)}
        serviceId={serviceId}
        mode="review"
      />
    );
  }

  if (showSpecialist) {
    return (
      <SpecialistTraining
        onBack={() => setShowSpecialist(false)}
        serviceId={serviceId}
      />
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto space-y-8">
      {serviceStatus === "rejected" && (
        <div className="text-center space-y-4">
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-500 border-red-500/20 px-4 py-1 rounded-full font-black text-[10px] tracking-[0.2em] uppercase mb-4"
          >
            {lang === "pt" ? "Resultado" : "Outcome"}
          </Badge>
          <div className="inline-flex items-center justify-center p-4 bg-red-100 dark:bg-red-900/40 rounded-full mb-2">
            <ThumbsDown className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground text-balance">
            {lang === "pt" ? "Visto Negado" : "Visa Refused"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {lang === "pt"
              ? "Infelizmente, desta vez o seu visto não foi aprovado pelo oficial consular. Sabemos como isso é frustrante."
              : "Unfortunately, this time your visa was not approved by the consular officer. We know how frustrating this is."}
          </p>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowReview(true)}
            >
              <Users className="mr-2 h-4 w-4" />
              {lang === "pt"
                ? "Rever o caso com um especialista"
                : "Review case with a specialist"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() =>
                navigate(
                  `/checkout/visto-b1-b2?action=restart&serviceId=${serviceId}`,
                )
              }
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              {lang === "pt" ? "Recomeçar novamente" : "Start again"}
            </Button>
          </div>
        </div>
      )}

      {serviceStatus === "awaitingInterview" && (
        <div className="text-center space-y-4">
          <Badge
            variant="outline"
            className={`px-4 py-1 rounded-full font-black text-[10px] tracking-[0.2em] uppercase mb-4 ${
              isInterviewDateReached
                ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                : "bg-accent/10 text-accent border-accent/20"
            }`}
          >
            {isInterviewDateReached
              ? lang === "pt"
                ? "Data da Entrevista Chegou"
                : "Interview Date Arrived"
              : lang === "pt"
                ? "Etapa Final: Preparação"
                : "Final Stage: Preparation"}
          </Badge>
          {isInterviewDateReached ? (
            <div className="inline-flex items-center justify-center p-4 bg-yellow-100 dark:bg-yellow-900/40 rounded-full mb-2">
              <AlertTriangle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
            </div>
          ) : null}
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground text-balance">
            {isInterviewDateReached
              ? lang === "pt"
                ? "Como foi sua entrevista?"
                : "How was your interview?"
              : lang === "pt"
                ? "Aguardando Entrevista"
                : "Awaiting Interview"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isInterviewDateReached
              ? lang === "pt"
                ? "A data da sua entrevista no consulado já chegou! Role para baixo e nos informe o resultado para atualizarmos seu processo."
                : "Your consulate interview date has arrived! Scroll down and let us know the outcome to update your process."
              : lang === "pt"
                ? "Suas datas estão confirmadas! Agora foque em sua preparação com nossas ferramentas exclusivas."
                : "Your dates are confirmed! Now focus on your preparation with our exclusive tools."}
          </p>
        </div>
      )}

      {(serviceStatus === "approved" || serviceStatus === "completed") && (
        <div className="text-center space-y-4">
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500/20 px-4 py-1 rounded-full font-black text-[10px] tracking-[0.2em] uppercase mb-4"
          >
            {lang === "pt" ? "Sucesso!" : "Success!"}
          </Badge>
          <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-900/40 rounded-full mb-2">
            <PartyPopper className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground text-balance">
            {lang === "pt" ? "Visto Aprovado!" : "Visa Approved!"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {lang === "pt"
              ? "Parabéns pela aprovação do seu visto americano! Agora precisamos apenas saber como você pretende pegar o seu passaporte."
              : "Congratulations on the approval of your US visa! Now we just need to know how you intend to pick up your passport."}
          </p>
        </div>
      )}

      {(serviceStatus === "awaitingInterview" ||
        serviceStatus === "rejected") && (
        <div
          className={cn(
            "grid gap-6",
            data?.same_location === false
              ? "md:grid-cols-2"
              : "max-w-xl mx-auto",
          )}
        >
          {/* CASV Card */}
          <Card className="border-none bg-slate-50 dark:bg-slate-900/50 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden h-full flex flex-col">
            <CardHeader className="bg-accent/5 pb-8 shrink-0">
              <div className="flex items-center gap-2 text-accent mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {lang === "pt"
                    ? "DATA CONFIRMADA CASV"
                    : "CONFIRMED CASV DATE"}
                </span>
              </div>
              <CardTitle className="text-3xl font-black leading-tight">
                {data?.interview_date
                  ? new Date(
                      data.interview_date + "T12:00:00",
                    ).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  : lang === "pt"
                    ? "Em processamento..."
                    : "Processing..."}
              </CardTitle>
              <CardDescription className="text-lg font-bold text-accent italic">
                {data?.interview_time ? `@ ${data.interview_time}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6 flex-1">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      {lang === "pt" ? "LOCALIDADE CASV" : "CASV LOCATION"}
                    </p>
                    <p className="font-bold text-sm leading-tight">
                      {data?.interview_location_casv ||
                        (lang === "pt"
                          ? "Será informado em breve"
                          : "To be informed shortly")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consulate Card - Only shown if same_location is false */}
          {data?.same_location === false && (
            <Card className="border-none bg-accent/5 dark:bg-accent/10 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden h-full flex flex-col">
              <CardHeader className="bg-accent/10 pb-8 shrink-0">
                <div className="flex items-center gap-2 text-accent mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {lang === "pt"
                      ? "DATA CONFIRMADA CONSULADO"
                      : "CONFIRMED CONSULATE DATE"}
                  </span>
                </div>
                <CardTitle className="text-3xl font-black leading-tight">
                  {data?.consulate_interview_date
                    ? new Date(
                        data.consulate_interview_date + "T12:00:00",
                      ).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })
                    : lang === "pt"
                      ? "Em processamento..."
                      : "Processing..."}
                </CardTitle>
                <CardDescription className="text-lg font-bold text-accent italic">
                  {data?.consulate_interview_time
                    ? `@ ${data.consulate_interview_time}`
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6 flex-1 text-foreground">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                        {lang === "pt" ? "CONSULADO" : "CONSULATE"}
                      </p>
                      <p className="font-bold text-sm leading-tight">
                        {data?.interview_location_consulate ||
                          (lang === "pt"
                            ? "Será informado em breve"
                            : "To be informed shortly")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Post-Interview Guide Selector */}
      {(serviceStatus === "approved" || serviceStatus === "completed") && (
        <div className="max-w-3xl mx-auto mt-10">
          {activeGuide === null ? (
            /* Guide Selection Screen */
            <Card className="border-border shadow-2xl rounded-[40px] overflow-hidden bg-card/50 backdrop-blur-md relative">
              <CardHeader className="text-center pb-4 pt-10">
                <CardTitle className="text-2xl font-black">
                  {lang === "pt"
                    ? "Como deseja receber seu visto?"
                    : "How do you want to receive your visa?"}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {lang === "pt"
                    ? "O Consulado retém seu passaporte para estampar o visto. Escolha uma opção para ver o guia:"
                    : "The Consulate keeps your passport to stamp the visa. Choose an option to see the guide:"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 grid md:grid-cols-2 gap-6">
                {/* Correios Option */}
                <button
                  onClick={() => handleDeliveryGuide("correios")}
                  className="p-8 rounded-[32px] border-2 border-border bg-card hover:border-accent hover:bg-accent/5 transition-all group flex flex-col items-center text-center space-y-4"
                >
                  <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight mb-2">
                      {lang === "pt"
                        ? "Correios (Em Casa)"
                        : "Postal Service (Home)"}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {lang === "pt"
                        ? "Receba seu passaporte via Correios Premium no endereço informado na DS-160."
                        : "Receive your passport via Premium Mail at the address provided in your DS-160."}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-accent uppercase tracking-widest">
                    {lang === "pt" ? "Ver Guia →" : "View Guide →"}
                  </span>
                </button>

                {/* CASV Option */}
                <button
                  onClick={() => handleDeliveryGuide("consular")}
                  className="p-8 rounded-[32px] border-2 border-border bg-card hover:border-accent hover:bg-accent/5 transition-all group flex flex-col items-center text-center space-y-4"
                >
                  <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight mb-2">
                      {lang === "pt" ? "Retirar no CASV" : "Pick up at CASV"}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {lang === "pt"
                        ? "Você ou um representante autorizado retorna ao CASV para retirar o passaporte pessoalmente."
                        : "You or an authorized representative returns to the CASV to collect the passport in person."}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-accent uppercase tracking-widest">
                    {lang === "pt" ? "Ver Guia →" : "View Guide →"}
                  </span>
                </button>
              </CardContent>
            </Card>
          ) : activeGuide === "correios" ? (
            /* Correios Guide */
            <Card className="border-accent/20 shadow-2xl rounded-[40px] overflow-hidden bg-card">
              <CardHeader className="bg-blue-50 dark:bg-blue-950/20 p-8">
                <button
                  onClick={() => setActiveGuide(null)}
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 mb-4 transition-colors"
                >
                  ← {lang === "pt" ? "Voltar" : "Back"}
                </button>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Package className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black">
                      {lang === "pt"
                        ? "Recebimento pelos Correios"
                        : "Postal Service Delivery"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {lang === "pt"
                        ? "Guia completo para receber seu passaporte em casa"
                        : "Complete guide to receive your passport at home"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  {[
                    {
                      step: "01",
                      title:
                        lang === "pt"
                          ? "Confirmação pelo consulado"
                          : "Consulate confirmation",
                      desc:
                        lang === "pt"
                          ? "Após a aprovação, o consulado processará a estampagem do visto no seu passaporte."
                          : "After approval, the consulate will process the visa stamping in your passport.",
                    },
                    {
                      step: "02",
                      title:
                        lang === "pt"
                          ? "Solicitação de envio"
                          : "Shipping request",
                      desc:
                        lang === "pt"
                          ? "O envio será feito para o endereço informado na sua DS-160. Confirme que o endereço está correto."
                          : "Shipping will be made to the address provided in your DS-160. Confirm that the address is correct.",
                    },
                    {
                      step: "03",
                      title: lang === "pt" ? "Taxa de envio" : "Shipping fee",
                      desc:
                        lang === "pt"
                          ? "O consulado pode cobrar uma taxa adicional pelos Correios Premium. Fique atento ao e-mail."
                          : "The consulate may charge an additional fee for Premium Mail. Watch your email.",
                    },
                    {
                      step: "04",
                      title:
                        lang === "pt" ? "Prazo de entrega" : "Delivery time",
                      desc:
                        lang === "pt"
                          ? "O prazo normal é de 5 a 10 dias úteis após a estampagem do visto."
                          : "The normal timeframe is 5 to 10 business days after visa stamping.",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex gap-4 p-4 rounded-2xl bg-muted/30"
                    >
                      <span className="text-2xl font-black text-blue-500/30">
                        {item.step}
                      </span>
                      <div>
                        <p className="font-bold text-sm">{item.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveGuide(null)}
                  className="w-full mt-2 p-4 rounded-2xl border-2 border-dashed border-border text-sm font-bold text-muted-foreground hover:border-accent hover:text-accent transition-all"
                >
                  ←{" "}
                  {lang === "pt"
                    ? "Escolher outra opção"
                    : "Choose another option"}
                </button>
              </CardContent>
            </Card>
          ) : activeGuide === "consular" ? (
            /* CASV Guide */
            <Card className="border-accent/20 shadow-2xl rounded-[40px] overflow-hidden bg-card">
              <CardHeader className="bg-purple-50 dark:bg-purple-950/20 p-8">
                <button
                  onClick={() => setActiveGuide(null)}
                  className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-800 mb-4 transition-colors"
                >
                  ← {lang === "pt" ? "Voltar" : "Back"}
                </button>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black">
                      {lang === "pt" ? "Retirada no CASV" : "CASV Pickup"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {lang === "pt"
                        ? "Guia completo para retirar seu passaporte pessoalmente"
                        : "Complete guide to collect your passport in person"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  {[
                    {
                      step: "01",
                      title:
                        lang === "pt"
                          ? "Aguarde o aviso"
                          : "Wait for the notice",
                      desc:
                        lang === "pt"
                          ? "O consulado enviará um e-mail avisando que seu passaporte está pronto para retirada no CASV."
                          : "The consulate will send an email advising that your passport is ready for collection at the CASV.",
                    },
                    {
                      step: "02",
                      title:
                        lang === "pt" ? "Quem pode retirar" : "Who can collect",
                      desc:
                        lang === "pt"
                          ? "Você ou um representante autorizado com procuração pode retirar o passaporte no CASV."
                          : "You or an authorized representative with a power of attorney can collect the passport from the CASV.",
                    },
                    {
                      step: "03",
                      title:
                        lang === "pt"
                          ? "Documentos necessários"
                          : "Required documents",
                      desc:
                        lang === "pt"
                          ? "Leve o comprovante de agendamento e um documento de identidade válido para a retirada."
                          : "Bring the scheduling confirmation and a valid identity document for collection.",
                    },
                    {
                      step: "04",
                      title:
                        lang === "pt"
                          ? "Sem custo adicional"
                          : "No additional cost",
                      desc:
                        lang === "pt"
                          ? "A retirada no CASV é isenta de taxas adicionais do consulado."
                          : "CASV pickup is exempt from additional consular fees.",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex gap-4 p-4 rounded-2xl bg-muted/30"
                    >
                      <span className="text-2xl font-black text-purple-500/30">
                        {item.step}
                      </span>
                      <div>
                        <p className="font-bold text-sm">{item.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveGuide(null)}
                  className="w-full mt-2 p-4 rounded-2xl border-2 border-dashed border-border text-sm font-bold text-muted-foreground hover:border-accent hover:text-accent transition-all"
                >
                  ←{" "}
                  {lang === "pt"
                    ? "Escolher outra opção"
                    : "Choose another option"}
                </button>
              </CardContent>
            </Card>
          ) : null}

          {/* US Entry Guide */}
          {activeGuide === "entrada_eua" && (
            <Card className="border-accent/20 shadow-2xl rounded-[40px] overflow-hidden bg-card">
              <CardHeader className="bg-green-50 dark:bg-green-950/20 p-8">
                <button
                  onClick={() => setActiveGuide(null)}
                  className="flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-800 mb-4 transition-colors"
                >
                  ← {lang === "pt" ? "Voltar" : "Back"}
                </button>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Plane className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black">
                      {lang === "pt"
                        ? "Guia de Entrada nos EUA"
                        : "US Entry Guide"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {lang === "pt"
                        ? "O que esperar na imigração americana e como se preparar"
                        : "What to expect at US immigration and how to prepare"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  {[
                    {
                      step: "01",
                      title:
                        lang === "pt"
                          ? "Chegada ao aeroporto"
                          : "Arrival at the airport",
                      desc:
                        lang === "pt"
                          ? "Ao chegar nos EUA, siga as placas de 'Immigration' ou 'Customs'. Tenha seu passaporte e o cartão de embarque à mão."
                          : "Upon arriving in the US, follow the signs for 'Immigration' or 'Customs'. Have your passport and boarding pass ready.",
                    },
                    {
                      step: "02",
                      title:
                        lang === "pt"
                          ? "Fila de imigração"
                          : "Immigration line",
                      desc:
                        lang === "pt"
                          ? "Entre na fila para visitantes internacionais. Você passará por um quiosque APC onde escaneará seu passaporte e responderá perguntas na tela."
                          : "Join the line for international visitors. You'll go through an APC kiosk to scan your passport and answer on-screen questions.",
                    },
                    {
                      step: "03",
                      title:
                        lang === "pt"
                          ? "Entrevista com o agente"
                          : "Agent interview",
                      desc:
                        lang === "pt"
                          ? "O agente revisará seu passaporte, coletará biométricos e poderá perguntar sobre o motivo da visita, tempo de estadia e onde ficará."
                          : "The officer will review your passport, collect biometrics, and may ask about your visit purpose, length of stay, and accommodation.",
                    },
                    {
                      step: "04",
                      title:
                        lang === "pt"
                          ? "Documentos recomendados"
                          : "Recommended documents",
                      desc:
                        lang === "pt"
                          ? "Tenha consigo: passaporte com visto, comprovante de hospedagem, passagem de volta e comprovante de meios financeiros."
                          : "Have with you: passport with visa, accommodation proof, return ticket, and proof of financial means.",
                    },
                    {
                      step: "05",
                      title:
                        lang === "pt"
                          ? "Recolhimento de bagagem"
                          : "Baggage claim",
                      desc:
                        lang === "pt"
                          ? "Após a imigração, retire suas malas e passe pela alfândega. Declare itens obrigatórios. A maioria dos turistas passa rapidamente."
                          : "After immigration, collect your luggage and go through Customs. Declare mandatory items. Most tourists pass through quickly.",
                    },
                    {
                      step: "06",
                      title:
                        lang === "pt" ? "Dicas importantes" : "Important tips",
                      desc:
                        lang === "pt"
                          ? "Seja honesto com os agentes. Responda apenas o que for perguntado. Evite piadas sobre segurança. Mantenha a calma e seja educado."
                          : "Be honest with officers. Answer only what is asked. Avoid security-related jokes. Stay calm and be polite.",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex gap-4 p-4 rounded-2xl bg-muted/30"
                    >
                      <span className="text-2xl font-black text-green-500/30">
                        {item.step}
                      </span>
                      <div>
                        <p className="font-bold text-sm">{item.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveGuide(null)}
                  className="w-full mt-2 p-4 rounded-2xl border-2 border-dashed border-border text-sm font-bold text-muted-foreground hover:border-accent hover:text-accent transition-all"
                >
                  ←{" "}
                  {lang === "pt"
                    ? "Escolher outra opção"
                    : "Choose another option"}
                </button>
              </CardContent>
            </Card>
          )}
          {/* Standalone US Entry Guide Card */}
          {activeGuide === null && (
            <button
              onClick={() => handleDeliveryGuide("entrada_eua")}
              className="w-full mt-4 p-6 rounded-[32px] border-2 border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-950/20 hover:border-green-400 dark:hover:border-green-700 hover:bg-green-100 dark:hover:bg-green-950/40 transition-all group flex items-center gap-6 text-left"
            >
              <div className="h-14 w-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform">
                <Plane className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">
                  {lang === "pt" ? "PRÓXIMO PASSO" : "NEXT STEP"}
                </p>
                <h3 className="text-lg font-black tracking-tight">
                  {lang === "pt" ? "Guia de Entrada nos EUA" : "US Entry Guide"}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  {lang === "pt"
                    ? "Saiba o que esperar na imigração americana: fila, biométricos, perguntas e dicas essenciais."
                    : "Learn what to expect at US immigration: queue, biometrics, questions and essential tips."}
                </p>
              </div>
              <span className="text-green-600 font-black text-lg shrink-0 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          )}
        </div>
      )}

      {/* Outcome Selection for Awaiting Interview - Only if date is reached */}
      {serviceStatus === "awaitingInterview" && isInterviewDateReached && (
        <Card className="max-w-4xl mx-auto border-border shadow-2xl rounded-[40px] overflow-hidden bg-card/10 backdrop-blur-md relative border-dashed mt-12">
          <CardContent className="p-8 md:p-12 space-y-8 text-center">
            <div className="space-y-3">
              <h3 className="text-3xl font-black tracking-tight">
                {lang === "pt"
                  ? "Sua entrevista já aconteceu?"
                  : "Has your interview already taken place?"}
              </h3>
              <p className="text-muted-foreground">
                {lang === "pt"
                  ? "Informe-nos o resultado final para atualizarmos seu processo no sistema."
                  : "Let us know the final outcome to update your process in the system."}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-16 border-2 border-green-500/20 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 hover:text-green-700 font-bold text-lg rounded-[24px]"
                disabled={isUpdatingStatus}
                onClick={() => handleInterviewOutcome("approved")}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ThumbsUp className="h-5 w-5 mr-3" />
                )}
                {lang === "pt" ? "FUI APROVADO(A)!" : "I WAS APPROVED!"}
              </Button>
              <Button
                variant="outline"
                className="h-16 border-2 border-red-500/20 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 font-bold text-lg rounded-[24px]"
                disabled={isUpdatingStatus}
                onClick={() => handleInterviewOutcome("rejected")}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ThumbsDown className="h-5 w-5 mr-3" />
                )}
                {lang === "pt" ? "FUI REPROVADO(A)" : "I WAS REFUSED"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preparation Tools Section — only shown before the interview date */}
      {serviceStatus === "awaitingInterview" && !isInterviewDateReached && (
        <div className="space-y-6 max-w-4xl mx-auto mt-12">
          <div className="px-4 text-center">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {lang === "pt"
                ? "FERRAMENTAS DE PREPARAÇÃO"
                : "PREPARATION TOOLS"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-widest">
              {lang === "pt"
                ? "Prepare-se para aprovação"
                : "Prepare for approval"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 pb-8">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={tool.action}
                className="group flex flex-col items-center text-center p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10 transition-all relative overflow-hidden h-full"
              >
                <div
                  className={cn(
                    "h-16 w-16 rounded-[24px] flex items-center justify-center text-white shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mb-6",
                    tool.color,
                  )}
                >
                  <tool.icon className="h-8 w-8" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-black text-lg tracking-tight leading-tight">
                      {tool.title}
                    </span>
                    {tool.tag && (
                      <Badge
                        variant="secondary"
                        className="bg-accent/10 text-accent text-[8px] font-black h-5 px-2 rounded-lg"
                      >
                        {tool.tag}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    {tool.description}
                  </p>
                </div>
                <div className="mt-6 h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
