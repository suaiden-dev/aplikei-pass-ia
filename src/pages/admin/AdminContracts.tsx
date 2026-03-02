import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FileText, ExternalLink, RefreshCw, Download, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
}

export default function AdminContracts() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<ContractOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("visa_orders")
                .select(
                    "id, order_number, user_id, client_name, client_email, product_slug, total_price_usd, payment_method, payment_status, contract_pdf_url, contract_selfie_url, terms_accepted_at, client_ip, created_at"
                )
                .eq("payment_status", "paid")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setOrders((data as ContractOrder[]) ?? []);
        } catch (err: any) {
            console.error("Erro ao buscar contratos:", err);
            toast({ title: "Erro ao carregar contratos", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleRegeneratePdf = async (order: ContractOrder) => {
        setRegeneratingId(order.id);
        try {
            // Limpa o PDF atual para forçar regeneração
            await supabase
                .from("visa_orders")
                .update({ contract_pdf_url: null })
                .eq("id", order.id);

            const { error } = await supabase.functions.invoke("generate-contract-pdf", {
                body: { order_id: order.id },
            });

            if (error) throw error;

            toast({ title: `PDF do pedido ${order.order_number} regenerado com sucesso!` });
            fetchOrders();
        } catch (err: any) {
            console.error("Erro ao regenerar PDF:", err);
            toast({ title: "Erro ao regenerar PDF", description: err.message, variant: "destructive" });
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
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

    const totalWithPdf = orders.filter((o) => o.contract_pdf_url).length;
    const totalWithoutPdf = orders.filter((o) => !o.contract_pdf_url).length;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Contratos PDF</h2>
                    <p className="mt-1 text-muted-foreground">
                        Contratos gerados automaticamente após confirmação de pagamento.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Atualizar
                </Button>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Total de pedidos pagos</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{orders.length}</p>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20 p-4">
                    <p className="text-sm text-green-700 dark:text-green-400">Com PDF gerado</p>
                    <p className="mt-1 text-2xl font-bold text-green-700 dark:text-green-400">{totalWithPdf}</p>
                </div>
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20 p-4">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">Sem PDF</p>
                    <p className="mt-1 text-2xl font-bold text-yellow-700 dark:text-yellow-400">{totalWithoutPdf}</p>
                </div>
            </div>

            {/* Tabela */}
            <div className="rounded-xl bg-card">
                <AdminDataTable
                    loading={loading}
                    data={orders}
                    columns={[
                        {
                            key: "order_number",
                            header: "Pedido",
                            className: "font-mono text-xs font-semibold",
                        },
                        { key: "client_name", header: "Cliente" },
                        {
                            key: "product_slug",
                            header: "Serviço",
                            render: (item) => (
                                <Badge variant="outline" className="capitalize text-xs">
                                    {item.product_slug?.replace(/-/g, " ")}
                                </Badge>
                            ),
                        },
                        {
                            key: "total_price_usd",
                            header: "Valor",
                            render: (item) => formatCurrency(Number(item.total_price_usd)),
                        },
                        {
                            key: "payment_method",
                            header: "Método",
                            render: (item) => (
                                <span className="text-xs capitalize">{item.payment_method?.replace(/_/g, " ") || "—"}</span>
                            ),
                        },
                        {
                            key: "terms_accepted_at",
                            header: "Aceite",
                            render: (item) => (
                                <span className="text-xs">{formatDate(item.terms_accepted_at)}</span>
                            ),
                        },
                        {
                            key: "ds160",
                            header: "Formulário",
                            render: (item) =>
                                item.product_slug === "visto-b1-b2" && item.user_id ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1.5 text-xs h-7 border-accent/30 text-accent hover:bg-accent/10"
                                        onClick={() => {
                                            navigate(`/admin/ds160/${item.user_id}`, {
                                                state: { clientName: item.client_name }
                                            });
                                        }}
                                    >
                                        <ClipboardList className="h-3 w-3" />
                                        Ver DS-160
                                    </Button>
                                ) : (
                                    <span className="text-xs text-muted-foreground">—</span>
                                ),
                        },
                        {
                            key: "contract_selfie_url",
                            header: "Selfie",
                            render: (item) =>
                                item.contract_selfie_url ? (
                                    <a
                                        href={item.contract_selfie_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                                    >
                                        Ver <ExternalLink className="h-3 w-3" />
                                    </a>
                                ) : (
                                    <span className="text-xs text-muted-foreground">—</span>
                                ),
                        },
                        {
                            key: "contract_pdf_url",
                            header: "Contrato PDF",
                            render: (item) =>
                                item.contract_pdf_url ? (
                                    <a
                                        href={item.contract_pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                                            <Download className="h-3 w-3" />
                                            Baixar PDF
                                        </Button>
                                    </a>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                        <FileText className="h-3 w-3" />
                                        Não gerado
                                    </span>
                                ),
                        },
                        {
                            key: "actions",
                            header: "Ações",
                            className: "text-right",
                            render: (item) => (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="gap-1.5 text-xs h-7"
                                    onClick={() => handleRegeneratePdf(item)}
                                    disabled={regeneratingId === item.id}
                                >
                                    <RefreshCw className={`h-3 w-3 ${regeneratingId === item.id ? "animate-spin" : ""}`} />
                                    {regeneratingId === item.id ? "Gerando..." : "Regenerar"}
                                </Button>
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
