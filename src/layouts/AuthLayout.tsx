import { Navigate, Outlet } from "react-router-dom";
import { RiMoonLine, RiSunLine } from "react-icons/ri";
import { AuthBrand } from "../components/auth/AuthBrand";
import { useTheme } from "../contexts/useTheme";
import { useLocale, type Language } from "../i18n";
import { useAuth } from "../hooks/useAuth";
import { getDashboardPathForRole } from "../services/auth.service";
import { cn } from "../utils/cn";

const flags: Record<Language, string> = {
  pt: "🇧🇷",
  en: "🇺🇸",
  es: "🇪🇸",
};

export function AuthLayout() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLocale();
  const { user, isAuthenticated } = useAuth();

  // Já autenticado → redireciona para o painel correto
  if (isAuthenticated && user) {
    const target = getDashboardPathForRole(user.role);
    return <Navigate to={target} replace />;
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg text-text">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-80 w-80 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-info/10 blur-3xl" />
      </div>

      <header className="relative z-10 px-4 pb-2 pt-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-border bg-card/85 px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <AuthBrand className="h-11 sm:h-12" />

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 rounded-full border border-border bg-bg-subtle px-2 py-1">
              {(["pt", "en", "es"] as Language[]).map((language, index) => (
                <div key={language} className="flex items-center">
                  {index > 0 && <span className="px-1 text-[10px] text-text-muted">|</span>}
                  <button
                    type="button"
                    onClick={() => setLang(language)}
                    className={cn(
                      "rounded-full px-1.5 text-lg transition-opacity",
                      lang === language ? "opacity-100" : "opacity-45 hover:opacity-75",
                    )}
                    aria-label={`Alterar idioma para ${language.toUpperCase()}`}
                  >
                    {flags[language]}
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-subtle text-text-muted transition-colors hover:text-text"
              aria-label="Alternar tema"
            >
              {theme === "dark" ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}
