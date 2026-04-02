import { BaseProductFlow } from "./BaseProductFlow";
import { IFlowStep } from "../interfaces/IProductFlow";

/**
 * COS Product Flow Strategy
 * Handles Change of Status (COS) and Extension of Status processes.
 * Decoupled from B1/B2 and F1 products.
 */
export class COSProductFlow extends BaseProductFlow {
  // Exclusive statuses for COS as requested
  public static readonly STATUSS = {
    // Phase 1: Onboarding
    COS_INITIAL_PHOTO: "COS_INITIAL_PHOTO",
    COS_VISA_INFO: "COS_VISA_INFO",
    COS_DEPENDENTS: "COS_DEPENDENTS",
    COS_I94_COLLECTION: "COS_I94_COLLECTION",
    
    // Phase 2: Admin Screening
    COS_ADMIN_SCREENING: "COS_ADMIN_SCREENING",
    
    // Phase 3: Official Forms
    COS_OFFICIAL_FORMS: "COS_OFFICIAL_FORMS",
    COS_OFFICIAL_FORMS_REVIEW: "COS_OFFICIAL_FORMS_REVIEW",
    
    // Phase 4: Cover Letter
    COS_COVER_LETTER_FORM: "COS_COVER_LETTER_FORM",
    COS_COVER_LETTER_WEBHOOK: "COS_COVER_LETTER_WEBHOOK",
    COS_COVER_LETTER_ADMIN_REVIEW: "COS_COVER_LETTER_ADMIN_REVIEW",
    
    // Phase 5: F1 Specific Rules (Optional Phase based on target visa)
    COS_F1_I20: "COS_F1_I20",
    COS_F1_I20_REVIEW: "COS_F1_I20_REVIEW",
    COS_F1_SEVIS: "COS_F1_SEVIS",
    COS_SEVIS_FEE_REVIEW: "COS_SEVIS_FEE_REVIEW",
    
    // Phase 6: Consolidation
    COS_FINAL_FORMS: "COS_FINAL_FORMS",
    COS_FINAL_FORMS_REVIEW: "COS_FINAL_FORMS_REVIEW",
    COS_PACKAGE_READY: "COS_PACKAGE_READY",
    COS_TRACKING: "COS_TRACKING",
    ANALISE_PENDENTE: "ANALISE_PENDENTE",
    RFE: "RFE",
    MOTION_PREPARATION: "MOTION_PREPARATION",
    MOTION_SENT: "MOTION_SENT",
    COS_COMPLETED: "COS_COMPLETED",
    COS_REJECTED: "COS_REJECTED",
  };

  protected steps: IFlowStep[] = [
    // Phase 1
    {
      id: COSProductFlow.STATUSS.COS_INITIAL_PHOTO,
      label: "Onboarding: Foto Inicial",
      description: "Upload de foto inicial obrigatória.",
    },
    {
      id: COSProductFlow.STATUSS.COS_VISA_INFO,
      label: "Onboarding: Visto Atual e Destino",
      description: "Preenchimento dos dados sobre o visto atual e o objetivo da troca.",
    },
    {
      id: COSProductFlow.STATUSS.COS_DEPENDENTS,
      label: "Onboarding: Gestão de Dependentes",
      description: "Cadastro de dependentes com validação de elegibilidade por idade e casamento.",
    },
    {
      id: COSProductFlow.STATUSS.COS_I94_COLLECTION,
      label: "Onboarding: Coleta de I-94",
      description: "Instruções e upload do registro de entrada/saída I-94.",
    },
    // Phase 2
    {
      id: COSProductFlow.STATUSS.COS_ADMIN_SCREENING,
      label: "Triagem: Revisão de Documentos",
      description: "Revisão manual dos itens obrigatórios pelo administrador.",
    },
    // Phase 3
    {
      id: COSProductFlow.STATUSS.COS_OFFICIAL_FORMS,
      label: "Formulários: I-539 / I-539A",
      description: "Preenchimento e upload dos formulários oficiais da USCIS.",
    },
    {
      id: COSProductFlow.STATUSS.COS_OFFICIAL_FORMS_REVIEW,
      label: "Revisão: I-539 / I-539A",
      description: "Revisão administrativa dos formulários oficiais assinados.",
    },
    // Phase 4
    {
      id: COSProductFlow.STATUSS.COS_COVER_LETTER_FORM,
      label: "Cover Letter: Questionário",
      description: "Respostas detalhadas para a geração da carta de intenção.",
    },
    {
      id: COSProductFlow.STATUSS.COS_COVER_LETTER_WEBHOOK,
      label: "Cover Letter: Gerando PDF",
      description: "Processamento via IA para criação do documento oficial.",
      isAutomated: true,
    },
    {
      id: COSProductFlow.STATUSS.COS_COVER_LETTER_ADMIN_REVIEW,
      label: "Cover Letter: Revisão Admin",
      description: "Revisão e edição final da carta pelo administrador.",
    },
    // Phase 5
    {
      id: COSProductFlow.STATUSS.COS_F1_I20,
      label: "F1: Upload I-20",
      description: "Upload do formulário I-20 para vistos de estudante.",
    },
    {
      id: COSProductFlow.STATUSS.COS_F1_I20_REVIEW,
      label: "F1: Revisão I-20",
      description: "Revisão administrativa do formulário I-20.",
    },
    {
      id: COSProductFlow.STATUSS.COS_F1_SEVIS,
      label: "F1: Taxa SEVIS",
      description: "Pagamento e comprovante da taxa SEVIS ($350).",
    },
    {
      id: COSProductFlow.STATUSS.COS_SEVIS_FEE_REVIEW,
      label: "F1: Revisão SEVIS",
      description: "Revisão administrativa do comprovante SEVIS.",
    },
    // Phase 6
    {
      id: COSProductFlow.STATUSS.COS_FINAL_FORMS,
      label: "Consolidação: G-1145 / G-1450",
      description: "Preenchimento e upload dos formulários de notificação e pagamento.",
    },
    {
      id: COSProductFlow.STATUSS.COS_FINAL_FORMS_REVIEW,
      label: "Revisão: Formulários Finais",
      description: "Revisão administrativa dos formulários finais.",
    },
    {
      id: COSProductFlow.STATUSS.COS_PACKAGE_READY,
      label: "Pronto: Pacote Finalizado",
      description: "Geração do pacote único (PDF) seguindo a ordem da USCIS.",
    },
    {
      id: COSProductFlow.STATUSS.COS_TRACKING,
      label: "Acompanhamento: Enviado ao USCIS",
      description: "Aguardando confirmação de recebimento e processamento pelo USCIS.",
    },
    {
      id: COSProductFlow.STATUSS.ANALISE_PENDENTE,
      label: "Análise: Especialista em Ação",
      description: "Um especialista está analisando seu caso para definir a melhor estratégia.",
    },
    {
      id: COSProductFlow.STATUSS.RFE,
      label: "Recuperação: RFE Recebido",
      description: "Tratamento de solicitação de informação adicional (RFE).",
    },
    {
      id: COSProductFlow.STATUSS.MOTION_PREPARATION,
      label: "Recuperação: Elaborando Motion",
      description: "Redação técnica da defesa/reconsideração do processo.",
    },
    {
      id: COSProductFlow.STATUSS.MOTION_SENT,
      label: "Recuperação: Motion Enviado",
      description: "A defesa técnica foi protocolada junto ao USCIS.",
    },
    {
      id: COSProductFlow.STATUSS.COS_COMPLETED,
      label: "Finalizado: Caso Aprovado",
      description: "Processo concluído com sucesso pelo USCIS.",
    },
    {
      id: COSProductFlow.STATUSS.COS_REJECTED,
      label: "Finalizado: Caso Negado",
      description: "Processo encerrado após negativa definitiva.",
    },
  ];

