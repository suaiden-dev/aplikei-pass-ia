import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { zodValidate } from "@shared/utils/zodValidate";
import { Button } from "@shared/components/atoms/button";
import { Checkbox } from "@shared/components/atoms/checkbox";
import { Field } from "@shared/components/molecules/Field";
import { AuthCard } from "@shared/components/organisms/AuthCard";
import { PhoneInput } from "@shared/components/molecules/PhoneInput";
import { useAuthForm } from "../hooks/useAuthForm";
import { getSignUpSchema } from "../schemas/auth.schema";
import { useLocale, useT } from "@app/app/i18n";
import { authService } from "../lib/auth";
import { getDashboardPathForRole, normalizeRole } from "../lib/roles";

export default function SignUp() {
  const t = useT("auth");
  const v = useT("validation");
  const { lang } = useLocale();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp } = useAuthForm();
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const roleParam = searchParams.get("role");
  const officeIdParam = searchParams.get("officeId");
  const legalRole = normalizeRole(roleParam || "admin_lawyer") === "customer" ? "customer" : "lawyer";

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
      terms: false,
      role: roleParam || "admin_lawyer",
      officeId: officeIdParam || undefined,
    },
    validate: zodValidate(getSignUpSchema(v)),
    onSubmit: async (values, { setSubmitting }) => {
      if (emailExists) {
        toast.error(t.signup.emailAlreadyInUse);
        setSubmitting(false);
        return;
      }
      try {
        const result = await signUp(values);
        
        const normalizedRole = normalizeRole(values.role);
        if (normalizedRole === "seller" || normalizedRole === "manager") {
          const successMsg =
            lang === "pt"
              ? "Conta criada com sucesso!"
              : lang === "es"
              ? "¡Cuenta creada con éxito!"
              : "Account created successfully!";
          toast.success(successMsg);
        } else {
          toast.success(t.signup.success);
        }

        if (result?.session?.user) {
          const account = await authService.resolveAccount(result.session.user);
          navigate(getDashboardPathForRole(account.role), { replace: true });
          return;
        }

        if (normalizedRole === "customer") {
          navigate("/track-my-visa", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t.signup.error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <AuthCard title={t.signup.title} subtitle={t.signup.subtitle}>
        <form className="space-y-5" onSubmit={formik.handleSubmit}>
          <Field
            id="fullName"
            name="fullName"
            label={t.signup.fullName}
            placeholder={t.signup.namePlaceholder}
            value={formik.values.fullName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.fullName ? formik.errors.fullName : undefined}
          />

          <Field
            id="email"
            name="email"
            type="email"
            label={t.signup.email}
            placeholder={t.signup.emailPlaceholder}
            value={formik.values.email}
            onChange={(e) => {
              formik.handleChange(e);
              setEmailExists(false);
            }}
            onBlur={async (e) => {
              formik.handleBlur(e);
              const email = e.target.value.trim();
              if (!email || formik.errors.email) return;
              setCheckingEmail(true);
              try {
                const role = await authService.getLoginRoleByEmail(email);
                setEmailExists(!!role);
              } catch {
                // ignora erros de rede
              } finally {
                setCheckingEmail(false);
              }
            }}
            error={
              formik.touched.email
                ? emailExists
                  ? t.signup.emailAlreadyInUse
                  : checkingEmail
                    ? undefined
                    : formik.errors.email
                : undefined
            }
          />

          <Field
            id="password"
            name="password"
            type="password"
            label={t.signup.password}
            placeholder={t.signup.passwordPlaceholder}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password ? formik.errors.password : undefined}
          />

          <div className="space-y-2">
            <label className="text-[13px] font-semibold tracking-[0.02em] text-text">{t.signup.phone}</label>
            <PhoneInput
              name="phoneNumber"
              value={formik.values.phoneNumber}
              onChange={(val) => formik.setFieldValue("phoneNumber", val)}
              onBlur={() => formik.setFieldTouched("phoneNumber", true)}
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
              <p className="text-xs text-danger">{formik.errors.phoneNumber as string}</p>
            ) : null}
          </div>

          <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <p className="text-[11px] leading-relaxed text-text-muted">
                {t.signup.securityNotice}
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
                if (checked) {
                  formik.setFieldError("terms", undefined);
                } else {
                  formik.setFieldTouched("terms", true);
                }
              }}
            />
            <label htmlFor="terms" className="cursor-pointer text-xs leading-relaxed text-text-muted">
              {t.signup.acceptTerms}{" "}
              <Link to={`/legal/terms?role=${legalRole}`} className="font-bold text-primary hover:underline">
                {t.signup.termsLink}
              </Link>{" "}
              e{" "}
              <Link to={`/legal/privacy?role=${legalRole}`} className="font-bold text-primary hover:underline">
                {t.signup.privacyLink}
              </Link>.
            </label>
          </div>
          {formik.touched.terms && formik.errors.terms ? (
            <p className="-mt-3 text-xs text-danger">{formik.errors.terms as string}</p>
          ) : null}

          <Button type="submit" disabled={formik.isSubmitting} className="w-full">
            {formik.isSubmitting ? t.signup.submitting : t.signup.submit}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          {t.signup.hasAccount}{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            {t.signup.loginLink}
          </Link>
        </p>
    </AuthCard>
  );
}
