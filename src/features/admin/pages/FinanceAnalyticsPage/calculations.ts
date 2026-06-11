import type { FinanceTransaction, OfficeSalesMetric } from "@features/admin/services/financeAnalyticsService";
import type { UserRole } from "@features/auth/types";

export type FinanceStatusFilter = "all" | "approved" | "pending";
export type FinanceMethodFilter = "all" | "stripe" | "zelle";
export type FinancePeriodFilter = "all" | "7d" | "30d" | "90d";

export interface FinanceRoleUser {
  role?: UserRole | string | null;
  officeId?: string | null;
}

export function getFinanceOfficeScope(user?: FinanceRoleUser | null): string | undefined {
  return user?.role === "admin_lawyer" || user?.role === "manager" || user?.role === "seller"
    ? user.officeId || undefined
    : undefined;
}

export function shouldShowFinanceOfficeField(role?: string | null): boolean {
  return role === "master";
}

export function shouldLoadOfficeSalesMetrics(role?: string | null): boolean {
  return role === "master";
}

export function getGroupedFinanceStatus(status?: string | null): "approved" | "pending" {
  const normalized = String(status || "").toLowerCase();
  return ["paid", "approved", "complete", "completed", "succeeded"].includes(normalized)
    ? "approved"
    : "pending";
}

function periodToDays(period: FinancePeriodFilter): number | null {
  if (period === "7d") return 7;
  if (period === "30d") return 30;
  if (period === "90d") return 90;
  return null;
}

export function filterFinanceTransactions(
  transactions: FinanceTransaction[],
  filters: {
    statusFilter: FinanceStatusFilter;
    methodFilter: FinanceMethodFilter;
    periodFilter: FinancePeriodFilter;
    now?: Date;
  },
): FinanceTransaction[] {
  const now = filters.now?.getTime() ?? Date.now();
  const days = periodToDays(filters.periodFilter);
  const cutoff = days === null ? null : now - days * 24 * 60 * 60 * 1000;

  return transactions.filter((tx) => {
    if (filters.statusFilter !== "all" && getGroupedFinanceStatus(tx.status) !== filters.statusFilter) return false;

    const method = String(tx.method || "").toLowerCase();
    if (filters.methodFilter !== "all" && method !== filters.methodFilter) return false;

    if (cutoff !== null) {
      const createdAt = new Date(tx.createdAt).getTime();
      if (createdAt < cutoff) return false;
    }

    return true;
  });
}

export function getMasterFinanceTotals(officeSalesMetrics: OfficeSalesMetric[]) {
  return {
    totalRevenue: officeSalesMetrics.reduce((sum, item) => sum + item.grossRevenue, 0),
    totalProfit: officeSalesMetrics.reduce((sum, item) => sum + item.platformFeeRevenue, 0),
  };
}
