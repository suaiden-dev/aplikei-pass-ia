import { supabase } from "@shared/lib/supabase";
import type { ChatMessage, Conversation } from "../types";

export const chatService = {
  // Retorna a conversa ativa de um processo ou cria se não existir
  async getOrCreateConversation(
    processId: string,
    customerId: string,
    officeId?: string | null,
  ): Promise<Conversation> {
    const { data: active } = await supabase
      .from("conversations")
      .select("*")
      .eq("process_id", processId)
      .eq("is_closed", false)
      .maybeSingle();

    if (active) return active as Conversation;

    let finalOfficeId = officeId ?? null;
    if (!finalOfficeId) {
      // 1. Tenta buscar da conta do cliente
      const { data: account } = await supabase
        .from("user_accounts")
        .select("office_id")
        .eq("id", customerId)
        .maybeSingle();
      if (account?.office_id) {
        finalOfficeId = account.office_id;
      }
    }

    if (!finalOfficeId) {
      // 2. Tenta buscar de qualquer outro serviço do cliente que possua office_id não-nulo
      const { data: otherServices } = await supabase
        .from("user_services")
        .select("office_id")
        .eq("user_id", customerId)
        .not("office_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (otherServices && otherServices.length > 0) {
        finalOfficeId = otherServices[0].office_id;
      }
    }

    const { data: created, error } = await supabase
      .from("conversations")
      .insert({
        process_id: processId,
        customer_id: customerId,
        office_id: finalOfficeId,
        is_closed: false,
      })
      .select()
      .single();



    if (error) throw new Error(error.message);
    return created as Conversation;
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from("conversation_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data as ChatMessage[] | null) ?? [];
  },

  subscribeToMessages(
    conversationId: string,
    onInsert: (payload: { new: ChatMessage }) => void,
  ) {
    return supabase
      .channel(`chat:${conversationId}:${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => onInsert({ new: payload.new as ChatMessage }),
      )
      .subscribe();
  },

  async sendMessage(params: {
    conversationId: string;
    senderId: string;
    senderRole: "admin" | "customer";
    content: string;
    file?: File;
  }): Promise<void> {
    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileType: string | null = null;

    if (params.file) {
      const ext = params.file.name.split(".").pop();
      const path = `chat/${params.conversationId}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(path, params.file);
      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from("profiles").getPublicUrl(path);
      fileUrl = data.publicUrl;
      fileName = params.file.name;
      fileType = params.file.type;
    }

    const { error } = await supabase.from("conversation_messages").insert({
      conversation_id: params.conversationId,
      content: params.content,
      sender_id: params.senderId,
      sender_role: params.senderRole,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      created_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
  },
};



