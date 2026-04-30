import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { AuthBrand } from "../../components/auth/AuthBrand";
import { Button } from "../../components/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { useT } from "../../i18n";
import { authService, getDashboardPathForRole } from "../../services/auth.service";
import { useForm, v } from "../../lib/form";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const t = useT("auth");
  const navigate = useNavigate();
  const { refreshAccount } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    initialValues: { email: "", password: "" },
    validators: {
      email:    [v.required(t.signup?.errors?.emailInvalid ?? "E-mail obrigatório"), v.email()],
      password: [v.required(t.signup?.errors?.passwordMin  ?? "Senha obrigatória"), v.minLength(6)],
    },
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        const result = await authService.signIn(values);
        await refreshAccount();
        const currentUser = authService.getCurrentAccount() ?? result.user;
        const dashboardPath = getDashboardPathForRole(currentUser.role);
        navigate(dashboardPath, { replace: true });
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : t.login.error);
      }
    },
  });


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-border bg-card/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-10"
    >
      <AnimatePresence>
        {form.isSubmitting && (
          <motion.div
            key="login-loading"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-card p-8 text-center"
          >
            <motion.div
              animate={{
                scale: [0.96, 1.04, 0.96],
                opacity: [0.75, 1, 0.75],
              }}
              transition={{
                duration: 1.4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="mb-6 rounded-[1.75rem] border border-primary/15 bg-primary/10 px-6 py-5 shadow-[0_18px_60px_rgba(37,99,235,0.16)]"
            >
              <img
                src="/logo.png"
                alt="Aplikei"
                className="h-16 w-auto object-contain drop-shadow-[0_12px_30px_rgba(37,99,235,0.18)]"
              />
            </motion.div>
            <motion.h2
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="font-display text-2xl font-black leading-none text-text mb-3"
            >
              {t.login.submitting}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-xs font-bold uppercase tracking-[0.24em] text-text-muted"
            >
              Carregando suas informações com clareza
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 text-center">
        <AuthBrand className="mx-auto h-14" />
        <h1 className="font-display mt-8 text-[2rem] font-black leading-none tracking-[-0.03em] text-text">
          {t.login.title}
        </h1>
        <p className="mt-3 text-sm font-medium text-text-muted">{t.login.subtitle}</p>
      </div>

      <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
        <div>
          <Label htmlFor="email">{t.login.email}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            className="mt-2"
            {...form.register("email")}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <Label htmlFor="password" className="mb-0">{t.login.password}</Label>
            <Link to="/recuperar-senha" className="text-xs font-semibold text-primary hover:underline">
              {t.login.forgotPassword}
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="mt-2 pr-11"
              {...form.register("password")}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-[1.1rem] text-text-muted transition-colors hover:text-text"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={form.isSubmitting} className="mt-2 h-12 w-full rounded-xl text-base font-bold">
          {form.isSubmitting ? t.login.submitting : t.login.submit}
        </Button>

        {submitError && (
          <p className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
            {submitError}
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        {t.login.noAccount}{" "}
        <Link to="/cadastro" className="font-bold text-primary hover:underline">
          {t.login.createAccount}
        </Link>
      </p>
    </motion.div>
  );
}
