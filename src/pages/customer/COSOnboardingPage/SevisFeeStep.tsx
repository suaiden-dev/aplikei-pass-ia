import { useState, useEffect } from "react";
import { 
  RiFileUploadLine, 
  RiCheckLine,
  RiLoader4Line,
  RiInformationLine,
  RiExternalLinkLine,
  RiMoneyDollarCircleLine,
  RiShieldCheckLine
} from "react-icons/ri";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";
import { processService, type UserService } from "../../../services/process.service";
import { cosNotificationService } from "../../../services/cos-notification.service";
import { useT } from "../../../i18n";

interface Props {
  proc: UserService;
  user: any;
  onComplete: () => void | Promise<void>;
}

export default function SevisFeeStep({ proc, user, onComplete }: Props) {
  const t = useT("onboarding");
  const [alreadyPaid, setAlreadyPaid] = useState<boolean | null>(null);

  if (!t || !t.cos) return null;
  const [receiptPath, setReceiptPath] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const data = proc.step_data || {};
    const docs = (data.docs as Record<string, string>) || {};
    if (docs.sevis_receipt) {
      setReceiptPath(docs.sevis_receipt);
      setAlreadyPaid(true);
    }
    if (data.sevis_already_paid !== undefined) {
      setAlreadyPaid(data.sevis_already_paid as boolean);
    }
  }, [proc]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/cos/sevis_receipt_${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;
      
      setReceiptPath(filePath);
      
      // Update step data
      const currentDocs = (proc.step_data?.docs as Record<string, string>) || {};
      await processService.updateStepData(proc.id, {
        docs: { ...currentDocs, sevis_receipt: filePath },
        sevis_already_paid: true
      });

      // Notify Admin
      await cosNotificationService.notifyAdmin({
        event: "sevis_receipt_uploaded",
        processId: proc.id,
        userId: user.id,
        clientName: user.full_name,
        clientEmail: user.email,
      });
      
      toast.success(t.cos.sevisFee.toasts.success);
    } catch (error: any) {
      toast.error(t.cos.sevisFee.toasts.error + ": " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = async () => {
    if (!receiptPath) {
      toast.error(t.cos.sevisFee.toasts.required);
      return;
    }
    setIsSubmitting(true);
    try {
      await onComplete();
    } catch (error) {
      toast.error(t.cos.sevisFee.toasts.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-500 flex items-center justify-center shrink-0">
          <RiMoneyDollarCircleLine className="text-2xl" />
        </div>
        <div>
          <h3 className="font-black text-emerald-900 text-[13px] uppercase tracking-widest mb-1 mt-0.5">
            {t.cos.sevisFee.title}
          </h3>
          <p className="text-sm text-emerald-700/80 font-medium leading-relaxed">
            {t.cos.sevisFee.desc}
          </p>
        </div>
      </div>

      {/* Payment Status Question */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
           <RiShieldCheckLine className="text-lg text-primary" />
           {t.cos.sevisFee.statusCard.title}
        </h4>
        <p className="text-sm font-bold text-slate-600 mb-6">{t.cos.sevisFee.statusCard.question}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setAlreadyPaid(true)}
            className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
              alreadyPaid === true 
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
            }`}
          >
            {t.cos.sevisFee.statusCard.yes}
          </button>
          <button
            onClick={() => setAlreadyPaid(false)}
            className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
              alreadyPaid === false 
                ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200" 
                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
            }`}
          >
            {t.cos.sevisFee.statusCard.no}
          </button>
        </div>
      </div>

      {/* Instructions if NOT paid */}
      {alreadyPaid === false && (
        <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <RiInformationLine className="text-xl" />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest">{t.cos.sevisFee.instructions.title}</h3>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              {t.cos.sevisFee.instructions.desc}
            </p>
            
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-primary text-[10px] font-black flex items-center justify-center shrink-0">1</div>
                <div className="text-xs font-medium text-slate-200">
                  {t.cos.sevisFee.instructions.step1.prefix}
                  <span className="text-primary font-bold">{t.cos.sevisFee.instructions.step1.bold}</span>
                  {t.cos.sevisFee.instructions.step1.suffix}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-primary text-[10px] font-black flex items-center justify-center shrink-0">2</div>
                <div className="text-xs font-medium text-slate-200">
                  {t.cos.sevisFee.instructions.step2.prefix}
                  <a href="https://www.fmjfee.com/i901fee/index.html#" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center gap-1">
                    {t.cos.sevisFee.instructions.step2.linkText} <RiExternalLinkLine />
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-primary text-[10px] font-black flex items-center justify-center shrink-0">3</div>
                <div className="text-xs font-medium text-slate-200">
                  {t.cos.sevisFee.instructions.step3.prefix}
                  <span className="text-white font-bold">{t.cos.sevisFee.instructions.step3.bold}</span>
                  {t.cos.sevisFee.instructions.step3.suffix}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-primary text-[10px] font-black flex items-center justify-center shrink-0">4</div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{t.cos.sevisFee.instructions.step4.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="text-white font-bold">{t.cos.sevisFee.instructions.step4.sevisId}</span><br/>
                    <span className="text-white font-bold">{t.cos.sevisFee.instructions.step4.form}</span><br/>
                    <span className="text-white font-bold">{t.cos.sevisFee.instructions.step4.schoolCode}</span><br/>
                    <span className="text-slate-500 italic">{t.cos.sevisFee.instructions.step4.example}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Receipt */}
      {(alreadyPaid === true || receiptPath) && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
             <RiFileUploadLine className="text-lg text-primary" />
             {t.cos.sevisFee.upload.title}
          </h4>
          
          <div className="max-w-md mx-auto">
            {receiptPath ? (
              <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-6 text-center animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <RiCheckLine className="text-3xl text-emerald-500" />
                </div>
                <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-1">{t.cos.sevisFee.upload.receiptSent}</h4>
                
                <div className="flex gap-3 mt-6">
                  <a 
                    href={supabase.storage.from("profiles").getPublicUrl(receiptPath).data.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-4 py-3 bg-white border border-emerald-200 rounded-xl text-[10px] font-black text-emerald-700 uppercase tracking-widest hover:bg-emerald-100 transition-all"
                  >
                    {t.cos.sevisFee.upload.view}
                  </a>
                  <label className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all cursor-pointer shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">
                    <RiFileUploadLine className="text-sm" />
                    {t.cos.sevisFee.upload.replace}
                    <input 
                      type="file" 
                      accept=".pdf,image/*" 
                      className="hidden" 
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:border-emerald-300 hover:bg-emerald-50/10 transition-all group">
                <RiFileUploadLine className="text-5xl text-slate-200 mx-auto mb-4 group-hover:text-emerald-300 transition-colors" />
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">{t.cos.sevisFee.upload.boxTitle}</h4>
                <p className="text-xs text-slate-400 font-medium mb-8">{t.cos.sevisFee.upload.boxDesc}</p>
                
                <label className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all cursor-pointer shadow-xl shadow-slate-200">
                  {isUploading ? <RiLoader4Line className="animate-spin text-lg" /> : <RiFileUploadLine className="text-lg" />}
                  {isUploading ? t.cos.sevisFee.upload.uploading : t.cos.sevisFee.upload.btn}
                  <input 
                    type="file" 
                    accept=".pdf,image/*" 
                    className="hidden" 
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    disabled={isUploading}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-72 right-0 bg-white border-t border-slate-200 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 flex items-center justify-end">
        <button
          onClick={handleNext}
          disabled={!receiptPath || isSubmitting}
          className="flex items-center gap-2 px-12 py-4 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
        >
          {isSubmitting ? <RiLoader4Line className="animate-spin text-lg" /> : <RiCheckLine className="text-lg" />}
          {t.cos.sevisFee.nextBtn}
        </button>
      </div>
    </div>
  );
}
