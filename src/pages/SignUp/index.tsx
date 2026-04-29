import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "sonner";
import { zodValidate } from "../../utils/zodValidate";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { PhoneInput } from "../../components/ui/phone-input";
import { authService } from "../../services/auth.service";
import { getSignUpSchema } from "../../schemas/auth.schema";
import { useT } from "../../i18n";

export default function SignUp() {
  const t = useT("auth");
  const v = useT("validation");
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
      terms: false,
    },
    validate: zodValidate(getSignUpSchema(v)),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await authService.signUp(values);
        toast.success(t.signup.success);
        navigate("/login");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t.signup.error);
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
        className="w-full max-w-md rounded-[32px] border border-border bg-card p-8 sm:p-10 shadow-2xl shadow-primary/5"
      >
        <div className="text-center">
          <Link to="/" className="inline-block group mb-6">
            <img src="/logo.png" alt="Aplikei" className="h-10 w-auto group-hover:scale-105 transition-transform" />
          </Link>
          <h1 className="font-display text-2xl font-black text-text tracking-tight leading-none">{t.signup.title}</h1>
          <p className="mt-3 text-sm font-medium text-text-muted">{t.signup.subtitle}</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={formik.handleSubmit}>
          <div>
            <Label htmlFor="fullName" className="text-text">{t.signup.fullName}</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder={t.signup.namePlaceholder}
              className="mt-2"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.fullName && formik.errors.fullName && (
              <p className="text-xs text-danger mt-1">{formik.errors.fullName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-text">{t.signup.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t.signup.emailPlaceholder}
              className="mt-2"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-danger mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" title={t.signup.password} className="text-text">{t.signup.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t.signup.passwordPlaceholder}
              className="mt-2"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-danger mt-1">{formik.errors.password}</p>
            )}
          </div>

          <div>
            <Label className="mb-2 block text-text">{t.signup.phone}</Label>
            <PhoneInput
              name="phoneNumber"
              value={formik.values.phoneNumber}
              onChange={(val) => formik.setFieldValue("phoneNumber", val)}
              onBlur={() => formik.setFieldTouched("phoneNumber", true)}
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <p className="text-xs text-danger mt-1">{formik.errors.phoneNumber as string}</p>
            )}
          </div>

          <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <p className="text-[11px] text-text-muted leading-relaxed">
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
                formik.setFieldTouched("terms", true);
              }}
            />
            <label htmlFor="terms" className="text-xs text-text-muted leading-relaxed cursor-pointer">
              {t.signup.acceptTerms}{" "}
              <Link to="/legal/terms" className="text-primary hover:underline font-bold">{t.signup.termsLink}</Link>,{" "}
              <Link to="/legal/privacy" className="text-primary hover:underline font-bold">{t.signup.privacyLink}</Link> e{" "}
              <Link to="/legal/disclaimers" className="text-primary hover:underline font-bold">{t.signup.disclaimersLink}</Link>.
            </label>
          </div>
          {formik.touched.terms && formik.errors.terms && (
            <p className="text-xs text-danger -mt-3">{formik.errors.terms as string}</p>
          )}

          <Button type="submit" disabled={formik.isSubmitting} className="w-full h-11 text-lg font-bold">
            {formik.isSubmitting ? t.signup.submitting : t.signup.submit}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          {t.signup.hasAccount}{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">{t.signup.loginLink}</Link>
        </p>
      </motion.div>
    </div>
  );
}
