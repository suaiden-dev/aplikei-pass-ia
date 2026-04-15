import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "../utils/cn";
import { useAuth } from "../hooks/useAuth";
import { useLocale, useT } from "../i18n/LanguageContext";

export const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const { lang, setLang } = useLocale();
  const t = useT("nav");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { to: "/como-funciona", label: t.howItWorks },
    { to: "/servicos/visto-b1-b2", label: "B1/B2" },
    { to: "/servicos/visto-f1", label: "F1" },
    { to: "/servicos/troca-status", label: lang === "pt" ? "Troca de Status (COS)" : lang === "es" ? "Cambio de Estatus (COS)" : "Change of Status (COS)" },
    { to: "/servicos/extensao-status", label: lang === "pt" ? "Extensão de Status (EOS)" : lang === "es" ? "Extensión de Estatus (EOS)" : "Extension of Status (EOS)" },
  ];

  return (
    <>
      <nav className="bg-highlight px-6 xl:px-16 py-4 flex items-center justify-between sticky top-0 z-[100] border-b border-white/5 relative">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5 z-[110] relative">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm font-sans">A</span>
            </div>
            <span className="text-white font-black text-base tracking-widest uppercase font-sans">
              Aplikei
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-7">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "relative text-sm font-medium font-sans pb-1 transition-colors duration-200",
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

        <div className="hidden xl:flex items-center gap-5">
          <div className="flex items-center gap-1.5 border border-slate-600 rounded-full px-2 py-1">
            {(["pt", "en", "es"] as const).map((l, i) => (
              <React.Fragment key={l}>
                {i > 0 && <span className="text-slate-600 text-[10px]">|</span>}
                <button
                  onClick={() => setLang(l)}
                  className={cn(
                    "text-[10px] font-bold font-sans transition-colors uppercase px-1",
                    lang === l ? "text-primary" : "text-slate-400 hover:text-white"
                  )}
                >
                  {l}
                </button>
              </React.Fragment>
            ))}
          </div>

          {isAuthenticated ? (
            <Link
              to={user?.role === "admin" ? "/admin" : "/dashboard"}
              className="px-5 py-2.5 bg-primary text-white text-sm font-bold font-sans rounded-xl hover:bg-primary-hover transition-all shadow-md shadow-primary/20"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-300 hover:text-white text-sm font-medium font-sans transition-colors"
              >
                {t.login}
              </Link>
              <Link
                to="/cadastro"
                className="px-5 py-2.5 bg-primary text-white text-sm font-bold font-sans rounded-xl hover:bg-primary-hover transition-all shadow-md shadow-primary/20"
              >
                {t.getStarted}
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="xl:hidden text-white p-2 z-[110] rounded-lg hover:bg-white/10 transition-colors relative"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <RiCloseLine size={28} /> : <RiMenu3Line size={28} />}
        </button>
      </nav>

      {/* Full-screen Mobile Menu */}
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
                  className={({ isActive }) =>
                    cn(
                      "text-2xl font-black font-sans py-2 uppercase tracking-wide transition-colors",
                      isActive ? "text-primary" : "text-slate-300 hover:text-white"
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-6">
              <div className="flex items-center gap-3 border border-slate-600 rounded-full px-4 py-2">
                {(["pt", "en", "es"] as const).map((l, i) => (
                  <React.Fragment key={l}>
                    {i > 0 && <span className="text-slate-600 font-bold">|</span>}
                    <button
                      onClick={() => setLang(l)}
                      className={cn(
                        "text-sm font-bold font-sans transition-colors uppercase px-2",
                        lang === l ? "text-primary bg-primary/10 rounded-md py-1" : "text-slate-400 hover:text-white py-1"
                      )}
                    >
                      {l}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {isAuthenticated ? (
                <Link
                  to={user?.role === "admin" ? "/admin" : "/dashboard"}
                  className="w-full text-center px-6 py-4 bg-primary text-white text-lg font-black font-sans rounded-2xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex flex-col w-full gap-3 mt-4">
                  <Link
                    to="/cadastro"
                    className="w-full text-center px-6 py-4 bg-primary text-white text-lg font-black font-sans rounded-2xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                  >
                    {t.getStarted}
                  </Link>
                  <Link
                    to="/login"
                    className="w-full text-center px-6 py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-lg font-black font-sans rounded-2xl transition-all"
                  >
                    {t.login}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
