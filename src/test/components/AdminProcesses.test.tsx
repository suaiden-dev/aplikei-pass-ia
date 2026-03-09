/**
 * AdminProcesses Component Tests
 * Tests the process list rendering, filtering, and de-duplication.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationProvider } from "@/contexts/NotificationContext";
import AdminProcesses from "@/pages/admin/AdminProcesses";
import { supabase } from "@/integrations/supabase/client";

// Mock data
const mockOrders = [
  {
    id: "order-1",
    order_number: "APL-001",
    user_id: "user-1",
    client_name: "Geraldo Basiliano",
    client_email: "geraldo@test.com",
    product_slug: "visto-b1-b2",
    total_price_usd: 200,
    payment_method: "stripe_card",
    payment_status: "paid",
    contract_pdf_url: null,
    contract_selfie_url: null,
    terms_accepted_at: "2024-01-01T00:00:00Z",
    client_ip: "127.0.0.1",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "order-2",
    order_number: "APL-002",
    user_id: "user-2",
    client_name: "Maria Silva",
    client_email: "maria@test.com",
    product_slug: "visto-f1",
    total_price_usd: 350,
    payment_method: "stripe_card",
    payment_status: "paid",
    contract_pdf_url: "url",
    contract_selfie_url: null,
    terms_accepted_at: "2024-02-01T00:00:00Z",
    client_ip: "127.0.0.2",
    created_at: "2024-02-01T00:00:00Z",
  },
];

const mockServices = [
  {
    id: "svc-1",
    user_id: "user-1",
    status: "active",
    service_slug: "visto-b1-b2",
    application_id: null,
    date_of_birth: null,
    grandmother_name: null,
  },
  {
    id: "svc-2",
    user_id: "user-2",
    status: "ds160InProgress",
    service_slug: "visto-f1",
    application_id: "AA001",
    date_of_birth: "1990-01-01",
    grandmother_name: "Ana",
  },
];

// Mock supabase
vi.mock("@/integrations/supabase/client", () => {
  const createChain = (data: any[] = []) => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: data[0], error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: data[0], error: null }),
    then: function (resolve: any) {
      return resolve({ data, error: null });
    },
  });

  let callCount = 0;

  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: "admin", email: "admin@test.com" },
              access_token: "token",
            },
          },
          error: null,
        }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
      },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "visa_orders") {
          return createChain(mockOrders);
        }
        if (table === "user_services") {
          const chain = createChain(mockServices);
          chain.in = vi.fn().mockImplementation(() => {
            return Promise.resolve({ data: mockServices, error: null });
          });
          return chain;
        }
        if (table === "profiles") {
          return createChain([
            { id: "admin", email: "admin@test.com", full_name: "Admin" },
          ]);
        }
        if (table === "notifications") {
          return createChain([]);
        }
        return createChain([]);
      }),
      functions: {
        invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
      },
      storage: {
        from: vi.fn().mockReturnValue({
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "url" } }),
        }),
      },
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      }),
      removeChannel: vi.fn(),
    },
  };
});

const renderAdminProcesses = () => {
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
                <AdminProcesses />
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>,
  );
};

describe("AdminProcesses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", async () => {
    renderAdminProcesses();

    await waitFor(() => {
      expect(screen.getByText("Processos")).toBeTruthy();
    });
  });

  it("should render the update button", async () => {
    renderAdminProcesses();

    await waitFor(() => {
      expect(screen.getByText("Atualizar")).toBeTruthy();
    });
  });

  it("should call supabase.from with visa_orders", async () => {
    renderAdminProcesses();

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("visa_orders");
    });
  });

  it("should render summary cards", async () => {
    renderAdminProcesses();

    await waitFor(() => {
      expect(screen.getByText("Total de pedidos pagos")).toBeTruthy();
      expect(screen.getByText("Com PDF gerado")).toBeTruthy();
      expect(screen.getByText("Sem PDF")).toBeTruthy();
    });
  });
});
