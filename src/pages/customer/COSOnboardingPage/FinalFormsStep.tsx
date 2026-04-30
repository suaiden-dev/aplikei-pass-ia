import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  RiInformationLine, 
  RiSave3Line,
  RiCheckDoubleLine,
  RiLoader4Line,
  RiNotification4Line,
  RiBankCardLine,
  RiErrorWarningLine,
  RiArrowRightLine
} from "react-icons/ri";
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
    aptSteFlr: string; // 'Apt', 'Ste', 'Flr' or ''
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

export default function FinalFormsStep({ proc, user, onComplete }: Props) {
  const t = useT("onboarding") as OnboardingFinalFormsText;
  const [data, setData] = useState<FinalFormsData>({
    g1145: { lastName: "", firstName: "", middleName: "", email: "", mobile: "" },
    g1450: { 
      applicantLastName: "", applicantFirstName: "", applicantMiddleName: "", dateOfBirth: "", 
      cardType: "", cardholderName: "", cardNumber: "", expirationDate: "", cvv: "",
      streetAddress: "", aptSteFlr: "", aptSteFlrNumber: "", city: "", state: "", zipCode: "", country: "United States" 
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  
  const [errors1145, setErrors1145] = useState<Partial<Record<keyof FinalFormsData["g1145"], string>>>({});
  const [errors1450, setErrors1450] = useState<Partial<Record<keyof FinalFormsData["g1450"], string>>>({});

  useEffect(() => {
    if (proc.step_data?.finalForms) {
      setData(proc.step_data.finalForms as FinalFormsData);
    } else if (user) {
      const names = (user.fullName ?? user.full_name ?? "").split(" ").filter(Boolean);
      const first = names[0] || "";
      const last = names.length > 1 ? names[names.length - 1] : "";
      const phone = user.phoneNumber ?? user.phone ?? "";
      
      setData(prev => ({
        ...prev,
        g1145: {
          ...prev.g1145,
          firstName: first,
          lastName: last,
          email: user.email || "",
          mobile: phone
        },
        g1450: {
          ...prev.g1450,
          applicantFirstName: first,
          applicantLastName: last,
          dateOfBirth: ""
        }
      }));
    }
  }, [proc, user]);

  if (!t || !t.cos) return null;

  const updateG1145 = (field: string) => (val: string) => {
    setData(prev => ({ ...prev, g1145: { ...prev.g1145, [field]: val } }));
  };

  const updateG1450 = (field: string) => (val: string) => {
    setData(prev => ({
      ...prev,
      g1450: { ...prev.g1450, [field]: val }
    }));
  };

  const handleBlur1145 = () => {
    const errs1145 = zodValidate(getG1145Schema(t))(data.g1145);
    setErrors1145(errs1145);
  };

  const handleBlur1450 = () => {
    const errs1450 = zodValidate(getG1450Schema(t))(data.g1450);
    setErrors1450(errs1450);
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
    <div className="space-y-8 pb-32">
      <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
        <div className="max-w-xl">
           <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-2">
              <RiInformationLine className="text-primary" /> {t.cos.finalForms.title}
           </h2>
           <p className="text-sm font-medium text-slate-500">
             {t.cos.finalForms.desc}
           </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Form G-1145 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
             <div className="w-12 h-12 rounded-full border border-blue-100 bg-blue-50 text-blue-500 flex items-center justify-center">
               <RiNotification4Line className="text-xl" />
             </div>
             <div>
                <h3 className="font-black text-slate-800 text-lg">{t.cos.finalForms.g1145.title}</h3>
                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mt-0.5">{t.cos.finalForms.g1145.subtitle}</p>
             </div>
           </div>

           <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm font-medium text-blue-800 mb-8">
             <RiInformationLine className="text-blue-500 text-xl shrink-0" />
             {t.cos.finalForms.g1145.info}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input 
                 label={t.cos.finalForms.g1145.labels.lastName} 
                 description={t.cos.finalForms.g1145.tooltips.lastName}
                 value={data.g1145.lastName} onChange={updateG1145("lastName")} 
                 onBlur={handleBlur1145}
                 error={errors1145.lastName}
              />
              <Input 
                 label={t.cos.finalForms.g1145.labels.firstName} 
                 description={t.cos.finalForms.g1145.tooltips.firstName}
                 value={data.g1145.firstName} onChange={updateG1145("firstName")} 
                 onBlur={handleBlur1145}
                 error={errors1145.firstName}
              />
              <Input 
                 label={t.cos.finalForms.g1145.labels.middleName} 
                 description={t.cos.finalForms.g1145.tooltips.middleName}
                 value={data.g1145.middleName} onChange={updateG1145("middleName")} 
                 onBlur={handleBlur1145}
                 error={errors1145.middleName}
              />
              <Input 
                 label={t.cos.finalForms.g1145.labels.email} 
                 description={t.cos.finalForms.g1145.tooltips.email}
                 value={data.g1145.email} onChange={updateG1145("email")} 
                 onBlur={handleBlur1145}
                 error={errors1145.email}
              />
              <Input 
                 label={t.cos.finalForms.g1145.labels.mobile} 
                 description={t.cos.finalForms.g1145.tooltips.mobile}
                 value={data.g1145.mobile} onChange={updateG1145("mobile")} 
                 onBlur={handleBlur1145}
                 mask="phone"
                 error={errors1145.mobile}
              />
           </div>
        </div>

        {/* Form G-1450 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
             <div className="w-12 h-12 rounded-full border border-indigo-100 bg-indigo-50 text-indigo-500 flex items-center justify-center">
               <RiBankCardLine className="text-xl" />
             </div>
             <div>
                <h3 className="font-black text-slate-800 text-lg">{t.cos.finalForms.g1450.title}</h3>
                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mt-0.5">{t.cos.finalForms.g1450.subtitle}</p>
             </div>
           </div>

           <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex gap-3 text-sm font-medium text-amber-800 mb-8">
             <RiInformationLine className="text-amber-500 text-xl shrink-0" />
             {t.cos.finalForms.g1450.info}
           </div>

           <SectionTitle title={t.cos.finalForms.g1450.sections.applicant} />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Input 
                 label={t.cos.finalForms.g1450.labels.lastName} 
                 description={t.cos.finalForms.g1450.tooltips.lastName}
                 value={data.g1450.applicantLastName} onChange={updateG1450("applicantLastName")} 
                 onBlur={handleBlur1450}
                 error={errors1450.applicantLastName}
              />
              <Input 
                 label={t.cos.finalForms.g1450.labels.firstName} 
                 description={t.cos.finalForms.g1450.tooltips.firstName}
                 value={data.g1450.applicantFirstName} onChange={updateG1450("applicantFirstName")} 
                 onBlur={handleBlur1450}
                 error={errors1450.applicantFirstName}
              />
              <Input 
                 label={t.cos.finalForms.g1450.labels.middleName} 
                 description={t.cos.finalForms.g1450.tooltips.middleName}
                 value={data.g1450.applicantMiddleName} onChange={updateG1450("applicantMiddleName")} 
                 onBlur={handleBlur1450}
                 error={errors1450.applicantMiddleName}
              />
              <Input 
                 label={t.cos.finalForms.g1450.labels.dob} 
                 description={t.cos.finalForms.g1450.tooltips.dob}
                 type="date"
                 value={data.g1450.dateOfBirth} onChange={updateG1450("dateOfBirth")} 
                 onBlur={handleBlur1450}
                 error={errors1450.dateOfBirth}
              />
           </div>

           <SectionTitle title={t.cos.finalForms.g1450.sections.card} />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Select 
                 label={t.cos.finalForms.g1450.labels.cardType} 
                 description={t.cos.finalForms.g1450.tooltips.cardType}
                 value={data.g1450.cardType} onChange={updateG1450("cardType")} 
                 onBlur={handleBlur1450}
                 options={["Visa", "MasterCard", "Discover", "American Express"]}
                 error={errors1450.cardType}
              />
              <div className="md:col-span-2">
                <Input 
                   label={t.cos.finalForms.g1450.labels.cardholderName} 
                   description={t.cos.finalForms.g1450.tooltips.cardholderName}
                   value={data.g1450.cardholderName} onChange={updateG1450("cardholderName")} 
                   onBlur={handleBlur1450}
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
                 value="" readOnly
                 placeholder={t.cos.finalForms.g1450.placeholders?.manual || ""}
                 onChange={() => {}} 
              />
              <Input 
                 label={t.cos.finalForms.g1450.labels.expirationDate} 
                 description={t.cos.finalForms.g1450.tooltips.manualFill}
                 value="" readOnly
                 placeholder={t.cos.finalForms.g1450.placeholders?.expiry || ""}
                 onChange={() => {}} 
              />
              <Input 
                 label={t.cos.finalForms.g1450.labels.cvv} 
                 description={t.cos.finalForms.g1450.tooltips.manualFill}
                 value="" readOnly
                 placeholder={t.cos.finalForms.g1450.placeholders?.cvv || ""}
                 onChange={() => {}} 
              />
           </div>

           <SectionTitle title={t.cos.finalForms.g1450.sections.billing} />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <Input 
                   label={t.cos.finalForms.g1450.labels.street} 
                   description={t.cos.finalForms.g1450.tooltips.streetDesc}
                   value={data.g1450.streetAddress} onChange={updateG1450("streetAddress")} 
                   onBlur={handleBlur1450}
                   error={errors1450.streetAddress}
                />
              </div>
              <Select 
                 label={t.cos.finalForms.g1450.labels.aptType} 
                 value={data.g1450.aptSteFlr} onChange={updateG1450("aptSteFlr")} 
                 options={["Apt", "Ste", "Flr"]}
              />
              <Input 
                 label={t.cos.finalForms.g1450.labels.aptNumber} 
                 value={data.g1450.aptSteFlrNumber} onChange={updateG1450("aptSteFlrNumber")} 
              />
              <Input 
                 label={t.cos.finalForms.g1450.labels.city} 
                 value={data.g1450.city} onChange={updateG1450("city")} 
                 onBlur={handleBlur1450}
                 error={errors1450.city}
              />
              <Input 
                 label={t.cos.finalForms.g1450.labels.state} 
                 description={t.cos.finalForms.g1450.tooltips.stateDesc}
                 value={data.g1450.state} onChange={updateG1450("state")} 
                 onBlur={handleBlur1450}
                 error={errors1450.state}
              />
              <Input 
                 label={t.cos.finalForms.g1450.labels.zip} 
                 value={data.g1450.zipCode} onChange={updateG1450("zipCode")} 
                 onBlur={handleBlur1450}
                 error={errors1450.zipCode}
              />
              <Input 
                 label={t.cos.finalForms.g1450.labels.country} 
                 value={data.g1450.country} onChange={updateG1450("country")} 
                 onBlur={handleBlur1450}
                 error={errors1450.country}
              />
           </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-72 right-0 bg-white border-t border-slate-200 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 flex items-center justify-between gap-4">
        <button
          onClick={handleSaveDraft}
          disabled={isSavingDraft || isSubmitting}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-100 text-sm font-black text-slate-500 hover:bg-slate-50 hover:border-slate-200 transition-all disabled:opacity-50"
        >
          {isSavingDraft ? <RiLoader4Line className="animate-spin text-lg" /> : <RiSave3Line className="text-lg" />}
          {t.cos.finalForms.btns?.saveDraft || "Salvar rascunho"}
        </button>

        <button
          onClick={handleFinalSubmit}
          disabled={isSubmitting || isSavingDraft}
          className="flex-1 max-w-md flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white text-sm font-black hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <><RiLoader4Line className="animate-spin text-lg" /> {t.cos.finalForms.btns?.processing || "Enviando..."}</>
          ) : (
            <><RiCheckDoubleLine className="text-lg" /> {t.cos.finalForms.btns?.submit || "Enviar Formulários"} <RiArrowRightLine className="text-lg" /></>
          )}
        </button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, onBlur, placeholder, type = "text", error, mask, description, readOnly }: { 
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
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
        className={`w-full bg-slate-50/50 border ${error ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 ${error ? 'focus:ring-red-500/10 focus:border-red-500' : 'focus:ring-primary/10 focus:border-primary'} transition-all focus:bg-white ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
      />
    </div>
  );
}

function Select({ label, value, onChange, onBlur, options, error, description }: { label: string; value: string; onChange: (v: string) => void; onBlur?: () => void; options: string[]; error?: string; description?: string; }) {
  const t = useT("onboarding");
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative group/select">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
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
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          className={`w-full bg-slate-50/50 border ${error ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 ${error ? 'focus:ring-red-500/10 focus:border-red-500' : 'focus:ring-primary/10 focus:border-primary'} transition-all focus:bg-white appearance-none pr-10`}
        >
          <option value="">{t.cos.finalForms.g1450.placeholders.select}</option>
          {options.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold">⌄</div>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6 mt-8">
      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-800">{title}</h4>
    </div>
  );
}
