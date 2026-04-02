import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const UrgencyBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: "02",
    minutes: "45",
    seconds: "12",
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const diff = endOfDay.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        hours: h.toString().padStart(2, "0"),
        minutes: m.toString().padStart(2, "0"),
        seconds: s.toString().padStart(2, "0"),
      });
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative z-[49] bg-primary text-white py-3 px-4 shadow-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
        {/* Left Content */}
        <div className="flex items-center gap-2">
          <motion.span 
            animate={{ opacity: [1, 0.5, 1], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block text-xl"
          >
            ⚡
          </motion.span>
          <span className="font-bold text-xs sm:text-sm tracking-tight uppercase">
            Últimas vagas com desconto: <span className="text-white/90 font-extrabold text-amber-300">Só Hoje!</span>
          </span>
        </div>

        {/* Center Content: Countdown */}
        <div className="flex items-center gap-1.5" id="countdown">
          <div className="flex items-center gap-1">
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-black min-w-[28px] text-center">
              {timeLeft.hours}
            </div>
            <span className="text-white/60 font-bold">:</span>
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-black min-w-[28px] text-center">
              {timeLeft.minutes}
            </div>
            <span className="text-white/60 font-bold">:</span>
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-black min-w-[28px] text-center">
              {timeLeft.seconds}
            </div>
          </div>
          <span className="hidden lg:block text-[10px] font-bold uppercase tracking-wider text-white/70 ml-2">Restantes</span>
        </div>

        {/* Right Content */}
        <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        >
          <button 
            onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
            className="bg-white text-primary text-[10px] sm:text-xs font-black px-6 py-2 rounded-full shadow-md hover:bg-slate-100 transition-colors uppercase tracking-wider"
          >
            Aproveitar Agora
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default UrgencyBanner;
