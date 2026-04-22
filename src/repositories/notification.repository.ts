import { supabase } from '../lib/supabase';
import type { Notification, NotificationCreateInput } from '../models';

export const notificationRepository = {
  async create(notification: NotificationCreateInput): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.error('[notificationRepository.create]', error);
      return null;
    }

    return data as Notification;
  },

  async findByUser(userId: string, limit = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[notificationRepository.findByUser]', error);
      return [];
    }

    return (data as Notification[]) ?? [];
  },

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[notificationRepository.findUnreadByUser]', error);
      return [];
    }

    return (data as Notification[]) ?? [];
  },

  async markAsRead(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('[notificationRepository.markAsRead]', error);
      return false;
    }

    return true;
  },

  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('[notificationRepository.markAllAsRead]', error);
      return false;
    }

    return true;
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('[notificationRepository.getUnreadCount]', error);
      return 0;
    }

    return count ?? 0;
  },

  async createAdminNotification(params: {
    title: string;
    message: string;
    link?: string;
    send_email?: boolean;
  }): Promise<Notification | null> {
    return this.create({
      target_role: 'admin',
      title: params.title,
      message: params.message,
      link: params.link ?? null,
      send_email: params.send_email ?? false,
      is_read: false,
      email_sent: false,
    });
  },

  async createClientNotification(params: {
    userId: string;
    title: string;
    message: string;
    link?: string;
    send_email?: boolean;
  }): Promise<Notification | null> {
    return this.create({
      user_id: params.userId,
      target_role: 'customer',
      title: params.title,
      message: params.message,
      link: params.link ?? null,
      send_email: params.send_email ?? false,
      is_read: false,
      email_sent: false,
    });
  },
};
