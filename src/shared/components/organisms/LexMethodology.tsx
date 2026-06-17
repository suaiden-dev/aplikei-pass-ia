import { motion } from "framer-motion";
import { Card } from "../atoms/card";
import { Badge } from "../atoms/badge";
import { SectionHeader } from "../molecules/SectionHeader";
import { useT } from "@app/app/i18n";

export function LexMethodology() {
  const landing = useT("landing") as any;
  const t = landing?.lex?.methodology || {};
  const steps = Array.isArray(t.steps) ? t.steps : [];

  return (
    <section id="como-funciona" className="public-section bg-bg-subtle">
      <div className="public-container-wide">
        <SectionHeader
          eyebrow="Metodologia"
          title={t.title || "Como funciona nosso processo"}
          description="Um fluxo estratégico desenhado para maximizar suas chances de sucesso."
          className="mb-16"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group relative flex h-full flex-col overflow-hidden border-border/50 bg-card p-8 transition-all hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5">
                <div className="absolute -right-4 -top-4 text-8xl font-black text-primary/5 transition-colors group-hover:text-primary/10">
                  {index + 1}
                </div>
                <Badge variant="default" className="mb-8 w-fit bg-primary/10 text-primary">
                  Passo {String(index + 1).padStart(2, "0")}
                </Badge>
                <h3 className="font-display text-xl font-bold tracking-[-0.03em] text-text">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-text-muted">
                  {step.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
