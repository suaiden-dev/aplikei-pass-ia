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
import { useT } from "../i18n";

export function MasterDashboardLayout() {
  const t = useT("admin");

  const navItems: DashboardNavItem[] = [
    { to: "/master", label: t.nav.dashboard, icon: LayoutDashboard, exact: true },
    { to: "/master/cases", label: t.nav.matters, icon: BriefcaseBusiness },
    { to: "/master/lawyers", label: t.nav.lawyers, icon: Users },
    { to: "/master/payments", label: t.nav.revenue, icon: CreditCard },
    { to: "/master/products", label: t.nav.products, icon: Package2 },
    { to: "/master/chats", label: t.nav.chats, icon: MessageSquare },
    { to: "/master/customers", label: t.nav.customers, icon: Users },
    { to: "/master/coupons", label: t.nav.coupons, icon: TicketPercent },
    { to: "/master/roles", label: t.nav.roles, icon: ShieldCheck },
  ];

  return (
    <RoleDashboardLayout
      allowedRoles={["master"]}
      consoleTitle={t.layout.shared.consoleTitle}
      consoleSubtitle={t.layout.master.subtitle}
      roleLabel={t.layout.master.roleLabel}
      headerEyebrow={t.layout.master.headerEyebrow}
      navItems={navItems}
      spotlightTitle={t.layout.master.spotlightTitle}
      spotlightDescription={t.layout.master.spotlightDescription}
      unauthorizedFallback="/login"
    />
  );
}
