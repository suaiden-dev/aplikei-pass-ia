import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiDashboardLine,
  RiBankCardLine,
  RiTeamLine,
  RiFileListLine,
  RiLogoutBoxLine,
  RiNotification3Line,
  RiPriceTag3Line,
  RiMenuLine,
  RiCloseLine,
} from "react-icons/ri";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../utils/cn";

const navItems = [
  { label: "Overview",  icon: RiDashboardLine, to: "/admin" },
  { label: "Payments",  icon: RiBankCardLine,  to: "/admin/payments" },
  { label: "Products",  icon: RiPriceTag3Line, to: "/admin/products" },
  { label: "Customers", icon: RiTeamLine,      to: "/admin/customers" },
  { label: "Cases", icon: RiFileListLine,  to: "/admin/processes" },
];

const pageTitle: Record<string, string> = {
  "/admin":           "Overview",
  "/admin/payments":  "Gestão de Pagamentos",
  "/admin/products":  "Produtos & Preços",
  "/admin/customers": "Customers",
  "/admin/processes": "Cases",
};

function usePageTitle() {
  const { pathname } = useLocation();
  return pageTitle[pathname] ?? "Admin Panel";
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const avatarUrl =
    user?.avatarUrl ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName ?? "Admin")}&background=1a56db&color=fff`;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const title = usePageTitle();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] relative">
      {/* Backdrop for Mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-[60] flex flex-col shrink-0 w-full lg:w-[220px] bg-highlight text-white transition-transform duration-300 lg:translate-x-0 shadow-2xl lg:shadow-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo & Close Button */}
        <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
          <span className="font-display font-bold text-xl tracking-tight text-white">
            Aplikei<span className="text-primary">.</span>
          </span>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white transition-colors"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 relative group",
                  isActive
                    ? "bg-white/10 text-primary"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                  )}
                  <Icon className={cn("text-lg shrink-0", isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300")} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <img
              src={avatarUrl}
              alt={user?.fullName ?? "Admin"}
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-white/10"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate leading-tight">
                {user?.fullName ?? "Admin"}
              </p>
              <p className="text-xs text-slate-400 truncate leading-tight">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-red-400 transition-colors duration-150"
          >
            <RiLogoutBoxLine className="text-base shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 lg:px-8 py-4 bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-600 active:scale-95 transition-all"
            >
              <RiMenuLine size={24} />
            </button>
            <h1 className="font-display font-semibold text-lg lg:text-xl text-slate-800">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
              <RiNotification3Line className="text-xl" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full flex items-center justify-center">
                <span className="sr-only">3 notifications</span>
              </span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
