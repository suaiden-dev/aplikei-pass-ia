import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import {
    LayoutDashboard,
    ShoppingCart,
    CreditCard,
    Users,
    FileText,
    UserCheck,
    Handshake,
    ScrollText,
    RefreshCw,
    Package,
    HeadphonesIcon,
    BarChart3,
    LogOut,
    Menu,
    X,
    ShieldCheck,
} from "lucide-react";

const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
    { to: "/admin/pedidos", icon: ShoppingCart, label: "Pedidos" },
    { to: "/admin/pagamentos", icon: CreditCard, label: "Pagamentos" },
    { to: "/admin/clientes", icon: Users, label: "Clientes" },
    { to: "/admin/documentos", icon: FileText, label: "Documentos" },
    { to: "/admin/sellers", icon: UserCheck, label: "Sellers" },
    { to: "/admin/parceiros", icon: Handshake, label: "Parceiros" },
    { to: "/admin/contratos", icon: ScrollText, label: "Contratos" },
    { to: "/admin/recorrencias", icon: RefreshCw, label: "Recorrências" },
    { to: "/admin/produtos", icon: Package, label: "Produtos" },
    { to: "/admin/suporte", icon: HeadphonesIcon, label: "Suporte" },
    { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

export default function AdminLayout() {
    const { user } = useAdmin();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-background">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-border px-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-accent" />
                        <span className="font-display text-lg font-bold text-foreground">
                            Admin
                        </span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-md p-1 text-muted-foreground hover:text-foreground lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.end}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                            ? "bg-accent/10 text-accent"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`
                                    }
                                >
                                    <item.icon className="h-4 w-4 shrink-0" />
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User info + logout */}
                <div className="border-t border-border p-4">
                    <div className="mb-2 truncate text-xs text-muted-foreground">
                        {user?.email}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="h-4 w-4" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-md p-1.5 text-muted-foreground hover:text-foreground lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <h1 className="font-display text-lg font-semibold text-foreground">
                        Painel Administrativo
                    </h1>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
