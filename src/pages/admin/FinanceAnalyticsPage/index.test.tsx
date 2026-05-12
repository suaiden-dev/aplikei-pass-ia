import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FinanceAnalyticsPage from "./index";

const serviceMocks = vi.hoisted(() => ({
  getRecentTransactions: vi.fn(),
  getMonthlyAnalytics: vi.fn(),
}));

vi.mock("../../../services/finance-analytics.service", () => ({
  financeAnalyticsService: {
    getRecentTransactions: serviceMocks.getRecentTransactions,
    getMonthlyAnalytics: serviceMocks.getMonthlyAnalytics,
  },
}));

vi.mock("../../../i18n", () => ({
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

describe("FinanceAnalyticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading and then success state", async () => {
    serviceMocks.getMonthlyAnalytics.mockResolvedValueOnce([
      { month: "2026-04", revenue: 1000, profit: 70 },
      { month: "2026-05", revenue: 1500, profit: 105 },
    ]);
    serviceMocks.getRecentTransactions.mockResolvedValueOnce([
      {
        id: "ord-1",
        clientName: "John",
        clientEmail: "john@example.com",
        officeName: "Office A",
        productName: "VISTO B1 B2",
        amount: 250,
        method: "STRIPE",
        createdAt: "2026-05-01T12:00:00.000Z",
        status: "paid",
      },
    ]);

    render(<FinanceAnalyticsPage />);

    expect(screen.getByText("Finance Analytics")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    expect(screen.getByText("VISTO B1 B2")).toBeInTheDocument();
    expect(serviceMocks.getMonthlyAnalytics).toHaveBeenCalledWith(6);
    expect(serviceMocks.getRecentTransactions).toHaveBeenCalledWith(50);
  });

  it("renders empty state when there are no transactions", async () => {
    serviceMocks.getMonthlyAnalytics.mockResolvedValueOnce([{ month: "2026-05", revenue: 0, profit: 0 }]);
    serviceMocks.getRecentTransactions.mockResolvedValueOnce([]);

    render(<FinanceAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("No transactions found for analytics.")).toBeInTheDocument();
    });
  });

  it("renders error state and retries load", async () => {
    serviceMocks.getMonthlyAnalytics.mockRejectedValueOnce(new Error("forbidden"));
    serviceMocks.getRecentTransactions.mockResolvedValue([]);

    render(<FinanceAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load data")).toBeInTheDocument();
    });

    serviceMocks.getMonthlyAnalytics.mockResolvedValueOnce([{ month: "2026-05", revenue: 400, profit: 28 }]);
    serviceMocks.getRecentTransactions.mockResolvedValueOnce([
      {
        id: "ord-2",
        clientName: "Jane",
        clientEmail: "jane@example.com",
        officeName: "Direct",
        productName: "GENERAL",
        amount: 400,
        method: "ZELLE",
        createdAt: "2026-05-02T12:00:00.000Z",
        status: "approved",
      },
    ]);

    await userEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });
  });

  it("opens transaction details modal", async () => {
    serviceMocks.getMonthlyAnalytics.mockResolvedValueOnce([{ month: "2026-05", revenue: 500, profit: 35 }]);
    serviceMocks.getRecentTransactions.mockResolvedValueOnce([
      {
        id: "ord-3",
        clientName: "Alice",
        clientEmail: "alice@example.com",
        officeName: "Office B",
        productName: "F1",
        amount: 500,
        method: "CARD",
        createdAt: "2026-05-03T12:00:00.000Z",
        status: "completed",
      },
    ]);

    render(<FinanceAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Details" }));

    expect(screen.getByText("Transaction Details")).toBeInTheDocument();
    expect(screen.getByText("ID: ord-3")).toBeInTheDocument();
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
  });
});
