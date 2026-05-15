// chat_messages table não está no schema gerado — definido manualmente conforme migration
export interface ChatMessage {
  id: string;
  process_id: string;
  sender_id: string;
  sender_role: "admin" | "customer";
  content: string;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  created_at: string;
}

export interface SpecialistChatThread {
  processId: string;
  userId: string;
  serviceSlug: string;
  processRouteId?: string;
  processRouteSlug?: string;
  chatTitle: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
  createdAt: string;
  chatClosedAt?: string | null;
  lastMessage?: string | null;
}
