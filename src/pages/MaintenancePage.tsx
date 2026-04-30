import React from 'react';
import { motion } from 'framer-motion';

const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-4 text-white font-sans overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 flex flex-col items-center text-center max-w-2xl"
      >
        <div className="mb-8 p-4 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl relative">
          <img 
            src="/logo.png" 
            alt="Aplikei Logo" 
            className="h-20 w-auto"
          />
          <div className="absolute -top-2 -right-2 bg-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
            Em Breve
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
          Estamos evoluindo a sua experiência
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 mb-10 leading-relaxed font-light">
          A Aplikei está passando por uma manutenção programada para trazer novas funcionalidades e mais clareza para o seu visto americano.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Desenvolvimento Ativo</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {[
            { title: 'IA Generativa', desc: 'Consultoria inteligente 24/7' },
            { title: 'Fluxos Claros', desc: 'Onboarding intuitivo' },
            { title: 'Segurança', desc: 'Dados protegidos e auditáveis' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/[0.08] transition-colors group"
            >
              <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-sm text-white/40">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="absolute bottom-10 text-white/20 text-xs font-medium tracking-widest uppercase">
        © 2026 Aplikei • Todos os direitos reservados
      </div>
    </div>
  );
};

export default MaintenancePage;
