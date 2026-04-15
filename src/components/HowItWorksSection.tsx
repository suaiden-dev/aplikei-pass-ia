import { motion } from "framer-motion";
import { useT } from "../i18n/LanguageContext";


export const HowItWorksSection = () => {
  const t = useT("howItWorks");
  const steps = t.steps;

  return (
    <section className="py-24 px-8 lg:px-16 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-20 text-balance">
          <p className="text-primary font-bold tracking-widest uppercase text-xs mb-8">
            {t.subtitle}
          </p>
          <h2 className="text-4xl lg:text-5xl font-black text-primary">
            {t.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {steps.map((step: { title: string, desc: string }, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center lg:items-start lg:text-left"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-white font-black text-lg mb-8 shadow-lg shadow-primary/20">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="text-xl font-black mb-4 text-slate-800 tracking-tight leading-tight">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
