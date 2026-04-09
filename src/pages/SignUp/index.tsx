import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "sonner";
import { zodValidate } from "../../utils/zodValidate";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Label } from "../../components/Label";
import { Checkbox } from "../../components/CheckBox";
import PhoneInput from "../../components/PhoneInput";
import { authService } from "../../services/auth.service";
import { signUpSchema } from "../../schemas/auth.schema";

export default function SignUp() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
      terms: false,
    },
    validate: zodValidate(signUpSchema),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await authService.signUp(values);
        toast.success("Parabéns! Sua conta foi criada com sucesso.");
        navigate("/login");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao criar conta. Tente novamente.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-md border border-border bg-card p-8 shadow-card"
      >
        <div className="text-center">
          <Link to="/" className="font-display text-title font-bold text-primary text-3xl">Aplikei</Link>
          <h1 className="mt-8 font-display text-2xl font-bold text-foreground">Criar sua conta</h1>
          <p className="mt-2 text-sm text-muted-foreground">Comece hoje sua jornada para o visto americano.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={formik.handleSubmit}>
          <div>
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Ex: Maria Silva"
              className="mt-2"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.fullName && formik.errors.fullName && (
              <p className="text-xs text-red-500 mt-1">{formik.errors.fullName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              className="mt-2"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-500 mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              className="mt-2"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-red-500 mt-1">{formik.errors.password}</p>
            )}
          </div>

          <div>
            <Label className="mb-2 block">Telefone</Label>
            <PhoneInput
              value={formik.values.phoneNumber}
              onChange={(val) => formik.setFieldValue("phoneNumber", val)}
              onBlur={() => formik.setFieldTouched("phoneNumber", true)}
              error={formik.touched.phoneNumber ? formik.errors.phoneNumber : undefined}
            />
          </div>

          <div className="rounded-xl border-2 border-amber-300/30 bg-amber-50/40 p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-[11px] text-foreground/70 leading-relaxed">
                Seus dados estão protegidos por criptografia de nível bancário e conformidade com a LGPD.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 py-2">
            <Checkbox
              id="terms"
              name="terms"
              className="mt-1"
              checked={formik.values.terms}
              onCheckedChange={(checked) => {
                formik.setFieldValue("terms", checked);
                formik.setFieldTouched("terms", true);
              }}
            />
            <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              Eu li e aceito os{" "}
              <Link to="/termos" className="text-primary hover:underline font-bold">Termos de Uso</Link>,{" "}
              <Link to="/privacidade" className="text-primary hover:underline font-bold">Política de Privacidade</Link> e{" "}
              <Link to="/disclaimers" className="text-primary hover:underline font-bold">Avisos Legais</Link>.
            </label>
          </div>
          {formik.touched.terms && formik.errors.terms && (
            <p className="text-xs text-red-500 -mt-3">{formik.errors.terms as string}</p>
          )}

          <Button type="submit" disabled={formik.isSubmitting} className="w-full h-11 text-lg font-bold">
            {formik.isSubmitting ? "Criando conta..." : "Criar Conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Entrar</Link>
        </p>
      </motion.div>
    </div>
  );
}
