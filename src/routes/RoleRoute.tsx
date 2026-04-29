import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../models/user.model";
import { RouteGuardLoader } from "./RouteGuardLoader";
import { resolveAuthGuard } from "./authGuard";

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const resolution = resolveAuthGuard({
    user,
    isAuthenticated,
    isLoading,
    location,
    allowedRoles,
  });

  if (resolution.kind === "loading") {
    return <RouteGuardLoader />;
  }

  if (resolution.kind === "redirect-login") {
    return <Navigate to={resolution.to} state={resolution.state} replace />;
  }

  if (resolution.kind === "redirect-role-home") {
    return <Navigate to={resolution.to} replace />;
  }

  return <Outlet />;
}
