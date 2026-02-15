import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-card"
      >
        <div className="text-center">
          <Link to="/" className="font-display text-2xl font-bold text-primary">Aplikei</Link>
          <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Comece seu processo com clareza.</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Disclaimer box */}
          <div className="rounded-lg border-2 border-amber-300/50 bg-amber-50/60 p-4">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-foreground/70">
                Aplikei não é escritório de advocacia, não oferece aconselhamento jurídico e não garante aprovação. Suporte humano é apenas operacional.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={(v) => setAccepted(!!v)}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              Li e aceito os{" "}
              <Link to="/termos" className="text-accent hover:underline">Termos de Uso</Link>,{" "}
              <Link to="/privacidade" className="text-accent hover:underline">Política de Privacidade</Link> e{" "}
              <Link to="/disclaimers" className="text-accent hover:underline">Disclaimers</Link>.
            </label>
          </div>

          <Button
            type="submit"
            disabled={!accepted}
            className="w-full bg-accent text-accent-foreground shadow-button hover:bg-green-dark disabled:opacity-50"
          >
            Criar conta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
