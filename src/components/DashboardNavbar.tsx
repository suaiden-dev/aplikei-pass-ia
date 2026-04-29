import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useLocale, useT, type Language } from "../i18n";
import { useTheme } from "../contexts/useTheme";
import { NotificationBell } from "./notifications/NotificationBell";
import { RiSunLine, RiMoonLine } from "react-icons/ri";
import { useLocation } from "react-router-dom";
import { cn } from "../utils/cn";

const FLAG: Record<Language, string> = { pt: "🇧🇷", en: "🇺🇸", es: "🇪🇸" };

export function DashboardNavbar() {
  const { user } = useAuth();
  const { lang, setLang } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const t = useT("dashboard");
  const { pathname } = useLocation();

  const getPageTitle = () => {
    if (pathname === "/dashboard") return t.sidebar.dashboard;
    if (pathname.startsWith("/dashboard/processes")) return t.sidebar.cases;
    if (pathname.startsWith("/dashboard/support")) return t.sidebar.support;
    if (pathname === "/minha-conta") return t.sidebar.myAccount;
    return "Dashboard";
  };

  return (
    <header className="h-20 border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-30 px-8 hidden xl:flex items-center justify-between">
      <div>
        <h1 className="text-xl font-black text-text tracking-tight uppercase">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Language selector — flags */}
        <div className="flex items-center gap-1 border border-border rounded-full px-2 py-1 bg-bg-subtle">
          {(["pt", "en", "es"] as Language[]).map((l, i) => (
            <React.Fragment key={l}>
              {i > 0 && <span className="text-border text-[10px]">|</span>}
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
          className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-text-muted hover:text-text hover:border-primary/50 transition-colors bg-bg-subtle"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
        </button>

        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl hover:bg-bg-subtle transition-colors">
            <NotificationBell role="client" align="right" />
          </div>
          
          <div className="h-8 w-[1px] bg-border mx-2" />
          
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-text leading-none mb-1">
                {user?.fullName}
              </p>
              <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest leading-none">
                {user?.email}
              </p>
            </div>
            <img
              src={user?.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName ?? "User")}&background=1a56db&color=fff`}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-border"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
