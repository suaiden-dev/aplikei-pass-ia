import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FinanceAnalyticsPage from "./index";

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

const serviceMocks = vi.hoisted(() => ({
  getRecentTransactions: vi.fn(),
  getMonthlyAnalytics: vi.fn(),
  getRoleActions: vi.fn(),
  getRoleActorMetrics: vi.fn(),
  getOfficeSalesMetricsByDateRange: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  user: { role: "master", officeId: null } as { role: string; officeId?: string | null },
}));

vi.mock("@features/admin/services/financeAnalyticsService", () => ({
  financeAnalyticsService: {
    getRecentTransactions: serviceMocks.getRecentTransactions,
    getMonthlyAnalytics: serviceMocks.getMonthlyAnalytics,
    getRoleActions: serviceMocks.getRoleActions,
    getRoleActorMetrics: serviceMocks.getRoleActorMetrics,
    getOfficeSalesMetricsByDateRange: serviceMocks.getOfficeSalesMetricsByDateRange,
  },
}));

vi.mock("@app/app/i18n", () => ({
  useT: () => ({
    financeAnalytics: {
      title: "Finance Analytics",
      masterOnly: "Master Only",
      subtitle: "Advanced platform performance and profit tracking",
      charts: {
        revenueGrowth: "Revenue Growth",
        revenueVsProfit: "Revenue vs Profit",
        revenueLegend: "Revenue",
        profitLegend: "Profit",
      },
      table: {
        title: "Recent Transactions",
        growthBadge: "+12.5% this month",
        customer: "Customer",
        office: "Office",
        product: "Product",
        amount: "Amount",
        method: "Method",
        action: "Action",
        details: "Details",
        empty: "No transactions found for analytics.",
      },
      states: {
        loadErrorTitle: "Failed to load data",
        retry: "Retry",
      },
      modal: {
        title: "Transaction Details",
        customer: "Customer",
        office: "Office",
        product: "Product",
        total: "Total",
        statusMethod: "Status / Method",
        close: "Close",
      },
    },
  }),
}));

vi.mock("@shared/hooks/useAuth", () => ({
  useAuth: () => ({
    user: authMocks.user,
  }),
}));

