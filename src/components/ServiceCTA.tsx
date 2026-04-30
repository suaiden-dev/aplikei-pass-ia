import React from "react";
import { ShieldCheck, ArrowRight, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./Button";

interface ServiceCTAProps {
  visaType: string;
  checkoutUrl: string;
  slug?: string;
}

const imageMap: Record<string, string> = {
  "visto-b1-b2": "https://plus.unsplash.com/premium_photo-1665203418163-52835a228723?q=80&w=1170&auto=format&fit=crop",
  "visto-f1": "https://images.unsplash.com/photo-1653587255015-c84cc98349ac?q=80&w=735&auto=format&fit=crop",
  "extensao-status": "https://images.unsplash.com/photo-1730285344026-f3f4e148403d?q=80&w=1171&auto=format&fit=crop",
  "troca-status": "https://images.unsplash.com/photo-1690268494240-8f056a982d24?q=80&w=1170&auto=format&fit=crop",
};
const defaultImage = "https://images.unsplash.com/photo-1585914924626-15adac1e6402?auto=format&fit=crop&q=80&w=800";

export const ServiceCTA: React.FC<ServiceCTAProps> = ({ visaType, checkoutUrl, slug }) => {
  const imageUrl = slug && imageMap[slug] ? imageMap[slug] : defaultImage;
  return (
    <section className="w-full py-12 sm:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl border-t-4 border-t-primary">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="relative z-10 p-8 sm:p-12 flex flex-col lg:flex-row items-stretch justify-between gap-10">
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium backdrop-blur-sm">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Especialistas em Imigração</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                Evite erros comuns e garanta sua aprovação hoje.
              </h2>
              <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto lg:mx-0">
                Nossa equipe de especialistas está pronta para processar seu{" "}
                <span className="text-white font-bold">{visaType}</span> com agilidade e segurança.
              </p>
              <div className="pt-4 flex flex-col items-center lg:items-start gap-3">
                <Link to={checkoutUrl} className="block w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-auto min-h-[4rem] px-4 sm:px-10 py-3 sm:py-0 rounded-2xl bg-primary hover:bg-primary-hover text-white text-sm sm:text-lg font-black shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
                    INICIAR MINHA SOLICITAÇÃO AGORA
                    <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Processamento 100% Seguro e Homologado</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block relative w-full lg:w-[40%] min-h-[300px] lg:min-h-0 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 shrink-0">
              <img src={imageUrl} alt={`Aprovação de ${visaType}`} className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
