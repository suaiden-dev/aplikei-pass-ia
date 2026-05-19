import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useT } from "@app/app/i18n";

export function LandingFinalCTA() {
  const t = useT("landing");

  if (!t.finalCta) return null;

  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-primary-container rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden"
        >
          {/* Subtle AI decorative element */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[300px] absolute -top-20 -left-20">
              auto_awesome
            </span>
          </div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="font-h1 text-h1">{t.finalCta.title}</h2>
            <p className="font-body-lg text-on-primary-container max-w-2xl mx-auto">
              {t.finalCta.description}
            </p>
            <div className="pt-4">
              <Link 
                to="/contato"
                className="inline-block px-12 py-6 bg-white text-primary-container rounded-xl font-label-md text-lg hover:bg-surface-container transition-all shadow-xl active:scale-95"
              >
                {t.finalCta.button}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export const FinalCtaSection = LandingFinalCTA;
