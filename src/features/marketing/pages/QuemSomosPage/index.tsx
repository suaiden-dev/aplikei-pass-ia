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
import { useT } from "@app/app/i18n";
import officeTeamImage from "@assets/images/group-business-executives-discussing-laptop-their-des.jpg";
import { PublicButton } from "@shared/components/atoms/PublicButton";

type Pillar = {
  title: string;
  description: string;
};

const pillarIcons = [Sparkles, LockKeyhole, BarChart3, Network];

export default function QuemSomosPage() {
  const t = useT("common");
  const p = t.whoWeArePage;
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
            <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-tight text-text sm:text-4xl lg:text-5xl">
              {p?.hero?.title} <span className="text-primary">{p?.accent}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-muted">{p?.hero?.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PublicButton asChild tone="solid">
                <Link to="/contato">
                {p?.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              </PublicButton>
              <PublicButton asChild tone="outline">
                <a href="#pilares">
                {p?.secondaryCta}
              </a>
              </PublicButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="relative grid place-items-center pb-16 sm:min-h-[520px] sm:pb-0"
          >
            <div className="absolute aspect-square w-[min(88%,560px)] rounded-full bg-[radial-gradient(circle_at_46%_40%,rgba(45,99,255,0.2)_0_34%,rgba(52,211,238,0.08)_35%,transparent_66%)]" />
            <div className="relative z-10 aspect-[4/4.6] w-full max-w-[520px] overflow-hidden rounded-[32px] border border-border/50 bg-card shadow-2xl shadow-black/20">
              <img src={officeTeamImage} alt="" className="h-full w-full object-cover saturate-[.82] contrast-[1.04]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,13,28,0.0)_30%,rgba(8,13,28,0.85)_100%),radial-gradient(circle_at_74%_20%,rgba(45,99,255,0.14),transparent_55%)]" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/60 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {p?.showcaseLabel}
                </span>
                <strong className="mt-3 block font-display text-2xl tracking-tight text-white">{p?.showcaseTitle}</strong>
                <p className="mt-1 text-sm text-white/60">{p?.showcaseSubtitle}</p>
              </div>
            </div>
            <div className="absolute bottom-28 -right-4 z-20 w-[min(68%,260px)] overflow-hidden rounded-[20px] border border-border/60 bg-white/96 shadow-2xl shadow-black/12 backdrop-blur-sm max-sm:bottom-4 max-sm:left-3 max-sm:right-auto max-sm:w-[min(86%,260px)]">
              <div className="h-[3px] bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400" />
              <div className="p-4">
                <span className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
                  Redução operacional
                </span>
                <strong className="block font-display text-4xl font-black leading-none tracking-tight text-primary">{p?.stats?.approval}</strong>
                <p className="mt-2 text-xs leading-relaxed text-text-muted">{p?.hero?.stats}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="public-section-tight bg-bg-subtle">
        <div className="public-container">
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
            <h2 className="font-display text-4xl font-bold tracking-tight lg:text-5xl">{p?.history?.title}</h2>
            <p className="mt-4 max-w-3xl whitespace-pre-line text-lg leading-relaxed text-text-muted">{p?.history?.description}</p>
          </div>
          <div className="grid gap-4">
            {(p?.cards as Array<{title: string; text: string}> ?? []).map((card, index) => {
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
            <h2 className="font-display text-4xl font-bold tracking-tight lg:text-5xl">{p?.pillars?.title}</h2>
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
        <div className="public-container rounded-[26px] bg-primary bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.18),transparent_48%)] p-6 text-center text-on-primary shadow-2xl shadow-primary/25 sm:p-10 lg:p-16">
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
