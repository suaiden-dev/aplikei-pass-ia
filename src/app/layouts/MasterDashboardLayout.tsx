import { RoleDashboardLayout } from "./RoleDashboardLayout";
import { useT } from "@app/app/i18n";
import { buildSidebarNavItems } from "@app/app/router/sidebarRoutes";
import { useAuth } from "@shared/hooks/useAuth";

export function MasterDashboardLayout() {
  const t = useT("admin");
  const { user } = useAuth();
  const layout = t.layout ?? {};
  const masterLayout = layout.master ?? {};
  const sharedLayout = layout.shared ?? {};
  const navRole = user?.role ?? "master";
  const navItems = buildSidebarNavItems("master", navRole, t.nav as Record<string, string>);

  return (
    <RoleDashboardLayout
      allowedRoles={["master"]}
      consoleTitle={sharedLayout.consoleTitle ?? "Console Aplikei"}
      consoleSubtitle={masterLayout.subtitle ?? "Gestao Global"}
      roleLabel={masterLayout.roleLabel ?? "Escopo Master"}
      headerEyebrow={masterLayout.headerEyebrow ?? "Painel Master"}
      navItems={navItems}
      spotlightTitle={masterLayout.spotlightTitle ?? "Operacao Master"}
      spotlightDescription={masterLayout.spotlightDescription ?? "Ambiente master para supervisao global."}
      unauthorizedFallback="/track-my-visa"
    />
  );
}
