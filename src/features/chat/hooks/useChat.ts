import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@shared/lib/supabase";
import type { ChatMessage } from "../types";

export function useChat(processId: string, officeId?: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadMessages = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("process_id", processId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data as ChatMessage[]) ?? []);
      return true;
    } catch (err) {
      console.error("[useChat] loadMessages error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [processId]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    const start = async () => {
      const canSubscribe = await loadMessages();
      if (!active || !canSubscribe) return;

      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
      }

      channelRef.current = supabase
        .channel(`chat:${processId}:${crypto.randomUUID()}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `process_id=eq.${processId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as ChatMessage]);
          },
        )
        .subscribe();
    };

    void start();

    return () => {
      active = false;
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [processId, loadMessages]);

  const sendMessage = useCallback(
    async (params: {
      content: string;
      senderId: string;
      senderRole: "admin" | "customer";
      file?: File;
    }): Promise<void> => {
      setIsSending(true);
      try {
        let fileUrl: string | null = null;
        let fileName: string | null = null;
        let fileType: string | null = null;

        if (params.file) {
          const ext = params.file.name.split(".").pop();
          const path = `chat/${processId}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("profiles")
            .upload(path, params.file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage.from("profiles").getPublicUrl(path);
          fileUrl = data.publicUrl;
          fileName = params.file.name;
          fileType = params.file.type;
        }

        const { error } = await supabase.from("chat_messages").insert({
          process_id: processId,
          office_id: officeId ?? null,
          content: params.content,
          sender_id: params.senderId,
          sender_role: params.senderRole,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
          created_at: new Date().toISOString(),
        });

        if (error) throw new Error(error.message);
      } finally {
        setIsSending(false);
      }
    },
    [officeId, processId],
  );

  return { messages, isLoading, isSending, sendMessage, reload: loadMessages };
}
