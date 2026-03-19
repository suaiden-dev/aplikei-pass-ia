import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowLeft, CheckCircle2, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/presentation/components/atoms/button";
import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { useLanguage } from "@/i18n/LanguageContext";
import { getAuthService } from "@/infrastructure/factories/authFactory";

export default function ResetPassword() {
    const { lang, t } = useLanguage();
    const p = t.resetPassword;
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [passwordUpdated, setPasswordUpdated] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const passwordMismatch = password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;

    // Verifica se há sessão ativa (vinda do OTP verificado no ForgotPassword)
    useEffect(() => {
        const authService = getAuthService();
        authService.getSession().then((session) => {
            if (!session.user) {
                setErrorMessage(p.noSession[lang]);
                setTimeout(() => navigate("/forgot-password"), 4000);
            }
            setCheckingSession(false);
        });
    }, [lang, navigate, p]);

    const getErrorMessage = (err: unknown): string => {
        const msg = err instanceof Error ? err.message : String(err) || "";
        const lower = msg.toLowerCase();
        if (lower.includes("same") || lower.includes("igual")) return p.errorSamePassword[lang];
        if (lower.includes("weak") || lower.includes("fraca")) return p.errorWeakPassword[lang];
        return msg || p.errorGeneric[lang];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordMismatch || !password || password.length < 6) return;

        setLoading(true);
        setErrorMessage(null);

        try {
            const authService = getAuthService();
            const { error } = await authService.resetPassword(password);
            if (error) throw new Error(error);

            setPasswordUpdated(true);
            await authService.logout();
            setTimeout(() => navigate("/login"), 3000);
        } catch (err: unknown) {
            setErrorMessage(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) return null;

    return (
        <div className="flex min-h-[85vh] items-center justify-center py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md rounded-md border border-border bg-card p-5 shadow-card"
            >
                {/* Logo + Voltar */}
                <div className="flex items-center justify-between mb-4">
                    <Link to="/forgot-password" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        {p.backToLogin[lang]}
                    </Link>
                    <Link to="/" className="font-display text-subtitle font-bold text-primary">Aplikei</Link>
                </div>

                {/* Ícone */}
                <div className="mb-4 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                        <Lock className="h-8 w-8 text-accent" />
                    </div>
                    <h1 className="font-display text-title font-bold text-foreground">{p.title[lang]}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{p.subtitle[lang]}</p>
                </div>

                <AnimatePresence mode="wait">
                    {passwordUpdated ? (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-5 text-center">
                                <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-green-600 dark:text-green-400" />
                                <p className="font-semibold text-green-800 dark:text-green-300">{p.successTitle[lang]}</p>
                                <p className="mt-1 text-sm text-green-700 dark:text-green-400">{p.successDesc[lang]}</p>
                            </div>
                            <Button className="mt-4 w-full bg-accent text-accent-foreground hover:bg-green-dark" onClick={() => navigate("/login")}>
                                {p.goToLogin[lang]}
                            </Button>
                        </motion.div>
                    ) : errorMessage ? (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-5 text-center">
                                <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
                                <p className="font-semibold text-destructive">{errorMessage}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{p.redirecting[lang]}</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="password">{p.newPassword[lang]}</Label>
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="pl-6 pr-6"
                                            required
                                            minLength={6}
                                            autoFocus
                                        />
                                        <button type="button" tabIndex={-1}
                                            onClick={() => setShowPassword(p => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="confirmPassword">{p.confirmPassword[lang]}</Label>
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirm ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className={`pl-6 pr-6 ${passwordMismatch ? "border-destructive" : ""}`}
                                            required
                                        />
                                        <button type="button" tabIndex={-1}
                                            onClick={() => setShowConfirm(p => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordMismatch && (
                                        <p className="mt-1 text-xs text-destructive">{p.mismatch[lang]}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || passwordMismatch || !password || !confirmPassword}
                                    className="w-full bg-accent text-accent-foreground hover:bg-green-dark shadow-button"
                                >
                                    {loading
                                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{p.submitting[lang]}</>
                                        : p.submit[lang]}
                                </Button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
