import { useState } from "react";
import { NavLink, Outlet, useLocation, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiDashboardLine,
  RiBriefcaseLine,
  RiQuestionLine,
  RiCloseLine,
  RiLogoutBoxRLine,
} from "react-icons/ri";
import { useAuth } from "@shared/hooks/useAuth";
import { useTheme } from "@shared/hooks/useTheme";
import { useLocale, useT, type Language } from "@app/app/i18n";
import { useMemo } from "react";
import { getDashboardPathForRole } from "@features/auth/lib/roles";
import { cn } from "@shared/utils/cn";
import { NotificationProvider } from "@app/app/providers/NotificationProvider";
import { NotificationToaster } from "@features/notifications/components/NotificationToaster";
import { DashboardNavbar } from "@shared/components/organisms/DashboardNavbar";

export function CustomerLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { lang, setLang } = useLocale();
  const tDashboard = useT("dashboard");
  const { pathname } = useLocation();
  const [sidebarOpenPath, setSidebarOpenPath] = useState<string | null>(null);
  const isSidebarOpen = sidebarOpenPath === pathname;
  const resolvedName = useMemo(() => {
    const raw = user?.fullName || "";
    return raw.trim().split(/\s+/)[0] || "User";
  }, [user]);

  const resolvedAvatar = useMemo(() => {
    const u = user as { avatarUrl?: string | null; avatar_url?: string | null } | undefined;
    const fromUser = u?.avatarUrl || u?.avatar_url || null;
    if (fromUser) return fromUser;
    
    const initials = (resolvedName[0] ?? "U").toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="#3b82f6"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#ffffff">${initials}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [user, resolvedName]);

  const navItems = [
    { label: tDashboard.sidebar.dashboard, icon: RiDashboardLine, to: "/dashboard" },
    { label: tDashboard.sidebar.cases, icon: RiBriefcaseLine, to: "/dashboard/processes" },
    { label: tDashboard.sidebar.support, icon: RiQuestionLine, to: "/dashboard/support" },
  ];

  if (!user) {
    return <Navigate to="/acompanhar-meu-caso" replace />;
  }

  if (user.role !== "customer") {
    return <Navigate to={getDashboardPathForRole(user.role) ?? "/acompanhar-meu-caso"} replace />;
  }

  const closeSidebar = () => setSidebarOpenPath(null);
  const openSidebar = () => setSidebarOpenPath(pathname);
  const handleLogout = async () => {
    await logout();
    navigate("/track-my-case", { replace: true });
  };

  return (
    <NotificationProvider role="client">
      <div className="flex h-screen overflow-hidden bg-bg relative w-full">
        {/* Backdrop for Mobile */}
        {isSidebarOpen && (
          <div 
            className="xl:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity"
            onClick={closeSidebar}
          />
        )}

        <aside 
          className={cn(
            "fixed xl:static inset-y-0 left-0 z-[60] flex flex-col shrink-0 w-full xl:w-[240px] border-r transition-transform duration-300 xl:translate-x-0 shadow-2xl xl:shadow-none",
            "bg-card border-border",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Sidebar Header */}
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Aplikei" className="h-10 w-auto object-contain" />
                <span className="text-sm font-black uppercase tracking-tight text-text">Aplikei</span>
              </div>
              
              <button 
                onClick={closeSidebar}
                className="xl:hidden p-2 rounded-xl bg-bg-subtle text-text-muted hover:text-text"
              >
                <RiCloseLine size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navItems.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/dashboard"}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all duration-200",
                    isActive
                      ? "bg-[#0b2a5b] text-white border border-[#1f3f77]"
                      : "text-text-muted hover:bg-bg-subtle hover:text-text"
                  )
                }
              >
                <Icon className="text-xl text-current" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Footer Actions */}
          <div className="p-6 mt-auto border-t border-border bg-bg-subtle/30 space-y-6">
            {/* Language Selection */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Language</p>
              <div className="flex items-center gap-2">
                {(["pt", "en", "es"] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl border transition-all text-lg",
                      lang === l 
                        ? "bg-primary/10 border-primary shadow-sm" 
                        : "bg-bg-subtle border-border opacity-50 grayscale"
                    )}
                  >
                    {l === "pt" ? "🇧🇷" : l === "en" ? "🇺🇸" : "🇪🇸"}
                  </button>
                ))}
              </div>
            </div>

            {/* User Info / Profile Link */}
            <div className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card">
              <img
                src={resolvedAvatar}
                alt="Avatar"
                className="h-9 w-9 rounded-full border border-border object-cover"
              />
              <div className="text-left overflow-hidden">
                <p className="text-xs font-bold text-text truncate">{resolvedName}</p>
                <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-border bg-card text-text hover:bg-bg-subtle transition-all font-semibold text-sm"
            >
              {theme === "dark" ? "Tema claro" : "Tema escuro"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all font-semibold text-sm"
            >
              <RiLogoutBoxRLine size={18} />
              Sair
            </button>

            <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Powered by Aplikei
            </p>
          </div>

        </aside>

        {/* Main area */}
        <main className="flex-1 overflow-hidden flex flex-col h-full bg-bg">
          <DashboardNavbar onMenuClick={openSidebar} role="client" />
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
          </div>
        </main>
        <NotificationToaster />
      </div>
    </NotificationProvider>
  );
}
