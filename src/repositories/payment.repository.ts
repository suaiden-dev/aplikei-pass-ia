import { supabase } from '../lib/supabase';
import type { Order, OrderCreateInput, ZellePayment, DiscountCoupon } from '../models';

export const paymentRepository = {
  async findOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[paymentRepository.findOrderById]', error);
      return null;
    }

    return data as Order;
  },

  async findOrdersByUser(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[paymentRepository.findOrdersByUser]', error);
      return [];
    }

    return (data as Order[]) ?? [];
  },

  async findOrdersBySlug(productSlug: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('product_slug', productSlug)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[paymentRepository.findOrdersBySlug]', error);
      return [];
    }

    return (data as Order[]) ?? [];
  },

  async createOrder(order: OrderCreateInput): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (error) {
      console.error('[paymentRepository.createOrder]', error);
      return null;
    }

    return data as Order;
  },

  async updateOrderStatus(id: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[paymentRepository.updateOrderStatus]', error);
      return false;
    }

    return true;
  },

  async findZellePaymentById(id: string): Promise<ZellePayment | null> {
    const { data, error } = await supabase
      .from('zelle_payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[paymentRepository.findZellePaymentById]', error);
      return null;
    }

    return data as ZellePayment;
  },

  async findZellePaymentsByUser(userId: string): Promise<ZellePayment[]> {
    const { data, error } = await supabase
      .from('zelle_payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[paymentRepository.findZellePaymentsByUser]', error);
      return [];
    }

    return (data as ZellePayment[]) ?? [];
  },

  async createZellePayment(payment: Omit<ZellePayment, 'id' | 'created_at' | 'updated_at'>): Promise<ZellePayment | null> {
    const { data, error } = await supabase
      .from('zelle_payments')
      .insert(payment)
      .select()
      .single();

    if (error) {
      console.error('[paymentRepository.createZellePayment]', error);
      return null;
    }

    return data as ZellePayment;
  },

  async updateZellePaymentStatus(id: string, status: string, adminNotes?: string): Promise<boolean> {
    const update: Record<string, unknown> = { status };
    if (status === 'approved') {
      update.admin_approved_at = new Date().toISOString();
    }
    if (adminNotes) {
      update.admin_notes = adminNotes;
    }

    const { error } = await supabase
      .from('zelle_payments')
      .update(update)
      .eq('id', id);

    if (error) {
      console.error('[paymentRepository.updateZellePaymentStatus]', error);
      return false;
    }

    return true;
  },

  async findCouponByCode(code: string): Promise<DiscountCoupon | null> {
    const { data, error } = await supabase
      .from('discount_coupons')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      console.error('[paymentRepository.findCouponByCode]', error);
      return null;
    }

    return data as DiscountCoupon;
  },

  async incrementCouponUses(id: string): Promise<boolean> {
    const { error } = await supabase.rpc('increment_coupon_uses', { coupon_id: id });

    if (error) {
      console.error('[paymentRepository.incrementCouponUses]', error);
      return false;
    }

    return true;
  },

  async getServicePrices(): Promise<Record<string, boolean>> {
    const { data, error } = await supabase
      .from('services_prices')
      .select('service_id, is_active');

    if (error) {
      console.error('[paymentRepository.getServicePrices]', error);
      return {};
    }

    const result: Record<string, boolean> = {};
    (data as { service_id: string; is_active: boolean }[] | null)?.forEach((p) => {
      result[p.service_id] = p.is_active;
    });

    return result;
  },
};
