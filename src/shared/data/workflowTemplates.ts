export interface StepTemplate {
  id: string;
  title: string;
  description: string;
  type: "form" | "admin_action" | "upload";
}

export const RFE_STEPS_TEMPLATE: StepTemplate[] = [
  {
    id: "cos_rfe_explanation",
    title: "RFE — O que aconteceu?",
    description: "Entenda o que é uma RFE e quais são os próximos passos.",
    type: "form",
  },
  {
    id: "cos_rfe_instruction",
    title: "RFE — Suas Informações",
    description: "Envie os documentos e informações solicitados pelo USCIS.",
    type: "form",
  },
  {
    id: "cos_rfe_proposal",
    title: "RFE — Proposta",
    description: "Nosso time está preparando a estratégia de resposta.",
    type: "admin_action",
  },
  {
    id: "cos_rfe_accept_proposal",
    title: "RFE — Aceitar e Pagar",
    description: "Revise a proposta e realize o pagamento para prosseguir.",
    type: "form",
  },
  {
    id: "cos_rfe_final_ship",
    title: "RFE — Resultado",
    description: "Acompanhe o resultado da sua resposta à RFE.",
    type: "admin_action",
  },
  {
    id: "cos_rfe_end",
    title: "RFE — Resultado",
    description: "Acompanhe o resultado da sua resposta à RFE.",
    type: "form",
  },
];

export const MOTION_STEPS_TEMPLATE: StepTemplate[] = [
  {
    id: "cos_motion_acquisition",
    title: "Motion — Adquirir",
    description: "Contrate o serviço de Motion para reverter a negativa.",
    type: "form",
  },
  {
    id: "cos_motion_instruction",
    title: "Motion — Suas Informações",
    description: "Envie os documentos e detalhes da negativa recebida.",
    type: "form",
  },
  {
    id: "cos_motion_proposal",
    title: "Motion — Proposta",
    description: "Nosso time está preparando a estratégia do Motion.",
    type: "admin_action",
  },
  {
    id: "cos_motion_accept_proposal",
    title: "Motion — Pagar e Aceitar",
    description: "Revise a proposta e realize o pagamento.",
    type: "form",
  },
  {
    id: "cos_motion_end",
    title: "Motion — Resultado",
    description: "Acompanhe o resultado final do seu Motion.",
    type: "admin_action",
  },
];
