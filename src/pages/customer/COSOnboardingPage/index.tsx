import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiArrowLeftSLine,
  RiAddLine,
  RiDeleteBinLine,
  RiInformationLine,
  RiCheckDoubleLine,
  RiLoader4Line,
  RiErrorWarningLine
} from "react-icons/ri";
import { MdPerson, MdAccountBalance } from "react-icons/md";
import { useAuth } from "../../../hooks/useAuth";
import { processService, type UserService } from "../../../services/process.service";
import { getServiceBySlug } from "../../../data/services";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";
import I539FormStep from "./I539FormStep";
import CoverLetterStep from "./CoverLetterStep";
import FinalFormsStep from "./FinalFormsStep";
import FinalPackageStep from "./FinalPackageStep";
import { 
  MotionExplanationStep, 
  MotionInstructionStep, 
  MotionAcceptProposalStep,
  MotionEndStep 
} from "./MotionWorkflow";
import {
  RFEExplanationStep,
  RFEInstructionStep,
  RFEAcceptProposalStep,
  RFEEndStep
} from "./RFEWorkflow";
import { DocUploadCard, type DocFile } from "../../../components/DocUploadCard";

// ─── Types ────────────────────────────────────────────────────────────────────

type VisaType = "B1/B2" | "F1/F2" | "J1/J2" | "L1/L2" | "R1/R2" | "Other";

interface Dependent {
  id: string;
  name: string;
  relation: "spouse" | "child" | "other" | "";
  birthDate: string;
  marriageDate: string;
  i94Date: string;
}


