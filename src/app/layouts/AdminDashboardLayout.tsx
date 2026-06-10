import { RoleDashboardLayout } from "./RoleDashboardLayout";
import { useT } from "@app/app/i18n";
import { buildSidebarNavItems } from "@app/app/router/sidebarRoutes";
import { useAuth } from "@shared/hooks/useAuth";

export function AdminDashboardLayout() {
  const t = useT("admin");
  const { user } = useAuth();
  const navRole = user?.role ?? "manager";
  const navItems = buildSidebarNavItems("manager", navRole, t.nav as Record<string, string>);

  return (
    <RoleDashboardLayout
      allowedRoles={["master", "manager", "admin_lawyer"]}
      headerEyebrow={t.layout.admin.headerEyebrow}
      consoleTitle={t.layout.shared.consoleTitle}
      consoleSubtitle={t.layout.admin.subtitle}
      roleLabel={t.layout.admin.roleLabel}
      navItems={navItems}
      spotlightTitle={t.layout.admin.spotlightTitle}
      spotlightDescription={t.layout.admin.spotlightDescription}
      unauthorizedFallback="/track-my-visa"
    />
  );
}
