import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Check,
  FileCheck2,
  Globe2,
  LayoutTemplate,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useLocale, useT } from "@app/app/i18n";

type ServiceSection = {
  title: string;
  description: string;
  features: string[];
};

const serviceIcons = [Globe2, LayoutTemplate, FileCheck2, ShieldCheck];
const platformRows = [
  { label: "B1/B2", progress: 82 },
  { label: "F-1", progress: 64 },
  { label: "COS", progress: 48 },
];

const localCopy = {
  pt: {
    titleAccent: "para vender e operar com mais controle",
    secondaryCta: "Ver como funciona",
    proof: [
      { value: "1", label: "plataforma para toda a operação" },
      { value: "Produtos", label: "checkout e processos" },
      { value: "IA", label: "apoio à equipe" },
    ],
    panel: {
      title: "Operação digital",
      subtitle: "Produtos, equipe e financeiro",
      live: "Live",
      aiTitle: "IA aplicada à operação",
      aiSubtitle: "menos tarefas manuais",
      securityTitle: "Dados protegidos",
      securitySubtitle: "acesso e histórico",
    },
    rows: ["Produtos configurados", "Processo em andamento", "Documentos pendentes"],
    solutions: {
      kicker: "Soluções",
      title: "Tudo o que seu escritório precisa para vender, operar e escalar.",
      lead: "Crie produtos digitais, checkout personalizado, processos claros, equipe integrada e financeiro em um só lugar.",
    },
    performance: {
      kicker: "Performance",
      items: [
        { title: "Menos retrabalho", text: "Fluxos mais claros reduzem o trabalho manual da equipe." },
        { title: "Mais previsibilidade", text: "Cada processo fica visível por etapa, responsável e status." },
      ],
    },
    security: {
      kicker: "Segurança",
      items: ["Criptografia", "Histórico de ações", "Controle de acesso"],
    },
  },
  en: {
    titleAccent: "to sell and operate with more control",
    secondaryCta: "See how it works",
    proof: [
      { value: "1", label: "platform for the whole operation" },
      { value: "Products", label: "checkout and processes" },
      { value: "AI", label: "team support" },
    ],
    panel: {
      title: "Digital operation",
      subtitle: "Products, team and finance",
      live: "Live",
      aiTitle: "Applied AI",
      aiSubtitle: "less manual work",
      securityTitle: "Protected data",
      securitySubtitle: "access and history",
    },
    rows: ["Configured products", "Process in progress", "Pending documents"],
    solutions: {
      kicker: "Solutions",
      title: "Everything your firm needs to sell, operate and scale.",
      lead: "Create digital products, personalized checkout, clear processes, integrated team and finance in one place.",
    },
    performance: {
      kicker: "Performance",
      items: [
        { title: "Less rework", text: "Clearer flows reduce manual work for the team." },
        { title: "More predictability", text: "Each process stays visible by stage, owner and status." },
      ],
    },
    security: {
      kicker: "Security",
      items: ["Encryption", "Action history", "Access control"],
    },
  },
  es: {
    titleAccent: "para vender y operar con más control",
    secondaryCta: "Ver cómo funciona",
    proof: [
      { value: "1", label: "plataforma para toda la operación" },
      { value: "Productos", label: "checkout y procesos" },
      { value: "IA", label: "apoyo al equipo" },
    ],
    panel: {
      title: "Operación digital",
      subtitle: "Productos, equipo y financiero",
      live: "Live",
      aiTitle: "IA aplicada a la operación",
      aiSubtitle: "menos tareas manuales",
      securityTitle: "Datos protegidos",
      securitySubtitle: "acceso e historial",
    },
    rows: ["Productos configurados", "Proceso en curso", "Documentos pendientes"],
    solutions: {
      kicker: "Soluciones",
      title: "Todo lo que su firma necesita para vender, operar y escalar.",
      lead: "Cree productos digitales, checkout personalizado, procesos claros, equipo integrado y financiero en un solo lugar.",
    },
    performance: {
      kicker: "Rendimiento",
      items: [
        { title: "Menos retrabajo", text: "Los flujos más claros reducen el trabajo manual del equipo." },
        { title: "Más previsibilidad", text: "Cada proceso queda visible por etapa, responsable y estado." },
      ],
    },
    security: {
      kicker: "Seguridad",
      items: ["Cifrado", "Historial de acciones", "Control de acceso"],
    },
  },
} as const;

