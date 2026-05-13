import { RoleDashboardLayout } from "./RoleDashboardLayout";
import { useT } from "../i18n";
import { buildSidebarNavItems } from "../routes/sidebarRoutes";
import { useAuth } from "../hooks/useAuth";

export function MasterDashboardLayout() {
  const t = useT("admin");
  const { user } = useAuth();
  const navRole = user?.role ?? "master";
  const navItems = buildSidebarNavItems("master", navRole, t.nav as Record<string, string>);

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
