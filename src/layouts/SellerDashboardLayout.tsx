import { RoleDashboardLayout } from "./RoleDashboardLayout";
import { useT } from "../i18n";
import { buildSidebarNavItems } from "../routes/sidebarRoutes";

export function SellerDashboardLayout() {
  const t = useT("admin");
  const navItems = buildSidebarNavItems("seller", "seller", t.nav as Record<string, string>);

  return (
    <RoleDashboardLayout
      allowedRoles={["master", "manager", "seller"]}
      consoleTitle={t.layout.shared.consoleTitle}
      consoleSubtitle={t.layout.seller.subtitle}
      roleLabel={t.layout.seller.roleLabel}
      navItems={navItems}
      spotlightTitle={t.layout.seller.spotlightTitle}
      spotlightDescription={t.layout.seller.spotlightDescription}
      unauthorizedFallback="/login"
    />
  );
}
