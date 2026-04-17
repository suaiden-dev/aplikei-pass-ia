import { motion } from "framer-motion";

export function LogoLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      <div className="relative">
        {/* Outer Ring Animation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-8 border-[3px] border-primary/10 border-t-primary/40 rounded-full"
        />
        
        {/* Pulsing Logo */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="relative z-10"
        >
          <img src="/logo.png" alt="Loading..." className="h-28 w-auto object-contain" />
        </motion.div>
      </div>
      
      <motion.p
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400"
      >
        Carregando seus dados com clareza
      </motion.p>
    </div>
  );
}
