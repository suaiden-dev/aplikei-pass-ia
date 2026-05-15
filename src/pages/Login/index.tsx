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
import { supabase } from "../../shared/lib/supabase";
import {
  getRedirectPathAfterLogin,
  type AuthRedirectState,
} from "../../routes/authRedirect";

export default function Login() {
  const [isWelcoming, setIsWelcoming] = useState(false);
  const [brandName, setBrandName] = useState("Aplikei");
  const [brandLogo, setBrandLogo] = useState("/logo.png");
  const [brandFavicon, setBrandFavicon] = useState("/logo.png");
  const [isBrandLoading, setIsBrandLoading] = useState(true);

  const t = useT("auth");
  const v = useT("validation");

  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, isLoading } = useAuth();
  const { login } = useAuthForm();
  const initialRedirectHandled = useRef(false);

  const redirectState = location.state as AuthRedirectState | null;
  const searchParams = new URLSearchParams(location.search);
  const officeIdParam = searchParams.get("officeId") || searchParams.get("office_id") || searchParams.get("office");

  useEffect(() => {
    let mounted = true;
    const BRANDING_STORAGE_KEY = "aplikei.white_label.branding";

    const applyBrandingToDocument = (name: string, faviconUrl: string) => {
      if (typeof document === "undefined") return;
      document.title = name;
      const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (favicon) favicon.href = faviconUrl;
      const appleTouch = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
      if (appleTouch) appleTouch.href = faviconUrl;
    };

    type StoredBranding = {
      officeId: string | null;
      companyName: string;
      logoUrl: string;
      faviconUrl: string;
    };

    const readStored = (): StoredBranding | null => {
      try {
        const raw = localStorage.getItem(BRANDING_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<StoredBranding>;
        if (!parsed || typeof parsed.companyName !== "string" || typeof parsed.logoUrl !== "string") return null;
        return {
          officeId: typeof parsed.officeId === "string" ? parsed.officeId : null,
          companyName: parsed.companyName,
          logoUrl: parsed.logoUrl,
          faviconUrl: typeof parsed.faviconUrl === "string" ? parsed.faviconUrl : parsed.logoUrl,
        };
      } catch {
        return null;
      }
    };

    const persist = (value: StoredBranding) => {
      try {
        localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(value));
      } catch {
        // noop
      }
    };

    async function loadOfficeBranding() {
      const stored = readStored();
      if (stored && mounted) {
        setBrandName(stored.companyName);
        setBrandLogo(stored.logoUrl);
        setBrandFavicon(stored.faviconUrl);
        applyBrandingToDocument(stored.companyName, stored.faviconUrl);
      }

      if (!officeIdParam) {
        if (!stored && mounted) {
          setBrandName("Aplikei");
          setBrandLogo("/logo.png");
          setBrandFavicon("/logo.png");
          applyBrandingToDocument("Aplikei", "/logo.png");
        }
        if (mounted) setIsBrandLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("offices")
          .select("name, landing_page_config")
          .eq("id", officeIdParam)
          .maybeSingle();

        if (error) throw error;
        if (!mounted) return;

        const config =
          data?.landing_page_config && typeof data.landing_page_config === "object"
            ? (data.landing_page_config as Record<string, unknown>)
            : null;

        const resolvedName = typeof data?.name === "string" && data.name.trim() ? data.name.trim() : "Aplikei";
        const resolvedLogo =
          typeof config?.logoUrl === "string" && config.logoUrl.trim() ? config.logoUrl.trim() : "/logo.png";
        const resolvedFavicon =
          typeof config?.faviconUrl === "string" && config.faviconUrl.trim() ? config.faviconUrl.trim() : resolvedLogo;

        setBrandName(resolvedName);
        setBrandLogo(resolvedLogo);
        setBrandFavicon(resolvedFavicon);
        applyBrandingToDocument(resolvedName, resolvedFavicon);
        persist({
          officeId: officeIdParam,
          companyName: resolvedName,
          logoUrl: resolvedLogo,
          faviconUrl: resolvedFavicon,
        });
      } catch {
        if (!mounted) return;
        if (!stored) {
          setBrandName("Aplikei");
          setBrandLogo("/logo.png");
          setBrandFavicon("/logo.png");
          applyBrandingToDocument("Aplikei", "/logo.png");
        }
      } finally {
        if (mounted) setIsBrandLoading(false);
      }
    }

    void loadOfficeBranding();
    return () => {
      mounted = false;
    };
  }, [officeIdParam]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isBrandLoading) return;
    document.title = brandName;
    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (favicon) favicon.href = brandFavicon;
    const appleTouch = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
    if (appleTouch) appleTouch.href = brandFavicon;
  }, [brandFavicon, brandName, isBrandLoading]);

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

  if (isBrandLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthCard
      title={t.login.title}
      subtitle={t.login.subtitle}
      logoAlt={brandName}
      logoSrc={brandLogo}
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
        <Link to={officeIdParam ? `/cadastro?officeId=${encodeURIComponent(officeIdParam)}` : "/cadastro"} className="font-medium text-primary hover:underline">
          {t.login.createAccount}
        </Link>
      </p>
    </AuthCard>
  );
}
