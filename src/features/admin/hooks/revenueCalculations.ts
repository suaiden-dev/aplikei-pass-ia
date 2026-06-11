import type { RevenueTab, UnifiedPayment } from "./useRevenuePage";

export type RevenueStatusFilter = "all" | "approved" | "pending";
export type RevenueOfficeRequestStatusFilter = "all" | "pending" | "approved" | "rejected";
export type RevenuePeriodFilter = "all" | "7d" | "30d" | "90d";

export function computeProcessingFee(gross: number, method: string): number {
  const m = method.toUpperCase();
  if (m.includes("ZELLE")) return 0;
  if (m.includes("PIX")) return Math.round(gross * 0.01 * 100) / 100;
  return Math.round((gross * 0.029 + 0.30) * 100) / 100;
}

export function canAccessOfficeRequests(role?: string | null): boolean {
  return role === "master";
}

export function shouldShowPaymentsOfficeField(role?: string | null): boolean {
  return role === "master";
}

export function getGroupedPaymentStatus(status?: string | null): "approved" | "pending" {
  const normalizedStatus = String(status || "").toLowerCase();
  const isApproved = ["paid", "approved", "complete", "completed", "succeeded"].includes(normalizedStatus);
  return isApproved ? "approved" : "pending";
}

function periodToDays(period: RevenuePeriodFilter): number | null {
  if (period === "7d") return 7;
  if (period === "30d") return 30;
  if (period === "90d") return 90;
  return null;
}

export function filterRevenuePayments(
  payments: UnifiedPayment[],
  filters: {
    tab: RevenueTab;
    search: string;
    officeRequestStatusFilter: RevenueOfficeRequestStatusFilter;
    officeRequestPeriodFilter: RevenuePeriodFilter;
    paymentsStatusFilter: RevenueStatusFilter;
    paymentsPeriodFilter: RevenuePeriodFilter;
    now?: Date;
  },
): UnifiedPayment[] {
  const now = filters.now?.getTime() ?? Date.now();

  return payments.filter((p) => {
    if (filters.tab === "office_requests") {
      if (
        filters.officeRequestStatusFilter !== "all" &&
        String(p.status).toLowerCase() !== filters.officeRequestStatusFilter
      ) {
        return false;
      }

      const days = periodToDays(filters.officeRequestPeriodFilter);
      if (days !== null && new Date(p.createdAt).getTime() < now - days * 86400000) return false;
    } else if (filters.tab === "approved_payments") {
      if (filters.paymentsStatusFilter !== "all" && getGroupedPaymentStatus(p.status) !== filters.paymentsStatusFilter) {
        return false;
      }

      const days = periodToDays(filters.paymentsPeriodFilter);
      if (days !== null && new Date(p.createdAt).getTime() < now - days * 86400000) return false;
    }

    if (!filters.search) return true;
    const q = filters.search.toLowerCase();
    return (
      p.clientName.toLowerCase().includes(q) ||
      p.clientEmail.toLowerCase().includes(q) ||
      p.serviceName.toLowerCase().includes(q) ||
      (p.confirmationCode ?? "").toLowerCase().includes(q)
    );
  });
}

export function paginateRevenuePayments<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number,
) {
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const pageStart = (safeCurrentPage - 1) * itemsPerPage;
  const pageEnd = pageStart + itemsPerPage;

  return {
    totalPages,
    safeCurrentPage,
    pageStart,
    pageEnd,
    paginated: items.slice(pageStart, pageEnd),
  };
}
