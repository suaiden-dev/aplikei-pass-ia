import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import { Button } from "../../components/atoms/button";
import { Field } from "../../components/molecules/Field";
import { AuthCard } from "../../components/organisms/AuthCard";
import { useAuthForm } from "../../features/auth/hooks/useAuthForm";
import { authService } from "../../features/auth/lib/auth";
import { getLoginSchema } from "../../features/auth/schemas/auth.schema";
import { zodValidate } from "../../utils/zodValidate";
import { useAuth } from "../../hooks/useAuth";
import { useT } from "../../i18n";
import {
  getRedirectPathAfterLogin,
  type AuthRedirectState,
} from "../../routes/authRedirect";

export default function Login() {
  const [isWelcoming, setIsWelcoming] = useState(false);

  const t = useT("auth");
  const v = useT("validation");

  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, isLoading } = useAuth();
  const { login } = useAuthForm();
  const initialRedirectHandled = useRef(false);

  const redirectState = location.state as AuthRedirectState | null;

  useEffect(() => {
    if (isLoading || initialRedirectHandled.current) return;

    initialRedirectHandled.current = true;

    if (isAuthenticated && user) {
      navigate(getRedirectPathAfterLogin(user, redirectState), {
        replace: true,
      });
      return;
    }

    if (!isAuthenticated) {
      setIsWelcoming(false);
    }
  }, [isAuthenticated, isLoading, navigate, redirectState, user]);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validate: zodValidate(getLoginSchema(v)),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const result = await login(values);

        if (result.session) {
          setIsWelcoming(true);
          const resolvedAccount = await authService.resolveAccount(result.session.user);
          navigate(getRedirectPathAfterLogin(resolvedAccount, redirectState), {
            replace: true,
          });
        }

        toast.success(t.login.success || "Login realizado com sucesso!");
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : t.login.error || "Erro ao entrar. Tente novamente.",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <AuthCard
      title={t.login.title}
      subtitle={t.login.subtitle}
      welcome={{
        show: isWelcoming,
        title: t.login.welcomeMessage || "Bem-vindo de volta!",
        description: "Acessando sua conta com clareza",
      }}
    >
      <form className="space-y-5" onSubmit={formik.handleSubmit}>
        <Field
          id="email"
          name="email"
          type="email"
          label={t.login.email}
          placeholder="seu@email.com"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email ? formik.errors.email : undefined}
        />

        <Field
          id="password"
          name="password"
          type="password"
          label={t.login.password}
          placeholder="••••••••"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password ? formik.errors.password : undefined}
          endAdornment={
            <Link to="/recuperar-senha" className="pointer-events-auto text-xs font-semibold text-primary hover:underline">
              {t.login.forgotPassword}
            </Link>
          }
        />

        <Button type="submit" disabled={formik.isSubmitting || isLoading} className="w-full">
          {formik.isSubmitting ? t.login.submitting || "Entrando..." : t.login.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        {t.login.noAccount}{" "}
        <Link to="/cadastro" className="font-medium text-primary hover:underline">
          {t.login.createAccount}
        </Link>
      </p>
    </AuthCard>
  );
}
