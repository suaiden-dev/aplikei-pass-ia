import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Check,
  FileText,
  LockKeyhole,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useLocale, useT } from "@app/app/i18n";
import officeTeamImage from "@assets/images/group-business-executives-discussing-laptop-their-des.jpg";
import { PublicButton } from "@shared/components/atoms/PublicButton";

type Pillar = {
  title: string;
  description: string;
};

const whoCopy = {
  pt: {
    accent: "que vende, opera e escala.",
    primaryCta: "Agendar demonstração",
    secondaryCta: "Ver pilares",
    showcaseLabel: "Plataforma operacional",
    showcaseTitle: "Operação digital",
    showcaseSubtitle: "Soluções, checkout, processos e IA integrados",
    missionKicker: "Missão",
    pillarsKicker: "Pilares",
    metricsKicker: "Impacto",
    cards: [
      { title: "Soluções digitais", text: "Venda serviços com preço, escopo e fluxo organizados por solução." },
      { title: "Operação centralizada", text: "Centralize documentos, etapas, responsáveis e pendências em um só lugar." },
      { title: "IA aplicada", text: "Reduza retrabalho nas tarefas repetitivas e ganhe velocidade operacional." },
    ],
  },
  en: {
    accent: "that sells, operates and scales.",
    primaryCta: "Schedule a demo",
    secondaryCta: "See pillars",
    showcaseLabel: "Operational platform",
    showcaseTitle: "Digital operation",
    showcaseSubtitle: "Solutions, checkout, processes and AI integrated",
    missionKicker: "Mission",
    pillarsKicker: "Pillars",
    metricsKicker: "Impact",
    cards: [
      { title: "Digital solutions", text: "Sell services with clear pricing, scope and solution-specific flows." },
      { title: "Centralized operation", text: "Keep documents, stages, owners and pending items in one place." },
      { title: "Applied AI", text: "Reduce repetitive work and move faster across operational tasks." },
    ],
  },
  es: {
    accent: "que vende, opera y escala.",
    primaryCta: "Agendar demostración",
    secondaryCta: "Ver pilares",
    showcaseLabel: "Plataforma operativa",
    showcaseTitle: "Operación digital",
    showcaseSubtitle: "Soluciones, checkout, procesos e IA integrados",
    missionKicker: "Misión",
    pillarsKicker: "Pilares",
    metricsKicker: "Impacto",
    cards: [
      { title: "Soluciones digitales", text: "Venda servicios con precio, alcance y flujo organizados por solución." },
      { title: "Operación centralizada", text: "Centralice documentos, etapas, responsables y pendientes en un solo lugar." },
      { title: "IA aplicada", text: "Reduzca retrabajo en tareas repetitivas y gane velocidad operativa." },
    ],
  },
} as const;

const pillarIcons = [Sparkles, LockKeyhole, BarChart3, Network];

