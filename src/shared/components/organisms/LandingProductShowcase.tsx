import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../atoms/card";
import { Badge } from "../atoms/badge";
import { RiCpuLine, RiUserSharedLine, RiShieldCheckLine, RiArrowRightUpLine } from "react-icons/ri";

interface FeatureItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  mockup: {
    title: string;
    subtitle: string;
    badge: string;
    details: { label: string; value: string; status?: string }[];
    actions: string[];
  };
}

export function LandingProductShowcase() {
  const [activeTab, setActiveTab] = useState("auto-fill");

  const features: FeatureItem[] = [
    {
      id: "auto-fill",
      tag: "Inteligência Artificial",
      title: "Preenchimento DS-160 Cirúrgico",
      description: "Utilize modelos neurais inteligentes para preencher formulários consulares (DS-160) e processos de vistos (B1/B2, F-1, extensão e troca de status) em segundos, eliminando 70% do trabalho manual.",
      icon: RiCpuLine,
      color: "from-blue-500 to-indigo-600",
      mockup: {
        title: "Motor de Automação de Vistos Consulares",
        subtitle: "Preenchimento inteligente DS-160 ativo",
        badge: "IA Ativa • 99.8% Precisão",
        details: [
          { label: "Formulário Alvo", value: "DS-160 (Turismo/Negócios - B1/B2)" },
          { label: "Vistos Suportados", value: "B1/B2, F-1, Troca e Extensão de Status" },
          { label: "Tempo Estimado", value: "24 segundos (Economia de 55 minutos)", status: "sucesso" },
          { label: "Validação de Campos", value: "Dupla Validação Consular Concluída", status: "sucesso" }
        ],
        actions: ["Iniciar Preenchimento", "Revisar Respostas"]
      }
    },
    {
      id: "portal",
      tag: "Experiência do Cliente",
      title: "Portal do Cliente Simplificado",
      description: "Ofereça aos seus solicitantes uma interface limpa e intuitiva para upload seguro de documentos e acompanhamento de status de vistos em tempo real.",
      icon: RiUserSharedLine,
      color: "from-teal-500 to-emerald-600",
      mockup: {
        title: "Portal do Solicitante - Visto F-1",
        subtitle: "Acompanhamento do processo de vistos consulares",
        badge: "Segurança de Elite (AES-256)",
        details: [
          { label: "Passaporte Digitalizado", value: "Enviado & Verificado", status: "sucesso" },
          { label: "Formulário I-20", value: "Enviado (Aguardando Revisão)", status: "alerta" },
          { label: "Comprovante Financeiro", value: "Pendente de Envio", status: "pendente" }
        ],
        actions: ["Notificar Cliente", "Visualizar Documentos"]
      }
    },
    {
      id: "audit",
      tag: "Garantia Jurídica",
      title: "Workspace de Auditoria & Regras",
      description: "Mantenha o controle de qualidade total. Revise, aplique cupons personalizados e aprove os processos antes da submissão consular oficial.",
      icon: RiShieldCheckLine,
      color: "from-amber-500 to-orange-600",
      mockup: {
        title: "Painel de Controle e Auditoria B2B",
        subtitle: "Revisão e aprovação final de vistos",
        badge: "Compliance Avançado",
        details: [
          { label: "Regras Ativas", value: "Enforced (Teto máx. 20% desconto)" },
          { label: "Cupom Aplicado", value: "RESTRICTED20 (Válido)", status: "sucesso" },
          { label: "Auditor Responsável", value: "Mendes Lex Partner" }
        ],
        actions: ["Aprovar Caso", "Rejeitar & Solicitar Correção"]
      }
    }
  ];

  const activeFeature = features.find(f => f.id === activeTab) || features[0];

  return (
    <section className="public-section relative overflow-hidden bg-slate-950 text-white">
      {/* Background Glows */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[30rem] w-[30rem] rounded-full bg-indigo-500/10 blur-[150px]" />
      </div>

      <div className="public-container-wide relative">
        <div className="mb-16 text-center lg:mb-20">
          <Badge variant="default" className="mb-6 border-white/10 bg-white/5 text-white/90">
            Tecnologia de Elite para Vistos Consulares B2B
          </Badge>
          <h2 className="font-display text-4xl lg:text-6xl font-black tracking-[-0.04em] mb-6">
            Sua gestão de vistos consulares <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-400">
              potencializada por Inteligência Artificial
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            Desenvolvemos a plataforma B2B mais sofisticada do mercado para automatizar a burocracia de vistos consulares como B1/B2, F-1, troca e extensão de status.
          </p>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Interactive Feature Selectors */}
          <div className="lg:col-span-5 space-y-4">
            {features.map((f) => {
              const Icon = f.icon;
              const isActive = f.id === activeTab;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveTab(f.id)}
                  className={`w-full text-left p-6 rounded-3xl border transition-all duration-300 flex items-start gap-5 relative group ${
                    isActive
                      ? "bg-white/5 border-white/10 shadow-2xl"
                      : "bg-transparent border-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-white/5 text-slate-400 group-hover:text-white"
                    }`}
                  >
                    <Icon className="text-2xl" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                      {f.tag}
                    </span>
                    <h3 className="font-display text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                      {f.title}
                      {isActive && <RiArrowRightUpLine className="text-primary text-lg" />}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed mt-1">
                      {f.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Mockup Preview Area */}
          <div className="lg:col-span-7 relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-xl" />
            <Card className="relative z-10 border border-white/10 bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl overflow-hidden min-h-[420px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6 flex-1 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-5">
                      <div>
                        <h4 className="font-display text-xl font-bold tracking-tight text-white">
                          {activeFeature.mockup.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {activeFeature.mockup.subtitle}
                        </p>
                      </div>
                      <Badge className="bg-primary/10 border-primary/20 text-primary py-1 px-3 text-[10px] font-bold tracking-wider">
                        {activeFeature.mockup.badge}
                      </Badge>
                    </div>

                    {/* Details Grid */}
                    <div className="mt-6 space-y-3.5">
                      {activeFeature.mockup.details.map((d, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-white/[0.02] border border-white/5 py-3 px-4 rounded-xl"
                        >
                          <span className="text-xs text-slate-400 font-medium">{d.label}</span>
                          <div className="flex items-center gap-2">
                            {d.status === "sucesso" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                            {d.status === "alerta" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            )}
                            {d.status === "pendente" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            )}
                            <span className="text-xs text-white font-bold">{d.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions / Buttons Footer */}
                  <div className="flex items-center gap-3 border-t border-white/5 pt-5 mt-6">
                    {activeFeature.mockup.actions.map((act, idx) => (
                      <button
                        key={idx}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                          idx === 0
                            ? "bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/15"
                            : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
