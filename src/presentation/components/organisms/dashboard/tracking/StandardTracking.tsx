
import React from "react";
import { Truck, Package, Save, Edit2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/presentation/components/atoms/button";
import { Input } from "@/presentation/components/atoms/input";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StandardTrackingProps {
  trackingCode: string;
  setTrackingCode: (v: string) => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  isSaving: boolean;
  handleSaveTracking: () => void;
  setSelectedOutcome: (v: string) => void;
  setIsConfirmOpen: (v: boolean) => void;
  recoveryType?: string;
}

export const StandardTracking: React.FC<StandardTrackingProps> = (props) => {
  const {
    trackingCode,
    setTrackingCode,
    isEditing,
    setIsEditing,
    isSaving,
    handleSaveTracking,
    setSelectedOutcome,
    setIsConfirmOpen,
    recoveryType = 'none'
  } = props;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-10 px-4 pt-4"
    >
      <div className="flex flex-col space-y-1.5 border-b border-border pb-4">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Truck className="h-8 w-8 text-primary" /> 
          Acompanhamento de Envio
        </h1>
        <p className="text-muted-foreground">
          Gerencie o rastreamento do seu processo e informe o resultado assim que recebê-lo.
        </p>
      </div>

      <div className="bg-card/10 backdrop-blur-md border border-border/50 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Package className="w-32 h-32" />
        </div>

        <div className="relative space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
              {trackingCode ? "Pacote Enviado" : "Aguardando Envio"}
              {trackingCode && <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse ml-2" />}
            </h2>
            
            {isEditing || !trackingCode ? (
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="relative flex-1">
                  <Input 
                    value={trackingCode} 
                    onChange={e => setTrackingCode(e.target.value.toUpperCase())} 
                    placeholder="Insira o código do correio (ex: AB123456789BR)" 
                    className="h-14 pl-12 rounded-2xl border-2 focus:ring-primary/20 font-mono text-lg uppercase tracking-wider"
                  />
                  <Truck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                <Button 
                  onClick={handleSaveTracking} 
                  disabled={isSaving || !trackingCode}
                  className="h-14 rounded-2xl px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 gap-2"
                >
                  {isSaving ? <Package className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Salvar
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between bg-muted/30 p-6 md:p-8 rounded-3xl border border-border/50 group">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Package className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Código de Rastreamento</p>
                    <p className="text-3xl font-mono font-black tracking-tighter text-foreground select-all group-hover:text-primary transition-colors">
                      {trackingCode}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsEditing(true)}
                  className="mt-4 sm:mt-0 rounded-xl px-6 h-12 hover:bg-muted text-muted-foreground font-bold gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar
                </Button>
              </div>
            )}
          </div>

          {trackingCode && !isEditing && (
            <div className="pt-8 border-t border-border/50 animate-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground">Atualize o status do seu pedido</h3>
                <p className="text-sm text-muted-foreground mt-1">Selecione o resultado da sua petição assim que receber a notificação do USCIS.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusButton 
                  variant="approved" 
                  icon={<CheckCircle2 className="h-5 w-5" />} 
                  label="Aprovado!" 
                  description="A petição foi aceita."
                  onClick={() => { setSelectedOutcome("approved"); setIsConfirmOpen(true); }} 
                />
                <StatusButton 
                  variant="rejected" 
                  icon={<XCircle className="h-5 w-5" />} 
                  label="Negado" 
                  description={recoveryType === "motion" ? "A petição foi recusada." : "Desejo abrir Motion."}
                  onClick={() => { setSelectedOutcome("rejected"); setIsConfirmOpen(true); }} 
                />
                {(recoveryType === 'none' || !recoveryType) && (
                  <StatusButton 
                    variant="rfe" 
                    icon={<AlertCircle className="h-5 w-5" />} 
                    label="RFE Recebido" 
                    description="Aguardando evidências."
                    onClick={() => { setSelectedOutcome("rfe"); setIsConfirmOpen(true); }} 
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

function StatusButton({ label, description, icon, variant, onClick }: { label: string; description: string; icon: React.ReactNode; variant: 'approved' | 'rejected' | 'rfe'; onClick: () => void }) {
  const colors = {
    approved: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50",
    rejected: "text-red-600 bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50",
    rfe: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50"
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all hover:scale-105 active:scale-95 text-center group",
        colors[variant]
      )}
    >
      <div className="mb-3 transform group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="font-black uppercase text-xs tracking-widest mb-1">{label}</span>
      <span className="text-[10px] opacity-70 font-semibold">{description}</span>
    </button>
  );
}
