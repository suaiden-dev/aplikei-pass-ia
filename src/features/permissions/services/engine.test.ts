import { describe, expect, it } from "vitest";
import { can } from "./engine";
import type { UserAccount, UserRole } from "@features/auth/types";

function user(role: UserRole, id = "user-1"): UserAccount {
  return {
    id,
    fullName: "Test User",
    email: "test@example.com",
    phoneNumber: "",
    avatarUrl: null,
    avatarOffsetX: 0,
    avatarOffsetY: 0,
    avatarZoom: 1,
    role,
    officeId: "office-1",
    hasCompletedOnboarding: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("permission engine", () => {
  it("denies every action when there is no authenticated user", () => {
    expect(can(null, "read", "process")).toBe(false);
    expect(can(null, "manage", "payment")).toBe(false);
  });

  it("allows master to manage all configured resources", () => {
    const master = user("master");

    expect(can(master, "delete", "process")).toBe(true);
    expect(can(master, "update", "payment")).toBe(true);
    expect(can(master, "create", "page")).toBe(true);
  });

  it("keeps seller permissions limited to sales-facing resources", () => {
    const seller = user("seller");

    expect(can(seller, "create", "coupon")).toBe(true);
    expect(can(seller, "create", "chat")).toBe(true);
    expect(can(seller, "update", "coupon")).toBe(false);
    expect(can(seller, "read", "user")).toBe(false);
  });

  it("allows customers to read only their own process and payment resources", () => {
    const customer = user("customer", "customer-1");

    expect(can(customer, "read", "process", { ownerId: "customer-1" })).toBe(true);
    expect(can(customer, "read", "payment", { ownerId: "customer-1" })).toBe(true);
    expect(can(customer, "read", "process", { ownerId: "customer-2" })).toBe(false);
    expect(can(customer, "read", "payment", { ownerId: "customer-2" })).toBe(false);
  });

  it("allows customers to create processes without an ownership condition", () => {
    expect(can(user("customer"), "create", "process")).toBe(true);
  });
});
