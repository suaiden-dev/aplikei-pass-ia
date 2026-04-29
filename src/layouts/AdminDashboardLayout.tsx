import type { DashboardNavItem } from "./RoleDashboardLayout";
import {
  LayoutDashboard,
  CreditCard,
  Package2,
  MessageSquare,
  Users,
  TicketPercent,
  BriefcaseBusiness,
} from "lucide-react";
import { RoleDashboardLayout } from "./RoleDashboardLayout";

const navItems: DashboardNavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/products", label: "Products", icon: Package2 },
  { to: "/admin/chats", label: "Chats", icon: MessageSquare },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { to: "/admin/processes", label: "Cases", icon: BriefcaseBusiness },
];

export function AdminDashboardLayout() {
  return (
    <RoleDashboardLayout
      allowedRoles={["master", "admin"]}
      consoleTitle="Admin Console"
      consoleSubtitle="Aplikei operations"
      roleLabel="admin scope"
      headerEyebrow="Dashboard admin"
      navItems={navItems}
      spotlightTitle="Operação ativa"
      spotlightDescription="Ambiente administrativo mockado para gestão diária de atendimento, financeiro e carteira."
      unauthorizedFallback="/login"
    />
  );
}
