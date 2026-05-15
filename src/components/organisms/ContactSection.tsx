import { motion } from "framer-motion";
import { Button } from "../atoms/button";
import { useT } from "../../i18n";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

export function ContactSection() {
  const landing = useT("landing") as any;
  const t = landing?.lex?.cta || {
    title: "Pronto para começar?",
    description: "Entre em contato conosco para uma análise detalhada do seu caso.",
    button: "Enviar Mensagem"
  };

  return (
    <section id="contato" className="bg-bg-subtle px-8 py-24 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl font-bold tracking-[-0.03em] text-text lg:text-5xl">
              {t.title}
            </h2>
            <p className="mt-6 text-lg text-text-muted">
              {t.description}
            </p>

            <div className="mt-12 space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FiMail size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-muted uppercase tracking-wider">Email</p>
                  <p className="text-lg font-medium text-text">contato@aplikei.com.br</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FiPhone size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-muted uppercase tracking-wider">Telefone</p>
                  <p className="text-lg font-medium text-text">+55 (11) 99999-9999</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FiMapPin size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-muted uppercase tracking-wider">Localização</p>
                  <p className="text-lg font-medium text-text">São Paulo, SP - Brasil</p>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] border border-border bg-card p-8 shadow-xl lg:p-12"
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-muted uppercase">Nome</label>
                  <input type="text" className="w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-muted uppercase">Email</label>
                  <input type="email" className="w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" placeholder="seu@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-muted uppercase">Assunto</label>
                <input type="text" className="w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" placeholder="Como podemos ajudar?" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-muted uppercase">Mensagem</label>
                <textarea rows={4} className="w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" placeholder="Descreva seu caso..." />
              </div>
              <Button size="lg" className="w-full">
                {t.button}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
