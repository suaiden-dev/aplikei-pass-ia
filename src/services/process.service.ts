import { getServiceBySlug } from "../data/services";
import { MOTION_STEPS_TEMPLATE, RFE_STEPS_TEMPLATE } from "../data/workflowTemplates";
import type { ProcessStatus, UserService } from "../models/process.model";
import { readChatMessages, readUserServices, writeUserServices } from "../mocks/customer-portal";
import { notificationService } from "./notification.service";
import { getSupabaseClient } from "../lib/supabase";
import { workflowService } from "./workflow.service";

export type { UserService };

function updateProcess(serviceId: string, updater: (service: UserService) => UserService) {
  const services = readUserServices();
  const index = services.findIndex((entry) => entry.id === serviceId);

  if (index === -1) {
    throw new Error("Serviço não encontrado");
  }

  services[index] = updater(services[index]);
  writeUserServices(services);
  return services[index];
}

export function getAnalysisChatTitle(serviceSlug?: string): string {
  return getServiceBySlug(serviceSlug ?? "")?.title ?? "Especialista";
}

export function isAnalysisServiceSlug(serviceSlug?: string): boolean {
  if (!serviceSlug) return false;
  const slug = serviceSlug.toLowerCase();
  return slug.startsWith("analise-") || slug.startsWith("mentoria-") || slug.startsWith("consultoria-");
}

