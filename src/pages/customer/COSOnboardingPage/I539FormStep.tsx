import { useState, type ReactNode, type ElementType } from "react";
import { RiLoader4Line, RiArrowRightLine, RiInformationLine, RiFilePdf2Line, RiSave3Line } from "react-icons/ri";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip";
import { 
  MdPerson, MdBadge, MdLocationOn, MdFlightTakeoff, MdFactCheck, 
  MdHealthAndSafety, MdSecurity, MdContactPhone, MdRecordVoiceOver, MdEditDocument
} from "react-icons/md";
import { toast } from "sonner";
import { Formik, useField, useFormikContext, Form } from "formik";
import { processService, type UserService } from "../../../services/process.service";
import { fillI539Form, uploadFilledI539, type I539Data } from "../../../services/i539.service";
import type { UserAccount } from "../../../models/user.model";
import { i539Validator, type I539FormInput } from "../../../schemas/i539.schema";
import { useT } from "../../../i18n/LanguageContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const US_STATES = [
  "", "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VT","VA","WA","WV","WI","WY","DC",
];



// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, required, name, children, tooltip }: { label: string; required?: boolean; name?: string; children: ReactNode; tooltip?: string }) {
  const { errors, touched } = useFormikContext<I539FormInput>();
  const error = name && touched[name as keyof I539FormInput] ? (errors[name as keyof I539FormInput] as string) : undefined;

  return (
    <div id={`field-${name}`}>
      <div className="flex justify-between items-center mb-2.5">
        <label htmlFor={name} className="flex items-center gap-1.5 block text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-slate-300 hover:text-primary transition-colors cursor-help">
                    <RiInformationLine className="text-sm" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-[10px] font-bold py-2 px-3 bg-slate-800 text-white border-none shadow-xl transform-none !slide-in-from-top-0 !zoom-in-100">
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </label>
        {error && <span className="text-[10px] font-bold text-red-500 animate-in fade-in slide-in-from-right-1">{error}</span>}
      </div>
      {children}
    </div>
  );
}

function TextInput({ name, placeholder, type = "text", disabled, mask }: {
  name: string; placeholder?: string; type?: string; disabled?: boolean; mask?: "phone" | "date";
}) {
  const [field, meta, helpers] = useField(name);
  const error = meta.touched && meta.error ? meta.error : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (mask === "phone") {
      val = val.replace(/\D/g, "");
      if (val.length <= 10) {
        val = val.replace(/^(\d{3})(\d{3})(\d{4}).*/, "($1) $2-$3");
      } else {
        val = val.replace(/^(\d{2})(\d{5})(\d{4}).*/, "+$1 ($2) $3");
      }
      helpers.setValue(val);
    } else if (type === "date") {
      // Convert YYYY-MM-DD from browser to MM/DD/YYYY for state/schema
      if (val) {
        const [y, m, d] = val.split("-");
        helpers.setValue(`${m}/${d}/${y}`);
      } else {
        helpers.setValue("");
      }
    } else {
      helpers.setValue(val);
    }
  };

  // Convert MM/DD/YYYY from state to YYYY-MM-DD for browser input type="date"
  let displayValue = field.value ?? "";
  if (type === "date" && displayValue && displayValue.includes("/")) {
    const [m, d, y] = displayValue.split("/");
    if (y && m && d) {
      displayValue = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }

  return (
    <input
      {...field}
      id={name}
      value={displayValue}
      onChange={handleChange}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full bg-slate-50 border ${error ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-4 ${error ? 'focus:ring-red-500/10 focus:border-red-500' : 'focus:ring-primary/10 focus:border-primary'} focus:bg-white transition-all disabled:bg-slate-100 disabled:text-slate-400 placeholder:text-slate-300 placeholder:font-medium shadow-sm shadow-slate-100/50`}
    />
  );
}

function SelectInput({ name, options, disabled, children }: {
  name: string; options?: string[]; disabled?: boolean; children?: ReactNode;
}) {
  const [field, meta] = useField(name);
  const error = meta.touched && meta.error ? meta.error : undefined;

  return (
    <select
      {...field}
      id={name}
      value={field.value ?? ""}
      disabled={disabled}
      className={`w-full bg-slate-50 border ${error ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-4 ${error ? 'focus:ring-red-500/10 focus:border-red-500' : 'focus:ring-primary/10 focus:border-primary'} focus:bg-white transition-all appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 shadow-sm shadow-slate-100/50`}
    >
      {children}
      {!children && options?.map(o => <option key={o} value={o}>{o || "— Select —"}</option>)}
    </select>
  );
}

function YesNoGroup({ yesName, noName, disabled }: {
  yesName: string; noName: string; disabled?: boolean;
}) {
  const [, , helpersYes] = useField(yesName);
  const [, , helpersNo] = useField(noName);
  const { values } = useFormikContext<I539FormInput>();

  const yesVal = values[yesName];
  const noVal = values[noName];

  return (
    <div className="flex gap-2">
      {(["Yes", "No"] as const).map(opt => {
        const isSelected = opt === "Yes" ? yesVal : noVal;
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (opt === "Yes") { helpersYes.setValue(true); helpersNo.setValue(false); }
              else { helpersNo.setValue(true); helpersYes.setValue(false); }
            }}
            className={`flex-1 py-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
              isSelected
                ? opt === "Yes"
                  ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm"
                  : "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm"
                : "border-slate-200 text-slate-400 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-sm shadow-slate-100/50"
            } ${disabled ? "cursor-default opacity-70" : "cursor-pointer"}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, children }: { title: string; subtitle?: string; icon?: ElementType; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible mb-8">
      <div className="px-7 py-5 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50 rounded-t-2xl">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary shrink-0">
            <Icon className="text-2xl" />
          </div>
        )}
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">{subtitle}</p>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">{title}</h3>
        </div>
      </div>
      <div className="px-7 py-8 space-y-7">{children}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  proc: UserService;
  user: UserAccount;
  onComplete: () => void;
}

