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
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { InterviewGuide } from "./InterviewGuide";
import { AIInterviewChat } from "./AIInterviewChat";

interface AwaitingInterviewStepProps {
  serviceId: string | null;
}

interface AwaitingInterviewData {
  interview_date: string | null;
  interview_time: string | null;
  interview_location_casv: string | null;
  interview_location_consulate: string | null;
}

export function AwaitingInterviewStep({
  serviceId,
}: AwaitingInterviewStepProps) {
  const { lang } = useLanguage();
  const [data, setData] = useState<AwaitingInterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!serviceId) return;
      const { data: service } = await supabase
        .from("user_services")
        .select(
          "interview_date, interview_time, interview_location_casv, interview_location_consulate",
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
      action: () =>
        window.open("https://wa.me/message/YOUR_WHATSAPP", "_blank"),
    },
  ];

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
    return <AIInterviewChat onBack={() => setShowAIChat(false)} />;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-[32px] bg-accent/10 text-accent mb-2">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          {lang === "pt" ? "Quase lá!" : "Almost there!"}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {lang === "pt"
            ? "Seu pagamento foi confirmado. Agora é o momento de se preparar para a sua entrevista."
            : "Your payment has been confirmed. Now it's time to prepare for your interview."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Appointment Card */}
        <Card className="border-none bg-slate-50 dark:bg-slate-900/50 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          <CardHeader className="bg-accent/5 pb-8">
            <div className="flex items-center gap-2 text-accent mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">
                {lang === "pt" ? "DATA CONFIRMADA" : "CONFIRMED DATE"}
              </span>
            </div>
            <CardTitle className="text-3xl font-black">
              {data?.interview_date
                ? new Date(data.interview_date).toLocaleDateString("pt-BR", {
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
          <CardContent className="p-8 space-y-6">
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

        {/* Preparation Tools */}
        <div className="space-y-4">
          <div className="px-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {lang === "pt"
                ? "FERRAMENTAS DE PREPARAÇÃO"
                : "PREPARATION TOOLS"}
            </h3>
          </div>

          <div className="grid gap-4">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={tool.action}
                className="group flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 transition-all text-left relative overflow-hidden"
              >
                <div
                  className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform",
                    tool.color,
                  )}
                >
                  <tool.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-black text-sm tracking-tight">
                      {tool.title}
                    </span>
                    {tool.tag && (
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-[8px] font-black h-4 px-1"
                      >
                        {tool.tag}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {tool.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 bg-black text-white rounded-[40px] flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="text-center md:text-left">
          <h4 className="text-xl font-black mb-1">
            {lang === "pt" ? "Precisa de ajuda urgente?" : "Need urgent help?"}
          </h4>
          <p className="text-sm text-slate-400">
            {lang === "pt"
              ? "Fale com nosso suporte via WhatsApp agora mesmo."
              : "Talk to our support via WhatsApp right now."}
          </p>
        </div>
        <Button className="bg-white text-black hover:bg-slate-200 h-12 px-8 rounded-2xl font-black text-xs tracking-widest gap-2">
          SUPORTE AO VIVO <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
