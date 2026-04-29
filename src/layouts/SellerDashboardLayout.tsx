import type { DashboardNavItem } from "./RoleDashboardLayout";
import {
  CreditCard,
  MessageSquare,
  Users,
  TicketPercent,
} from "lucide-react";
import { RoleDashboardLayout } from "./RoleDashboardLayout";

const navItems: DashboardNavItem[] = [
  { to: "/seller/payments", label: "Payments", icon: CreditCard },
  { to: "/seller/chats", label: "Chats", icon: MessageSquare },
  { to: "/seller/customers", label: "Customers", icon: Users },
  { to: "/seller/coupons", label: "Coupons", icon: TicketPercent },
];

export function SellerDashboardLayout() {
  return (
    <RoleDashboardLayout
      allowedRoles={["master", "admin", "seller"]}
      consoleTitle="Seller Console"
      consoleSubtitle="Aplikei sales"
      roleLabel="seller scope"
      headerEyebrow="Dashboard seller"
      navItems={navItems}
      spotlightTitle="Pipeline comercial"
      spotlightDescription="Escopo focado em vendas, relacionamento, campanhas e atendimento comercial."
      unauthorizedFallback="/login"
    />
  );
}
