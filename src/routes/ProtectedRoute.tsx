import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { RouteGuardLoader } from "./RouteGuardLoader";
import { resolveAuthGuard } from "./authGuard";

export function ProtectedRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const resolution = resolveAuthGuard({ user, isAuthenticated, isLoading, location });

  if (resolution.kind === "loading") {
    return <RouteGuardLoader />;
  }

  if (resolution.kind === "redirect-login") {
    return <Navigate to={resolution.to} state={resolution.state} replace />;
  }

  return <Outlet />;
}
