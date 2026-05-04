import type { UserAccount, UserRole } from "../auth/types";

export type Action = "read" | "create" | "update" | "delete" | "manage";

export type Resource =
  | "process"
  | "payment"
  | "product"
  | "coupon"
  | "user"
  | "role"
  | "chat"
  | "report"
  | "page";

export interface PolicyRule<R = unknown> {
  actions: Action[];
  resource: Resource;
  condition?: (user: UserAccount, resource?: R) => boolean;
}

export type Policy = PolicyRule[];
export type RolePolicies = Record<UserRole, Policy>;