const VISA_OPTIONS: { label: VisaType; icon: string; color: string }[] = [
  { label: "B1/B2",  icon: "🌐", color: "text-sky-500" },
  { label: "F1/F2",  icon: "🎓", color: "text-green-500" },
  { label: "J1/J2",  icon: "🔄", color: "text-violet-500" },
  { label: "L1/L2",  icon: "📋", color: "text-orange-500" },
  { label: "R1/R2",  icon: "🏛️",  color: "text-red-500" },
  { label: "Other",  icon: "···", color: "text-slate-400" },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function COSOnboardingPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const stepIdx = Number(searchParams.get("step") ?? "0");

  // Safety guard: this component is only for COS products.
  // If somehow the generic :slug route catches a B1/B2 request, redirect immediately.
  useEffect(() => {
    if (slug === "visto-b1-b2") {
      navigate(`/dashboard/processes/visto-b1-b2/onboarding${searchParams.toString() ? `?${searchParams.toString()}` : ""}`, { replace: true });
    }
  }, [slug, navigate, searchParams]);

  const { user } = useAuth();
  const [proc, setProc] = useState<UserService | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Step 0 — COS Application Form ──
  const [currentVisa, setCurrentVisa] = useState<VisaType | null>(null);
  const [targetVisa, setTargetVisa] = useState<VisaType | null>(null);
  const [i94Date, setI94Date] = useState("");
  const [dependents, setDependents] = useState<Dependent[]>([]);

  // ── Step 1 — Documents ──
  const [docs, setDocs] = useState<Record<string, DocFile>>({
    i94:          { file: null, label: "COS I94" },
    passportVisa: { file: null, label: "COS PASSPORT VISA PRINCIPAL" },
    proofBrazil:  { file: null, label: "COS PROOF OF RESIDENCE BRAZIL" },
    bankStatement:{ file: null, label: "COS BANK STATEMENT" },
  });

  const hasFeedback = !!proc?.step_data?.admin_feedback;
  const rejectedItems = (proc?.step_data?.rejected_items as string[]) || [];
  const isFieldRejected = (key: string) => hasFeedback && rejectedItems.includes(key);

  const isReadOnly = proc ? (stepIdx < (proc.current_step ?? 0) && !hasFeedback) : false;

  const canSubmitStep0 = !!currentVisa && !!targetVisa && !!i94Date;
  const canSubmitStep1 = Object.values(docs).every(d => d.file !== null || d.path);
  const canSubmit = (stepIdx === 0 ? canSubmitStep0 : stepIdx === 1 ? canSubmitStep1 : true);

  // Load process data
  useEffect(() => {
    if (user && slug) {
      processService.getUserServiceBySlug(user.id, slug)
        .then(data => {
          if (!data) return;
          console.log("Hydrating process data:", data);
          setProc(data);
          
          if (data.step_data) {
            if (data.step_data.targetVisa) setTargetVisa(data.step_data.targetVisa as VisaType);
            if (data.step_data.currentVisa) setCurrentVisa(data.step_data.currentVisa as VisaType);
            if (data.step_data.i94Date) setI94Date(data.step_data.i94Date as string);
            if (data.step_data.dependents) setDependents(data.step_data.dependents as Dependent[]);
            
            // Hydrate docs
            if (data.step_data.docs) {
              const savedDocs = data.step_data.docs as Record<string, string>;
              console.log("Hydrating docs:", savedDocs);
              setDocs(prev => {
                const next = { ...prev };
                // Add keys for dependents if they exist in saved data
                Object.keys(savedDocs).forEach(key => {
                  next[key] = { 
                    file: null, 
                    label: key.toUpperCase().replace(/_/g, ' '), 
                    path: savedDocs[key] 
                  };
                });
                return next;
              });
            }
          }
        });
    }
  }, [user, stepIdx, slug]);

  // Handle doc slot generation
  const getDocSlots = () => {
    const slots = [
      { key: "i94", title: "Form I-94 (Principal)", subtitle: "U.S. Entry Record", category: "Personal Documents" },
      { key: "passportVisa", title: "Passport and Visa (Principal)", subtitle: "Bio page + Visa stamp", category: "Personal Documents" },
      { key: "proofBrazil", title: "Proof of Residence (Brazil)", subtitle: "Utility bill or bank doc", category: "Personal Documents" },
      { key: "bankStatement", title: "Bank Statement", subtitle: "Financial support proof", category: "Financial Documents" },
    ];

    dependents.forEach(dep => {
      slots.push({ key: `i94_dep_${dep.id}`, title: `I-94 (${dep.name || 'Dependent'})`, subtitle: "U.S. Entry Record", category: `Docs: ${dep.name || 'Dependent'}` });
      slots.push({ key: `passportVisa_dep_${dep.id}`, title: `Passport/Visa (${dep.name || 'Dependent'})`, subtitle: "Bio page + Visa stamp", category: `Docs: ${dep.name || 'Dependent'}` });
      if (dep.relation === "child") {
        slots.push({ key: `birthCertificate_dep_${dep.id}`, title: `Birth Certificate (${dep.name || 'Dependent'})`, subtitle: "Birth proof", category: `Docs: ${dep.name || 'Dependent'}` });
      }
      if (dep.relation === "spouse") {
        slots.push({ key: `marriageCertificate`, title: `Marriage Certificate`, subtitle: "Marriage proof", category: `Docs: ${dep.name || 'Dependent'}` });
      }
    });

    return slots;
  };

  const addDependent = () =>
    setDependents(d => [
      ...d,
      {
        id: crypto.randomUUID(),
        name: "",
        relation: "",
        birthDate: "",
        marriageDate: "",
        i94Date: "",
      },
    ]);
  const updateDependent = (id: string, field: keyof Dependent, value: string) =>
    setDependents(d => d.map(dep => (dep.id === id ? { ...dep, [field]: value } : dep)));
  const removeDependent = (id: string) => setDependents(d => d.filter(dep => dep.id !== id));

  // ── Rule Helpers ──
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const getMarriageAge = (birthDate: string, marriageDate: string) => {
    if (!birthDate || !marriageDate) return 0;
    const birth = new Date(birthDate);
    const marriage = new Date(marriageDate);
    let age = marriage.getFullYear() - birth.getFullYear();
    const m = marriage.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && marriage.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleDocChange = (key: string, file: File) =>
    setDocs(prev => ({ ...prev, [key]: { ...prev[key], file } }));

  const handleConcluir = async () => {
    if (!proc) return;
    setIsSubmitting(true);
    try {
      const stepData: Record<string, unknown> = {};
      if (stepIdx === 0) {
        stepData.targetVisa = targetVisa;
        stepData.currentVisa = currentVisa;
        stepData.i94Date = i94Date;
        stepData.dependents = dependents;
      }
      
      if (stepIdx === 1) {
        const currentDocs = proc.step_data?.docs as Record<string, string> || {};
        const updatedDocs: Record<string, string> = { ...currentDocs };
        const slots = getDocSlots();
        
        for (const slot of slots) {
          const doc = docs[slot.key];
          if (doc?.file) {
            const fileExt = doc.file.name.split(".").pop();
            const filePath = `${user!.id}/cos/${slot.key}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from("profiles")
              .upload(filePath, doc.file, { upsert: true });
              
            if (uploadError) throw new Error(`Erro ao enviar ${slot.key}: ${uploadError.message}`);
            updatedDocs[slot.key] = filePath;
          } else if (doc?.path) {
            updatedDocs[slot.key] = doc.path;
          }
        }
        
        stepData.docs = updatedDocs;
      }

      await processService.updateStepData(proc.id, stepData);
      
      // FRESH FETCH: Get latest data after potential update
      const freshProc = await processService.getServiceById(proc.id);
      if (!freshProc) return;

      const service = getServiceBySlug(slug!);
      if (service) {
        let nextStepIdx = stepIdx + 1;
        
        const targetVisa = freshProc.step_data?.targetVisa as string;
        const uscisResult = freshProc.step_data?.uscis_official_result as string;
        const rfeResult = freshProc.step_data?.uscis_rfe_result as string;

        const showF1Steps = targetVisa === "F1/F2";
        if (!showF1Steps) {
          const stepsToSkipIds = ["cos_i20_upload", "cos_sevis_fee", "cos_analysis_i20_sevis"];
          while (nextStepIdx < service.steps.length && stepsToSkipIds.includes(service.steps[nextStepIdx].id)) {
            nextStepIdx++;
          }
        }

        // Jump logic for RFE/Motion
        const finalPackageIdx = service.steps.findIndex(s => s.id === "cos_final_package");
        const rfeEndIdx = service.steps.findIndex(s => s.id === "cos_rfe_end");
        let forceJump = false;

        if (stepIdx === finalPackageIdx) {
          if (uscisResult === "denied") {
            const motionStart = service.steps.findIndex(s => s.id === "cos_motion_explanation");
            if (motionStart !== -1) { nextStepIdx = motionStart; forceJump = true; }
          } else if (uscisResult === "rfe") {
            const rfeStart = service.steps.findIndex(s => s.id === "cos_rfe_explanation");
            if (rfeStart !== -1) { nextStepIdx = rfeStart; forceJump = true; }
          }
        } else if (stepIdx === rfeEndIdx) {
          if (rfeResult === "denied") {
            const motionStart = service.steps.findIndex(s => s.id === "cos_motion_explanation");
            if (motionStart !== -1) { nextStepIdx = motionStart; forceJump = true; }
          } else if (rfeResult === "rfe") {
            const rfeStart = service.steps.findIndex(s => s.id === "cos_rfe_explanation");
            if (rfeStart !== -1) { nextStepIdx = rfeStart; forceJump = true; }
          }
        }

        const isFinal = nextStepIdx >= service.steps.length;
        const nextStep = service.steps[nextStepIdx];
        
        const currentDBStep = freshProc.current_step ?? 0;
        const isCorrection = !!freshProc.step_data?.admin_feedback;

        // Allow update if advancing OR if it's an explicit jump (even backward)
        if (nextStepIdx > currentDBStep || forceJump) {
          await processService.approveStep(proc.id, nextStepIdx, isFinal);
        }
        
        const isMotionEnd = nextStep?.id === "cos_motion_end";
        if (!isMotionEnd && (isCorrection || (nextStep?.type === "admin_action") || isFinal)) {
          await processService.requestStepReview(proc.id);
        }
      }
      
      toast.success("Etapa enviada!");
      navigate(`/dashboard/processes/${slug}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro ao salvar: " + message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Onboarding</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Fill in the information to build your final package.{" "}
            <span className="text-primary font-black uppercase tracking-widest ml-1">
              CHANGE OF STATUS
            </span>
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-8 max-w-[860px] mx-auto w-full">
        <div>
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            {/* ── Step 0: COS Application Form ── */}
            {stepIdx === 0 && (
              <>
                <div className="px-8 py-6 border-b border-slate-100">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">COS Application Form</h2>
                  <p className="text-sm text-slate-400 font-medium mt-1">Fill in the information for your change of status.</p>
                </div>

                <div className="px-8 py-6 space-y-8">
                  {/* Current visa */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1">
                      What is your current visa? <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {VISA_OPTIONS.map(v => {
                        const isRejected = isFieldRejected("currentVisa");
                        return (
                          <button
                            key={v.label}
                            disabled={isReadOnly}
                            onClick={() => !isReadOnly && setCurrentVisa(v.label)}
                            className={`flex items-center gap-3 px-4 py-4 rounded-xl border-2 font-bold text-sm transition-all ${
                              currentVisa === v.label
                                ? (isRejected ? "border-red-500 bg-red-50 text-red-700" : "border-primary bg-primary/5 text-primary")
                                : (isRejected ? "border-red-100 bg-red-50/30 text-slate-400" : "border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50")
                            } ${isReadOnly ? "cursor-default opacity-80" : "cursor-pointer"}`}
                          >
                            <span className={`text-xl ${v.color}`}>{v.icon}</span>
                            {v.label}
                            {isRejected && <RiErrorWarningLine className="ml-auto text-red-500 animate-pulse" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target visa */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1">
                      Which visa do you want to switch to? <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {VISA_OPTIONS.map(v => {
                        const isRejected = isFieldRejected("targetVisa");
                        return (
                          <button
                            key={v.label}
                            disabled={isReadOnly}
                            onClick={() => !isReadOnly && setTargetVisa(v.label)}
                            className={`flex items-center gap-3 px-4 py-4 rounded-xl border-2 font-bold text-sm transition-all ${
                              targetVisa === v.label
                                ? (isRejected ? "border-red-500 bg-red-50 text-red-700" : "border-primary bg-primary/5 text-primary")
                                : (isRejected ? "border-red-100 bg-red-50/30 text-slate-400" : "border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50")
                            } ${isReadOnly ? "cursor-default opacity-80" : "cursor-pointer"}`}
                          >
                            <span className={`text-xl ${v.color}`}>{v.icon}</span>
                            {v.label}
                            {isRejected && <RiErrorWarningLine className="ml-auto text-red-500 animate-pulse" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* I-94 Date */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                      Authorized stay date from I-94 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={i94Date}
                      onChange={e => setI94Date(e.target.value)}
                      disabled={isReadOnly}
                      className={`border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 disabled:text-slate-500 ${
                        isFieldRejected("i94Date") 
                          ? "border-red-500 bg-red-50 text-red-700" 
                          : "border-slate-200 bg-white text-slate-700 disabled:bg-slate-50"
                      }`}
                    />
                    <div className="mt-2 text-primary font-bold text-xs uppercase tracking-widest pl-1">
                      Main Applicant I-94
                    </div>
                    <div className="mt-1">
                      <a
                        href="https://i94.cbp.dhs.gov/I94/#/recent-search"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                      >
                        Instructions to search for stay date ↗
                      </a>
                    </div>
                  </div>

                  {/* Dependents */}
                  <div className="pt-4">
                    {(() => {
                      const paidDependents = (proc?.step_data?.paid_dependents as number) ?? 0;
                      const hasPaidSlots = paidDependents > 0;
                      const reachedLimit = dependents.length >= paidDependents;

                      return (
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                              Dependents
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                hasPaidSlots ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}>
                                {dependents.length} / {paidDependents} slots
                              </span>
                            </h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                              {hasPaidSlots 
                                ? `You paid for ${paidDependents} dependent${paidDependents > 1 ? 's' : ''}`
                                : "No dependents purchased at checkout"}
                            </p>
                          </div>
                          {!isReadOnly && (
                            <button
                              onClick={addDependent}
                              disabled={reachedLimit}
                              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md ${
                                reachedLimit
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200"
                                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
                              }`}
                            >
                              <RiAddLine className="text-base" /> {reachedLimit ? "Limit Reached" : "Add Dependent"}
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {dependents.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                        <p className="text-xs text-slate-300 font-bold uppercase tracking-widest leading-loose">No family members added yet.</p>
                      </div>
                    )}

                    <div className="space-y-6">
                      {dependents.map(dep => {
                        const age = calculateAge(dep.birthDate);
                        const isNear21 = dep.relation === "child" && age >= 20;
                        const marriageAge = getMarriageAge(dep.birthDate, dep.marriageDate);
                        const marriageWarning = dep.relation === "spouse" && marriageAge >= 18;

                        return (
                          <div key={dep.id} className="relative p-7 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm">
                            {!isReadOnly && (
                              <button
                                onClick={() => removeDependent(dep.id)}
                                className="absolute top-4 right-4 p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                              >
                                <RiDeleteBinLine className="text-lg" />
                              </button>
                            )}

                            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                              <div className="col-span-2 sm:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                                <input
                                  value={dep.name}
                                  disabled={isReadOnly}
                                  onChange={e => updateDependent(dep.id, "name", e.target.value)}
                                  placeholder="As shown in passport"
                                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all disabled:bg-slate-50 disabled:text-slate-500"
                                />
                              </div>

                              <div className="col-span-2 sm:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Relationship</label>
                                <select
                                  value={dep.relation}
                                  disabled={isReadOnly}
                                  onChange={e => updateDependent(dep.id, "relation", e.target.value as "spouse" | "child" | "other")}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-default"
                                >
                                  <option value="">Select...</option>
                                  <option value="spouse">Spouse (Cônjuge)</option>
                                  <option value="child">Child (Filho/a)</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date of Birth</label>
                                <input
                                  type="date"
                                  value={dep.birthDate}
                                  disabled={isReadOnly}
                                  onChange={e => updateDependent(dep.id, "birthDate", e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all disabled:bg-slate-50 disabled:text-slate-500"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">I-94 Exp. Date</label>
                                <input
                                  type="date"
                                  value={dep.i94Date}
                                  disabled={isReadOnly}
                                  onChange={e => updateDependent(dep.id, "i94Date", e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all disabled:bg-slate-50 disabled:text-slate-500"
                                />
                              </div>

                              {dep.relation === "spouse" && (
                                <div className="col-span-2">
                                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-primary">Date of Marriage</label>
                                  <input
                                    type="date"
                                    value={dep.marriageDate}
                                    disabled={isReadOnly}
                                    onChange={e => updateDependent(dep.id, "marriageDate", e.target.value)}
                                    className="w-full bg-white border border-primary/20 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all disabled:bg-slate-50 disabled:text-slate-500"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="mt-5 space-y-3">
                              {marriageWarning && (
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 border border-orange-100">
                                  <RiInformationLine className="text-orange-500 text-lg shrink-0 mt-0.5" />
                                  <p className="text-[11px] font-bold text-orange-800 leading-normal">
                                    <span className="uppercase font-black block mb-0.5 tracking-wider">Aviso de Elegibilidade</span>
                                    Se o casamento aconteceu depois que o dependente fez 18 anos, ele pode não ser elegível, caso não seja filho do aplicante principal.
                                  </p>
                                </div>
                              )}

                              {isNear21 && (
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                                  <RiInformationLine className="text-red-500 text-lg shrink-0 mt-0.5" />
                                  <p className="text-[11px] font-bold text-red-800 leading-normal">
                                    <span className="uppercase font-black block mb-0.5 tracking-wider">Risco de Inelegibilidade</span>
                                    Se o filho estiver a menos de 01 ano de fazer 21 anos, o mais correto é o dependente fazer uma nova aplicação de visto individual.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Step 1: Document Uploads ── */}
            {stepIdx === 1 && (
              <>
                <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <MdPerson className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Document Uploads</h2>
                    <p className="text-sm text-slate-400 font-medium mt-0.5">Upload the required documents at the beginning of your process.</p>
                  </div>
                </div>

                <div className="px-8 py-6 space-y-8">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <RiInformationLine className="text-blue-500 text-xl shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-black text-slate-800">I-94 Instructions</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Get your most recent entry record from the official CBP website.</p>
                      <a
                        href="https://i94.cbp.dhs.gov/I94"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary font-bold mt-1 inline-flex items-center gap-1 hover:underline"
                      >
                        Acessar site do I-94 ↗
                      </a>
                    </div>
                  </div>

                  {/* Map Categories */}
                  {Array.from(new Set(getDocSlots().map(s => s.category))).map(cat => (
                    <div key={cat}>
                      <div className="flex items-center gap-2 mb-4">
                        {cat.includes("Financial") ? <MdAccountBalance className="text-slate-400 text-base" /> : <MdPerson className="text-slate-400 text-base" />}
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{cat}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {getDocSlots().filter(s => s.category === cat).map(slot => (
                          <DocUploadCard 
                            key={slot.key}
                            docKey={slot.key} 
                            title={slot.title} 
                            subtitle={slot.subtitle} 
                            doc={docs[slot.key] || { file: null, label: slot.title }} 
                            onChange={handleDocChange} 
                            isReadOnly={isReadOnly} 
                            isRejected={isFieldRejected(`docs.${slot.key}`)} 
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Step 3: I-539 Official Form ── */}
            {stepIdx === 3 && proc && user && (
              <div className="px-8 py-6">
                <div className="mb-6 border-b border-slate-100 pb-6">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">COS Official Forms</h2>
                  <p className="text-sm text-slate-400 font-medium mt-1">
                    Preencha todos os campos do formulário oficial I-539 do USCIS.
                  </p>
                </div>
                <I539FormStep
                  proc={proc}
                  user={user}
                  onComplete={handleConcluir}
                />
              </div>
            )}

            {/* ── Step 5: Cover Letter Questionnaire ── */}
            {stepIdx === 5 && proc && user && (
              <div className="px-8 py-6">
                <div className="mb-6 border-b border-slate-100 pb-6">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Cover Letter Questionnaire</h2>
                  <p className="text-sm text-slate-400 font-medium mt-1">
                    Please answer the questions below to help us generate your presentation letter for USCIS.
                  </p>
                </div>
                <CoverLetterStep
                  proc={proc}
                  onComplete={handleConcluir}
                />
              </div>
            )}

            {/* ── Step 10: Final Forms ── */}
            {stepIdx === 10 && proc && user && (
              <FinalFormsStep
                proc={proc}
                user={user}
                onComplete={handleConcluir}
              />
            )}

            {/* ── Step 12: Final Package ── */}
            {stepIdx === 12 && proc && (
              <FinalPackageStep
                proc={proc}
                onComplete={handleConcluir}
              />
            )}
            
            {/* ── RFE Steps (Conditional on RFE) ── */}
            {(() => {
              const uscisResult = (proc?.step_data?.uscis_official_result as string);
              const isRFE = uscisResult === 'rfe';
              if (!isRFE || stepIdx < 13 || stepIdx > 18) return null;

              return (
                <>
                  {stepIdx === 13 && proc && (
                    <RFEExplanationStep
                      proc={proc}
                    />
                  )}

                  {stepIdx === 14 && proc && (
                    <RFEInstructionStep
                      proc={proc}
                      onComplete={handleConcluir}
                    />
                  )}

                  {stepIdx === 16 && proc && (
                    <RFEAcceptProposalStep
                      proc={proc}
                    />
                  )}

                  {stepIdx === 18 && proc && (
                    <RFEEndStep
                      proc={proc}
                      onComplete={handleConcluir}
                      onJumpToMotion={() => handleConcluir()}
                      onJumpToNewRFE={() => handleConcluir()}
                    />
                  )}
                </>
              );
            })()}

            {/* ── Motion Steps (Conditional on Denied) ── */}
            {(() => {
              const uscisResult = (proc?.step_data?.uscis_official_result as string);
              const rfeResult = (proc?.step_data?.uscis_rfe_result as string);
              const isDenied = uscisResult === 'denied' || rfeResult === 'denied';

              if (!isDenied || stepIdx < 19 || stepIdx > 24) return null;

              return (
                <>
                  {stepIdx === 19 && proc && (
                    <MotionExplanationStep
                      proc={proc}
                      onComplete={handleConcluir}
                    />
                  )}

                  {stepIdx === 20 && proc && (
                    <MotionInstructionStep
                      proc={proc}
                      onComplete={handleConcluir}
                    />
                  )}

                  {stepIdx === 22 && proc && (
                    <MotionAcceptProposalStep
                      proc={proc}
                      onComplete={handleConcluir}
                    />
                  )}

                  {stepIdx === 24 && proc && (
                    <MotionEndStep
                      proc={proc}
                      onComplete={handleConcluir}
                    />
                  )}
                </>
              );
            })()}

            {/* ── Fallback ── */}
            {stepIdx !== 0 && stepIdx !== 1 && stepIdx !== 3 && stepIdx !== 5 && stepIdx !== 10 && stepIdx !== 12 && 
             stepIdx !== 13 && stepIdx !== 14 && stepIdx !== 16 && stepIdx !== 18 && 
             stepIdx !== 19 && stepIdx !== 20 && stepIdx !== 22 && stepIdx !== 24 && (
              <div className="p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                  <RiCheckDoubleLine className="text-3xl" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Em Construção</h2>
                <p className="text-sm text-slate-400 font-medium">Esta etapa será liberada em breve.</p>
              </div>
            )}
          </motion.div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => navigate(`/dashboard/processes/${slug}`)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-100 text-sm font-black text-slate-500 hover:bg-slate-50 hover:border-slate-200 transition-all"
            >
              <RiArrowLeftSLine className="text-lg" /> Voltar
            </button>

            {!isReadOnly && stepIdx !== 3 && stepIdx !== 5 && stepIdx !== 10 && stepIdx !== 12 && 
             stepIdx !== 13 && stepIdx !== 14 && stepIdx !== 16 && stepIdx !== 18 &&
             stepIdx !== 19 && stepIdx !== 20 && stepIdx !== 22 && stepIdx !== 24 && (
              <button
                onClick={handleConcluir}
                disabled={!canSubmit || isSubmitting}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${
                  !canSubmit || isSubmitting
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20"
                }`}
              >
                {isSubmitting ? (
                  <RiLoader4Line className="animate-spin text-lg" />
                ) : (
                  <>
                    <RiCheckDoubleLine className="text-lg" />
                    Concluir Etapa
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
