import { describe, expect, it } from "vitest";
import { getDefaultRouteForRole, getRedirectPathAfterLogin } from "./authRedirect";
import type { UserAccount } from "../models/user.model";

const customerUser: UserAccount = {
  id: "customer-1",
  fullName: "Customer User",
  email: "customer@example.com",
  phoneNumber: "+1 555 555 5555",
  avatarUrl: null,
  role: "customer",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const adminUser: UserAccount = {
  ...customerUser,
  id: "admin-1",
  email: "admin@example.com",
  role: "admin",
};

describe("authRedirect", () => {
  it("returns the default dashboard for each role", () => {
    expect(getDefaultRouteForRole("customer")).toBe("/dashboard");
    expect(getDefaultRouteForRole("admin")).toBe("/admin");
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
      getRedirectPathAfterLogin(adminUser, {
        from: { pathname: "/login", search: "", hash: "" },
      }),
    ).toBe("/admin");
  });
});
