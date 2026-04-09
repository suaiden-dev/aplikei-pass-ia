import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  RiInformationLine, 
  RiSave3Line,
  RiCheckDoubleLine,
  RiLoader4Line,
  RiNotification4Line,
  RiBankCardLine,
  RiMagicLine
} from "react-icons/ri";
import { processService, type UserService } from "../../../services/process.service";
import { finalFormsService } from "../../../services/final_forms.service";
import { z } from "zod";
import { zodValidate } from "../../../utils/zodValidate";

const G1145Schema = z.object({
  lastName: z.string().min(1, "Sobrenome obrigatório"),
  firstName: z.string().min(1, "Nome obrigatório"),
  middleName: z.string().optional().nullable().or(z.literal("")),
  email: z.string().min(1, "Email obrigatório").email("Precisa ser um email válido"),
  mobile: z.string().min(1, "Celular obrigatório"),
});

const G1450Schema = z.object({
  applicantLastName: z.string().min(1, "Sobrenome obrigatório"),
  applicantFirstName: z.string().min(1, "Nome obrigatório"),
  applicantMiddleName: z.string().optional().nullable().or(z.literal("")),
  dateOfBirth: z.string().min(1, "Data de Nascimento obrigatória"),
  aNumber: z.string().optional().nullable().or(z.literal("")),
  cardType: z.string().min(1, "Selecione a bandeira"),
  cardholderName: z.string().min(1, "Nome no cartão obrigatório"),
  cardNumber: z.string().min(1, "Número do cartão obrigatório").regex(/^\d+$/, "Apenas números").min(13, "Mínimo 13 dígitos"),
  expirationDate: z.string().min(1, "Expiração obrigatória").regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "Formato MM/YYYY"),
  cvv: z.string().min(3, "CVV inválido").max(4, "CVV inválido"),
  streetAddress: z.string().min(1, "Endereço obrigatório"),
  city: z.string().min(1, "Cidade obrigatória"),
  state: z.string().min(1, "Estado obrigatório"),
  zipCode: z.string().min(1, "ZIP Code obrigatório"),
  country: z.string().min(1, "País obrigatório"),
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
    aNumber: string;
    cardType: string;
    cardholderName: string;
    cardNumber: string;
    expirationDate: string;
    cvv: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface Props {
  proc: UserService;
  user: any;
  onComplete: () => void;
}

export default function FinalFormsStep({ proc, user, onComplete }: Props) {
  const [data, setData] = useState<FinalFormsData>({
    g1145: { lastName: "", firstName: "", middleName: "", email: "", mobile: "" },
    g1450: { 
      applicantLastName: "", applicantFirstName: "", applicantMiddleName: "", dateOfBirth: "", aNumber: "",
      cardType: "", cardholderName: "", cardNumber: "", expirationDate: "", cvv: "",
      streetAddress: "", city: "", state: "", zipCode: "", country: "United States" 
    }
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const [errors1145, setErrors1145] = useState<Partial<Record<keyof FinalFormsData["g1145"], string>>>({});
  const [errors1450, setErrors1450] = useState<Partial<Record<keyof FinalFormsData["g1450"], string>>>({});

  useEffect(() => {
    if (proc.step_data?.finalForms) {
      setData(proc.step_data.finalForms as FinalFormsData);
    }
    if (proc.step_data?.g1145PdfUrl && proc.step_data?.g1450PdfUrl) {
      setHasGenerated(true);
    }
  }, [proc]);

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
    const errs1145 = zodValidate(G1145Schema)(data.g1145);
    setErrors1145(errs1145);
  };

  const handleBlur1450 = () => {
    const errs1450 = zodValidate(G1450Schema)(data.g1450);
    setErrors1450(errs1450);
  };

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      await processService.updateStepData(proc.id, { finalForms: data });
      toast.success("Rascunho salvo com sucesso.");
    } catch (error) {
      toast.error("Erro ao salvar rascunho.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    const errs1145 = zodValidate(G1145Schema)(data.g1145);
    const errs1450 = zodValidate(G1450Schema)(data.g1450);

    setErrors1145(errs1145);
    setErrors1450(errs1450);
    
    if (Object.keys(errs1145).length > 0 || Object.keys(errs1450).length > 0) {
      toast.error("Por favor preencha corretamente os campos destacados.");
      return;
    }

    setIsGenerating(true);
    try {
      // Save data first
      await processService.updateStepData(proc.id, { finalForms: data });
      // Generate PDFs
      await finalFormsService.generateAndUploadFinalForms(user.id, proc.id, data);
      
      setHasGenerated(true);
      toast.success("Formulários gerados e anexados com sucesso!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      toast.error("Erro ao gerar PDFs: " + msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Intro */}
      <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
        <div className="max-w-xl">
           <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-2">
              <RiInformationLine className="text-primary" /> USCIS Final Forms
           </h2>
           <p className="text-sm font-medium text-slate-500">
             Fill in the information below and we will automatically generate Forms G-1145 and G-1450 securely.
           </p>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-6">
        
        {/* Form G-1145 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
             <div className="w-12 h-12 rounded-full border border-blue-100 bg-blue-50 text-blue-500 flex items-center justify-center">
               <RiNotification4Line className="text-xl" />
             </div>
             <div>
                <h3 className="font-black text-slate-800 text-lg">Form G-1145</h3>
                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mt-0.5">E-Notification of Application Acceptance</p>
             </div>
           </div>

           <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm font-medium text-blue-800 mb-8">
             <RiInformationLine className="text-blue-500 text-xl shrink-0" />
             This form requests USCIS to send e-mail or text notifications when your application is officially accepted by the agency.
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input 
                 label="LAST NAME / SOBRENOME *" 
                 value={data.g1145.lastName} onChange={updateG1145("lastName")} 
                 onBlur={handleBlur1145}
                 error={errors1145.lastName}
              />
              <Input 
                 label="FIRST NAME / NOME *" 
                 value={data.g1145.firstName} onChange={updateG1145("firstName")} 
                 onBlur={handleBlur1145}
                 error={errors1145.firstName}
              />
              <Input 
                 label="MIDDLE NAME (OPCIONAL)" 
                 value={data.g1145.middleName} onChange={updateG1145("middleName")} 
                 onBlur={handleBlur1145}
                 error={errors1145.middleName}
              />
              <Input 
                 label="EMAIL ADDRESS *" 
                 value={data.g1145.email} onChange={updateG1145("email")} 
                 onBlur={handleBlur1145}
                 error={errors1145.email}
              />
              <Input 
                 label="MOBILE PHONE *" 
                 value={data.g1145.mobile} onChange={updateG1145("mobile")} 
                 onBlur={handleBlur1145}
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
                <h3 className="font-black text-slate-800 text-lg">Form G-1450</h3>
                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mt-0.5">Authorization for Credit Card Transactions</p>
             </div>
           </div>

           <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex gap-3 text-sm font-medium text-amber-800 mb-8">
             <RiInformationLine className="text-amber-500 text-xl shrink-0" />
             This form authorizes USCIS to charge the official filing fee directly to the credit card information provided below.
           </div>

           <SectionTitle title="APPLICANT INFORMATION" />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Input 
                 label="LAST NAME / SOBRENOME *" 
                 value={data.g1450.applicantLastName} onChange={updateG1450("applicantLastName")} 
                 onBlur={handleBlur1450}
                 error={errors1450.applicantLastName}
              />
              <Input 
                 label="FIRST NAME / NOME *" 
                 value={data.g1450.applicantFirstName} onChange={updateG1450("applicantFirstName")} 
                 onBlur={handleBlur1450}
                 error={errors1450.applicantFirstName}
              />
              <Input 
                 label="MIDDLE NAME (OPCIONAL)" 
                 value={data.g1450.applicantMiddleName} onChange={updateG1450("applicantMiddleName")} 
                 onBlur={handleBlur1450}
                 error={errors1450.applicantMiddleName}
              />
              <Input 
                 label="DATE OF BIRTH *" 
                 type="date"
                 value={data.g1450.dateOfBirth} onChange={updateG1450("dateOfBirth")} 
                 onBlur={handleBlur1450}
                 error={errors1450.dateOfBirth}
              />
              <Input 
                 label="A-NUMBER (SE HOUVER)" 
                 value={data.g1450.aNumber} onChange={updateG1450("aNumber")} 
                 onBlur={handleBlur1450}
                 error={errors1450.aNumber}
              />
           </div>

           <SectionTitle title="CREDIT CARD INFORMATION" />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Select 
                 label="CARD TYPE / BANDEIRA *" 
                 value={data.g1450.cardType} onChange={updateG1450("cardType")} 
                 onBlur={handleBlur1450}
                 options={["Visa", "MasterCard", "Discover", "American Express"]}
                 error={errors1450.cardType}
              />
              <div className="md:col-span-2">
                <Input 
                   label="CARDHOLDER NAME (COMO NO CARTÃO) *" 
                   value={data.g1450.cardholderName} onChange={updateG1450("cardholderName")} 
                   onBlur={handleBlur1450}
                   error={errors1450.cardholderName}
                />
              </div>
              <Input 
                 label="CARD NUMBER *" 
                 value={data.g1450.cardNumber} onChange={updateG1450("cardNumber")} 
                 onBlur={handleBlur1450}
                 error={errors1450.cardNumber}
              />
              <Input 
                 label="EXPIRATION DATE (MM/YYYY) *" 
                 value={data.g1450.expirationDate} onChange={updateG1450("expirationDate")} 
                 onBlur={handleBlur1450}
                 placeholder="MM/YYYY"
                 error={errors1450.expirationDate}
              />
              <Input 
                 label="CVV *" 
                 value={data.g1450.cvv} onChange={updateG1450("cvv")} 
                 onBlur={handleBlur1450}
                 error={errors1450.cvv}
              />
           </div>

           <SectionTitle title="BILLING ADDRESS" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input 
                   label="STREET ADDRESS *" 
                   value={data.g1450.streetAddress} onChange={updateG1450("streetAddress")} 
                   onBlur={handleBlur1450}
                   error={errors1450.streetAddress}
                />
              </div>
              <Input 
                 label="CITY *" 
                 value={data.g1450.city} onChange={updateG1450("city")} 
                 onBlur={handleBlur1450}
                 error={errors1450.city}
              />
              <Input 
                 label="STATE *" 
                 value={data.g1450.state} onChange={updateG1450("state")} 
                 onBlur={handleBlur1450}
                 error={errors1450.state}
              />
              <Input 
                 label="ZIP CODE *" 
                 value={data.g1450.zipCode} onChange={updateG1450("zipCode")} 
                 onBlur={handleBlur1450}
                 error={errors1450.zipCode}
              />
              <Input 
                 label="COUNTRY *" 
                 value={data.g1450.country} onChange={updateG1450("country")} 
                 onBlur={handleBlur1450}
                 error={errors1450.country}
              />
           </div>
        </div>

      </div>

      {/* Automatic Generation Block */}
      <div className="mt-8 bg-gradient-to-r from-blue-50/80 to-white border border-blue-100 rounded-3xl p-8 flex items-center justify-between shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <RiMagicLine className="text-9xl text-blue-500" />
         </div>
         <div className="relative z-10 max-w-md">
            <div className="flex items-center gap-3 mb-2">
               <RiMagicLine className="text-2xl text-blue-600" />
               <h3 className="font-black text-blue-900 text-lg">Automatic Generation</h3>
            </div>
            <p className="text-sm text-blue-800/80 font-medium leading-relaxed mb-4">
              Our system will use its intelligence to fill both official USCIS forms automatically for you.
            </p>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5">
               <RiInformationLine className="text-sm" /> REVIEW ALL DATA BEFORE STARTING
            </p>
         </div>
         <div className="relative z-10">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg text-white ${
                hasGenerated ? "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600" : "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700"
              } disabled:opacity-50`}
            >
              {isGenerating ? <RiLoader4Line className="text-xl animate-spin" /> : <RiMagicLine className="text-xl" />}
              {hasGenerated ? "RE-GERAR FORMS" : "INICIAR GERAÇÃO"}
            </button>
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
          onClick={onComplete}
          disabled={!hasGenerated}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white text-sm font-black hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {<RiCheckDoubleLine className="text-lg" />}
          Next Step
        </button>
      </div>

    </div>
  );
}

// Subcomponents
function Input({ label, value, onChange, onBlur, placeholder, type = "text", error }: { label: string; value: string; onChange: (v: string) => void; onBlur?: () => void; placeholder?: string; type?: string; error?: string; }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
        {error && <span className="text-[9px] font-bold text-red-500 animate-in fade-in slide-in-from-right-1">{error}</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full bg-slate-50/50 border ${error ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 ${error ? 'focus:ring-red-500/10 focus:border-red-500' : 'focus:ring-primary/10 focus:border-primary'} transition-all focus:bg-white`}
      />
    </div>
  );
}

function Select({ label, value, onChange, onBlur, options, error }: { label: string; value: string; onChange: (v: string) => void; onBlur?: () => void; options: string[]; error?: string; }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
        {error && <span className="text-[9px] font-bold text-red-500 animate-in fade-in slide-in-from-right-1">{error}</span>}
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        className={`w-full bg-slate-50/50 border ${error ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 ${error ? 'focus:ring-red-500/10 focus:border-red-500' : 'focus:ring-primary/10 focus:border-primary'} transition-all focus:bg-white appearance-none`}
      >
        <option value="">Selecione...</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-800">{title}</h4>
    </div>
  );
}
