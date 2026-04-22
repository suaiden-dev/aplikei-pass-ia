import { useState } from "react";
import {
  RiArrowRightLine,
  RiCheckDoubleLine,
  RiErrorWarningLine,
  RiMessage3Line,
} from "react-icons/ri";
import { toast } from "sonner";
import { useT } from "../../../i18n";
import { processService, type UserService } from "../../../services/process.service";

interface Props {
  proc: UserService;
  onComplete?: () => void;
}

export function MotionAcquisitionStep({ proc, onComplete }: Props) {
  const t = useT("onboarding");
  const [loading, setLoading] = useState(false);

  const acquisitionCopy = t?.workflows?.motion?.acquisition ?? t?.workflows?.motion?.explanation;
  const features = acquisitionCopy?.features ?? [];

  const handleAcquire = async () => {
    setLoading(true);
    try {
      await processService.updateStepData(proc.id, {
        workflow_status: "awaiting_user_input",
        motion_started_at: new Date().toISOString(),
      });

      onComplete?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[40px] border border-slate-100 p-12 shadow-sm text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-8 shadow-inner">
          <RiErrorWarningLine className="text-4xl" />
        </div>

        <h2 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-tight">
          {acquisitionCopy?.title || "Motion — Adquirir"}
        </h2>

        <p className="text-slate-500 leading-relaxed max-w-md mx-auto mb-10">
          {acquisitionCopy?.desc || acquisitionCopy?.description || "Contrate o serviço de Motion para reverter a negativa."}
        </p>

        <div className="bg-slate-50 rounded-3xl p-8 mb-10 text-left border border-slate-100">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
            {acquisitionCopy?.howItWorks || "Como funciona"}
          </h4>
          <div className="space-y-4">
            {features.map((feature: string, i: number) => (
              <div key={i} className="flex gap-3">
                <RiCheckDoubleLine className="text-primary text-lg shrink-0 mt-1" />
                <p className="text-sm text-slate-600">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleAcquire}
            disabled={loading}
            className="w-full bg-primary hover:bg-[#1649c0] text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando...
              </>
            ) : (
              <>
                {acquisitionCopy?.btn || acquisitionCopy?.cta || "Contratar Motion"}
                <RiArrowRightLine className="text-xl" />
              </>
            )}
          </button>

          <button
            onClick={() => {
              window.location.href = "https://wa.me/message/APLIKEISUPPORT";
            }}
            className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3"
          >
            {acquisitionCopy?.secondaryBtn || "Falar com Especialista"}
            <RiMessage3Line className="text-xl" />
          </button>
        </div>

        <p className="mt-8 text-[10px] text-slate-400 font-medium italic">
          ID do Processo: {proc.id.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  );
}
