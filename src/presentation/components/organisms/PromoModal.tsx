import React, { useState, useEffect } from "react";
import { X, Tag, Clock, CheckCircle2, Plane, GraduationCap, Repeat, ShieldCheck } from "lucide-react";
import { Button } from "@/presentation/components/atoms/button";
import { Progress } from "@/presentation/components/atoms/progress";
import { Link } from "react-router-dom";

export const PromoModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 59, seconds: 59 });

  useEffect(() => {
    // Check if user already saw and closed the modal
    const hasSeenPromo = localStorage.getItem("hasSeenPromoFlash");
    if (hasSeenPromo) return;

    // Open after 1 minute (60000 ms)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Countdown logic
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (hours === 0 && minutes === 0 && seconds === 0) {
          clearInterval(interval);
          return prev;
        }
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            hours--;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenPromoFlash", "true");
  };

  if (!isOpen) return null;

  const formatTime = (time: number) => time.toString().padStart(2, "0");

  const services = [
    { name: "Visto B1/B2", icon: <Plane className="w-5 h-5 text-blue-500" />, discount: "-25%" },
    { name: "Visto F-1", icon: <GraduationCap className="w-5 h-5 text-purple-500" />, discount: "-30%" },
    { name: "Change of Status", icon: <Repeat className="w-5 h-5 text-indigo-500" />, discount: "-20%" },
    { name: "Status Extension", icon: <Clock className="w-5 h-5 text-emerald-500" />, discount: "-20%" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/60 transition-all duration-300">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500"
        role="dialog"
        aria-modal="true"
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Ribbon */}
        <div className="bg-primary px-6 py-4 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl" />
          
          <div className="inline-flex items-center justify-center p-2 bg-white/20 rounded-full mb-3 backdrop-blur-md border border-white/30">
            <Tag className="w-5 h-5 text-white mr-2" />
            <span className="text-white font-bold text-xs uppercase tracking-wider">Oferta Exclusiva</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight uppercase tracking-tight">
            Oportunidade Única: <br/>Últimas vagas com desconto
          </h2>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm font-medium">
            Atualize seu status ou solicite seu visto hoje com condições exclusivas de tempo limitado.
          </p>

          {/* Countdown Timer */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-3xl sm:text-4xl w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center rounded-xl shadow-inner border border-slate-200 dark:border-slate-700">
                  {formatTime(timeLeft.hours)}
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 mt-2 tracking-wider">Horas</span>
              </div>
              <span className="text-2xl font-bold text-slate-400 mb-6">:</span>
              <div className="flex flex-col items-center">
                <div className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-3xl sm:text-4xl w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center rounded-xl shadow-inner border border-slate-200 dark:border-slate-700">
                  {formatTime(timeLeft.minutes)}
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 mt-2 tracking-wider">Minutos</span>
              </div>
              <span className="text-2xl font-bold text-slate-400 mb-6">:</span>
              <div className="flex flex-col items-center">
                <div className="bg-accent/10 text-accent font-black text-3xl sm:text-4xl w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center rounded-xl shadow-inner border border-accent/30">
                  {formatTime(timeLeft.seconds)}
                </div>
                <span className="text-[10px] uppercase font-bold text-accent mt-2 tracking-wider">Segundos</span>
              </div>
            </div>

            <div className="w-full max-w-xs space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-accent"/> Escassez alta</span>
                <span>87% preenchidas</span>
              </div>
              <Progress value={87} className="h-2.5 bg-slate-100 dark:bg-slate-800 [&>div]:bg-accent" />
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-2 gap-3">
            {services.map((service, idx) => (
              <div key={idx} className="flex items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="bg-white dark:bg-slate-700 p-2 rounded-md shadow-sm mr-3 shrink-0">
                  {service.icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{service.name}</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 w-fit px-1.5 py-0.5 rounded uppercase mt-0.5">
                    {service.discount}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-3 pt-2">
            <Link to="/servicos" onClick={handleClose} className="block w-full">
              <Button className="w-full h-14 text-base sm:text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 border-b-4 border-primary/40 active:border-b-0 active:translate-y-1 transition-all">
                GARANTIR MEU DESCONTO AGORA
              </Button>
            </Link>
            <button 
              onClick={handleClose}
              className="w-full text-center text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-4 transition-colors p-2"
            >
              Não, prefiro pagar o valor integral
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
