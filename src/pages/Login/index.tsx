import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
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
import { useT } from "../../i18n/LanguageContext";

export default function Login() {
  const t = useT("auth");
  const v = useT("validation");
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validate: zodValidate(getLoginSchema(v)),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await authService.login(values);
        toast.success(t.login.success || "Login realizado com sucesso!");
        // redirect handled by useEffect when AuthContext updates
      } catch (err) {
        toast.error(err instanceof Error ? err.message : (t.login.error || "Erro ao entrar. Tente novamente."));
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
          <Link to="/" className="font-display font-bold text-primary text-3xl">Aplikei</Link>
          <h1 className="mt-8 font-display text-2xl font-bold text-foreground">{t.login.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.login.subtitle}</p>
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
