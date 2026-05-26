import type { Location } from "react-router-dom";
import type { UserAccount, UserRole } from "@features/auth/types";
import { getDefaultRouteForRole } from "./authRedirect";

type RedirectLocation = Pick<Location, "pathname" | "search" | "hash">;

export interface AuthGuardInput {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  location: RedirectLocation;
  allowedRoles?: UserRole[];
}

export type AuthGuardResolution =
  | { kind: "loading" }
  | { kind: "allow" }
  | {
      kind: "redirect-login";
      to: "/acompanhar-meu-caso" | "/login-office";
      state: {
        from: RedirectLocation;
      };
    }
  | {
      kind: "redirect-role-home";
      to: string;
    };

export function buildLoginRedirectState(location: RedirectLocation) {
  return {
    from: {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    },
  };
}

export function resolveAuthGuard({
  user,
  isAuthenticated,
  isLoading,
  location,
  allowedRoles,
}: AuthGuardInput): AuthGuardResolution {
  if (isLoading) {
    return { kind: "loading" };
  }

  if (!isAuthenticated || !user) {
    const isProfessionalRoute =
      location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/manager") ||
      location.pathname.startsWith("/seller") ||
      location.pathname.startsWith("/master");

    return {
      kind: "redirect-login",
      to: isProfessionalRoute ? "/login-office" : "/acompanhar-meu-caso",
      state: buildLoginRedirectState(location),
    };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      kind: "redirect-role-home",
      to: getDefaultRouteForRole(user.role),
    };
  }

  return { kind: "allow" };
}
