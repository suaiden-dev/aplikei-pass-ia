import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { MdVerified } from "react-icons/md";

interface HeroSectionProps {
  heroImage: string;
  avatars: string[];
}

export const HeroSection = ({ heroImage, avatars }: HeroSectionProps) => {
  return (
    <header className="relative bg-highlight overflow-hidden py-32 lg:py-40 px-8 lg:px-16">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
        <div className="z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 rounded-full text-white font-bold text-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Prévia da Plataforma Aplikei
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-8 text-white">
              Aplikei: seu visto americano com <span className="text-primary">clareza</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium max-w-xl mb-12 leading-relaxed">
              Obtenha um guia digital passo a passo para vistos americanos de Turismo (B1/B2), Estudante (F-1) e Visitante de Intercâmbio (J-1), além de ferramentas com IA para organizar seus documentos e gerar um pacote de aplicação pronto para imprimir.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/cadastro" className="px-10 py-5 bg-primary text-white font-bold text-lg rounded-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                Começar agora <FiArrowRight size={20} />
              </Link>
              <Link to="/servicos" className="px-10 py-5 bg-white/10 border border-white/20 text-white font-bold text-lg rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center">
                Ver vistos disponíveis
              </Link>
            </div>
          </motion.div>
          <div className="mt-16 flex items-center gap-4">
            <div className="flex -space-x-3">
              {avatars.map((avatar, idx) => (
                <img key={idx} alt="User" className="w-12 h-12 rounded-full bg-cover border-4 border-highlight" src={avatar} />
              ))}
            </div>
            <p className="text-sm font-bold text-slate-400 tracking-wide">Mais de 12.000 aplicantes atendidos</p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-primary/10 rounded-[3.5rem] rotate-2"></div>
          <img alt="Estudantes internacionais juntos" className="relative z-10 w-full aspect-[4/5] object-cover rounded-[3rem] shadow-3xl" src={heroImage} />
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute bottom-12 -left-8 z-20 bg-white p-6 rounded-2xl shadow-2xl flex items-center gap-5 border border-slate-50"
          >
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
              <MdVerified className="text-green-600 text-3xl" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Taxa de Sucesso</p>
              <p className="text-2xl font-black text-primary">98.2%</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
};
