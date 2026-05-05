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
  LayoutTemplate,
} from "lucide-react";
import { RoleDashboardLayout } from "./RoleDashboardLayout";
import { useT } from "../i18n";

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
    { to: "/admin/page-builder", label: t.nav.pageBuilder, icon: LayoutTemplate },
  ];

  return (
    <RoleDashboardLayout
      allowedRoles={["master", "manager", "admin_lawyer"]}
      consoleTitle={t.layout.shared.consoleTitle}
      consoleSubtitle={t.layout.admin.subtitle}
      roleLabel={t.layout.admin.roleLabel}
      navItems={navItems}
      spotlightTitle={t.layout.admin.spotlightTitle}
      spotlightDescription={t.layout.admin.spotlightDescription}
      unauthorizedFallback="/login"
    />
  );
}
