import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck2, Mail, MessageSquareText, ShieldCheck } from "lucide-react";
import { ContactSection } from "@shared/components/organisms/ContactSection";
import { useT } from "@app/app/i18n";
import { PublicButton } from "@shared/components/atoms/PublicButton";

const cardIcons = [MessageSquareText, CalendarCheck2, ShieldCheck];

export default function ContactPage() {
  const t = useT("common");
  const p = t.contactPage;

  return (
    <div className="public-page text-text">
      <section className="public-section relative overflow-hidden bg-bg-subtle">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(45,99,255,0.18),transparent_34%),radial-gradient(circle_at_12%_0%,rgba(52,211,238,0.12),transparent_30%)]" />
        <div className="public-container relative grid items-stretch gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-tight text-text sm:text-4xl lg:text-5xl">
              {p?.hero?.title ?? "Vamos conversar?"} <span className="text-primary">{p?.accent}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-muted">{p?.lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PublicButton asChild tone="solid">
                <a href="#contato">
                {p?.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </a>
              </PublicButton>
              <PublicButton asChild tone="outline">
                <a href="#canais">
                {p?.secondaryCta}
              </a>
              </PublicButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="relative grid content-center gap-4"
            aria-hidden="true"
          >
            <div className="absolute aspect-square w-[min(88%,540px)] rounded-full border border-primary/10 bg-[radial-gradient(circle_at_50%_50%,rgba(45,99,255,0.18)_0_34%,rgba(52,211,238,0.08)_35%,transparent_66%)] max-sm:w-[min(92vw,360px)]" />
            <div className="relative z-10 mx-auto flex min-h-56 w-full max-w-[420px] flex-col justify-center gap-3 rounded-[26px] border border-border bg-card/90 p-7 text-center shadow-2xl backdrop-blur">
              <Mail className="mx-auto h-11 w-11 text-primary" />
              <strong className="font-display text-2xl tracking-tight">contato@aplikei.com.br</strong>
              <span className="text-sm leading-relaxed text-text-muted">{p?.hero?.subtitle ?? "Estamos prontos para tirar suas dúvidas."}</span>
            </div>
            <div className="relative z-10 grid gap-4 sm:grid-cols-3">
              {(p?.cards as Array<{title: string; text: string}> ?? []).map((card, index) => {
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
    </div>
  );
}
