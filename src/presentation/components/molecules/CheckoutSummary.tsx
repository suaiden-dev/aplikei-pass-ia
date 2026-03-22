import React, { useEffect, useState } from 'react';
import { fetchVerifiedPrices, ServicePrice } from '@/infrastructure/services/CheckoutService';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutSummaryProps {
  selectedIds: string[];
  lang?: 'en' | 'pt' | 'es';
  onPriceVerified?: (total: number) => void;
}

/**
 * Componente de Resumo de Checkout que valida preços estritamente via Supabase (Backend).
 * @param selectedIds IDs dos serviços e upsells selecionados para o checkout.
 */
const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ selectedIds, lang = 'pt', onPriceVerified }) => {
  const [items, setItems] = useState<ServicePrice[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Efetua a atualização dos dados toda vez que a lista de IDs mudar.
     * Segue a regra de negócio: os preços vêm sempre do banco, nunca de props.
     */
    const getPrices = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchVerifiedPrices(selectedIds);
        setItems(result.items as ServicePrice[]);
        setTotal(result.total);
        if (onPriceVerified) onPriceVerified(result.total);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro inesperado ao carregar o resumo.';
        setError(errorMsg);
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
  }, [selectedIds, error, onPriceVerified]);

  // Auxiliar para formatação monetária segura
  const formatCurrency = (value: number, currencyCode = 'BRL') => {
    return new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'es-ES', {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  };

  /**
   * Estado de Carregamento (Skeleton) Premium
   */
  if (loading) {
    return (
      <div className="p-10 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-1/3 bg-slate-100 rounded-xl mb-4"></div>
        <div className="space-y-6">
          <div className="flex justify-between h-4 bg-slate-50 rounded w-full"></div>
          <div className="flex justify-between h-4 bg-slate-50 rounded w-5/6"></div>
        </div>
        <div className="border-t border-slate-50 pt-8 mt-4 flex justify-between items-center">
            <div className="h-8 w-24 bg-slate-100 rounded-lg"></div>
            <div className="h-10 w-40 bg-slate-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  /**
   * Estado de Erro com UI de feedback claro
   */
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 bg-red-50 rounded-[2.5rem] border-2 border-red-100 flex flex-col gap-6"
      >
        <div className="flex items-center gap-4 text-red-600">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined font-bold text-2xl">warning</span>
            </div>
            <h3 className="text-xl font-extrabold">Falha técnica na validação</h3>
        </div>
        <p className="text-red-700 font-medium leading-relaxed opacity-80">{error}</p>
        <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 px-6 bg-red-100 hover:bg-red-200 text-red-700 font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
        >
            <span className="material-symbols-outlined">refresh</span>
            Tentar novamente
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[3rem] p-10 lg:p-14 shadow-3xl shadow-primary/5 border border-slate-50 relative overflow-hidden group"
    >
      {/* Elemento Decorativo: Ícone de Carrinho no Fundo */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110 duration-700">
          <span className="material-symbols-outlined text-[10rem]">shopping_cart_checkout</span>
      </div>

      <div className="relative z-10">
        <header className="flex items-center justify-between mb-12">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-primary tracking-tighter">
                    Resumo do Pedido
                </h2>
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-200"></span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Validação via Backend Supabase
                    </p>
                </div>
            </div>
            <div className="bg-slate-50 px-5 py-2.5 rounded-2xl">
                <p className="text-sm font-black text-slate-400">
                    <span className="text-primary">{items.length}</span> {items.length === 1 ? 'ITEM' : 'ITENS'}
                </p>
            </div>
        </header>

        {/* Listagem Estilizada dos Itens */}
        <div className="space-y-8 mb-12">
          <AnimatePresence mode="popLayout">
            {items.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, ease: "easeOut" }}
                className="flex justify-between items-start group/item"
              >
                <div className="flex flex-col max-w-[70%]">
                    <span className="text-slate-800 font-extrabold text-xl group-hover/item:text-primary transition-colors duration-300">
                        {item.name}
                    </span>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-1.5 grayscale group-hover/item:grayscale-0 transition-all">
                        <span className="material-symbols-outlined text-xs">fingerprint</span>
                        {item.service_id}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-black text-slate-900 tracking-tighter">
                        {formatCurrency(item.price, item.currency)}
                    </p>
                    {/* Badge de preço unitário caso queira evidenciar o tipo de moeda */}
                    <span className="text-[10px] text-slate-300 font-black uppercase">Taxa única</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Seção do Total com Design de Alto Impacto */}
        <footer className="pt-12 border-t-4 border-double border-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
                <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">Total Final</p>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-600 font-bold">verified_user</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 max-w-[160px] leading-tight opacity-70">
                        Preços auditados e protegidos por criptografia de banco.
                    </p>
                </div>
            </div>
            
            <div className="text-right">
                <motion.p 
                    layoutId="totalPrice"
                    className="text-6xl font-black text-primary tracking-tighter"
                >
                    {formatCurrency(total, items[0]?.currency)}
                </motion.p>
                <p className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest">A pagar agora</p>
            </div>
          </div>
        </footer >
      </div>
    </motion.div>
  );
};

export default CheckoutSummary;
