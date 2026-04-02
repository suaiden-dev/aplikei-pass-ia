import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/presentation/components/atoms/button";
import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { Checkbox } from "@/presentation/components/atoms/checkbox";
import { motion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PhoneInput } from "@/presentation/components/atoms/phone-input";
import { SignUpUser } from "@/application/use-cases/auth/SignUpUser";
import { getAuthService } from "@/infrastructure/factories/authFactory";
import { useT } from "@/i18n/useT";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useT("auth");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) return;

    setLoading(true);
    try {
      const authService = getAuthService();
      const signUpUser = new SignUpUser(authService);
      const signupResult = await signUpUser.execute({
        email,
        password,
        fullName: name,
        phone,
      });

      console.log("[Signup] Raw signup result:", signupResult);
      const { error } = signupResult;

      if (error) throw new Error(error);

      toast.success(t("auth.signup.signupSuccess"));
      navigate("/login");
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-md border border-border bg-card p-5 shadow-card">
        <div className="text-center">
          <Link to="/" className="font-display text-title font-bold text-primary">Aplikei</Link>
          <h1 className="mt-4 font-display text-title font-bold text-foreground">{t("auth.signup.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("auth.signup.subtitle")}</p>
        </div>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">{t("auth.signup.fullName")}</Label>
            <Input id="name" onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">{t("auth.signup.email")}</Label>
            <Input id="email" type="email" onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">{t("auth.signup.password")}</Label>
            <Input id="password" type="password" onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="phone">{t("auth.signup.phone")}</Label>
            <PhoneInput
              id="phone"
              value={phone}
              onChange={(value) => setPhone(value)}
              className="mt-1"
              required
            />
          </div>
          <div className="rounded-md border-2 border-amber-300/50 bg-amber-50/60 p-4">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-foreground/70">{t("auth.signup.disclaimer")}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox id="terms" checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} className="mt-0.5" />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              {t("auth.signup.acceptTerms")}{" "}
              <Link to="/termos" className="text-accent hover:underline">{t("auth.signup.termsLink")}</Link>,{" "}
              <Link to="/privacidade" className="text-accent hover:underline">{t("auth.signup.privacyLink")}</Link> {t("auth.signup.and")}{" "}
              <Link to="/disclaimers" className="text-accent hover:underline">{t("auth.signup.disclaimersLink")}</Link>.
            </label>
          </div>
          <Button type="submit" disabled={!accepted || loading} className="w-full bg-accent text-accent-foreground shadow-button hover:bg-green-dark disabled:opacity-50">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t("auth.signup.submit")}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("auth.signup.hasAccount")}{" "}
          <Link to="/login" className="font-medium text-accent hover:underline">{t("auth.signup.loginLink")}</Link>
        </p>
      </motion.div>
    </div>
  );
}
