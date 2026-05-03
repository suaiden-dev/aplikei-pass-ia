import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useT } from "../i18n";

interface HeroSectionProps {
  heroImage: string;
}

export const HeroSection = ({ heroImage }: HeroSectionProps) => {
  const t = useT("landing");

  return (
    <section className="pt-12 pb-12 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-sm">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              {t.hero?.badge}
            </div>
            <h1 className="font-h1 text-h1 text-on-surface leading-tight">
              {t.hero?.title}
            </h1>
            <p className="font-body-lg text-body-lg text-secondary max-w-xl">
              {t.hero?.subtitle}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                to="/cadastro"
                className="px-8 py-6 bg-primary-container text-white rounded-xl font-label-md shadow-lg shadow-primary-container/20 hover:translate-y-[-2px] transition-all flex items-center justify-center text-center"
              >
                {t.hero?.cta}
              </Link>
              <Link 
                to="/contato"
                className="px-8 py-6 border border-outline-variant text-on-surface rounded-xl font-label-md hover:bg-surface-container transition-all flex items-center justify-center text-center"
              >
                {t.hero?.ctaSecondary}
              </Link>
            </div>
            <div className="pt-8">
              <p className="text-label-sm text-outline uppercase tracking-widest mb-4">
                {t.hero?.trustedBy}
              </p>
              <div className="flex items-center gap-8 opacity-60 grayscale">
                <div className="flex items-center gap-2 font-bold text-h3 text-on-surface">
                  <span className="material-symbols-outlined">gavel</span> LEGALCO
                </div>
                <div className="flex items-center gap-2 font-bold text-h3 text-on-surface">
                  <span className="material-symbols-outlined">public</span> GLOBALVISA
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-outline-variant bg-white">
              <img 
                alt="Dashboard Mockup" 
                className="w-full h-auto" 
                src={heroImage}
              />
            </div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary-container/10 blur-3xl rounded-full -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-tertiary-container/10 blur-3xl rounded-full -z-10"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
