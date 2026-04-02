
import React from "react";
import { CheckCircle2, XCircle, ArrowRight, Home, MessageCircle } from "lucide-react";
import { Button } from "@/presentation/components/atoms/button";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProcessFinalStatesProps {
  status: string;
  navigate: (path: string) => void;
}

export const ProcessFinalStates: React.FC<ProcessFinalStatesProps> = ({ status, navigate }) => {
  const isApproved = status === "COS_APPROVED" || status === "EOS_APPROVED" || status === "MOTION_APPROVED" || status === "approved" || status === "completed";
  const isRejected = status === "MOTION_REJECTED" || status === "rejected" || status === "COS_REJECTED_FINAL" || status === "EOS_REJECTED_FINAL";

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  if (isApproved) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20 pt-10 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-card/10 backdrop-blur-md border border-border/50 rounded-[3rem] p-8 md:p-20 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-600" />
          
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-600/20 transform rotate-3"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-black text-foreground mb-6 tracking-tight uppercase">
            {status === "MOTION_APPROVED" ? "Motion Aprovado!" : "Processo Concluído"}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
            {status === "MOTION_APPROVED" 
              ? "Parabéns! O USCIS aceitou o seu Motion e seu status foi restabelecido com sucesso em nossa plataforma."
              : "Excelente notícia! Seu processo foi finalizado e todos os documentos foram gerados com sucesso."}
          </p>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="rounded-2xl px-10 h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 gap-2"
              onClick={() => navigate("/dashboard")}
            >
              <Home className="w-4 h-4" />
              Ir para o Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20 pt-10 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-card/10 backdrop-blur-md border border-border/50 rounded-[3rem] p-8 md:p-20 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-400 to-slate-600" />

          <div className="relative">
            <div className="absolute inset-0 bg-slate-500/5 blur-3xl rounded-full" />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-border"
            >
              <XCircle className="w-12 h-12 text-slate-400" />
            </motion.div>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-black text-foreground mb-6 tracking-tight uppercase">
            Processo Encerrado
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
            O seu processo atingiu a etapa final após o Motion e, infelizmente, a petição foi negada. De acordo com as normas atuais, não é possível iniciar um novo pedido de troca de status para este visto.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Button 
                size="lg" 
                variant="outline"
                className="rounded-2xl px-10 h-14 font-black uppercase text-xs tracking-widest border-2"
                onClick={() => navigate("/dashboard")}
            >
                <Home className="w-4 h-4 mr-2" />
                Início
            </Button>
            <Button 
              size="lg" 
              className="rounded-2xl px-10 h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 gap-2"
              onClick={() => {
                const serviceId = new URLSearchParams(window.location.search).get("service_id");
                const isEosLocal = status.startsWith("EOS_");
                const checkoutId = isEosLocal ? "analise-especialista-eos" : "analise-especialista-cos";
                const action = isEosLocal ? "eos_analyst" : "cos_analyst";
                navigate(`/checkout/${checkoutId}?serviceId=${serviceId}&action=${action}`);
              }}
            >
              Iniciar Reavaliação Técnica
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};
