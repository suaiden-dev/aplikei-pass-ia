export type ChatMessageRole = 'customer' | 'admin' | 'ai';

export interface ChatMessage {
  id: string;
  process_id: string;
  sender_id: string | null;
  sender_role: string;
  content: string;
  created_at: string;
}

export interface ChatMessageCreateInput {
  process_id: string;
  sender_id?: string | null;
  sender_role?: string;
  content: string;
  created_at?: string;
}

export interface ChatThread {
  processId: string;
  serviceSlug: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
}
