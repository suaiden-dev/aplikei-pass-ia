/**
 * AuthContext Unit Tests
 * Tests authentication state management, session handling, and sign out.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => {
  const mockAuth = {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  };

  return {
    supabase: {
      auth: mockAuth,
    },
  };
});

// Helper component to read auth context
const AuthConsumer = () => {
  const { user, loading, session } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? "true" : "false"}</span>
      <span data-testid="user">{user ? user.email : "null"}</span>
      <span data-testid="session">{session ? "active" : "null"}</span>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start in loading state", () => {
    // Make getSession never resolve to keep loading
    vi.mocked(supabase.auth.getSession).mockReturnValue(
      new Promise(() => {}) as any,
    );

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("loading").textContent).toBe("true");
  });

  it("should set user to null when no session exists", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(screen.getByTestId("session").textContent).toBe("null");
  });

  it("should set user when session exists", async () => {
    const mockUser = { id: "123", email: "test@test.com" };
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
          access_token: "token",
        },
      },
      error: null,
    } as any);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("user").textContent).toBe("test@test.com");
    expect(screen.getByTestId("session").textContent).toBe("active");
  });

  it("should subscribe to auth state changes", () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
  });

  it("should unsubscribe on unmount", () => {
    const unsubscribe = vi.fn();
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe } },
    } as any);

    const { unmount } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("useAuth throws when used outside AuthProvider", () => {
    // Suppress React error boundary logs
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<AuthConsumer />)).toThrow(
      "useAuth deve ser usado dentro de um AuthProvider",
    );

    consoleSpy.mockRestore();
  });
});
