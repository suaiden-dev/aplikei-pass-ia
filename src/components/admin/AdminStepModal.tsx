import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ClipboardList,
  Upload,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  Info,
  Clock,
  Loader2,
  Save,
  Fingerprint,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  order: {
    id: string;
    client_name: string;
    user_id: string;
    service_status: string;
    application_id?: string;
    product_slug: string;
    [key: string]: any;
  } | null;
}

export function AdminStepModal({
  isOpen,
  onClose,
  onRefresh,
  order,
}: AdminStepModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appId, setAppId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setAppId(order.application_id || "");
    }
  }, [order]);

  if (!order) return null;

  const status = order.service_status || "unknown";

  const handleSaveAppId = async () => {
    if (!appId.trim()) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("user_services")
        .update({
          application_id: appId.trim(),
          status: "review_assign", // Auto transition to Revise and Sign
        })
        .eq("user_id", order.user_id)
        .eq("service_slug", order.product_slug);

      if (error) throw error;

      toast({
        title: "Application ID salvo",
        description: "Status atualizado para 'Revise e Assine'.",
      });

      onRefresh?.();
      onClose();
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

  const renderContent = () => {
    switch (status) {
      case "ds160InProgress":
      case "ds160Processing":
      case "ds160AwaitingReviewAndSignature":
      case "active":
      case "review_pending":
      case "review_assign":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
              <ClipboardList className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-bold text-yellow-700">
                  Fluxo DS-160
                </p>
                <p className="text-xs text-yellow-600">
                  O cliente está preenchendo ou aguardando revisão do
                  formulário.
                </p>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-muted/40 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Fingerprint className="h-4 w-4 text-accent" />
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Application ID
                </label>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: AA00..."
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="font-mono"
                />
                <Button
                  size="sm"
                  onClick={handleSaveAppId}
                  disabled={isSaving || !appId.trim()}
                  className="bg-accent hover:bg-green-dark shrink-0"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Salvar o ID mudará o status para "Revise e Assine"
                automaticamente.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2 h-10 border-accent/20 text-accent hover:bg-accent/5"
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

      case "uploadsUnderReview":
        return (
          <div className="space-y-4">
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
            <Button className="w-full gap-2" variant="outline" disabled>
              <Upload className="h-4 w-4" />
              Acessar Área de Documentos
            </Button>
          </div>
        );

      case "casvSchedulingPending":
      case "casvFeeProcessing":
      case "casvPaymentPending":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900/30">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-bold text-purple-700">
                  Gestão de Taxas e Agendamento
                </p>
                <p className="text-xs text-purple-600">
                  Etapa de pagamento da taxa MRV e agendamento no
                  CASV/Consulado.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                Ver Comprovante
              </Button>
              <Button variant="outline" size="sm">
                Informar Data
              </Button>
            </div>
          </div>
        );

      case "awaitingInterview":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-900/30">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-bold text-orange-700">
                  Preparação para Entrevista
                </p>
                <p className="text-xs text-orange-600">
                  O cliente está aguardando ou se preparando para a entrevista
                  consular.
                </p>
              </div>
            </div>
            <Button className="w-full gap-2" variant="outline">
              <Info className="h-4 w-4" />
              Enviar Dicas de Entrevista
            </Button>
          </div>
        );

      case "approved":
      case "completed":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-bold text-green-700">
                  Processo Finalizado
                </p>
                <p className="text-xs text-green-600">
                  O visto foi aprovado e o processo concluído.
                </p>
              </div>
            </div>
          </div>
        );

      case "rejected":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/30">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-bold text-red-700">Visto Negado</p>
                <p className="text-xs text-red-600">
                  O processo foi encerrado com a negativa do visto.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Clock className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Informações detalhadas para este status ainda não disponíveis.
            </p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Gestão do Processo
          </DialogTitle>
          <DialogDescription>
            Ações e informações para <strong>{order.client_name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">{renderContent()}</div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose} className="w-full">
            Voltar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
