import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useT } from "@app/app/i18n";
import { cn } from "@shared/utils/cn";
import { ChevronLeft, ShieldCheck, FileText, ReceiptText } from "lucide-react";
import { useForceLightTheme } from "@shared/hooks/useForceLightTheme";
import { PublicButton } from "@shared/components/atoms/PublicButton";
import { PublicNavbar } from "@shared/components/organisms/PublicNavbar";
import { PublicFooter } from "@shared/components/organisms/PublicFooter";
import { DemoBookingProvider } from "@shared/components/organisms/DemoBookingModal";

interface LegalLayoutProps {
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ children }) => {
  const t = useT("legal");
  const location = useLocation();
  useForceLightTheme();

  const searchParams = new URLSearchParams(location.search);
  const role = searchParams.get("role") ?? "customer";
  const returnTo = searchParams.get("returnTo");
  const safeReturnTo =
    role === "customer" && returnTo && returnTo.startsWith("/") ? returnTo : "/";
  const safeSearch = new URLSearchParams();
  safeSearch.set("role", role);
  if (returnTo && returnTo.startsWith("/")) {
    safeSearch.set("returnTo", returnTo);
  }

  const menuItems = [
    {
      path: `/legal/terms?${safeSearch.toString()}`,
      label: t.layout.menu.terms,
      icon: FileText,
    },
    {
      path: `/legal/privacy?${safeSearch.toString()}`,
      label: t.layout.menu.privacy,
      icon: ShieldCheck,
    },
    {
      path: `/legal/refund?${safeSearch.toString()}`,
      label: t.layout.menu.refund,
      icon: ReceiptText,
    },
  ];

  return (
    <DemoBookingProvider>
      <div className="min-h-screen bg-white text-slate-900">
        <PublicNavbar />

        <div className="public-page bg-white pt-10 pb-16">
          <div className="public-container-wide">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
              <main className="min-w-0 flex-1">
                <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-6 py-4 sm:px-8">
                    <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-400">
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{t.layout.officialDocument}</span>
                    </div>
                    <PublicButton asChild tone="outline" size="sm">
                      <Link to={safeReturnTo}>
                        <ChevronLeft className="h-4 w-4" />
                        {t.layout.back}
                      </Link>
                    </PublicButton>
                  </div>

                  <div className="h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/60" />
                  <div className="px-6 py-8 sm:px-8 lg:px-12 lg:py-10">
                    {children}
                  </div>
                </div>
              </main>

              <aside className="lg:w-[240px] lg:shrink-0">
                <div className="sticky top-24 rounded-[22px] border border-slate-100 bg-slate-50/70 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                  <p className="px-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    {t.layout.documents}
                  </p>
                  <nav className="mt-3 grid gap-2">
                    {menuItems.map((item) => {
                      const itemPath = item.path.split("?")[0];
                      const isActive = location.pathname === itemPath;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={cn(
                            "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all",
                            isActive
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:bg-white hover:text-slate-900",
                          )}
                        >
                          <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-slate-400 group-hover:text-primary")} />
                          <span className="min-w-0 flex-1">{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <PublicFooter />
      </div>
    </DemoBookingProvider>
  );
};
