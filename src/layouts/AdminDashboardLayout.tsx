import type { DashboardNavItem } from "./RoleDashboardLayout";
import {
  LayoutDashboard,
  CreditCard,
  Package2,
  MessageSquare,
  Users,
  TicketPercent,
  BriefcaseBusiness,
  ShieldCheck,
} from "lucide-react";
import { RoleDashboardLayout } from "./RoleDashboardLayout";
<<<<<<< HEAD

const navItems: DashboardNavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/products", label: "Products", icon: Package2 },
  { to: "/admin/chats", label: "Chats", icon: MessageSquare },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { to: "/admin/cases", label: "Cases", icon: BriefcaseBusiness },
];
=======
import { useT } from "../i18n";
>>>>>>> ca1a9af (feat: Implemented a color-coding system, atomic components, an organized)

export function AdminDashboardLayout() {
  const t = useT("admin");

  const navItems: DashboardNavItem[] = [
    { to: "/admin", label: t.nav.dashboard, icon: LayoutDashboard, exact: true },
    { to: "/admin/processes", label: t.nav.matters, icon: BriefcaseBusiness },
    { to: "/admin/lawyers", label: t.nav.lawyers, icon: Users },
    { to: "/admin/payments", label: t.nav.revenue, icon: CreditCard },
    { to: "/admin/products", label: t.nav.products, icon: Package2 },
    { to: "/admin/chats", label: t.nav.chats, icon: MessageSquare },
    { to: "/admin/customers", label: t.nav.customers, icon: Users },
    { to: "/admin/coupons", label: t.nav.coupons, icon: TicketPercent },
    { to: "/admin/roles", label: t.nav.roles, icon: ShieldCheck },
  ];

  return (
    <RoleDashboardLayout
      allowedRoles={["master", "admin"]}
      consoleTitle={t.layout.shared.consoleTitle}
      consoleSubtitle={t.layout.admin.subtitle}
      roleLabel={t.layout.admin.roleLabel}
      headerEyebrow={t.layout.admin.headerEyebrow}
      navItems={navItems}
<<<<<<< HEAD
      spotlightTitle="Operação ativa"
      spotlightDescription="Ambiente administrativo mockado para gestão diária de atendimento, financeiro e carteira."
      unauthorizedFallback="/seller/payments"
=======
      spotlightTitle={t.layout.admin.spotlightTitle}
      spotlightDescription={t.layout.admin.spotlightDescription}
      unauthorizedFallback="/login"
>>>>>>> ca1a9af (feat: Implemented a color-coding system, atomic components, an organized)
    />
  );
}
