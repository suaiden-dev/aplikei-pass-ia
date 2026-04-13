import { useState, useEffect } from "react";
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
  MdLightbulbOutline,
  MdDescription
} from "react-icons/md";
import { toast } from "sonner";
import { processService, type UserService } from "../../../services/process.service";
import { coverLetterService } from "../../../services/cover_letter.service";
import { RiMagicLine } from "react-icons/ri";
import { useT } from "../../../i18n/LanguageContext";

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

interface Props {
  proc: UserService;
  user: any;
  onComplete: () => void;
}

export default function CoverLetterStep({ proc, user, onComplete }: Props) {
  const t = useT("onboarding");
  const [data, setData] = useState<CoverLetterData>({});
  const [html, setHtml] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"questions" | "preview">("questions");

  // Load saved data
  useEffect(() => {
    if (proc.step_data?.coverLetter) {
      setData(proc.step_data.coverLetter as CoverLetterData);
    }
    if (proc.step_data?.generatedCoverLetterHTML) {
      setHtml(proc.step_data.generatedCoverLetterHTML as string);
    } else if (user) {
      // Auto-generate initial version if none exists
      const initialHtml = coverLetterService.generateHTML(proc.step_data?.coverLetter || {}, user);
      setHtml(initialHtml);
    }
  }, [proc, user]);

  const handleChange = (field: keyof CoverLetterData, val: string) => {
    setData((prev) => ({ ...prev, [field]: val }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generatedHtml = coverLetterService.generateHTML(data, user);
      setHtml(generatedHtml);
      setViewMode("preview");
      toast.success(t.cos.coverLetter.toasts.generateSuccess);
    } catch (error) {
      toast.error(t.cos.coverLetter.toasts.generateError);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      await processService.updateStepData(proc.id, { 
        coverLetter: data,
        generatedCoverLetterHTML: html
      });
      toast.success(t.cos.coverLetter.toasts.saveSuccess);
    } catch (error) {
      toast.error(t.cos.coverLetter.toasts.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      await processService.updateStepData(proc.id, { 
        coverLetter: data,
        generatedCoverLetterHTML: html
      });
      onComplete(); // Advance step
    } catch (error) {
      toast.error(t.cos.coverLetter.toasts.advanceError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Intro Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 p-6 rounded-2xl border border-blue-100 flex items-start gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
          <MdLightbulbOutline className="text-2xl" />
        </div>
        <div>
          <h3 className="font-black text-blue-900 text-[13px] uppercase tracking-widest mb-1 mt-0.5">
            {t.cos.coverLetter.introTitle}
          </h3>
          <p className="text-sm text-blue-700/80 font-medium leading-relaxed">
            {t.cos.coverLetter.introDesc}
          </p>
        </div>
      </div>

      <div className="flex gap-4 p-1 bg-slate-100/50 rounded-2xl w-fit">
        <button
          onClick={() => setViewMode("questions")}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            viewMode === "questions" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          {t.cos.coverLetter.tabs.questions}
        </button>
        <button
          onClick={() => setViewMode("preview")}
          disabled={!html}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            viewMode === "preview" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600 disabled:opacity-30"
          }`}
        >
          {t.cos.coverLetter.tabs.preview}
        </button>
      </div>

      {viewMode === "questions" ? (
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
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.locationsVisited}
              value={data.locationsVisited}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("locationsVisited", val)}
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.reasonB1B2}
              value={data.reasonB1B2}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("reasonB1B2", val)}
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.jobInBrazil}
              value={data.jobInBrazil}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("jobInBrazil", val)}
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
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.reasonStatusChange}
              value={data.reasonStatusChange}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("reasonStatusChange", val)}
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.careerBenefit}
              value={data.careerBenefit}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("careerBenefit", val)}
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
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.whyNotBrazil}
              value={data.whyNotBrazil}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("whyNotBrazil", val)}
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
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.financialSupport}
              value={data.financialSupport}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("financialSupport", val)}
            />
            <TextAreaField
              label={t.cos.coverLetter.questions.sponsorInfo}
              value={data.sponsorInfo}
              placeholder={t.cos.coverLetter.placeholders.typeAnswer}
              onChange={(val) => handleChange("sponsorInfo", val)}
            />
          </div>
        </div>
      </div>
    ) : (
        <div className="bg-white rounded-3xl border-2 border-primary/20 shadow-xl shadow-primary/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-primary">
                <MdDescription className="text-lg" />
              </div>
              <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-widest">
                {t.cos.coverLetter.sections.preview}
              </h3>
            </div>
            <p className="text-[10px] font-bold text-slate-400 italic">{t.cos.coverLetter.previewInfo}</p>
          </div>
          <div className="p-8">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 overflow-auto max-h-[600px]">
              <div 
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3">
              <RiInformationLine className="text-amber-500 text-xl shrink-0" />
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                {t.cos.coverLetter.editInfo}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-72 right-0 bg-white border-t border-slate-200 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 flex items-center gap-4">
        <button
          onClick={saveDraft}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-100 text-sm font-black text-slate-500 hover:bg-slate-50 hover:border-slate-200 transition-all disabled:opacity-50"
        >
          {isSaving ? <RiLoader4Line className="animate-spin text-lg" /> : <RiSave3Line className="text-lg" />}
          {t.cos.coverLetter.btns.saveDraft}
        </button>

        <div className="flex-1" />

        {viewMode === "questions" ? (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-10 py-3.5 rounded-xl bg-slate-900 text-white text-sm font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-slate-200 transition-all flex-1 md:flex-none justify-center"
          >
            {isGenerating ? <RiLoader4Line className="animate-spin text-lg" /> : <RiMagicLine className="text-lg" />}
            {t.cos.coverLetter.btns.generate}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-12 py-3.5 rounded-xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex-1 md:flex-none justify-center"
          >
            {isSubmitting ? <RiLoader4Line className="animate-spin text-lg" /> : <RiCheckDoubleLine className="text-lg" />}
            {t.cos.coverLetter.btns.advance}
          </button>
        )}
      </div>

    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-700 tracking-tight block">
        {label}
      </label>
      <textarea
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="w-full h-28 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none shadow-sm"
        placeholder={placeholder || "Type your answer here..."}
      />
    </div>
  );
}
