import type { UserRole } from "../../features/auth/types";

export function normalizeRole(role: unknown): UserRole {
  if (role === "master") return "master";
  if (role === "admin_lawyer") return "admin_lawyer";
  if (role === "manager") return "manager";
  if (role === "admin") return "manager";
  if (role === "seller") return "seller";
  return "customer";
}

export function getDashboardPathForRole(role: UserRole): string {
  if (role === "master") return "/master";
  if (role === "manager" || role === "admin_lawyer") return "/admin";
  if (role === "seller") return "/seller/payments";
  return "/dashboard";
}
