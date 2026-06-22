import { useState } from "react";
import { 
  RiInformationLine, 
  RiSave3Line,
  RiCheckDoubleLine,
  RiLoader4Line
} from "react-icons/ri";
import { 
  MdOutlineGpsFixed, 
  MdSchool, 
  MdAccountBalanceWallet,
  MdLightbulbOutline
} from "react-icons/md";
import { toast } from "sonner";
import { useT } from "@app/app/i18n";
import { coverLetterService } from "@features/onboarding/cos/lib/cover-letter";
import * as processService from "@features/process/services/processOps";
import type { UserService } from "@features/process/types";
import { HomologationAutofillButton } from "./components/HomologationAutofillButton";
import { getCosStepData } from "../../lib/cosStepData";

interface CoverLetterData {
  reasonGoUS?: string;
  locationsVisited?: string;
  reasonB1B2?: string;
  jobInBrazil?: string;
  reasonNotF1Directly?: string;
  reasonStatusChange?: string;
  careerBenefit?: string;
  specificCourse?: string;
  whyNotBrazil?: string;
  residenceInBrazil?: string;
  financialSupport?: string;
  sponsorInfo?: string;
}

type CoverLetterCopy = {
  introTitle: string;
  introDesc: string;
  sections: Record<string, string>;
  questions: Record<string, string>;
  placeholders: Record<string, string>;
  btns: Record<string, string>;
  toasts: Record<string, string>;
};

type OnboardingCoverLetterText = {
  cos: {
    coverLetter: CoverLetterCopy;
  };
};

interface Props {
  proc: UserService;
  user: {
    id: string;
    email?: string;
    fullName?: string;
    full_name?: string;
    phone?: string;
    phoneNumber?: string;
  };
  onComplete: () => Promise<void> | void;
  isReadOnly?: boolean;
}

