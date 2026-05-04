import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { RiMenu3Line, RiCloseLine, RiSunLine, RiMoonLine } from "react-icons/ri";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { useLocale, useT, type Language } from "../../i18n";
import { useTheme } from "../../contexts/useTheme";
import { Button } from "../atoms/button";

const FLAG: Record<Language, string> = { pt: "🇧🇷", en: "🇺🇸", es: "🇪🇸" };

export function PublicNavbar() {
  const { lang, setLang } = useLocale();
  const t = useT("nav");
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpenPath, setMenuOpenPath] = useState<string | null>(null);
  const isMenuOpen = menuOpenPath === location.pathname;

  const closeMenu = () => setMenuOpenPath(null);
  const toggleMenu = () => setMenuOpenPath((cur) => (cur === location.pathname ? null : location.pathname));

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { to: "/como-funciona", label: t.howItWorks },
    { to: "/servicos", label: t.services },
    { to: "/servicos/visto-b1-b2", label: "B1/B2" },
    { to: "/servicos/visto-f1", label: "F-1" },
    { to: "/servicos/troca-status", label: "COS" },
    { to: "/servicos/extensao-status", label: "EOS" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-[100] flex items-center justify-between border-b border-border/70 bg-bg/90 px-6 py-4 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-xl xl:px-16">
        <div className="flex items-center gap-10">
          <Link to="/" className="relative z-[110] flex items-center gap-2.5">
            <img src="/logo.png" alt="Aplikei" className="h-12 w-auto object-contain" />
          </Link>
          <div className="hidden items-center gap-7 xl:flex">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "font-display relative pb-1 text-[0.98rem] font-semibold tracking-[-0.015em] transition-colors duration-200",
                    "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-transform after:duration-200 after:origin-left",
                    isActive ? "text-text after:scale-x-100" : "text-text-muted hover:text-text after:scale-x-0 hover:after:scale-x-100",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-4 xl:flex">
          <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card/80 px-2 py-1 backdrop-blur-sm">
            {(["pt", "en", "es"] as Language[]).map((l, i) => (
              <React.Fragment key={l}>
                {i > 0 && <span className="text-[10px] text-white/20">|</span>}
                <button
                  onClick={() => setLang(l)}
                  title={l.toUpperCase()}
                  className={cn("px-0.5 text-lg transition-opacity", lang === l ? "opacity-100" : "opacity-40 hover:opacity-70")}
                >
                  {FLAG[l]}
                </button>
              </React.Fragment>
            ))}
          </div>

              <button
                onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/80 text-text-muted transition-colors hover:border-primary/40 hover:text-text"
                aria-label="Toggle theme"
          >
            {theme === "dark" ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
          </button>

          <Button asChild className="shadow-md">
            <Link to="/cadastro">{t.getStarted}</Link>
          </Button>
        </div>

        <button
          className="z-[110] rounded-lg border border-primary/20 bg-card/80 p-2 text-primary transition-colors hover:bg-primary/10 xl:hidden"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <RiCloseLine size={28} /> : <RiMenu3Line size={28} />}
        </button>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] flex flex-col overflow-y-auto bg-bg px-6 pb-6 pt-24"
          >
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cn("font-display py-2 text-2xl font-black uppercase tracking-[0.04em] transition-colors", isActive ? "text-primary" : "text-text-muted hover:text-text")
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center gap-5">
              <div className="flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-4 py-2 backdrop-blur-sm">
                {(["pt", "en", "es"] as Language[]).map((l, i) => (
                  <React.Fragment key={l}>
                    {i > 0 && <span className="font-bold text-white/20">|</span>}
                    <button
                      onClick={() => setLang(l)}
                      className={cn("text-2xl transition-opacity", lang === l ? "opacity-100" : "opacity-40")}
                    >
                      {FLAG[l]}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              <button
                onClick={toggleTheme}
                  className="flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text"
              >
                {theme === "dark" ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>

              <Button asChild className="w-full">
                <Link to="/cadastro" onClick={closeMenu}>
                  {t.getStarted}
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link to="/login" onClick={closeMenu}>
                  {t.login}
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export const Navbar = PublicNavbar;
