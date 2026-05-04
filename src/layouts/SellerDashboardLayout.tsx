import type { DashboardNavItem } from "./RoleDashboardLayout";
import {
  CreditCard,
  MessageSquare,
  Users,
  TicketPercent,
} from "lucide-react";
import { RoleDashboardLayout } from "./RoleDashboardLayout";
import { useT } from "../i18n";

export function SellerDashboardLayout() {
  const t = useT("admin");

  const navItems: DashboardNavItem[] = [
    { to: "/seller/payments", label: t.nav.revenue, icon: CreditCard },
    { to: "/seller/chats", label: t.nav.chats, icon: MessageSquare },
    { to: "/seller/customers", label: t.nav.customers, icon: Users },
    { to: "/seller/coupons", label: t.nav.coupons, icon: TicketPercent },
  ];

  return (
    <RoleDashboardLayout
      allowedRoles={["master", "manager", "seller"]}
      consoleTitle={t.layout.shared.consoleTitle}
      consoleSubtitle={t.layout.seller.subtitle}
      roleLabel={t.layout.seller.roleLabel}
      headerEyebrow={t.layout.seller.headerEyebrow}
      navItems={navItems}
      spotlightTitle={t.layout.seller.spotlightTitle}
      spotlightDescription={t.layout.seller.spotlightDescription}
      unauthorizedFallback="/login"
    />
  );
}
