import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { isCustomerChatEligible, getAnalysisChatTitle } from "../lib/eligibility";
import type { SpecialistChatThread } from "../types";
import type { UserService } from "../../process/types";

export function useCustomerChats(userId: string) {
  const [threads, setThreads] = useState<SpecialistChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_services")
        .select("id, user_id, service_slug, status, step_data, created_at")
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

      if (!eligible.length) {
        setThreads([]);
        return;
      }

      const processIds = eligible.map((r) => r.id as string);

      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("process_id, content, created_at")
        .in("process_id", processIds)
        .order("created_at", { ascending: false });

      const lastMsgByProcess = new Map<string, string>();
      (msgs || []).forEach((m: Record<string, unknown>) => {
        if (!lastMsgByProcess.has(m.process_id as string)) {
          lastMsgByProcess.set(m.process_id as string, m.content as string);
        }
      });

      const closedMap = new Map<string, string | null>();
      try {
        const { data: closedRows } = await supabase
          .from("user_services")
          .select("id, chat_closed_at")
          .in("id", processIds);
        (closedRows || []).forEach((r: Record<string, unknown>) =>
          closedMap.set(r.id as string, (r.chat_closed_at as string | null) ?? null),
        );
      } catch {
        // column not yet migrated — treat all as open
      }

      setThreads(
        eligible.map((row) => ({
          processId: row.id as string,
          userId: row.user_id as string,
          serviceSlug: row.service_slug as string,
          chatTitle: getAnalysisChatTitle(row.service_slug as string),
          createdAt: row.created_at as string,
          chatClosedAt: closedMap.get(row.id as string) ?? null,
          lastMessage: lastMsgByProcess.get(row.id as string) ?? null,
        })),
      );
    } catch (err) {
      console.error("[useCustomerChats] load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { threads, isLoading, reload: load };
}
