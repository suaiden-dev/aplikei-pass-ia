import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@shared/lib/supabase";
import { chatService } from "../services/chatService";
import type { ChatMessage, Conversation } from "../types";

export function useChat(
  processId: string,
  officeId?: string | null,
  loggedInUserId?: string,
  role?: "admin" | "customer",
  conversationId?: string
) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadMessages = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      const msgs = await chatService.getMessages(conversationId);
      setMessages(msgs);
      return true;
    } catch (err) {
      console.error("[useChat] loadMessages error:", err);
      return false;
    }
  }, []);

  // Inicializa/Resolve a conversa ativa
  useEffect(() => {
    let active = true;
    setIsLoading(true);

    const resolveConversation = async () => {
      try {
        // 0. Se conversationId foi passado, tenta carregar diretamente
        if (conversationId) {
          const { data: directConv } = await supabase
            .from("conversations")
            .select("*")
            .eq("id", conversationId)
            .maybeSingle();

          if (directConv) {
            if (active) setConversation(directConv as Conversation);
            return;
          }
        }

        // 1. Tenta buscar conversa ativa existente
        const { data: activeConv } = await supabase
          .from("conversations")
          .select("*")
          .eq("process_id", processId)
          .eq("is_closed", false)
          .maybeSingle();

        if (activeConv) {
          if (active) setConversation(activeConv as Conversation);
          return;
        }

        // 2. Se não houver ativa, busca a conversa encerrada mais recente
        const { data: closedConv } = await supabase
          .from("conversations")
          .select("*")
          .eq("process_id", processId)
          .eq("is_closed", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (closedConv) {
          if (active) setConversation(closedConv as Conversation);
          return;
        }

        // 3. Se não existir nenhuma, precisamos criar uma nova ativa
        let targetCustomerId = loggedInUserId;

        // Se quem está abrindo é admin, precisamos descobrir o customerId a partir de user_services
        if (role === "admin" || !targetCustomerId) {
          const { data: service } = await supabase
            .from("user_services")
            .select("user_id")
            .eq("id", processId)
            .maybeSingle();
          
          if (service?.user_id) {
            targetCustomerId = service.user_id;
          }
        }

        if (targetCustomerId) {
          const newConv = await chatService.getOrCreateConversation(
            processId,
            targetCustomerId,
            officeId
          );
          if (active) setConversation(newConv);
        } else {
          throw new Error("Could not resolve customer ID to create conversation");
        }
      } catch (err) {
        console.error("[useChat] resolveConversation error:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void resolveConversation();

    return () => {
      active = false;
    };
  }, [processId, officeId, loggedInUserId, role, conversationId]);

  // Carrega mensagens e se inscreve no Realtime após a conversa ser estabelecida
  useEffect(() => {
    if (!conversation) return;

    let active = true;
    const conversationId = conversation.id;

    const startChat = async () => {
      const canSubscribe = await loadMessages(conversationId);
      if (!active || !canSubscribe) return;

      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
      }

      channelRef.current = chatService.subscribeToMessages(
        conversationId,
        (payload) => {
          if (active) {
            setMessages((prev) => {
              // Evita duplicados em inserções rápidas
              if (prev.some((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          }
        }
      );
    };

    void startChat();

    return () => {
      active = false;
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversation, loadMessages]);

  const sendMessage = useCallback(
    async (params: {
      content: string;
      senderId: string;
      senderRole: "admin" | "customer";
      file?: File;
    }): Promise<void> => {
      if (!conversation) {
        throw new Error("No active conversation found to send message");
      }
      setIsSending(true);
      try {
        await chatService.sendMessage({
          conversationId: conversation.id,
          senderId: params.senderId,
          senderRole: params.senderRole,
          content: params.content,
          file: params.file,
        });
      } finally {
        setIsSending(false);
      }
    },
    [conversation],
  );

  const reload = useCallback(async () => {
    if (conversation) {
      await loadMessages(conversation.id);
    }
  }, [conversation, loadMessages]);

  return { messages, isLoading: isLoading || !conversation, isSending, sendMessage, reload };
}

