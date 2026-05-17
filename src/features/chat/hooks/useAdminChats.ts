import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@shared/lib/supabase";
import { isCustomerChatEligible, getAnalysisChatTitle } from "../services/eligibility";
import type { SpecialistChatThread } from "../types";
import type { UserService } from "../../process/types";

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

  const load = useCallback(async () => {
    if (disableLoad) {
      setThreads([]);
      setUnreadByProcess({});
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      let query = supabase
        .from("user_services")
        .select(`
          id,
          user_id,
          service_slug,
          status,
          office_id,
          step_data,
          created_at,
          user_accounts:user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `);

      if (role === "manager") {
        if (!officeId) {
          setThreads([]);
          setUnreadByProcess({});
          setIsLoading(false);
          return;
        }
        query = query.eq("office_id", officeId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      const services = (data || []) as Array<Record<string, unknown>>;
      const candidates = services.filter((row) =>
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

      if (!candidates.length) {
        setThreads([]);
        return;
      }

      const processIds = candidates.map((row) => row.id as string);

      const { data: chatRows, error: chatError } = await supabase
        .from("chat_messages")
        .select("process_id, sender_role, created_at")
        .in("process_id", processIds)
        .order("created_at", { ascending: true });

      if (chatError) throw new Error(chatError.message);

      const activeProcessIds = new Set(
        (chatRows || []).map((row: Record<string, unknown>) => row.process_id as string),
      );

      const unread: Record<string, number> = {};
      processIds.forEach((id) => { unread[id] = 0; });
      (chatRows || []).forEach((row: Record<string, unknown>) => {
        if (row.sender_role === "admin") {
          unread[row.process_id as string] = 0;
        } else if (row.sender_role === "customer") {
          unread[row.process_id as string] = (unread[row.process_id as string] || 0) + 1;
        }
      });
      setUnreadByProcess(unread);

      const result: SpecialistChatThread[] = [];
      candidates.forEach((row) => {
        if (!activeProcessIds.has(row.id as string)) return;
        const account = row.user_accounts as Record<string, unknown> | undefined;
        if (!account) return;

        result.push({
          processId: row.id as string,
          userId: row.user_id as string,
          serviceSlug: row.service_slug as string,
          chatTitle: getAnalysisChatTitle(row.service_slug as string),
          fullName: (account.full_name as string | undefined) || "Sem Nome",
          email: (account.email as string | undefined) || "",
          avatarUrl: (account.avatar_url as string | null | undefined) ?? null,
          createdAt: row.created_at as string,
        });
      });

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
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => { void load(); },
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [disableLoad, load]);

  const closeChat = useCallback(async (processId: string) => {
    const { error } = await supabase
      .from("user_services")
      .update({ chat_closed_at: new Date().toISOString() })
      .eq("id", processId);
    if (error) throw new Error(error.message);
  }, []);

  const reopenChat = useCallback(async (processId: string) => {
    const { error } = await supabase
      .from("user_services")
      .update({ chat_closed_at: null })
      .eq("id", processId);
    if (error) throw new Error(error.message);
  }, []);

  const getChatClosedAt = useCallback(async (processId: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from("user_services")
      .select("chat_closed_at")
      .eq("id", processId)
      .single();
    if (error) return null;
    return (data as Record<string, unknown> | null)?.chat_closed_at as string | null ?? null;
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
