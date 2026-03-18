import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/presentation/components/atoms/button";
import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { checkIsAdmin } from "@/lib/admin";
import { LoginUser } from "@/application/use-cases/auth/LoginUser";
import { SupabaseAuthService } from "@/infrastructure/services/SupabaseAuthService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const p = t.login;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authService = new SupabaseAuthService();
      const loginUser = new LoginUser(authService);
      const { user, error } = await loginUser.execute(email, password);

      if (error) throw new Error(error);

      if (user && checkIsAdmin(user.email)) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-md border border-border bg-card p-5 shadow-card">
        <div className="text-center">
          <Link to="/" className="font-display text-title font-bold text-primary">Aplikei</Link>
          <h1 className="mt-4 font-display text-title font-bold text-foreground">{p.title[lang]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{p.subtitle[lang]}</p>
        </div>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">{p.email[lang]}</Label>
            <Input id="email" type="email" onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{p.password[lang]}</Label>
              <Link to="/forgot-password" className="text-xs text-accent hover:underline">
                {p.forgotPassword[lang]}
              </Link>
            </div>
            <Input id="password" type="password" onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground shadow-button hover:bg-green-dark">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {p.submit[lang]}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {p.noAccount[lang]}{" "}
          <Link to="/cadastro" className="font-medium text-accent hover:underline">{p.createAccount[lang]}</Link>
        </p>
      </motion.div>
    </div>
  );
}
