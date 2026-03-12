import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  FileText,
  ExternalLink,
  RefreshCw,
  Download,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminStatusTimeline } from "@/components/admin/AdminStatusTimeline";

interface ContractOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  client_name: string;
  client_email: string;
  product_slug: string;
  total_price_usd: number;
  payment_method: string;
  payment_status: string;
  contract_pdf_url: string | null;
  contract_selfie_url: string | null;
  terms_accepted_at: string | null;
  client_ip: string | null;
  created_at: string;
  service_status?: string;
  user_service_id?: string;
  application_id?: string;
  date_of_birth?: string;
  grandmother_name?: string;
  is_second_attempt?: boolean;
}

export default function AdminContracts() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ContractOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("visa_orders")
        .select(
          "id, order_number, user_id, client_name, client_email, product_slug, total_price_usd, payment_method, payment_status, contract_pdf_url, contract_selfie_url, terms_accepted_at, client_ip, created_at",
        )
        .eq("payment_status", "paid")
        .in("product_slug", [
          "visto-b1-b2",
          "visto-f1",
          "extensao-status",
          "guia-visto-consular-b1b2",
        ])
        .order("created_at", { ascending: false });

      if (error) throw error;
      const allOrders = data || [];

      // Fetch ALL service statuses for all users in orders
      const { data: services, error: servicesError } = await supabase
        .from("user_services")
        .select(
          "id, user_id, status, service_slug, application_id, date_of_birth, grandmother_name, created_at, is_second_attempt",
        )
        .in("user_id", allOrders.map((o) => o.user_id).filter(Boolean))
        .order("created_at", { ascending: true });

      if (servicesError) {
        console.error("Erro ao buscar status dos serviços:", servicesError);
      }

      // Track which services have already been mapped to an order to avoid reusing them
      const usedServiceIds = new Set<string>();

      const ordersWithStatus = (allOrders as ContractOrder[]).map(
        (order) => {
          // Find the best service match for this order
          const matchingServices = (services || [])
            .filter(
              (s) =>
                s.user_id === order.user_id &&
                s.service_slug === order.product_slug &&
                !usedServiceIds.has(s.id)
            )
            .sort((a, b) => {
              const diffA = Math.abs(new Date(a.created_at).getTime() - new Date(order.created_at).getTime());
              const diffB = Math.abs(new Date(b.created_at).getTime() - new Date(order.created_at).getTime());
              return diffA - diffB;
            });

          const service = matchingServices[0];
          if (service) usedServiceIds.add(service.id);

          return {
            ...order,
            service_status: service?.status,
            user_service_id: service?.id,
            application_id: service?.application_id,
            date_of_birth: service?.date_of_birth,
            grandmother_name: service?.grandmother_name,
            is_second_attempt: (service as any)?.is_second_attempt || false,
          };
        },
      );

      setOrders(ordersWithStatus ?? []);
    } catch (err: any) {
      console.error("Erro ao buscar contratos:", err);
      toast({ title: "Erro ao carregar contratos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRegeneratePdf = async (order: ContractOrder) => {
    setRegeneratingId(order.id);
    try {
      // Limpa o PDF atual para forçar regeneração
      await supabase
        .from("visa_orders")
        .update({ contract_pdf_url: null })
        .eq("id", order.id);

      const { error } = await supabase.functions.invoke(
        "generate-contract-pdf",
        {
          body: { order_id: order.id },
        },
      );

      if (error) throw error;

      toast({
        title: `PDF do pedido ${order.order_number} regenerado com sucesso!`,
      });
      fetchOrders();
    } catch (err: any) {
      console.error("Erro ao regenerar PDF:", err);
      toast({
        title: "Erro ao regenerar PDF",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setRegeneratingId(null);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const totalWithPdf = orders.filter((o) => o.contract_pdf_url).length;
  const totalWithoutPdf = orders.filter((o) => !o.contract_pdf_url).length;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-title font-bold text-foreground">
            Processos
          </h2>
          <p className="mt-1 text-muted-foreground">
            Contratos gerados automaticamente após confirmação de pagamento.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Total de pedidos pagos
          </p>
          <p className="mt-1 text-title font-bold text-foreground">
            {orders.length}
          </p>
        </div>
        <div className="rounded-md border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20 p-4">
          <p className="text-sm text-green-700 dark:text-green-400">
            Com PDF gerado
          </p>
          <p className="mt-1 text-title font-bold text-green-700 dark:text-green-400">
            {totalWithPdf}
          </p>
        </div>
        <div className="rounded-md border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20 p-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Sem PDF
          </p>
          <p className="mt-1 text-title font-bold text-yellow-700 dark:text-yellow-400">
            {totalWithoutPdf}
          </p>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-md bg-card">
        <AdminDataTable
          loading={loading}
          data={orders}
          onRowClick={(item) => navigate(`/admin/contratos/${item.id}`)}
          columns={[
            { key: "client_name", header: "Cliente" },
            {
              key: "product_slug",
              header: "Serviço",
              render: (item) => (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-xs">
                    {item.product_slug?.replace(/-/g, " ")}
                  </Badge>
                  {item.is_second_attempt && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 font-bold text-[10px] uppercase">
                      2ª Tentativa
                    </Badge>
                  )}
                </div>
              ),
            },
            {
              key: "payment_method",
              header: "Pagamento",
              render: (item) => (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs capitalize font-medium">
                    {item.payment_method?.replace(/_/g, " ") || "—"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formatCurrency(item.total_price_usd)}
                  </span>
                </div>
              ),
            },
            {
              key: "fluxo",
              header: "Fluxo",
              render: (item) => (
                <AdminStatusTimeline status={item.service_status} />
              ),
            },
          ]}
          searchKeys={["order_number", "client_name", "client_email"]}
          searchPlaceholder="Buscar por pedido, cliente ou e-mail..."
          pageSize={20}
        />
      </div>
    </div>
  );
}
