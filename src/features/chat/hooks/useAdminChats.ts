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
      console.info(`${debugPrefix} load start`, {
        role,
        officeId,
        disableLoad,
      });

      if (role === "manager" && !officeId) {
        console.warn(`${debugPrefix} manager without officeId, returning empty chat list`);
        setThreads([]);
        setUnreadByProcess({});
        return;
      }

      if (role === "manager" && officeId) {
        const { data: chatRows, error: chatError } = await supabase
          .from("chat_messages")
          .select("process_id, sender_role, created_at")
          .order("created_at", { ascending: true });
        if (chatError) throw new Error(chatError.message);

        const chatProcessIds = Array.from(
          new Set((chatRows || []).map((row: Record<string, unknown>) => String(row.process_id || "")).filter(Boolean)),
        );
        console.info(`${debugPrefix} manager chat messages loaded`, {
          total: chatRows?.length ?? 0,
          processIds: chatProcessIds,
          officeId,
        });

        if (!chatProcessIds.length) {
          setThreads([]);
          setUnreadByProcess({});
          return;
        }

        const { data: officeCustomersRows, error: officeCustomersError } = await supabase
          .from("office_customers" as any)
          .select("user_id")
          .eq("office_id", officeId);
        if (officeCustomersError) throw new Error(officeCustomersError.message);

        const customerUserIds = Array.from(
          new Set(
            ((officeCustomersRows || []) as Array<{ user_id: string }>)
              .map((row) => String(row.user_id || "").trim())
              .filter(Boolean),
          ),
        );

        const [directServicesRes, customerServicesRes] = await Promise.all([
          supabase
            .from("user_services")
            .select("id, user_id, office_id, service_slug, status, step_data, created_at")
            .eq("office_id", officeId)
            .order("created_at", { ascending: false }),
          customerUserIds.length > 0
            ? supabase
                .from("user_services")
                .select("id, user_id, office_id, service_slug, status, step_data, created_at")
                .in("user_id", customerUserIds)
                .order("created_at", { ascending: false })
            : Promise.resolve({ data: [], error: null }),
        ]);

        if (directServicesRes.error) throw new Error(directServicesRes.error.message);
        if (customerServicesRes.error) throw new Error(customerServicesRes.error.message);

        const mergedServicesById = new Map<string, Record<string, unknown>>();
        ((directServicesRes.data || []) as Array<Record<string, unknown>>).forEach((row) => {
          mergedServicesById.set(String(row.id), row);
        });
        ((customerServicesRes.data || []) as Array<Record<string, unknown>>).forEach((row) => {
          mergedServicesById.set(String(row.id), row);
        });

        const officeServices = Array.from(mergedServicesById.values());
        const services = officeServices.filter((row) => {
          const stepData = (row.step_data as Record<string, unknown>) || {};
          const parentProcessId = String(stepData.parent_process_id || "").trim();
          const ownProcessId = String(row.id || "").trim();
          return chatProcessIds.includes(ownProcessId) || (parentProcessId && chatProcessIds.includes(parentProcessId));
        });
        console.info(`${debugPrefix} manager office services matched`, {
          officeServicesTotal: officeServices.length,
          officeCustomersTotal: customerUserIds.length,
          total: services.length,
          officeId,
        });

        if (!services.length) {
          setThreads([]);
          setUnreadByProcess({});
          return;
        }

        const userIds = Array.from(
          new Set(services.map((row) => String(row.user_id || "")).filter(Boolean)),
        );
        const { data: accountRows, error: accountError } = await supabase
          .from("user_accounts")
          .select("id, full_name, email, avatar_url")
          .in("id", userIds);
        if (accountError) throw new Error(accountError.message);

        const accountsById = new Map<string, Record<string, unknown>>();
        (accountRows || []).forEach((row: Record<string, unknown>) => {
          accountsById.set(String(row.id), row);
        });

        const unread: Record<string, number> = {};
        const lastMessageAtByProcess: Record<string, string> = {};
        const seenThreads = new Set<string>();
        services.forEach((row) => {
          const stepData = (row.step_data as Record<string, unknown>) || {};
          const parentProcessId = String(stepData.parent_process_id || "").trim();
          const threadProcessId = parentProcessId || String(row.id);
          if (!seenThreads.has(threadProcessId)) {
            seenThreads.add(threadProcessId);
            unread[threadProcessId] = 0;
          }
        });
        (chatRows || []).forEach((row: Record<string, unknown>) => {
          const processId = String(row.process_id || "");
          if (!unread.hasOwnProperty(processId)) return;
          const createdAt = row.created_at as string | undefined;
          if (createdAt) {
            const prev = lastMessageAtByProcess[processId];
            if (!prev || new Date(createdAt).getTime() > new Date(prev).getTime()) {
              lastMessageAtByProcess[processId] = createdAt;
            }
          }
          if (row.sender_role === "admin") {
            unread[processId] = 0;
          } else if (row.sender_role === "customer") {
            unread[processId] = (unread[processId] || 0) + 1;
          }
        });
        setUnreadByProcess(unread);

        const result: SpecialistChatThread[] = [];
        const addedThreads = new Set<string>();
        services.forEach((row) => {
          const stepData = (row.step_data as Record<string, unknown>) || {};
          const parentProcessId = String(stepData.parent_process_id || "").trim();
          const processId = parentProcessId || String(row.id);
          if (addedThreads.has(processId)) return;
          addedThreads.add(processId);
          const account = accountsById.get(String(row.user_id)) as Record<string, unknown> | undefined;
          result.push({
            processId,
            userId: String(row.user_id),
            officeId: (row.office_id as string | null | undefined) ?? null,
            serviceSlug: String(row.service_slug),
            chatTitle: getAnalysisChatTitle(String(row.service_slug)),
            fullName: (account?.full_name as string | undefined) || "Sem Nome",
            email: (account?.email as string | undefined) || "",
            avatarUrl: (account?.avatar_url as string | null | undefined) ?? null,
            createdAt: lastMessageAtByProcess[processId] || String(row.created_at),
          });
        });

        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        console.info(`${debugPrefix} manager load complete`, {
          totalThreads: result.length,
          officeId,
        });
        setThreads(result);
        return;
      }

      let servicesQuery = supabase
        .from("user_services")
        .select(`
          id,
          user_id,
          office_id,
          service_slug,
          status,
          step_data,
<<<<<<< HEAD
          created_at,
          offices:office_id (
            name
          ),
          user_accounts:user_id (
            id,
            full_name,
            email,
            avatar_url
          )
=======
          created_at
>>>>>>> 8f12b72097710038d6eb94297c64879d634cc8ba
        `);

      const { data: serviceRows, error: serviceError } = await servicesQuery.order("created_at", { ascending: false });
      if (serviceError) throw new Error(serviceError.message);

      const services = (serviceRows || []) as Array<Record<string, unknown>>;
      console.info(`${debugPrefix} services loaded`, {
        total: services.length,
        manager: role === "manager",
        officeId,
      });

      if (!services.length) {
        console.info(`${debugPrefix} no services found`);
        setThreads([]);
        setUnreadByProcess({});
        return;
      }

      const resolvedServices = services.map((row) => {
        const stepData = (row.step_data as Record<string, unknown>) || {};
        const parentProcessId = String(stepData.parent_process_id || "").trim();
        return {
          row,
          threadProcessId: parentProcessId || (row.id as string),
        };
      });

      const userIds = Array.from(
        new Set(services.map((row) => String(row.user_id || "")).filter(Boolean)),
      );
      console.info(`${debugPrefix} resolved user ids`, {
        total: userIds.length,
        userIds,
      });

      const { data: accountRows, error: accountError } = await supabase
        .from("user_accounts")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);

      if (accountError) throw new Error(accountError.message);

      const accountsById = new Map<string, Record<string, unknown>>();
      (accountRows || []).forEach((row: Record<string, unknown>) => {
        accountsById.set(String(row.id), row);
      });

      const fallbackOfficeByUserId = new Map<string, string>();
      services.forEach((row) => {
        const userId = String(row.user_id || "").trim();
        const serviceOfficeId = String(row.office_id || "").trim();
        if (userId && serviceOfficeId && !fallbackOfficeByUserId.has(userId)) {
          fallbackOfficeByUserId.set(userId, serviceOfficeId);
        }
      });

      const processIds = Array.from(new Set(resolvedServices.map(({ threadProcessId }) => threadProcessId)));
      console.info(`${debugPrefix} resolved thread process ids`, {
        total: processIds.length,
        processIds,
      });

      const { data: chatRows, error: chatError } = await supabase
        .from("chat_messages")
        .select("process_id, sender_role, created_at")
        .in("process_id", processIds)
        .order("created_at", { ascending: true });
      if (chatError) throw new Error(chatError.message);

      console.info(`${debugPrefix} chat messages loaded`, {
        total: chatRows?.length ?? 0,
        matchedProcessIds: Array.from(
          new Set((chatRows || []).map((row: Record<string, unknown>) => String(row.process_id))),
        ),
      });

      const activeProcessIds = new Set(
        (chatRows || []).map((row: Record<string, unknown>) => row.process_id as string),
      );

      const unread: Record<string, number> = {};
      const lastMessageAtByProcess: Record<string, string> = {};
      processIds.forEach((id) => { unread[id] = 0; });
      (chatRows || []).forEach((row: Record<string, unknown>) => {
        const processId = row.process_id as string;
        const createdAt = row.created_at as string | undefined;
        if (createdAt) {
          const prev = lastMessageAtByProcess[processId];
          if (!prev || new Date(createdAt).getTime() > new Date(prev).getTime()) {
            lastMessageAtByProcess[processId] = createdAt;
          }
        }
        if (row.sender_role === "admin") {
          unread[processId] = 0;
        } else if (row.sender_role === "customer") {
          unread[processId] = (unread[processId] || 0) + 1;
        }
      });
      setUnreadByProcess(unread);

      const result: SpecialistChatThread[] = [];
      const seenThreads = new Set<string>();
      resolvedServices.forEach(({ row, threadProcessId }) => {
        const eligible = isCustomerChatEligible({
          id: row.id as string,
          user_id: row.user_id as string,
          service_slug: row.service_slug as string,
          status: row.status as string,
          step_data: (row.step_data as Record<string, unknown>) || {},
          current_step: (row.current_step as number | null) ?? null,
          created_at: row.created_at as string,
          updated_at: row.created_at as string,
        } as UserService);
        if (!activeProcessIds.has(threadProcessId) && !eligible) {
          console.info(`${debugPrefix} skipped thread: inactive and not eligible`, {
            threadProcessId,
            serviceSlug: row.service_slug,
            status: row.status,
          });
          return;
        }

<<<<<<< HEAD
        const account = row.user_accounts as Record<string, unknown> | undefined;
        const office = row.offices as Record<string, unknown> | undefined;
        if (!account) return;
=======
        const account = accountsById.get(String(row.user_id)) as Record<string, unknown> | undefined;
        const processOfficeId = String(row.office_id || "").trim();
        const fallbackOfficeId = fallbackOfficeByUserId.get(String(row.user_id)) || "";
        const effectiveOfficeId = processOfficeId || fallbackOfficeId;
        if (role === "manager" && officeId && effectiveOfficeId !== officeId) {
          console.info(`${debugPrefix} filtered by officeId`, {
            threadProcessId,
            processOfficeId,
            fallbackOfficeId,
            effectiveOfficeId,
            officeId,
            userId: row.user_id,
            serviceSlug: row.service_slug,
          });
          return;
        }
        if (seenThreads.has(threadProcessId)) {
          console.info(`${debugPrefix} skipped duplicate thread`, { threadProcessId });
          return;
        }
        seenThreads.add(threadProcessId);
>>>>>>> 8f12b72097710038d6eb94297c64879d634cc8ba

        result.push({
          processId: threadProcessId,
          userId: row.user_id as string,
          officeId: (row.office_id as string | null | undefined) ?? null,
          serviceSlug: row.service_slug as string,
          officeName: (office?.name as string | undefined) || "Office",
          chatTitle: getAnalysisChatTitle(row.service_slug as string),
          fullName: (account?.full_name as string | undefined) || "Sem Nome",
          email: (account?.email as string | undefined) || "",
          avatarUrl: (account?.avatar_url as string | null | undefined) ?? null,
          createdAt: lastMessageAtByProcess[threadProcessId] || (row.created_at as string),
        });
      });

      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      console.info(`${debugPrefix} load complete`, {
        totalThreads: result.length,
        unreadKeys: Object.keys(unread).length,
        role,
        officeId,
      });
      setThreads(result);
    } catch (err) {
      console.error("[useAdminChats] load error:", {
        message: err instanceof Error ? err.message : String(err),
        error: err,
      });
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
