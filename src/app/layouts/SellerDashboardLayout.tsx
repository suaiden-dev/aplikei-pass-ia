import { RoleDashboardLayout } from "./RoleDashboardLayout";
import { useT } from "@app/app/i18n";
import { buildSidebarNavItems } from "@app/app/router/sidebarRoutes";

export function SellerDashboardLayout() {
  const t = useT("admin");
  const layout = t.layout ?? {};
  const sellerLayout = layout.seller ?? {};
  const sharedLayout = layout.shared ?? {};
  const navItems = buildSidebarNavItems("seller", "seller", t.nav as Record<string, string>);

  return (
    <RoleDashboardLayout
      allowedRoles={["master", "manager", "seller"]}
      consoleTitle={sharedLayout.consoleTitle ?? "Console Aplikei"}
      headerEyebrow={sellerLayout.headerEyebrow ?? "Painel Vendedor"}
      consoleSubtitle={sellerLayout.subtitle ?? "Vendas Aplikei"}
      roleLabel={sellerLayout.roleLabel ?? "Escopo Vendedor"}
      navItems={navItems}
      spotlightTitle={sellerLayout.spotlightTitle ?? "Pipeline de Vendas"}
      spotlightDescription={sellerLayout.spotlightDescription ?? "Escopo focado em vendas e atendimento comercial."}
      unauthorizedFallback="/track-my-visa"
    />
  );
}
