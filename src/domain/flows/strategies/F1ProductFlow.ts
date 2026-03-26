import { BaseProductFlow } from "./BaseProductFlow";
import { IFlowStep } from "../interfaces/IProductFlow";

export class F1ProductFlow extends BaseProductFlow {
  protected steps: IFlowStep[] = [
    {
      id: "ds160InProgress",
      label: "1. F1: Preenchimento",
      description: "O cliente está preenchendo as informações para o visto F1.",
    },
    {
      id: "ds160Processing",
      label: "2. F1: Processando Admin",
      description: "O administrador está processando os dados do formulário F1.",
      isAutomated: true,
    },
    {
      id: "ds160upload_documents",
      label: "3. F1: Anexar Documentos",
      description: "O cliente deve anexar o formulário assinado e o comprovante de envio.",
    },
    {
      id: "ds160AwaitingReviewAndSignature",
      label: "4. F1: Revisão e Assinatura",
      description: "O administrador está revisando ou aguardando assinatura do cliente.",
    },
    {
      id: "approved",
      label: "Aprovado",
      description: "Visto F1 aprovado.",
    },
    {
      id: "rejected",
      label: "Rejeitado",
      description: "Visto F1 rejeitado.",
    },
  ];

  canTransitionTo(from: string, to: string): boolean {
    if (from === "ds160Processing" && to === "ds160upload_documents") return true;
    return super.canTransitionTo(from, to);
  }
}
