import { useState, useEffect, useCallback } from "react";
import { supabase } from "@shared/lib/supabase";
import { isCustomerChatEligible, getAnalysisChatTitle } from "../services/eligibility";
import type { SpecialistChatThread } from "../types";
import type { UserService } from "../../process/types";

export function useCustomerChats(userId: string) {
  const [threads, setThreads] = useState<SpecialistChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setThreads([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_services")
        .select("id, user_id, office_id, service_slug, status, step_data, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      const services = (data || []) as Array<Record<string, unknown>>;
      const eligible = services.filter((row) =>
        isCustomerChatEligible({
          id: row.id as string,
          user_id: row.user_id as string,
          service_slug: row.service_slug as string,
          status: row.status as string,
          step_data: (row.step_data as Record<string, unknown>) || {},
          current_step: (row.current_step as number | null) ?? null,
          created_at: row.created_at as string,
          updated_at: row.created_at as string,
        } as UserService),
      );

      const parentProcessIds = Array.from(
        new Set(
          eligible
            .map((row) => {
              const stepData = (row.step_data as Record<string, unknown>) || {};
              return String(stepData.parent_process_id || "").trim();
            })
            .filter(Boolean),
        ),
      );
      const messageProcessIds = Array.from(
        new Set(
          eligible.map((row) => {
            const stepData = (row.step_data as Record<string, unknown>) || {};
            const parentProcessId = String(stepData.parent_process_id || "").trim();
            return parentProcessId || (row.id as string);
          }),
        ),
      );

      // 1. Busca conversas físicas para estes processos
      const { data: convsByProcess } = await supabase
        .from("conversations")
        .select("id, process_id, is_closed")
        .in("process_id", messageProcessIds);

      const { data: convsByCustomer } = await supabase
        .from("conversations")
        .select("id, process_id, is_closed")
        .eq("customer_id", userId);

      // --- AUTO-ENSURE CHAT THREADS FOR ELIGIBLE SERVICES ---
      let neededReload = false;
      for (const row of eligible) {
        const processId = row.id as string;
        const stepData = (row.step_data as Record<string, unknown>) || {};
        const parentProcessId = String(stepData.parent_process_id || "").trim();
        const targetProcessId = parentProcessId || processId;

        const hasConv = (convsByProcess || []).some(c => c.process_id === targetProcessId) || 
                        (convsByCustomer || []).some(c => c.process_id === targetProcessId);

        if (!hasConv) {
          const { ensureChatThread } = await import("../../process/services/processOps");
          await ensureChatThread(
            targetProcessId,
            userId,
            "Olá! Fale com o especialista sobre o seu processo.",
            true
          );
          neededReload = true;
        }
      }

      let activeConvsByProcess = convsByProcess;
      let activeConvsByCustomer = convsByCustomer;

      if (neededReload) {
        const { data: freshConvsByProcess } = await supabase
          .from("conversations")
          .select("id, process_id, is_closed")
          .in("process_id", messageProcessIds);

        const { data: freshConvsByCustomer } = await supabase
          .from("conversations")
          .select("id, process_id, is_closed")
          .eq("customer_id", userId);

        activeConvsByProcess = freshConvsByProcess;
        activeConvsByCustomer = freshConvsByCustomer;
      }

      const convsMap = new Map<string, { id: string; process_id: string; is_closed: boolean }>();
      (activeConvsByProcess || []).forEach((c: any) => {
        convsMap.set(c.id, c);
      });
      (activeConvsByCustomer || []).forEach((c: any) => {
        convsMap.set(c.id, c);
      });
      const convs = Array.from(convsMap.values());

      const convMap = new Map<string, { id: string; is_closed: boolean }>();
      (convs || []).forEach((c: any) => {
        convMap.set(c.process_id, { id: c.id, is_closed: c.is_closed });
      });
      const serviceById = new Map<string, Record<string, unknown>>();
      services.forEach((row) => serviceById.set(String(row.id), row));
      const childRecoverySlugByParentId = new Map<string, string>();
      services.forEach((row) => {
        const stepData = (row.step_data as Record<string, unknown>) || {};
        const parentId = String(stepData.parent_process_id || "").trim();
        if (!parentId) return;
        const slug = String(row.service_slug || "").toLowerCase();
        if (slug.includes("rfe") || slug.includes("motion")) {
          childRecoverySlugByParentId.set(parentId, String(row.service_slug || ""));
        }
      });

      // 2. Busca mensagens das conversas existentes para calcular o último horário, mensagem e as não lidas
      const lastMsgByConv = new Map<string, string>();
      const lastMessageAtByConv = new Map<string, string>();
      const unreadCountByConv = new Map<string, number>();
      const conversationIds = convs.map((c) => c.id);

      if (conversationIds.length > 0) {
        const { data: msgs } = await supabase
          .from("conversation_messages")
          .select("id, conversation_id, content, sender_role, created_at")
          .in("conversation_id", conversationIds);

        const msgsGrouped = new Map<string, any[]>();
        (msgs || []).forEach((m: any) => {
          if (!msgsGrouped.has(m.conversation_id)) {
            msgsGrouped.set(m.conversation_id, []);
          }
          msgsGrouped.get(m.conversation_id)!.push(m);
        });

        msgsGrouped.forEach((convMsgs, convId) => {
          // Ordena explicitamente por ordem cronológica (antiga -> nova)
          const sorted = [...convMsgs].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          // Recupera o ID da última mensagem que o cliente leu no navegador
          const lastReadMsgId = typeof window !== "undefined" ? localStorage.getItem(`chat_last_read:${convId}`) : null;

          let unread = 0;
          sorted.forEach((m) => {
            if (m.sender_role === "customer") {
              // Se o próprio cliente mandar mensagem, zera as não lidas dele
              unread = 0;
              if (typeof window !== "undefined") {
                localStorage.setItem(`chat_last_read:${convId}`, m.id);
              }
            } else {
              // Se o ID desta mensagem do admin for menor ou igual ao que o cliente já leu, ignoramos
              if (lastReadMsgId) {
                const readIndex = sorted.findIndex((sm) => sm.id === lastReadMsgId);
                const currentIndex = sorted.findIndex((sm) => sm.id === m.id);
                if (readIndex !== -1 && currentIndex <= readIndex) {
                  unread = 0;
                  return;
                }
              }
              // Se for o admin/outro, incrementa o contador de não lidas do cliente
              unread++;
            }
          });

          unreadCountByConv.set(convId, unread);

          if (sorted.length > 0) {
            const lastMsg = sorted[sorted.length - 1];
            lastMsgByConv.set(convId, lastMsg.content);
            lastMessageAtByConv.set(convId, lastMsg.created_at);
          }
        });
      }

      const parentServiceSlugById = new Map<string, string>();
      if (parentProcessIds.length > 0) {
        try {
          const { data: parentRows } = await supabase
            .from("user_services")
            .select("id, service_slug")
            .in("id", parentProcessIds);

          (parentRows || []).forEach((row: Record<string, unknown>) => {
            parentServiceSlugById.set(String(row.id), String(row.service_slug));
          });
        } catch {
          // fallback
        }
      }

      const result = eligible.map((row) => {
        const processId = row.id as string;
        const serviceSlug = row.service_slug as string;
        const stepData = (row.step_data as Record<string, unknown>) || {};
        const parentProcessId = String(stepData.parent_process_id || "").trim();
        const parentServiceSlug = String(stepData.parent_service_slug || "").trim();
        const routeId = parentProcessId || processId;
        const routeSlug =
          parentServiceSlug ||
          parentServiceSlugById.get(routeId) ||
          serviceSlug;

        const conv = convMap.get(routeId);
        const lastMsgTime = conv ? (lastMessageAtByConv.get(conv.id) || (row.created_at as string)) : (row.created_at as string);

        return {
          conversationId: conv?.id || "",
          processId,
          userId: row.user_id as string,
          officeId: (row.office_id as string | null | undefined) ?? null,
          serviceSlug,
          processRouteId: routeId,
          processRouteSlug: routeSlug,
          chatTitle: getAnalysisChatTitle(serviceSlug),
          createdAt: lastMsgTime,
          isClosed: conv?.is_closed ?? false,
          chatClosedAt: conv?.is_closed ? (row.created_at as string) : null,
          lastMessage: conv ? (lastMsgByConv.get(conv.id) ?? null) : null,
          unreadCount: conv ? (unreadCountByConv.get(conv.id) ?? 0) : 0,
        };
      });

      // Fallback: inclui conversas do cliente que não aparecem via elegibilidade de user_services
      const routeIdsInResult = new Set(result.map((r) => r.processRouteId));
      convs.forEach((c: any) => {
        const routeId = String(c.process_id || "").trim();
        if (!routeId || routeIdsInResult.has(routeId)) return;

        const serviceRow = serviceById.get(routeId);
        const serviceSlug = String(serviceRow?.service_slug || "support");
        const chatSlug = childRecoverySlugByParentId.get(routeId) || serviceSlug;
        const createdAt = convMap.get(routeId)
          ? (lastMessageAtByConv.get(c.id) || String(serviceRow?.created_at || new Date().toISOString()))
          : String(serviceRow?.created_at || new Date().toISOString());

        result.push({
          conversationId: c.id,
          processId: routeId,
          userId,
          officeId: (serviceRow?.office_id as string | null | undefined) ?? null,
          serviceSlug,
          processRouteId: routeId,
          processRouteSlug: serviceSlug,
          chatTitle: getAnalysisChatTitle(chatSlug),
          createdAt,
          isClosed: Boolean(c.is_closed),
          chatClosedAt: c.is_closed ? createdAt : null,
          lastMessage: lastMsgByConv.get(c.id) ?? null,
          unreadCount: unreadCountByConv.get(c.id) ?? 0,
        });
      });

      // Agrupa pelo processo de destino (routeId) para que múltiplos processos Bronze de testes antigos
      // que mapeiam para a mesma conversa reativa não gerem linhas duplicadas na barra lateral
      const uniqueResultsMap = new Map<string, typeof result[0]>();
      result.forEach((item) => {
        const key = item.processRouteId;
        // Se ainda não adicionamos, ou se este item tem uma data de mensagem mais recente, mantemos
        if (!uniqueResultsMap.has(key)) {
          uniqueResultsMap.set(key, item);
        } else {
          const existing = uniqueResultsMap.get(key)!;
          if (new Date(item.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
            uniqueResultsMap.set(key, item);
          }
        }
      });

      const finalThreads = Array.from(uniqueResultsMap.values());

      // Ordena por data da última mensagem descendente para garantir que o chat suba ao topo
      finalThreads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setThreads(finalThreads);
    } catch (err) {
      console.error("[useCustomerChats] load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();

    // Cria canal de escuta em tempo real para re-renderizar caso cheguem novas mensagens
    const channel = supabase
      .channel(`chat:customer:${userId}:${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversation_messages" },
        () => {
          void load();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversations" },
        () => {
          void load();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, load]);

  return { threads, isLoading, reload: load };
}
