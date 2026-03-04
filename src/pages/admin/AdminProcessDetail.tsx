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
import { DS160ReviewModal } from "../dashboard/onboarding/components/DS160ReviewModal";
import { useLanguage } from "@/i18n/LanguageContext";

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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [processDocs, setProcessDocs] = useState<any[]>([]);
  const { lang } = useLanguage();

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

      // Fetch documents for this user
      if (orderData.user_id) {
        const { data: docs } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", orderData.user_id);

        // Filter documents belonging to this service or the special DS-160 upload names
        const relevantDocs =
          docs?.filter(
            (d) =>
              (serviceData?.id && d.user_service_id === serviceData.id) ||
              d.name === "ds160_assinada" ||
              d.name === "ds160_comprovante",
          ) || [];

        console.log("DEBUG: Documentos encontrados no banco:", docs);
        console.log("DEBUG: Documentos filtrados:", relevantDocs);

        setProcessDocs(relevantDocs.length > 0 ? relevantDocs : docs || []);
      }
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
          status: "ds160upload_documents",
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

  const handleApproveDocuments = async () => {
    if (!order?.user_service_id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("user_services")
        .update({ status: "casvSchedulingPending" })
        .eq("id", order.user_service_id);

      if (error) throw error;

      // Update all documents status to approved if desired,
      // but the requirement just says change process status
      await supabase
        .from("documents")
        .update({ status: "approved" })
        .eq("user_service_id", order.user_service_id);

      toast({
        title: "Documentos aprovados",
        description: "Status alterado para 'CASV: Agendamento Pendente'.",
      });
      fetchProcessData();
    } catch (error: any) {
      toast({
        title: "Erro ao aprovar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectDocuments = async () => {
    if (!order?.user_service_id) return;
    // For rejection, we might want to move back to a state where they can re-upload
    // or just leave it in current state and ask for re-upload
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("user_services")
        .update({ status: "ds160upload_documents" })
        .eq("id", order.user_service_id);

      if (error) throw error;

      await supabase
        .from("documents")
        .update({ status: "resubmit" })
        .eq("user_service_id", order.user_service_id);

      toast({
        title: "Documentos rejeitados",
        description: "O cliente será solicitado a enviar novamente.",
      });
      fetchProcessData();
    } catch (error: any) {
      toast({
        title: "Erro",
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
              onClick={() => setShowReviewModal(true)}
            >
              <ClipboardList className="h-4 w-4" />
              Ver Respostas do Formulário
            </Button>
          </div>
        );

      case "ds160Processing":
      case "review_pending":
      case "review_assign":
        return (
          <div className="space-y-6 max-w-xl">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
              <ClipboardList className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-bold text-yellow-700">
                  Fluxo DS-160
                </p>
                <p className="text-xs text-yellow-600">
                  Preencha os dados de segurança para liberar o upload dos
                  documentos pelo cliente.
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
                    onChange={(e) => setAppId(e.target.value.toUpperCase())}
                    className="font-mono h-11 uppercase"
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
                    />
                  </div>
                </div>
              </div>

              <Button
                className="w-full gap-2 mt-4 h-12 shadow-lg bg-accent hover:bg-green-dark"
                onClick={handleSaveFields}
                disabled={
                  isSaving ||
                  !appId.trim() ||
                  !dob.trim() ||
                  !grandmaName.trim()
                }
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                SALVAR E PEDIR UPLOADS
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2 border-accent text-accent hover:bg-accent hover:text-white transition-all"
              onClick={() => setShowReviewModal(true)}
            >
              <ClipboardList className="h-4 w-4" />
              Ver Respostas do Formulário DS-160
            </Button>
          </div>
        );

      case "ds160upload_documents":
        return (
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-900/30">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-bold text-orange-700">
                  Aguardando Cliente
                </p>
                <p className="text-xs text-orange-600">
                  Os dados de segurança foram salvos. O cliente agora precisa
                  anexar os documentos assinados e a confirmação de envio.
                </p>
              </div>
            </div>

            <div className="p-6 bg-muted/20 rounded-2xl border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Dados Salvos
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] font-bold"
                  onClick={() => {
                    // Permite editar se precisar
                  }}
                >
                  EDITAR
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                    Application ID
                  </label>
                  <p className="font-mono font-bold text-lg">{appId}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                    Nascimento
                  </label>
                  <p className="font-bold text-lg">{dob}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-dashed border-border rounded-xl text-center">
              <p className="text-xs text-muted-foreground italic">
                O fluxo avançará automaticamente assim que o cliente clicar em
                "Enviar Documentos" no portal dele.
              </p>
            </div>

            {processDocs.length > 0 && (
              <div className="mt-8 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Arquivos já recebidos (Parcial)
                </h4>
                <div className="grid gap-3">
                  {processDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm hover:border-accent/40 transition-shadow"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">
                            {doc.name === "ds160_assinada"
                              ? "DS-160 Assinada"
                              : doc.name === "ds160_comprovante"
                                ? "Comprovante DS-160"
                                : doc.name}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-accent/20 text-accent hover:bg-accent/10 font-bold text-[10px] tracking-wider"
                        onClick={() => {
                          const { data } = supabase.storage
                            .from(doc.bucket_id || "documents")
                            .getPublicUrl(doc.storage_path);
                          window.open(data.publicUrl, "_blank");
                        }}
                      >
                        ABRIR
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "ds160AwaitingReviewAndSignature":
      case "uploadsUnderReview":
        return (
          <div className="space-y-6 max-w-xl">
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/30">
              <Upload className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-bold text-blue-700">
                  Validação de Documentos
                </p>
                <p className="text-xs text-blue-600">
                  O cliente enviou os documentos. Por favor, revise os anexos
                  abaixo para prosseguir com o agendamento.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Arquivos do Processo
              </h4>
              <div className="grid gap-3">
                {processDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm hover:border-accent/40 transition-shadow"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">
                          {doc.name === "ds160_assinada"
                            ? "DS-160 Assinada"
                            : doc.name === "ds160_comprovante"
                              ? "Comprovante DS-160"
                              : doc.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">
                          {doc.storage_path.split(".").pop()} •{" "}
                          {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-accent/20 text-accent hover:bg-accent/10 font-bold text-[10px] tracking-wider"
                      onClick={() => {
                        const { data } = supabase.storage
                          .from(doc.bucket_id || "documents")
                          .getPublicUrl(doc.storage_path);
                        window.open(data.publicUrl, "_blank");
                      }}
                    >
                      ABRIR
                    </Button>
                  </div>
                ))}

                {processDocs.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-border rounded-xl bg-muted/10">
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum documento anexado ainda.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                variant="outline"
                className="h-12 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-xs tracking-wide"
                onClick={handleRejectDocuments}
                disabled={isSaving}
              >
                <XCircle className="h-4 w-4 mr-2" />
                REJEITAR / PEDIR RECORREÇÃO
              </Button>
              <Button
                className="h-12 bg-accent hover:bg-green-dark text-white font-bold text-xs tracking-wide shadow-lg shadow-accent/20"
                onClick={handleApproveDocuments}
                disabled={isSaving || processDocs.length === 0}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                APROVAR DOCUMENTOS
              </Button>
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
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  E-mail
                </p>
                <p className="text-sm font-medium break-all leading-tight">
                  {order.client_email}
                </p>
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

      {order.user_service_id && (
        <DS160ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          serviceId={order.user_service_id}
          lang={lang}
        />
      )}
    </div>
  );
}
