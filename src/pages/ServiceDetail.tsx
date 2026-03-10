import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, Plane, GraduationCap, Clock, Repeat, ArrowRight, Shield, FileText, Users } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const iconMap: Record<string, React.ReactNode> = {
  plane: <Plane className="h-8 w-8" />,
  "graduation-cap": <GraduationCap className="h-8 w-8" />,
  clock: <Clock className="h-8 w-8" />,
  repeat: <Repeat className="h-8 w-8" />,
};
const iconKeys = ["plane", "graduation-cap", "clock", "repeat"];

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const p = t.serviceDetail;

  const serviceIndex = t.servicesData.findIndex((s) => s.slug === slug);
  const service = t.servicesData[serviceIndex];
  if (!service) return <Navigate to="/servicos" replace />;

  return (
    <div className="py-16">
      <div className="container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-md bg-accent/10 text-accent">
            {iconMap[iconKeys[serviceIndex]]}
          </div>
          <h1 className="font-display text-title-xl font-bold text-foreground md:text-4xl">{service.title[lang]}</h1>
          <p className="mt-2 text-muted-foreground">{service.subtitle[lang]}</p>
          <div className="mt-4">
            <span className="text-lg text-muted-foreground line-through">{service.originalPrice[lang]}</span>
            <span className="ml-2 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">{t.servicesSection.discount[lang]}</span>
          </div>
          <p className="mt-1 font-display text-title-xl font-extrabold text-accent">{service.price[lang]}</p>
        </motion.div>

        {/* Dependents */}
        <div className="mt-5 rounded-md border border-accent/30 bg-accent/5 p-5">
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <h3 className="font-display font-semibold text-foreground">{p.dependents[lang]}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.dependentsDesc[lang]}</p>
              <p className="mt-2 font-display text-lg font-bold text-accent">
                +{service.dependentPrice[lang]} <span className="text-sm font-normal text-muted-foreground">{p.perDependent[lang]}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-md border border-border bg-card p-4 shadow-card">
          <h2 className="font-display text-subtitle font-bold text-foreground">{p.overview[lang]}</h2>
          <p className="mt-3 text-muted-foreground">{service.description[lang]}</p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-border bg-card p-4 shadow-card">
            <h3 className="font-display font-semibold text-accent">{p.forWhom[lang]}</h3>
            <ul className="mt-3 space-y-2">
              {service.forWhom[lang].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-border bg-card p-4 shadow-card">
            <h3 className="font-display font-semibold text-destructive">{p.notForWhom[lang]}</h3>
            <ul className="mt-3 space-y-2">
              {service.notForWhom[lang].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive/60" />{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-accent/30 bg-accent/5 p-4">
            <h3 className="font-display font-semibold text-foreground">{p.included[lang]}</h3>
            <ul className="mt-3 space-y-2">
              {service.included[lang].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
            <h3 className="font-display font-semibold text-foreground">{p.notIncluded[lang]}</h3>
            <ul className="mt-3 space-y-2">
              {service.notIncluded[lang].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive/60" />{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 rounded-md border border-border bg-card p-4 shadow-card">
          <h3 className="font-display text-subtitle font-bold text-foreground">{p.requirements[lang]}</h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {service.requirements[lang].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-5 rounded-md border border-border bg-card p-4 shadow-card">
          <h3 className="font-display text-subtitle font-bold text-foreground">{p.steps[lang]}</h3>
          <div className="mt-4 space-y-3">
            {service.steps[lang].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">{i + 1}</span>
                <p className="pt-0.5 text-sm text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <h3 className="font-display text-subtitle font-bold text-foreground">{p.faq[lang]}</h3>
          <Accordion type="single" collapsible className="mt-4">
            {service.faq.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium text-foreground">{item.q[lang]}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{item.a[lang]}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-5 rounded-md border-2 border-amber-300/50 bg-amber-50/60 p-5">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-foreground/80"><strong>{lang === "en" ? "Notice:" : lang === "pt" ? "Aviso:" : "Aviso:"}</strong> {p.disclaimer[lang]}</p>
          </div>
        </div>

        <div className="sticky bottom-4 z-30 mt-6">
          <div className="rounded-md border border-border bg-card p-4 shadow-lg">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <p className="font-display font-bold text-foreground">{service.shortTitle[lang]}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground line-through">{service.originalPrice[lang]}</span>
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">{t.servicesSection.discount[lang]}</span>
                </div>
                <p className="text-lg font-extrabold text-accent">{service.price[lang]}</p>
              </div>
              <Button size="lg" className="w-full bg-accent text-accent-foreground shadow-button hover:bg-green-dark sm:w-auto" asChild>
                <Link to={`/checkout/${slug}`}>{p.createAccount[lang]} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
