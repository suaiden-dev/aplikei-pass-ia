import type { SellerOrderRow } from "@features/seller/types";

export interface SellerOverviewMetrics {
  totalRevenue: number;
  monthRevenue: number;
  last30DaysRevenue: number;
  averageTicket: number;
  monthSales: number;
  totalSales: number;
}

export interface SellerTopProduct {
  slug: string;
  count: number;
  revenue: number;
}

export function isSameMonth(dateValue: string, now = new Date()): boolean {
  const date = new Date(dateValue);
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

export function isWithinLastDays(dateValue: string, days: number, now = new Date()): boolean {
  const date = new Date(dateValue).getTime();
  const threshold = now.getTime() - days * 24 * 60 * 60 * 1000;
  return Number.isFinite(date) && date >= threshold;
}

export function getSellerOverviewMetrics(
  orders: SellerOrderRow[],
  now = new Date(),
): SellerOverviewMetrics {
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_price_usd) || 0), 0);
  const monthOrders = orders.filter((order) => isSameMonth(order.created_at, now));
  const monthRevenue = monthOrders.reduce((sum, order) => sum + (Number(order.total_price_usd) || 0), 0);
  const last30DaysRevenue = orders
    .filter((order) => isWithinLastDays(order.created_at, 30, now))
    .reduce((sum, order) => sum + (Number(order.total_price_usd) || 0), 0);
  const averageTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

  return {
    totalRevenue,
    monthRevenue,
    last30DaysRevenue,
    averageTicket,
    monthSales: monthOrders.length,
    totalSales: orders.length,
  };
}

export function getSellerTopProducts(orders: SellerOrderRow[], limit = 4): SellerTopProduct[] {
  const bySlug = new Map<string, SellerTopProduct>();

  orders.forEach((order) => {
    const slug = order.product_slug || "unknown";
    const current = bySlug.get(slug) ?? { slug, count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += Number(order.total_price_usd) || 0;
    bySlug.set(slug, current);
  });

  return Array.from(bySlug.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
