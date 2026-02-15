import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Plane,
  GraduationCap,
  Clock,
  Repeat,
  BookOpen,
  Bot,
  Headphones,
  FileText,
  Shield,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { services } from "@/data/services";

const iconMap: Record<string, React.ReactNode> = {
  plane: <Plane className="h-6 w-6" />,
  "graduation-cap": <GraduationCap className="h-6 w-6" />,
  clock: <Clock className="h-6 w-6" />,
  repeat: <Repeat className="h-6 w-6" />,
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const faqItems = [
  {
    q: "A Aplikei é um escritório de advocacia?",
    a: "Não. A Aplikei é uma plataforma de guias digitais com IA. Não oferecemos aconselhamento jurídico, representação legal, nem garantimos aprovação de vistos ou petições.",
  },
  {
    q: "O que é o suporte humano N1?",
    a: "Suporte humano é apenas operacional (uso da plataforma e passos básicos): como usar o sistema, onde subir documentos, como pagar taxas, como agendar e como acompanhar status. Não inclui análise de caso, estratégia ou aconselhamento.",
  },
  {
    q: "Posso obter reembolso?",
    a: "Sim, conforme nossa Política de Reembolso. Consulte os detalhes na página dedicada antes de comprar.",
  },
  {
    q: "A IA substitui um advogado?",
    a: "Não. A IA ajuda a organizar dados, documentos e gerar checklists. Ela não analisa elegibilidade, não dá conselhos jurídicos e não garante resultados.",
  },
  {
    q: "Os dados que eu forneço são seguros?",
    a: "Sim. Utilizamos criptografia e seguimos práticas de segurança para proteger seus dados. Consulte nossa Política de Privacidade para mais detalhes.",
  },
];

export default function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-hero relative overflow-hidden py-24 md:py-32">
        <div className="container relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-tight text-primary-foreground md:text-5xl lg:text-6xl"
          >
            Aplikei: seu processo com{" "}
            <span className="text-gradient-accent">clareza</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/75"
          >
            Você compra um guia passo a passo e ganha acesso à IA durante o
            processo para organizar dados, documentos e gerar seu pacote final.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              size="lg"
              className="bg-accent text-accent-foreground shadow-button hover:bg-green-dark px-8"
              asChild
            >
              <Link to="/cadastro">Começar agora</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link to="/servicos">Ver serviços</Link>
            </Button>
          </motion.div>
        </div>
        {/* Decorative gradient orb */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </section>

      {/* Como funciona */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-bold text-foreground md:text-4xl">
            Como funciona
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Três passos simples para organizar seu processo imigratório.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Escolha seu serviço",
                desc: "Veja tudo que está incluso e não incluso antes de pagar.",
                icon: <BookOpen className="h-7 w-7 text-accent" />,
              },
              {
                step: "2",
                title: "Leia antes de comprar",
                desc: "Transparência total sobre o que você está comprando.",
                icon: <Shield className="h-7 w-7 text-accent" />,
              },
              {
                step: "3",
                title: "Monte seu pacote final",
                desc: "Use a IA para organizar dados, documentos e gerar seu PDF.",
                icon: <FileText className="h-7 w-7 text-accent" />,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  {item.icon}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* O que você recebe */}
      <section className="border-t border-border bg-muted/50 py-20">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-bold text-foreground md:text-4xl">
            O que você recebe
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <BookOpen className="h-6 w-6" />,
                title: "Guia digital + checklist",
                desc: "Passo a passo completo com checklist de documentos.",
              },
              {
                icon: <Bot className="h-6 w-6" />,
                title: "IA durante o processo",
                desc: "Bônus: organize dados e documentos com ajuda da IA.",
                badge: "Bônus",
              },
              {
                icon: <Headphones className="h-6 w-6" />,
                title: "Suporte N1 Operacional",
                desc: "Bônus: ajuda para usar a plataforma e passos básicos.",
                badge: "Bônus",
              },
              {
                icon: <FileText className="h-6 w-6" />,
                title: "Pacote final em PDF",
                desc: "Checklist final, resumo do caso e instruções de próximos passos.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
              >
                {item.badge && (
                  <span className="absolute right-4 top-4 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                    {item.badge}
                  </span>
                )}
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  {item.icon}
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-bold text-foreground md:text-4xl">
            Nossos serviços
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Escolha o guia ideal para o seu processo imigratório.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <motion.div
                key={s.slug}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Link
                  to={`/servicos/${s.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:border-accent/40"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    {iconMap[s.icon]}
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {s.shortTitle}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.subtitle}
                  </p>
                  <p className="mt-4 font-display text-lg font-bold text-accent">
                    {s.price}
                  </p>
                  <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-accent group-hover:underline">
                    Ver detalhes <ChevronRight className="h-4 w-4" />
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
          <h2 className="text-center font-display text-3xl font-bold text-foreground md:text-4xl">
            Perguntas frequentes
          </h2>
          <Accordion type="single" collapsible className="mt-10">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-medium text-foreground">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.a}
                </AccordionContent>
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
              Avisos Importantes
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-foreground/80">
              {[
                "Aplikei não é escritório de advocacia.",
                "Não oferecemos aconselhamento jurídico.",
                "Não garantimos aprovação de vistos ou petições.",
                "Não representamos o cliente perante consulado ou USCIS.",
                "Suporte humano é apenas operacional (uso da plataforma e passos básicos).",
                "A IA organiza dados e documentos, mas não analisa elegibilidade ou chances.",
              ].map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  {d}
                </li>
              ))}
            </ul>
            <Link
              to="/disclaimers"
              className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
            >
              Ver todos os disclaimers →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
