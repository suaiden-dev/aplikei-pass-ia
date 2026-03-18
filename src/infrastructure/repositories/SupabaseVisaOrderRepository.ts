import { IVisaOrderRepository } from "@/application/ports/IVisaOrderRepository";
import { supabase } from "@/integrations/supabase/client";
import { CreateVisaOrderDTO, VisaOrder, UpdateVisaOrderDTO } from "@/domain/payment/PaymentEntities";

export class SupabaseVisaOrderRepository implements IVisaOrderRepository {
  async createOrder(orderData: CreateVisaOrderDTO): Promise<{ id: string } | null> {
    const { data, error } = await supabase
      .from("visa_orders")
      .insert([orderData])
      .select("id")
      .single();

    if (error) {
       console.error("[SupabaseVisaOrderRepository] Erro ao criar visa_order:", error);
       return null;
    }
    return { id: data?.id };
  }

  async findLatestByProductAndUser(productSlug: string, userId: string, email: string): Promise<VisaOrder | null> {
    const { data, error } = await supabase
      .from("visa_orders")
      .select("*")
      .eq("product_slug", productSlug)
      .or(`user_id.eq.${userId},client_email.eq.${email}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as VisaOrder | null;
  }

  async updateOrder(id: string, data: UpdateVisaOrderDTO): Promise<void> {
    const { error } = await supabase
      .from("visa_orders")
      .update(data)
      .eq("id", id);

    if (error) throw error;
  }
}
