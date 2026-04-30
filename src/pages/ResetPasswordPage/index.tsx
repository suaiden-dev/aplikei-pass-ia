import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthBrand } from "../../components/auth/AuthBrand";
import { Button } from "../../components/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { useT } from "../../i18n";
import { authService } from "../../services/auth.service";

export default function ResetPasswordPage() {
  const t = useT("auth");
  const p = t.resetPassword;
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touchedPass, setTouchedPass] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const pendingResetEmail = useMemo(() => authService.getPendingResetEmail(), []);

  const passError = touchedPass && password.length > 0 && password.length < 6 ? p.passwordMin : undefined;
  const mismatchError = touchedConfirm && confirmPassword.length > 0 && password !== confirmPassword ? p.mismatch : undefined;
  const isValid = password.length >= 6 && password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouchedPass(true);
    setTouchedConfirm(true);
    if (!isValid) return;

      try {
        setSubmitError(null);
        setLoading(true);
        await authService.resetPassword({ email: pendingResetEmail ?? undefined, password });
        setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : p.errorGeneric);
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
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          {p.backToLogin}
        </Link>
        <AuthBrand className="h-11" />
      </div>

      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-display text-[2rem] font-black leading-none tracking-[-0.03em] text-text">{p.title}</h1>
        <p className="mt-3 text-sm font-medium text-text-muted">{p.subtitle}</p>
        {pendingResetEmail && (
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {p.resetTargetLabel}: {pendingResetEmail}
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-6">
              <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-green-600" />
              <p className="font-bold text-green-800">{p.successTitle}</p>
              <p className="mt-1 text-sm text-green-700">{p.successDesc}</p>
            </div>
            <Button className="h-12 w-full rounded-xl font-bold" onClick={() => navigate("/login")}>
              {p.goToLogin}
            </Button>
          </motion.div>
        ) : !pendingResetEmail ? (
          <motion.div key="missing-request" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="rounded-xl border border-danger/20 bg-danger/10 p-6">
              <p className="font-semibold text-danger">{p.missingResetRequest}</p>
            </div>
            <Link to="/recuperar-senha">
              <Button className="mt-4 h-12 w-full rounded-xl font-bold">{p.continueToForgotPassword}</Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <Label htmlFor="password">{p.newPassword}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouchedPass(true)}
                    error={passError}
                    className="mt-2 pr-11"
                    autoFocus
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-[1.1rem] text-text-muted transition-colors hover:text-text"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">{p.confirmPassword}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouchedConfirm(true)}
                    error={mismatchError}
                    className="mt-2 pr-11"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((current) => !current)}
                    className="absolute right-3 top-[1.1rem] text-text-muted transition-colors hover:text-text"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 h-12 w-full rounded-xl text-base font-bold"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{p.submitting}</>
                ) : p.submit}
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
