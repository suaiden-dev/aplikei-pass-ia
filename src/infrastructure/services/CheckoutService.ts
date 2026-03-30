import { supabase } from "@/integrations/supabase/client";

export interface ServicePrice {
  id: string;
  service_id: string;
  name: string;
  price: number;
  currency: string;
}

/**
 * Busca os preços reais dos serviços e upsells no Supabase com base nos IDs.
 * A lógica garante que o preço final venha sempre do backend para segurança.
 */
export const fetchVerifiedPrices = async (ids: string[]): Promise<{ total: number; items: ServicePrice[] }> => {
  if (!ids || ids.length === 0) {
    return { total: 0, items: [] };
  }

  // Consulta direta ao Supabase utilizando os IDs de serviço únicos
  const { data, error } = await supabase
    .from('services_prices')
    .select('id, service_id, name, price, currency')
    .in('service_id', ids);

  if (error) {
    console.error("Error fetching prices:", error);
    throw new Error(`Ocorreu um problema ao validar os preços: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('Nenhum dos serviços selecionados foi encontrado em nossa base de preços.');
  }

  // Se nenhum item foi encontrado, erro
  if (!data || data.length === 0) {
    throw new Error("Nenhum preço encontrado para os IDs informados.");
  }

  // Mapear os resultados para os IDs originais (preservando frequência/quantidades)
  const resultItems = ids.map(id => {
    const priceInfo = data.find(d => d.service_id === id);
    if (!priceInfo) throw new Error(`Preço não encontrado para o item: ${id}`);
    return priceInfo;
  });

  const total = resultItems.reduce((sum, item) => sum + Number(item.price), 0);

  // Mapear para uma lista compacta para o UI (com quantidades)
  const itemsWithQuantity = Array.from(new Set(ids)).map(id => {
    const priceInfo = data.find(d => d.service_id === id)!;
    return {
      ...priceInfo,
      quantity: ids.filter(i => i === id).length
    };
  });

  return { total, items: itemsWithQuantity as any[] };
};
