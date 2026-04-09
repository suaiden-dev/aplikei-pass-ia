import { useState, type ReactNode, type ElementType } from "react";
import { RiLoader4Line, RiFilePdf2Line, RiSave3Line, RiArrowRightLine } from "react-icons/ri";
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

// ─── Constants ────────────────────────────────────────────────────────────────

const US_STATES = [
  "", "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VT","VA","WA","WV","WI","WY","DC",
];

const VISA_STATUSES = [
  "","B-1","B-2","B-1/B-2","E-1","E-2","F-1","F-2","H-1B","H-2A","H-2B",
  "H-4","J-1","J-2","K-1","K-2","L-1","L-2","M-1","M-2","O-1","O-2","O-3",
  "P-1","P-2","P-3","P-4","R-1","R-2","TN","TD","WT","WB","Other",
];

// Part 4 security questions (Q6-Q20)
const SECURITY_QUESTIONS: { key: string; label: string; yesKey: string; noKey: string }[] = [
  { key: "q6",  label: "6. Is this application related to a removal, exclusion, rescission, or deportation proceeding against you?", yesKey: "q6Yes",  noKey: "q6No" },
  { key: "q7",  label: "7. Have you ever been arrested, cited, charged, indicted, fined, or imprisoned for breaking or violating any law or ordinance (excluding traffic violations)?", yesKey: "q7Yes",  noKey: "q7No" },
  { key: "q8",  label: "8. Have you ever served as a public official, representative, employee, or agent of a foreign government?", yesKey: "q8Yes",  noKey: "q8No" },
  { key: "q9",  label: "9. Have you ever been a J nonimmigrant exchange visitor subject to the 2-year foreign residence requirement?", yesKey: "q9Yes",  noKey: "q9No" },
  { key: "q10", label: "10. Are you now in immigration proceedings?", yesKey: "q10Yes", noKey: "q10No" },
  { key: "q11", label: "11. Have you ever, by fraud or willful misrepresentation, sought to procure or procured a visa or any immigration benefit?", yesKey: "q11Yes", noKey: "q11No" },
  { key: "q12", label: "12. Have you ever received public benefits (cash assistance, Medicaid, SSI, food stamps, etc.) in the U.S. or any other country?", yesKey: "q12Yes", noKey: "q12No" },
  { key: "q13", label: "13. Have you ever been a member of or associated with any organization, party, club, or society in the U.S. or any other country?", yesKey: "q13Yes", noKey: "q13No" },
  { key: "q14", label: "14. Have you ever ordered, incited, committed, assisted, or participated in torture?", yesKey: "q14Yes", noKey: "q14No" },
  { key: "q15", label: "15. Have you ever committed, ordered, incited, or participated in extrajudicial killing, political killing, or other act of violence?", yesKey: "q15Yes", noKey: "q15No" },
  { key: "q16", label: "16. Have you ever engaged in or conspired to engage in any terrorist activity?", yesKey: "q16Yes", noKey: "q16No" },
  { key: "q17", label: "17. Have you ever been a member of or associated with a terrorist organization?", yesKey: "q17Yes", noKey: "q17No" },
  { key: "q18", label: "18. Have you ever recruited, enlisted, conscripted, used, or employed child soldiers?", yesKey: "q18Yes", noKey: "q18No" },
  { key: "q19", label: "19. Have you ever engaged in or conspired to engage in money laundering?", yesKey: "q19Yes", noKey: "q19No" },
  { key: "q20", label: "20. Have you ever been the subject of a final order of removal, deportation, or exclusion?", yesKey: "q20Yes", noKey: "q20No" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, required, name, children }: { label: string; required?: boolean; name?: string; children: ReactNode }) {
  const { errors, touched } = useFormikContext<I539FormInput>();
  const error = name && touched[name as keyof I539FormInput] ? (errors[name as keyof I539FormInput] as string) : undefined;

  return (
    <div id={`field-${name}`}>
      <div className="flex justify-between items-center mb-2.5">
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {error && <span className="text-[10px] font-bold text-red-500 animate-in fade-in slide-in-from-right-1">{error}</span>}
      </div>
      {children}
    </div>
  );
}

