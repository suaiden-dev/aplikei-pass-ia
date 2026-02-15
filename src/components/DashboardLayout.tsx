import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Upload, FileText, HelpCircle, LogOut, CheckSquare } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "@/i18n/LanguageContext";

export default function DashboardLayout() {
  const location = useLocation();
  const { lang, t } = useLanguage();
  const s = t.sidebar;

  const sidebarLinks = [
    { to: "/dashboard", label: s.dashboard[lang], icon: LayoutDashboard },
    { to: "/dashboard/onboarding", label: s.onboarding[lang], icon: CheckSquare },
    { to: "/dashboard/chat", label: s.chatAI[lang], icon: MessageSquare },
    { to: "/dashboard/uploads", label: s.documents[lang], icon: Upload },
    { to: "/dashboard/pacote", label: s.finalPackage[lang], icon: FileText },
    { to: "/dashboard/ajuda", label: s.help[lang], icon: HelpCircle },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link to="/" className="font-display text-lg font-bold text-primary">Aplikei</Link>
          <LanguageToggle />
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {sidebarLinks.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link key={l.to} to={l.to} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <LogOut className="h-4 w-4" />
            {s.logout[lang]}
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
          <Link to="/" className="font-display text-lg font-bold text-primary">Aplikei</Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <div className="flex gap-2">
              {sidebarLinks.slice(0, 4).map((l) => (
                <Link key={l.to} to={l.to} className={`rounded-lg p-2 ${location.pathname === l.to ? "bg-accent/10 text-accent" : "text-muted-foreground"}`}>
                  <l.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
