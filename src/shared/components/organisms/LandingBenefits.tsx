import { motion } from "framer-motion";
import { useT } from "@app/app/i18n";

export function LandingBenefits() {
  const t = useT("landing");

  if (!t.benefits) return null;

  return (
    <section className="py-12 bg-on-background text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-h2 text-h2 mb-6"
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
                  className="p-6 bg-white/5 rounded-2xl border border-white/10"
                >
                  <span className="material-symbols-outlined text-primary-fixed-dim text-4xl mb-4">
                    {item.icon}
                  </span>
                  <h4 className="font-label-md text-xl mb-2">{item.title}</h4>
                  <p className="font-body-sm text-gray-400">{item.description}</p>
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
              className="rounded-2xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-p16DTNlZOJn7AyGaifsPTt_KNgM_cO8yXsJUy_dOazrPf1dyrmFnVcJ0rPWjszRtxCt-I6BCXaz49G1pDAf0wyBeKMJ3Ym8VAbjdKHS-9EveHcyJQ4H5jsc6DGgzI_JLvO24LipwP6tMP-U-a2EVPygvlNxDXTujq1NqgwdMm-GBePlhNJ93zqXHImYLBlGl4mNOv1_4vZnxtrhc4r0jc4DWfcraY_D8oB2L0cHpo9HqFlCU6wvBbgY9mRx3LBXleKqBnq418Kg"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-6 -right-6 bg-primary-container p-8 rounded-2xl shadow-xl max-w-xs hidden sm:block"
            >
              <p className="font-h2 text-white">{t.benefits.stats.number}</p>
              <p className="text-label-sm text-on-primary-container uppercase tracking-widest">
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
