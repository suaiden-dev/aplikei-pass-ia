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

  const isCOS = serviceSlug === "troca-status" || serviceSlug === "extensao-status";
  const totalSteps = isCOS ? 6 : TOTAL_STEPS;

  // Normalização de status
  let normalizedStatus = status;
  if (isCOS) {
    if (status === "active") normalizedStatus = "cosInProgress";
    else if (status === "review_pending") normalizedStatus = "cosProcessing";
    else if (status === "COS_OFFICIAL_FORMS") normalizedStatus = "cosOfficialForms";
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
