import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Upload,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  Info,
  Clock,
  Fingerprint,
  ShieldCheck,
  Save,
  Loader2,
  ChevronLeft,
  ExternalLink,
  User as UserIcon,
  FileText,
  Download,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AdminStatusTimeline } from "@/components/admin/AdminStatusTimeline";
import { AdminVerticalTimeline } from "@/components/admin/AdminVerticalTimeline";

export default function AdminProcessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [appId, setAppId] = useState("");
  const [dob, setDob] = useState("");
  const [grandmaName, setGrandmaName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const fetchProcessData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch the order
      const { data: orderData, error: orderError } = await supabase
        .from("visa_orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError) throw orderError;

      // Fetch the corresponding user service
      const { data: serviceData, error: serviceError } = await supabase
        .from("user_services")
        .select("*")
        .eq("user_id", orderData.user_id)
        .eq("service_slug", orderData.product_slug)
        .single();

      const combined = {
        ...orderData,
        service_status: serviceData?.status,
        user_service_id: serviceData?.id,
        application_id: serviceData?.application_id,
        date_of_birth: serviceData?.date_of_birth,
        grandmother_name: serviceData?.grandmother_name,
      };

      setOrder(combined);
      setAppId(combined.application_id || "");
      setDob(combined.date_of_birth || "");
      setGrandmaName(combined.grandmother_name || "");
    } catch (err: any) {
      console.error("Error fetching process data:", err);
      toast({ title: "Erro ao carregar processo", variant: "destructive" });
      navigate("/admin/contratos");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    if (id) {
      fetchProcessData();
    }
  }, [id, fetchProcessData]);

  const handleSaveFields = async () => {
    if (!order?.user_service_id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("user_services")
        .update({
          application_id: appId.trim(),
          date_of_birth: dob.trim(),
          grandmother_name: grandmaName.trim(),
          status: "ds160AwaitingReviewAndSignature",
        })
        .eq("id", order.user_service_id);

      if (error) throw error;

      toast({
        title: "Dados salvos com sucesso",
        description: "Status atualizado para 'Aguardando Revisão/Assinatura'.",
      });

      fetchProcessData();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegeneratePdf = async () => {
    if (!order) return;
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
          body: { orderId: order.id },
        },
      );

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description:
          "O contrato está sendo regenerado. Aguarde alguns segundos.",
      });

      // Aguarda um pouco e recarrega
      setTimeout(fetchProcessData, 3000);
    } catch (error: any) {
      console.error("Erro ao regenerar PDF:", error);
      toast({
        title: "Erro ao regenerar contrato",
        description: "Não foi possível iniciar a regeneração do PDF.",
        variant: "destructive",
      });
    } finally {
      setRegeneratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!order) return null;

  const status = order.service_status || "unknown";
  const isAlreadySaved = !!(
    order.application_id &&
    order.date_of_birth &&
    order.grandmother_name
  );

  const renderStatusContent = () => {
    switch (status) {
      case "ds160InProgress":
      case "active":
        return (
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
              <ClipboardList className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-bold text-yellow-700">
                  Fluxo DS-160
                </p>
                <p className="text-xs text-yellow-600">
                  O cliente ainda precisa preencher a DS-160.
                </p>
              </div>
            </div>
            <Button
              className="w-full gap-2"
              onClick={() =>
                navigate(`/admin/ds160/${order.user_id}`, {
                  state: { clientName: order.client_name },
                })
              }
            >
              <ClipboardList className="h-4 w-4" />
              Ver Respostas do Formulário
            </Button>
          </div>
        );

      case "ds160Processing":
      case "ds160AwaitingReviewAndSignature":
        return (
          <div className="space-y-6 max-w-xl">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
              <ClipboardList className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-bold text-yellow-700">
                  Fluxo DS-160
                </p>
                <p className="text-xs text-yellow-600">
                  O cliente finalizou a DS-160. Preencha os dados de segurança
                  para prosseguir.
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 bg-accent/5 rounded-2xl border border-accent/20 shadow-sm">
              <div className="flex items-center gap-2 border-b border-accent/10 pb-3 mb-4">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <h4 className="text-sm font-bold uppercase tracking-widest text-accent">
                  Dados de Segurança
                </h4>
              </div>

              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Application ID
                  </label>
                  <Input
                    placeholder="Ex: AA00..."
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    readOnly={isAlreadySaved}
                    className={`font-mono h-11 ${isAlreadySaved ? "bg-muted" : ""}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Nascimento
                    </label>
                    <Input
                      placeholder="DD/MM/AAAA"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      readOnly={isAlreadySaved}
                      className={isAlreadySaved ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Nome da Avó
                    </label>
                    <Input
                      placeholder="Nome Completo"
                      value={grandmaName}
                      onChange={(e) => setGrandmaName(e.target.value)}
                      readOnly={isAlreadySaved}
                      className={isAlreadySaved ? "bg-muted" : ""}
                    />
                  </div>
                </div>
              </div>

              <Button
                className={`w-full gap-2 mt-4 h-12 shadow-lg ${isAlreadySaved ? "bg-gray-400" : "bg-accent hover:bg-green-dark"}`}
                onClick={handleSaveFields}
                disabled={
                  isSaving ||
                  isAlreadySaved ||
                  !appId.trim() ||
                  !dob.trim() ||
                  !grandmaName.trim()
                }
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isAlreadySaved ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isAlreadySaved ? "Dados Já Salvos" : "Salvar e Prosseguir"}
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2 border-accent text-accent hover:bg-accent hover:text-white transition-all"
              onClick={() =>
                navigate(`/admin/ds160/${order.user_id}`, {
                  state: { clientName: order.client_name },
                })
              }
            >
              <ClipboardList className="h-4 w-4" />
              Ver Respostas do Formulário DS-160
            </Button>
          </div>
        );

      case "uploadsUnderReview":
        return (
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/30">
              <Upload className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-bold text-blue-700">
                  Revisão de Documentos
                </p>
                <p className="text-xs text-blue-600">
                  O cliente enviou os documentos e eles precisam ser validados.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="py-12 text-center text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Detalhes específicos para este status ainda não configurados.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/contratos")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Gestão do Processo
          </h2>
          <p className="text-muted-foreground">
            Cliente:{" "}
            <span className="font-bold text-foreground">
              {order.client_name}
            </span>{" "}
            • {order.product_slug}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Status info */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[300px]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">
              Ações Necessárias
            </h3>
            {renderStatusContent()}
          </div>
        </div>

        {/* Right Column: Process & Order info */}
        <div className="space-y-6">
          {/* Timeline Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Histórico do Processo
            </h3>
            <AdminVerticalTimeline currentStatus={status} />
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Informações do Pedido
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Pedido
                </p>
                <p className="text-sm font-medium">{order.order_number}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  E-mail
                </p>
                <p className="text-sm font-medium">{order.client_email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Valor
                </p>
                <p className="text-sm font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(order.total_price_usd)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Data da Compra
                </p>
                <p className="text-sm font-medium">
                  {new Date(order.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Data do Aceite
                </p>
                <p className="text-sm font-medium">
                  {order.terms_accepted_at
                    ? new Date(order.terms_accepted_at).toLocaleDateString(
                        "pt-BR",
                      )
                    : "Pendente"}
                </p>
              </div>
            </div>
          </div>

          {/* Contract PDF Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              Contrato do Processo
            </h3>
            <div className="space-y-3">
              {order.contract_pdf_url ? (
                <a
                  href={order.contract_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full gap-2 font-bold h-11 bg-accent hover:bg-green-dark">
                    <Download className="h-4 w-4" />
                    BAIXAR CONTRATO PDF
                  </Button>
                </a>
              ) : (
                <div className="p-4 bg-muted/50 rounded-xl border border-dashed border-border text-center">
                  <p className="text-xs text-muted-foreground italic mb-2">
                    PDF não disponível ou em geração
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-[10px] font-bold h-8 border-accent/20 text-accent hover:bg-accent/5"
                onClick={handleRegeneratePdf}
                disabled={!!regeneratingId}
              >
                {regeneratingId ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                REGERAR CONTRATO
              </Button>
            </div>
          </div>

          {/* Selfie Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-accent" />
              Selfie do Cliente
            </h3>
            {order.contract_selfie_url ? (
              <div className="relative group overflow-hidden rounded-xl border border-border aspect-square bg-slate-50 flex items-center justify-center">
                <img
                  src={order.contract_selfie_url}
                  alt="Selfie do cliente"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <a
                  href={order.contract_selfie_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="font-bold text-xs gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    VER EM TELA CHEIA
                  </Button>
                </a>
              </div>
            ) : (
              <div className="py-12 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-muted-foreground/20">
                <UserIcon className="h-10 w-10 mx-auto text-muted-foreground/20 mb-2" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase">
                  Nenhuma selfie disponível
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
