import { motion } from "framer-motion";
import { Card } from "../atoms/card";
import { SectionHeader } from "../molecules/SectionHeader";
import { useT } from "@app/app/i18n";
import { FiCheck, FiArrowUpRight } from "react-icons/fi";

export function LexServices() {
  const landing = useT("landing") as any;
  const t = landing?.lex?.services || {};
  const items = Array.isArray(t.items) ? t.items : [];

  return (
    <section id="servicos" className="public-section bg-bg">
      <div className="public-container-wide">
        <SectionHeader
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
          className="mb-16"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {items.map((service: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={index === 0 ? "lg:col-span-2" : ""}
            >
              <Card className="group relative overflow-hidden border-border/50 bg-card p-8 transition-all hover:border-primary/30 lg:p-12">
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <h3 className="font-display text-3xl font-bold tracking-[-0.03em] text-text">
                      {service.title}
                    </h3>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border transition-colors group-hover:bg-primary group-hover:text-white">
                      <FiArrowUpRight size={20} />
                    </div>
                  </div>
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-muted">
                    {service.description}
                  </p>

                  {Array.isArray(service.features) && (
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {service.features.map((feature: string) => (
                        <div key={feature} className="flex items-center gap-3 text-sm font-medium text-text">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <FiCheck size={12} />
                          </div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-primary/5 blur-3xl transition-colors group-hover:bg-primary/10" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
