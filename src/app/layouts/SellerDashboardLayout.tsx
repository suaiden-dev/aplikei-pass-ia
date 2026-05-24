import { RoleDashboardLayout } from "./RoleDashboardLayout";
import { useT } from "@app/app/i18n";
import { buildSidebarNavItems } from "@app/app/router/sidebarRoutes";

export function SellerDashboardLayout() {
  const t = useT("admin");
  const navItems = buildSidebarNavItems("seller", "seller", t.nav as Record<string, string>);

  return (
    <RoleDashboardLayout
      allowedRoles={["master", "manager", "seller"]}
      consoleTitle={t.layout.shared.consoleTitle}
      headerEyebrow={t.layout.seller.roleLabel}
      consoleSubtitle={t.layout.seller.subtitle}
      roleLabel={t.layout.seller.roleLabel}
      navItems={navItems}
      spotlightTitle={t.layout.seller.spotlightTitle}
      spotlightDescription={t.layout.seller.spotlightDescription}
      unauthorizedFallback="/acompanhar-meu-caso"
    />
  );
}
