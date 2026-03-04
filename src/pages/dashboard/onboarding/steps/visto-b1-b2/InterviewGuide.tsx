import React from "react";
import { Button } from "@/components/ui/button";
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
  const { lang } = useLanguage();

  const sections = [
    {
      title:
        lang === "pt" ? "1. Checklist de Documentos" : "1. Documents Checklist",
      icon: FileText,
      color: "text-blue-500",
      content:
        lang === "pt"
          ? "Certifique-se de levar os seguintes itens impressos:\n• Passaporte atual válido (e anteriores se houver visto)\n• Página de confirmação da DS-160 (com código de barras)\n• Comprovante do agendamento (Página de Instruções)\n• Foto 5x5 recente (caso solicitado no CASV)\n• Documentos de suporte (IR, extratos, holerites, vínculos)"
          : "Make sure to bring the following printed items:\n• Valid current passport (and previous ones if they have visas)\n• DS-160 confirmation page (with barcode)\n• Appointment confirmation (Instructions Page)\n• Recent 5x5 photo (if requested at CASV)\n• Supporting documents (Tax returns, bank statements, payslips, ties)",
    },
    {
      title:
        lang === "pt"
          ? "2. Comportamento e Postura"
          : "2. Behavior and Posture",
      icon: UserCheck,
      color: "text-green-500",
      content:
        lang === "pt"
          ? "A primeira impressão conta muito:\n• Vista-se de forma casual-fina (evite roupas chamativas)\n• Seja honesto e direto nas respostas\n• Mantenha o contato visual com o oficial\n• Responda apenas o que lhe for perguntado\n• Fale pausadamente e com clareza"
          : "First impressions matter a lot:\n• Dress casual-smart (avoid flashy clothes)\n• Be honest and direct in your answers\n• Maintain eye contact with the officer\n• Answer only what is asked\n• Speak slowly and clearly",
    },
    {
      title: lang === "pt" ? "3. Perguntas Frequentes" : "3. Common Questions",
      icon: BookOpen,
      color: "text-purple-500",
      content:
        lang === "pt"
          ? "Prepare-se para estas perguntas clássicas:\n• 'Qual o propósito da sua viagem?'\n• 'Para onde você vai e quanto tempo ficará?'\n• 'Quem pagará pelos custos da viagem?'\n• 'O que você faz no Brasil?' (Seu trabalho/empresa)\n• 'Você tem parentes nos Estados Unidos?'"
          : "Prepare for these classic questions:\n• 'What is the purpose of your trip?'\n• 'Where are you going and how long will you stay?'\n• 'Who will pay for the trip costs?'\n• 'What do you do in Brazil?' (Your job/business)\n• 'Do you have relatives in the United States?'",
    },
    {
      title: lang === "pt" ? "4. O que NÃO fazer" : "4. What NOT to do",
      icon: AlertCircle,
      color: "text-red-500",
      content:
        lang === "pt"
          ? "Evite estes erros comuns:\n• NÃO entregue documentos antes de serem solicitados\n• NÃO dê respostas longas ou conte histórias irrelevantes\n• NÃO use o celular dentro do consulado (é proibido)\n• NÃO tente decorar respostas (seja natural)\n• NÃO entre em pânico se o oficial for sério"
          : "Avoid these common mistakes:\n• DO NOT hand over documents before being requested\n• DO NOT give long answers or tell irrelevant stories\n• DO NOT use your cell phone inside the consulate (prohibited)\n• DO NOT try to memorize answers (be natural)\n• DO NOT panic if the officer is serious",
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl mx-auto pb-20">
      <header className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="group hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl px-4 gap-2"
        >
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">{lang === "pt" ? "Voltar" : "Back"}</span>
        </Button>
        <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          <BookOpen className="h-5 w-5" />
        </div>
      </header>

      <div className="space-y-4 mb-10">
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          {lang === "pt" ? "Guia do Visto Americano" : "US Visa Guide"}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {lang === "pt"
            ? "Preparamos este tutorial para que você chegue no consulado com total confiança e segurança. Siga as orientações abaixo:"
            : "We have prepared this tutorial so that you arrive at the consulate with total confidence and security. Follow the guidelines below:"}
        </p>
      </div>

      <div className="grid gap-6">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="group p-8 bg-card border border-border rounded-[32px] hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all"
          >
            <div className="flex items-start gap-4">
              <div
                className={`h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border flex items-center justify-center shrink-0 ${section.color}`}
              >
                <section.icon className="h-6 w-6" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-black tracking-tight">
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

      <div className="mt-12 p-8 bg-accent/5 border border-accent/10 rounded-[40px] text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center text-white mx-auto shadow-lg shadow-accent/20">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h4 className="text-xl font-black">
          {lang === "pt"
            ? "Dica Final: Mantenha a Calma"
            : "Final Tip: Keep Calm"}
        </h4>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {lang === "pt"
            ? "Lembre-se que o oficial está apenas fazendo o trabalho dele. Se os seus vínculos são reais e o seu propósito é genuíno, não há motivo para preocupação. Boa sorte!"
            : "Remember that the officer is just doing their job. If your ties are real and your purpose is genuine, there is no reason to worry. Good luck!"}
        </p>
      </div>
    </div>
  );
}
