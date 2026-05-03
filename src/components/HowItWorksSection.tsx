import { motion } from "framer-motion";
import { useT } from "../i18n";

export const HowItWorksSection = () => {
  const t = useT("landing");
  const steps = t.howItWorks?.steps;

  if (!steps) return null;

  return (
    <section className="py-12 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-h2 text-h2 text-on-surface mb-2"
          >
            {t.howItWorks.title}
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Line connector for desktop */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-[2px] bg-surface-container-highest -z-10"></div>
          
          {steps.map((step: any, index: number) => {
            const isLast = index === steps.length - 1;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div 
                  className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mb-4 font-h3 transition-colors ${
                    isLast 
                      ? 'bg-primary-container border-primary-container text-white shadow-lg shadow-primary-container/20' 
                      : 'bg-primary-fixed border-primary-container text-primary-container group-hover:bg-primary-container group-hover:text-white shadow-sm'
                  }`}
                >
                  {step.number}
                </div>
                <h4 className={`font-label-md text-on-surface mb-1 ${isLast ? 'font-bold' : ''}`}>
                  {step.title}
                </h4>
                <p className="font-body-sm text-secondary">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
