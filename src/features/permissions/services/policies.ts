import type { RolePolicies } from "../types";

export const rolePolicies: RolePolicies = {
  master: [
    { actions: ["manage"], resource: "process" },
    { actions: ["manage"], resource: "payment" },
    { actions: ["manage"], resource: "product" },
    { actions: ["manage"], resource: "coupon" },
    { actions: ["manage"], resource: "user" },
    { actions: ["manage"], resource: "role" },
    { actions: ["manage"], resource: "chat" },
    { actions: ["manage"], resource: "report" },
    { actions: ["manage"], resource: "page" },
  ],
  admin_lawyer: [
    { actions: ["read", "update"], resource: "process" },
    { actions: ["read"], resource: "payment" },
    { actions: ["read"], resource: "product" },
    { actions: ["read"], resource: "coupon" },
    { actions: ["read"], resource: "user" },
    { actions: ["read"], resource: "role" },
    { actions: ["read", "create", "update"], resource: "chat" },
    { actions: ["read"], resource: "report" },
  ],
  manager: [
    { actions: ["read", "update"], resource: "process" },
    { actions: ["read"], resource: "payment" },
    { actions: ["read", "update"], resource: "product" },
    { actions: ["read", "update"], resource: "coupon" },
    { actions: ["read"], resource: "user" },
    { actions: ["read", "update"], resource: "role" },
    { actions: ["read", "create"], resource: "chat" },
    { actions: ["read"], resource: "report" },
    { actions: ["manage"], resource: "page" },
  ],
  seller: [
    { actions: ["read"], resource: "process" },
    { actions: ["read"], resource: "payment" },
    { actions: ["read", "create"], resource: "coupon" },
    { actions: ["read", "create"], resource: "chat" },
  ],
  customer: [
    {
      actions: ["read"],
      resource: "process",
      condition: (user, resource) =>
        Boolean((resource as { ownerId?: string } | undefined)?.ownerId === user.id),
    },
    { actions: ["create"], resource: "process" },
    {
      actions: ["read"],
      resource: "payment",
      condition: (user, resource) =>
        Boolean((resource as { ownerId?: string } | undefined)?.ownerId === user.id),
    },
    {
      actions: ["read", "create"],
      resource: "chat",
      condition: (user, resource) =>
        Boolean((resource as { participantId?: string } | undefined)?.participantId === user.id),
    },
  ],
};
