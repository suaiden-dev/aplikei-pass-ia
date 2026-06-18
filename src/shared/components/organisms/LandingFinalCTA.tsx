import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useT } from "@app/app/i18n";
import { PublicButton } from "../atoms/PublicButton";

export function LandingFinalCTA() {
  const t = useT("landing");

  if (!t.finalCta) return null;

  return (
    <section className="public-section-tight">
      <div className="public-container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-primary-container rounded-3xl p-6 text-center text-white shadow-2xl relative overflow-hidden sm:p-10 lg:p-12"
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
              <PublicButton asChild tone="inverse" size="lg">
                <Link to="/contato">
                  {t.finalCta.button}
                </Link>
              </PublicButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export const FinalCtaSection = LandingFinalCTA;
