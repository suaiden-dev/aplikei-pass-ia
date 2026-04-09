import React, { useState, useEffect } from "react";
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
import { processService, type UserService } from "../../../services/process.service";

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
  onComplete: () => void;
}

export default function CoverLetterStep({ proc, onComplete }: Props) {
  const [data, setData] = useState<CoverLetterData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved data
  useEffect(() => {
    if (proc.step_data?.coverLetter) {
      setData(proc.step_data.coverLetter as CoverLetterData);
    }
  }, [proc]);

  const handleChange = (field: keyof CoverLetterData, val: string) => {
    setData((prev) => ({ ...prev, [field]: val }));
  };

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      await processService.updateStepData(proc.id, { coverLetter: data });
      toast.success("Rascunho salvo com sucesso.");
    } catch (error) {
      toast.error("Erro ao salvar rascunho.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      await processService.updateStepData(proc.id, { coverLetter: data });
      onComplete(); // Advance step
    } catch (error) {
      toast.error("Erro ao avançar.");
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
            AI Powered Generation
          </h3>
          <p className="text-sm text-blue-700/80 font-medium leading-relaxed">
            Answer the questions below in detail. Our AI will use this information to draft a highly persuasive and professional Presentation Letter for USCIS to maximize your chances of approval.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* BACKGROUND */}
        <div className="border-b border-slate-100 last:border-0">
          <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-slate-500">
              <MdOutlineGpsFixed className="text-lg" />
            </div>
            <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-widest">
              BACKGROUND
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <TextAreaField
              label="Why did you decide to go to the US?"
              value={data.reasonGoUS}
              onChange={(val) => handleChange("reasonGoUS", val)}
            />
            <TextAreaField
              label="Summary of locations visited in the US"
              value={data.locationsVisited}
              onChange={(val) => handleChange("locationsVisited", val)}
            />
            <TextAreaField
              label="Why did you request B1/B2 visa in your country?"
              value={data.reasonB1B2}
              onChange={(val) => handleChange("reasonB1B2", val)}
            />
            <TextAreaField
              label="What is your job in Brazil and what happens to it during your stay?"
              value={data.jobInBrazil}
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
              THE REASON FOR CHANGE
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <TextAreaField
              label="Why did not request F1 directly in your home country?"
              value={data.reasonNotF1Directly}
              onChange={(val) => handleChange("reasonNotF1Directly", val)}
            />
            <TextAreaField
              label="Why request status change instead of returning to your country?"
              value={data.reasonStatusChange}
              onChange={(val) => handleChange("reasonStatusChange", val)}
            />
            <TextAreaField
              label="How will this course benefit your career in Brazil?"
              value={data.careerBenefit}
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
              STUDY PLAN
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <TextAreaField
              label="Why this specific course and what are your academic plans?"
              value={data.specificCourse}
              onChange={(val) => handleChange("specificCourse", val)}
            />
            <TextAreaField
              label="Why not take this course in Brazil?"
              value={data.whyNotBrazil}
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
              TIES & FINANCIALS
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <TextAreaField
              label="What happens to your residence in Brazil during this period?"
              value={data.residenceInBrazil}
              onChange={(val) => handleChange("residenceInBrazil", val)}
            />
            <TextAreaField
              label="How will you support yourself financially in the US?"
              value={data.financialSupport}
              onChange={(val) => handleChange("financialSupport", val)}
            />
            <TextAreaField
              label="Do you have a sponsor? What is your relationship?"
              value={data.sponsorInfo}
              onChange={(val) => handleChange("sponsorInfo", val)}
            />
          </div>
        </div>

      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-72 right-0 bg-white border-t border-slate-200 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 flex items-center justify-between">
        <button
          onClick={saveDraft}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-100 text-sm font-black text-slate-500 hover:bg-slate-50 hover:border-slate-200 transition-all disabled:opacity-50"
        >
          {isSaving ? <RiLoader4Line className="animate-spin text-lg" /> : <RiSave3Line className="text-lg" />}
          Save Draft
        </button>

        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white text-sm font-black hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
        >
          {isSubmitting ? <RiLoader4Line className="animate-spin text-lg" /> : <RiCheckDoubleLine className="text-lg" />}
          Next Step
        </button>
      </div>

    </div>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-700 tracking-tight block">
        {label}
      </label>
      <textarea
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="w-full h-28 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none shadow-sm"
        placeholder="Type your answer here..."
      />
    </div>
  );
}