export const processService = {
  async getUserServices(userId: string): Promise<UserService[]> {
    const legacy = readUserServices()
      .filter((entry) => entry.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    try {
      const supabase = getSupabaseClient();
      if (!supabase) return legacy;

      const instances = await workflowService.listInstances(userId);
      if (instances.length === 0) return legacy;

      const { data: products } = await supabase
        .schema("aplikei")
        .from("products")
        .select("id, slug");
      const productMap = new Map((products || []).map(p => [p.id, p.slug]));

      const workflowServices: UserService[] = await Promise.all(instances.map(async (inst) => {
        const slug = productMap.get(inst.product_id) || "unknown";
        const steps = await workflowService.getSteps(inst.id);

        const idx = steps.findIndex(s => !['approved', 'skipped', 'completed', 'in_review'].includes(s.status));
        const current_step = idx === -1 ? Math.max(0, steps.length - 1) : idx;

        const step_data: Record<string, unknown> = {};
        for (const s of steps) {
          if (s.data) Object.assign(step_data, s.data);
        }

        let status: UserService["status"] = "active";
        if (inst.status === "approved") status = "completed";
        if (inst.status === "canceled") status = "canceled";
        if (inst.status === "rejected") status = "rejected";

        return {
          id: inst.id,
          user_id: inst.user_id,
          service_slug: slug,
          status,
          current_step,
          step_data,
          created_at: inst.created_at,
          updated_at: inst.updated_at,
        } as UserService;
      }));

      // Merge: workflow instances take precedence; deduplicate by instance id.
      const seenIds = new Set<string>();
      const merged: UserService[] = [];
      for (const s of [...workflowServices, ...legacy]) {
        if (!seenIds.has(s.id)) {
          seenIds.add(s.id);
          merged.push(s);
        }
      }
      return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (err) {
      console.warn("Failed to fetch workflow services:", err);
      return legacy;
    }
  },

  async hasActiveService(userId: string, slug: string): Promise<boolean> {
    const services = await this.getUserServices(userId);
    return services.some((entry) => entry.service_slug === slug && ["active", "awaiting_review"].includes(entry.status));
  },

  async hasChatMessages(processId: string): Promise<boolean> {
    return readChatMessages().some((message) => message.process_id === processId);
  },

  async ensureChatThread(processId: string, senderId: string, content: string): Promise<boolean> {
    const alreadyExists = await this.hasChatMessages(processId);
    if (alreadyExists) {
      return false;
    }

    const services = readUserServices();
    const process = services.find((entry) => entry.id === processId);
    if (!process) {
      return false;
    }

    void senderId;
    void content;
    return true;
  },

  async hasAnyActiveProcess(userId: string): Promise<{ hasActive: boolean; activeSlug?: string }> {
    const services = await this.getUserServices(userId);
    const active = services.find((entry) => ["active", "awaiting_review"].includes(entry.status));
    return active ? { hasActive: true, activeSlug: active.service_slug } : { hasActive: false };
  },

  async getUserServiceBySlug(userId: string, slug: string): Promise<UserService | null> {
    const services = await this.getUserServices(userId);
    return services.find((entry) => entry.service_slug === slug) ?? null;
  },

  async getServiceById(id: string): Promise<UserService | null> {
    // Check legacy mock first (fast path)
    const legacy = readUserServices().find((entry) => entry.id === id);
    if (legacy) return legacy;

    // Fetch from Supabase workflow instances by instance id
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return null;

      const { data: inst, error } = await supabase
        .schema("aplikei")
        .from("user_product_instances")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !inst) return null;

      const { data: products } = await supabase
        .schema("aplikei")
        .from("products")
        .select("id, slug")
        .eq("id", inst.product_id)
        .maybeSingle();

      const slug = (products as { slug?: string } | null)?.slug ?? "unknown";
      const steps = await workflowService.getSteps(inst.id);

      const idx = steps.findIndex(
        (s) => !["approved", "skipped", "completed", "in_review"].includes(s.status)
      );
      const current_step = idx === -1 ? Math.max(0, steps.length - 1) : idx;

      const step_data: Record<string, unknown> = {};
      for (const s of steps) {
        if (s.data) Object.assign(step_data, s.data);
      }

      let status: UserService["status"] = "active";
      if (inst.status === "approved") status = "completed";
      if (inst.status === "canceled") status = "canceled";
      if (inst.status === "rejected") status = "rejected";

      return {
        id: inst.id,
        user_id: inst.user_id,
        service_slug: slug,
        status,
        current_step,
        step_data,
        created_at: inst.created_at,
        updated_at: inst.updated_at,
      } as UserService;
    } catch {
      return null;
    }
  },

  async requestStepReview(serviceId: string): Promise<void> {
    const process = updateProcess(serviceId, (entry) => ({
      ...entry,
      status: "awaiting_review",
      updated_at: new Date().toISOString(),
    }));

    await notificationService.notifyAdmin({
      title: "Etapa enviada para revisão",
      body: `O cliente concluiu uma etapa de ${getAnalysisChatTitle(process.service_slug)}.`,
      serviceId: process.id,
      userId: process.user_id,
      link: `/dashboard/processes/${process.service_slug}?id=${process.id}`,
    });
  },

  async approveStep(
    serviceId: string,
    nextStep: number,
    isFinal = false,
    result?: "approved" | "denied",
    additionalData?: Record<string, unknown>,
  ): Promise<void> {
    const process = updateProcess(serviceId, (entry) => ({
      ...entry,
      current_step: nextStep,
      status: isFinal ? "completed" : "active",
      updated_at: new Date().toISOString(),
      step_data: {
        ...entry.step_data,
        ...additionalData,
        ...(result ? { motion_final_result: result } : {}),
      },
    }));

    await notificationService.notifyClient({
      userId: process.user_id,
      title: isFinal ? "Processo concluído" : "Etapa aprovada",
      body: isFinal ? "Seu processo foi concluído com sucesso." : "Você já pode avançar para a próxima etapa.",
      serviceId: process.id,
      link: `/dashboard/processes/${process.service_slug}?id=${process.id}`,
    });
  },

  async rejectStep(serviceId: string, isFinal = false, result?: "approved" | "denied"): Promise<void> {
    updateProcess(serviceId, (entry) => ({
      ...entry,
      status: isFinal ? "completed" : "active",
      updated_at: new Date().toISOString(),
      step_data: {
        ...entry.step_data,
        ...(result ? { motion_final_result: result } : {}),
      },
    }));
  },

  async updateStepData(serviceId: string, data: Record<string, unknown>): Promise<void> {
    updateProcess(serviceId, (entry) => ({
      ...entry,
      updated_at: new Date().toISOString(),
      step_data: {
        ...entry.step_data,
        ...data,
      },
    }));
  },

  async startAdditionalWorkflow(processId: string, type: "motion" | "rfe"): Promise<void> {
    updateProcess(processId, (entry) => {
      const history = Array.isArray(entry.step_data.history) ? [...(entry.step_data.history as Array<Record<string, unknown>>)] : [];
      history.push({
        id: crypto.randomUUID(),
        type,
        current_step: 0,
        steps: type === "motion" ? MOTION_STEPS_TEMPLATE : RFE_STEPS_TEMPLATE,
        started_at: new Date().toISOString(),
      });

      return {
        ...entry,
        updated_at: new Date().toISOString(),
        step_data: {
          ...entry.step_data,
          history,
        },
      };
    });
  },

  async updateProcessStatus(serviceId: string, status: string): Promise<void> {
    updateProcess(serviceId, (entry) => ({
      ...entry,
      status: status as ProcessStatus,
      updated_at: new Date().toISOString(),
    }));
  },
};
