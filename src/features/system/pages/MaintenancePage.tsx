import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useT } from "@app/app/i18n";
import { useTheme } from "@shared/hooks/useTheme";
import { AppLogo } from "@shared/components/atoms/AppLogo";
import { cn } from "@shared/utils/cn";

const languageFlags = {
  pt: "🇧🇷",
  en: "🇺🇸",
  es: "🇪🇸",
} as const;

export default function MaintenancePage() {
  const { lang, setLang } = useLocale();
  const { theme } = useTheme();
  const t = useT("maintenance") as {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    status: string;
    footer: string;
    features: Array<{ title: string; desc: string }>;
    languages: Record<"pt" | "en" | "es", string>;
  };

  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden font-sans transition-colors duration-300",
        isDark
          ? "bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_28%),var(--bg)] text-text"
          : "bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.10),_transparent_28%),var(--bg)] text-text",
      )}
    >
      <div className="absolute right-6 top-6 z-20 flex gap-2 rounded-full border border-border/70 bg-card/80 p-1 shadow-lg backdrop-blur-xl">
        {(["pt", "en", "es"] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all",
              lang === code
                ? "bg-primary/10 text-primary"
                : "text-text-muted hover:bg-bg-subtle hover:text-text",
            )}
            title={t.languages[code]}
          >
            <span>{languageFlags[code]}</span>
            <span className="hidden sm:inline">{t.languages[code]}</span>
          </button>
        ))}
      </div>

      <div className="absolute left-[-10%] top-[-10%] h-[42%] w-[42%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-12%] right-[-8%] h-[42%] w-[42%] rounded-full bg-primary/8 blur-[120px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16 sm:px-8 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={lang}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="public-container-wide w-full text-center"
          >
            <div className="mx-auto mb-8 inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-4 py-2 shadow-lg backdrop-blur-xl">
              <AppLogo className="h-10 w-auto object-contain" />
              <span className="text-xs font-black uppercase tracking-[0.24em] text-text-muted">{t.badge}</span>
            </div>

            <h1 className="font-display text-4xl font-black tracking-[-0.05em] text-text md:text-6xl">
              {t.title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold uppercase tracking-[0.22em] text-primary md:text-base">
              {t.subtitle}
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-muted md:text-lg">
              {t.description}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 shadow-md backdrop-blur-xl">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">
                  {t.status}
                </span>
              </div>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3 lg:gap-6">
              {t.features.map((item, index) => (
                <motion.div
                  key={`${lang}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.08 }}
                  className="rounded-3xl border border-border bg-card/90 p-6 text-left shadow-xl backdrop-blur-xl"
                >
                  <h3 className="text-lg font-black tracking-tight text-text">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/70">
        {t.footer}
      </div>
    </div>
  );
}
