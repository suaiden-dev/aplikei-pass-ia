import type { Location } from "react-router-dom";
import type { UserAccount, UserRole } from "../models/user.model";

type RedirectLocation = Pick<Location, "pathname" | "search" | "hash">;

export interface AuthRedirectState {
  from?: RedirectLocation;
}

export function getDefaultRouteForRole(role: UserRole) {
  return role === "admin" ? "/admin" : "/dashboard";
}

export function getRedirectPathAfterLogin(user: UserAccount, state?: AuthRedirectState | null) {
  const from = state?.from;

  if (!from?.pathname || from.pathname === "/login") {
    return getDefaultRouteForRole(user.role);
  }

  return `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`;
}
