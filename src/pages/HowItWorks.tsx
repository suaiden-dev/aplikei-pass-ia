import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Bot, Headphones, FileText, CreditCard, UserPlus, Shield } from "lucide-react";

const timelineSteps = [
  { icon: <BookOpen className="h-5 w-5" />, title: "Pré-compra", desc: "Leia tudo sobre o serviço: o que inclui e o que não inclui." },
  { icon: <UserPlus className="h-5 w-5" />, title: "Cadastro + Aceites", desc: "Crie sua conta e aceite os termos e disclaimers." },
  { icon: <CreditCard className="h-5 w-5" />, title: "Pagamento", desc: "Pague com segurança e tenha acesso imediato ao guia." },
  { icon: <Bot className="h-5 w-5" />, title: "Onboarding IA", desc: "A IA ajuda você a preencher dados, organizar documentos e montar seu caso." },
  { icon: <FileText className="h-5 w-5" />, title: "Pacote Final (PDF)", desc: "Gere seu PDF com checklist, resumo e instruções dos próximos passos." },
];

export default function HowItWorks() {
  return (
    <div className="py-16">
      <div className="container max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center font-display text-4xl font-bold text-foreground"
        >
          Como funciona a Aplikei
        </motion.h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Um fluxo simples de 5 etapas: da escolha do serviço até a geração do seu pacote final.
        </p>

        {/* Timeline */}
        <div className="relative mt-16">
          <div className="absolute left-6 top-0 h-full w-px bg-border md:left-1/2" />
          {timelineSteps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative mb-10 flex items-start gap-6 ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              <div className="absolute left-6 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-4 border-background bg-accent text-accent-foreground md:left-1/2">
                {step.icon}
              </div>
              <div className={`ml-16 max-w-sm rounded-xl border border-border bg-card p-5 shadow-card md:ml-0 ${
                i % 2 === 0 ? "md:mr-auto md:pr-16" : "md:ml-auto md:pl-16"
              }`}>
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Etapa {i + 1}
                </span>
                <h3 className="mt-1 font-display text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* O que você compra */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: <BookOpen className="h-6 w-6" />,
              title: "Você compra: Guia",
              desc: "Guia digital passo a passo com checklist de documentos e orientações detalhadas.",
              highlight: true,
            },
            {
              icon: <Bot className="h-6 w-6" />,
              title: "Bônus: IA",
              desc: "Acesso à IA durante o processo para organizar dados, documentos e gerar o pacote final.",
            },
            {
              icon: <Headphones className="h-6 w-6" />,
              title: "Bônus: Suporte N1",
              desc: "Suporte humano apenas operacional: uso da plataforma, upload de documentos, pagamento de taxas.",
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`rounded-xl border p-6 shadow-card ${
                card.highlight
                  ? "border-accent bg-accent/5"
                  : "border-border bg-card"
              }`}
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
                card.highlight ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
              }`}>
                {card.icon}
              </div>
              <h3 className="font-display font-semibold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* O que a IA faz */}
        <div className="mt-16 rounded-xl border border-border bg-card p-8 shadow-card">
          <h2 className="font-display text-2xl font-bold text-foreground">
            O que a IA faz (e o que não faz)
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 font-semibold text-accent">✅ A IA ajuda você a:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Organizar dados pessoais e do processo</li>
                <li>• Montar a checklist de documentos</li>
                <li>• Gerar o resumo do caso para o Pacote Final</li>
                <li>• Explicar campos de formulário de forma educacional</li>
                <li>• Lembrar de prazos e próximos passos</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-destructive">❌ A IA NÃO faz:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Análise de elegibilidade ou chances</li>
                <li>• Aconselhamento jurídico</li>
                <li>• Recomendações estratégicas</li>
                <li>• Preenchimento de formulários oficiais</li>
                <li>• Representação perante consulado/USCIS</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" className="bg-accent text-accent-foreground shadow-button hover:bg-green-dark" asChild>
            <Link to="/servicos">Ver serviços disponíveis</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
