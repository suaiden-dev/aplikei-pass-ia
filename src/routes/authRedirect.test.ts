import { describe, expect, it } from "vitest";
import { getDefaultRouteForRole, getRedirectPathAfterLogin } from "./authRedirect";
import type { UserAccount } from "../features/auth/types";

const customerUser: UserAccount = {
  id: "customer-1",
  fullName: "Customer User",
  email: "customer@example.com",
  phoneNumber: "+1 555 555 5555",
  avatarUrl: null,
  avatarOffsetX: 0,
  avatarOffsetY: 0,
  avatarZoom: 1,
  role: "customer",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const managerUser: UserAccount = {
  ...customerUser,
  id: "manager-1",
  email: "manager@example.com",
  role: "manager",
};

describe("authRedirect", () => {
  it("returns the default dashboard for each role", () => {
    expect(getDefaultRouteForRole("customer")).toBe("/dashboard");
    expect(getDefaultRouteForRole("manager")).toBe("/admin");
    expect(getDefaultRouteForRole("admin_lawyer")).toBe("/admin");
  });

  it("redirects to the original protected route after login", () => {
    expect(
      getRedirectPathAfterLogin(customerUser, {
        from: {
          pathname: "/dashboard/processes/visto-f1/onboarding",
          search: "?step=2",
          hash: "#docs",
        },
      }),
    ).toBe("/dashboard/processes/visto-f1/onboarding?step=2#docs");
  });

  it("falls back to the role home when there is no valid origin", () => {
    expect(getRedirectPathAfterLogin(customerUser, null)).toBe("/dashboard");
    expect(
      getRedirectPathAfterLogin(managerUser, {
        from: { pathname: "/login", search: "", hash: "" },
      }),
    ).toBe("/admin");
  });
});
