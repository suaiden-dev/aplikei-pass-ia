import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const ConfirmPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we have a session (the invite link should provide one)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                toast.error("Link de ativação inválido ou expirado.");
                navigate("/login");
            }
        });
    }, [navigate]);

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }

        if (password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast.success("Sua conta foi ativada com sucesso!");
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.message || "Erro ao definir senha.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-md shadow-xl border border-slate-200 dark:border-slate-800 p-5"
            >
                <div className="flex flex-col items-center mb-5">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-title font-bold text-slate-900 dark:text-white text-center">
                        Bem-vindo à Aplikei!
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-center mt-2">
                        Pagamento confirmado. Defina sua senha agora para acessar seu dashboard.
                    </p>
                </div>

                <form onSubmit={handleSetPassword} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Nova Senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <Input
                                id="password"
                                type="password"
                                className="pl-6"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <Input
                                id="confirmPassword"
                                type="password"
                                className="pl-6"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02]"
                        disabled={loading}
                    >
                        {loading ? "Ativando..." : (
                            <span className="flex items-center gap-2">
                                Ativar Minha Conta <ArrowRight className="w-4 h-4" />
                            </span>
                        )}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default ConfirmPassword;
