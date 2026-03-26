import { BaseProductFlow } from "./BaseProductFlow";
import { IFlowStep } from "../interfaces/IProductFlow";

export class B1ProductFlow extends BaseProductFlow {
  protected steps: IFlowStep[] = [
    {
      id: "ds160InProgress",
      label: "1. DS-160: Preenchimento",
      description: "O cliente está preenchendo as informações iniciais do formulário DS-160.",
    },
    {
      id: "ds160Processing",
      label: "2. DS-160: Processando",
      description: "O formulário foi enviado para processamento e geração de dados de segurança.",
      isAutomated: true,
    },
    {
      id: "ds160upload_documents",
      label: "3. DS-160: Anexar Documentos",
      description: "O cliente deve anexar o formulário assinado e o comprovante de envio.",
    },
    {
      id: "ds160AwaitingReviewAndSignature",
      label: "4. DS-160: Revisão e Assinatura",
      description: "O administrador está revisando os documentos anexados pelo cliente.",
    },
    {
      id: "casvSchedulingPending",
      label: "CASV: Agendamento Pendente",
      description: "Aguardando definição de data para coleta de biometria no CASV.",
    },
    {
      id: "casvFeeProcessing",
      label: "CASV: Taxa em Processamento",
      description: "Pagamento da taxa MRV em processamento ou aguardando compensação.",
    },
    {
      id: "casvPaymentPending",
      label: "CASV: Pagamento Pendente",
      description: "Aguardando o envio do comprovante de pagamento da taxa pelo cliente.",
    },
    {
      id: "awaitingInterview",
      label: "Aguardando Entrevista",
      description: "Agendamento confirmado. O cliente aguarda a data da entrevista no consulado.",
    },
    {
      id: "approved",
      label: "Aprovado",
      description: "Visto aprovado e processo concluído com sucesso.",
    },
    {
      id: "rejected",
      label: "Rejeitado",
      description: "O processo foi encerrado devido à negativa do visto ou cancelamento.",
    },
  ];

  canTransitionTo(from: string, to: string): boolean {
    // Specifically allow jump from ds160Processing to ds160upload_documents
    if (from === "ds160Processing" && to === "ds160upload_documents") return true;

    return super.canTransitionTo(from, to);
  }
}
