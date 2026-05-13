import { describe, expect, it } from "vitest";
import type { UserAccount } from "../features/auth/types";
import { buildLoginRedirectState, resolveAuthGuard } from "./authGuard";

const customerUser: UserAccount = {
  id: "customer-1",
  fullName: "Customer User",
  email: "customer@example.com",
  phoneNumber: "+1 555 555 5555",
  avatarUrl: null,
  avatarOffsetX: 0,
  avatarOffsetY: 0,
  avatarZoom: 1,
  passportPhotoUrl: null,
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

describe("authGuard", () => {
  it("builds the redirect state for protected routes", () => {
    expect(buildLoginRedirectState({
      pathname: "/dashboard/processes/visto-f1/onboarding",
      search: "?step=2",
      hash: "#docs",
    })).toEqual({
      from: {
        pathname: "/dashboard/processes/visto-f1/onboarding",
        search: "?step=2",
        hash: "#docs",
      },
    });
  });

  it("redirects anonymous users to login", () => {
    expect(resolveAuthGuard({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      location: {
        pathname: "/dashboard",
        search: "",
        hash: "",
      },
    })).toEqual({
      kind: "redirect-login",
      to: "/login",
      state: {
        from: {
          pathname: "/dashboard",
          search: "",
          hash: "",
        },
      },
    });
  });

  it("redirects authenticated users away from unauthorized role routes", () => {
    expect(resolveAuthGuard({
      user: customerUser,
      isAuthenticated: true,
      isLoading: false,
      location: {
        pathname: "/master",
        search: "",
        hash: "",
      },
      allowedRoles: ["manager"],
    })).toEqual({
      kind: "redirect-role-home",
      to: "/dashboard",
    });
  });

  it("allows authenticated users on allowed routes", () => {
    expect(resolveAuthGuard({
      user: customerUser,
      isAuthenticated: true,
      isLoading: false,
      location: {
        pathname: "/dashboard",
        search: "",
        hash: "",
      },
      allowedRoles: ["customer"],
    })).toEqual({
      kind: "allow",
    });
  });

  it("blocks non-master users from master-only routes", () => {
    expect(resolveAuthGuard({
      user: managerUser,
      isAuthenticated: true,
      isLoading: false,
      location: {
        pathname: "/master/finance-analytics",
        search: "",
        hash: "",
      },
      allowedRoles: ["master"],
    })).toEqual({
      kind: "redirect-role-home",
      to: "/master",
    });
  });
});
