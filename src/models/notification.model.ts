export type NotificationTargetRole = 'admin' | 'customer';

export interface Notification {
  id: string;
  user_id: string | null;
  target_role: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  email_sent: boolean;
  send_email: boolean;
  created_at: string;
}

export interface NotificationCreateInput {
  user_id?: string | null;
  target_role: string;
  title: string;
  message: string;
  link?: string | null;
  is_read?: boolean;
  email_sent?: boolean;
  send_email?: boolean;
}

export type NotificationTemplate =
  | 'admin_message'
  | 'step_approved'
  | 'step_rejected_feedback'
  | 'process_completed_approved'
  | 'process_completed_denied'
  | 'new_chat_message'
  | 'payment_received'
  | 'payment_failed';

export interface NotifyAdminOptions {
  title: string;
  body: string;
  serviceId?: string;
  userId?: string;
  link?: string;
}

export interface NotifyClientOptions {
  userId: string;
  template?: NotificationTemplate;
  title?: string;
  body?: string;
  serviceId?: string;
  link?: string;
  templateData?: Record<string, string>;
}
