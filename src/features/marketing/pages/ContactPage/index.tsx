import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck2, Mail, MessageSquareText, ShieldCheck } from "lucide-react";
import { ContactSection } from "@shared/components/organisms/ContactSection";
import { useLocale, useT } from "@app/app/i18n";

const contactCopy = {
  pt: {
    badge: "Fale com a Aplikei",
    accent: "sobre sua operação",
    lead: "Conte como seu escritório vende hoje e onde a operação trava. Mostramos como centralizar produtos, checkout, processos, equipe, financeiro e IA em um só lugar.",
    primaryCta: "Falar com especialista",
    secondaryCta: "Ver como funciona",
    cards: [
      { title: "Diagnóstico consultivo", text: "Entendemos volume, equipe e gargalos antes de propor um caminho." },
      { title: "Demonstração guiada", text: "Mostramos produtos, checkout, processos e apoio de IA na prática." },
      { title: "Dados protegidos", text: "O contato inicial segue o mesmo padrão de privacidade da plataforma." },
    ],
    strip: [
      { label: "Tempo de resposta", value: "1 dia útil" },
      { label: "Formato", value: "Demo B2B" },
      { label: "Foco", value: "Operação digital" },
    ],
  },
  en: {
    badge: "Talk to Aplikei",
    accent: "about your operation",
    lead: "Tell us how your firm sells today and where the operation gets stuck. We show how to centralize products, checkout, processes, team, finance and AI in one place.",
    primaryCta: "Talk to a specialist",
    secondaryCta: "See how it works",
    cards: [
      { title: "Consultative diagnosis", text: "We understand volume, team and bottlenecks before proposing a path." },
      { title: "Guided demo", text: "We show products, checkout, processes and AI support in practice." },
      { title: "Protected data", text: "The first contact follows the same privacy standard as the platform." },
    ],
    strip: [
      { label: "Response time", value: "1 business day" },
      { label: "Format", value: "B2B demo" },
      { label: "Focus", value: "Digital operation" },
    ],
  },
  es: {
    badge: "Hable con Aplikei",
    accent: "sobre su operación",
    lead: "Cuéntenos cómo vende su firma hoy y dónde se atasca la operación. Mostramos cómo centralizar productos, checkout, procesos, equipo, financiero e IA en un solo lugar.",
    primaryCta: "Hablar con un especialista",
    secondaryCta: "Ver cómo funciona",
    cards: [
      { title: "Diagnóstico consultivo", text: "Entendemos volumen, equipo y cuellos de botella antes de proponer un camino." },
      { title: "Demo guiada", text: "Mostramos productos, checkout, procesos y apoyo de IA en la práctica." },
      { title: "Datos protegidos", text: "El primer contacto sigue el mismo estándar de privacidad de la plataforma." },
    ],
    strip: [
      { label: "Tiempo de respuesta", value: "1 día hábil" },
      { label: "Formato", value: "Demo B2B" },
      { label: "Foco", value: "Operación digital" },
    ],
  },
} as const;

const cardIcons = [MessageSquareText, CalendarCheck2, ShieldCheck];

export default function ContactPage() {
  const t = useT("common");
  const { lang } = useLocale();
  const p = t.contactPage;
  const copy = contactCopy[lang as keyof typeof contactCopy] ?? contactCopy.pt;

  return (
    <div className="bg-bg text-text">
      <section className="relative overflow-hidden bg-bg-subtle px-6 py-16 sm:px-8 lg:px-16 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(45,99,255,0.18),transparent_34%),radial-gradient(circle_at_12%_0%,rgba(52,211,238,0.12),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-sm">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(45,99,255,0.22)]" />
              {copy.badge}
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.04] tracking-tight text-text lg:text-7xl">
              {p?.hero?.title ?? "Vamos conversar?"} <span className="text-primary">{copy.accent}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-muted">{copy.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contato" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-on-primary shadow-lg shadow-primary/20 transition hover:bg-primary-hover">
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#canais" className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3 font-bold text-text transition hover:border-primary/30">
                {copy.secondaryCta}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="relative grid min-h-[500px] content-center gap-4"
            aria-hidden="true"
          >
            <div className="absolute aspect-square w-[min(88%,540px)] rounded-full border border-primary/10 bg-[radial-gradient(circle_at_50%_50%,rgba(45,99,255,0.18)_0_34%,rgba(52,211,238,0.08)_35%,transparent_66%)] max-sm:w-[min(92vw,360px)]" />
            <div className="relative z-10 mx-auto flex min-h-56 w-full max-w-[420px] flex-col justify-center gap-3 rounded-[26px] border border-border bg-card/90 p-7 text-center shadow-2xl backdrop-blur">
              <Mail className="mx-auto h-11 w-11 text-primary" />
              <strong className="font-display text-2xl tracking-tight">contato@aplikei.com.br</strong>
              <span className="text-sm leading-relaxed text-text-muted">{p?.hero?.subtitle ?? "Estamos prontos para tirar suas dúvidas."}</span>
            </div>
            <div className="relative z-10 grid gap-4 sm:grid-cols-3">
              {copy.cards.map((card, index) => {
                const Icon = cardIcons[index] ?? MessageSquareText;
                return (
                  <article key={card.title} className="rounded-[20px] border border-border bg-card/90 p-4 shadow-xl backdrop-blur">
                    <Icon className="h-6 w-6 text-primary" />
                    <strong className="mt-2 block text-sm">{card.title}</strong>
                    <span className="mt-1 block text-xs leading-relaxed text-text-muted">{card.text}</span>
                  </article>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <ContactSection />

      <section className="px-6 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-3">
          {copy.strip.map((item) => (
            <div key={item.label} className="rounded-[20px] border border-border bg-card p-6 shadow-sm">
              <span className="block text-xs font-black uppercase tracking-[0.16em] text-text-muted">{item.label}</span>
              <strong className="mt-2 block font-display text-2xl tracking-tight text-text lg:text-3xl">{item.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
