import { useState } from "react";
import { NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiDashboardLine,
  RiBriefcaseLine,
  RiQuestionLine,
  RiMenuLine,
  RiCloseLine,
} from "react-icons/ri";
import { useAuth } from "../hooks/useAuth";
import { useT } from "../i18n";
import { getDashboardPathForRole } from "../shared/auth/roles";
import { cn } from "../utils/cn";
import { NotificationProvider } from "../contexts/NotificationContext";
import { NotificationToaster } from "../features/notifications/components/NotificationToaster";
import { NotificationBell } from "../features/notifications/components/NotificationBell";
import { DashboardNavbar } from "../components/organisms/DashboardNavbar";

export function CustomerLayout() {
  const { user } = useAuth();
  const tDashboard = useT("dashboard");
  const { pathname } = useLocation();
  const [sidebarOpenPath, setSidebarOpenPath] = useState<string | null>(null);
  const isSidebarOpen = sidebarOpenPath === pathname;

  const navItems = [
    { label: tDashboard.sidebar.dashboard, icon: RiDashboardLine, to: "/dashboard" },
    { label: tDashboard.sidebar.cases, icon: RiBriefcaseLine, to: "/dashboard/processes" },
    { label: tDashboard.sidebar.support, icon: RiQuestionLine, to: "/dashboard/support" },
  ];

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "customer") {
    return <Navigate to={getDashboardPathForRole(user.role) ?? "/login"} replace />;
  }

  const closeSidebar = () => setSidebarOpenPath(null);
  const openSidebar = () => setSidebarOpenPath(pathname);

  return (
    <NotificationProvider role="client">
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC] relative">
        {/* Mobile Header */}
        <header className="xl:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Aplikei" className="h-8 w-auto object-contain" />
            <div className="ml-1">
              <NotificationBell role="client" theme="light" align="left" />
            </div>
          </div>
          <button 
            onClick={openSidebar}
            className="p-2 rounded-xl bg-slate-50 text-slate-600 active:scale-95 transition-all"
          >
            <RiMenuLine size={24} />
          </button>
        </header>

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
            "bg-highlight border-white/10",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Sidebar Header */}
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Aplikei" className="h-10 w-auto object-contain" />
                <div className="ml-1">
                  <NotificationBell role="client" theme="dark" align="left" />
                </div>
              </div>
              
              <button 
                onClick={closeSidebar}
                className="xl:hidden p-2 rounded-xl bg-white/10 text-slate-300 hover:text-white"
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
                      ? "bg-primary/20 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )
                }
              >
                <Icon className={cn("text-xl", pathname === to || (pathname === "/dashboard" && to === "/dashboard") ? "text-primary" : "text-current")} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

        </aside>

        {/* Main area */}
        <main className="flex-1 overflow-y-auto xl:pt-0 pt-16">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
        <NotificationToaster />
      </div>
    </NotificationProvider>
  );
}
