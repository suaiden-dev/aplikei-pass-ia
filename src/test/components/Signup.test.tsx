import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Signup from "@/pages/Signup";
import { supabase } from "@/integrations/supabase/client";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => {
  const mockAuth = {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    signUp: vi.fn().mockResolvedValue({
      data: { user: { id: "123" }, session: null },
      error: null,
    }),
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

const renderSignup = () => {
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
                <Signup />
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>,
  );
};

describe("Signup Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the signup form", async () => {
    renderSignup();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /criar conta|create account/i }),
      ).toBeTruthy();
    });

    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
  });

  it("submit button is disabled if terms are not accepted", async () => {
    renderSignup();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /cadastrar|create account/i }),
      ).toBeDisabled();
    });
  });

  it("should call signUp when form is filled and terms accepted", async () => {
    renderSignup();

    await waitFor(() => {
      expect(document.querySelector('input[type="email"]')).toBeTruthy();
    });

    const emailInput = document.querySelector(
      'input[type="email"]',
    ) as HTMLInputElement;
    const passwordInput = document.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement;
    const nameInput = document.querySelector(
      'input[id="name"]',
    ) as HTMLInputElement;
    const phoneInput = document.querySelector(
      'input[id="phone"]',
    ) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "pass123" } });
    fireEvent.change(phoneInput, { target: { value: "11999999999" } });

    // Accept terms
    const checkbox = document.querySelector(
      'button[role="checkbox"]',
    ) as HTMLButtonElement;
    fireEvent.click(checkbox);

    const button = screen.getByRole("button", {
      name: /cadastrar|create account/i,
    });
    expect(button).not.toBeDisabled();

    // Submit form
    const form = emailInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "pass123",
        options: {
          data: {
            full_name: "Test User",
            phone: "11999999999",
          },
        },
      });
    });
  });
});
