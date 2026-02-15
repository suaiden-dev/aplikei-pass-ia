import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Bot, Headphones, FileText, CreditCard, UserPlus, Shield } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const stepIcons = [
  <BookOpen className="h-5 w-5" />,
  <UserPlus className="h-5 w-5" />,
  <CreditCard className="h-5 w-5" />,
  <Bot className="h-5 w-5" />,
  <FileText className="h-5 w-5" />,
];

export default function HowItWorks() {
  const { lang, t } = useLanguage();
  const p = t.howItWorksPage;

  return (
    <div className="py-16">
      <div className="container max-w-4xl">
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center font-display text-4xl font-bold text-foreground">
          {p.title[lang]}
        </motion.h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">{p.subtitle[lang]}</p>

        {/* Timeline */}
        <div className="relative mt-16">
          <div className="absolute left-6 top-0 h-full w-px bg-border md:left-1/2" />
          {p.steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`relative mb-10 flex items-start gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
              <div className="absolute left-6 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-4 border-background bg-accent text-accent-foreground md:left-1/2">
                {stepIcons[i]}
              </div>
              <div className={`ml-16 max-w-sm rounded-xl border border-border bg-card p-5 shadow-card md:ml-0 ${i % 2 === 0 ? "md:mr-auto md:pr-16" : "md:ml-auto md:pl-16"}`}>
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">{p.step[lang]} {i + 1}</span>
                <h3 className="mt-1 font-display text-lg font-semibold text-foreground">{step.title[lang]}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.desc[lang]}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* What you buy */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { icon: <BookOpen className="h-6 w-6" />, title: p.youBuy[lang], desc: p.youBuyDesc[lang], highlight: true },
            { icon: <Bot className="h-6 w-6" />, title: p.bonusAI[lang], desc: p.bonusAIDesc[lang] },
            { icon: <Headphones className="h-6 w-6" />, title: p.bonusN1[lang], desc: p.bonusN1Desc[lang] },
          ].map((card, i) => (
            <div key={i} className={`rounded-xl border p-6 shadow-card ${card.highlight ? "border-accent bg-accent/5" : "border-border bg-card"}`}>
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${card.highlight ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>
                {card.icon}
              </div>
              <h3 className="font-display font-semibold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* What AI does */}
        <div className="mt-16 rounded-xl border border-border bg-card p-8 shadow-card">
          <h2 className="font-display text-2xl font-bold text-foreground">{p.aiDoesTitle[lang]}</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 font-semibold text-accent">{p.aiHelps[lang]}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {p.aiDoes[lang].map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-destructive">{p.aiDoesNotLabel[lang]}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {p.aiDoesNot[lang].map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" className="bg-accent text-accent-foreground shadow-button hover:bg-green-dark" asChild>
            <Link to="/servicos">{p.viewServices[lang]}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