export default function QuemSomosPage() {
  const t = useT("common");
  const { lang } = useLocale();
  const p = t.whoWeArePage;
  const copy = whoCopy[lang as keyof typeof whoCopy] ?? whoCopy.pt;
  const pillars = (p?.pillars?.items ?? []) as Pillar[];
  const stats = [
    { value: p?.stats?.success, label: p?.stats?.successLabel },
    { value: p?.stats?.approval, label: p?.stats?.approvalLabel },
    { value: p?.stats?.countries, label: p?.stats?.countriesLabel },
  ];

  return (
    <div className="public-page text-text">
      <section className="public-section relative overflow-hidden bg-bg-subtle">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(45,99,255,0.18),transparent_34%),radial-gradient(circle_at_12%_0%,rgba(52,211,238,0.12),transparent_30%)]" />
        <div className="public-container relative grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-sm">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(45,99,255,0.22)]" />
              {p?.hero?.tag}
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.04] tracking-tight text-text lg:text-7xl">
              {p?.hero?.title} <span className="text-primary">{copy.accent}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-muted">{p?.hero?.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PublicButton asChild tone="solid">
                <Link to="/contato">
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              </PublicButton>
              <PublicButton asChild tone="outline">
                <a href="#pilares">
                {copy.secondaryCta}
              </a>
              </PublicButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="relative grid min-h-[520px] place-items-center max-sm:min-h-auto max-sm:pb-20"
          >
            <div className="absolute aspect-square w-[min(88%,560px)] rounded-full bg-[radial-gradient(circle_at_46%_40%,rgba(45,99,255,0.2)_0_34%,rgba(52,211,238,0.08)_35%,transparent_66%)]" />
            <div className="relative z-10 aspect-[4/4.6] w-full max-w-[520px] overflow-hidden rounded-[26px] border border-border bg-card shadow-2xl">
              <img src={officeTeamImage} alt="" className="h-full w-full object-cover saturate-[.84] contrast-[1.02]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,13,28,0.02),rgba(8,13,28,0.72)),radial-gradient(circle_at_74%_24%,rgba(45,99,255,0.18),transparent_60%)]" />
              <div className="absolute inset-x-5 bottom-5 rounded-[20px] border border-white/15 bg-[#080d1c]/75 p-5 text-white backdrop-blur">
                <span className="block text-xs font-black uppercase tracking-[0.14em] text-white/65">{copy.showcaseLabel}</span>
                <strong className="mt-2 block font-display text-3xl tracking-tight">{copy.showcaseTitle}</strong>
                <p className="mt-2 text-sm text-white/70">{copy.showcaseSubtitle}</p>
              </div>
            </div>
            <div className="absolute bottom-32 right-0 z-20 grid w-[min(70%,320px)] grid-cols-[auto_1fr] items-center gap-4 rounded-[20px] border border-border bg-card/90 p-5 shadow-xl backdrop-blur max-sm:bottom-5 max-sm:left-0 max-sm:right-auto max-sm:w-[min(92%,310px)]">
              <ShieldCheck className="h-9 w-9 text-primary" />
              <div>
                <strong className="block font-display text-3xl leading-none tracking-tight text-primary">{p?.stats?.approval}</strong>
                <span className="mt-2 block text-xs leading-relaxed text-text-muted">{p?.hero?.stats}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="public-section-tight bg-bg-subtle">
        <div className="public-container">
          <p className="mb-5 text-center text-xs font-black uppercase tracking-[0.16em] text-primary">{copy.metricsKicker}</p>
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[20px] border border-border bg-card p-6 text-center shadow-sm">
                <strong className="block font-display text-4xl leading-none tracking-tight text-primary">{stat.value}</strong>
                <span className="mt-3 block text-xs font-black uppercase tracking-[0.14em] text-text-muted">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container grid items-start gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{copy.missionKicker}</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight lg:text-5xl">{p?.history?.title}</h2>
            <p className="mt-4 max-w-3xl whitespace-pre-line text-lg leading-relaxed text-text-muted">{p?.history?.description}</p>
          </div>
          <div className="grid gap-4">
            {copy.cards.map((card, index) => {
              const Icon = index === 0 ? Sparkles : index === 1 ? ShieldCheck : FileText;
              return (
                <article key={card.title} className="grid gap-4 rounded-[20px] border border-border bg-card p-6 shadow-sm sm:grid-cols-[auto_1fr]">
                  <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-primary text-on-primary shadow-lg shadow-primary/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight">{card.title}</h3>
                    <p className="mt-2 leading-relaxed text-text-muted">{card.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pilares" className="public-section bg-bg-subtle">
        <div className="public-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{copy.pillarsKicker}</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight lg:text-5xl">{p?.pillars?.title}</h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {pillars.map((pillar, index) => {
              const Icon = pillarIcons[index] ?? Check;
              return (
                <motion.article
                  key={pillar.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="rounded-[20px] border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-[14px] bg-primary text-on-primary shadow-lg shadow-primary/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold tracking-tight">{pillar.title}</h3>
                  <p className="mt-3 leading-relaxed text-text-muted">{pillar.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container rounded-[26px] bg-primary bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.18),transparent_48%)] p-10 text-center text-on-primary shadow-2xl shadow-primary/25 lg:p-16">
          <h2 className="font-display text-4xl font-bold tracking-tight lg:text-5xl">{p?.cta?.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-on-primary/80">{p?.cta?.subtitle}</p>
          <PublicButton asChild tone="inverse" className="mt-8">
            <Link to="/contato">
            {p?.cta?.button}
            <ArrowRight className="h-4 w-4" />
          </Link>
          </PublicButton>
        </div>
      </section>
    </div>
  );
}
