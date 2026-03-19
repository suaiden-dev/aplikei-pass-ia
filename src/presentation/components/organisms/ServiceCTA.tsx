import React from "react";
import { Button } from "@/presentation/components/atoms/button";
import { ShieldCheck, ArrowRight, Award } from "lucide-react";
import { Link } from "react-router-dom";

interface ServiceCTAProps {
  visaType: string;
  checkoutUrl: string;
}

export const ServiceCTA: React.FC<ServiceCTAProps> = ({ visaType, checkoutUrl }) => {
  return (
    <section className="w-full py-12 sm:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl border-t-4 border-t-primary">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="relative z-10 p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left Content */}
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium backdrop-blur-sm">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Especialistas em Imigração</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                Evite erros comuns e garanta sua aprovação hoje.
              </h2>
              
              <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto lg:mx-0">
                Nossa equipe de especialistas está pronta para processar seu <span className="text-white font-bold">{visaType}</span> com agilidade e segurança. Não deixe sua aplicação para a última hora.
              </p>
              
              <div className="pt-4 flex flex-col items-center lg:items-start gap-3">
                <Link to={checkoutUrl} className="block w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
                    INICIAR MINHA SOLICITAÇÃO AGORA
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Processamento 100% Seguro e Homologado</span>
                </div>
              </div>
            </div>
            
            {/* Right Visual Element */}
            <div className="hidden md:flex flex-col items-center justify-center relative w-full lg:w-1/3">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl" />
              <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center shadow-inner hover:bg-white/10 transition-colors">
                <ShieldCheck className="w-24 h-24 text-primary mb-4" />
                <h3 className="text-white font-bold text-xl text-center">Aprovação Segura</h3>
                <p className="text-slate-400 text-sm text-center mt-2">Milhares de brasileiros já conseguiram seus vistos conosco.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
