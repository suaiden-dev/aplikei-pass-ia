import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { Badge } from "../atoms/badge";
import { Button } from "../atoms/button";
import { Card } from "../atoms/card";
import { useT } from "../../i18n";

interface LandingHeroProps {
  heroImage: string;
  avatars: string[];
}

export function LandingHero({ heroImage, avatars }: LandingHeroProps) {
  const t = useT("landing");
  const tCommon = useT("common");

  return (
    <header className="relative overflow-hidden bg-bg px-8 py-24 lg:px-16 lg:py-32">
      <div className="absolute inset-0 opacity-80">
        <div className="absolute left-0 top-0 h-80 w-80 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] translate-x-1/3 translate-y-1/3 rounded-full bg-surface-tint/12 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-[1280px] items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <div className="z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
          <Badge variant="default" className="mb-8 border-primary/20 bg-primary/15 text-primary">
            <span className="mr-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-primary" />
            {t.hero?.badge}
          </Badge>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-[-0.05em] text-text lg:text-7xl">
              {t.hero?.title} <span className="text-primary">{t.hero?.titleHighlight}</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-text-muted lg:text-xl">
              {t.hero?.subtitle}
            </p>

            <div className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/cadastro">
                  {t.hero?.getStarted}
                  <FiArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link to="/servicos">{t.hero?.ctaSecondary}</Link>
              </Button>
            </div>
          </motion.div>

          <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
            <div className="flex -space-x-3">
              {avatars.map((avatar, idx) => (
                <img
                  key={`${avatar}-${idx}`}
                  alt="User"
                  className="h-12 w-12 rounded-full border-4 border-highlight object-cover"
                  src={avatar}
                />
              ))}
            </div>
            <p className="text-sm font-semibold tracking-wide text-text-muted">{t.hero?.approvedCount}</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[3rem] bg-primary/10 blur-2xl" />
          <img
            alt={t.hero?.imageAlt}
            className="relative z-10 aspect-[4/5] w-full rounded-[2.5rem] object-cover shadow-[0_24px_70px_rgba(0,0,0,0.32)]"
            src={heroImage}
          />

          <motion.div
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.45 }}
            className="absolute bottom-8 left-0 z-20 -translate-x-6"
          >
            <Card className="flex items-center gap-4 rounded-[1.5rem] border-border/70 bg-card p-5 shadow-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
                <MdVerified className="text-3xl" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                  {tCommon.successRate || "Success Rate"}
                </p>
                <p className="text-2xl font-black tracking-[-0.03em] text-primary">98.2%</p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}

export const HeroSection = LandingHero;
