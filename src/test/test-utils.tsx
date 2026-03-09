/**
 * Custom render function that wraps components with all required providers.
 * Use this instead of @testing-library/react's render in all tests.
 *
 * Usage:
 *   import { render, screen } from "@/test/test-utils";
 */
import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { TooltipProvider } from "@/components/ui/tooltip";

// Create a fresh QueryClient for each test to avoid shared state
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
}

/**
 * Custom render that wraps the component with all app providers.
 * Auth is NOT included here because tests should mock it at the supabase level.
 */
const customRender = (
  ui: ReactElement,
  { route = "/", ...renderOptions }: CustomRenderOptions = {},
) => {
  window.history.pushState({}, "Test page", route);

  const queryClient = createTestQueryClient();

  const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: AllProviders, ...renderOptions }),
    queryClient,
  };
};

// Re-export everything from testing library
export * from "@testing-library/react";

// Override render with our custom version
export { customRender as render };
