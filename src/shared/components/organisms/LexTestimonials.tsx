import { motion } from "framer-motion";
import { Card } from "../atoms/card";
import { SectionHeader } from "../molecules/SectionHeader";
import { useT } from "@app/app/i18n";

export function LexTestimonials() {
  const landing = useT("landing");
  const t = landing?.lex?.testimonials || {};
  const items = t.items || [];

  return (
    <section className="public-section bg-bg-subtle">
      <div className="public-container-wide">
        <SectionHeader
          eyebrow="Depoimentos"
          title={t.title}
          description="A confiança de nossos clientes é o nosso maior patrimônio."
          className="mb-16"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {items.map((item: { quote: string; author: string; role: string }, index: number) => (
            <motion.div
              key={item.author}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="flex h-full flex-col p-8 lg:p-10">
                <div className="flex-1">
                  <p className="text-lg leading-relaxed text-text italic">
                    "{item.quote}"
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {item.author[0]}
                  </div>
                  <div>
                    <p className="font-bold text-text">{item.author}</p>
                    <p className="text-sm text-text-muted">{item.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