export default function ServicosPage() {
  const t = useT("common");
  const { lang } = useLocale();
  const p = t.servicesPage;
  const sections = (p?.sections ?? []) as ServiceSection[];
  const copy = localCopy[lang as keyof typeof localCopy] ?? localCopy.pt;

  return (
    <div className="bg-bg text-text">
      <section className="relative overflow-hidden bg-bg-subtle px-6 py-16 sm:px-8 lg:px-16 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(45,99,255,0.18),transparent_34%),radial-gradient(circle_at_12%_0%,rgba(52,211,238,0.12),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="flex flex-col"
          >
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-sm">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(45,99,255,0.22)]" />
              {p?.hero?.tag}
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.04] tracking-tight text-text lg:text-7xl">
              {p?.hero?.title} <span className="text-primary">{copy.titleAccent}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-muted">{p?.hero?.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contato" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-on-primary shadow-lg shadow-primary/20 transition hover:bg-primary-hover">
                {p?.cta?.button}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#solucoes" className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3 font-bold text-text transition hover:border-primary/30">
                {copy.secondaryCta}
              </a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {copy.proof.map((item) => (
                <div key={item.value} className="rounded-[20px] border border-border bg-card/80 p-4 shadow-sm">
                  <strong className="block font-display text-2xl leading-none tracking-tight text-primary">{item.value}</strong>
                  <span className="mt-2 block text-xs leading-snug text-text-muted">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="relative grid min-h-[520px] place-items-center max-sm:min-h-[560px]"
            aria-hidden="true"
          >
            <div className="absolute aspect-square w-[min(88%,560px)] rounded-full bg-[radial-gradient(circle_at_45%_38%,rgba(255,255,255,0.4)_0_28%,rgba(45,99,255,0.18)_29%,rgba(45,99,255,0.08)_56%,transparent_57%)]" />
            <div className="relative z-10 w-full max-w-[520px] rounded-[26px] border border-border bg-card/90 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display font-black text-on-primary">A</span>
                <div className="min-w-0">
                  <strong className="block font-display text-lg tracking-tight">{copy.panel.title}</strong>
                  <small className="text-xs text-text-muted">{copy.panel.subtitle}</small>
                </div>
                <span className="ml-auto rounded-full bg-success/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-success">{copy.panel.live}</span>
              </div>
              <div className="mt-6 flex h-36 items-end gap-3 px-1">
                {["48%", "72%", "58%", "86%", "66%"].map((height) => (
                  <span key={height} className="flex-1 rounded-t-xl rounded-b-md bg-gradient-to-b from-info to-primary shadow-lg shadow-primary/15" style={{ height }} />
                ))}
              </div>
              <div className="mt-5 grid gap-3">
                {platformRows.map((row, index) => (
                  <div key={row.label} className="grid gap-3 rounded-[14px] border border-border bg-bg-subtle p-4 sm:grid-cols-[92px_1fr] sm:items-center">
                    <div>
                      <strong className="block text-sm">{row.label}</strong>
                      <span className="text-xs text-text-muted">{copy.rows[index]}</span>
                    </div>
                    <span className="h-2 overflow-hidden rounded-full bg-primary/10">
                      <span className="block h-full rounded-full bg-gradient-to-r from-info to-primary" style={{ width: `${row.progress}%` }} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute right-0 top-16 z-20 flex w-[min(72%,300px)] items-center gap-3 rounded-[20px] border border-border bg-card/90 p-4 shadow-xl backdrop-blur max-sm:relative max-sm:top-auto max-sm:mt-[-18px] max-sm:justify-self-end">
              <Sparkles className="h-7 w-7 shrink-0 text-primary" />
              <div>
                <strong className="block text-sm">{copy.panel.aiTitle}</strong>
                <span className="text-xs text-text-muted">{copy.panel.aiSubtitle}</span>
              </div>
            </div>
            <div className="absolute bottom-14 left-0 z-20 flex w-[min(72%,300px)] items-center gap-3 rounded-[20px] border border-border bg-card/90 p-4 shadow-xl backdrop-blur max-sm:relative max-sm:bottom-auto max-sm:mt-[-8px] max-sm:justify-self-start">
              <LockKeyhole className="h-7 w-7 shrink-0 text-primary" />
              <div>
                <strong className="block text-sm">{copy.panel.securityTitle}</strong>
                <span className="text-xs text-text-muted">{copy.panel.securitySubtitle}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="solucoes" className="px-6 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{copy.solutions.kicker}</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-text lg:text-5xl">{copy.solutions.title}</h2>
            <p className="mt-4 text-lg leading-relaxed text-text-muted">{copy.solutions.lead}</p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {sections.map((section, index) => {
              const Icon = serviceIcons[index] ?? Sparkles;
              return (
                <motion.article
                  key={section.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="rounded-[20px] border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-[14px] bg-primary text-on-primary shadow-lg shadow-primary/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-2xl font-bold tracking-tight">{section.title}</h3>
                  <p className="mt-3 leading-relaxed text-text-muted">{section.description}</p>
                  <ul className="mt-6 grid gap-3">
                    {section.features.map((feature) => (
                      <li key={feature} className="grid grid-cols-[auto_1fr] gap-3 text-sm leading-relaxed">
                        <Check className="mt-0.5 h-5 w-5 text-success" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-bg-subtle px-6 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{copy.performance.kicker}</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight lg:text-5xl">{p?.info?.leadership?.title}</h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-muted">{p?.info?.leadership?.description}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {copy.performance.items.map((item, index) => {
              const Icon = index === 0 ? BarChart3 : Users;
              return (
                <article key={item.title} className="min-h-56 rounded-[20px] border border-border bg-card p-6 shadow-sm">
                  <Icon className="h-10 w-10 text-primary" />
                  <strong className="mt-5 block font-display text-xl tracking-tight">{item.title}</strong>
                  <p className="mt-3 leading-relaxed text-text-muted">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-6 rounded-[26px] border border-border bg-bg-subtle p-6 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_0.55fr] lg:p-9">
          <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-primary text-on-primary shadow-lg shadow-primary/20">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{copy.security.kicker}</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">{p?.info?.rigor?.title}</h2>
            <p className="mt-3 text-lg leading-relaxed text-text-muted">{p?.info?.rigor?.description}</p>
          </div>
          <div className="grid gap-3">
            {copy.security.items.map((item) => (
              <span key={item} className="rounded-[14px] border border-border bg-card px-4 py-3 text-sm font-bold text-text-muted">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-8 lg:px-16 lg:pb-28">
        <div className="mx-auto max-w-[1200px] rounded-[26px] bg-primary bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.18),transparent_48%)] p-10 text-center text-on-primary shadow-2xl shadow-primary/25 lg:p-16">
          <h2 className="font-display text-4xl font-bold tracking-tight lg:text-5xl">{p?.cta?.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-on-primary/80">{p?.cta?.description}</p>
          <Link to="/contato" className="mt-8 inline-flex items-center gap-2 rounded-full bg-card px-6 py-3 font-bold text-primary shadow-lg transition hover:-translate-y-0.5">
            {p?.cta?.button}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
