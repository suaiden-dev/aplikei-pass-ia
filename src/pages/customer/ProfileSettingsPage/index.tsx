import { useState } from "react";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import { z } from "zod";
import { toast } from "sonner";
import { 
  RiUser3Line, 
  RiMailLine, 
  RiPhoneLine, 
  RiCameraFill,
  RiCheckDoubleLine,
  RiLoader4Line,
  RiInformationLine
} from "react-icons/ri";
import { useAuth } from "../../../hooks/useAuth";
import { authService } from "../../../services/auth.service";
import { storageService } from "../../../services/storage.service";
import { Input } from "../../../components/Input";
import { Label } from "../../../components/Label";
import { zodValidate } from "../../../utils/zodValidate";
import { supabase } from "../../../lib/supabase";
import { cn } from "../../../utils/cn";

const profileSchema = z.object({
  fullName: z.string().min(3, "Nome muito curto"),
  phoneNumber: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Email inválido"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const formik = useFormik<ProfileFormValues>({
    initialValues: {
      fullName: user?.fullName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      email: user?.email ?? "",
    },
    validate: zodValidate(profileSchema),
    onSubmit: async (values) => {
      if (!user) return;
      try {
        // 1. Update Profile in DB using authService
        await authService.updateAccount(user.id, {
          full_name: values.fullName,
          phone_number: values.phoneNumber,
        });

        // 2. Check if email changed
        if (values.email !== user.email) {
          const { error: emailError } = await supabase.auth.updateUser({ email: values.email });
          if (emailError) throw emailError;
          toast.success("Perfil atualizado! Verifique o novo e-mail para confirmar a alteração.");
        } else {
          toast.success("Perfil atualizado com sucesso!");
        }
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || "Erro ao atualizar perfil");
      }
    },
    enableReinitialize: true,
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB.");
      return;
    }

    setIsUploading(true);
    try {
      const url = await storageService.uploadProfilePhoto(user.id, file);
      await authService.updateAccount(user.id, { avatar_url: url });
      toast.success("Foto de perfil atualizada!");
      // Simple way to force re-fetch from supabase
      window.location.reload(); 
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erro ao fazer upload");
    } finally {
      setIsUploading(false);
    }
  };

  const avatarUrl = user?.avatarUrl ?? 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=1a56db&color=fff`;

  return (
    <div className="p-12 max-w-[800px]">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="font-display font-black text-[32px] text-slate-900 leading-tight tracking-tight">
          Minha Conta
        </h1>
        <p className="text-base font-medium text-slate-500 mt-2">
          Gerencie suas informações pessoais e configurações de perfil.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left: Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className={cn(
               "w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-100 transition-all",
               isUploading && "opacity-50"
            )}>
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-xl shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:bg-primary-hover transition-all scale-100 hover:scale-110">
              <RiCameraFill className="text-xl" />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
            </label>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <RiLoader4Line className="text-3xl text-primary animate-spin" />
              </div>
            )}
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-6">
            Foto de Perfil
          </p>
        </div>

        {/* Right: Form */}
        <div className="md:col-span-2 space-y-8">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                <div className="relative">
                  <RiUser3Line className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <Input
                    id="fullName"
                    className={cn("pl-12", formik.touched.fullName && formik.errors.fullName && "border-red-500")}
                    placeholder="Seu nome completo"
                    {...formik.getFieldProps("fullName")}
                  />
                </div>
                {formik.touched.fullName && formik.errors.fullName && (
                   <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tight">{formik.errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <Input
                    id="email"
                    className={cn("pl-12", formik.touched.email && formik.errors.email && "border-red-500")}
                    placeholder="seu@email.com"
                    {...formik.getFieldProps("email")}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                   <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tight">{formik.errors.email}</p>
                )}
                {formik.values.email !== user?.email && !formik.errors.email && (
                  <p className="text-[11px] text-orange-600 font-bold uppercase tracking-tight mt-2 flex items-center gap-1">
                    <RiInformationLine /> Requer confirmação no novo e-mail
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phoneNumber">Telefone / WhatsApp</Label>
                <div className="relative">
                  <RiPhoneLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <Input
                    id="phoneNumber"
                    className={cn("pl-12", formik.touched.phoneNumber && formik.errors.phoneNumber && "border-red-500")}
                    placeholder="+55 (00) 00000-0000"
                    {...formik.getFieldProps("phoneNumber")}
                  />
                </div>
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                   <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tight">{formik.errors.phoneNumber}</p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={formik.isSubmitting || !formik.dirty}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg
                  ${(formik.isSubmitting || !formik.dirty)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-primary text-white hover:bg-primary-hover shadow-primary/20 scale-[1.02] active:scale-95'
                  }
                `}
              >
                {formik.isSubmitting ? (
                  <RiLoader4Line className="animate-spin text-lg" />
                ) : (
                  <>
                    <RiCheckDoubleLine className="text-lg" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Tips Section */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
              <RiInformationLine className="text-xl" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1">Dica de Segurança</h4>
              <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                Ao alterar seu e-mail, seu login será atualizado automaticamente. Você precisará confirmar a mudança através de um link enviado para o novo endereço.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
