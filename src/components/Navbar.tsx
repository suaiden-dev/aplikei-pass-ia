import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { RiMenu3Line, RiCloseLine, RiSunLine, RiMoonLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";
import { useLocale, useT } from "../i18n";
import { useTheme } from "../contexts/useTheme";
import type { Language } from "../i18n";

const FLAG: Record<Language, string> = { pt: "🇧🇷", en: "🇺🇸", es: "🇪🇸" };

export const Navbar = () => {
  const { lang, setLang } = useLocale();
  const t = useT("nav");
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpenPath, setMenuOpenPath] = useState<string | null>(null);
  const isMenuOpen = menuOpenPath === location.pathname;

  const closeMenu = () => setMenuOpenPath(null);
  const toggleMenu = () =>
    setMenuOpenPath((cur) => (cur === location.pathname ? null : location.pathname));

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
      <nav className="bg-highlight/95 backdrop-blur px-6 xl:px-16 py-4 flex items-center justify-between sticky top-0 z-[100] border-b border-white/8 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5 z-[110] relative">
            <img
              src="/logo.png"
              alt="Aplikei"
              className="h-12 w-auto object-contain drop-shadow-[0_8px_24px_rgba(15,23,42,0.22)]"
            />
          </Link>
          <div className="hidden xl:flex items-center gap-7">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "font-display relative pb-1 text-[0.98rem] font-semibold tracking-[-0.015em] transition-colors duration-200",
                    "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-transform after:duration-200 after:origin-left",
                    isActive
                      ? "text-white after:scale-x-100"
                      : "text-slate-400 hover:text-white after:scale-x-0 hover:after:scale-x-100",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-4">
          {/* Language selector — flags */}
          <div className="flex items-center gap-1 border border-slate-600 rounded-full px-2 py-1">
            {(["pt", "en", "es"] as Language[]).map((l, i) => (
              <React.Fragment key={l}>
                {i > 0 && <span className="text-slate-600 text-[10px]">|</span>}
                <button
                  onClick={() => setLang(l)}
                  title={l.toUpperCase()}
                  className={cn(
                    "text-lg px-0.5 transition-opacity",
                    lang === l ? "opacity-100" : "opacity-40 hover:opacity-70",
                  )}
                >
                  {FLAG[l]}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:text-white hover:border-slate-400 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
          </button>

          <Link
            to="/cadastro"
            className="font-display px-5 py-2.5 bg-primary text-white text-sm font-bold tracking-[-0.015em] rounded-xl hover:bg-primary-hover transition-all shadow-md"
          >
            {t.getStarted}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="xl:hidden z-[110] rounded-lg border border-primary/15 p-2 text-primary hover:bg-primary/10 transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <RiCloseLine size={28} /> : <RiMenu3Line size={28} />}
        </button>
      </nav>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-highlight z-[90] flex flex-col pt-24 px-6 pb-6 overflow-y-auto"
          >
            <div className="flex flex-col gap-6 flex-1 justify-center items-center text-center">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cn(
                      "font-display text-2xl font-black py-2 uppercase tracking-[0.04em] transition-colors",
                      isActive ? "text-primary" : "text-slate-300 hover:text-white",
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center gap-5">
              {/* Flags mobile */}
              <div className="flex items-center gap-3 border border-slate-600 rounded-full px-4 py-2">
                {(["pt", "en", "es"] as Language[]).map((l, i) => (
                  <React.Fragment key={l}>
                    {i > 0 && <span className="text-slate-600 font-bold">|</span>}
                    <button
                      onClick={() => setLang(l)}
                      className={cn("text-2xl transition-opacity", lang === l ? "opacity-100" : "opacity-40")}
                    >
                      {FLAG[l]}
                    </button>
                  </React.Fragment>
                ))}
              </div>
              {/* Theme toggle mobile */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 border border-slate-600 rounded-full text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                {theme === "dark" ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
              <Link
                to="/cadastro"
                onClick={closeMenu}
                className="w-full text-center px-6 py-4 bg-primary text-white text-lg font-black rounded-2xl hover:bg-primary-hover transition-all shadow-lg"
              >
                {t.getStarted}
              </Link>
              <Link
                to="/login"
                onClick={closeMenu}
                className="w-full text-center px-6 py-4 bg-white/5 border border-white/10 text-white text-lg font-black rounded-2xl hover:bg-white/10 transition-all"
              >
                {t.login}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
