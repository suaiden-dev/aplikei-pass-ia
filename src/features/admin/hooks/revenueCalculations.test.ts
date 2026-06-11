import { describe, expect, it } from "vitest";
import {
  canAccessOfficeRequests,
  computeProcessingFee,
  filterRevenuePayments,
  getGroupedPaymentStatus,
  paginateRevenuePayments,
  shouldShowPaymentsOfficeField,
} from "./revenueCalculations";
import type { UnifiedPayment } from "./useRevenuePage";

const now = new Date("2026-06-10T12:00:00.000Z");

const payment = (
  id: string,
  overrides: Partial<UnifiedPayment> = {},
): UnifiedPayment => ({
  id,
  source: "order",
  clientName: `Client ${id}`,
  clientEmail: `${id}@example.com`,
  serviceName: "VISTO F1",
  serviceSlug: "visto-f1",
  amount: 100,
  method: "STRIPE",
  createdAt: "2026-06-09T12:00:00.000Z",
  status: "paid",
  ...overrides,
});

describe("revenue payments calculations", () => {
  it.each([
    ["master", true, true],
    ["admin_lawyer", false, false],
    ["manager", false, false],
    ["seller", false, false],
  ])("resolves office request access and office field visibility for %s", (role, expectedAccess, expectedField) => {
    expect(canAccessOfficeRequests(role)).toBe(expectedAccess);
    expect(shouldShowPaymentsOfficeField(role)).toBe(expectedField);
  });

  it("calculates payment processing fees by method", () => {
    expect(computeProcessingFee(100, "zelle")).toBe(0);
    expect(computeProcessingFee(100, "pix")).toBe(1);
    expect(computeProcessingFee(100, "stripe")).toBe(3.2);
  });

  it.each([
    ["paid", "approved"],
    ["approved", "approved"],
    ["complete", "approved"],
    ["completed", "approved"],
    ["succeeded", "approved"],
    ["pending", "pending"],
    ["rejected", "pending"],
  ] as const)("groups %s payments as %s", (status, expected) => {
    expect(getGroupedPaymentStatus(status)).toBe(expected);
  });

  it("filters approved payments by status, period and search", () => {
    const payments = [
      payment("paid-f1", { status: "paid", serviceName: "VISTO F1", createdAt: "2026-06-09T12:00:00.000Z" }),
      payment("pending-f1", { status: "pending", serviceName: "VISTO F1", createdAt: "2026-06-09T12:00:00.000Z" }),
      payment("paid-b1", { status: "paid", serviceName: "VISTO B1 B2", createdAt: "2026-06-09T12:00:00.000Z" }),
      payment("paid-old", { status: "paid", serviceName: "VISTO F1", createdAt: "2026-04-01T12:00:00.000Z" }),
    ];

    expect(
      filterRevenuePayments(payments, {
        tab: "approved_payments",
        search: "f1",
        officeRequestStatusFilter: "all",
        officeRequestPeriodFilter: "all",
        paymentsStatusFilter: "approved",
        paymentsPeriodFilter: "30d",
        now,
      }).map((item) => item.id),
    ).toEqual(["paid-f1"]);
  });

  it("filters office requests by status and period", () => {
    const payments = [
      payment("pending-recent", { source: "withdrawal", status: "pending", createdAt: "2026-06-09T12:00:00.000Z" }),
      payment("approved-recent", { source: "withdrawal", status: "approved", createdAt: "2026-06-09T12:00:00.000Z" }),
      payment("pending-old", { source: "withdrawal", status: "pending", createdAt: "2026-04-01T12:00:00.000Z" }),
    ];

    expect(
      filterRevenuePayments(payments, {
        tab: "office_requests",
        search: "",
        officeRequestStatusFilter: "pending",
        officeRequestPeriodFilter: "30d",
        paymentsStatusFilter: "all",
        paymentsPeriodFilter: "all",
        now,
      }).map((item) => item.id),
    ).toEqual(["pending-recent"]);
  });

  it("calculates safe pagination and slices the selected page", () => {
    const items = Array.from({ length: 25 }, (_, index) => index + 1);

    expect(paginateRevenuePayments(items, 3, 10)).toEqual({
      totalPages: 3,
      safeCurrentPage: 3,
      pageStart: 20,
      pageEnd: 30,
      paginated: [21, 22, 23, 24, 25],
    });

    expect(paginateRevenuePayments(items, 99, 10).safeCurrentPage).toBe(3);
    expect(paginateRevenuePayments(items, 0, 10).safeCurrentPage).toBe(1);
  });
});
