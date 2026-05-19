import { motion } from "framer-motion";
import { useT } from "@app/app/i18n";

export function LandingSolution() {
  const t = useT("landing");

  if (!t.solution) return null;

  return (
    <section className="py-12 overflow-hidden">
      <div className="max-w-3xl mx-auto px-6">
        <div className="space-y-8">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-h2 text-h2 text-on-surface text-center mb-10"
          >
            {t.solution.title}
          </motion.h2>
          <div className="space-y-4">
            {t.solution.items.map((item: any, index: number) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className={`flex gap-4 p-5 rounded-xl transition-colors group ${
                  item.badge ? 'bg-primary-container/5 border border-primary-container/10' : 'hover:bg-surface-container-low border border-transparent'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                  item.badge ? 'bg-primary-container text-white' : 'bg-primary-fixed text-on-primary-fixed'
                }`}>
                  <span className="material-symbols-outlined" style={item.badge ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {item.icon}
                  </span>
                </div>
                <div>
                  <h4 className="font-label-md text-on-surface text-lg flex items-center">
                    {item.title}
                    {item.badge && (
                      <span className="ml-2 text-xs font-bold text-primary-container bg-primary-fixed px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </h4>
                  <p className="font-body-sm text-secondary mt-1">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const SolutionSection = LandingSolution;
