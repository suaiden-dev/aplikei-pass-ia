import { motion } from "framer-motion";
import { useT } from "@app/app/i18n";

export function LandingBenefits() {
  const t = useT("landing");

  if (!t.benefits) return null;

  return (
    <section className="py-24 bg-bg px-8 lg:px-16">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl font-bold tracking-[-0.03em] text-text lg:text-5xl mb-10"
            >
              {t.benefits.title}
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {t.benefits.items.map((item: any, index: number) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-primary text-4xl mb-4">
                    {item.icon}
                  </span>
                  <h4 className="font-display text-xl font-bold tracking-[-0.03em] text-text mb-2">{item.title}</h4>
                  <p className="font-body-sm text-text-muted">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <img 
              alt="Team Work" 
              className="rounded-2xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 w-full h-auto" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-p16DTNlZOJn7AyGaifsPTt_KNgM_cO8yXsJUy_dOazrPf1dyrmFnVcJ0rPWjszRtxCt-I6BCXaz49G1pDAf0wyBeKMJ3Ym8VAbjdKHS-9EveHcyJQ4H5jsc6DGgzI_JLvO24LipwP6tMP-U-a2EVPygvlNxDXTujq1NqgwdMm-GBePlhNJ93zqXHImYLBlGl4mNOv1_4vZnxtrhc4r0jc4DWfcraY_D8oB2L0cHpo9HqFlCU6wvBbgY9mRx3LBXleKqBnq418Kg"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-6 -right-6 bg-primary p-8 rounded-2xl shadow-xl max-w-xs hidden sm:block text-white"
            >
              <p className="font-display text-4xl font-black tracking-[-0.03em] text-white">{t.benefits.stats.number}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/80 mt-1">
                {t.benefits.stats.label}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export const BenefitsSection = LandingBenefits;
