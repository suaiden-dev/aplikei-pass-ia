import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => {
  const mockAuth = {
    getSession: vi.fn(),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn(),
  };

  return {
    supabase: {
      auth: mockAuth,
    },
  };
});

// Helper component to read auth context
const AuthConsumer = () => {
  const { loading, session } = useAuth();
  const user = session?.user;
  return (
    <div>
      <span data-testid="loading">{loading ? "true" : "false"}</span>
      <span data-testid="user">{user ? user.email : "null"}</span>
      <span data-testid="session">{session?.user ? "active" : "null"}</span>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { 
        subscription: { 
          unsubscribe: vi.fn(),
          id: "sub",
          callback: vi.fn(),
        } as unknown as { unsubscribe: () => void; id: string; callback: (_event: string, session: unknown) => void }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it("should start in loading state", async () => {
    // Make getSession never resolve to keep loading
    vi.mocked(supabase.auth.getSession).mockReturnValue(
      new Promise(() => {}) as unknown as Promise<{ data: { session: null }; error: null }>
    );

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>,
      );
    });

    expect(screen.getByTestId("loading").textContent).toBe("true");
  });

  it("should set user to null when no session exists", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as unknown as { data: { session: null }; error: null });

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>,
      );
    });

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
          refresh_token: "refresh",
          expires_in: 3600,
          expires_at: 1000,
          token_type: "bearer",
        },
      },
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any); // Justification: Mock de teste para evitar mismatch de tipos complexos do Supabase Auth.

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("user").textContent).toBe("test@test.com");
    expect(screen.getByTestId("session").textContent).toBe("active");
  });

  it("should subscribe to auth state changes", async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>,
      );
    });

    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
  });

  it("should unsubscribe on unmount", async () => {
    const unsubscribe = vi.fn();
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe, id: "sub", callback: vi.fn() } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any); // Justification: Tactical any for test mock completeness.

    let unmount: () => void;
    await act(async () => {
      const result = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>,
      );
      unmount = result.unmount;
    });

    await act(async () => {
      unmount();
    });
    
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("useAuth throws when used outside AuthProvider", async () => {
    // Suppress React error boundary logs
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<AuthConsumer />)).toThrow(
      "useAuth deve ser usado dentro de um AuthProvider",
    );

    consoleSpy.mockRestore();
  });
});
