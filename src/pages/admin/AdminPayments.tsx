import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, ImageIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ZellePayment {
    id: string;
    confirmation_code: string;
    amount: number;
    status: string;
    proof_path: string;
    service_slug: string | null;
    created_at: string;
    admin_notes: string | null;
    user_id: string;
    n8n_confidence: number | null;
    n8n_response: string | null;
    screenshot_url?: string;
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

    useEffect(() => {
        fetchPayments();
    }, [activeTab]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("zelle_payments")
                .select("*")
                .eq("status", activeTab)
                .order("created_at", { ascending: false });

            if (error) throw error;

            const paymentsWithUrls = await Promise.all((data || []).map(async (payment) => {
                if (payment.proof_path) {
                    const { data: urlData } = await supabase.storage
                        .from("zelle_comprovantes")
                        .createSignedUrl(payment.proof_path, 3600);
                    return { ...payment, screenshot_url: urlData?.signedUrl };
                }
                return payment;
            }));

            setPayments(paymentsWithUrls as any[]);
        } catch (error) {
            console.error("Erro ao buscar pagamentos:", error);
            toast({ title: "Erro ao carregar pagamentos", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

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
        } catch (error: any) {
            console.error("Erro ao aprovar:", error);
            toast({ title: "Erro ao aprovar pagamento", description: error.message, variant: "destructive" });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (payment: ZellePayment) => {
        setProcessingId(payment.id);
        try {
            const { error } = await supabase
                .from("zelle_payments" as any)
                .update({ status: "rejected" })
                .eq("id", payment.id);

            if (error) throw error;

            toast({ title: "Pagamento rejeitado." });
            fetchPayments();
        } catch (error: any) {
            console.error("Erro ao rejeitar:", error);
            toast({ title: "Erro ao rejeitar pagamento", description: error.message, variant: "destructive" });
        } finally {
            setProcessingId(null);
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

    return (
        <div className="space-y-4">
            <div>
                <h2 className="font-display text-title font-bold text-foreground">Gestão de Pagamentos</h2>
                <p className="text-muted-foreground">Fila de verificação manual de transferências Zelle.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="pending_verification">Pendentes</TabsTrigger>
                    <TabsTrigger value="approved">Aprovados</TabsTrigger>
                    <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                    <div className="rounded-md bg-card">
                        <AdminDataTable
                            loading={loading}
                            data={payments}
                            columns={[
                                { key: "id", header: "ID", className: "font-mono text-[10px] text-muted-foreground w-20" },
                                {
                                    key: "amount",
                                    header: "Valor",
                                    render: (item) => (
                                        <span className="font-bold text-primary">{formatCurrency(item.amount)}</span>
                                    ),
                                },
                                {
                                    key: "n8n_confidence",
                                    header: "IA",
                                    render: (item) => (
                                        <ConfidenceBadge confidence={item.n8n_confidence} response={item.n8n_response} />
                                    ),
                                },
                                {
                                    key: "screenshot_url",
                                    header: "Comprovante",
                                    render: (item) => (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <ImageIcon className="h-4 w-4" /> Ver Foto
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl">
                                                <DialogHeader>
                                                    <DialogTitle>Comprovante de Pagamento</DialogTitle>
                                                    {item.n8n_confidence !== null && (
                                                        <p className="text-sm text-muted-foreground">
                                                            IA: <strong>{item.n8n_response}</strong> ({Math.round(item.n8n_confidence * 100)}% confiança)
                                                        </p>
                                                    )}
                                                </DialogHeader>
                                                <div className="flex justify-center bg-black/5 rounded-md overflow-hidden">
                                                    <img
                                                        src={item.screenshot_url}
                                                        alt="Comprovante Zelle"
                                                        className="max-h-[70vh] object-contain"
                                                    />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    ),
                                },
                                {
                                    key: "confirmation_code",
                                    header: "Cód. Confirmação",
                                    className: "font-mono text-xs"
                                },
                                {
                                    key: "service_slug",
                                    header: "Serviço",
                                    render: (item) => (
                                        <Badge variant="outline" className="capitalize">
                                            {item.service_slug?.replace(/-/g, " ")}
                                        </Badge>
                                    )
                                },
                                {
                                    key: "created_at",
                                    header: "Enviado em",
                                    render: (item) => formatDate(item.created_at),
                                },
                                {
                                    key: "actions",
                                    header: "Ações",
                                    className: "text-right",
                                    render: (item) => activeTab === "pending_verification" && (
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-green-600 border-green-200 hover:bg-green-50"
                                                onClick={() => handleApprove(item)}
                                                disabled={processingId === item.id}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => handleReject(item)}
                                                disabled={processingId === item.id}
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ),
                                },
                            ]}
                            searchKeys={["confirmation_code"]}
                            searchPlaceholder="Buscar por código de confirmação..."
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
