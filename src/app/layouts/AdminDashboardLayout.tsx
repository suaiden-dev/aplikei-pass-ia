import { RoleDashboardLayout } from "./RoleDashboardLayout";
import { useT } from "@app/app/i18n";
import { buildSidebarNavItems } from "@app/app/router/sidebarRoutes";
import { useAuth } from "@shared/hooks/useAuth";

export function AdminDashboardLayout() {
  const t = useT("admin");
  const { user } = useAuth();
  const layout = t.layout ?? {};
  const adminLayout = layout.admin ?? {};
  const sharedLayout = layout.shared ?? {};
  const navRole = user?.role ?? "manager";
  const navItems = buildSidebarNavItems("manager", navRole, t.nav as Record<string, string>);

  return (
    <RoleDashboardLayout
      allowedRoles={["master", "manager", "admin_lawyer"]}
      headerEyebrow={adminLayout.headerEyebrow ?? "Painel Admin"}
      consoleTitle={sharedLayout.consoleTitle ?? "Console Aplikei"}
      consoleSubtitle={adminLayout.subtitle ?? "Operacao Aplikei"}
      roleLabel={adminLayout.roleLabel ?? "Escopo Administrativo"}
      navItems={navItems}
      spotlightTitle={adminLayout.spotlightTitle ?? "Operacao Ativa"}
      spotlightDescription={adminLayout.spotlightDescription ?? "Ambiente administrativo para gestao diaria."}
      unauthorizedFallback="/track-my-visa"
    />
  );
}
