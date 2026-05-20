import { supabase } from "@shared/lib/supabase";
import type { ChatMessage } from "../types";

export const chatService = {
  async getMessages(processId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("process_id", processId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data as ChatMessage[] | null) ?? [];
  },

  subscribeToMessages(
    processId: string,
    onInsert: (payload: { new: ChatMessage }) => void,
  ) {
    return supabase
      .channel(`chat:${processId}:${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `process_id=eq.${processId}`,
        },
        (payload) => onInsert({ new: payload.new as ChatMessage }),
      )
      .subscribe();
  },

  async sendMessage(params: {
    processId: string;
    officeId?: string | null;
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
      const path = `chat/${params.processId}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(path, params.file);
      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from("profiles").getPublicUrl(path);
      fileUrl = data.publicUrl;
      fileName = params.file.name;
      fileType = params.file.type;
    }

    const { error } = await supabase.from("chat_messages").insert({
      process_id: params.processId,
      office_id: params.officeId ?? null,
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
