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
}
