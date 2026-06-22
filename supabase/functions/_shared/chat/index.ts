import type { Supabase } from "../core/supabase.ts";

export type SenderRole = "admin" | "customer";

export interface ChatMessage {
  id: string;
  process_id: string;
  sender_id: string;
  sender_role: SenderRole;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  office_id: string | null;
  created_at: string;
}

export interface SendMessageInput {
  processId: string;
  senderId: string;
  senderRole: SenderRole;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

export interface GetMessagesOptions {
  limit?: number;
  before?: string; // ISO timestamp for cursor-based pagination
}

export async function sendMessage(
  supabase: Supabase,
  input: SendMessageInput,
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      process_id:  input.processId,
      sender_id:   input.senderId,
      sender_role: input.senderRole,
      content:     input.content,
      file_url:    input.fileUrl  ?? null,
      file_name:   input.fileName ?? null,
      file_type:   input.fileType ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ChatMessage;
}

export async function getMessages(
  supabase: Supabase,
  processId: string,
  options: GetMessagesOptions = {},
): Promise<ChatMessage[]> {
  const { limit = 50, before } = options;

  let query = supabase
    .from("chat_messages")
    .select("*")
    .eq("process_id", processId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

export async function closeChat(
  supabase: Supabase,
  processId: string,
): Promise<void> {
  const { error } = await supabase
    .from("user_services")
    .update({ chat_closed_at: new Date().toISOString() })
    .eq("id", processId)
    .is("chat_closed_at", null);

  if (error) throw error;
}

export async function reopenChat(
  supabase: Supabase,
  processId: string,
): Promise<void> {
  const { error } = await supabase
    .from("user_services")
    .update({ chat_closed_at: null })
    .eq("id", processId);

  if (error) throw error;
}

export async function isChatOpen(
  supabase: Supabase,
  processId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_services")
    .select("chat_closed_at")
    .eq("id", processId)
    .maybeSingle();

  if (error) throw error;
  return (data as { chat_closed_at: string | null } | null)?.chat_closed_at == null;
}

export function subscribeToMessages(
  supabase: Supabase,
  processId: string,
  onMessage: (message: ChatMessage) => void,
) {
  return supabase
    .channel(`chat:${processId}`)
    .on(
      "postgres_changes",
      {
        event:  "INSERT",
        schema: "public",
        table:  "chat_messages",
        filter: `process_id=eq.${processId}`,
      },
      (payload: { new: ChatMessage }) => onMessage(payload.new),
    )
    .subscribe();
}
