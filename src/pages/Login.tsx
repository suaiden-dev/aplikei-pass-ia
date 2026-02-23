import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-card">
        <div className="text-center">
          <Link to="/" className="font-display text-2xl font-bold text-primary">Aplikei</Link>
          <h1 className="mt-4 font-display text-2xl font-bold text-foreground">{p.title[lang]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{p.subtitle[lang]}</p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">{p.email[lang]}</Label>
            <Input id="email" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">{p.password[lang]}</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground shadow-button hover:bg-green-dark">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {p.submit[lang]}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {p.noAccount[lang]}{" "}
          <Link to="/cadastro" className="font-medium text-accent hover:underline">{p.createAccount[lang]}</Link>
        </p>
      </motion.div>
    </div>
  );
}
