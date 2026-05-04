import { useState } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ShieldCheck, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import type { UserRole as UserAccountRole } from "../features/auth/types";
import { getDashboardPathForRole } from "../shared/auth/roles";
import { cn } from "../utils/cn";
import { DashboardNavbar } from "../components/organisms/DashboardNavbar";

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface RoleDashboardLayoutProps {
  allowedRoles: UserAccountRole[];
  consoleTitle: string;
  consoleSubtitle: string;
  roleLabel: string;
  navItems: DashboardNavItem[];
  spotlightTitle: string;
  spotlightDescription: string;
  unauthorizedFallback: string;
}

export function RoleDashboardLayout({
  allowedRoles,
  consoleSubtitle,
  roleLabel,
  navItems,
  spotlightTitle,
  spotlightDescription,
  unauthorizedFallback,
  consoleTitle,
}: RoleDashboardLayoutProps) {
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeItem = navItems.find((item) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to),
  );

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={unauthorizedFallback || getDashboardPathForRole(currentUser.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-96 w-96 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] translate-x-1/4 translate-y-1/4 rounded-full bg-info/10 blur-3xl" />
      </div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur transition-transform lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text uppercase tracking-tight">{consoleTitle}</p>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mt-0.5">{roleLabel}</p>
              <p className="text-[10px] font-medium text-text-muted mt-1">{consoleSubtitle}</p>
            </div>
          </div>
            <button
            type="button"
            className="rounded-xl border border-border p-2 text-text-muted lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-6 space-y-2">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-text-muted hover:bg-bg-subtle hover:text-text",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 rounded-[1.5rem] border border-border bg-highlight p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Modo operacao</p>
          <p className="mt-2 font-display text-xl font-black tracking-[-0.03em]">{spotlightTitle}</p>
          <p className="mt-2 text-sm text-slate-300">{spotlightDescription}</p>
        </div>
      </aside>

      {mobileMenuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      <div className="relative lg:pl-72 flex flex-col h-screen overflow-hidden">
        <DashboardNavbar
          onMenuClick={() => setMobileMenuOpen(true)}
          title={activeItem?.label}
          subtitle={consoleSubtitle}
          role={currentUser.role === "customer" ? "client" : currentUser.role}
        />

        <main className="flex-1 overflow-y-auto relative z-10 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
