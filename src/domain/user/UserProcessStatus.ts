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

  // Normalização de status legados
  let normalizedStatus = status;
  if (status === "active") normalizedStatus = "ds160InProgress";
  if (status === "review_pending") normalizedStatus = "ds160Processing";
  if (status === "review_assign") normalizedStatus = "ds160AwaitingReviewAndSignature";
  if (status === "completed") normalizedStatus = "approved";

  let step = 0;
  let label = "";

  switch (normalizedStatus) {
    case "ds160InProgress":
      step = 1;
      label = tStatus.ds160InProgress[lang];
      break;
    case "ds160Processing":
      step = 2;
      label = tStatus.ds160Processing[lang];
      break;
    case "ds160upload_documents":
      step = 3;
      label = tStatus.ds160uploadDocuments[lang];
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
        totalSteps: TOTAL_STEPS,
      };
    case "approved":
      return {
        stepText: tStatus.approved[lang],
        label: tStatus.approved[lang],
        step: TOTAL_STEPS,
        totalSteps: TOTAL_STEPS,
      };
    default:
      return { stepText: "", label: status, step: 0, totalSteps: TOTAL_STEPS };
  }

  const stepText = tStatus.stepOf[lang]
    .replace("[step]", String(step))
    .replace("[total]", String(TOTAL_STEPS));

  return { stepText, label, step, totalSteps: TOTAL_STEPS };
};
