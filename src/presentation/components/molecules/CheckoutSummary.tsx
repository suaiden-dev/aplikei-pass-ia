import React, { useEffect, useState } from 'react';
import { fetchVerifiedPrices, ServicePrice } from '@/infrastructure/services/CheckoutService';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, RefreshCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

interface CheckoutSummaryProps {
  selectedIds: string[];
  lang?: 'en' | 'pt' | 'es';
  onPriceVerified?: (total: number) => void;
  overrideTotal?: number;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ 
  selectedIds, 
  lang: propLang, 
  onPriceVerified,
  overrideTotal
}) => {
  const { lang: contextLang } = useLanguage();
  const lang = propLang || (contextLang as 'en' | 'pt' | 'es') || 'pt';
  
  const [items, setItems] = useState<ServicePrice[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPrices = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchVerifiedPrices(selectedIds);
        setItems(result.items as ServicePrice[]);
        setTotal(result.total);
        if (onPriceVerified) {
          onPriceVerified(overrideTotal !== undefined ? overrideTotal : result.total);
        }
      } catch (err: any) {
        const errorMsg = err instanceof Error ? err.message : 'Erro inesperado ao carregar o resumo.';
        if (overrideTotal !== undefined) {
          setError(null);
          setItems([{ 
            id: 'proposal', 
            service_id: selectedIds[0], 
            name: 'Serviço sob Demanda', 
            price: overrideTotal, 
            currency: 'USD' 
          }]);
          setTotal(overrideTotal);
          if (onPriceVerified) onPriceVerified(overrideTotal);
        } else {
          setError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    if (selectedIds && selectedIds.length > 0) {
      getPrices();
    } else {
      setItems([]);
      setTotal(0);
      setLoading(false);
    }
  }, [selectedIds, onPriceVerified, overrideTotal]);

  const formatCurrency = (value: number, currencyCode = 'USD') => {
    if (lang === 'pt') {
      const formatted = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      return `US$ ${formatted}`;
    }
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-ES', {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  };

  const labels = {
    pt: {
      title: "Resumo do Pedido",
      item: "ITEM",
      items: "ITENS",
      total: "TOTAL FINAL",
      secure: "Preços auditados e protegidos por criptografia de banco.",
      retry: "Tentar novamente",
      fail: "Falha técnica na validação"
    },
    en: {
      title: "Order Summary",
      item: "ITEM",
      items: "ITEMS",
      total: "FINAL TOTAL",
      secure: "Prices audited and protected by bank-level encryption.",
      retry: "Try again",
      fail: "Technical validation failure"
    },
    es: {
      title: "Resumen del Pedido",
      item: "ARTÍCULO",
      items: "ARTÍCULOS",
      total: "TOTAL FINAL",
      secure: "Precios auditados e protegidos por criptografía bancaria.",
      retry: "Intentar de nuevo",
      fail: "Falla técnica de validación"
    }
  }[lang];

  if (loading) {
    return (
      <div className="p-5 md:p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-5 animate-pulse w-full">
        <div className="h-6 bg-slate-50 rounded-lg w-1/2 mx-auto"></div>
        <div className="h-12 bg-slate-50 rounded-xl w-full"></div>
        <div className="h-px bg-slate-50 w-full my-2"></div>
        <div className="h-16 w-full bg-slate-50 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 md:p-6 bg-white rounded-3xl border border-red-50 flex flex-col gap-4 items-center text-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <h3 className="text-md font-black text-slate-800">{labels.fail}</h3>
        <button onClick={() => window.location.reload()} className="text-[10px] text-[#0051B8] font-black uppercase tracking-widest flex items-center gap-2">
          <RefreshCcw className="w-3 h-3" /> {labels.retry}
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2rem] p-5 md:p-7 shadow-[0_4px_30px_rgba(0,0,0,0.015)] border border-slate-100 flex flex-col w-full relative overflow-hidden h-auto"
    >
      {/* Decorative large currency letters - signature element */}
      <div className="absolute bottom-2 right-4 pointer-events-none select-none">
        <span className="text-6xl font-black text-[#0051B8] leading-none opacity-[0.04]">US</span>
      </div>

      <div className="relative z-10 space-y-7 flex flex-col items-center">
        <header className="flex items-center justify-center gap-4 w-full">
            <h2 className="text-lg md:text-xl font-black text-[#0051B8] leading-none tracking-tight">
              {labels.title}
            </h2>
            <div className="bg-slate-50 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
              <span className="text-md font-black text-[#0051B8] leading-none">{items.length}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {items.length === 1 ? labels.item : labels.items}
              </span>
            </div>
        </header>

        <div className="space-y-6 w-full">
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col items-center gap-1 text-center"
              >
                <p className="text-lg md:text-xl font-black text-[#1E293B] tracking-tighter leading-none">
                  {formatCurrency(item.price, item.currency)}
                </p>
                <span className="text-sm font-black text-slate-800 leading-tight px-2">
                  {item.name}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="h-px bg-slate-100/60 w-full" />

        <footer className="pt-1 w-full flex flex-col items-center">
          <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex flex-col items-center gap-1.5">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
                  {labels.total}
                </p>
                <p className="text-lg md:text-xl font-black text-[#0051B8] tracking-tighter leading-none">
                  {formatCurrency(total)}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-50/20 p-2 rounded-xl border border-transparent hover:border-slate-100 transition-all w-full max-w-[220px] justify-center">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-500/60 shadow-sm shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <p className="text-[8px] font-bold text-slate-400 leading-tight">
                   Preços auditados e protegidos por criptografia.
                </p>
              </div>
          </div>
        </footer>
      </div>
    </motion.div>
  );
};

export default CheckoutSummary;
