import { describe, expect, it } from "vitest";
import {
  getSellerOverviewMetrics,
  getSellerTopProducts,
  isSameMonth,
  isWithinLastDays,
} from "./calculations";
import type { SellerOrderRow } from "@features/seller/types";

const now = new Date("2026-06-10T12:00:00.000Z");

const order = (
  id: string,
  amount: number,
  createdAt: string,
  productSlug: string,
): SellerOrderRow => ({
  id,
  total_price_usd: amount,
  payment_status: "paid",
  created_at: createdAt,
  client_name: `Client ${id}`,
  product_slug: productSlug,
});

describe("seller overview calculations", () => {
  it("calculates total, current month, last 30 days, average ticket and counts", () => {
    const orders = [
      order("1", 100, "2026-06-01T10:00:00.000Z", "visto-f1"),
      order("2", 200, "2026-06-09T10:00:00.000Z", "visto-b1-b2"),
      order("3", 300, "2026-05-15T10:00:00.000Z", "visto-f1"),
      order("4", 400, "2026-04-01T10:00:00.000Z", "troca-status"),
    ];

    expect(getSellerOverviewMetrics(orders, now)).toEqual({
      totalRevenue: 1000,
      monthRevenue: 300,
      last30DaysRevenue: 600,
      averageTicket: 250,
      monthSales: 2,
      totalSales: 4,
    });
  });

  it("returns zeroed metrics for empty data", () => {
    expect(getSellerOverviewMetrics([], now)).toEqual({
      totalRevenue: 0,
      monthRevenue: 0,
      last30DaysRevenue: 0,
      averageTicket: 0,
      monthSales: 0,
      totalSales: 0,
    });
  });

  it("groups top products by slug and sorts by revenue", () => {
    const orders = [
      order("1", 100, "2026-06-01T10:00:00.000Z", "visto-f1"),
      order("2", 350, "2026-06-02T10:00:00.000Z", "visto-b1-b2"),
      order("3", 250, "2026-06-03T10:00:00.000Z", "visto-f1"),
      order("4", 50, "2026-06-04T10:00:00.000Z", ""),
    ];

    expect(getSellerTopProducts(orders, 2)).toEqual([
      { slug: "visto-f1", count: 2, revenue: 350 },
      { slug: "visto-b1-b2", count: 1, revenue: 350 },
    ]);
  });

  it("handles month and rolling-window boundary checks", () => {
    expect(isSameMonth("2026-06-01T12:00:00.000Z", now)).toBe(true);
    expect(isSameMonth("2026-05-31T12:00:00.000Z", now)).toBe(false);
    expect(isWithinLastDays("2026-05-11T12:00:00.000Z", 30, now)).toBe(true);
    expect(isWithinLastDays("2026-05-10T11:59:59.000Z", 30, now)).toBe(false);
  });
});
