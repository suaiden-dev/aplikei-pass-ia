import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiBankCardLine,
  RiCheckDoubleLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiLoader4Line,
  RiNotification4Line,
  RiSave3Line,
} from "react-icons/ri";
import type { IconType } from "react-icons";
import { processService, type UserService } from "../../../services/process.service";
import { finalFormsService } from "../../../services/final_forms.service";
import { useT } from "../../../i18n";
import { z } from "zod";
import { zodValidate } from "../../../utils/zodValidate";

interface FinalFormsStepUser {
  id: string;
  email?: string;
  fullName?: string;
  full_name?: string;
  phone?: string;
  phoneNumber?: string;
}

type FinalFormsCopy = {
  title: string;
  desc: string;
  toasts: Record<string, string>;
  validation: {
    required: string;
    email: string;
    select: string;
  };
  g1145: {
    title: string;
    subtitle: string;
    info: string;
    labels: Record<string, string>;
    tooltips: Record<string, string>;
  };
  g1450: {
    title: string;
    subtitle: string;
    info: string;
    sections: Record<string, string>;
    labels: Record<string, string>;
    tooltips: Record<string, string>;
    cardTypes: Record<string, string>;
    securityWarning?: string;
    placeholders?: {
      manual?: string;
      expiry?: string;
      cvv?: string;
      select?: string;
    };
  };
  btns?: {
    saveDraft?: string;
    processing?: string;
    submit?: string;
  };
};

type OnboardingFinalFormsText = {
  cos: {
    finalForms: FinalFormsCopy;
  };
};

const getG1145Schema = (t: OnboardingFinalFormsText) => z.object({
  lastName: z.string().min(1, t.cos.finalForms.validation.required),
  firstName: z.string().min(1, t.cos.finalForms.validation.required),
  middleName: z.string().optional().nullable().or(z.literal("")),
  email: z.string().min(1, t.cos.finalForms.validation.required).email(t.cos.finalForms.validation.email),
  mobile: z.string().min(1, t.cos.finalForms.validation.required),
});

const getG1450Schema = (t: OnboardingFinalFormsText) => z.object({
  applicantLastName: z.string().min(1, t.cos.finalForms.validation.required),
  applicantFirstName: z.string().min(1, t.cos.finalForms.validation.required),
  applicantMiddleName: z.string().optional().nullable().or(z.literal("")),
  dateOfBirth: z.string().min(1, t.cos.finalForms.validation.required),
  cardType: z.string().min(1, t.cos.finalForms.validation.required),
  cardholderName: z.string().min(1, t.cos.finalForms.validation.required),
  cardNumber: z.string().optional().nullable().or(z.literal("")),
  expirationDate: z.string().optional().nullable().or(z.literal("")),
  cvv: z.string().optional().nullable().or(z.literal("")),
  streetAddress: z.string().min(1, t.cos.finalForms.validation.required),
  aptSteFlr: z.string().optional().nullable().or(z.literal("")),
  aptSteFlrNumber: z.string().optional().nullable().or(z.literal("")),
  city: z.string().min(1, t.cos.finalForms.validation.required),
  state: z.string().min(1, t.cos.finalForms.validation.required),
  zipCode: z.string().min(1, t.cos.finalForms.validation.required),
  country: z.string().min(1, t.cos.finalForms.validation.required),
});

