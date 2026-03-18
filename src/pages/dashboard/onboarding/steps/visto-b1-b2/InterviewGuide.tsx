import React from "react";
import { Button } from "@/presentation/components/atoms/button";
import {
  ChevronLeft,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  MapPin,
  Calendar,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface InterviewGuideProps {
  onBack: () => void;
}

export function InterviewGuide({ onBack }: InterviewGuideProps) {
  const { lang, t } = useLanguage();
  const ig = t.onboardingPage.interviewGuide;

  const sections = [
    {
      title: ig.sections.checklist.title[lang],
      icon: FileText,
      color: "text-blue-500",
      content: ig.sections.checklist.content[lang],
    },
    {
      title: ig.sections.behavior.title[lang],
      icon: UserCheck,
      color: "text-green-500",
      content: ig.sections.behavior.content[lang],
    },
    {
      title: ig.sections.commonQuestions.title[lang],
      icon: BookOpen,
      color: "text-purple-500",
      content: ig.sections.commonQuestions.content[lang],
    },
    {
      title: ig.sections.notToDo.title[lang],
      icon: AlertCircle,
      color: "text-red-500",
      content: ig.sections.notToDo.content[lang],
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl mx-auto pb-20">
      <header className="flex items-center justify-between mb-5">
        <Button
          variant="ghost"
          onClick={onBack}
          className="group hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md px-4 gap-2"
        >
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">{ig.back[lang]}</span>
        </Button>
        <div className="h-10 w-10 rounded-md bg-accent/10 flex items-center justify-center text-accent">
          <BookOpen className="h-5 w-5" />
        </div>
      </header>

      <div className="space-y-4 mb-6">
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          {ig.title[lang]}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {ig.subtitle[lang]}
        </p>
      </div>

      <div className="grid gap-4">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="group p-5 bg-card border border-border rounded-[32px] hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all"
          >
            <div className="flex items-start gap-4">
              <div
                className={`h-12 w-12 rounded-md bg-slate-50 dark:bg-slate-900 border border-border flex items-center justify-center shrink-0 ${section.color}`}
              >
                <section.icon className="h-6 w-6" />
              </div>
              <div className="space-y-4">
                <h3 className="text-subtitle font-black tracking-tight">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.content.split("\n").map((line, lIdx) => (
                    <p
                      key={lIdx}
                      className="text-muted-foreground text-sm leading-relaxed flex items-start gap-2"
                    >
                      {line.startsWith("•") && (
                        <span className="text-accent mt-1">•</span>
                      )}
                      {line.startsWith("•") ? line.substring(1).trim() : line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-5 bg-accent/5 border border-accent/10 rounded-[40px] text-center space-y-4">
        <div className="h-12 w-12 rounded-md bg-accent flex items-center justify-center text-white mx-auto shadow-lg shadow-accent/20">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h4 className="text-subtitle font-black">
          {ig.finalTipTitle[lang]}
        </h4>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {ig.finalTipDesc[lang]}
        </p>
      </div>
    </div>
  );
}
