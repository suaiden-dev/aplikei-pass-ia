import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  signInWithPassword,
  signUp,
  signOut,
  getSession,
  getSessionSafe,
  updateUser,
  onAuthStateChange,
  supabase,
  findById,
  create,
  update,
} = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  getSessionSafe: vi.fn(),
  updateUser: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: {
      subscription: {
        unsubscribe: vi.fn(),
      },
    },
  })),
  getCachedSessionUser: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  supabase,
  getSessionSafe,
  supabase: {
    auth: {
      signInWithPassword,
      signUp,
      signOut,
      getSession,
      updateUser,
      onAuthStateChange,
    },
  },
}));

vi.mock("../repositories", () => ({
  userRepository: {
    findById,
    create,
    update,
  },
}));

import { authService, buildFallbackAccount } from "./auth.service";

function makeAuthUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    app_metadata: {},
    user_metadata: {
      full_name: "Teste User",
      phone_number: "+55 11 99999-9999",
      role: "customer",
    },
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
    email: "teste@example.com",
    ...overrides,
  } as User;
}

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Removed mock
    getSessionSafe.mockResolvedValue({
      user: makeAuthUser(),
    });
  });

  it("builds a fallback account from auth metadata", () => {
    const fallback = buildFallbackAccount(makeAuthUser({ updated_at: undefined }));

    expect(fallback).toEqual({
      id: "user-1",
      fullName: "Teste User",
      email: "teste@example.com",
      phoneNumber: "+55 11 99999-9999",
      avatarUrl: null,
      passportPhotoUrl: null,
      role: "customer",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("reuses an existing account before trying to create one", async () => {
    findById.mockResolvedValueOnce({
      id: "user-1",
      fullName: "Conta Existente",
      email: "teste@example.com",
      phoneNumber: "",
      avatarUrl: null,
      passportPhotoUrl: null,
      role: "customer",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const account = await authService.ensureAccount(makeAuthUser());

    expect(account.fullName).toBe("Conta Existente");
    expect(create).not.toHaveBeenCalled();
  });

  it("skips account creation on sign up when no authenticated session is returned", async () => {
    const ensureAccountSpy = vi.spyOn(authService, "ensureAccount");
    signUp.mockResolvedValueOnce({
      data: {
        user: makeAuthUser(),
        session: null,
      },
      error: null,
    });

    await authService.signUp({
      email: "teste@example.com",
      password: "secret123",
      fullName: "Teste User",
      phoneNumber: "+55 11 99999-9999",
    });

    expect(ensureAccountSpy).not.toHaveBeenCalled();
  });

  it("uses the cached session user before falling back to getSession", async () => {
    findById.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce({
      id: "user-1",
      fullName: "Criada",
      email: "teste@example.com",
      phoneNumber: "+55 11 99999-9999",
      avatarUrl: null,
      passportPhotoUrl: null,
      role: "customer",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    // Removed mock

    const account = await authService.ensureAccount(makeAuthUser());

    expect(getSessionSafe).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledTimes(1);
    expect(account.id).toBe("user-1");
  });

  it("recovers by refetching when the create step loses a race", async () => {
    findById
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "user-1",
        fullName: "Criado em paralelo",
        email: "teste@example.com",
        phoneNumber: "",
        avatarUrl: null,
        passportPhotoUrl: null,
        role: "customer",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });
    create.mockResolvedValueOnce(null);

    const account = await authService.ensureAccount(makeAuthUser());

    expect(create).toHaveBeenCalledTimes(1);
    expect(account.fullName).toBe("Criado em paralelo");
  });

  it("throws when account creation and recovery both fail", async () => {
    findById.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce(null);

    await expect(authService.ensureAccount(makeAuthUser())).rejects.toThrow("Failed to resolve authenticated account");
    expect(create).toHaveBeenCalledTimes(1);
  });
});
