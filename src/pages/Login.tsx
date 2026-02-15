import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-card"
      >
        <div className="text-center">
          <Link to="/" className="font-display text-2xl font-bold text-primary">Aplikei</Link>
          <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Entrar na sua conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acesse seu guia e continue seu processo.</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground shadow-button hover:bg-green-dark"
          >
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link to="/cadastro" className="font-medium text-accent hover:underline">
            Criar conta
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
