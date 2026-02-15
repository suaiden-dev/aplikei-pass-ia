import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Plane, GraduationCap, Clock, Repeat, BookOpen, Bot, Headphones, FileText, Shield, ChevronRight, CheckCircle2,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/i18n/LanguageContext";

import heroIllustration from "@/assets/hero-illustration.png";
import checklistIllustration from "@/assets/checklist-illustration.png";
import aiIllustration from "@/assets/ai-illustration.png";
import supportIllustration from "@/assets/support-illustration.png";
import pdfIllustration from "@/assets/pdf-illustration.png";
import servicesBanner from "@/assets/services-banner.png";

const iconMap: Record<string, React.ReactNode> = {
  plane: <Plane className="h-6 w-6" />,
  "graduation-cap": <GraduationCap className="h-6 w-6" />,
  clock: <Clock className="h-6 w-6" />,
  repeat: <Repeat className="h-6 w-6" />,
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Index() {
  const { lang, t } = useLanguage();

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero relative overflow-hidden py-20 md:py-28">
        <div className="container relative z-10">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="font-display text-4xl font-extrabold leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
                {t.hero.title[lang]}{" "}<span className="text-gradient-accent">{t.hero.titleHighlight[lang]}</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }} className="mt-6 max-w-lg text-lg text-primary-foreground/75">
                {t.hero.subtitle[lang]}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="bg-accent text-accent-foreground shadow-button hover:bg-green-dark px-8" asChild>
                  <Link to="/cadastro">{t.hero.cta[lang]}</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link to="/servicos">{t.hero.ctaSecondary[lang]}</Link>
                </Button>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.7 }} className="hidden md:block">
              <img src={heroIllustration} alt="Passport and checklist" className="mx-auto max-w-md rounded-2xl" />
            </motion.div>
          </div>
        </div>
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-bold text-foreground md:text-4xl">{t.howItWorksSection.title[lang]}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">{t.howItWorksSection.subtitle[lang]}</p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { step: "1", title: t.howItWorksSection.step1Title[lang], desc: t.howItWorksSection.step1Desc[lang], icon: <BookOpen className="h-7 w-7 text-accent" /> },
              { step: "2", title: t.howItWorksSection.step2Title[lang], desc: t.howItWorksSection.step2Desc[lang], icon: <Shield className="h-7 w-7 text-accent" /> },
              { step: "3", title: t.howItWorksSection.step3Title[lang], desc: t.howItWorksSection.step3Desc[lang], icon: <FileText className="h-7 w-7 text-accent" /> },
            ].map((item, i) => (
              <motion.div key={item.step} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="group rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">{item.icon}</div>
                <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="border-t border-border bg-muted/50 py-20">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-bold text-foreground md:text-4xl">{t.whatYouGet.title[lang]}</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { image: checklistIllustration, title: t.whatYouGet.guide[lang], desc: t.whatYouGet.guideDesc[lang] },
              { image: aiIllustration, title: t.whatYouGet.ai[lang], desc: t.whatYouGet.aiDesc[lang], badge: t.whatYouGet.bonus[lang] },
              { image: supportIllustration, title: t.whatYouGet.support[lang], desc: t.whatYouGet.supportDesc[lang], badge: t.whatYouGet.bonus[lang] },
              { image: pdfIllustration, title: t.whatYouGet.pdf[lang], desc: t.whatYouGet.pdfDesc[lang] },
            ].map((item, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="relative rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover">
                {item.badge && <span className="absolute right-4 top-4 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">{item.badge}</span>}
                <img src={item.image} alt={item.title} className="mb-4 h-20 w-20 object-contain" />
                <h3 className="font-display text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 overflow-hidden rounded-2xl">
            <img src={servicesBanner} alt="Travel and immigration" className="h-48 w-full object-cover md:h-64" />
          </div>
          <h2 className="text-center font-display text-3xl font-bold text-foreground md:text-4xl">{t.servicesSection.title[lang]}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">{t.servicesSection.subtitle[lang]}</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.servicesData.map((s, i) => (
              <motion.div key={s.slug} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={`/servicos/${s.slug}`} className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:border-accent/40">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    {iconMap[["plane", "graduation-cap", "clock", "repeat"][i]]}
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground">{s.shortTitle[lang]}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{s.subtitle[lang]}</p>
                  <p className="mt-4 font-display text-lg font-bold text-accent">{s.price[lang]}</p>
                  <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-accent group-hover:underline">
                    {t.servicesSection.viewDetails[lang]} <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-muted/50 py-20">
        <div className="container max-w-3xl">
          <h2 className="text-center font-display text-3xl font-bold text-foreground md:text-4xl">{t.faq.title[lang]}</h2>
          <Accordion type="single" collapsible className="mt-10">
            {t.faq.items.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-medium text-foreground">{item.q[lang]}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.a[lang]}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Disclaimers */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="rounded-xl border-2 border-amber-300/50 bg-amber-50/60 p-6 md:p-8">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <Shield className="h-5 w-5 text-amber-600" />
              {t.disclaimers.title[lang]}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-foreground/80">
              {t.disclaimers.items[lang].map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  {d}
                </li>
              ))}
            </ul>
            <Link to="/disclaimers" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
              {t.disclaimers.viewAll[lang]}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
