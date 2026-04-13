import { useState } from "react";
import {
  RiMailCheckLine,
  RiCheckLine,
  RiLoader4Line,
  RiInformationLine,
} from "react-icons/ri";
import { useT } from "../../../../i18n/LanguageContext";
import { processService } from "../../../../services/process.service";
import { toast } from "sonner";
import confirmationEmailImg from "../../../../assets/email/confirmation_email.png";

interface B1B2UserConfirmEmailStepProps {
  procId: string;
  onComplete: () => void;
  onBack: () => void;
}

export function B1B2UserConfirmEmailStep({ procId, onComplete, onBack }: B1B2UserConfirmEmailStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useT("visas");

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Step 8 (idx 7) is the last one in our list currently
      await processService.approveStep(procId, 8, false);
      await processService.requestStepReview(procId);
      toast.success(t.onboardingPage.emailConfirmation.confirmedSuccess);
      onComplete();
    } catch (err: unknown) {
      toast.error((err as Error).message || t.onboardingPage.emailConfirmation.confirmedError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <RiMailCheckLine className="text-3xl" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          {t.onboardingPage.emailConfirmation.title}
        </h2>
        <p className="text-sm font-medium text-slate-400 mt-2 max-w-xl mx-auto">
          {t.onboardingPage.emailConfirmation.desc}
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
          <RiInformationLine className="text-xl" />
        </div>
        <div>
          <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">
            {t.onboardingPage.emailConfirmation.whatToDo}
          </h3>
          <p className="text-sm text-amber-800 font-medium leading-relaxed">
            {t.onboardingPage.emailConfirmation.accessEmailDesc}
          </p>
        </div>
      </div>

      {/* Example Image */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
            {t.onboardingPage.emailConfirmation.exampleEmail}
          </h3>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            {t.onboardingPage.emailConfirmation.exampleAppearance}
          </p>
        </div>
        <div className="p-4 bg-slate-50 flex justify-center">
          <img
            src={confirmationEmailImg}
            alt={t.onboardingPage.emailConfirmation.exampleEmail}
            className="rounded-xl border border-slate-200 max-w-full shadow-sm"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
        >
          {t.onboardingPage.previous}
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSubmitting ? (
            <RiLoader4Line className="animate-spin text-lg" />
          ) : (
            <>
              {t.onboardingPage.emailConfirmation.alreadyConfirmed}
              <RiCheckLine className="text-lg" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
