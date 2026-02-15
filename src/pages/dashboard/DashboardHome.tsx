import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  Upload,
  FileText,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const cards = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: "Meu serviço atual",
    desc: "Visto B1/B2 — Turismo e Negócios",
    status: "Em andamento",
    to: "/dashboard/onboarding",
  },
  {
    icon: <CheckSquare className="h-5 w-5" />,
    title: "Checklist de documentos",
    desc: "3 de 8 documentos enviados",
    progress: 37,
    to: "/dashboard/onboarding",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "Conversar com a IA",
    desc: "Tire dúvidas e organize seu processo",
    to: "/dashboard/chat",
  },
  {
    icon: <Upload className="h-5 w-5" />,
    title: "Uploads",
    desc: "Envie e gerencie seus documentos",
    to: "/dashboard/uploads",
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: "Gerar pacote final (PDF)",
    desc: "Disponível quando o onboarding estiver completo",
    to: "/dashboard/pacote",
    disabled: true,
  },
  {
    icon: <HelpCircle className="h-5 w-5" />,
    title: "Ajuda operacional (N1)",
    desc: "Dúvidas sobre uso da plataforma",
    to: "/dashboard/ajuda",
  },
];

export default function Dashboard() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Painel</h1>
      <p className="mt-1 text-muted-foreground">Bem-vindo de volta! Continue seu processo.</p>

      {/* Progress overview */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Progresso geral</p>
            <p className="mt-1 font-display text-lg font-bold text-foreground">Onboarding</p>
          </div>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
            37% completo
          </span>
        </div>
        <Progress value={37} className="mt-4 h-2" />
      </div>

      {/* Cards grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={card.disabled ? "#" : card.to}
              className={`group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-card transition-all ${
                card.disabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:shadow-card-hover hover:border-accent/40"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  {card.icon}
                </div>
                {card.status && (
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                    {card.status}
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-display font-semibold text-foreground">{card.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
              {card.progress !== undefined && (
                <Progress value={card.progress} className="mt-3 h-1.5" />
              )}
              {!card.disabled && (
                <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-medium text-accent group-hover:underline">
                  Acessar <ArrowRight className="h-3 w-3" />
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
