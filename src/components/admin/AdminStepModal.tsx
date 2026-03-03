import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    client_name: string;
    user_id: string;
    service_status: string;
    [key: string]: any;
  } | null;
}

export function AdminStepModal({
  isOpen,
  onClose,
  order,
}: AdminStepModalProps) {
  const navigate = useNavigate();
  if (!order) return null;

  const status = order.service_status || "unknown";

  const renderContent = () => {
    switch (status) {
      case "ds160InProgress":
      case "ds160Processing":
      case "ds160AwaitingReviewAndSignature":
      case "active":
      case "review_pending":
      case "review_assign":
        return (
          <div className="space-y-4">
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
          <DialogTitle className="flex items-center gap-2">
            Gestão do Processo
          </DialogTitle>
          <DialogDescription>
            Ações e informações para <strong>{order.client_name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">{renderContent()}</div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full lg:w-auto"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
