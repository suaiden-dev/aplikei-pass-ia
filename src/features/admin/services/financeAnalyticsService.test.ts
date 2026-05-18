import { beforeEach, describe, expect, it, vi } from "vitest";
import { financeAnalyticsService } from "./financeAnalyticsService";
import { supabase } from "@shared/lib/supabase";

vi.mock("@shared/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

describe("financeAnalyticsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps monthly analytics rpc payload", async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: [
        { month: "2026-01", revenue_usd: "1000.50", profit_usd: "70.04" },
        { month: "2026-02", revenue_usd: 0, profit_usd: 0 },
      ],
      error: null,
    } as any);

    const result = await financeAnalyticsService.getMonthlyAnalytics(6);

    expect(result).toEqual([
      { month: "2026-01", revenue: 1000.5, profit: 70.04 },
      { month: "2026-02", revenue: 0, profit: 0 },
    ]);
    expect(supabase.rpc).toHaveBeenCalledWith("get_finance_analytics", { p_months: 6 });
  });

  it("throws when monthly analytics rpc fails", async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: null,
      error: { message: "forbidden" },
    } as any);

    await expect(financeAnalyticsService.getMonthlyAnalytics(6)).rejects.toThrow(
      "Erro ao carregar analytics mensais: forbidden",
    );
  });

  it("maps recent transactions view payload", async () => {
    const limitMock = vi.fn().mockResolvedValue({
      data: [
        {
          id: "ord-1",
          created_at: "2026-05-01T12:00:00.000Z",
          client_name: "John",
          client_email: "john@example.com",
          office_name: "Office A",
          product_slug: "visto-b1-b2",
          total_price_usd: "250",
          payment_method: "stripe",
          payment_status: "paid",
        },
      ],
      error: null,
    });

    const orderMock = vi.fn().mockReturnValue({ limit: limitMock });
    const inMock = vi.fn().mockReturnValue({ order: orderMock });
    const selectMock = vi.fn().mockReturnValue({ in: inMock });

    vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as any);

    const result = await financeAnalyticsService.getRecentTransactions(50);

    expect(result).toEqual([
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
    expect(supabase.from).toHaveBeenCalledWith("v_finance_transactions_master");
  });

  it("throws when recent transactions query fails", async () => {
    const limitMock = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "query failed" },
    });
    const orderMock = vi.fn().mockReturnValue({ limit: limitMock });
    const inMock = vi.fn().mockReturnValue({ order: orderMock });
    const selectMock = vi.fn().mockReturnValue({ in: inMock });

    vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as any);

    await expect(financeAnalyticsService.getRecentTransactions(50)).rejects.toThrow(
      "Erro ao carregar transações recentes: query failed",
    );
  });
});
