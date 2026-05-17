import { useAuth } from "@shared/hooks/useAuth";
import { can as canByPolicy } from "../services/engine";
import type { Action, Resource } from "../types";

export function usePermission() {
  const { user } = useAuth();

  return {
    can: (action: Action, resource: Resource, resourceObj?: unknown) =>
      canByPolicy(user, action, resource, resourceObj),
  };
}
