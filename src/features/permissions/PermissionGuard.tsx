import type { ReactNode } from "react";
import { usePermission } from "./usePermission";
import type { Action, Resource } from "./types";

interface PermissionGuardProps {
  action: Action;
  resource: Resource;
  resourceObj?: unknown;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  action,
  resource,
  resourceObj,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { can } = usePermission();
  return can(action, resource, resourceObj) ? <>{children}</> : <>{fallback}</>;
}
