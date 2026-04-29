import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckDoubleLine,
  RiInformationLine,
  RiLoader4Line,
  RiSave3Line,
} from "react-icons/ri";
import {
  MdAccountBalanceWallet,
  MdLightbulbOutline,
  MdOutlineGpsFixed,
  MdSchool,
} from "react-icons/md";
import { toast } from "sonner";
import { useT } from "../../../i18n";
import { coverLetterService } from "../../../services/cover_letter.service";
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
}

type StepConfig = {
  id: string;
  title: string;
  icon: IconType;
  fields: Array<{
    key: keyof CoverLetterData;
    label: string;
  }>;
};

function StepTimeline({
  current,
  steps,
}: {
  current: number;
  steps: Array<Pick<StepConfig, "id" | "title">>;
}) {
  const progress = Math.round((current / steps.length) * 100);
  const currentStep = steps[current - 1] ?? steps[0];

  return (
    <div className="rounded-[24px] border border-border/80 bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-text tracking-tight">{currentStep?.title}</h2>
          <p className="text-xs font-black text-text-muted">
            {current}/{steps.length}
          </p>
        </div>

        <div className="h-2 rounded-full bg-bg-subtle overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-4 overflow-x-auto pb-1">
          <div className="flex min-w-max items-start">
            {steps.map((step, idx) => {
              const stepNumber = idx + 1;
              const isCurrent = stepNumber === current;
              const isComplete = stepNumber < current;
              const isLast = idx === steps.length - 1;

              return (
                <div key={step.id} className="flex items-start">
                  <div className="flex min-w-[88px] flex-col">
                    <div className="flex items-center">
                      <div
                        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-black transition-all ${
                          isCurrent
                            ? "border-primary/15 bg-primary text-white shadow-lg shadow-primary/20"
                            : isComplete
                              ? "border-emerald-100 bg-emerald-500 text-white"
                              : "border-border bg-card text-text-muted"
                        }`}
                      >
                        {isComplete ? <RiCheckDoubleLine className="text-base" /> : stepNumber}
                      </div>

                      {!isLast && (
                        <div className="mx-2 h-[3px] w-10 rounded-full bg-slate-200 overflow-hidden">
                          <div className={`h-full rounded-full ${isComplete ? "bg-emerald-500" : "bg-slate-200"}`} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-text tracking-tight block">
        {label}
      </label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-32 rounded-2xl border ${error ? "border-red-400 ring-4 ring-red-500/10" : "border-border"} bg-card p-4 text-sm font-medium text-text outline-none focus:ring-4 ${error ? "focus:ring-red-500/10 focus:border-red-400" : "focus:ring-primary/10 focus:border-primary"} transition-all resize-none shadow-sm`}
        placeholder={placeholder || "Type your answer here..."}
      />
      {error && <p className="text-xs font-bold text-red-500">{error}</p>}
    </div>
  );
}

export default function CoverLetterStep({ proc, user, onComplete }: Props) {
  const t = useT("onboarding") as OnboardingCoverLetterText;
  const [data, setData] = useState<CoverLetterData>({});
  const [errors, setErrors] = useState<Partial<Record<keyof CoverLetterData, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    if (proc.step_data?.coverLetter) {
      setData(proc.step_data.coverLetter as CoverLetterData);
    }
  }, [proc, user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeStepIndex]);

  if (!t || !t.cos) return null;

  const steps: StepConfig[] = [
    {
      id: "background",
      title: t.cos.coverLetter.sections.background,
      icon: MdOutlineGpsFixed,
      fields: [
        { key: "reasonGoUS", label: t.cos.coverLetter.questions.reasonGoUS },
        { key: "locationsVisited", label: t.cos.coverLetter.questions.locationsVisited },
        { key: "reasonB1B2", label: t.cos.coverLetter.questions.reasonB1B2 },
        { key: "jobInBrazil", label: t.cos.coverLetter.questions.jobInBrazil },
      ],
    },
    {
      id: "reason-change",
      title: t.cos.coverLetter.sections.reasonForChange,
      icon: RiInformationLine,
      fields: [
        { key: "reasonNotF1Directly", label: t.cos.coverLetter.questions.reasonNotF1Directly },
        { key: "reasonStatusChange", label: t.cos.coverLetter.questions.reasonStatusChange },
        { key: "careerBenefit", label: t.cos.coverLetter.questions.careerBenefit },
      ],
    },
    {
      id: "study-plan",
      title: t.cos.coverLetter.sections.studyPlan,
      icon: MdSchool,
      fields: [
        { key: "specificCourse", label: t.cos.coverLetter.questions.specificCourse },
        { key: "whyNotBrazil", label: t.cos.coverLetter.questions.whyNotBrazil },
      ],
    },
    {
      id: "ties-financials",
      title: t.cos.coverLetter.sections.tiesFinancials,
      icon: MdAccountBalanceWallet,
      fields: [
        { key: "residenceInBrazil", label: t.cos.coverLetter.questions.residenceInBrazil },
        { key: "financialSupport", label: t.cos.coverLetter.questions.financialSupport },
        { key: "sponsorInfo", label: t.cos.coverLetter.questions.sponsorInfo },
      ],
    },
    {
      id: "review",
      title: "Revisao final",
      icon: MdLightbulbOutline,
      fields: [],
    },
  ];

  const currentStep = steps[activeStepIndex];
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === steps.length - 1;

  const handleChange = (field: keyof CoverLetterData, val: string) => {
    setData((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (step: StepConfig) => {
    const nextErrors: Partial<Record<keyof CoverLetterData, string>> = {};

    for (const field of step.fields) {
      if (!data[field.key]?.trim()) {
        nextErrors[field.key] = "Resposta obrigatoria para continuar.";
      }
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return nextErrors;
  };

  const persistCoverLetter = async () => {
    const generatedHtml = coverLetterService.generateHTML(data, user);
    await processService.updateStepData(proc.id, {
      coverLetter: data,
      generatedCoverLetterHTML: generatedHtml,
    });
  };

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      await persistCoverLetter();
      toast.success(t.cos.coverLetter.toasts.saveSuccess);
    } catch {
      toast.error(t.cos.coverLetter.toasts.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextStep = () => {
    const stepErrors = validateStep(currentStep);
    const errorKeys = Object.keys(stepErrors);

    if (errorKeys.length > 0) {
      toast.error(`Preencha ${errorKeys.length > 1 ? "as respostas" : "a resposta"} desta etapa antes de continuar.`);
      return;
    }

    setActiveStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await persistCoverLetter();
      await onComplete();
    } catch {
      toast.error(t.cos.coverLetter.toasts.advanceError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <StepTimeline
        current={activeStepIndex + 1}
        steps={steps.map((step) => ({ id: step.id, title: step.title }))}
      />

      {isLastStep ? (
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-bg-subtle/60">
            <h3 className="text-base font-black text-text tracking-tight">Revisao final</h3>
          </div>

          <div className="p-6 grid gap-3 md:grid-cols-2">
            {steps.slice(0, -1).map((step) => (
              <div key={step.id} className="rounded-2xl border border-border bg-bg-subtle/70 p-4">
                <p className="text-sm font-black text-text">{step.title}</p>
                <p className="mt-1 text-xs font-medium text-text-muted">
                  {step.fields.filter((field) => data[field.key]?.trim()).length}/{step.fields.length}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="bg-bg-subtle/50 px-6 py-4 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shadow-sm text-text-muted">
              <currentStep.icon className="text-lg" />
            </div>
            <h3 className="font-black text-text text-sm tracking-tight">{currentStep.title}</h3>
          </div>

          <div className="p-6 space-y-5">
            {currentStep.fields.map((field) => (
              <TextAreaField
                key={field.key}
                label={field.label}
                value={data[field.key]}
                placeholder={t.cos.coverLetter.placeholders.typeAnswer}
                error={errors[field.key]}
                onChange={(val) => handleChange(field.key, val)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 lg:left-72 right-0 bg-card border-t border-border p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 flex flex-col md:flex-row items-center gap-4">
        <button
          onClick={() => setActiveStepIndex((prev) => Math.max(prev - 1, 0))}
          disabled={isFirstStep || isSaving || isSubmitting}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-border text-sm font-black text-text-muted hover:bg-bg-subtle hover:border-border transition-all disabled:opacity-50"
        >
          <RiArrowLeftLine className="text-lg" />
          Etapa anterior
        </button>

        <button
          onClick={saveDraft}
          disabled={isSaving || isSubmitting}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-border text-sm font-black text-text-muted hover:bg-bg-subtle hover:border-border transition-all disabled:opacity-50"
        >
          {isSaving ? <RiLoader4Line className="animate-spin text-lg" /> : <RiSave3Line className="text-lg" />}
          {t.cos.coverLetter.btns.saveDraft}
        </button>

        <div className="flex-1 hidden md:block" />

        {isLastStep ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isSaving}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-12 py-3.5 rounded-xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex-1 md:flex-none disabled:opacity-50"
          >
            {isSubmitting ? <RiLoader4Line className="animate-spin text-lg" /> : <RiCheckDoubleLine className="text-lg" />}
            {t.cos.coverLetter.btns.send}
          </button>
        ) : (
          <button
            onClick={handleNextStep}
            disabled={isSaving || isSubmitting}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-12 py-3.5 rounded-xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex-1 md:flex-none disabled:opacity-50"
          >
            <RiArrowRightLine className="text-lg" />
            Proxima etapa
          </button>
        )}
      </div>
    </div>
  );
}
