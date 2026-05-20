import { describe, expect, it } from "vitest";
import { canAccessLoginPortal, getLoginPortalErrorMessage } from "./roles";

describe("login portal role checks", () => {
  it("allows staff roles in the professional portal", () => {
    expect(canAccessLoginPortal("manager", "professional")).toBe(true);
    expect(canAccessLoginPortal("seller", "professional")).toBe(true);
    expect(canAccessLoginPortal("admin_lawyer", "professional")).toBe(true);
    expect(canAccessLoginPortal("master", "professional")).toBe(true);
  });

  it("blocks customers from the professional portal", () => {
    expect(canAccessLoginPortal("customer", "professional")).toBe(false);
    expect(getLoginPortalErrorMessage("customer", "professional")).toBe(
      "Conta de cliente não pode acessar a área profissional.",
    );
  });

  it("allows only customers in the tracking portal", () => {
    expect(canAccessLoginPortal("customer", "tracking")).toBe(true);
    expect(canAccessLoginPortal("manager", "tracking")).toBe(false);
    expect(canAccessLoginPortal("seller", "tracking")).toBe(false);
    expect(canAccessLoginPortal("admin_lawyer", "tracking")).toBe(false);
    expect(canAccessLoginPortal("master", "tracking")).toBe(false);
  });
});