  canTransitionTo(from: string, to: string): boolean {
    // State machine logic for complex loops
    
    // Always allow going back to screening or questionnaire if rejected by admin
    if (to === COSProductFlow.STATUSS.COS_ADMIN_SCREENING) return true;
    if (to === COSProductFlow.STATUSS.COS_COVER_LETTER_FORM) return true;

    // Phase 4 loop: Webhook -> Admin Review
    if (from === COSProductFlow.STATUSS.COS_COVER_LETTER_WEBHOOK && to === COSProductFlow.STATUSS.COS_COVER_LETTER_ADMIN_REVIEW) return true;
    
    // Phase 5 review transitions
    if (from === COSProductFlow.STATUSS.COS_F1_I20 && to === COSProductFlow.STATUSS.COS_F1_I20_REVIEW) return true;
    if (from === COSProductFlow.STATUSS.COS_F1_I20_REVIEW && to === COSProductFlow.STATUSS.COS_F1_SEVIS) return true;
    if (from === COSProductFlow.STATUSS.COS_F1_SEVIS && to === COSProductFlow.STATUSS.COS_SEVIS_FEE_REVIEW) return true;
    if (from === COSProductFlow.STATUSS.COS_SEVIS_FEE_REVIEW && to === COSProductFlow.STATUSS.COS_FINAL_FORMS) return true;
    if (from === COSProductFlow.STATUSS.COS_FINAL_FORMS && to === COSProductFlow.STATUSS.COS_FINAL_FORMS_REVIEW) return true;
    if (from === COSProductFlow.STATUSS.COS_FINAL_FORMS_REVIEW && to === COSProductFlow.STATUSS.COS_PACKAGE_READY) return true;
    
    // Ensure sequential flow for initial onboarding tasks
    const fromIndex = this.steps.findIndex(s => s.id === from);
    const toIndex = this.steps.findIndex(s => s.id === to);

    if (toIndex === fromIndex + 1) return true;

    // Allow jumping to completion from any administrative success
    if (to === COSProductFlow.STATUSS.COS_COMPLETED) return true;

    return super.canTransitionTo(from, to);
  }

  // Helper for dependent validation as requested in business logic
  public static validateDependent(birthDate: string, relationship: string, marriageDate?: string): { alerts: ("marriageAge" | "agingOut")[] } {
    const alerts: ("marriageAge" | "agingOut")[] = [];
    if (!birthDate) return { alerts };

    const birth = new Date(birthDate);
    const now = new Date();
    
    // Exact age calculation
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
    }

    // Logic 1: Children nearing 21 (aging out)
    if (relationship === "child" && age >= 20) {
      alerts.push("agingOut");
    }

    // Logic 2: Marriage after 18 (potential ineligibility for step-children or specific cases)
    if (marriageDate) {
      const marriage = new Date(marriageDate);
      let ageAtMarriage = marriage.getFullYear() - birth.getFullYear();
      const mm = marriage.getMonth() - birth.getMonth();
      if (mm < 0 || (mm === 0 && marriage.getDate() < birth.getDate())) {
          ageAtMarriage--;
      }
      
      if (ageAtMarriage >= 18) {
        alerts.push("marriageAge");
      }
    }

    return { alerts };
  }
}
