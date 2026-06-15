import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useLocale } from "@app/app/i18n";
import { cn } from "@shared/utils/cn";
import { ChevronLeft, ChevronRight, ShieldCheck, FileText } from "lucide-react";

interface LegalLayoutProps {
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ children }) => {
  const { lang } = useLocale();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const role = searchParams.get("role") ?? "customer";
  const returnTo = searchParams.get("returnTo");
  const safeReturnTo = returnTo && returnTo.startsWith("/") ? returnTo : "/";

  const menuItems = [
    {
      path: `/legal/terms?role=${role}`,
      label: lang === "pt" ? "Termos de Uso" : lang === "es" ? "Términos de Uso" : "Terms of Use",
      icon: FileText,
    },
    {
      path: `/legal/privacy?role=${role}`,
      label: lang === "pt" ? "Política de Privacidade" : lang === "es" ? "Política de Privacidad" : "Privacy Policy",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20">
      <div className="container max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <div className="sticky top-32 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 px-4">
                {lang === "pt" ? "Documentos Legais" : lang === "es" ? "Documentos Legales" : "Legal Documents"}
              </h3>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const itemPath = item.path.split("?")[0];
                  const isActive = location.pathname === itemPath;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:shadow-md"
                      )}
                    >
                      <item.icon className={cn(
                        "w-5 h-5",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-primary"
                      )} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">
                  {lang === "pt" ? "Precisa de ajuda?" : lang === "es" ? "¿Necesitas ayuda?" : "Need help?"}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {lang === "pt" 
                    ? "Nossa equipe está à disposição para esclarecer dúvidas operacionais." 
                    : lang === "es"
                    ? "Nuestro equipo está disponible para aclarar dudas operacionales."
                    : "Our team is available to clarify operational questions."}
                </p>
                <Link 
                  to="/quem-somos" 
                  className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                >
                  {lang === "pt" ? "Saiba mais" : lang === "es" ? "Saber más" : "Learn more"} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:w-3/4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
              {/* Internal Header */}
              <div className="flex items-center justify-between gap-3 px-8 py-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 min-w-0">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">{lang === "pt" ? "Documento Oficial" : lang === "es" ? "Documento Oficial" : "Official Document"}</span>
                </div>
                <Link
                  to={safeReturnTo}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-primary/30 hover:text-primary dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {lang === "pt" ? "Voltar" : lang === "es" ? "Volver" : "Back"}
                </Link>
              </div>

              <div className="h-1 bg-gradient-to-r from-primary to-primary-600 opacity-50" />
              <div className="p-8 lg:p-12">
                {children}
              </div>
            </div>
            
            <div className="mt-8 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <p>© 2026 Aplikei Technologies. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <Link to="/servicos" className="hover:text-primary transition-colors">Serviços</Link>
                <Link to="/track-my-visa" className="hover:text-primary transition-colors">Login</Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
