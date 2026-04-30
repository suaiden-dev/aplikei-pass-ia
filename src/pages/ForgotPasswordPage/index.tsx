import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AuthBrand } from "../../components/auth/AuthBrand";
import { Button } from "../../components/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { useT } from "../../i18n";
import { authService } from "../../services/auth.service";

export default function ForgotPasswordPage() {
  const t = useT("auth");
  const p = t.forgotPassword;
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(val: string) {
    if (!val) return p.emailRequired;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return p.emailInvalid;
    return undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    const err = validate(email);
    setEmailError(err);
    if (err) return;

      try {
        setSubmitError(null);
        setLoading(true);
        await authService.requestPasswordReset(email);
        setSent(true);
    } catch (error) {
      if (error instanceof Error && error.message === "Account not found for this email.") {
        setSubmitError(p.accountNotFound);
      } else {
        setSubmitError(error instanceof Error ? error.message : p.errorGeneric);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md rounded-[2rem] border border-border bg-card/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-10"
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          {p.backToLogin}
        </Link>
        <AuthBrand className="h-11" />
      </div>

      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
            >
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </motion.div>
            <h2 className="font-display mb-2 text-2xl font-black text-text">{p.successTitle}</h2>
            <p className="mb-8 text-sm text-text-muted">{p.successDesc}</p>
            <Link to="/reset-password">
              <Button className="h-12 w-full rounded-xl font-bold">{p.continueToReset}</Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-8 text-center">
              <h1 className="font-display text-[2rem] font-black leading-none tracking-[-0.03em] text-text">{p.title}</h1>
              <p className="mt-3 text-sm font-medium text-text-muted">{p.subtitle}</p>
            </div>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <Label htmlFor="email">{p.email}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => { setTouched(true); setEmailError(validate(email)); }}
                  error={touched ? emailError : undefined}
                  className="mt-2"
                />
              </div>
              <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl text-base font-bold">
                {loading ? p.sending : p.send}
              </Button>
              {submitError && (
                <p className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
                  {submitError}
                </p>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
