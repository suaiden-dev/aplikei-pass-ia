import type { UserAccount } from "../auth/types";
import { rolePolicies } from "./policies";
import type { Action, PolicyRule, Resource } from "./types";

function ruleAllows(
  rule: PolicyRule,
  action: Action,
  resource: Resource,
  resourceObj?: unknown,
  user?: UserAccount,
): boolean {
  const actionMatch = rule.actions.includes("manage") || rule.actions.includes(action);
  if (!actionMatch || rule.resource !== resource) return false;

  if (rule.condition) {
    if (!user) return false;
    return rule.condition(user, resourceObj);
  }

  return true;
}

export function can(
  user: UserAccount | null,
  action: Action,
  resource: Resource,
  resourceObj?: unknown,
): boolean {
  if (!user) return false;
  const policy = rolePolicies[user.role] ?? [];
  return policy.some((rule) => ruleAllows(rule, action, resource, resourceObj, user));
}