function TextInput({ name, placeholder, type = "text", disabled }: {
  name: string; placeholder?: string; type?: string; disabled?: boolean;
}) {
  const [field, meta] = useField(name);
  const error = meta.touched && meta.error ? meta.error : undefined;

  return (
    <input
      {...field}
      value={field.value ?? ""}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full bg-slate-50 border ${error ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-4 ${error ? 'focus:ring-red-500/10 focus:border-red-500' : 'focus:ring-primary/10 focus:border-primary'} focus:bg-white transition-all disabled:bg-slate-100 disabled:text-slate-400 placeholder:text-slate-300 placeholder:font-medium shadow-sm shadow-slate-100/50`}
    />
  );
}

function SelectInput({ name, options, disabled }: {
  name: string; options: string[]; disabled?: boolean;
}) {
  const [field, meta] = useField(name);
  const error = meta.touched && meta.error ? meta.error : undefined;

  return (
    <select
      {...field}
      value={field.value ?? ""}
      disabled={disabled}
      className={`w-full bg-slate-50 border ${error ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-4 ${error ? 'focus:ring-red-500/10 focus:border-red-500' : 'focus:ring-primary/10 focus:border-primary'} focus:bg-white transition-all appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 shadow-sm shadow-slate-100/50`}
    >
      {options.map(o => <option key={o} value={o}>{o || "— Select —"}</option>)}
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
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
    preparerFamilyName: saved.preparerFamilyName ?? "Aplikei",
    preparerGivenName: saved.preparerGivenName ?? "Team",
    preparerBusiness: saved.preparerBusiness ?? "Aplikei",
    preparerPhone: saved.preparerPhone ?? "555-555-0199",
    preparerFax: saved.preparerFax ?? "",
    preparerEmail: saved.preparerEmail ?? "suporte@aplikei.com",
    preparerSignature: saved.preparerSignature ?? "Aplikei Team",
    preparerSignatureDate: saved.preparerSignatureDate ?? new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
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
          toast.success("Formulário I-539 enviado com sucesso!");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Erro ao enviar formulário.");
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
            toast.success("Rascunho salvo!");
          } catch {
            toast.error("Erro ao salvar rascunho.");
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
            toast.error(`Atenção: verifique os campos [${errorList}]`);
            
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
            <SectionCard title="Full Legal Name" subtitle="Part 1 — Information About You" icon={MdPerson}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Family Name" required name="familyName">
                  <TextInput name="familyName" placeholder="Silva" />
                </Field>
                <Field label="Given Name" required name="givenName">
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
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">I have a Middle Name</span>
                  </div>
                  {values.hasMiddleName && (
                    <Field label="Middle Name" required name="middleName">
                      <TextInput name="middleName" placeholder="Carlos" />
                    </Field>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Identifiers" subtitle="Part 1 — Information About You" icon={MdBadge}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="A-Number (if any)" name="alienNumber">
                  <TextInput name="alienNumber" placeholder="A-000 000 000" />
                </Field>
                <Field label="USCIS Online Account Number" name="uscisOnlineAccountNumber">
                  <TextInput name="uscisOnlineAccountNumber" placeholder="000-000-000" />
                </Field>
              </div>
            </SectionCard>

            <SectionCard title="U.S. Mailing Address" subtitle="Part 1 — Information About You" icon={MdLocationOn}>
              <div className="space-y-5">
                <Field label="In Care Of Name" name="inCareOf">
                  <TextInput name="inCareOf" placeholder="Optional" />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="col-span-2">
                    <Field label="Street Number and Name" required name="streetName">
                      <TextInput name="streetName" placeholder="123 Brickell Ave" />
                    </Field>
                  </div>
                  <Field label="Apt / Ste / Flr Unit" name="aptSteFlrUnit">
                    <div className="flex gap-2">
                      {(["Apt", "Ste", "Flr"] as const).map(u => (
                        <button key={u} type="button"
                          onClick={() => setFieldValue("aptSteFlrUnit", values.aptSteFlrUnit === u ? undefined : u)}
                          className={`flex-1 py-3 rounded-xl border text-xs font-black transition-all shadow-sm ${values.aptSteFlrUnit === u ? "border-primary bg-primary/10 text-primary" : "border-slate-200 text-slate-400 bg-white hover:border-slate-300"}`}>
                          {u}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <Field label="Unit Number" name="aptSteFlrNumber">
                    <TextInput name="aptSteFlrNumber" placeholder="4B" />
                  </Field>
                  <Field label="City or Town" required name="city">
                    <TextInput name="city" placeholder="Miami" />
                  </Field>
                  <Field label="State" required name="state">
                    <SelectInput name="state" options={US_STATES} />
                  </Field>
                  <Field label="ZIP Code" required name="zipCode">
                    <TextInput name="zipCode" placeholder="33101" />
                  </Field>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-black text-slate-800 tracking-tight mb-2">Is physical address same as mailing?</p>
                  <div className="w-48">
                    <YesNoGroup yesName="hasMailingAddress" noName="dummy" /> 
                    {/* Note: In our logic, 'hasMailingAddress' true means physical SAME AS mailing. */}
                  </div>
                </div>
              </div>
            </SectionCard>

            {values.hasMailingAddress === false && (
              <SectionCard title="Physical Address (since it differs)" subtitle="Part 1 — Information About You" icon={MdLocationOn}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="col-span-2">
                    <Field label="Street Number and Name" name="streetNameForeign">
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
                  <Field label="Unit Number" name="aptSteFlrForeignNumber"><TextInput name="aptSteFlrForeignNumber" /></Field>
                  <Field label="City or Town" name="cityForeign"><TextInput name="cityForeign" /></Field>
                  <Field label="State" name="stateForeign"><SelectInput name="stateForeign" options={US_STATES} /></Field>
                  <Field label="ZIP Code" name="zipCodeForeign"><TextInput name="zipCodeForeign" /></Field>
                </div>
              </SectionCard>
            )}

            <SectionCard title="Travel & Identification" subtitle="Part 1 — Information About You" icon={MdFlightTakeoff}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Country of Birth" required name="countryOfBirth"><TextInput name="countryOfBirth" placeholder="Brazil" /></Field>
                <Field label="Country of Citizenship" required name="countryOfCitizenship"><TextInput name="countryOfCitizenship" placeholder="Brazil" /></Field>
                <Field label="Date of Birth" required name="dateOfBirth"><TextInput name="dateOfBirth" placeholder="MM/DD/YYYY" /></Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                <Field label="Social Security Number" name="ssn"><TextInput name="ssn" placeholder="XXX-XX-XXXX" /></Field>
                <Field label="Date of Last Arrival" required name="dateOfArrival"><TextInput name="dateOfArrival" placeholder="MM/DD/YYYY" /></Field>
                <Field label="I-94 Number" required name="i94Number"><TextInput name="i94Number" placeholder="12345678901" /></Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                <Field label="Passport Number" required name="passportNumber"><TextInput name="passportNumber" placeholder="AB123456" /></Field>
                <Field label="Travel Document Country" name="travelDocCountry"><TextInput name="travelDocCountry" placeholder="Brazil" /></Field>
                <Field label="Country of Issuance" name="countryOfIssuance"><TextInput name="countryOfIssuance" placeholder="Brazil" /></Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                <Field label="Passport Expiration Date" required name="passportExpirationDate"><TextInput name="passportExpirationDate" placeholder="MM/DD/YYYY" /></Field>
                <Field label="Current Nonimmigrant Status" required name="currentStatus"><SelectInput name="currentStatus" options={VISA_STATUSES} /></Field>
                <Field label="Status Expiration Date" name="statusExpirationDate">
                  <TextInput name="statusExpirationDate" placeholder="MM/DD/YYYY" disabled={values.statusExpiresDS} />
                </Field>
              </div>
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3 w-fit">
                <button type="button"
                  onClick={() => setFieldValue("statusExpiresDS", !values.statusExpiresDS)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${values.statusExpiresDS ? "border-primary bg-primary" : "border-slate-300 bg-white"}`}>
                  {values.statusExpiresDS && <span className="text-white text-[10px] font-black">✓</span>}
                </button>
                <span className="text-sm font-bold text-slate-700">Check here if Status is "Duration of Status" (D/S)</span>
              </div>
            </SectionCard>

            <SectionCard title="Change of Status" subtitle="Part 2 — Application Type" icon={MdFactCheck}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="New Status Requested" required name="newStatusDropdown">
                  <SelectInput name="newStatusDropdown" options={VISA_STATUSES} />
                </Field>
                <Field label="Effective Date (MM/DD/YYYY)" name="effectiveDate">
                  <TextInput name="effectiveDate" placeholder="MM/DD/YYYY" />
                </Field>
              </div>
            </SectionCard>

            <SectionCard title="Processing Information" subtitle="Part 3 — Processing Information" icon={MdHealthAndSafety}>
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-3">1. Have you previously been granted status extension or change of status?</p>
                  <div className="w-48 mb-4">
                    <YesNoGroup yesName="priorExtensionYes" noName="priorExtensionNo" />
                  </div>
                  {values.priorExtensionYes && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <Field label="Date of Prior Extension (MM/DD/YYYY)" name="priorExtensionDate">
                        <TextInput name="priorExtensionDate" placeholder="MM/DD/YYYY" />
                      </Field>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-800 mb-4">2. Has an immigrant petition ever been filed on your behalf?</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Field label="Name of Petitioner" name="petitionerName"><TextInput name="petitionerName" /></Field>
                    <Field label="Date Filed" name="petitionFiledDate"><TextInput name="petitionFiledDate" placeholder="MM/DD/YYYY" /></Field>
                    <Field label="Receipt Number" name="receiptNumber"><TextInput name="receiptNumber" placeholder="EAC-XX-XXX-XXXXX" /></Field>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Foreign Address for Documents (Optional)</p>
                  <div className="col-span-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-full space-y-4">
                      <Field label="Foreign Street Name" name="docStreet"><TextInput name="docStreet" /></Field>
                      <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase self-center mr-2">Unit Type:</span>
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
                      <Field label="Unit Number" name="docUnitNumber"><TextInput name="docUnitNumber" /></Field>
                    </div>
                    <Field label="City" name="docCity"><TextInput name="docCity" /></Field>
                    <Field label="Province" name="docProvince"><TextInput name="docProvince" /></Field>
                    <Field label="Postal Code" name="docPostalCode"><TextInput name="docPostalCode" /></Field>
                    <Field label="Country" name="docCountry"><TextInput name="docCountry" /></Field>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-6">
                  {[
                    { label: "3. Have you ever requested to remove a ground of inadmissibility?", yKey: "question3Yes", nKey: "question3No" },
                    { label: "4. Have you ever been deported or removed from the U.S.?", yKey: "question4Yes", nKey: "question4No" },
                    { label: "5. Is an immigrant petition currently being filed?", yKey: "question5Yes", nKey: "question5No" },
                  ].map(({ label, yKey, nKey }) => (
                    <Field key={yKey} label={label} name={yKey}>
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

            <SectionCard title="Security Information" subtitle="Part 4 — Additional Information" icon={MdSecurity}>
              <div className="space-y-4">
                {SECURITY_QUESTIONS.map(({ label, yesKey, noKey }) => (
                  <Field key={yesKey} label={label} name={yesKey}>
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

            <SectionCard title="Applicant's Contact" subtitle="Part 5 — Applicant's Statement" icon={MdContactPhone}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Daytime Phone" required name="daytimePhone"><TextInput name="daytimePhone" /></Field>
                <Field label="Mobile Phone" name="mobilePhone"><TextInput name="mobilePhone" /></Field>
                <Field label="Email Address" required name="email"><TextInput name="email" type="email" /></Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <Field label="Signature (Full Name)" required name="signature"><TextInput name="signature" /></Field>
                <Field label="Date" required name="signatureDate"><TextInput name="signatureDate" /></Field>
              </div>
            </SectionCard>

            <SectionCard title="Interpreter Information" subtitle="Part 6 — Interpreter" icon={MdRecordVoiceOver}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Family Name" name="interpreterFamilyName"><TextInput name="interpreterFamilyName" /></Field>
                <Field label="Given Name" name="interpreterGivenName"><TextInput name="interpreterGivenName" /></Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                <Field label="Phone" name="interpreterPhone"><TextInput name="interpreterPhone" /></Field>
                <Field label="Email" name="interpreterEmail"><TextInput name="interpreterEmail" /></Field>
                <Field label="Language" name="interpreterLanguage"><TextInput name="interpreterLanguage" /></Field>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <Field label="Signature (Typed Name)" name="interpreterSignature"><TextInput name="interpreterSignature" /></Field>
                <Field label="Signature Date" name="interpreterSignatureDate"><TextInput name="interpreterSignatureDate" placeholder="MM/DD/YYYY" /></Field>
              </div>
            </SectionCard>

            <SectionCard title="Preparer Information" subtitle="Part 7 — Preparer" icon={MdEditDocument}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Family Name" name="preparerFamilyName"><TextInput name="preparerFamilyName" /></Field>
                <Field label="Given Name" name="preparerGivenName"><TextInput name="preparerGivenName" /></Field>
              </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5">
                <Field label="Business" name="preparerBusiness"><TextInput name="preparerBusiness" /></Field>
                <Field label="Phone" name="preparerPhone"><TextInput name="preparerPhone" /></Field>
                <Field label="Fax" name="preparerFax"><TextInput name="preparerFax" /></Field>
                <Field label="Email" name="preparerEmail"><TextInput name="preparerEmail" /></Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <Field label="Signature (Typed Name)" name="preparerSignature"><TextInput name="preparerSignature" /></Field>
                <Field label="Signature Date" name="preparerSignatureDate"><TextInput name="preparerSignatureDate" placeholder="MM/DD/YYYY" /></Field>
              </div>
            </SectionCard>

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