export interface FinalFormsData {
  g1145: {
    lastName: string;
    firstName: string;
    middleName: string;
    email: string;
    mobile: string;
  };
  g1450: {
    applicantLastName: string;
    applicantFirstName: string;
    applicantMiddleName: string;
    dateOfBirth: string;
    cardType: string;
    cardholderName: string;
    cardNumber: string;
    expirationDate: string;
    cvv: string;
    streetAddress: string;
    aptSteFlr: string;
    aptSteFlrNumber: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface Props {
  proc: UserService;
  user: FinalFormsStepUser;
  onComplete: () => void | Promise<void>;
}

type G1145Field = keyof FinalFormsData["g1145"];
type G1450Field = keyof FinalFormsData["g1450"];

type StepConfig = {
  id: string;
  title: string;
  icon: IconType;
};

function StepTimeline({
  current,
  steps,
}: {
  current: number;
  steps: StepConfig[];
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

export default function FinalFormsStep({ proc, user, onComplete }: Props) {
  const t = useT("onboarding") as OnboardingFinalFormsText;
  const [data, setData] = useState<FinalFormsData>({
    g1145: { lastName: "", firstName: "", middleName: "", email: "", mobile: "" },
    g1450: {
      applicantLastName: "",
      applicantFirstName: "",
      applicantMiddleName: "",
      dateOfBirth: "",
      cardType: "",
      cardholderName: "",
      cardNumber: "",
      expirationDate: "",
      cvv: "",
      streetAddress: "",
      aptSteFlr: "",
      aptSteFlrNumber: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [errors1145, setErrors1145] = useState<Partial<Record<G1145Field, string>>>({});
  const [errors1450, setErrors1450] = useState<Partial<Record<G1450Field, string>>>({});

  useEffect(() => {
    if (proc.step_data?.finalForms) {
      setData(proc.step_data.finalForms as FinalFormsData);
    } else if (user) {
      const names = (user.fullName ?? user.full_name ?? "").split(" ").filter(Boolean);
      const first = names[0] || "";
      const last = names.length > 1 ? names[names.length - 1] : "";
      const phone = user.phoneNumber ?? user.phone ?? "";

      setData((prev) => ({
        ...prev,
        g1145: {
          ...prev.g1145,
          firstName: first,
          lastName: last,
          email: user.email || "",
          mobile: phone,
        },
        g1450: {
          ...prev.g1450,
          applicantFirstName: first,
          applicantLastName: last,
        },
      }));
    }
  }, [proc, user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeStepIndex]);

  if (!t || !t.cos) return null;

  const steps: StepConfig[] = [
    { id: "g1145", title: "G-1145", icon: RiNotification4Line },
    { id: "applicant", title: "Applicant", icon: RiInformationLine },
    { id: "payment", title: "Payment", icon: RiBankCardLine },
    { id: "billing", title: "Billing", icon: RiBankCardLine },
    { id: "review", title: "Review", icon: RiCheckDoubleLine },
  ];

  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === steps.length - 1;

  const updateG1145 = (field: G1145Field) => (val: string) => {
    setData((prev) => ({ ...prev, g1145: { ...prev.g1145, [field]: val } }));
    setErrors1145((prev) => ({ ...prev, [field]: undefined }));
  };

  const updateG1450 = (field: G1450Field) => (val: string) => {
    setData((prev) => ({
      ...prev,
      g1450: { ...prev.g1450, [field]: val },
    }));
    setErrors1450((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateG1145Fields = (fields: G1145Field[]) => {
    const allErrors = zodValidate(getG1145Schema(t))(data.g1145);
    const stepErrors = fields.reduce<Partial<Record<G1145Field, string>>>((acc, field) => {
      if (allErrors[field]) {
        acc[field] = allErrors[field];
      }
      return acc;
    }, {});

    setErrors1145((prev) => ({ ...prev, ...stepErrors }));
    return stepErrors;
  };

  const validateG1450Fields = (fields: G1450Field[]) => {
    const allErrors = zodValidate(getG1450Schema(t))(data.g1450);
    const stepErrors = fields.reduce<Partial<Record<G1450Field, string>>>((acc, field) => {
      if (allErrors[field]) {
        acc[field] = allErrors[field];
      }
      return acc;
    }, {});

    setErrors1450((prev) => ({ ...prev, ...stepErrors }));
    return stepErrors;
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await processService.updateStepData(proc.id, { finalForms: data });
      toast.success(t.cos.finalForms.toasts.saveSuccess);
    } catch {
      toast.error(t.cos.finalForms.toasts.saveError);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleNext = () => {
    let stepErrors: Record<string, string> = {};

    if (activeStepIndex === 0) {
      stepErrors = validateG1145Fields(["lastName", "firstName", "email", "mobile"]);
    }

    if (activeStepIndex === 1) {
      stepErrors = validateG1450Fields(["applicantLastName", "applicantFirstName", "dateOfBirth"]);
    }

    if (activeStepIndex === 2) {
      stepErrors = validateG1450Fields(["cardType", "cardholderName"]);
    }

    if (activeStepIndex === 3) {
      stepErrors = validateG1450Fields(["streetAddress", "city", "state", "zipCode", "country"]);
    }

    if (Object.keys(stepErrors).length > 0) {
      toast.error(t.cos.finalForms.validation.select);
      return;
    }

    setActiveStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleFinalSubmit = async () => {
    const errs1145 = zodValidate(getG1145Schema(t))(data.g1145);
    const errs1450 = zodValidate(getG1450Schema(t))(data.g1450);

    setErrors1145(errs1145);
    setErrors1450(errs1450);

    if (Object.keys(errs1145).length > 0 || Object.keys(errs1450).length > 0) {
      toast.error(t.cos.finalForms.validation.select);
      return;
    }

    setIsSubmitting(true);
    try {
      await processService.updateStepData(proc.id, { finalForms: data });
      await finalFormsService.generateAndUploadFinalForms(user.id, proc.id, data);
      toast.success(t.cos.finalForms.toasts.submitSuccess);
      await onComplete();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t.cos.finalForms.toasts.submitError;
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <StepTimeline current={activeStepIndex + 1} steps={steps} />

      {activeStepIndex === 0 && (
        <div className="bg-card p-6 rounded-3xl shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-5 border-b border-border pb-5">
            <div className="w-10 h-10 rounded-full border border-blue-100 bg-blue-50 text-blue-500 flex items-center justify-center">
              <RiNotification4Line className="text-lg" />
            </div>
            <div>
              <h3 className="font-black text-text text-base">{t.cos.finalForms.g1145.title}</h3>
              <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mt-0.5">{t.cos.finalForms.g1145.subtitle}</p>
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm font-medium text-blue-800 mb-6">
            <RiInformationLine className="text-blue-500 text-xl shrink-0" />
            {t.cos.finalForms.g1145.info}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input
              label={t.cos.finalForms.g1145.labels.lastName}
              description={t.cos.finalForms.g1145.tooltips.lastName}
              value={data.g1145.lastName}
              onChange={updateG1145("lastName")}
              error={errors1145.lastName}
            />
            <Input
              label={t.cos.finalForms.g1145.labels.firstName}
              description={t.cos.finalForms.g1145.tooltips.firstName}
              value={data.g1145.firstName}
              onChange={updateG1145("firstName")}
              error={errors1145.firstName}
            />
            <Input
              label={t.cos.finalForms.g1145.labels.middleName}
              description={t.cos.finalForms.g1145.tooltips.middleName}
              value={data.g1145.middleName}
              onChange={updateG1145("middleName")}
              error={errors1145.middleName}
            />
            <Input
              label={t.cos.finalForms.g1145.labels.email}
              description={t.cos.finalForms.g1145.tooltips.email}
              value={data.g1145.email}
              onChange={updateG1145("email")}
              error={errors1145.email}
            />
            <Input
              label={t.cos.finalForms.g1145.labels.mobile}
              description={t.cos.finalForms.g1145.tooltips.mobile}
              value={data.g1145.mobile}
              onChange={updateG1145("mobile")}
              mask="phone"
              error={errors1145.mobile}
            />
          </div>
        </div>
      )}

      {activeStepIndex === 1 && (
        <div className="bg-card p-6 rounded-3xl shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-5 border-b border-border pb-5">
            <div className="w-10 h-10 rounded-full border border-indigo-100 bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <RiInformationLine className="text-lg" />
            </div>
            <div>
              <h3 className="font-black text-text text-base">{t.cos.finalForms.g1450.title}</h3>
              <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mt-0.5">
                {t.cos.finalForms.g1450.sections.applicant}
              </p>
            </div>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex gap-3 text-sm font-medium text-amber-800 mb-6">
            <RiInformationLine className="text-amber-500 text-xl shrink-0" />
            {t.cos.finalForms.g1450.info}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input
              label={t.cos.finalForms.g1450.labels.lastName}
              description={t.cos.finalForms.g1450.tooltips.lastName}
              value={data.g1450.applicantLastName}
              onChange={updateG1450("applicantLastName")}
              error={errors1450.applicantLastName}
            />
            <Input
              label={t.cos.finalForms.g1450.labels.firstName}
              description={t.cos.finalForms.g1450.tooltips.firstName}
              value={data.g1450.applicantFirstName}
              onChange={updateG1450("applicantFirstName")}
              error={errors1450.applicantFirstName}
            />
            <Input
              label={t.cos.finalForms.g1450.labels.middleName}
              description={t.cos.finalForms.g1450.tooltips.middleName}
              value={data.g1450.applicantMiddleName}
              onChange={updateG1450("applicantMiddleName")}
              error={errors1450.applicantMiddleName}
            />
            <Input
              label={t.cos.finalForms.g1450.labels.dob}
              description={t.cos.finalForms.g1450.tooltips.dob}
              type="date"
              value={data.g1450.dateOfBirth}
              onChange={updateG1450("dateOfBirth")}
              error={errors1450.dateOfBirth}
            />
          </div>
        </div>
      )}

      {activeStepIndex === 2 && (
        <div className="bg-card p-6 rounded-3xl shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-5 border-b border-border pb-5">
            <div className="w-10 h-10 rounded-full border border-indigo-100 bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <RiBankCardLine className="text-lg" />
            </div>
            <div>
              <h3 className="font-black text-text text-base">{t.cos.finalForms.g1450.title}</h3>
              <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mt-0.5">
                {t.cos.finalForms.g1450.sections.card}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Select
              label={t.cos.finalForms.g1450.labels.cardType}
              description={t.cos.finalForms.g1450.tooltips.cardType}
              value={data.g1450.cardType}
              onChange={updateG1450("cardType")}
              options={["Visa", "MasterCard", "Discover", "American Express"]}
              error={errors1450.cardType}
            />
            <div className="md:col-span-2">
              <Input
                label={t.cos.finalForms.g1450.labels.cardholderName}
                description={t.cos.finalForms.g1450.tooltips.cardholderName}
                value={data.g1450.cardholderName}
                onChange={updateG1450("cardholderName")}
                error={errors1450.cardholderName}
              />
            </div>

            <div className="md:col-span-3 bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 text-xs font-bold text-red-700">
              <RiErrorWarningLine className="text-lg shrink-0" />
              {t.cos.finalForms.g1450.securityWarning}
            </div>

            <Input
              label={t.cos.finalForms.g1450.labels.cardNumber}
              description={t.cos.finalForms.g1450.tooltips.manualFill}
              value=""
              readOnly
              placeholder={t.cos.finalForms.g1450.placeholders?.manual || ""}
              onChange={() => {}}
            />
            <Input
              label={t.cos.finalForms.g1450.labels.expirationDate}
              description={t.cos.finalForms.g1450.tooltips.manualFill}
              value=""
              readOnly
              placeholder={t.cos.finalForms.g1450.placeholders?.expiry || ""}
              onChange={() => {}}
            />
            <Input
              label={t.cos.finalForms.g1450.labels.cvv}
              description={t.cos.finalForms.g1450.tooltips.manualFill}
              value=""
              readOnly
              placeholder={t.cos.finalForms.g1450.placeholders?.cvv || ""}
              onChange={() => {}}
            />
          </div>
        </div>
      )}

      {activeStepIndex === 3 && (
        <div className="bg-card p-6 rounded-3xl shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-5 border-b border-border pb-5">
            <div className="w-10 h-10 rounded-full border border-indigo-100 bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <RiBankCardLine className="text-lg" />
            </div>
            <div>
              <h3 className="font-black text-text text-base">{t.cos.finalForms.g1450.title}</h3>
              <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mt-0.5">
                {t.cos.finalForms.g1450.sections.billing}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-3">
              <Input
                label={t.cos.finalForms.g1450.labels.street}
                description={t.cos.finalForms.g1450.tooltips.streetDesc}
                value={data.g1450.streetAddress}
                onChange={updateG1450("streetAddress")}
                error={errors1450.streetAddress}
              />
            </div>
            <Select
              label={t.cos.finalForms.g1450.labels.aptType}
              value={data.g1450.aptSteFlr}
              onChange={updateG1450("aptSteFlr")}
              options={["Apt", "Ste", "Flr"]}
            />
            <Input
              label={t.cos.finalForms.g1450.labels.aptNumber}
              value={data.g1450.aptSteFlrNumber}
              onChange={updateG1450("aptSteFlrNumber")}
            />
            <Input
              label={t.cos.finalForms.g1450.labels.city}
              value={data.g1450.city}
              onChange={updateG1450("city")}
              error={errors1450.city}
            />
            <Input
              label={t.cos.finalForms.g1450.labels.state}
              description={t.cos.finalForms.g1450.tooltips.stateDesc}
              value={data.g1450.state}
              onChange={updateG1450("state")}
              error={errors1450.state}
            />
            <Input
              label={t.cos.finalForms.g1450.labels.zip}
              value={data.g1450.zipCode}
              onChange={updateG1450("zipCode")}
              error={errors1450.zipCode}
            />
            <Input
              label={t.cos.finalForms.g1450.labels.country}
              value={data.g1450.country}
              onChange={updateG1450("country")}
              error={errors1450.country}
            />
          </div>
        </div>
      )}

      {isLastStep && (
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-bg-subtle/60">
            <h3 className="text-base font-black text-text tracking-tight">Revisao final</h3>
          </div>

          <div className="p-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-bg-subtle/70 p-4">
              <p className="text-sm font-black text-text">G-1145</p>
              <p className="mt-1 text-xs font-medium text-text-muted">
                {[data.g1145.lastName, data.g1145.firstName, data.g1145.email, data.g1145.mobile].filter(Boolean).length}/4
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-bg-subtle/70 p-4">
              <p className="text-sm font-black text-text">G-1450 Applicant</p>
              <p className="mt-1 text-xs font-medium text-text-muted">
                {[data.g1450.applicantLastName, data.g1450.applicantFirstName, data.g1450.dateOfBirth].filter(Boolean).length}/3
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-bg-subtle/70 p-4">
              <p className="text-sm font-black text-text">Payment</p>
              <p className="mt-1 text-xs font-medium text-text-muted">
                {[data.g1450.cardType, data.g1450.cardholderName].filter(Boolean).length}/2
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-bg-subtle/70 p-4">
              <p className="text-sm font-black text-text">Billing</p>
              <p className="mt-1 text-xs font-medium text-text-muted">
                {[data.g1450.streetAddress, data.g1450.city, data.g1450.state, data.g1450.zipCode, data.g1450.country].filter(Boolean).length}/5
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 lg:left-72 right-0 bg-card border-t border-border p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 flex flex-col md:flex-row items-center gap-4">
        <button
          onClick={() => setActiveStepIndex((prev) => Math.max(prev - 1, 0))}
          disabled={isFirstStep || isSavingDraft || isSubmitting}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-border text-sm font-black text-text-muted hover:bg-bg-subtle hover:border-border transition-all disabled:opacity-50"
        >
          <RiArrowLeftLine className="text-lg" />
          Etapa anterior
        </button>

        <button
          onClick={handleSaveDraft}
          disabled={isSavingDraft || isSubmitting}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-border text-sm font-black text-text-muted hover:bg-bg-subtle hover:border-border transition-all disabled:opacity-50"
        >
          {isSavingDraft ? <RiLoader4Line className="animate-spin text-lg" /> : <RiSave3Line className="text-lg" />}
          {t.cos.finalForms.btns?.saveDraft || "Salvar rascunho"}
        </button>

        <div className="flex-1 hidden md:block" />

        {isLastStep ? (
          <button
            onClick={handleFinalSubmit}
            disabled={isSubmitting || isSavingDraft}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white text-sm font-black hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RiLoader4Line className="animate-spin text-lg" />
                {t.cos.finalForms.btns?.processing || "Enviando..."}
              </>
            ) : (
              <>
                <RiCheckDoubleLine className="text-lg" />
                {t.cos.finalForms.btns?.submit || "Enviar Formularios"}
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={isSubmitting || isSavingDraft}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white text-sm font-black hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
          >
            <RiArrowRightLine className="text-lg" />
            Proxima etapa
          </button>
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  error,
  mask,
  description,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  error?: string;
  mask?: "phone";
  description?: string;
  readOnly?: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    let val = e.target.value;
    if (mask === "phone") {
      val = val.replace(/\D/g, "");
      if (val.length <= 10) {
        val = val.replace(/^(\d{3})(\d{3})(\d{4}).*/, "($1) $2-$3");
      } else {
        val = val.replace(/^(\d{2})(\d{5})(\d{4}).*/, "+$1 ($2) $3");
      }
    }
    onChange(val);
  };

  return (
    <div className="relative group/input">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5">
          {label}
          {description && (
            <div className="relative inline-block">
              <RiInformationLine
                className="text-slate-300 hover:text-primary cursor-help transition-colors text-xs"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              />
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[9px] p-2 rounded-lg z-50 shadow-xl pointer-events-none animate-in fade-in zoom-in-95">
                  {description}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
                </div>
              )}
            </div>
          )}
        </label>
        {error && <span className="text-[9px] font-bold text-red-500 animate-in fade-in slide-in-from-right-1">{error}</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full bg-bg-subtle/50 border ${error ? "border-red-500 ring-4 ring-red-500/10" : "border-border"} rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:ring-4 ${error ? "focus:ring-red-500/10 focus:border-red-500" : "focus:ring-primary/10 focus:border-primary"} transition-all focus:bg-card ${readOnly ? "bg-bg-subtle cursor-not-allowed opacity-60" : ""}`}
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  onBlur,
  options,
  error,
  description,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  options: string[];
  error?: string;
  description?: string;
}) {
  const t = useT("onboarding") as OnboardingFinalFormsText;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative group/select">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5">
          {label}
          {description && (
            <div className="relative inline-block">
              <RiInformationLine
                className="text-slate-300 hover:text-primary cursor-help transition-colors text-xs"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              />
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[9px] p-2 rounded-lg z-50 shadow-xl pointer-events-none animate-in fade-in zoom-in-95">
                  {description}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
                </div>
              )}
            </div>
          )}
        </label>
        {error && <span className="text-[9px] font-bold text-red-500 animate-in fade-in slide-in-from-right-1">{error}</span>}
      </div>
      <div className="relative">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`w-full bg-bg-subtle/50 border ${error ? "border-red-500 ring-4 ring-red-500/10" : "border-border"} rounded-xl px-4 py-3 text-sm font-bold text-text outline-none focus:ring-4 ${error ? "focus:ring-red-500/10 focus:border-red-500" : "focus:ring-primary/10 focus:border-primary"} transition-all focus:bg-card appearance-none pr-10`}
        >
          <option value="">{t.cos.finalForms.g1450.placeholders?.select ?? "Select"}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted font-bold">⌄</div>
      </div>
    </div>
  );
}
