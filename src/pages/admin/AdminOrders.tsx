import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminOrdersFilters, OrderFilters } from "@/components/admin/AdminOrdersFilters";
import { useToast } from "@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Order {
    id: string;
    order_number: string;
    client_name: string;
    product_slug: string;
    total_price_usd: number;
    payment_status: string;
    created_at: string;
}

export default function AdminOrders() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<OrderFilters>({});

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async (currentFilters: OrderFilters = filters) => {
        setLoading(true);
        try {
            let query = supabase
                .from("visa_orders")
                .select("id, order_number, client_name, product_slug, total_price_usd, payment_status, created_at")
                .eq("is_test", false)
                .order("created_at", { ascending: false });

            // Apply Filters
            if (currentFilters.status && currentFilters.status !== "all") {
                query = query.eq("payment_status", currentFilters.status);
            }
            if (currentFilters.product && currentFilters.product !== "all") {
                query = query.eq("product_slug", currentFilters.product);
            }
            if (currentFilters.minPrice) {
                query = query.gte("total_price_usd", currentFilters.minPrice);
            }
            if (currentFilters.maxPrice) {
                query = query.lte("total_price_usd", currentFilters.maxPrice);
            }
            if (currentFilters.startDate) {
                query = query.gte("created_at", currentFilters.startDate);
            }
            if (currentFilters.endDate) {
                // Add one day to include the end date fully
                const end = new Date(currentFilters.endDate);
                end.setDate(end.getDate() + 1);
                query = query.lt("created_at", end.toISOString());
            }

            const { data, error } = await query;
            if (error) throw error;
            setOrders((data as Order[]) || []);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
            toast({
                title: "Erro ao carregar pedidos",
                description: "Tente novamente mais tarde.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, status: string) => {
        const { error } = await supabase
            .from("visa_orders")
            .update({ payment_status: status })
            .eq("id", orderId);

        if (error) {
            toast({ title: "Erro ao atualizar status", variant: "destructive" });
        } else {
            toast({ title: "Status atualizado!" });
            setOrders(orders.map(o => o.id === orderId ? { ...o, payment_status: status } : o));
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-display text-title font-bold text-foreground">Gestão de Pedidos</h2>
                    <p className="text-muted-foreground">Visualize e gerencie todas as vendas da plataforma.</p>
                </div>
            </div>

            <AdminOrdersFilters onFilterChange={(f) => {
                setFilters(f);
                fetchOrders(f);
            }} />

            <div className="rounded-md bg-card">
                <AdminDataTable
                    loading={loading}
                    data={orders}
                    columns={[
                        { key: "order_number", header: "Nº Pedido", className: "font-mono font-medium" },
                        { key: "client_name", header: "Cliente" },
                        {
                            key: "product_slug",
                            header: "Produto",
                            render: (item) => (
                                <Badge variant="secondary" className="capitalize">
                                    {item.product_slug.replace(/-/g, " ")}
                                </Badge>
                            ),
                        },
                        {
                            key: "total_price_usd",
                            header: "Valor",
                            render: (item) => formatCurrency(item.total_price_usd),
                        },
                        {
                            key: "payment_status",
                            header: "Status",
                            render: (item) => (
                                <Select
                                    value={item.payment_status}
                                    onValueChange={(v) => handleUpdateStatus(item.id, v)}
                                >
                                    <SelectTrigger className="h-8 w-[110px] text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="paid">Pago</SelectItem>
                                        <SelectItem value="failed">Falha</SelectItem>
                                        <SelectItem value="refunded">Reembolsado</SelectItem>
                                    </SelectContent>
                                </Select>
                            ),
                        },
                        {
                            key: "actions",
                            header: "",
                            className: "text-right",
                            render: (item) => (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/admin/pedidos/${item.id}`)}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            ),
                        },
                    ]}
                    searchKeys={["order_number", "client_name"]}
                    searchPlaceholder="Buscar por número ou cliente..."
                />
            </div>
        </div>
    );
}
