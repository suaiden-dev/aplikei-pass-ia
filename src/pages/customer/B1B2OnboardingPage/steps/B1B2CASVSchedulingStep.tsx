import { useState } from "react";
import { motion } from "framer-motion";
import {
  RiMapPin2Line,
  RiCalendarLine,
  RiExternalLinkLine,
  RiInformationLine,
  RiArrowRightLine,
  RiLoader4Line,
  RiCheckLine,
  RiAlertLine,
} from "react-icons/ri";
import { processService } from "../../../../services/process.service";
import { toast } from "sonner";
import { useT, useLocale } from "../../../../i18n/LanguageContext";

interface B1B2CASVSchedulingStepProps {
  procId: string;
  stepData: Record<string, unknown>;
  onComplete: () => void;
  onBack: () => void;
}

export function B1B2CASVSchedulingStep({ procId, stepData, onComplete, onBack }: B1B2CASVSchedulingStepProps) {
  const t = useT("visas");
  const { lang } = useLocale();
  const consulado = (stepData.interviewLocation as string) || "";
  const info = t.onboardingPage.scheduling.consulates?.[consulado as keyof typeof t.onboardingPage.scheduling.consulates];

  // Prefer a date already saved, else empty
  const savedDate = (stepData.casv_preferred_date as string) || "";
  const [selectedDate, setSelectedDate] = useState(savedDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map of icons for consulates (UI logic only)
  const flagMap: Record<string, string> = {
    Brasilia: "🏛️",
    "Rio de Janeiro": "🌆",
    "São Paulo": "🏙️",
    Recife: "🌴",
    "Porto Alegre": "🌉",
  };
  const flag = flagMap[consulado] || "🏛️";

  // Minimum date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const handleConfirm = async () => {
    if (!selectedDate) {
      toast.error(t.onboardingPage.scheduling.errorSelectDate);
      return;
    }
    setIsSubmitting(true);
    try {
      await processService.updateStepData(procId, {
        casv_preferred_date: selectedDate,
      });
      // Avança para a Etapa 7 (Criação de Conta)
      await processService.approveStep(procId, 6, false);
      // Notifica admin
      await processService.updateProcessStatus(procId, "awaiting_review");
      toast.success(t.onboardingPage.scheduling.successDate);
      onComplete();
    } catch (err: unknown) {
      toast.error((err as Error).message || t.onboardingPage.scheduling.errorConfirm);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 shadow-inner">
          <RiCalendarLine className="text-3xl" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.onboardingPage.scheduling.title}</h2>
        <p className="text-sm font-medium text-slate-400 mt-2 max-w-xl mx-auto">
          {t.onboardingPage.scheduling.subtitle}
        </p>
      </div>

      {/* ── Consulado Info Card ── */}
      <div className="bg-white rounded-[28px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <RiMapPin2Line className="text-primary text-lg" />
          </div>
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{t.onboardingPage.scheduling.yourConsulate}</h3>
        </div>

        <div className="p-8">
          {info ? (
            <div className="flex items-start gap-6">
              <div className="text-5xl shrink-0">{flag}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl font-black text-slate-800">
                    {info.city}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-black text-primary uppercase tracking-widest">
                    {info.state}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500">{info.address}</p>
                <p className="text-xs text-slate-400 font-bold mt-1">{info.phone}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-amber-600">
              <RiAlertLine className="text-xl shrink-0" />
              <p className="text-sm font-bold">
                {t.onboardingPage.scheduling.consulateNotFound}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-4"
      >
        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
          <RiInformationLine className="text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[11px] font-black text-amber-900 uppercase tracking-widest mb-1">
            {t.onboardingPage.scheduling.disclaimerTitle}
          </h3>
          <p className="text-sm text-amber-800 font-medium leading-relaxed">
            {t.onboardingPage.scheduling.disclaimerText}
          </p>
          <a
            href="https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/global-visa-wait-times.html"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-black text-amber-900 underline underline-offset-2 hover:text-amber-700 transition-colors"
          >
            <RiExternalLinkLine />
            {t.onboardingPage.scheduling.checkAvailability}
          </a>
        </div>
      </motion.div>

      {/* ── Date Picker ── */}
      <div className="bg-white rounded-[28px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
            <RiCalendarLine className="text-sky-500 text-lg" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{t.onboardingPage.scheduling.preferredDate}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{t.onboardingPage.scheduling.preferredDateNote}</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="max-w-xs">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              {t.onboardingPage.scheduling.interviewDateLabel} <span className="text-primary">*</span>
            </label>
            <input
              type="date"
              min={minDate}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all"
            />
          </div>

          {/* Summary */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <RiCheckLine className="text-base" />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-0.5">{t.onboardingPage.scheduling.selectedDateLabel}</p>
                <p className="text-sm font-black text-emerald-900">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString(lang, {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                {info && (
                  <p className="text-[11px] text-emerald-700 font-bold mt-1">
                    📍 {info.city} — {info.state}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Footer Actions ── */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
        >
          {t.onboardingPage.common.back}
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting || !selectedDate}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSubmitting ? (
            <RiLoader4Line className="animate-spin text-lg" />
          ) : (
            <>
              {t.onboardingPage.scheduling.confirmDate}
              <RiArrowRightLine className="text-lg" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
