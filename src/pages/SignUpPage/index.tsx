import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Shield } from "lucide-react";
import { AuthBrand } from "../../components/auth/AuthBrand";
import { Button } from "../../components/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Checkbox } from "../../components/ui/Checkbox";
import { useT } from "../../i18n";
import { useAuth } from "../../hooks/useAuth";
import { authService, getDashboardPathForRole } from "../../services/auth.service";
import { useForm, v, masks } from "../../lib/form";
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const t = useT("auth");
  const navigate = useNavigate();
  const { refreshAccount } = useAuth();
  const errs = t.signup?.errors ?? {};
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      fullName:        "",
      email:           "",
      phone:           "",
      password:        "",
      confirmPassword: "",
      terms:           false as boolean,
    },
    validators: {
      fullName:        [v.required(errs.nameRequired ?? "Nome obrigatório"), v.minLength(2), v.maxLength(100)],
      email:           [v.required(errs.emailInvalid ?? "E-mail inválido"), v.email()],
      phone:           [v.phone()],
      password:        [v.required(errs.passwordMin ?? "Senha obrigatória"), v.minLength(6), v.maxLength(72)],
      confirmPassword: [v.required(errs.passwordMin ?? "Campo obrigatório"), v.matches("password", errs.passwordMatch ?? "Senhas não coincidem")],
      terms:           [v.mustBeTrue(errs.termsRequired ?? "Você deve aceitar os termos")],
    },
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        const account = await authService.signUp({
          fullName: values.fullName,
          email:    values.email,
          password: values.password,
          termsAccepted: Boolean(values.terms),
        });
        await refreshAccount();
        navigate(getDashboardPathForRole(account.role), { replace: true });
      } catch (error) {
        const msg = error instanceof Error ? error.message : t.signup.error;
        if (msg === "Email already in use.") setSubmitError(t.signup.emailAlreadyInUse);
        else setSubmitError(msg);
      }
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg rounded-[2rem] border border-border bg-card/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-10"
    >
      <div className="mb-8 text-center">
        <AuthBrand className="mx-auto h-14" />
        <h1 className="font-display mt-8 text-[2rem] font-black leading-none tracking-[-0.03em] text-text">{t.signup.title}</h1>
        <p className="mt-3 text-sm font-medium text-text-muted">{t.signup.subtitle}</p>
      </div>

      <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="fullName">{t.signup.fullName}</Label>
          <Input id="fullName" autoComplete="name" placeholder={t.signup.namePlaceholder} className="mt-2"
            {...form.register("fullName", masks.lettersOnly)} />
        </div>

        <div>
          <Label htmlFor="email">{t.signup.email}</Label>
          <Input id="email" type="email" autoComplete="email" placeholder={t.signup.emailPlaceholder} className="mt-2"
            {...form.register("email")} />
        </div>

        <div>
          <Label htmlFor="phone">{t.signup.phone}</Label>
          <Input id="phone" type="tel" autoComplete="tel" placeholder="(11) 99999-9999" className="mt-2"
            {...form.register("phone", masks.phone)} />
        </div>

        <div>
          <Label htmlFor="password">{t.signup.password}</Label>
          <div className="relative">
            <Input id="password" type={showPass ? "text" : "password"} autoComplete="new-password"
              placeholder={t.signup.passwordPlaceholder} className="mt-2 pr-11"
              {...form.register("password")} />
            <button type="button" tabIndex={-1} onClick={() => setShowPass((c) => !c)}
              className="absolute right-3 top-[1.1rem] text-text-muted transition-colors hover:text-text">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword">{t.signup.confirmPassword}</Label>
          <div className="relative">
            <Input id="confirmPassword" type={showConfirm ? "text" : "password"} autoComplete="new-password"
              placeholder={t.signup.confirmPasswordPlaceholder} className="mt-2 pr-11"
              {...form.register("confirmPassword")} />
            <button type="button" tabIndex={-1} onClick={() => setShowConfirm((c) => !c)}
              className="absolute right-3 top-[1.1rem] text-text-muted transition-colors hover:text-text">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-amber-300/40 bg-amber-50/60 p-4 dark:border-amber-800/40 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-[11px] leading-relaxed text-text-muted">{t.signup.securityNotice}</p>
          </div>
        </div>

        <AnimatePresence>
          <Checkbox
            id="terms"
            {...form.registerCheckbox("terms")}
            label={
              <>
                {t.signup.acceptTerms}{" "}
                <Link to="/legal/terms" className="font-bold text-primary hover:underline">{t.signup.termsLink}</Link>,{" "}
                <Link to="/legal/privacy" className="font-bold text-primary hover:underline">{t.signup.privacyLink}</Link>{" "}
                e{" "}
                <Link to="/legal/disclaimers" className="font-bold text-primary hover:underline">{t.signup.disclaimersLink}</Link>.
              </>
            }
          />
        </AnimatePresence>

        <Button type="submit" disabled={form.isSubmitting} className="h-12 w-full rounded-xl text-base font-bold">
          {form.isSubmitting ? t.signup.submitting : t.signup.submit}
        </Button>

        {submitError && (
          <p className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
            {submitError}
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        {t.signup.hasAccount}{" "}
        <Link to="/login" className="font-bold text-primary hover:underline">{t.signup.loginLink}</Link>
      </p>
    </motion.div>
  );
}
