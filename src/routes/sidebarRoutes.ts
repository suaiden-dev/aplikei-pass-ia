import type { DashboardNavItem } from "../layouts/RoleDashboardLayout";
import type { UserRole } from "../features/auth/types";
import { appRoutes, type RouteLayout } from "./appRoutes";

type NavLabels = Record<string, string>;

export function buildSidebarNavItems(
  layout: Extract<RouteLayout, "manager" | "master" | "seller">,
  role: UserRole,
  labels: NavLabels,
): DashboardNavItem[] {
  const prefix = layout === "seller"
    ? "/seller"
    : layout === "manager"
      ? "/admin"
    : layout === "master" && role === "master"
      ? "/master"
      : "";
  const isSharedAbsoluteRoute = (path: string) =>
    layout === "master" && role !== "master" && path === "/payments";

  return appRoutes
    .filter((route) =>
      route.sidebarLayouts !== undefined
        ? route.sidebarLayouts.includes(role)
        : route.layout === layout,
    )
    .filter((route) => route.showInSidebar)
    .filter((route) => route.accessLevels.includes(role))
    .filter((route): route is typeof route & { icon: NonNullable<typeof route.icon> } => Boolean(route.icon))
    .map((route) => ({
      to: route.layout === "protected"
        ? (isSharedAbsoluteRoute(route.path) ? route.path : `${prefix}${route.path}`)
        : route.path,
      label: route.titleKey ? labels[route.titleKey] ?? route.title : route.title,
      icon: route.icon,
      exact: route.exact,
      group: route.sidebarGroupKey ? labels[route.sidebarGroupKey] ?? route.sidebarGroup : route.sidebarGroup,
    }));
}
