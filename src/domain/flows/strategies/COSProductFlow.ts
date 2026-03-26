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
    
    // Phase 4: Cover Letter
    COS_COVER_LETTER_FORM: "COS_COVER_LETTER_FORM",
    COS_COVER_LETTER_WEBHOOK: "COS_COVER_LETTER_WEBHOOK",
    COS_COVER_LETTER_ADMIN_REVIEW: "COS_COVER_LETTER_ADMIN_REVIEW",
    
    // Phase 5: F1 Specific Rules (Optional Phase based on target visa)
    COS_F1_I20: "COS_F1_I20",
    COS_F1_SEVIS: "COS_F1_SEVIS",
    
    // Phase 6: Consolidation
    COS_PACKAGE_READY: "COS_PACKAGE_READY",
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
      description: "Revisão manual dos 6 itens obrigatórios pelo administrador.",
    },
    // Phase 3
    {
      id: COSProductFlow.STATUSS.COS_OFFICIAL_FORMS,
      label: "Formulários: I-539 / I-539A",
      description: "Preenchimento e upload dos formulários oficiais da USCIS.",
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
      id: COSProductFlow.STATUSS.COS_F1_SEVIS,
      label: "F1: Taxa SEVIS",
      description: "Pagamento e comprovante da taxa SEVIS ($350).",
    },
    // Phase 6
    {
      id: COSProductFlow.STATUSS.COS_PACKAGE_READY,
      label: "Consolidação: Package Final",
      description: "Geração do pacote único (PDF) seguindo a ordem da USCIS.",
    },
    {
      id: COSProductFlow.STATUSS.COS_COMPLETED,
      label: "Finalizado",
      description: "Processo de Mudança de Status concluído.",
    },
    {
      id: COSProductFlow.STATUSS.COS_REJECTED,
      label: "Rejeitado",
      description: "Processo encerrado por negativa ou cancelamento.",
    },
  ];

  canTransitionTo(from: string, to: string): boolean {
    // State machine logic for complex loops
    
    // Always allow going back to screening or questionnaire if rejected by admin
    if (to === COSProductFlow.STATUSS.COS_ADMIN_SCREENING) return true;
    if (to === COSProductFlow.STATUSS.COS_COVER_LETTER_FORM) return true;

    // Phase 4 loop: Webhook -> Admin Review
    if (from === COSProductFlow.STATUSS.COS_COVER_LETTER_WEBHOOK && to === COSProductFlow.STATUSS.COS_COVER_LETTER_ADMIN_REVIEW) return true;
    
    // Ensure sequential flow for initial onboarding tasks
    const fromIndex = this.steps.findIndex(s => s.id === from);
    const toIndex = this.steps.findIndex(s => s.id === to);

    if (toIndex === fromIndex + 1) return true;

    // Allow jumping to completion from any administrative success
    if (to === COSProductFlow.STATUSS.COS_COMPLETED) return true;

    return super.canTransitionTo(from, to);
  }

  // Helper for dependent validation as requested in business logic
  public static validateDependent(birthDate: string, marriageDate?: string): { isEligible: boolean; alerts: string[] } {
    const alerts: string[] = [];
    const birth = new Date(birthDate);
    const now = new Date();
    const age = now.getFullYear() - birth.getFullYear();

    // Lógica 1: Filhos a menos de 1 ano de fazer 21 anos
    if (age >= 20 && age < 21) {
      alerts.push("Alerta: Dependente próximo de completar 21 anos (necessita nova aplicação em breve).");
    }

    // Lógica 2: Casamento após 18 anos
    if (marriageDate) {
      const marriage = new Date(marriageDate);
      const ageAtMarriage = marriage.getFullYear() - birth.getFullYear();
      if (ageAtMarriage < 18) {
        alerts.push("Alerta de Elegibilidade: Casamento realizado antes dos 18 anos do dependente.");
      }
    }

    return { isEligible: true, alerts };
  }
}
