export interface Conversation {
  id: string;
  office_id: string | null;
  customer_id: string;
  process_id: string;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: "admin" | "customer";
  content: string;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  created_at: string;
}

export interface SpecialistChatThread {
  conversationId: string;
  processId: string;
  userId: string;
  officeId?: string | null;
  serviceSlug: string;
  officeName?: string;
  processRouteId?: string;
  processRouteSlug?: string;
  chatTitle: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
  createdAt: string;
  isClosed: boolean;
  chatClosedAt?: string | null;
  lastMessage?: string | null;
  unreadCount?: number;
}




