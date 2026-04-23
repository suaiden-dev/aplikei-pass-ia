import { useState, useEffect } from "react";
import { 
  RiFileUploadLine, 
  RiFileTextLine, 
  RiCheckLine,
  RiLoader4Line,
  RiInformationLine
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

export default function I20UploadStep({ proc, user, onComplete }: Props) {
  const t = useT("onboarding");
  const [i20Path, setI20Path] = useState<string>("");

  if (!t || !t.cos) return null;
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const docs = (proc.step_data?.docs as Record<string, string>) || {};
    if (docs.i20_document) {
      setI20Path(docs.i20_document);
    }
  }, [proc]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/cos/i20_${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;
      
      setI20Path(filePath);
      
      // Update step data
      const currentDocs = (proc.step_data?.docs as Record<string, string>) || {};
      await processService.updateStepData(proc.id, {
        docs: { ...currentDocs, i20_document: filePath }
      });

      // Notify Admin
      await cosNotificationService.notifyAdmin({
        event: "i20_uploaded",
        processId: proc.id,
        userId: user.id,
        clientName: user.full_name,
        clientEmail: user.email,
      });
      
      toast.success(t.cos.i20Upload.toasts.success);
    } catch (error: any) {
      toast.error(t.cos.i20Upload.toasts.error + ": " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = async () => {
    if (!i20Path) {
      toast.error(t.cos.i20Upload.toasts.required);
      return;
    }
    setIsSubmitting(true);
    try {
      await onComplete();
    } catch (error) {
      toast.error(t.cos.i20Upload.toasts.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-500 flex items-center justify-center shrink-0">
          <RiFileTextLine className="text-2xl" />
        </div>
        <div>
          <h3 className="font-black text-violet-900 text-[13px] uppercase tracking-widest mb-1 mt-0.5">
            {t.cos.i20Upload.title}
          </h3>
          <p className="text-sm text-violet-700/80 font-medium leading-relaxed">
            {t.cos.i20Upload.desc}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
        <div className="max-w-md mx-auto">
          {i20Path ? (
            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-6 text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <RiCheckLine className="text-3xl text-emerald-500" />
              </div>
              <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-1">{t.cos.i20Upload.statusCard.received}</h4>
              <p className="text-xs text-emerald-600 font-medium mb-6">{t.cos.i20Upload.statusCard.inSystem}</p>
              
              <div className="flex gap-3">
                <a 
                  href={supabase.storage.from("profiles").getPublicUrl(i20Path).data.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 px-4 py-3 bg-white border border-emerald-200 rounded-xl text-[10px] font-black text-emerald-700 uppercase tracking-widest hover:bg-emerald-100 transition-all"
                >
                  {t.cos.i20Upload.statusCard.view}
                </a>
                <label className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all cursor-pointer shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">
                  <RiFileUploadLine className="text-sm" />
                  {t.cos.i20Upload.statusCard.replace}
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
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:border-violet-300 hover:bg-violet-50/10 transition-all group">
              <RiFileUploadLine className="text-5xl text-slate-200 mx-auto mb-4 group-hover:text-violet-300 transition-colors" />
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">{t.cos.i20Upload.uploadBox.select}</h4>
              <p className="text-xs text-slate-400 font-medium mb-8">{t.cos.i20Upload.uploadBox.formats}</p>
              
              <label className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all cursor-pointer shadow-xl shadow-slate-200">
                {isUploading ? <RiLoader4Line className="animate-spin text-lg" /> : <RiFileUploadLine className="text-lg" />}
                {isUploading ? t.cos.i20Upload.uploadBox.uploading : t.cos.i20Upload.uploadBox.btn}
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

      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
          <RiInformationLine className="text-sm" />
          {t.cos.i20Upload.footer}
        </p>
        
        <button
          onClick={handleNext}
          disabled={!i20Path || isSubmitting}
          className="flex items-center gap-2 px-10 py-3.5 rounded-xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
        >
          {isSubmitting ? <RiLoader4Line className="animate-spin text-lg" /> : <RiCheckLine className="text-lg" />}
          {t.cos.i20Upload.nextBtn}
        </button>
      </div>
    </div>
  );
}
