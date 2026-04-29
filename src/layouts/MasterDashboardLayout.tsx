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
  { to: "/master", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/master/payments", label: "Payments", icon: CreditCard },
  { to: "/master/products", label: "Products", icon: Package2 },
  { to: "/master/chats", label: "Chats", icon: MessageSquare },
  { to: "/master/customers", label: "Customers", icon: Users },
  { to: "/master/coupons", label: "Coupons", icon: TicketPercent },
  { to: "/master/cases", label: "Cases", icon: BriefcaseBusiness },
];

export function MasterDashboardLayout() {
  return (
    <RoleDashboardLayout
      allowedRoles={["master"]}
      consoleTitle="Master Console"
      consoleSubtitle="Aplikei admin"
      roleLabel="role master"
      headerEyebrow="Dashboard master"
      navItems={navItems}
      spotlightTitle="Tudo mockado"
      spotlightDescription="Dados administrativos prontos para evoluir sem depender da integracao real."
      unauthorizedFallback="/login"
    />
  );
}
