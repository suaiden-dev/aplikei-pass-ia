import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Loader2, AlertCircle, RefreshCw, KeyRound } from "lucide-react";
import { Button } from "@/presentation/components/atoms/button";
import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { getAuthService } from "@/infrastructure/factories/authFactory";
import { useT } from "@/i18n/useT";
import { toast } from "sonner";

/** 6-digit OTP input with auto-advance and keyboard navigation. */
function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

    const focus = (i: number) => inputRefs.current[i]?.focus();

    const handleChange = (i: number, char: string) => {
        const digit = char.replace(/\D/g, "").slice(-1);
        const next = [...digits];
        next[i] = digit;
        const newVal = next.join("");
        onChange(newVal);
        if (digit && i < 5) focus(i + 1);
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (digits[i]) {
                const next = [...digits];
                next[i] = "";
                onChange(next.join(""));
            } else if (i > 0) {
                focus(i - 1);
            }
        } else if (e.key === "ArrowLeft" && i > 0) {
            focus(i - 1);
        } else if (e.key === "ArrowRight" && i < 5) {
            focus(i + 1);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        onChange(pasted.padEnd(6, "").slice(0, 6).replace(/\s/g, ""));
        focus(Math.min(pasted.length, 5));
    };

    return (
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {Array.from({ length: 6 }).map((_, i) => (
                <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i] || ""}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onFocus={e => e.target.select()}
                    autoFocus={i === 0}
                    className={`
                        w-11 h-14 text-center text-subtitle font-bold font-mono rounded-md border-2 transition-all duration-150
                        bg-background text-foreground outline-none
                        ${digits[i] ? "border-accent shadow-[0_0_0_3px_hsl(var(--accent)/0.15)]" : "border-border"}
                        focus:border-accent focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.2)]
                        hover:border-accent/50
                    `}
                />
            ))}
        </div>
    );
}

type Step = "email" | "otp";

export default function ForgotPassword() {
    const { t } = useT("auth");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const emailFromQuery = searchParams.get("email");
        if (emailFromQuery) setEmail(emailFromQuery);
    }, [searchParams]);

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    const startCooldown = () => {
        setResendCooldown(60);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError(null);

        try {
            const authService = getAuthService();
            const { error: otpError } = await authService.signInWithOtp(email.trim());
            if (otpError) throw new Error(otpError);
            setStep("otp");
            startCooldown();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t("auth.forgotPassword.errorGeneric"));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) return;
        setLoading(true);
        setError(null);

        try {
            const authService = getAuthService();
            const { error: verifyError } = await authService.verifyOtp(
                email.trim(),
                otp.trim(),
                "email"
            );
            if (verifyError) throw new Error(verifyError);
            navigate("/reset-password");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t("auth.forgotPassword.errorGeneric"));
        } finally {
            setLoading(false);
        }
    };

    // Suppress unused toast import warning
    void toast;

    return (
        <div className="flex min-h-[85vh] items-center justify-center py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md rounded-md border border-border bg-card p-5 shadow-card"
            >
                {/* Logo + Back */}
                <div className="flex items-center justify-between mb-4">
                    {step === "otp" ? (
                        <button
                            onClick={() => { setStep("email"); setError(null); setOtp(""); }}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t("auth.forgotPassword.back")}
                        </button>
                    ) : (
                        <Link to="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            {t("auth.forgotPassword.backToLogin")}
                        </Link>
                    )}
                    <Link to="/" className="font-display text-subtitle font-bold text-primary">Aplikei</Link>
                </div>

                <AnimatePresence mode="wait">
                    {step === "email" ? (
                        <motion.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="mb-4 flex flex-col items-center text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                                    <Mail className="h-8 w-8 text-accent" />
                                </div>
                                <h1 className="font-display text-title font-bold text-foreground">{t("auth.forgotPassword.title")}</h1>
                                <p className="mt-2 text-sm text-muted-foreground">{t("auth.forgotPassword.subtitle")}</p>
                            </div>

                            {error && (
                                <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div>
                                    <Label htmlFor="email">{t("auth.forgotPassword.email")}</Label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="pl-6"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                    className="w-full bg-accent text-accent-foreground hover:bg-green-dark shadow-button"
                                >
                                    {loading
                                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("auth.forgotPassword.sending")}</>
                                        : t("auth.forgotPassword.send")}
                                </Button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                            <div className="mb-4 flex flex-col items-center text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                                    <KeyRound className="h-8 w-8 text-accent" />
                                </div>
                                <h1 className="font-display text-title font-bold text-foreground">{t("auth.forgotPassword.otpTitle")}</h1>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {t("auth.forgotPassword.otpSubtitle")} <strong className="text-foreground">{email}</strong>
                                </p>
                            </div>

                            {error && (
                                <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div>
                                    <Label className="mb-3 block text-center">{t("auth.forgotPassword.otpLabel")}</Label>
                                    <OtpBoxes value={otp} onChange={setOtp} />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading || otp.replace(/\s/g, "").length !== 6}
                                    className="w-full bg-accent text-accent-foreground hover:bg-green-dark shadow-button"
                                >
                                    {loading
                                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("auth.forgotPassword.verifying")}</>
                                        : t("auth.forgotPassword.verify")}
                                </Button>
                            </form>

                            {/* Resend */}
                            <div className="mt-5 text-center">
                                <p className="text-sm text-muted-foreground mb-2">{t("auth.forgotPassword.notReceived")}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSendOtp()}
                                    disabled={resendCooldown > 0 || loading}
                                    className="gap-1.5"
                                >
                                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                                    {resendCooldown > 0
                                        ? t("auth.forgotPassword.resendIn", { s: resendCooldown })
                                        : t("auth.forgotPassword.resend")}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
