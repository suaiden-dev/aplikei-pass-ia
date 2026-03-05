import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Users, DollarSign, CreditCard, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalOrders: number;
  totalClients: number;
  totalRevenue: number;
  pendingPayments: number;
  activeSellers: number;
  pendingPartners: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  client_name: string;
  product_slug: string;
  total_price_usd: number;
  payment_status: string;
  payment_method: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch counts in parallel
      const [clientsRes, paidOrdersRes, pendingZelleRes] = await Promise.all([
        supabase
          .from("profiles") // Corrigido de "clients" para "profiles"
          .select("id", { count: "exact", head: true }),
        supabase
          .from("visa_orders")
          .select("total_price_usd")
          .eq("payment_status", "paid")
          .eq("is_test", false),
        supabase
          .from("zelle_payments")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending_verification"),
      ]);

      const totalRevenue =
        paidOrdersRes.data?.reduce(
          (sum, o) => sum + Number(o.total_price_usd || 0),
          0,
        ) ?? 0;

      setStats({
        totalOrders: 0,
        totalClients: clientsRes.count ?? 0,
        totalRevenue,
        pendingPayments: pendingZelleRes.count ?? 0,
        activeSellers: 0, // Funcionalidade ainda não implementada
        pendingPartners: 0, // Funcionalidade ainda não implementada
      });
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      paid: {
        label: "Pago",
        cls: "bg-green-100 text-green-700",
      },
      pending: {
        label: "Pendente",
        cls: "bg-yellow-100 text-yellow-700",
      },
      failed: {
        label: "Falhou",
        cls: "bg-red-100 text-red-700",
      },
    };
    const s = map[status] ?? {
      label: status,
      cls: "bg-gray-100 text-gray-600",
    };
    return (
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}
      >
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Visão Geral
        </h2>
        <p className="mt-1 text-muted-foreground">
          Resumo da plataforma em tempo real.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AdminStatCard
          title="Clientes"
          value={stats?.totalClients ?? 0}
          icon={<Users className="h-5 w-5" />}
        />
        <AdminStatCard
          title="Receita Total"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          description="Pedidos com status paid"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <AdminStatCard
          title="Pagamentos Pendentes"
          value={stats?.pendingPayments ?? 0}
          description="Zelle aguardando verificação"
          icon={<CreditCard className="h-5 w-5" />}
        />
        <AdminStatCard
          title="Sellers Ativos"
          value={stats?.activeSellers ?? 0}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <AdminStatCard
          title="Parceiros Pendentes"
          value={stats?.pendingPartners ?? 0}
          description="Aguardando aprovação"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}
