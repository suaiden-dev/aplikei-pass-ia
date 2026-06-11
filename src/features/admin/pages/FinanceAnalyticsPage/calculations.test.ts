import { describe, expect, it } from "vitest";
import {
  filterFinanceTransactions,
  getFinanceOfficeScope,
  getGroupedFinanceStatus,
  getMasterFinanceTotals,
  shouldLoadOfficeSalesMetrics,
  shouldShowFinanceOfficeField,
} from "./calculations";
import type { FinanceTransaction, OfficeSalesMetric } from "@features/admin/services/financeAnalyticsService";

const now = new Date("2026-06-10T12:00:00.000Z");

const tx = (
  id: string,
  overrides: Partial<FinanceTransaction> = {},
): FinanceTransaction => ({
  id,
  clientName: `Client ${id}`,
  clientEmail: `${id}@example.com`,
  officeName: "Office",
  productName: "VISTO F1",
  amount: 100,
  officeNetAmount: 90,
  platformFeeAmount: 10,
  method: "STRIPE",
  createdAt: "2026-06-09T12:00:00.000Z",
  status: "paid",
  ...overrides,
});

describe("finance analytics calculations", () => {
  it.each([
    ["master", null, undefined, true, true],
    ["admin_lawyer", "office-a", "office-a", false, false],
    ["manager", "office-b", "office-b", false, false],
    ["seller", "office-c", "office-c", false, false],
  ])(
    "resolves office scope and office visibility for %s",
    (role, officeId, expectedScope, expectedOfficeField, expectedOfficeMetrics) => {
      expect(getFinanceOfficeScope({ role, officeId })).toBe(expectedScope);
      expect(shouldShowFinanceOfficeField(role)).toBe(expectedOfficeField);
      expect(shouldLoadOfficeSalesMetrics(role)).toBe(expectedOfficeMetrics);
    },
  );

  it.each([
    ["paid", "approved"],
    ["approved", "approved"],
    ["complete", "approved"],
    ["completed", "approved"],
    ["succeeded", "approved"],
    ["pending", "pending"],
    ["failed", "pending"],
  ] as const)("groups %s as %s", (status, expected) => {
    expect(getGroupedFinanceStatus(status)).toBe(expected);
  });

  it("filters transactions by grouped status, method and period", () => {
    const transactions = [
      tx("approved-stripe-recent", { status: "paid", method: "STRIPE", createdAt: "2026-06-09T12:00:00.000Z" }),
      tx("approved-zelle-recent", { status: "approved", method: "ZELLE", createdAt: "2026-06-08T12:00:00.000Z" }),
      tx("pending-stripe-recent", { status: "pending", method: "STRIPE", createdAt: "2026-06-09T12:00:00.000Z" }),
      tx("approved-stripe-old", { status: "paid", method: "STRIPE", createdAt: "2026-04-01T12:00:00.000Z" }),
    ];

    expect(
      filterFinanceTransactions(transactions, {
        statusFilter: "approved",
        methodFilter: "stripe",
        periodFilter: "30d",
        now,
      }).map((item) => item.id),
    ).toEqual(["approved-stripe-recent"]);
  });

  it("calculates master totals from office sales metrics", () => {
    const metrics: OfficeSalesMetric[] = [
      {
        officeId: "office-a",
        officeName: "Office A",
        grossRevenue: 1000,
        officeNetRevenue: 900,
        platformFeeRevenue: 100,
        salesCount: 4,
      },
      {
        officeId: "office-b",
        officeName: "Office B",
        grossRevenue: 500,
        officeNetRevenue: 420,
        platformFeeRevenue: 80,
        salesCount: 2,
      },
    ];

    expect(getMasterFinanceTotals(metrics)).toEqual({
      totalRevenue: 1500,
      totalProfit: 180,
    });
  });
});
