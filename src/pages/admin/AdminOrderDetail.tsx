import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/presentation/components/atoms/button";
import { Badge } from "@/presentation/components/atoms/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/atoms/card";
import { useToast } from "@/presentation/components/atoms/use-toast";
import {
  ChevronLeft,
  User,
  CreditCard,
  FileText,
  CheckCircle2,
  XCircle,
  Info,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import { Skeleton } from "@/presentation/components/atoms/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/atoms/select";
import { Textarea } from "@/presentation/components/atoms/textarea";

interface OrderDetail {
  id: string;
  order_number: string;
  client_name: string;
  client_email: string;
  client_whatsapp: string | null;
  client_country: string | null;
  client_nationality: string | null;
  product_slug: string;
  total_price_usd: number;
  payment_status: string;
  payment_method: string | null;
  seller_id: string | null;
  created_at: string;
  contract_approval_status: string | null;
  contract_rejection_reason: string | null;
  annex_approval_status: string | null;
  annex_rejection_reason: string | null;
  number_of_dependents: number | null;
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [sellerName, setSellerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    setLoading(true);
    try {
      // Justification: Usando 'any' tático para quebrar a recursão excessiva de tipos do Supabase (deep instantiation).
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const { data, error } = await ((supabase as any)
        .from("visa_orders")
        .select("*")
        .eq("id", id)
        .single() as Promise<{ data: any | null; error: Error | null }>);
      /* eslint-enable @typescript-eslint/no-explicit-any */

      if (error) throw error;
      setOrder(data as unknown as OrderDetail);

      if ((data as Record<string, unknown>).seller_id) {
        // Justification: Usando 'any' tático para evitar recursão profunda de tipos.
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const { data: seller } = await ((supabase as any)
          .from("sellers")
          .select("full_name")
          .eq("id", (data as Record<string, unknown>).seller_id as string)
          .single() as Promise<{ data: any | null; error: Error | null }>);
        /* eslint-enable @typescript-eslint/no-explicit-any */
        if (seller) setSellerName((seller as unknown as { full_name: string }).full_name);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes:", error);
      toast({ title: "Erro ao carregar detalhes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    if (id) fetchOrderDetail();
  }, [id, fetchOrderDetail]);

  const handleUpdateStatus = async (
    field: string,
    status: string,
    reason?: string,
  ) => {
    setUpdating(true);
    try {
      const updates: Record<string, string | null> = { [field]: status };
      if (reason !== undefined) {
        const reasonField =
          field === "contract_approval_status"
            ? "contract_rejection_reason"
            : "annex_rejection_reason";
        updates[reasonField] = reason;
      }

      const { error } = await supabase
        .from("visa_orders")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Operação realizada com sucesso!" });
      fetchOrderDetail();
      setRejectionReason("");
    } catch (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const formatDate = (date: string) => new Date(date).toLocaleString("pt-BR");

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!order) return <div>Pedido não encontrado.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/pedidos")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-display text-title font-bold text-foreground">
            Pedido #{order.order_number}
          </h2>
          <p className="text-sm text-muted-foreground">
            Criado em {formatDate(order.created_at || "")}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge
            variant={order.payment_status === "paid" ? "default" : "secondary"}
          >
            Pagamento: {order.payment_status === "paid" ? "Pago" : "Pendente"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Coluna Principal */}
        <div className="space-y-4 lg:col-span-2">
          {/* Resumo do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Produto
                </p>
                <p className="font-medium capitalize">
                  {order.product_slug.replace(/-/g, " ")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Dependentes
                </p>
                <p className="font-medium">{order.number_of_dependents || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Valor Total
                </p>
                <p className="text-subtitle font-bold text-primary">
                  {formatCurrency(order.total_price_usd)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Método de Pagamento
                </p>
                <p className="font-medium">
                  {order.payment_method || "Não informado"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contratos e Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Aprovações e Contratos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status do Contrato */}
              <div className="rounded-md border p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">Contrato de Serviço</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          order.contract_approval_status === "approved"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {order.contract_approval_status || "Aguardando"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() =>
                        handleUpdateStatus(
                          "contract_approval_status",
                          "approved",
                        )
                      }
                      disabled={
                        updating ||
                        order.contract_approval_status === "approved"
                      }
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() =>
                        handleUpdateStatus(
                          "contract_approval_status",
                          "rejected",
                          rejectionReason,
                        )
                      }
                      disabled={updating}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Rejeitar
                    </Button>
                  </div>
                </div>
                {order.contract_rejection_reason && (
                  <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
                    Motivo: {order.contract_rejection_reason}
                  </p>
                )}
              </div>

              {/* Status do Anexo */}
              <div className="rounded-md border p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">Anexo/Termos Adicionais</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          order.annex_approval_status === "approved"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {order.annex_approval_status || "Aguardando"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() =>
                        handleUpdateStatus("annex_approval_status", "approved")
                      }
                      disabled={
                        updating || order.annex_approval_status === "approved"
                      }
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() =>
                        handleUpdateStatus(
                          "annex_approval_status",
                          "rejected",
                          rejectionReason,
                        )
                      }
                      disabled={updating}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Rejeitar
                    </Button>
                  </div>
                </div>
                {order.annex_rejection_reason && (
                  <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
                    Motivo: {order.annex_rejection_reason}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Motivo para Rejeição (se houver)
                </label>
                <Textarea
                  placeholder="Explique o motivo da rejeição para o cliente..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 overflow-hidden">
                  <p className="font-semibold text-sm break-all leading-tight">
                    {order.client_name}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 break-all leading-tight">
                    <Mail className="h-3 w-3 shrink-0" />
                    {order.client_email}
                  </div>
                  {order.client_whatsapp && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Phone className="h-3 w-3" />
                      {order.client_whatsapp}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                    País
                  </p>
                  <p className="text-sm">{order.client_country || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Nacionalidade
                  </p>
                  <p className="text-sm">{order.client_nationality || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendedor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Origem / Seller
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">
                Vendedor responsável pelo fechamento:
              </p>
              {sellerName ? (
                <div className="rounded bg-primary/5 p-3 border border-primary/20">
                  <p className="font-bold text-primary">{sellerName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ID: {order.seller_id}
                  </p>
                </div>
              ) : (
                <div className="rounded bg-muted p-3 border border-border">
                  <p className="text-sm italic text-muted-foreground">
                    Pedido sem seller atribuído.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper icons needed but not imported
function TrendingUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
