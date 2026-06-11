import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  RiArrowRightLine,
  RiCalendarLine,
  RiCoupon3Line,
  RiLoader4Line,
  RiBarChartBoxLine,
  RiShoppingCartLine,
  RiStore2Line,
} from "react-icons/ri";
import { toast } from "sonner";
import { fetchSellerEarningsData } from "@features/seller/services/earningsService";
import type { SellerOfficeInfo, SellerOrderRow, SellerService } from "@features/seller/types";
import { useAuth } from "@shared/hooks/useAuth";
import { getSellerOverviewMetrics, getSellerTopProducts } from "./calculations";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatCurrency(value: number) {
  return currency.format(Number.isFinite(value) ? value : 0);
}

export default function SellerOverviewPage() {
  const { user } = useAuth();
  const [office, setOffice] = useState<SellerOfficeInfo | null>(null);
  const [services, setServices] = useState<SellerService[]>([]);
  const [orders, setOrders] = useState<SellerOrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await fetchSellerEarningsData({
        sellerId: user.id,
        officeId: user.officeId,
      });
      setOffice(data.office);
      setServices(data.services);
      setOrders(data.orders);
    } catch (err) {
      toast.error("Error loading seller overview.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.officeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const metrics = useMemo(() => getSellerOverviewMetrics(orders), [orders]);
  const topProducts = useMemo(() => getSellerTopProducts(orders), [orders]);

  const recentOrders = orders.slice(0, 6);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RiLoader4Line className="animate-spin text-3xl text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 pb-20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Seller Overview</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-text">Sales workspace</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-text-muted">
            Track your paid sales, recent activity, available products, and next commercial actions.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/seller/coupons"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-black uppercase tracking-widest text-text transition-colors hover:border-primary/40 hover:text-primary"
          >
            <RiCoupon3Line />
            Coupons
          </Link>
          <Link
            to="/seller/earnings"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-primary-hover"
          >
            Earnings
            <RiArrowRightLine />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total revenue"
          value={formatCurrency(metrics.totalRevenue)}
          detail={`${metrics.totalSales} paid sales`}
          icon={<RiBarChartBoxLine />}
        />
        <MetricCard
          label="This month"
          value={formatCurrency(metrics.monthRevenue)}
          detail={`${metrics.monthSales} sales this month`}
          icon={<RiCalendarLine />}
        />
        <MetricCard
          label="Last 30 days"
          value={formatCurrency(metrics.last30DaysRevenue)}
          detail="Rolling paid revenue"
          icon={<RiShoppingCartLine />}
        />
        <MetricCard
          label="Average ticket"
          value={formatCurrency(metrics.averageTicket)}
          detail="Average paid order"
          icon={<RiStore2Line />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-text">Recent sales</h2>
              <p className="mt-1 text-xs font-medium text-text-muted">Latest paid orders linked to your seller account.</p>
            </div>
            <Link to="/seller/earnings" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <EmptyState title="No sales yet" description="Paid orders linked to you will appear here." />
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-text">{order.client_name || "Client"}</p>
                    <p className="mt-1 truncate text-xs font-medium text-text-muted">
                      {order.product_slug} · {new Date(order.created_at).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-black text-success">
                    {formatCurrency(Number(order.total_price_usd) || 0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-text">Seller status</h2>
            <p className="mt-1 text-xs font-medium text-text-muted">Office link and available sales catalog.</p>
          </div>
          <div className="space-y-4 p-6">
            <StatusRow label="Office" value={office?.name ?? "Not linked"} />
            <StatusRow label="Available products" value={String(services.length)} />
            <StatusRow label="Best product" value={topProducts[0]?.slug ?? "No sales yet"} />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <section className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-text">Top products</h2>
            <p className="mt-1 text-xs font-medium text-text-muted">Ranked by paid revenue.</p>
          </div>
          {topProducts.length === 0 ? (
            <EmptyState title="No product ranking yet" description="Product performance starts after your first sale." />
          ) : (
            <div className="divide-y divide-border">
              {topProducts.map((product, index) => (
                <div key={product.slug} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-subtle text-xs font-black text-text-muted">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-text">{product.slug}</p>
                      <p className="mt-1 text-xs font-medium text-text-muted">{product.count} sales</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-black text-text">{formatCurrency(product.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl text-primary">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-text">{value}</p>
      <p className="mt-1 text-xs font-medium text-text-muted">{detail}</p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-bg-subtle px-4 py-3">
      <span className="text-xs font-black uppercase tracking-widest text-text-muted">{label}</span>
      <span className="truncate text-right text-sm font-bold text-text">{value}</span>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm font-black text-text">{title}</p>
      <p className="mt-1 text-xs font-medium text-text-muted">{description}</p>
    </div>
  );
}
