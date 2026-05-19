import type { UserRole } from "../types";

export type LoginPortal = "professional" | "tracking";

export function normalizeRole(role: unknown): UserRole {
  if (role === "master") return "master";
  if (role === "admin_lawyer") return "admin_lawyer";
  if (role === "manager") return "manager";
  if (role === "admin") return "manager";
  if (role === "seller") return "seller";
  return "customer";
}

export function canAccessLoginPortal(role: UserRole, portal: LoginPortal): boolean {
  if (portal === "tracking") {
    return role === "customer";
  }

  return role !== "customer";
}

export function getLoginPortalErrorMessage(role: UserRole, portal: LoginPortal): string {
  if (portal === "tracking") {
    return "A aba de acompanhamento é exclusiva para clientes.";
  }

  if (role === "customer") {
    return "Conta de cliente não pode acessar a área profissional.";
  }

  return "Esta conta não pode acessar a área profissional.";
}

export function getDashboardPathForRole(role: UserRole): string {
  if (role === "master") return "/master";
  if (role === "manager") return "/manager/processes";
  if (role === "admin_lawyer") return "/admin";
  if (role === "seller") return "/seller/earnings";
  return "/dashboard";
}