export default function I539FormStep({ proc, user, onComplete }: Props) {
  const t = useT("onboarding");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Constants mapping
  const I539_TOOLTIPS = t.cos.i539.tooltips;
  const SECURITY_QUESTIONS = [
    { key: "q6",  label: t.cos.i539.securityQuestions.q6,  yesKey: "q6Yes",  noKey: "q6No" },
    { key: "q7",  label: t.cos.i539.securityQuestions.q7,  yesKey: "q7Yes",  noKey: "q7No" },
    { key: "q8",  label: t.cos.i539.securityQuestions.q8,  yesKey: "q8Yes",  noKey: "q8No" },
    { key: "q9",  label: t.cos.i539.securityQuestions.q9,  yesKey: "q9Yes",  noKey: "q9No" },
    { key: "q10", label: t.cos.i539.securityQuestions.q10, yesKey: "q10Yes", noKey: "q10No" },
    { key: "q11", label: t.cos.i539.securityQuestions.q11, yesKey: "q11Yes", noKey: "q11No" },
    { key: "q12", label: t.cos.i539.securityQuestions.q12, yesKey: "q12Yes", noKey: "q12No" },
    { key: "q13", label: t.cos.i539.securityQuestions.q13, yesKey: "q13Yes", noKey: "q13No" },
    { key: "q14", label: t.cos.i539.securityQuestions.q14, yesKey: "q14Yes", noKey: "q14No" },
    { key: "q15", label: t.cos.i539.securityQuestions.q15, yesKey: "q15Yes", noKey: "q15No" },
    { key: "q16", label: t.cos.i539.securityQuestions.q16, yesKey: "q16Yes", noKey: "q16No" },
    { key: "q17", label: t.cos.i539.securityQuestions.q17, yesKey: "q17Yes", noKey: "q17No" },
    { key: "q18", label: t.cos.i539.securityQuestions.q18, yesKey: "q18Yes", noKey: "q18No" },
    { key: "q19", label: t.cos.i539.securityQuestions.q19, yesKey: "q19Yes", noKey: "q19No" },
    { key: "q20", label: t.cos.i539.securityQuestions.q20, yesKey: "q20Yes", noKey: "q20No" },
  ];

  const saved = (proc.step_data?.i539 ?? {}) as Partial<I539Data> & { hasMiddleName?: boolean };

  const initialValues: I539FormInput = {
    familyName: saved.familyName ?? user.fullName?.split(" ").slice(-1)[0] ?? "",
    givenName: saved.givenName ?? user.fullName?.split(" ")[0] ?? "",
    hasMiddleName: saved.hasMiddleName ?? (!!saved.middleName),
    middleName: saved.middleName ?? "",
    alienNumber: saved.alienNumber ?? "",
    uscisOnlineAccountNumber: saved.uscisOnlineAccountNumber ?? "",
    inCareOf: saved.inCareOf ?? "",
    streetName: saved.streetName ?? "",
    aptSteFlrUnit: saved.aptSteFlrUnit,
    aptSteFlrNumber: saved.aptSteFlrNumber ?? "",
    city: saved.city ?? "",
    state: saved.state ?? "",
    zipCode: saved.zipCode ?? "",
    hasMailingAddress: saved.hasMailingAddress ?? true,
    streetNameForeign: saved.streetNameForeign ?? "",
    aptSteFlrForeignUnit: saved.aptSteFlrForeignUnit,
    aptSteFlrForeignNumber: saved.aptSteFlrForeignNumber ?? "",
    cityForeign: saved.cityForeign ?? "",
    stateForeign: saved.stateForeign ?? "",
    zipCodeForeign: saved.zipCodeForeign ?? "",
    dateOfBirth: saved.dateOfBirth ?? "",
    countryOfCitizenship: saved.countryOfCitizenship ?? "",
    countryOfBirth: saved.countryOfBirth ?? "",
    ssn: saved.ssn ?? "",
    dateOfArrival: saved.dateOfArrival ?? "",
    i94Number: saved.i94Number ?? (proc.step_data?.i94Date as string ?? ""),
    passportNumber: saved.passportNumber ?? "",
    travelDocCountry: saved.travelDocCountry ?? "",
    countryOfIssuance: saved.countryOfIssuance ?? "",
    passportExpirationDate: saved.passportExpirationDate ?? "",
    currentStatus: saved.currentStatus ?? "",
    statusExpirationDate: saved.statusExpirationDate ?? "",
    statusExpiresDS: saved.statusExpiresDS ?? false,
    applicationType: "change",
    extendSelf: saved.extendSelf ?? true,
    extendSpouse: saved.extendSpouse ?? false,
    extendChildren: saved.extendChildren ?? false,
    numberOfCoApplicants: saved.numberOfCoApplicants ?? "0",
    newStatusDropdown: saved.newStatusDropdown ?? (proc.step_data?.targetVisa as string ?? ""),
    effectiveDate: saved.effectiveDate ?? "",
    priorExtensionDate: saved.priorExtensionDate ?? "",
    priorExtensionYes: saved.priorExtensionYes ?? false,
    priorExtensionNo: saved.priorExtensionNo ?? true,
    petitionType_I130: saved.petitionType_I130 ?? false,
    petitionType_I140: saved.petitionType_I140 ?? false,
    petitionType_I360: saved.petitionType_I360 ?? false,
    petitionerName: saved.petitionerName ?? "",
    petitionFiledDate: saved.petitionFiledDate ?? "",
    receiptNumber: saved.receiptNumber ?? "",
    docCountry1: saved.docCountry1 ?? "",
    docCountry2: saved.docCountry2 ?? "",
    docStreet: saved.docStreet ?? "",
    docUnit0: saved.docUnit0 ?? false,
    docUnit1: saved.docUnit1 ?? false,
    docUnit2: saved.docUnit2 ?? false,
    docUnitNumber: saved.docUnitNumber ?? "",
    docCity: saved.docCity ?? "",
    docProvince: saved.docProvince ?? "",
    docPostalCode: saved.docPostalCode ?? "",
    docCountry: saved.docCountry ?? "",
    question3Yes: saved.question3Yes ?? false,
    question3No: saved.question3No ?? true,
    question4Yes: saved.question4Yes ?? false,
    question4No: saved.question4No ?? true,
    question5Yes: saved.question5Yes ?? false,
    question5No: saved.question5No ?? true,
    q6Yes: saved.q6Yes ?? false,   q6No:  saved.q6No  ?? true,
    q7Yes: saved.q7Yes ?? false,   q7No:  saved.q7No  ?? true,
    q8Yes: saved.q8Yes ?? false,   q8No:  saved.q8No  ?? true,
    q9Yes: saved.q9Yes ?? false,   q9No:  saved.q9No  ?? true,
    q10Yes: saved.q10Yes ?? false, q10No: saved.q10No ?? true,
    q11Yes: saved.q11Yes ?? false, q11No: saved.q11No ?? true,
    q12Yes: saved.q12Yes ?? false, q12No: saved.q12No ?? true,
    q13Yes: saved.q13Yes ?? false, q13No: saved.q13No ?? true,
    q14Yes: saved.q14Yes ?? false, q14No: saved.q14No ?? true,
    q15Yes: saved.q15Yes ?? false, q15No: saved.q15No ?? true,
    q16Yes: saved.q16Yes ?? false, q16No: saved.q16No ?? true,
    q17Yes: saved.q17Yes ?? false, q17No: saved.q17No ?? true,
    q18Yes: saved.q18Yes ?? false, q18No: saved.q18No ?? true,
    q19Yes: saved.q19Yes ?? false, q19No: saved.q19No ?? true,
    q20Yes: saved.q20Yes ?? false, q20No: saved.q20No ?? true,
    daytimePhone: saved.daytimePhone ?? user.phoneNumber ?? "",
    mobilePhone: saved.mobilePhone ?? user.phoneNumber ?? "",
    email: saved.email ?? user.email ?? "",
    signature: saved.signature ?? "",
    signatureDate: saved.signatureDate || new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
    interpreterFamilyName: saved.interpreterFamilyName ?? "",
    interpreterGivenName: saved.interpreterGivenName ?? "",
    interpreterPhone: saved.interpreterPhone ?? "",
    interpreterPhoneAlt: saved.interpreterPhoneAlt ?? "",
    interpreterSignatureDate: saved.interpreterSignatureDate ?? "",
    interpreterLanguage: saved.interpreterLanguage ?? "",
    interpreterSignature: saved.interpreterSignature ?? "",
    preparerFamilyName: saved.preparerFamilyName ?? "",
    preparerGivenName: saved.preparerGivenName ?? "",
    preparerBusiness: saved.preparerBusiness ?? "",
    preparerPhone: saved.preparerPhone ?? "",
    preparerFax: saved.preparerFax ?? "",
    preparerEmail: saved.preparerEmail ?? "",
    preparerSignature: saved.preparerSignature ?? "",
    preparerSignatureDate: saved.preparerSignatureDate ?? "",
    dependentsA: (proc.step_data?.dependents as any[])?.map(dep => {
      const savedDep = (saved.dependentsA as any[])?.find(d => d.id === dep.id) || {};
      return {
        id: dep.id,
        familyName: savedDep.familyName || dep.name.split(" ").slice(-1)[0] || "",
        givenName: savedDep.givenName || dep.name.split(" ")[0] || "",
        middleName: savedDep.middleName || "",
        dateOfBirth: savedDep.dateOfBirth || (dep.birthDate ? dep.birthDate.split("-").reverse().join("/") : ""),
        countryOfBirth: savedDep.countryOfBirth || "",
        countryOfCitizenship: savedDep.countryOfCitizenship || "",
        alienNumber: savedDep.alienNumber || "",
        ssn: savedDep.ssn || "",
        uscisOnlineAccountNumber: savedDep.uscisOnlineAccountNumber || "",
        dateOfArrival: savedDep.dateOfArrival || "",
        i94Number: savedDep.i94Number || (dep.i94Date ? dep.i94Date.split("-").reverse().join("/") : ""),
        passportNumber: savedDep.passportNumber || "",
        travelDocNumber: savedDep.travelDocNumber || "",
        countryOfIssuance: savedDep.countryOfIssuance || "",
        passportExpirationDate: savedDep.passportExpirationDate || "",
        currentStatus: savedDep.currentStatus || "",
        statusExpirationDate: savedDep.statusExpirationDate || "",
        daytimePhone: savedDep.daytimePhone || "",
        mobilePhone: savedDep.mobilePhone || "",
        email: savedDep.email || "",
        signature: savedDep.signature || "",
        signatureDate: savedDep.signatureDate || new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
        q1Yes: savedDep.q1Yes || false, q1No: savedDep.q1No ?? true,
        q2Yes: savedDep.q2Yes || false, q2No: savedDep.q2No ?? true,
        q3Yes: savedDep.q3Yes || false, q3No: savedDep.q3No ?? true,
        q4Yes: savedDep.q4Yes || false, q4No: savedDep.q4No ?? true,
        q5Yes: savedDep.q5Yes || false, q5No: savedDep.q5No ?? true,
        q6Yes: savedDep.q6Yes || false, q6No: savedDep.q6No ?? true,
        q7Yes: savedDep.q7Yes || false, q7No: savedDep.q7No ?? true,
        q8Yes: savedDep.q8Yes || false, q8No: savedDep.q8No ?? true,
        q9Yes: savedDep.q9Yes || false, q9No: savedDep.q9No ?? true,
        q10Yes: savedDep.q10Yes || false, q10No: savedDep.q10No ?? true,
        q11Yes: savedDep.q11Yes || false, q11No: savedDep.q11No ?? true,
        q12Yes: savedDep.q12Yes || false, q12No: savedDep.q12No ?? true,
        q13Yes: savedDep.q13Yes || false, q13No: savedDep.q13No ?? true,
        q14Yes: savedDep.q14Yes || false, q14No: savedDep.q14No ?? true,
        q15Yes: savedDep.q15Yes || false, q15No: savedDep.q15No ?? true,
      };
    }) || [],
  };

  const validate = (values: I539FormInput) => {
    return i539Validator(values);
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={validate}
      onSubmit={async (values) => {
        setIsGenerating(true);
        try {
          await processService.updateStepData(proc.id, { i539: values });
          const filledBytes = await fillI539Form(values as unknown as I539Data);
          const pdfUrl = await uploadFilledI539(filledBytes, proc.id, user.id);
          await processService.updateStepData(proc.id, { i539: values, i539PdfUrl: pdfUrl });
          onComplete();
          toast.success(t.cos.i539.toasts.success);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : t.cos.i539.toasts.error);
        } finally {
          setIsGenerating(false);
        }
      }}
    >
      {({ values, setFieldValue, validateForm, handleSubmit }) => {
        const handleSaveDraft = async () => {
          setIsSaving(true);
          try {
            await processService.updateStepData(proc.id, { i539: values });
            toast.success(t.cos.i539.toasts.draftSaved);
          } catch {
            toast.error(t.cos.i539.toasts.draftError);
          } finally {
            setIsSaving(false);
          }
        };

        const handleGenerate = async () => {
          const errs = await validateForm();
          const errKeys = Object.keys(errs);
          if (errKeys.length > 0) {
            // Translate common field names for the toast
            const fieldLabels: Record<string, string> = {
              familyName: "Family Name", givenName: "Given Name", dateOfBirth: "Date of Birth",
              zipCode: "ZIP Code", i94Number: "I-94 Number", passportNumber: "Passport Number",
              currentStatus: "Current Status", newStatusDropdown: "New Status Requested",
              effectiveDate: "Effective Date", hasMailingAddress: "Address Choice",
              interpreterPhone: "Interpreter Phone", preparerPhone: "Preparer Phone"
            };
            
            const errorList = errKeys.slice(0, 3).map(k => fieldLabels[k] || k).join(", ");
            toast.error(t.cos.i539.toasts.checkFields.replace("{errorList}", errorList));
            
            // Find the first error that actually exists in the DOM
            const firstKeyWithDOM = errKeys.find(key => 
              document.getElementById(`field-${key}`) || document.getElementsByName(key)[0]
            );
            
            if (firstKeyWithDOM) {
              const element = document.getElementById(`field-${firstKeyWithDOM}`) || document.getElementsByName(firstKeyWithDOM)[0];
              element?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            
            handleSubmit(); 
            return;
          }
          handleSubmit();
        };

        return (
          <Form className="space-y-4 pb-20">
            {/* ── Part 1: Information About You ── */}
            <SectionCard title={t.cos.i539.labels.fullLegalName} subtitle={t.cos.i539.sections.part1} icon={MdPerson}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label={t.cos.i539.labels.familyName} required name="familyName" tooltip={I539_TOOLTIPS.familyName}>
                  <TextInput name="familyName" placeholder="Silva" />
                </Field>
                <Field label={t.cos.i539.labels.givenName} required name="givenName" tooltip={I539_TOOLTIPS.givenName}>
                  <TextInput name="givenName" placeholder="Anderson" />
                </Field>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                    <input 
                      type="checkbox" 
                      checked={values.hasMiddleName} 
                      onChange={e => {
                        const checked = e.target.checked;
                        setFieldValue("hasMiddleName", checked);
                        if (!checked) setFieldValue("middleName", "");
                      }}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                    />
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t.cos.i539.labels.hasMiddleName}</span>
                  </div>
                  {values.hasMiddleName && (
                    <Field label={t.cos.i539.labels.middleName} name="middleName" tooltip={I539_TOOLTIPS.middleName}>
                      <TextInput name="middleName" />
                    </Field>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard title={t.cos.i539.labels.identifiers} subtitle={t.cos.i539.sections.part1} icon={MdBadge}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label={t.cos.i539.labels.alienNumber} name="alienNumber" tooltip={I539_TOOLTIPS.alienNumber}><TextInput name="alienNumber" placeholder="9 digits" /></Field>
                <Field label={t.cos.i539.labels.uscisOnlineAccount} name="uscisOnlineAccountNumber" tooltip={I539_TOOLTIPS.uscisOnlineAccount}><TextInput name="uscisOnlineAccountNumber" placeholder="12 digits" /></Field>
              </div>
            </SectionCard>

            <SectionCard title={t.cos.i539.labels.mailingAddress} subtitle={t.cos.i539.sections.part1} icon={MdLocationOn}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <Field label={t.cos.i539.labels.inCareOf} name="inCareOf"><TextInput name="inCareOf" /></Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <Field label={t.cos.i539.labels.streetName} required name="streetName" tooltip={I539_TOOLTIPS.streetName}><TextInput name="streetName" /></Field>
                  </div>
                  <div>
                    <Field label={t.cos.i539.labels.unitType} name="aptSteFlrUnit">
                      <SelectInput name="aptSteFlrUnit">
                        <option value="">N/A</option>
                        <option value="Apt">Apt</option>
                        <option value="Ste">Ste</option>
                        <option value="Flr">Flr</option>
                      </SelectInput>
                    </Field>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Field label={t.cos.i539.labels.unitNumber} name="aptSteFlrNumber" tooltip={I539_TOOLTIPS.aptSteFlrNumber}><TextInput name="aptSteFlrNumber" /></Field>
                  <div className="md:col-span-2">
                    <Field label={t.cos.i539.labels.city} required name="city" tooltip={I539_TOOLTIPS.city}><TextInput name="city" /></Field>
                  </div>
                  <Field label={t.cos.i539.labels.state} required name="state" tooltip={I539_TOOLTIPS.state}>
                    <SelectInput name="state">
                      <option value="">Select...</option>
                      {["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"].map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectInput>
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label={t.cos.i539.labels.zipCode} required name="zipCode" tooltip={I539_TOOLTIPS.zipCode}><TextInput name="zipCode" /></Field>
                </div>
                
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-black text-slate-800 tracking-tight mb-2">{t.cos.i539.labels.sameAddress}</p>
                  <div className="w-48">
                    <YesNoGroup yesName="hasMailingAddress" noName="dummy" /> 
                  </div>
                </div>
              </div>
            </SectionCard>

            {values.hasMailingAddress === false && (
              <SectionCard title={t.cos.i539.labels.physicalAddress} subtitle={t.cos.i539.sections.part1} icon={MdLocationOn}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="col-span-2">
                    <Field label={t.cos.i539.labels.streetName} name="streetNameForeign">
                      <TextInput name="streetNameForeign" placeholder="456 Main St" />
                    </Field>
                  </div>
                  <Field label="Apt / Ste / Flr Unit" name="aptSteFlrForeignUnit">
                    <div className="flex gap-2">
                      {(["Apt", "Ste", "Flr"] as const).map(u => (
                        <button key={u} type="button"
                          onClick={() => setFieldValue("aptSteFlrForeignUnit", values.aptSteFlrForeignUnit === u ? undefined : u)}
                          className={`flex-1 py-3 rounded-xl border text-xs font-black transition-all shadow-sm ${values.aptSteFlrForeignUnit === u ? "border-primary bg-primary/10 text-primary" : "border-slate-200 text-slate-400 bg-white hover:border-slate-300"}`}>
                          {u}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5">
                  <Field label={t.cos.i539.labels.unitNumber} name="aptSteFlrForeignNumber"><TextInput name="aptSteFlrForeignNumber" /></Field>
                  <Field label={t.cos.i539.labels.city} name="cityForeign"><TextInput name="cityForeign" /></Field>
                  <Field label={t.cos.i539.labels.state} name="stateForeign"><SelectInput name="stateForeign" options={US_STATES} /></Field>
                  <Field label={t.cos.i539.labels.zipCode} name="zipCodeForeign"><TextInput name="zipCodeForeign" /></Field>
                </div>
              </SectionCard>
            )}

            <SectionCard title={t.cos.i539.labels.travelId} subtitle={t.cos.i539.sections.part1} icon={MdFlightTakeoff}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label={t.cos.i539.labels.dob} required name="dateOfBirth" tooltip={I539_TOOLTIPS.dateOfBirth}><TextInput name="dateOfBirth" type="date" /></Field>
                <Field label={t.cos.i539.labels.citizenship} required name="countryOfCitizenship" tooltip={I539_TOOLTIPS.countryOfCitizenship}><TextInput name="countryOfCitizenship" /></Field>
                <Field label={t.cos.i539.labels.birthCountry} required name="countryOfBirth" tooltip={I539_TOOLTIPS.countryOfBirth}><TextInput name="countryOfBirth" /></Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label={t.cos.i539.labels.ssn} name="ssn" tooltip={I539_TOOLTIPS.ssn}><TextInput name="ssn" placeholder="XXX-XX-XXXX" /></Field>
                <Field label={t.cos.i539.labels.arrivalDate} required name="dateOfArrival" tooltip={I539_TOOLTIPS.dateOfArrival}><TextInput name="dateOfArrival" type="date" /></Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label={t.cos.i539.labels.i94Number} required name="i94Number" tooltip={I539_TOOLTIPS.i94Number}><TextInput name="i94Number" placeholder="11 digits" /></Field>
                <Field label={t.cos.i539.labels.passportNumber} required name="passportNumber" tooltip={I539_TOOLTIPS.passportNumber}><TextInput name="passportNumber" /></Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label={t.cos.i539.labels.passportIssuance} name="countryOfIssuance" tooltip={I539_TOOLTIPS.countryOfBirth}><TextInput name="countryOfIssuance" /></Field>
                <Field label={t.cos.i539.labels.passportExp} required name="passportExpirationDate" tooltip={I539_TOOLTIPS.passportExpirationDate}><TextInput name="passportExpirationDate" type="date" /></Field>
                <Field label={t.cos.i539.labels.currentStatus} required name="currentStatus" tooltip={I539_TOOLTIPS.currentStatus}><TextInput name="currentStatus" /></Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label={t.cos.i539.labels.statusExp} name="statusExpirationDate" tooltip={I539_TOOLTIPS.statusExpirationDate}><TextInput name="statusExpirationDate" type="date" disabled={values.statusExpiresDS} /></Field>
                <div className="flex flex-col justify-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" name="statusExpiresDS" checked={values.statusExpiresDS} onChange={e => setFieldValue('statusExpiresDS', e.target.checked)} className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4" />
                    <span className="text-xs font-bold text-slate-600 group-hover:text-primary transition-colors">{t.cos.i539.labels.durationStatus}</span>
                  </label>
                </div>
              </div>
            </SectionCard>

            <SectionCard title={t.cos.i539.labels.changeStatus} subtitle={t.cos.i539.sections.part2} icon={MdFactCheck}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label={t.cos.i539.labels.newStatusRequested} name="newStatusDropdown" tooltip={I539_TOOLTIPS.newStatusDropdown}>
                  <SelectInput name="newStatusDropdown">
                    <option value="">{t.cos.form.dependents.select}</option>
                    <option value="F-1 (Academic Student)">F-1 (Academic Student)</option>
                    <option value="F-2 (Spouse/Child of F-1)">F-2 (Spouse/Child of F-1)</option>
                    <option value="B-1 (Visitor for Business)">B-1 (Visitor for Business)</option>
                    <option value="B-2 (Visitor for Pleasure)">B-2 (Visitor for Pleasure)</option>
                    <option value="M-1 (Vocational Student)">M-1 (Vocational Student)</option>
                    <option value="J-1 (Exchange Visitor)">J-1 (Exchange Visitor)</option>
                  </SelectInput>
                </Field>
                <Field label={t.cos.i539.labels.effectiveDate} name="effectiveDate" tooltip={I539_TOOLTIPS.effectiveDate}><TextInput name="effectiveDate" type="date" /></Field>
              </div>
            </SectionCard>

            <SectionCard title={t.cos.i539.labels.processingInfo} subtitle={t.cos.i539.sections.part3} icon={MdHealthAndSafety}>
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-3">{t.cos.i539.labels.priorExtensionQuery}</p>
                  <div className="w-48 mb-4">
                    <YesNoGroup yesName="priorExtensionYes" noName="priorExtensionNo" />
                  </div>
                  {values.priorExtensionYes && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <Field label={t.cos.i539.labels.priorExtensionDate} name="priorExtensionDate">
                        <TextInput name="priorExtensionDate" type="date" />
                      </Field>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-800 mb-4">{t.cos.i539.labels.immigrantPetitionQuery}</p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    {([{ k: "petitionType_I130", l: "I-130" }, { k: "petitionType_I140", l: "I-140" }, { k: "petitionType_I360", l: "I-360" }] as const).map(({ k, l }) => (
                      <label key={k} className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                        <button type="button" onClick={() => setFieldValue(k, !values[k])}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${values[k] ? "border-primary bg-primary" : "border-slate-300 bg-white"}`}>
                          {!!values[k] && <span className="text-white text-[10px] font-black">✓</span>}
                        </button>
                        <span className="text-sm font-bold text-slate-700">{l}</span>
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label={t.cos.i539.labels.petitionDate} name="petitionFiledDate" tooltip={I539_TOOLTIPS.signatureDate}><TextInput name="petitionFiledDate" type="date" /></Field>
                    <Field label={t.cos.i539.labels.receiptNumber} name="receiptNumber" tooltip={I539_TOOLTIPS.alienNumber}><TextInput name="receiptNumber" /></Field>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.cos.i539.labels.foreignAddress}</p>
                  <div className="col-span-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-full space-y-4">
                      <Field label={t.cos.i539.labels.foreignStreet} name="docStreet" tooltip={I539_TOOLTIPS.streetName}><TextInput name="docStreet" /></Field>
                      <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase self-center mr-2">{t.cos.i539.labels.unitType}:</span>
                        {[
                          { label: "Apt", key: "docUnit0" },
                          { label: "Ste", key: "docUnit1" },
                          { label: "Flr", key: "docUnit2" },
                        ].map(({ label, key }) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer group">
                             <button type="button"
                              onClick={() => {
                                setFieldValue("docUnit0", key === "docUnit0");
                                setFieldValue("docUnit1", key === "docUnit1");
                                setFieldValue("docUnit2", key === "docUnit2");
                              }}
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${values[key as keyof I539FormInput] ? "border-primary bg-primary" : "border-slate-300 bg-white"}`}>
                              {!!values[key as keyof I539FormInput] && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </button>
                            <span className="text-xs font-bold text-slate-600">{label}</span>
                          </label>
                        ))}
                      </div>
                      <Field label={t.cos.i539.labels.unitNumber} name="docUnitNumber" tooltip={I539_TOOLTIPS.aptSteFlrNumber}><TextInput name="docUnitNumber" /></Field>
                    </div>
                    <Field label={t.cos.i539.labels.city} name="docCity" tooltip={I539_TOOLTIPS.city}><TextInput name="docCity" /></Field>
                    <Field label={t.cos.i539.labels.province} name="docProvince" tooltip={I539_TOOLTIPS.state}><TextInput name="docProvince" /></Field>
                    <Field label={t.cos.i539.labels.postalCode} name="docPostalCode" tooltip={I539_TOOLTIPS.zipCode}><TextInput name="docPostalCode" /></Field>
                    <Field label={t.cos.i539.labels.country} name="docCountry" tooltip={I539_TOOLTIPS.countryOfBirth}><TextInput name="docCountry" /></Field>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-6">
                  {[
                    { label: t.cos.i539.labels.q3, yKey: "question3Yes", nKey: "question3No", t: "Se você já solicitou a remoção de algum impedimento de entrada nos EUA / If you have ever requested a waiver of inadmissibility." },
                    { label: t.cos.i539.labels.q4, yKey: "question4Yes", nKey: "question4No", t: "Se você já foi deportado ou removido dos EUA / If you have ever been deportado ou removido dos EUA." },
                    { label: t.cos.i539.labels.q5, yKey: "question5Yes", nKey: "question5No", t: "Se existe uma petição de imigrante sendo protocolada agora / If an immigrant petition is currently being filed." },
                  ].map(({ label, yKey, nKey, t }) => (
                    <Field key={yKey} label={label} name={yKey} tooltip={t}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-sm font-bold text-slate-700 leading-snug md:max-w-2xl">{label}</p>
                        <div className="w-32 shrink-0">
                          <YesNoGroup yesName={yKey} noName={nKey} />
                        </div>
                      </div>
                    </Field>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard title={t.cos.i539.labels.securityInfo} subtitle={t.cos.i539.sections.part4} icon={MdSecurity}>
              <div className="space-y-4">
                {SECURITY_QUESTIONS.map(({ label, yesKey, noKey }) => (
                  <Field key={yesKey} label={label} name={yesKey} tooltip={t.cos.i539.labels.securityInfo}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-0">
                      <p className="text-sm font-bold text-slate-700 leading-snug md:max-w-2xl">{label}</p>
                      <div className="w-32 shrink-0">
                        <YesNoGroup yesName={yesKey} noName={noKey} />
                      </div>
                    </div>
                  </Field>
                ))}
              </div>
            </SectionCard>

            <SectionCard title={t.cos.i539.labels.contactInfo} subtitle={t.cos.i539.sections.part5} icon={MdContactPhone}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label={t.cos.i539.labels.daytimePhone} required name="daytimePhone" tooltip={I539_TOOLTIPS.daytimePhone}><TextInput name="daytimePhone" mask="phone" /></Field>
                <Field label={t.cos.i539.labels.mobilePhone} name="mobilePhone" tooltip={I539_TOOLTIPS.mobilePhone}><TextInput name="mobilePhone" mask="phone" /></Field>
                <Field label={t.cos.i539.labels.email} required name="email" tooltip={I539_TOOLTIPS.email}><TextInput name="email" type="email" /></Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <Field label={t.cos.i539.labels.signature} name="signature" tooltip={I539_TOOLTIPS.signature}><TextInput name="signature" disabled /></Field>
                <Field label={t.cos.i539.labels.date} name="signatureDate" tooltip={I539_TOOLTIPS.signatureDate}><TextInput name="signatureDate" type="date" disabled /></Field>
              </div>
            </SectionCard>

            <SectionCard title={t.cos.i539.labels.interpreterInfo} subtitle={t.cos.i539.sections.part6} icon={MdRecordVoiceOver}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label={t.cos.i539.labels.familyName} name="interpreterFamilyName" tooltip={I539_TOOLTIPS.preparerFamilyName}><TextInput name="interpreterFamilyName" /></Field>
                <Field label={t.cos.i539.labels.givenName} name="interpreterGivenName" tooltip={I539_TOOLTIPS.preparerGivenName}><TextInput name="interpreterGivenName" /></Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                <Field label={t.cos.i539.labels.daytimePhone} name="interpreterPhone" tooltip={I539_TOOLTIPS.preparerPhone}><TextInput name="interpreterPhone" mask="phone" /></Field>
                <Field label={t.cos.i539.labels.email} name="interpreterEmail" tooltip={I539_TOOLTIPS.preparerEmail}><TextInput name="interpreterEmail" /></Field>
                <Field label={t.cos.i539.labels.language} name="interpreterLanguage" tooltip={t.cos.i539.labels.language}><TextInput name="interpreterLanguage" /></Field>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <Field label={t.cos.i539.labels.signature} name="interpreterSignature" tooltip={I539_TOOLTIPS.preparerSignature}><TextInput name="interpreterSignature" /></Field>
                <Field label={t.cos.i539.labels.date} name="interpreterSignatureDate" tooltip={I539_TOOLTIPS.preparerSignatureDate}><TextInput name="interpreterSignatureDate" type="date" /></Field>
              </div>
            </SectionCard>

            <SectionCard title={t.cos.i539.labels.preparerInfo} subtitle={t.cos.i539.sections.part7} icon={MdEditDocument}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label={t.cos.i539.labels.familyName} name="preparerFamilyName" tooltip={I539_TOOLTIPS.preparerFamilyName}><TextInput name="preparerFamilyName" /></Field>
                <Field label={t.cos.i539.labels.givenName} name="preparerGivenName" tooltip={I539_TOOLTIPS.preparerGivenName}><TextInput name="preparerGivenName" /></Field>
              </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5">
                <Field label={t.cos.i539.labels.business} name="preparerBusiness" tooltip={I539_TOOLTIPS.preparerBusiness}><TextInput name="preparerBusiness" /></Field>
                <Field label={t.cos.i539.labels.daytimePhone} name="preparerPhone" tooltip={I539_TOOLTIPS.preparerPhone}><TextInput name="preparerPhone" mask="phone" /></Field>
                <Field label={t.cos.i539.labels.fax} name="preparerFax" tooltip={t.cos.i539.labels.fax}><TextInput name="preparerFax" /></Field>
                <Field label={t.cos.i539.labels.email} name="preparerEmail" tooltip={I539_TOOLTIPS.preparerEmail}><TextInput name="preparerEmail" /></Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <Field label={t.cos.i539.labels.signature} name="preparerSignature" tooltip={I539_TOOLTIPS.preparerSignature}><TextInput name="preparerSignature" /></Field>
                <Field label={t.cos.i539.labels.date} name="preparerSignatureDate" tooltip={I539_TOOLTIPS.preparerSignatureDate}><TextInput name="preparerSignatureDate" type="date" /></Field>
              </div>
            </SectionCard>

            {/* ── Supplemental Information for Dependents (I-539A) ── */}
            {values.dependentsA && values.dependentsA.length > 0 && (
              <div className="pt-10 mt-10 border-t-4 border-slate-100 space-y-8">
                <div className="flex items-center gap-4 mb-2 px-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-sm border border-amber-500/20">
                    <MdPerson className="text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">I-539A Supplements</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Form I-539A — Supplemental Information for Dependents</p>
                  </div>
                </div>

                {values.dependentsA.map((dep, idx) => (
                  <div key={dep.id} className="space-y-6">
                    <SectionCard title={`Dependent ${idx + 1}: ${dep.givenName} ${dep.familyName}`} subtitle="Part 1 — Information About You (Dependent)" icon={MdPerson}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <Field label="Family Name" required name={`dependentsA.${idx}.familyName`}><TextInput name={`dependentsA.${idx}.familyName`} /></Field>
                        <Field label="Given Name" required name={`dependentsA.${idx}.givenName`}><TextInput name={`dependentsA.${idx}.givenName`} /></Field>
                        <Field label="Middle Name" name={`dependentsA.${idx}.middleName`}><TextInput name={`dependentsA.${idx}.middleName`} /></Field>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                        <Field label="Date of Birth" required name={`dependentsA.${idx}.dateOfBirth`}><TextInput name={`dependentsA.${idx}.dateOfBirth`} type="date" /></Field>
                        <Field label="Country of Birth" required name={`dependentsA.${idx}.countryOfBirth`}><TextInput name={`dependentsA.${idx}.countryOfBirth`} /></Field>
                        <Field label="Country of Citizenship" required name={`dependentsA.${idx}.countryOfCitizenship`}><TextInput name={`dependentsA.${idx}.countryOfCitizenship`} /></Field>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                        <Field label="A-Number" name={`dependentsA.${idx}.alienNumber`}><TextInput name={`dependentsA.${idx}.alienNumber`} /></Field>
                        <Field label="SSN" name={`dependentsA.${idx}.ssn`}><TextInput name={`dependentsA.${idx}.ssn`} /></Field>
                        <Field label="USCIS Online Account" name={`dependentsA.${idx}.uscisOnlineAccountNumber`}><TextInput name={`dependentsA.${idx}.uscisOnlineAccountNumber`} /></Field>
                      </div>
                      <div className="pt-6 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Arrival/Departure & Status Info</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <Field label="Date of Arrival" required name={`dependentsA.${idx}.dateOfArrival`}><TextInput name={`dependentsA.${idx}.dateOfArrival`} type="date" /></Field>
                          <Field label="I-94 Number" required name={`dependentsA.${idx}.i94Number`}><TextInput name={`dependentsA.${idx}.i94Number`} /></Field>
                          <Field label="Passport Number" required name={`dependentsA.${idx}.passportNumber`}><TextInput name={`dependentsA.${idx}.passportNumber`} /></Field>
                          <Field label="Travel Doc" name={`dependentsA.${idx}.travelDocNumber`}><TextInput name={`dependentsA.${idx}.travelDocNumber`} /></Field>
                          <Field label="Issuance Country" name={`dependentsA.${idx}.countryOfIssuance`}><TextInput name={`dependentsA.${idx}.countryOfIssuance`} /></Field>
                          <Field label="Passport EXP Date" required name={`dependentsA.${idx}.passportExpirationDate`}><TextInput name={`dependentsA.${idx}.passportExpirationDate`} type="date" /></Field>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                          <Field label="Current Status" required name={`dependentsA.${idx}.currentStatus`}><TextInput name={`dependentsA.${idx}.currentStatus`} /></Field>
                          <Field label="Status Exp Date" name={`dependentsA.${idx}.statusExpirationDate`}><TextInput name={`dependentsA.${idx}.statusExpirationDate`} type="date" /></Field>
                        </div>
                      </div>
                    </SectionCard>

                    <SectionCard title={`Security Questions — ${dep.givenName}`} subtitle="Part 3 — Additional Information" icon={MdSecurity}>
                      <div className="space-y-4">
                        {[
                          { l: "1. Is an immigrant petition being filed for you?", y: `dependentsA.${idx}.q1Yes`, n: `dependentsA.${idx}.q1No` },
                          { l: "2. Is an immigrant petition for any other person being filed for you?", y: `dependentsA.${idx}.q2Yes`, n: `dependentsA.${idx}.q2No` },
                          { l: "3. Have you ever been denied or requested to remove an inadmissibility?", y: `dependentsA.${idx}.q3Yes`, n: `dependentsA.${idx}.q3No` },
                          { l: "4. Have you ever been deported or removed from the U.S.?", y: `dependentsA.${idx}.q4Yes`, n: `dependentsA.${idx}.q4No` },
                          { l: "5. Have you ever been in removal proceedings?", y: `dependentsA.${idx}.q5Yes`, n: `dependentsA.${idx}.q5No` },
                        ].map(({ l, y, n }) => (
                          <div key={y} className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-0">
                            <p className="text-sm font-bold text-slate-700 leading-snug md:max-w-2xl">{l}</p>
                            <div className="w-32 shrink-0">
                              <YesNoGroup yesName={y} noName={n} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>

                    <SectionCard title={`Contact & Signature — ${dep.givenName}`} subtitle="Part 4 — Statement & Contact" icon={MdContactPhone}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <Field label="Phone" name={`dependentsA.${idx}.daytimePhone`}><TextInput name={`dependentsA.${idx}.daytimePhone`} mask="phone" /></Field>
                        <Field label="Mobile" name={`dependentsA.${idx}.mobilePhone`}><TextInput name={`dependentsA.${idx}.mobilePhone`} mask="phone" /></Field>
                        <Field label="Email" name={`dependentsA.${idx}.email`}><TextInput name={`dependentsA.${idx}.email`} /></Field>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                        <Field label="Signature (Printed Name)" name={`dependentsA.${idx}.signature`}><TextInput name={`dependentsA.${idx}.signature`} disabled /></Field>
                        <Field label="Signature Date" name={`dependentsA.${idx}.signatureDate`}><TextInput name={`dependentsA.${idx}.signatureDate`} type="date" disabled /></Field>
                      </div>
                    </SectionCard>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border-2 border-primary bg-primary/5 overflow-hidden shadow-xl shadow-primary/10 mt-12 sticky bottom-6 z-10 backdrop-blur-md">
              <div className="px-7 py-5 bg-white/50 border-b border-primary/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary shadow-sm flex items-center justify-center text-white shrink-0">
                  <RiFilePdf2Line className="text-2xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black text-slate-800 tracking-tight">Revise e Envie</h3>
                  <p className="text-xs font-semibold text-slate-500">Clique em Salvar Rascunho ou Enviar Formulário.</p>
                </div>
              </div>
              <div className="px-7 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSaving || isGenerating}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-sm font-black text-slate-600 bg-white hover:bg-slate-50 transition-all shadow-sm"
                >
                  {isSaving ? <RiLoader4Line className="animate-spin text-lg" /> : <RiSave3Line className="text-lg" />}
                  Salvar Rascunho
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || isSaving}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-3.5 rounded-xl bg-primary text-white text-sm font-black uppercase tracking-wider shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <><RiLoader4Line className="animate-spin text-xl" /> Enviando...</>
                  ) : (
                    <><RiArrowRightLine className="text-xl" /> Enviar Formulário</>
                  )}
                </button>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
