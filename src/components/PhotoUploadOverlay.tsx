import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  RiCameraFill, 
  RiUploadCloud2Line, 
  RiCheckDoubleLine, 
  RiLoader4Line,
  RiCloseLine
} from "react-icons/ri";
import { storageService } from "../services/storage.service";
import { authService } from "../services/auth.service";
import { toast } from "sonner";

interface PhotoUploadOverlayProps {
  userId: string;
  onSuccess: (photoUrl: string) => void;
  onClose: () => void;
}

export default function PhotoUploadOverlay({ userId, onSuccess, onClose }: PhotoUploadOverlayProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error("A foto deve ter no máximo 5MB.");
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
      const url = await storageService.uploadProfilePhoto(userId, file);
      await authService.updateAccount(userId, { passport_photo_url: url });
      toast.success("Foto enviada com sucesso!");
      onSuccess(url);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao enviar foto: ${errMsg}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Header */}
        <div className="p-8 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <RiCameraFill className="text-2xl" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-display font-black text-slate-900">Identificação com Passaporte</h2>
              <p className="text-sm text-slate-500 font-medium tracking-tight">Segure o passaporte aberto ao lado do rosto</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
              title="Fechar e voltar"
            >
              <RiCloseLine className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="space-y-3">
              <RequirementItem label="Segurando Passaporte" />
              <RequirementItem label="Dados Legíveis" />
              <RequirementItem label="Fundo Branco" />
            </div>
            <div className="space-y-3">
              <RequirementItem label="Sem Óculos" />
              <RequirementItem label="Rosto e ID Visíveis" />
              <RequirementItem label="Boa Iluminação" />
            </div>
          </div>

          {/* Upload Area */}
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative group cursor-pointer aspect-square max-w-[240px] mx-auto rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden
              ${preview ? 'border-primary' : 'border-slate-200 hover:border-primary hover:bg-slate-50'}
            `}
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">Alterar Foto</span>
                </div>
              </>
            ) : (
              <>
                <RiUploadCloud2Line className="text-4xl text-slate-300 mb-3 group-hover:text-primary group-hover:scale-110 transition-all" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-primary">Carregar Foto</span>
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

          <p className="text-[10px] text-slate-400 text-center mt-4 font-medium italic">
            Formatos suportados: JPG, PNG. Máximo 5MB.
          </p>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg
              ${!file || isUploading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-primary text-white hover:bg-primary-hover shadow-primary/20 scale-[1.02] active:scale-95'
              }
            `}
          >
            {isUploading ? (
              <RiLoader4Line className="animate-spin text-lg" />
            ) : (
              <>
                <RiCheckDoubleLine className="text-lg" />
                Confirmar e Prosseguir
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
      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
        <RiCheckDoubleLine className="text-[10px]" />
      </div>
      <span className="text-[11px] font-bold text-slate-600 tracking-tight">{label}</span>
    </div>
  );
}
