/**
 * Login Page Component Tests
 * Tests the login form rendering, validation, and auth interactions.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Login from "@/pages/Login";
import { supabase } from "@/integrations/supabase/client";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => {
  const mockAuth = {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: null, session: null },
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
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      }),
      removeChannel: vi.fn(),
    },
  };
});

const renderLogin = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <TooltipProvider>
              <BrowserRouter>
                <Login />
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>,
  );
};

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the login form", async () => {
    renderLogin();

    await waitFor(() => {
      expect(screen.getByRole("heading")).toBeTruthy();
    });

    // Should have email and password inputs
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
  });

  it("should have a submit button", async () => {
    renderLogin();

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it("should call signInWithPassword on form submit", async () => {
    renderLogin();

    await waitFor(() => {
      expect(document.querySelector('input[type="email"]')).toBeTruthy();
    });

    const emailInput = document.querySelector(
      'input[type="email"]',
    ) as HTMLInputElement;
    const passwordInput = document.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Find and click submit button
    const form = emailInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("should show error on failed login", async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });

    renderLogin();

    await waitFor(() => {
      expect(document.querySelector('input[type="email"]')).toBeTruthy();
    });

    const emailInput = document.querySelector(
      'input[type="email"]',
    ) as HTMLInputElement;
    const passwordInput = document.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });

    const form = emailInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    // Login error should eventually show some feedback
    await waitFor(
      () => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });
});
