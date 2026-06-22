import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  RiCameraFill, 
  RiUploadCloud2Line, 
  RiCheckDoubleLine, 
  RiLoader4Line,
  RiCloseLine
} from "react-icons/ri";
import { toast } from "sonner";
import { useT } from "@app/app/i18n";

interface PhotoUploadOverlayProps {
  onUploadPhoto: (file: File) => Promise<string>;
  onUpdateAccount: (photoUrl: string) => Promise<unknown>;
  onSuccess: (photoUrl: string) => void;
  onClose: () => void;
}

export default function PhotoUploadOverlay({ onUploadPhoto, onUpdateAccount, onSuccess, onClose }: PhotoUploadOverlayProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dashboardT = useT("dashboard");
  const t = (dashboardT?.dashboard?.passportUploadModal ?? dashboardT?.passportUploadModal) || {
    title: "Identificação com Passaporte",
    description: "Segure o passaporte aberto ao lado do seu rosto",
    closeTitle: "Fechar e voltar",
    reqHoldingPassport: "Segurando Passaporte",
    reqLegibleData: "Dados Legíveis",
    reqWhiteBackground: "Fundo Branco",
    reqNoGlasses: "Sem Óculos",
    reqVisibleFaceId: "Rosto e ID Visíveis",
    reqGoodLighting: "Boa Iluminação",
    uploadPhoto: "Carregar Foto",
    changePhoto: "Alterar Foto",
    supportedFormats: "Formatos suportados: JPG, PNG. Máximo 5MB.",
    confirmAndProceed: "Confirmar e Prosseguir",
    sending: "Enviando...",
    errorMaxSize: "A foto deve ter no máximo 5MB.",
    successUpload: "Foto enviada com sucesso!",
    errorUpload: "Erro ao enviar foto: {error}"
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error(t.errorMaxSize);
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await onUploadPhoto(file);
      await onUpdateAccount(url);
      toast.success(t.successUpload);
      onSuccess(url);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(t.errorUpload.replace("{error}", errMsg));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-card rounded-3xl shadow-2xl overflow-hidden border border-border"
      >
        {/* Header */}
        <div className="p-8 bg-bg-subtle/50 border-b border-border">
          <div className="flex items-center gap-6 mb-2">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Person Head */}
                  <circle cx="16" cy="14" r="7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  {/* Person Body */}
                  <path d="M4 42C4 32.0589 12.0589 24 22 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  {/* Passport/Document */}
                  <rect x="26" y="16" width="18" height="24" rx="3" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="3" />
                  <path d="M31 24H39M31 30H39M31 36H35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Arm holding it */}
                  <path d="M22 32L26 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-card">
                <RiCameraFill className="text-xs" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-display font-black text-text leading-tight tracking-tight">{t.title}</h2>
              <p className="text-sm text-text-muted font-medium tracking-tight mt-0.5">{t.description}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:text-text hover:bg-bg-subtle transition-all"
              title={t.closeTitle}
            >
              <RiCloseLine className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="space-y-3">
              <RequirementItem label={t.reqHoldingPassport} />
              <RequirementItem label={t.reqLegibleData} />
              <RequirementItem label={t.reqWhiteBackground} />
            </div>
            <div className="space-y-3">
              <RequirementItem label={t.reqNoGlasses} />
              <RequirementItem label={t.reqVisibleFaceId} />
              <RequirementItem label={t.reqGoodLighting} />
            </div>
          </div>

          {/* Upload Area */}
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative group cursor-pointer aspect-square max-w-[240px] mx-auto rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden
              ${preview ? 'border-primary' : 'border-border hover:border-primary hover:bg-bg-subtle'}
            `}
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">{t.changePhoto}</span>
                </div>
              </>
            ) : (
              <>
                <RiUploadCloud2Line className="text-4xl text-text-muted/30 mb-3 group-hover:text-primary group-hover:scale-110 transition-all" />
                <span className="text-xs font-black text-text-muted uppercase tracking-widest group-hover:text-primary">{t.uploadPhoto}</span>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <p className="text-[10px] text-text-muted text-center mt-4 font-medium italic">
            {t.supportedFormats}
          </p>
        </div>

        {/* Footer */}
        <div className="p-8 bg-bg-subtle/50 border-t border-border flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg
              ${!file || isUploading 
                ? 'bg-bg-subtle text-text-muted/40 cursor-not-allowed shadow-none border border-border' 
                : 'bg-primary text-white hover:bg-primary-hover shadow-primary/20 scale-[1.02] active:scale-95'
              }
            `}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <RiLoader4Line className="animate-spin text-lg" />
                {t.sending}
              </span>
            ) : (
              <>
                <RiCheckDoubleLine className="text-lg" />
                {t.confirmAndProceed}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function RequirementItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
        <RiCheckDoubleLine className="text-[10px]" />
      </div>
      <span className="text-[11px] font-bold text-text-muted tracking-tight">{label}</span>
    </div>
  );
}
