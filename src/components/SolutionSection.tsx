import { motion } from "framer-motion";
import { useT } from "../i18n";

export const SolutionSection = () => {
  const t = useT("landing");

  if (!t.solution) return null;

  return (
    <section className="py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2 space-y-6">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="font-h2 text-h2 text-on-surface"
            >
              {t.solution.title}
            </motion.h2>
            <div className="space-y-4">
              {t.solution.items.map((item: any, index: number) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className={`flex gap-4 p-4 rounded-xl transition-colors group ${
                    item.badge ? 'bg-primary-container/5 border border-primary-container/10' : 'hover:bg-surface-container-low'
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
                    <p className="font-body-sm text-secondary">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 grid grid-cols-2 gap-4 w-full">
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 rounded-2xl shadow-xl"
              >
                <p className="text-label-sm text-outline mb-2">Document Status</p>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container w-[85%]"></div>
                </div>
                <p className="text-label-md text-on-surface mt-2">Validating EB-2 NIW...</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 rounded-2xl shadow-xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <p className="text-label-sm font-bold text-green-700">AI SUMMARY READY</p>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-surface-container-highest rounded"></div>
                  <div className="h-3 w-[80%] bg-surface-container-highest rounded"></div>
                  <div className="h-3 w-[60%] bg-surface-container-highest rounded"></div>
                </div>
              </motion.div>
            </div>
            
            <div className="pt-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 rounded-2xl shadow-xl space-y-4"
              >
                <span className="material-symbols-outlined text-primary-container">description</span>
                <p className="font-label-md text-on-surface">I-140 Form auto-fill complete</p>
                <button className="w-full py-2 bg-primary-container/10 text-primary-container rounded-lg font-label-sm">Review Changes</button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
