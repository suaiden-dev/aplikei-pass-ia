import type { Location } from "react-router-dom";
import type { UserAccount, UserRole } from "../models/user.model";
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
      to: "/login";
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
    return {
      kind: "redirect-login",
      to: "/login",
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
