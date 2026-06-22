import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@shared/lib/supabase";
import { isCustomerChatEligible, getAnalysisChatTitle, isMentoriaService, buildMentoriaChatTitle } from "../services/eligibility";
import type { SpecialistChatThread } from "../types";
import type { UserService } from "../../process/types";

type ConversationRow = {
  id: string;
  process_id: string;
  office_id: string | null;
  created_at: string;
  updated_at?: string | null;
  is_closed: boolean;
};

type ServiceRow = {
  id: string;
  user_id: string;
  office_id: string | null;
  service_slug: string;
  step_data: Record<string, unknown> | null;
  created_at: string;
};

type AccountRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type ConversationMessageRow = {
  id: string;
  conversation_id: string;
  sender_role: string;
  created_at: string;
  content: string;
};

interface UseAdminChatsOptions {
  role?: string | null;
  officeId?: string | null;
  disableLoad?: boolean;
}

export function useAdminChats(options: UseAdminChatsOptions = {}) {
  const { role, officeId, disableLoad = false } = options;
  const [threads, setThreads] = useState<SpecialistChatThread[]>([]);
  const [unreadByProcess, setUnreadByProcess] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const debugPrefix = "[useAdminChats]";

  const load = useCallback(async () => {
    if (disableLoad) {
      setThreads([]);
      setUnreadByProcess({});
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      console.info(`${debugPrefix} load start`, { role, officeId, disableLoad });

      if (role === "manager" && !officeId) {
        console.warn(`${debugPrefix} manager without officeId, returning empty chat list`);
        setThreads([]);
        setUnreadByProcess({});
        return;
      }

      // 1. Carrega todas as conversas físicas
      let convsQuery = supabase.from("conversations").select("*");
      if (role === "manager" && officeId) {
        convsQuery = convsQuery.eq("office_id", officeId);
      }
      const { data: convs, error: convsError } = await convsQuery;
      if (convsError) throw new Error(convsError.message);

      const conversations = (convs ?? []) as ConversationRow[];

      if (conversations.length === 0) {
        setThreads([]);
        setUnreadByProcess({});
        return;
      }

      const processIds = conversations.map((c) => c.process_id);
      const conversationIds = conversations.map((c) => c.id);

      // 2. Busca informações dos processos vinculados na user_services
      const { data: serviceRows, error: serviceError } = await supabase
        .from("user_services")
        .select("id, user_id, office_id, service_slug, status, step_data, created_at")
        .in("id", processIds);
      if (serviceError) throw new Error(serviceError.message);

      const servicesById = new Map<string, ServiceRow>();
      (serviceRows || []).forEach((row) => {
        servicesById.set(row.id, row);
      });

      // 3. Busca informações de perfis dos clientes (user_accounts)
      const userIds = Array.from(
        new Set((serviceRows || []).map((row) => String(row.user_id || "")).filter(Boolean)),
      );
      const { data: accountRows, error: accountError } = await supabase
        .from("user_accounts")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);
      if (accountError) throw new Error(accountError.message);

      const accountsById = new Map<string, AccountRow>();
      (accountRows || []).forEach((row) => {
        accountsById.set(row.id, row);
      });

      // 4. Busca mensagens das novas conversas para calcular o último horário e os não lidos
      const { data: messageRows, error: messagesError } = await supabase
        .from("conversation_messages")
        .select("id, conversation_id, sender_role, created_at, content")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: true });
      if (messagesError) throw new Error(messagesError.message);

      const unread: Record<string, number> = {};
      const lastMessageAtByConv = new Map<string, string>();
      const lastMessageContentByConv = new Map<string, string>();

      conversations.forEach((c) => {
        unread[c.id] = 0;
      });

      const convById = new Map<string, ConversationRow>();
      conversations.forEach((c) => convById.set(c.id, c));

      // Ordena explicitamente por ordem cronológica (antiga -> nova) para garantir
      // que a lógica de "zerar" ao encontrar mensagem do admin funcione perfeitamente
      const sortedMessages = [...(messageRows || []) as ConversationMessageRow[]].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      sortedMessages.forEach((msg) => {
        const conv = convById.get(msg.conversation_id);
        if (!conv) return;

        const createdAt = msg.created_at as string;

        lastMessageAtByConv.set(conv.id, createdAt);
        lastMessageContentByConv.set(conv.id, msg.content);

        // Recupera a última mensagem que o admin visualizou no navegador para esta conversa
        const lastReadMsgId = typeof window !== "undefined" ? localStorage.getItem(`chat_last_read:${conv.id}`) : null;

        if (msg.sender_role === "admin") {
          // Quando o admin envia uma mensagem, zera as mensagens não lidas anteriores
          unread[conv.id] = 0;
          // E também marca esta do admin como última lida implicitamente
          if (typeof window !== "undefined") {
            localStorage.setItem(`chat_last_read:${conv.id}`, msg.id);
          }
        } else {
          // Se o ID da mensagem atual for menor ou igual ao que já foi lido pelo admin, ignoramos
          if (lastReadMsgId) {
            // Em Javascript, se a mensagem atual tem data anterior ou igual à mensagem lida, não contamos
            // Mas para ser 100% à prova de falhas: achamos o índice da mensagem lida
            const readMsgIndex = sortedMessages.findIndex((m) => m.id === lastReadMsgId);
            const currentMsgIndex = sortedMessages.findIndex((m) => m.id === msg.id);
            if (readMsgIndex !== -1 && currentMsgIndex <= readMsgIndex) {
              unread[conv.id] = 0;
              return;
            }
          }
          // Incrementa as mensagens não lidas apenas se forem do cliente e não estiverem marcadas como lidas
          unread[conv.id] = (unread[conv.id] || 0) + 1;
        }
      });

      setUnreadByProcess(unread);

      // 5. Monta as threads
      const result: SpecialistChatThread[] = [];
      conversations.forEach((c) => {
        const service = servicesById.get(c.process_id);
        if (!service) return; // Processo não encontrado

        const account = accountsById.get(service.user_id);
        const lastMsgTime = lastMessageAtByConv.get(c.id) || c.created_at;

        const stepData = (service.step_data || {}) as Record<string, unknown>;
        const isMentoria = isMentoriaService(service.service_slug);
        let chatTitle: string;
        if (isMentoria) {
          const parentServiceSlug = String(stepData.parent_service_slug || "").trim();
          chatTitle = buildMentoriaChatTitle(service.service_slug, parentServiceSlug);
        } else {
          const purchases = Array.isArray(stepData.purchases)
            ? (stepData.purchases as Array<Record<string, unknown>>)
            : [];
          const mentoriaPurchaseSlug = purchases
            .map((p) => String(p?.slug || p?.service_slug || "").toLowerCase())
            .find((s) => isMentoriaService(s) || s.startsWith("consultoria-") || s.startsWith("consultancy-"));
          chatTitle = mentoriaPurchaseSlug
            ? buildMentoriaChatTitle(mentoriaPurchaseSlug, service.service_slug)
            : getAnalysisChatTitle(service.service_slug);
        }

        result.push({
          conversationId: c.id,
          processId: c.process_id,
          userId: service.user_id,
          officeId: c.office_id,
          serviceSlug: service.service_slug,
          officeName: "Office",
          chatTitle,
          fullName: account?.full_name || "Sem Nome",
          email: account?.email || "",
          avatarUrl: account?.avatar_url || null,
          createdAt: lastMsgTime,
          isClosed: c.is_closed,
          chatClosedAt: c.is_closed ? (c.updated_at || new Date().toISOString()) : null,
          lastMessage: lastMessageContentByConv.get(c.id) || null,
        });

      });

      // Ordena por data da última mensagem descendente
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      console.info(`${debugPrefix} load complete`, { totalThreads: result.length });
      setThreads(result);
    } catch (err) {
      console.error("[useAdminChats] load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [disableLoad, officeId, role]);

  useEffect(() => {
    if (disableLoad) {
      setThreads([]);
      setUnreadByProcess({});
      setIsLoading(false);
      return;
    }

    void load();

    channelRef.current = supabase
      .channel(`chat:all:${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversation_messages" },
        (payload) => {
          console.info("[useAdminChats] Realtime INSERT on conversation_messages:", payload);
          void load();
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversations" },
        (payload) => {
          console.info("[useAdminChats] Realtime INSERT on conversations:", payload);
          void load();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversations" },
        (payload) => {
          console.info("[useAdminChats] Realtime UPDATE on conversations:", payload);
          void load();
        },
      )
      .subscribe((status) => {
        console.info("[useAdminChats] Realtime subscription status:", status);
      });

    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [disableLoad, load]);

  const closeChat = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from("conversations")
      .update({ is_closed: true })
      .eq("id", conversationId);
    if (error) throw new Error(error.message);
  }, []);

  const reopenChat = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from("conversations")
      .update({ is_closed: false })
      .eq("id", conversationId);
    if (error) throw new Error(error.message);
  }, []);

  const getChatClosedAt = useCallback(async (conversationId: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from("conversations")
      .select("is_closed, updated_at")
      .eq("id", conversationId)
      .maybeSingle();
    
    if (error || !data) return null;
    return data.is_closed ? (data.updated_at || new Date().toISOString()) : null;
  }, []);

  return {
    threads,
    unreadByProcess,
    isLoading,
    reload: load,
    closeChat,
    reopenChat,
    getChatClosedAt,
  };
}