describe("FinanceAnalyticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.user = { role: "master", officeId: null };
    serviceMocks.getRoleActions.mockResolvedValue([]);
    serviceMocks.getRoleActorMetrics.mockResolvedValue([]);
    serviceMocks.getOfficeSalesMetricsByDateRange.mockResolvedValue([]);
  });

  it("renders loading and then success state", async () => {
    serviceMocks.getMonthlyAnalytics.mockResolvedValue([
      { month: "2026-04", revenue: 1000, profit: 70 },
      { month: "2026-05", revenue: 1500, profit: 105 },
    ]);
    serviceMocks.getRecentTransactions.mockResolvedValue([
      {
        id: "ord-1",
        clientName: "John",
        clientEmail: "john@example.com",
        officeName: "Office A",
        productName: "VISTO B1 B2",
        amount: 250,
        officeNetAmount: 225,
        platformFeeAmount: 25,
        method: "STRIPE",
        createdAt: "2026-05-01T12:00:00.000Z",
        status: "paid",
      },
    ]);

    renderWithProviders(<FinanceAnalyticsPage />);

    expect(screen.getByText("Finance Analytics")).toBeInTheDocument();

    await screen.findAllByText("john@example.com");

    expect(screen.getAllByText("VISTO B1 B2").length).toBeGreaterThan(0);
    expect(serviceMocks.getMonthlyAnalytics).toHaveBeenCalledWith(6, undefined);
    expect(serviceMocks.getRecentTransactions).toHaveBeenCalledWith(50, undefined);
  });

  it("renders empty state when there are no transactions", async () => {
    serviceMocks.getMonthlyAnalytics.mockResolvedValue([{ month: "2026-05", revenue: 0, profit: 0 }]);
    serviceMocks.getRecentTransactions.mockResolvedValue([]);

    renderWithProviders(<FinanceAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("No transactions found for analytics.")).toBeInTheDocument();
    });
  });

  it("renders error state and retries load", async () => {
    serviceMocks.getMonthlyAnalytics.mockRejectedValue(new Error("forbidden"));
    serviceMocks.getRecentTransactions.mockResolvedValue([]);

    renderWithProviders(<FinanceAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load data")).toBeInTheDocument();
    });

    serviceMocks.getMonthlyAnalytics.mockResolvedValue([{ month: "2026-05", revenue: 400, profit: 28 }]);
    serviceMocks.getRecentTransactions.mockResolvedValue([
      {
        id: "ord-2",
        clientName: "Jane",
        clientEmail: "jane@example.com",
        officeName: "Direct",
        productName: "GENERAL",
        amount: 400,
        officeNetAmount: 360,
        platformFeeAmount: 40,
        method: "ZELLE",
        createdAt: "2026-05-02T12:00:00.000Z",
        status: "approved",
      },
    ]);

    await userEvent.click(screen.getByRole("button", { name: "Retry" }));

    await screen.findAllByText("jane@example.com");
  });

  it("opens transaction details modal", async () => {
    serviceMocks.getMonthlyAnalytics.mockResolvedValue([{ month: "2026-05", revenue: 500, profit: 35 }]);
    serviceMocks.getRecentTransactions.mockResolvedValue([
      {
        id: "ord-3",
        clientName: "Alice",
        clientEmail: "alice@example.com",
        officeName: "Office B",
        productName: "F1",
        amount: 500,
        officeNetAmount: 450,
        platformFeeAmount: 50,
        method: "CARD",
        createdAt: "2026-05-03T12:00:00.000Z",
        status: "completed",
      },
    ]);

    renderWithProviders(<FinanceAnalyticsPage />);

    await screen.findAllByText("alice@example.com");

    await userEvent.click(screen.getAllByRole("button", { name: "Details" })[0]);

    expect(screen.getByText("Transaction Details")).toBeInTheDocument();
    expect(screen.getByText("ID: ord-3")).toBeInTheDocument();
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
  });

  it("shows Office column and master office metrics only for master", async () => {
    authMocks.user = { role: "master", officeId: null };
    serviceMocks.getMonthlyAnalytics.mockResolvedValue([{ month: "2026-05", revenue: 500, profit: 35 }]);
    serviceMocks.getRecentTransactions.mockResolvedValue([
      {
        id: "ord-master",
        clientName: "Master Client",
        clientEmail: "master@example.com",
        officeName: "Office Master",
        productName: "F1",
        amount: 500,
        officeNetAmount: 450,
        platformFeeAmount: 50,
        method: "CARD",
        createdAt: "2026-05-03T12:00:00.000Z",
        status: "completed",
      },
    ]);
    serviceMocks.getOfficeSalesMetricsByDateRange.mockResolvedValue([
      {
        officeId: "office-master",
        officeName: "Office Master",
        grossRevenue: 500,
        officeNetRevenue: 450,
        platformFeeRevenue: 50,
        salesCount: 1,
      },
    ]);

    renderWithProviders(<FinanceAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByRole("columnheader", { name: "Office" })).toBeInTheDocument();
    });
    expect(screen.getByText("Top Offices by Sales")).toBeInTheDocument();
    expect(serviceMocks.getRecentTransactions).toHaveBeenCalledWith(50, undefined);
    expect(serviceMocks.getMonthlyAnalytics).toHaveBeenCalledWith(6, undefined);
    expect(serviceMocks.getOfficeSalesMetricsByDateRange).toHaveBeenCalled();
  });

  it.each([
    ["admin_lawyer", "office-lawyer"],
    ["manager", "office-manager"],
    ["seller", "office-seller"],
  ])("hides Office column and scopes analytics for %s", async (role, officeId) => {
    authMocks.user = { role, officeId };
    serviceMocks.getMonthlyAnalytics.mockResolvedValue([{ month: "2026-05", revenue: 500, profit: 35 }]);
    serviceMocks.getRecentTransactions.mockResolvedValue([
      {
        id: `ord-${role}`,
        clientName: "Scoped Client",
        clientEmail: `${role}@example.com`,
        officeName: "Hidden Office",
        productName: "F1",
        amount: 500,
        officeNetAmount: 450,
        platformFeeAmount: 50,
        method: "CARD",
        createdAt: "2026-05-03T12:00:00.000Z",
        status: "completed",
      },
    ]);

    renderWithProviders(<FinanceAnalyticsPage />);

    await screen.findAllByText(`${role}@example.com`);

    expect(screen.queryByText("Top Offices by Sales")).not.toBeInTheDocument();
    expect(serviceMocks.getRecentTransactions).toHaveBeenCalledWith(50, officeId);
    expect(serviceMocks.getMonthlyAnalytics).toHaveBeenCalledWith(6, officeId);
    expect(serviceMocks.getOfficeSalesMetricsByDateRange).not.toHaveBeenCalled();
  });
});
