import { motion } from "framer-motion";
import { useT } from "../../i18n";

export function LandingProblem() {
  const t = useT("landing");

  if (!t.problem) return null;

  return (
    <section className="py-12 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-h2 text-h2 text-on-surface mb-2"
          >
            {t.problem.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-body-md text-body-md text-secondary max-w-2xl mx-auto"
          >
            {t.problem.subtitle}
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
          {/* Card 1 (Large) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow"
          >
            <span className="material-symbols-outlined text-error p-4 bg-error-container rounded-xl mb-4">
              {t.problem.items[0].icon}
            </span>
            <h3 className="font-h3 text-h3 mb-2">{t.problem.items[0].title}</h3>
            <p className="font-body-md text-secondary">{t.problem.items[0].description}</p>
          </motion.div>
          
          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow"
          >
            <span className="material-symbols-outlined text-error p-4 bg-error-container rounded-xl mb-4">
              {t.problem.items[1].icon}
            </span>
            <h3 className="font-h3 text-h3 mb-2">{t.problem.items[1].title}</h3>
            <p className="font-body-sm text-secondary">{t.problem.items[1].description}</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow"
          >
            <span className="material-symbols-outlined text-error p-4 bg-error-container rounded-xl mb-4">
              {t.problem.items[2].icon}
            </span>
            <h3 className="font-h3 text-h3 mb-2">{t.problem.items[2].title}</h3>
            <p className="font-body-sm text-secondary">{t.problem.items[2].description}</p>
          </motion.div>

          {/* Card 4 (Full width with custom side element) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="md:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-outline-variant flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-shadow"
          >
            <div className="md:w-1/2">
              <span className="material-symbols-outlined text-error p-4 bg-error-container rounded-xl mb-4">
                {t.problem.items[3].icon}
              </span>
              <h3 className="font-h3 text-h3 mb-2">{t.problem.items[3].title}</h3>
              <p className="font-body-md text-secondary">{t.problem.items[3].description}</p>
            </div>
            <div className="md:w-1/2 w-full h-32 bg-surface-container-highest rounded-xl flex items-center justify-center border-dashed border-2 border-outline-variant">
              <p className="text-label-md text-outline">{t.problem.simulationLabel}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export const ProblemSection = LandingProblem;
