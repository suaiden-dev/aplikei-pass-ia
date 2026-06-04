import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X } from "lucide-react";
import { zodValidate } from "@shared/utils/zodValidate";
import { Button } from "@shared/components/atoms/button";
import { Checkbox } from "@shared/components/atoms/checkbox";
import { Field } from "@shared/components/molecules/Field";
import { AuthCard } from "@shared/components/organisms/AuthCard";
import { PhoneInput } from "@shared/components/molecules/PhoneInput";
import { useAuthForm } from "../hooks/useAuthForm";
import { getSignUpSchema } from "../schemas/auth.schema";
import { useT } from "@app/app/i18n";
import { authService } from "../lib/auth";
import { getDashboardPathForRole, normalizeRole } from "../lib/roles";
import { supabase } from "@shared/lib/supabase";

interface LawyerTerm {
  id: string;
  title: string;
  content: string;
  version: string;
}

export default function SignUp() {
  const t = useT("auth");
  const v = useT("validation");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp } = useAuthForm();

  const roleParam = searchParams.get("role");
  const officeIdParam = searchParams.get("officeId");

  const [lawyerTerms, setLawyerTerms] = useState<LawyerTerm[]>([]);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  useEffect(() => {
    supabase
      .from("legal_terms")
      .select("id, title, content, version")
      .eq("category", "lawyer")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .then(({ data }) => setLawyerTerms(data ?? []));
  }, []);

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
      try {
        const result = await signUp(values);
        toast.success(t.signup.success);

        if (result?.session?.user) {
          const account = await authService.resolveAccount(result.session.user);
          navigate(getDashboardPathForRole(account.role), { replace: true });
          return;
        }

        const normalizedRole = normalizeRole(values.role);
        if (normalizedRole === "customer") {
          navigate("/acompanhar-meu-caso", { replace: true });
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
    <>
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
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email ? formik.errors.email : undefined}
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
              <button
                type="button"
                onClick={() => setTermsModalOpen(true)}
                className="font-bold text-primary hover:underline"
              >
                {t.signup.termsLink}
              </button>{" "}
              e{" "}
              <Link to="/legal/privacy" className="font-bold text-primary hover:underline">
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
          <Link to="/acompanhar-meu-caso" className="font-medium text-primary hover:underline">
            {t.signup.loginLink}
          </Link>
        </p>
      </AuthCard>

      {/* Terms of Use modal — shows all active lawyer terms */}
      <AnimatePresence>
        {termsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setTermsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-2xl bg-card rounded-[28px] border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
                <span className="font-black text-text">{t.signup.termsLink}</span>
                <button
                  onClick={() => setTermsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-bg-subtle text-text-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 divide-y divide-border">
                {lawyerTerms.length === 0 ? (
                  <p className="px-6 py-10 text-sm text-text-muted text-center">
                    Nenhum termo disponível no momento.
                  </p>
                ) : (
                  lawyerTerms.map((term) => (
                    <div key={term.id} className="px-6 py-5">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-bold text-text text-sm">{term.title}</h3>
                        <span className="text-[10px] font-mono text-text-muted bg-bg-subtle px-1.5 py-0.5 rounded">
                          v{term.version}
                        </span>
                      </div>
                      <pre className="text-xs text-text-muted whitespace-pre-wrap font-sans leading-relaxed">
                        {term.content}
                      </pre>
                    </div>
                  ))
                )}
              </div>

              <div className="px-6 py-4 border-t border-border bg-bg-subtle/50 flex justify-end shrink-0">
                <button
                  onClick={() => setTermsModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
