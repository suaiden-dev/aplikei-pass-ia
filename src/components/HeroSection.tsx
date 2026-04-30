import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { useT } from "../i18n";

interface HeroSectionProps {
  heroImage: string;
  avatars: string[];
}

export const HeroSection = ({ heroImage, avatars }: HeroSectionProps) => {
  const t = useT("landing");
  const tCommon = useT("common");

  return (
    <header className="relative overflow-hidden bg-bg py-20 lg:py-28 px-6 sm:px-8 lg:px-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-72 w-72 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-info/10 blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            {t.hero?.badge}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-display mb-8 max-w-3xl text-balance text-[3.35rem] sm:text-6xl lg:text-7xl font-black leading-[0.98] tracking-[-0.045em] text-text">
              {t.hero?.title}{" "}
              <span className="text-primary tracking-[-0.05em]">
                {t.hero?.titleHighlight}
              </span>
            </h1>
            <p className="mb-12 max-w-2xl text-lg sm:text-xl text-text-muted font-medium leading-relaxed">
              {t.hero?.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start w-full sm:w-auto">
              <Link
                to="/cadastro"
                className="px-10 py-5 bg-primary text-white font-bold text-lg rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] hover:bg-primary-hover transition-all flex items-center justify-center gap-2 text-center w-full sm:w-auto"
              >
                {t.hero?.getStarted} <FiArrowRight size={20} />
              </Link>
              <Link
                to="/como-funciona"
                className="px-10 py-5 bg-bg-subtle text-text font-bold text-lg rounded-2xl border border-border hover:bg-card transition-colors flex items-center justify-center text-center w-full sm:w-auto"
              >
                {t.hero?.ctaSecondary}
              </Link>
            </div>
          </motion.div>
          <div className="mt-16 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <div className="flex -space-x-3">
              {avatars.map((avatar, idx) => (
                <img
                  key={idx}
                  alt="User"
                  className="w-12 h-12 rounded-full bg-cover border-4 border-bg shadow-lg"
                  src={avatar}
                />
              ))}
            </div>
            <p className="text-sm font-bold text-text-muted tracking-wide">{t.hero?.approvedCount}</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[3.5rem] rotate-2 bg-primary/8"></div>
          <img
            alt={t.hero?.imageAlt}
            className="relative z-10 w-full aspect-[4/5] object-cover rounded-[3rem] shadow-3xl border border-border"
            src={heroImage}
          />
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute bottom-8 left-4 right-4 sm:right-auto sm:-left-8 z-20 bg-card p-6 rounded-2xl shadow-2xl flex items-center gap-5 border border-border"
          >
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
              <MdVerified className="text-green-600 text-3xl" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">
                {tCommon.successRate || "Success Rate"}
              </p>
              <p className="text-2xl font-black text-primary">98.2%</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
};
