import React from "react";
import { StepProps } from "../../types";
import { Label } from "@/presentation/components/atoms/label";
import { Textarea } from "@/presentation/components/atoms/textarea";
import { FileText, Info, Sparkles, MapPin, Target, GraduationCap, Briefcase, Landmark, Home, Clock } from "lucide-react";
import { Card, CardContent } from "@/presentation/components/atoms/card";
import { cn } from "@/lib/utils";

export const ChangeOfStatusCoverLetterStep = ({
  register,
  lang,
  t,
  errors,
  serviceStatus,
}: StepProps & { serviceStatus?: string | null }) => {
  const cos = (t as any).changeOfStatus;
  const form = cos.coverLetterForm;
  const questions = form.questions;

  const sections = [
    {
      title: lang === "pt" ? "Histórico e Antecedentes" : "Background",
      icon: MapPin,
      keys: ["decidedToGoUS", "locationsVisited", "whyB1B2", "jobInBrazil"],
    },
    {
      title: lang === "pt" ? "O Motivo da Mudança" : "The Reason for Change",
      icon: Target,
      keys: ["whyNotF1Home", "whyChangeStatus", "careerBenefit"],
    },
    {
      title: lang === "pt" ? "Plano de Estudos" : "Study Plan",
      icon: GraduationCap,
      keys: ["chosenCourse", "whyNotCourseBrazil"],
    },
    {
      title: lang === "pt" ? "Vínculos e Financeiro" : "Ties & Financials",
      icon: Landmark,
      keys: ["residenceBrazil", "financialSupport", "sponsorInfo"],
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          {form.title[lang]}
        </h2>
        <p className="text-sm text-muted-foreground">
          {form.description[lang]}
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="p-5 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-primary italic uppercase tracking-wider">AI Powered Generation</h4>
            <p className="text-[11px] text-foreground leading-relaxed">
              {lang === "pt" 
                ? "Responda às perguntas abaixo com o máximo de detalhes. Nossa IA usará essas informações para redigir uma RoadMap e uma Cover Letter altamente persuasiva e profissional para aumentar suas chances de aprovação."
                : "Answer the questions below in detail. Our AI will use this information to draft a highly persuasive and professional RoadMap and Cover Letter to increase your chances of approval."}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {serviceStatus === "COS_COVER_LETTER_ADMIN_REVIEW" && (
        <div className="bg-accent/5 border border-accent/20 p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-500">
          <div className="p-4 rounded-full bg-accent/10 text-accent animate-pulse">
            <Clock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-accent">Respostas em Revisão</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Nossos especialistas estão transformando suas respostas em uma Carta de Apresentação profissional e USCIS-ready. Você receberá um aviso assim que puder prosseguir para a taxa SEVIS.
            </p>
          </div>
        </div>
      )}

      <div className={cn("space-y-12 pb-10", serviceStatus === "COS_COVER_LETTER_ADMIN_REVIEW" && "opacity-50 pointer-events-none")}>
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-6">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2">
              <div className="p-1 rounded-lg bg-primary/5 text-primary/70">
                <section.icon className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {section.title}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              {section.keys.map((key) => (
                <div key={key} className="space-y-3">
                  <Label className="text-[13px] font-bold text-foreground/90 leading-snug">
                    {questions[key]?.label[lang] || key}
                  </Label>
                  <Textarea
                    {...register(`coverLetterData.${key}` as any)}
                    placeholder={lang === "pt" ? "Sua resposta detalhada aqui..." : "Your detailed answer here..."}
                    className={cn(
                      "min-h-[120px] rounded-2xl bg-muted/20 border-border focus:bg-background focus:ring-primary/20 transition-all resize-none shadow-inner",
                      errors?.coverLetterData?.[key] ? "border-red-500 bg-red-50/10" : "hover:border-primary/30"
                    )}
                  />
                  {errors?.coverLetterData?.[key] && (
                    <p className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {lang === "pt" ? "Campo obrigatório" : "Required field"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