export default function CoverLetterStep({ proc, user, onComplete, isReadOnly = false }: Props) {
  const t = useT("onboarding") as OnboardingCoverLetterText;
  const stepData = getCosStepData(proc.step_data);
  const [data, setData] = useState<CoverLetterData>(() =>
    (stepData.coverLetter as CoverLetterData) || {},
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!t || !t.cos) return null;

  const handleChange = (field: keyof CoverLetterData, val: string) => {
    setData((prev) => ({ ...prev, [field]: val }));
  };

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      const generatedHtml = coverLetterService.generateHTML(data, user);
      await processService.updateStepData(proc.id, { 
        coverLetter: data,
        generatedCoverLetterHTML: generatedHtml
      });
      toast.success(t.cos.coverLetter.toasts.saveSuccess);
    } catch {
      toast.error(t.cos.coverLetter.toasts.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      const generatedHtml = coverLetterService.generateHTML(data, user);
      await processService.updateStepData(proc.id, { 
        coverLetter: data,
        generatedCoverLetterHTML: generatedHtml
      });

      await onComplete(); // Advance step first
      await processService.requestStepReview(proc.id);
    } catch {
      toast.error(t.cos.coverLetter.toasts.advanceError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="homologation-form-cover-letter" className="space-y-6 pb-6">
      {/* Intro / Status Box */}
      {isReadOnly ? (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50/30 p-6 rounded-2xl border border-amber-100 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <RiLoader4Line className="text-2xl animate-spin" />
          </div>
          <div>
            <h3 className="font-black text-amber-900 text-[13px] uppercase tracking-widest mb-1 mt-0.5 animate-pulse">
              Aguardando Análise do Especialista
            </h3>
            <p className="text-sm text-amber-700/80 font-medium leading-relaxed">
              As suas respostas para a elaboração da carta de suporte já foram enviadas. O gerente do seu caso está analisando as informações para gerar o documento final.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 p-6 rounded-2xl border border-blue-100 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
            <MdLightbulbOutline className="text-2xl" />
          </div>
          <div>
            <div className="mb-3">
              <HomologationAutofillButton rootId="homologation-form-cover-letter" />
            </div>
            <h3 className="font-black text-blue-900 text-[13px] uppercase tracking-widest mb-1 mt-0.5">
              {t.cos.coverLetter.introTitle}
            </h3>
            <p className="text-sm text-blue-700/80 font-medium leading-relaxed">
              {t.cos.coverLetter.introDesc}
            </p>
          </div>
        </div>
      )}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* BACKGROUND */}
        <div className="border-b border-slate-100 last:border-0">
          <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-slate-500">
              <MdOutlineGpsFixed className="text-lg" />
            </div>
            <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-widest">
              {t.cos.coverLetter.sections.background}
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <TextAreaField
              label={t.cos.coverLetter.questions.reasonGoUS}
              value={data.reasonGoUS}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("reasonGoUS", val)}
              disabled={isReadOnly}
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.locationsVisited}
              value={data.locationsVisited}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("locationsVisited", val)}
              disabled={isReadOnly}
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.reasonB1B2}
              value={data.reasonB1B2}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("reasonB1B2", val)}
              disabled={isReadOnly}
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.jobInBrazil}
              value={data.jobInBrazil}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("jobInBrazil", val)}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* THE REASON FOR CHANGE */}
        <div className="border-b border-slate-100 last:border-0">
          <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-slate-500">
              <RiInformationLine className="text-lg" />
            </div>
            <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-widest">
              {t.cos.coverLetter.sections.reasonForChange}
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <TextAreaField
              label={t.cos.coverLetter.questions.reasonNotF1Directly}
              value={data.reasonNotF1Directly}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("reasonNotF1Directly", val)}
              disabled={isReadOnly}
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.reasonStatusChange}
              value={data.reasonStatusChange}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("reasonStatusChange", val)}
              disabled={isReadOnly}
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.careerBenefit}
              value={data.careerBenefit}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("careerBenefit", val)}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* STUDY PLAN */}
        <div className="border-b border-slate-100 last:border-0">
          <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-slate-500">
              <MdSchool className="text-lg" />
            </div>
            <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-widest">
              {t.cos.coverLetter.sections.studyPlan}
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <TextAreaField
              label={t.cos.coverLetter.questions.specificCourse}
              value={data.specificCourse}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("specificCourse", val)}
              disabled={isReadOnly}
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.whyNotBrazil}
              value={data.whyNotBrazil}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("whyNotBrazil", val)}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* TIES & FINANCIALS */}
        <div className="border-b border-slate-100 last:border-0">
          <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-slate-500">
              <MdAccountBalanceWallet className="text-lg" />
            </div>
            <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-widest">
              {t.cos.coverLetter.sections.tiesFinancials}
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <TextAreaField
              label={t.cos.coverLetter.questions.residenceInBrazil}
              value={data.residenceInBrazil}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("residenceInBrazil", val)}
              disabled={isReadOnly}
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.financialSupport}
              value={data.financialSupport}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("financialSupport", val)}
              disabled={isReadOnly}
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.sponsorInfo}
              value={data.sponsorInfo}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("sponsorInfo", val)}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Action Bar */}
        {!isReadOnly && (
          <div className="bg-slate-50/80 px-8 py-5 border-t border-slate-100 flex flex-col-reverse md:flex-row items-center justify-between gap-4">
            <button
              onClick={saveDraft}
              disabled={isSaving}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-black text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 shadow-sm"
            >
              {isSaving ? <RiLoader4Line className="animate-spin text-lg" /> : <RiSave3Line className="text-lg" />}
              {t.cos.coverLetter.btns.saveDraft}
            </button>

            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 md:px-12 py-3.5 rounded-xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all cursor-pointer"
            >
              {isSubmitting ? <RiLoader4Line className="animate-spin text-lg" /> : <RiCheckDoubleLine className="text-lg" />}
              {t.cos.coverLetter.btns.send}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, disabled }: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-700 tracking-tight block">
        {label}
      </label>
      <textarea
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full h-28 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none shadow-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
        placeholder={placeholder || "Type your answer here..."}
      />
    </div>
  );
}
