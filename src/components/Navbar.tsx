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
  const isDark = theme === "dark";

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
    { to: "/servicos/visto-b1-b2", label: t.serviceB1B2 },
    { to: "/servicos/visto-f1", label: t.serviceF1 },
    { to: "/servicos/troca-status", label: t.serviceCOS },
    { to: "/servicos/extensao-status", label: t.serviceEOS },
  ];

  return (
    <>
      <nav
        className={cn(
          "backdrop-blur px-6 xl:px-16 py-4 flex items-center justify-between sticky top-0 z-[100] border-b transition-colors duration-300",
          isDark
            ? "bg-[#0d1117]/95 border-white/8 shadow-[0_1px_0_rgba(255,255,255,0.04)]"
            : "bg-white/95 border-outline-variant shadow-sm",
        )}
      >
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
                    "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary-container after:transition-transform after:duration-200 after:origin-left",
                    isActive
                      ? isDark
                        ? "text-white after:scale-x-100"
                        : "text-primary-container after:scale-x-100"
                      : isDark
                        ? "text-slate-400 hover:text-white after:scale-x-0 hover:after:scale-x-100"
                        : "text-on-surface-variant hover:text-on-surface after:scale-x-0 hover:after:scale-x-100",
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
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 border",
              isDark ? "border-slate-600" : "border-outline-variant",
            )}
          >
            {(["pt", "en", "es"] as Language[]).map((l, i) => (
              <React.Fragment key={l}>
                {i > 0 && (
                  <span
                    className={cn(
                      "text-[10px]",
                      isDark ? "text-slate-600" : "text-outline-variant",
                    )}
                  >
                    |
                  </span>
                )}
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
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-full border transition-colors",
              isDark
                ? "border-slate-700 text-slate-400 hover:text-white hover:border-slate-400"
                : "border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline",
            )}
            aria-label="Toggle theme"
          >
            {isDark ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
          </button>

          <Link
            to="/cadastro"
            className="font-display px-5 py-2.5 bg-primary-container text-white text-sm font-bold tracking-[-0.015em] rounded-xl hover:opacity-90 transition-all shadow-md"
          >
            {t.getStarted}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className={cn(
            "xl:hidden z-[110] rounded-lg border p-2 transition-colors",
            isDark
              ? "border-primary/15 text-primary hover:bg-primary/10"
              : "border-outline-variant text-on-surface-variant hover:bg-surface-container",
          )}
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
            className={cn(
              "fixed inset-0 z-[90] flex flex-col pt-24 px-6 pb-6 overflow-y-auto",
              isDark ? "bg-[#0d1117]" : "bg-white",
            )}
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
                      isActive
                        ? "text-primary-container"
                        : isDark
                          ? "text-slate-300 hover:text-white"
                          : "text-on-surface-variant hover:text-on-surface",
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center gap-5">
              {/* Flags mobile */}
              <div
                className={cn(
                  "flex items-center gap-3 rounded-full px-4 py-2 border",
                  isDark ? "border-slate-600" : "border-outline-variant",
                )}
              >
                {(["pt", "en", "es"] as Language[]).map((l, i) => (
                  <React.Fragment key={l}>
                    {i > 0 && (
                      <span
                        className={cn(
                          "font-bold",
                          isDark ? "text-slate-600" : "text-outline",
                        )}
                      >
                        |
                      </span>
                    )}
                    <button
                      onClick={() => setLang(l)}
                      className={cn(
                        "text-2xl transition-opacity",
                        lang === l ? "opacity-100" : "opacity-40",
                      )}
                    >
                      {FLAG[l]}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* Theme toggle mobile */}
              <button
                onClick={toggleTheme}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 border rounded-full transition-colors text-sm font-medium",
                  isDark
                    ? "border-slate-600 text-slate-300 hover:text-white"
                    : "border-outline-variant text-on-surface-variant hover:text-on-surface",
                )}
              >
                {isDark ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
                {isDark ? "Light mode" : "Dark mode"}
              </button>

              <Link
                to="/cadastro"
                onClick={closeMenu}
                className="w-full text-center px-6 py-4 bg-primary-container text-white text-lg font-black rounded-2xl hover:opacity-90 transition-all shadow-lg"
              >
                {t.getStarted}
              </Link>

              <Link
                to="/login"
                onClick={closeMenu}
                className={cn(
                  "w-full text-center px-6 py-4 border text-lg font-black rounded-2xl transition-all",
                  isDark
                    ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    : "bg-surface-container border-outline-variant text-on-surface hover:bg-surface-container-high",
                )}
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
