export const TOTAL_STEPS = 9;

export interface StatusDisplay {
  stepText: string;
  label: string;
  step: number;
  totalSteps: number;
}

export const getStatusDisplay = (
  status: string,
  lang: string,
  tStatus: Record<string, Record<string, string>>,
  serviceSlug?: string
): StatusDisplay => {
  if (!status) return { stepText: "", label: "", step: 0, totalSteps: TOTAL_STEPS };

  const isCOS = serviceSlug === "troca-status" || serviceSlug === "extensao-status" || serviceSlug === "changeofstatus";
  const totalSteps = isCOS ? 7 : TOTAL_STEPS;

  // Normalização de status
  let normalizedStatus = status;
  if (isCOS) {
    if (status === "active") normalizedStatus = "cosInProgress";
    else if (status === "review_pending") normalizedStatus = "cosProcessing";
    else if (status === "COS_OFFICIAL_FORMS") normalizedStatus = "cosOfficialForms";
    else if (status === "COS_TRACKING") normalizedStatus = "cosTracking";
    else if (status === "COS_RFE") normalizedStatus = "cosRfe";
    else if (status === "COS_APPROVED") normalizedStatus = "cosApproved";
    else if (status === "COS_REJECTED") normalizedStatus = "cosRejected";
    else if (status === "COS_REJECTED_ANALYSIS_PENDING") normalizedStatus = "cosRejectedAnalysisPending";
    else if (status === "COS_CASE_FORM") normalizedStatus = "cosCaseForm";
    else if (status === "ANALISE_PENDENTE") normalizedStatus = "cosAnalisePendente";
    else if (status === "ANALISE_CONCLUIDA") normalizedStatus = "cosAnaliseConcluida";
    else if (status === "COS_MOTION_IN_PROGRESS") normalizedStatus = "cosMotionInProgress";
    else if (status === "COS_MOTION_COMPLETED") normalizedStatus = "cosMotionCompleted";
    
    // EOS (Extension of Status)
    else if (status === "EOS_ADMIN_SCREENING") normalizedStatus = "cosAdminScreening";
    else if (status === "EOS_FORMS_SUBMITTED") normalizedStatus = "cosFormsSubmitted";
    else if (status === "EOS_OFFICIAL_FORMS") normalizedStatus = "cosOfficialForms";
    else if (status === "EOS_TRACKING") normalizedStatus = "cosTracking";
    else if (status === "EOS_RFE") normalizedStatus = "cosRfe";
    else if (status === "EOS_CASE_FORM") normalizedStatus = "cosCaseForm";
    else if (status === "EOS_MOTION_IN_PROGRESS") normalizedStatus = "cosMotionInProgress";
    else if (status === "EOS_MOTION_COMPLETED") normalizedStatus = "cosMotionCompleted";
  } else {
    if (status === "active") normalizedStatus = "ds160InProgress";
    if (status === "review_pending") normalizedStatus = "ds160Processing";
    if (status === "review_assign") normalizedStatus = "ds160AwaitingReviewAndSignature";
  }
  
  if (status === "completed") normalizedStatus = "approved";

  let step = 0;
  let label = "";

  switch (normalizedStatus) {
    case "ds160InProgress":
    case "cosInProgress":
      step = 1;
      label = isCOS ? (tStatus.cosInProgress?.[lang] || "1. Onboarding") : tStatus.ds160InProgress[lang];
      break;
    case "ds160Processing":
    case "cosProcessing":
      step = 2;
      label = isCOS ? (tStatus.cosProcessing?.[lang] || "2. Revisão") : tStatus.ds160Processing[lang];
      break;
    case "ds160upload_documents":
    case "cosOfficialForms":
      step = 3;
      label = isCOS ? (tStatus.cosOfficialForms?.[lang] || "3. Formulários Oficiais") : tStatus.ds160uploadDocuments[lang];
      break;
    case "ds160AwaitingReviewAndSignature":
    case "uploadsUnderReview":
      step = 4;
      label = normalizedStatus === "uploadsUnderReview" ? tStatus.uploadsUnderReview[lang] : tStatus.ds160AwaitingReviewAndSignature[lang];
      break;
    case "cosTracking":
    case "cosRfe":
      step = 7;
      label = normalizedStatus === "cosRfe" 
        ? (tStatus.cosRfe?.[lang] || "RFE Solicitado")
        : (tStatus.cosTracking?.[lang] || "7. Acompanhamento");
      break;
    case "cosCaseForm":
      step = 7;
      label = lang === "pt" ? "Instruções ao Especialista" : "Specialist Instructions";
      break;
    case "cosAnalisePendente":
      step = 7;
      label = lang === "pt" ? "Análise em Andamento" : "Analysis in Progress";
      break;
    case "cosAnaliseConcluida":
      step = 7;
      label = lang === "pt" ? "Proposta Disponível" : "Proposal Available";
      break;
    case "cosApproved":
      return {
        stepText: tStatus.approved[lang],
        label: tStatus.approved[lang],
        step: totalSteps,
        totalSteps: totalSteps,
      };
    case "cosRejected":
      return {
        stepText: tStatus.rejectedText[lang],
        label: "Revisão Necessária",
        step: 7,
        totalSteps: totalSteps,
      };
    case "cosRejectedAnalysisPending":
      return {
        stepText: "Análise em Andamento",
        label: "Análise Pendente",
        step: 7,
        totalSteps: totalSteps,
      };
    case "cosRejectedProposalReady":
      return {
        stepText: "Proposta Pronta",
        label: "Decisão Disponível",
        step: 7,
        totalSteps: totalSteps,
      };
    case "cosMotionInProgress":
      return {
        stepText: "Em Execução",
        label: lang === "pt" ? "Petição sendo Preparada" : "Petition Prep",
        step: 7,
        totalSteps: totalSteps,
      };
    case "cosMotionCompleted":
      return {
        stepText: "Concluido",
        label: lang === "pt" ? "Documentos Entregues" : "Files Delivered",
        step: totalSteps,
        totalSteps: totalSteps,
      };
    case "casvSchedulingPending":
      step = 5;
      label = tStatus.casvSchedulingPending[lang];
      break;
    case "casvFeeProcessing":
      step = 6;
      label = tStatus.casvFeeProcessing[lang];
      break;
    case "casvPaymentPending":
      step = 7;
      label = tStatus.casvPaymentPending[lang];
      break;
    case "awaitingInterview":
      step = 8;
      label = tStatus.awaitingInterview[lang];
      break;
    case "rejected":
      return {
        stepText: tStatus.rejectedText[lang],
        label: tStatus.rejectedLabel[lang],
        step: 0,
        totalSteps: totalSteps,
      };
    case "approved":
      return {
        stepText: tStatus.approved[lang],
        label: tStatus.approved[lang],
        step: totalSteps,
        totalSteps: totalSteps,
      };
    default:
      return { stepText: "", label: status, step: 0, totalSteps: totalSteps };
    }

  const stepText = (tStatus.stepOf?.[lang] || "Etapa [step] de [total]")
    .replace("[step]", String(step))
    .replace("[total]", String(totalSteps));

  return { stepText, label, step, totalSteps: totalSteps };
};
