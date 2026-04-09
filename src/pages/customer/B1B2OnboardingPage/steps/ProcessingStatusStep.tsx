import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Loader2, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";

interface ProcessingStatusStepProps {
  status: string;
  serviceSlug?: string;
}

export function ProcessingStatusStep({ status, serviceSlug }: ProcessingStatusStepProps) {
  const { lang, t } = useLanguage();
  const ps = t.onboardingPage.processingStatus;
  const isCOS = serviceSlug === "changeofstatus";

  const isPending = status === "review_pending" || status === "ds160Processing" || status === "COS_ADMIN_SCREENING";
  const isAwaitingReview =
    status === "ds160AwaitingReviewAndSignature" ||
    status === "uploadsUnderReview" ||
    status === "COS_OFFICIAL_FORMS_REVIEW" ||
    status === "COS_COVER_LETTER_ADMIN_REVIEW" ||
    status === "COS_F1_I20_REVIEW" ||
    status === "COS_SEVIS_FEE_REVIEW" ||
    status === "COS_FINAL_FORMS_REVIEW";

  const getFriendlyStatus = (rawStatus: string) => {
    switch (rawStatus) {
      case "review_pending":
      case "ds160Processing":
      case "COS_ADMIN_SCREENING":
        return isCOS ? ps.processingCOS[lang] : ps.processingDS160[lang];
      case "ds160AwaitingReviewAndSignature":
      case "review_assign":
        return ps.awaitingReview[lang];
      case "uploadsUnderReview":
        return ps.reviewingDocs[lang];
      case "COS_OFFICIAL_FORMS_REVIEW":
        return ps.awaitingReview[lang];
      case "COS_COVER_LETTER_ADMIN_REVIEW":
        return ps.reviewingDocs[lang];
      case "COS_F1_I20_REVIEW":
        return ps.reviewingI20[lang];
      case "COS_SEVIS_FEE_REVIEW":
        return ps.reviewingSevis[lang];
      case "COS_FINAL_FORMS_REVIEW":
        return ps.awaitingReview[lang];
      case "casvSchedulingPending":
        return ps.awaitingScheduling[lang];
      case "ds160upload_documents":
        return ps.awaitingUpload[lang];
      default:
        return rawStatus.replace(/_/g, " ");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto space-y-5 min-h-[400px] flex flex-col justify-center">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-[32px] bg-accent/10 text-accent mb-2">
          {isPending ? (
            <Clock className="h-12 w-12 animate-pulse" />
          ) : (
            <ShieldCheck className="h-12 w-12" />
          )}
        </div>

        <h2 className="text-title md:text-title-xl font-black tracking-tight text-foreground">
          {isPending ? ps.processingDataTitle[lang] : ps.documentsReceivedTitle[lang]}
        </h2>

        <p className="text-body md:text-subtitle text-muted-foreground max-w-md mx-auto leading-relaxed">
          {isPending 
            ? (isCOS ? ps.processingDataDescCOS[lang] : ps.processingDataDesc[lang]) 
            : status === "COS_F1_I20_REVIEW"
              ? ps.processingDataDescI20[lang]
              : status === "COS_SEVIS_FEE_REVIEW"
                ? ps.processingDataDescSevis[lang]
                : ps.documentsReceivedDesc[lang]}
        </p>
      </div>

      <Card className="border-none bg-slate-50 dark:bg-slate-900/50 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden p-5">
        <CardContent className="p-0 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700">
            <div className="h-10 w-10 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
              <Loader2 className="h-5 w-5 text-accent animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {ps.currentStatus[lang]}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                {getFriendlyStatus(status)}
              </p>
            </div>
          </div>

          <div className="space-y-4 px-2">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {ps.trackProgress[lang]}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {ps.contactExtraData[lang]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-xs text-muted-foreground italic">
          {ps.thankYou[lang]}
        </p>
      </div>
    </div>
  );
}
