import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MaintenancePage: React.FC = () => {
  const [lang, setLang] = useState<'pt' | 'en' | 'es'>('pt');

  const content = {
    pt: {
      badge: 'Em Breve',
      title: 'Estamos evoluindo a sua experiência',
      subtitle: 'A plataforma Aplikei ainda está em desenvolvimento e não foi lançada oficialmente.',
      description: 'Estamos trabalhando intensamente para trazer novas funcionalidades e a máxima clareza para o seu processo de visto americano. Nossa equipe está refinando cada detalhe.',
      status: 'Desenvolvimento Ativo',
      features: [
        { title: 'IA Generativa', desc: 'Consultoria inteligente 24/7' },
        { title: 'Fluxos Claros', desc: 'Onboarding intuitivo' },
        { title: 'Segurança', desc: 'Dados protegidos e auditáveis' }
      ],
      footer: '© 2026 Aplikei • Todos os direitos reservados'
    },
    en: {
      badge: 'Coming Soon',
      title: 'We are evolving your experience',
      subtitle: 'The Aplikei platform is still under development and has not been officially launched yet.',
      description: 'We are working hard to bring new features and maximum clarity to your US visa process. Our team is refining every detail.',
      status: 'Active Development',
      features: [
        { title: 'Generative AI', desc: '24/7 intelligent consulting' },
        { title: 'Clear Flows', desc: 'Intuitive onboarding' },
        { title: 'Security', desc: 'Protected and auditable data' }
      ],
      footer: '© 2026 Aplikei • All rights reserved'
    },
    es: {
      badge: 'Próximamente',
      title: 'Estamos evolucionando su experiencia',
      subtitle: 'La plataforma Aplikei aún está en desarrollo y no ha sido lanzada oficialmente.',
      description: 'Estamos trabajando intensamente para traer nuevas funcionalidades y la máxima claridad para su proceso de visa americana. Nuestro equipo está refinando cada detalle.',
      status: 'Desarrollo Activo',
      features: [
        { title: 'IA Generativa', desc: 'Consultoría inteligente 24/7' },
        { title: 'Flujos Claros', desc: 'Onboarding intuitivo' },
        { title: 'Seguridad', desc: 'Datos protegidos y auditables' }
      ],
      footer: '© 2026 Aplikei • Todos los derechos reservados'
    }
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-4 text-white font-sans overflow-hidden relative">
      {/* Language Switcher */}
      <div className="absolute top-8 right-8 z-50 flex gap-2">
        {(['pt', 'en', 'es'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
              lang === l 
                ? 'bg-primary border-primary text-white' 
                : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={lang}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="z-10 flex flex-col items-center text-center max-w-2xl"
        >
          <div className="mb-8 p-4 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl relative">
            <img 
              src="/logo.png" 
              alt="Aplikei Logo" 
              className="h-20 w-auto"
            />
            <div className="absolute -top-2 -right-2 bg-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg">
              {t.badge}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
            {t.title}
          </h1>

          <p className="text-primary font-medium text-sm md:text-base mb-4 uppercase tracking-[0.2em]">
            {t.subtitle}
          </p>
          
          <p className="text-lg text-white/60 mb-10 leading-relaxed font-light">
            {t.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 shadow-inner">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">{t.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {t.features.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/[0.08] transition-all hover:scale-[1.02] group shadow-lg"
              >
                <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-white/40">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 text-white/20 text-[10px] font-bold tracking-[0.3em] uppercase">
        {t.footer}
      </div>
    </div>
  );
};

export default MaintenancePage;
