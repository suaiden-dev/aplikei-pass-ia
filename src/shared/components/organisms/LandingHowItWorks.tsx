import { motion } from "framer-motion";
import { Card } from "../atoms/card";
import { Badge } from "../atoms/badge";
import { SectionHeader } from "../molecules/SectionHeader";
import { useT } from "@app/app/i18n";

export function LandingHowItWorks() {
  const t = useT("howItWorks");
  const steps = t.steps;

  return (
    <section className="bg-bg px-8 py-24 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-[1280px]">
        <SectionHeader
          eyebrow={t.subtitle}
          title={t.title}
          description="Um fluxo direto, com etapas claras e sem ruído operacional."
          className="mb-16"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
          {steps.map((step: { title: string; desc: string }, index: number) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="flex h-full flex-col p-6 transition-transform duration-200 hover:-translate-y-1 hover:border-primary/25">
                <Badge variant="default" className="mb-6 w-fit bg-primary/15 text-primary">
                  {String(index + 1).padStart(2, "0")}
                </Badge>
                <h3 className="font-display text-xl font-bold tracking-[-0.03em] text-text">{step.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-text-muted">{step.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const HowItWorksSection = LandingHowItWorks;
