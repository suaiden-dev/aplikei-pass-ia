import type { UserRole } from "../types";

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
  if (role === "manager") return "/processes";
  if (role === "admin_lawyer") return "/admin";
  if (role === "seller") return "/seller/earnings";
  return "/dashboard";
}
