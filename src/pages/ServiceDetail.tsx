import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2,
  XCircle,
  Plane,
  GraduationCap,
  Clock,
  Repeat,
  ArrowRight,
  Shield,
  FileText,
} from "lucide-react";
import { getServiceBySlug } from "@/data/services";

const iconMap: Record<string, React.ReactNode> = {
  plane: <Plane className="h-8 w-8" />,
  "graduation-cap": <GraduationCap className="h-8 w-8" />,
  clock: <Clock className="h-8 w-8" />,
  repeat: <Repeat className="h-8 w-8" />,
};

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const service = getServiceBySlug(slug || "");

  if (!service) return <Navigate to="/servicos" replace />;

  return (
    <div className="py-16">
      <div className="container max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            {iconMap[service.icon]}
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            {service.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{service.subtitle}</p>
          <p className="mt-4 font-display text-3xl font-bold text-accent">{service.price}</p>
        </motion.div>

        {/* Visão geral */}
        <div className="mt-12 rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-xl font-bold text-foreground">Visão geral</h2>
          <p className="mt-3 text-muted-foreground">{service.description}</p>
        </div>

        {/* Para quem é / não é */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display font-semibold text-accent">✅ Para quem é</h3>
            <ul className="mt-3 space-y-2">
              {service.forWhom.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display font-semibold text-destructive">❌ Para quem NÃO é</h3>
            <ul className="mt-3 space-y-2">
              {service.notForWhom.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Inclui / Não inclui */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
            <h3 className="font-display font-semibold text-foreground">O que está incluso</h3>
            <ul className="mt-3 space-y-2">
              {service.included.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
            <h3 className="font-display font-semibold text-foreground">O que NÃO está incluso</h3>
            <ul className="mt-3 space-y-2">
              {service.notIncluded.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* O que vai precisar */}
        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-xl font-bold text-foreground">O que você vai precisar</h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {service.requirements.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Passo a passo */}
        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-xl font-bold text-foreground">Passo a passo resumido</h3>
          <div className="mt-4 space-y-3">
            {service.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                  {i + 1}
                </span>
                <p className="pt-0.5 text-sm text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8">
          <h3 className="font-display text-xl font-bold text-foreground">Perguntas frequentes</h3>
          <Accordion type="single" collapsible className="mt-4">
            {service.faq.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium text-foreground">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 rounded-xl border-2 border-amber-300/50 bg-amber-50/60 p-5">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-foreground/80">
              <strong>Aviso:</strong> Aplikei não é escritório de advocacia, não oferece aconselhamento jurídico, não garante aprovação e não representa o cliente perante consulado ou USCIS. Suporte humano é apenas operacional.
            </p>
          </div>
        </div>

        {/* CTA fixo */}
        <div className="sticky bottom-4 z-30 mt-10">
          <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <p className="font-display font-bold text-foreground">{service.shortTitle}</p>
                <p className="text-lg font-bold text-accent">{service.price}</p>
              </div>
              <Button
                size="lg"
                className="w-full bg-accent text-accent-foreground shadow-button hover:bg-green-dark sm:w-auto"
                asChild
              >
                <Link to="/cadastro">
                  Criar conta e continuar <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
