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
import { SpecialistTraining } from "./SpecialistTraining";

interface AwaitingInterviewStepProps {
  serviceId: string | null;
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
}: AwaitingInterviewStepProps) {
  const { lang } = useLanguage();
  const [data, setData] = useState<AwaitingInterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showSpecialist, setShowSpecialist] = useState(false);

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
      <div className="text-center space-y-4">
        <Badge
          variant="outline"
          className="bg-accent/10 text-accent border-accent/20 px-4 py-1 rounded-full font-black text-[10px] tracking-[0.2em] uppercase mb-4"
        >
          {lang === "pt"
            ? "Etapa Final: Preparação"
            : "Final Stage: Preparation"}
        </Badge>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground text-balance">
          {lang === "pt" ? "Aguardando Entrevista" : "Awaiting Interview"}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {lang === "pt"
            ? "Suas datas estão confirmadas! Agora foque em sua preparação com nossas ferramentas exclusivas."
            : "Your dates are confirmed! Now focus on your preparation with our exclusive tools."}
        </p>
      </div>

      <div
        className={cn(
          "grid gap-6",
          data?.same_location === false ? "md:grid-cols-2" : "max-w-xl mx-auto",
        )}
      >
        {/* CASV Card */}
        <Card className="border-none bg-slate-50 dark:bg-slate-900/50 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden h-full flex flex-col">
          <CardHeader className="bg-accent/5 pb-8 shrink-0">
            <div className="flex items-center gap-2 text-accent mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {lang === "pt" ? "DATA CONFIRMADA CASV" : "CONFIRMED CASV DATE"}
              </span>
            </div>
            <CardTitle className="text-3xl font-black leading-tight">
              {data?.interview_date
                ? new Date(data.interview_date).toLocaleDateString(
                    lang === "pt" ? "pt-BR" : "en-US",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    },
                  )
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
                  ? new Date(data.consulate_interview_date).toLocaleDateString(
                      lang === "pt" ? "pt-BR" : "en-US",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      },
                    )
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

      {/* Preparation Tools Section */}
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="px-4 text-center">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {lang === "pt" ? "FERRAMENTAS DE PREPARAÇÃO" : "PREPARATION TOOLS"}
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
    </div>
  );
}
