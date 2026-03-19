import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminDataTable } from "@/presentation/components/organisms/admin/AdminDataTable";
import { Badge } from "@/presentation/components/atoms/badge";
import { Button } from "@/presentation/components/atoms/button";
import { useToast } from "@/presentation/components/atoms/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/atoms/tabs";
import { CheckCircle2, XCircle, ImageIcon, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/presentation/components/atoms/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/presentation/components/atoms/tooltip";

interface ZellePayment {
    id: string;
    confirmation_code?: string | null;
    amount: number;
    status: string;
    proof_path?: string | null;
    service_slug: string | null;
    created_at: string | null;
    admin_notes?: string | null;
    user_id?: string | null;
    n8n_confidence?: number | null;
    n8n_response?: string | null;
    payment_method?: string;
    visa_order_id?: string | null;
    screenshot_url?: string;
    payment_metadata?: Record<string, unknown> | null;
    guest_name?: string | null;
    guest_email?: string | null;
    profiles?: {
        full_name: string | null;
    } | null;
}

function ConfidenceBadge({ confidence, response }: { confidence: number | null; response: string | null }) {
    if (confidence === null || confidence === undefined) {
        return <span className="text-xs text-muted-foreground">–</span>;
    }

    const pct = Math.round(confidence * 100);
    const color =
        response === "valid" && confidence >= 0.8
            ? "bg-green-100 text-green-700 border-green-200"
            : response === "invalid"
                ? "bg-red-100 text-red-700 border-red-200"
                : "bg-yellow-100 text-yellow-700 border-yellow-200";

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-default ${color}`}>
                    🤖 {pct}%
                </span>
            </TooltipTrigger>
            <TooltipContent>
                <p className="text-xs">Confiança da IA: {pct}%</p>
                <p className="text-xs">Resultado: {response ?? "–"}</p>
            </TooltipContent>
        </Tooltip>
    );
}

export default function AdminPayments() {
    const { toast } = useToast();
    const [payments, setPayments] = useState<ZellePayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending_verification");
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            let combinedData: ZellePayment[] = [];

            if (activeTab === "approved") {
                // 1. Fetch from visa_orders (Stripe, Parcelow, Zelle paid)
                const { data: visaOrders, error: visaError } = await supabase
                    .from("visa_orders")
                    .select("*")
                    .eq("payment_status", "paid")
                    .order("created_at", { ascending: false });

                if (visaError) throw visaError;

                // 2. Fetch from zelle_payments (Already approved Zelle)
                const { data: zelleData, error: zelleError } = await supabase
                    .from("zelle_payments")
                    .select("*, profiles:user_id(full_name)")
                    .eq("status", "approved")
                    .order("created_at", { ascending: false });

                if (zelleError) throw zelleError;

                // 3. Normalizar visa_orders para o formato ZellePayment
                const normalizedVisa = (visaOrders || []).map(order => ({
                    id: order.id,
                    amount: order.total_price_usd,
                    payment_method: order.payment_method,
                    service_slug: order.product_slug,
                    status: "approved",
                    created_at: order.created_at,
                    profiles: { full_name: order.client_name },
                    guest_name: order.client_name,
                    guest_email: order.client_email,
                    visa_order_id: order.id,
                    screenshot_url: null,
                    proof_path: null,
                    payment_metadata: order.payment_metadata,
                }));

                // 4. Filtrar Zelle payments que já estão nas visa_orders (por visa_order_id) para evitar duplicacion
                const visaOrderIds = new Set(visaOrders?.map(o => o.id));
                const uniqueZelle = (zelleData || []).filter(z => !z.visa_order_id || !visaOrderIds.has(z.visa_order_id));

                combinedData = [...normalizedVisa, ...uniqueZelle] as ZellePayment[];
                // Re-ordenar por data
                combinedData.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
            } else {
                // Somente Zelle para Pendentes e Rejeitados
                const { data, error } = await supabase
                    .from("zelle_payments")
                    .select("*, profiles:user_id(full_name)")
                    .eq("status", activeTab)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                combinedData = data as ZellePayment[];
            }

            // Gerar URLs para comprovantes se houver
            const paymentsWithUrls = await Promise.all(combinedData.map(async (payment) => {
                if (payment.proof_path) {
                    const { data: urlData } = await supabase.storage
                        .from("zelle_comprovantes")
                        .createSignedUrl(payment.proof_path, 3600);
                    return { ...payment, screenshot_url: urlData?.signedUrl };
                }
                return payment;
            }));

            setPayments(paymentsWithUrls as ZellePayment[]);
        } catch (error) {
            console.error("Erro ao buscar pagamentos:", error);
            toast({ title: "Erro ao carregar pagamentos", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [activeTab, toast]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleApprove = async (payment: ZellePayment) => {
        setProcessingId(payment.id);
        try {
            // Acionar a Edge Function zelle-webhook para executar o pipeline completo
            // Passamos response="valid" e confidence=1 para garantir aprovação imediata (humano aprovou)
            const { error } = await supabase.functions.invoke("zelle-webhook", {
                body: { payment_id: payment.id, response: "valid", confidence: 1 },
            });

            if (error) throw error;

            toast({ title: "Pagamento aprovado e serviço ativado com sucesso!" });
            fetchPayments();
        } catch (error) {
            const err = error as Error;
            console.error("Erro ao aprovar:", err);
            toast({ title: "Erro ao aprovar pagamento", description: err.message, variant: "destructive" });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (payment: ZellePayment) => {
        setProcessingId(payment.id);
        try {
            const { error } = await supabase
                .from("zelle_payments")
                .update({ status: "rejected" })
                .eq("id", payment.id);

            if (error) throw error;

            toast({ title: "Pagamento rejeitado." });
            fetchPayments();
        } catch (error) {
            const err = error as Error;
            console.error("Erro ao rejeitar:", err);
            toast({ title: "Erro ao rejeitar pagamento", description: err.message, variant: "destructive" });
        } finally {
            setProcessingId(null);
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

    const getFriendlyServiceName = (item: ZellePayment) => {
        if (!item.service_slug || item.service_slug === "unknown") {
            const metadata = item.payment_metadata;
            if (metadata?.type === "specialist_training" || item.service_slug === "specialist-training") {
                return "Treinamento Especialista";
            }
            if (metadata?.type === "specialist_review" || item.service_slug === "specialist-review") {
                return "Revisão Especialista";
            }
            if (metadata?.fee_type === "selection_process" || metadata?.project === "matricula_usa") {
                return "Matrícula USA - Processo";
            }
            if (metadata?.fee_type === "application_fee") {
                return "Matrícula USA - Application";
            }
            if (metadata?.fee_type === "placement_fee") {
                return "Matrícula USA - Placement";
            }
            if (metadata?.slug) {
                return (metadata.slug as string).replace(/-/g, " ");
            }
            return "Serviço Adicional";
        }
        
        return item.service_slug.replace(/-/g, " ");
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h2 className="text-title md:text-title-xl font-black font-display text-foreground tracking-tight uppercase">
                        Gestão de Pagamentos
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
                        Fila de verificação manual de transferências Zelle e ativação de serviços.
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="pending_verification">Pendentes</TabsTrigger>
                    <TabsTrigger value="approved">Aprovados</TabsTrigger>
                    <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                    <div className="rounded-[32px] border border-border bg-card/50 backdrop-blur-md overflow-hidden shadow-2xl">
                        <AdminDataTable
                            loading={loading}
                            data={payments as unknown as Record<string, unknown>[]}
                            columns={[
                                {
                                    key: "cliente",
                                    header: "Cliente",
                                    render: (item) => (
                                        <div className="flex flex-col min-w-[150px]">
                                            <span className="font-bold text-foreground truncate">
                                                {(item as unknown as ZellePayment).profiles?.full_name || (item as unknown as ZellePayment).guest_name || "Cliente sem nome"}
                                            </span>
                                            {(!(item as unknown as ZellePayment).profiles?.full_name && (item as unknown as ZellePayment).guest_email) && (
                                                <span className="text-[10px] text-muted-foreground truncate">
                                                    {(item as unknown as ZellePayment).guest_email}
                                                </span>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    key: "service_slug",
                                    header: "Nome do Serviço",
                                    render: (item) => (
                                        <Badge variant="outline" className="capitalize border-accent/20 text-accent font-bold px-3 py-1 bg-accent/5">
                                            {getFriendlyServiceName(item as unknown as ZellePayment)}
                                        </Badge>
                                    )
                                },
                                {
                                    key: "amount",
                                    header: "Pagamento",
                                    render: (item) => (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-1">
                                                MÉTODO: {((item as unknown as ZellePayment).payment_method as string)?.replace(/_/g, " ") || "Zelle"}
                                            </span>
                                            <span className="text-subtitle font-black text-primary">
                                                {formatCurrency((item as unknown as ZellePayment).amount as number)}
                                            </span>
                                        </div>
                                    ),
                                },
                                {
                                    key: "actions",
                                    header: "Ações",
                                    className: "text-right",
                                    render: (item) => activeTab === "pending_verification" && (
                                        <div className="flex justify-end gap-3">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-10 w-10 text-green-600 border-green-200 hover:bg-green-50 rounded-xl shadow-sm transition-all active:scale-95"
                                                        onClick={() => handleApprove(item as unknown as ZellePayment)}
                                                        disabled={processingId === (item as unknown as ZellePayment).id}
                                                    >
                                                        {processingId === (item as unknown as ZellePayment).id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="h-5 w-5" />
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Aprovar Pagamento</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-10 w-10 text-red-600 border-red-200 hover:bg-red-50 rounded-xl shadow-sm transition-all active:scale-95"
                                                        onClick={() => handleReject(item as unknown as ZellePayment)}
                                                        disabled={processingId === (item as unknown as ZellePayment).id}
                                                    >
                                                        <XCircle className="h-5 w-5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Rejeitar Pagamento</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    ),
                                },
                            ]}
                            searchKeys={["service_slug"]}
                            searchPlaceholder="Buscar por serviço..."
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
