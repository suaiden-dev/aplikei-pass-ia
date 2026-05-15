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
          // if parent lookup fails, keep local fallback route
        }
      }

      setThreads(
        eligible.map((row) => {
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

          return {
            processId,
            userId: row.user_id as string,
            serviceSlug,
            processRouteId: routeId,
            processRouteSlug: routeSlug,
            chatTitle: getAnalysisChatTitle(serviceSlug),
            createdAt: row.created_at as string,
            chatClosedAt: closedMap.get(processId) ?? null,
            lastMessage: lastMsgByProcess.get(processId) ?? null,
          };
        }),
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
