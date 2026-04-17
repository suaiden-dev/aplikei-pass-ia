import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Label } from "../../components/Label";
import { authService } from "../../services/auth.service";
import { getLoginSchema } from "../../schemas/auth.schema";
import { zodValidate } from "../../utils/zodValidate";
import { useAuth } from "../../hooks/useAuth";
import { useT } from "../../i18n";

export default function Login() {
  const [isWelcoming, setIsWelcoming] = useState(false);
  const t = useT("auth");
  const v = useT("validation");
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Redirect logic: if authenticated and loading is finished, go to target page
    if (!isLoading && isAuthenticated && user) {
      const target = user.role === "admin" ? "/admin" : "/dashboard";
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validate: zodValidate(getLoginSchema(v)),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await authService.login(values);
        setIsWelcoming(true);
        toast.success(t.login.success || "Login realizado com sucesso!");
        // We stay in 'isWelcoming' state for a bit before navigation triggers automatically via useEffect
        setTimeout(() => setSubmitting(false), 3000);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : (t.login.error || "Erro ao entrar. Tente novamente."));
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative overflow-hidden rounded-[32px] border-2 border-slate-100 bg-white p-8 sm:p-12 shadow-2xl shadow-primary/5"
      >
        {/* Welcome Overlay */}
        {isWelcoming && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
              animate={{ scale: 1.1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 12 }}
            >
              <img src="/logo.png" alt="Aplikei" className="h-20 w-auto mb-6" />
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-display font-black text-2xl text-slate-800 leading-none mb-3"
            >
              {t.login.welcomeMessage || "Bem-vindo de volta!"}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs font-bold text-slate-400 uppercase tracking-widest"
            >
              Acessando sua conta com clareza
            </motion.p>
          </motion.div>
        )}

        <div className="text-center">
          <Link to="/" className="inline-block group">
            <img src="/logo.png" alt="Aplikei" className="h-12 w-auto group-hover:scale-105 transition-transform" />
          </Link>
          <h1 className="mt-10 font-display text-2xl font-black text-slate-800 tracking-tight leading-none">{t.login.title}</h1>
          <p className="mt-3 text-sm font-medium text-slate-500">{t.login.subtitle}</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={formik.handleSubmit}>
          <div>
            <Label htmlFor="email">{t.login.email}</Label>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t.login.password}</Label>
              <Link to="/recuperar-senha" className="text-xs text-primary hover:underline">
                {t.login.forgotPassword}
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="mt-2"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-red-500 mt-1">{formik.errors.password}</p>
            )}
          </div>

          <Button type="submit" disabled={formik.isSubmitting} className="w-full h-11 text-lg font-bold">
            {formik.isSubmitting ? (t.login.submitting || "Entrando...") : t.login.submit}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t.login.noAccount}{" "}
          <Link to="/cadastro" className="font-medium text-primary hover:underline">{t.login.createAccount}</Link>
        </p>
      </motion.div>
    </div>
  );
}
