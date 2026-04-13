import React from "react";
import { NavLink, Link } from "react-router-dom";

import { cn } from "../utils/cn";
import { useAuth } from "../hooks/useAuth";
import { useLocale, useT } from "../i18n/LanguageContext";


export const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const { lang, setLang } = useLocale();
  const t = useT("nav");

  const navLinks = [
    { to: "/como-funciona", label: t.howItWorks },
    { to: "/servicos/visto-b1-b2", label: "B1/B2" },
    { to: "/servicos/visto-f1", label: "F1" },
    { to: "/servicos/troca-status", label: t.overview },
    { to: "/servicos/extensao-status", label: t.processes },
  ];

  return (
    <nav className="bg-highlight px-8 lg:px-16 py-5 flex items-center justify-between sticky top-0 z-50 border-b border-white/5">
      <div className="flex items-center gap-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm font-sans">A</span>
          </div>
          <span className="text-white font-black text-base tracking-widest uppercase font-sans">
            Aplikei
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-7">
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

      <div className="flex items-center gap-5">
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
    </nav>
  );
};
