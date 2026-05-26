import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import { Button } from "@shared/components/atoms/button";
import { Field } from "@shared/components/molecules/Field";
import { AuthCard } from "@shared/components/organisms/AuthCard";
import { useAuthForm } from "../hooks/useAuthForm";
import { authService } from "../services/authService";
import { getLoginSchema } from "../schemas/auth.schema";
import { zodValidate } from "@shared/utils/zodValidate";
import { useAuth } from "@shared/hooks/useAuth";
import { useT } from "@app/app/i18n";
import {
  canAccessLoginPortal,
  getLoginPortalErrorMessage,
  type LoginPortal,
} from "@features/auth/lib/roles";
import {
  getRedirectPathAfterLogin,
  type AuthRedirectState,
} from "@app/app/router/authRedirect";

export default function Login() {
  const t = useT("auth");
  const v = useT("validation");

  const navigate = useNavigate();
  const location = useLocation();

  const hideTabs = location.pathname === "/acompanhar-meu-caso" || location.pathname === "/login-office";

  const [isWelcoming, setIsWelcoming] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "track">(() =>
    location.pathname === "/acompanhar-meu-caso" ? "track" : "login",
  );

  useEffect(() => {
    setActiveTab(location.pathname === "/acompanhar-meu-caso" ? "track" : "login");
    setIsWelcoming(false);
  }, [location.pathname]);

  const { user, isAuthenticated, isLoading, refreshAccount } = useAuth();
  const { login } = useAuthForm();
  const initialRedirectHandled = useRef(false);
  const loginPortal: LoginPortal = activeTab === "track" ? "tracking" : "professional";

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
  }, [isAuthenticated, isLoading, navigate, redirectState, user]);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validate: zodValidate(getLoginSchema(v)),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const preflightRole = await authService.getLoginRoleByEmail(values.email);
        if (preflightRole && !canAccessLoginPortal(preflightRole, loginPortal)) {
          toast.error(getLoginPortalErrorMessage(preflightRole, loginPortal));
          return;
        }

        const result = await login(values);

        if (result.session) {
          setIsWelcoming(true);
          await refreshAccount();
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

  // Dynamic header and copywriting logic based on language and selected tab
  const getHeaderInfo = () => {
    const isEn = t.login.email === "Email";
    const isEs = t.login.submit === "Entrar" && t.login.title === "Acceder a mi cuenta";

    if (activeTab === "login") {
      return {
        title: isEn ? "Professional Access" : isEs ? "Acceso Profesional" : "Acesso Profissional",
        subtitle: isEn
          ? "Log in to manage and review client visas, petitions, and active cases."
          : isEs
          ? "Área profesional para abogados y oficinas para gestionar las visas de sus clientes."
          : "Área profissional para advogados e escritórios gerenciarem vistos dos clientes.",
      };
    } else {
      return {
        title: isEn ? "Track Visa" : isEs ? "Acompañar su Caso" : "Acompanhar Caso",
        subtitle: isEn
          ? "Log in to your client account to track the status and detailed history of your visa."
          : isEs
          ? "Inicie sesión en su cuenta de cliente para seguir el estado y el historial de su visa."
          : "Entre na sua conta de cliente para acompanhar o status e o histórico do seu visto.",
      };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <AuthCard
      title={headerInfo.title}
      subtitle={headerInfo.subtitle}
      logoAlt="Aplikei"
      logoSrc="/logo.png"
      welcome={{
        show: isWelcoming,
        title: t.login.welcomeMessage || "Bem-vindo de volta!",
        description: "Acessando sua conta com clareza",
      }}
    >
      {/* Premium Tabs Switcher */}
      {!hideTabs && (
        <div className="flex rounded-2xl bg-bg-subtle p-1 mb-8 border border-border/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          onClick={() => setActiveTab("login")}
          className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 border-none cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "login"
              ? "bg-card text-primary shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-border/40 font-bold"
              : "text-text-muted hover:text-text bg-transparent font-medium"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2 2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {t.login.email === "Email" ? "Professional" : t.login.title === "Acceder a mi cuenta" ? "Profesional" : "Advogado"}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("track")}
          className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 border-none cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "track"
              ? "bg-card text-primary shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-border/40 font-bold"
              : "text-text-muted hover:text-text bg-transparent font-medium"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {t.login.email === "Email" ? "Track Visa" : t.login.title === "Acceder a mi cuenta" ? "Acompañar Caso" : "Acompanhar Caso"}
        </button>
        </div>
      )}

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

      {/* Client Tracking Informative callout */}
      {activeTab === "track" && (
        <div className="mt-6 p-4 rounded-2xl border border-primary/20 bg-primary/5 flex gap-3 text-xs text-primary-hover animate-none">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="leading-relaxed">
            <strong className="font-black uppercase tracking-wider block mb-1">
              {t.login.email === "Email" ? "Client Case Tracking" : t.login.title === "Acceder a mi cuenta" ? "Seguimiento del Caso" : "Acompanhamento do Caso"}
            </strong>
            {t.login.email === "Email"
              ? "By logging in, you will be able to check your real-time visa status timeline, view key interview schedules, and upload requested documents."
              : t.login.title === "Acceder a mi cuenta"
              ? "Al iniciar sesión, podrá verificar su línea de tiempo de visa en tiempo real, ver fechas clave de entrevistas y subir documentos solicitados."
              : "Ao fazer login, você poderá visualizar o status em tempo real do seu visto, consultar datas de entrevistas e anexar novas pendências."}
          </div>
        </div>
      )}

      {activeTab === "login" && (
        <p className="mt-6 text-center text-sm text-text-muted">
          {t.login.noAccount}{" "}
          <Link to="/cadastro" className="font-medium text-primary hover:underline">
            {t.login.email === "Email"
              ? "Create account as lawyer"
              : t.login.title === "Acceder a mi cuenta"
              ? "Crear cuenta como abogado"
              : "Criar conta como advogado"}
          </Link>
        </p>
      )}
    </AuthCard>
  );
}
