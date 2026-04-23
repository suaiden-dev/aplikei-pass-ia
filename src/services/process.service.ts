import { processRepository } from "../repositories";
import { notificationService } from "./notification.service";
import { getServiceBySlug } from "../data/services";
import { MOTION_STEPS_TEMPLATE, RFE_STEPS_TEMPLATE } from "../data/workflowTemplates";
import type { UserService } from "../models";

export type { UserService };

export function getAnalysisChatTitle(serviceSlug?: string): string {
  if (!serviceSlug) return "Especialista";

  const meta = getServiceBySlug(serviceSlug);
  const slug = serviceSlug.toLowerCase();
  const title = (meta?.title || "").toLowerCase();

  if (slug.includes("motion") || title.includes("motion")) return "Especialista Motion";
  if (slug.includes("rfe") || title.includes("rfe")) return "Especialista RFE";
  if (slug === "troca-status" || title.includes("(cos)")) return "Especialista COS";
  if (slug === "extensao-status" || title.includes("(eos)")) return "Especialista EOS";
  if (slug.includes("cos") || title.includes("cos")) return "Especialista COS";
  if (title.includes("especialista")) return meta?.title || "Especialista";

  return meta?.title || "Especialista";
}

export function isAnalysisServiceSlug(serviceSlug?: string): boolean {
  if (!serviceSlug) return false;
  const meta = getServiceBySlug(serviceSlug);
  const title = (meta?.title || "").toLowerCase();
  const processType = (meta?.processType || "").toLowerCase();

  return (
    serviceSlug.toLowerCase().startsWith("analise-") ||
    title.includes("análise") ||
    title.includes("revisão") ||
    processType.includes("análise")
  );
}

function getProcessLink(serviceSlug: string): string {
  return `/dashboard/processes/${serviceSlug}`;
}

function getStepTitles(serviceSlug: string, currentStep: number | null, nextStep?: number) {
  const serviceMeta = getServiceBySlug(serviceSlug);

  return {
    serviceName: serviceMeta?.title ?? serviceSlug,
    currentTitle: currentStep != null ? serviceMeta?.steps[currentStep]?.title ?? "" : "",
    nextTitle: nextStep != null ? serviceMeta?.steps[nextStep]?.title ?? "" : "",
  };
}

export const processService = {
  async getUserServices(userId: string): Promise<UserService[]> {
    return processRepository.findByUser(userId);
  },

  async hasActiveService(userId: string, slug: string): Promise<boolean> {
    const services = await processRepository.findActiveByUser(userId, [slug]);
    return services.length > 0;
  },

  async hasChatMessages(processId: string): Promise<boolean> {
    return processRepository.hasChatMessages(processId);
  },

  async ensureChatThread(processId: string, senderId: string, content: string): Promise<boolean> {
    const alreadyExists = await this.hasChatMessages(processId);
    if (alreadyExists) return false;

    return processRepository.createChatMessage({
      process_id: processId,
      sender_id: senderId,
      sender_role: "customer",
      content,
    });
  },

  async hasAnyActiveProcess(userId: string): Promise<{ hasActive: boolean; activeSlug?: string }> {
    const services = await processRepository.findActiveByUser(userId);

    if (services.length === 0) return { hasActive: false };

    const trulyActive = services.filter(proc => {
      if (
        proc.service_slug?.toLowerCase().startsWith("analise-") ||
        proc.service_slug?.toLowerCase().startsWith("mentoria-") ||
        proc.service_slug?.toLowerCase().startsWith("consultoria-") ||
        proc.service_slug?.toLowerCase().startsWith("dependente-adicional-")
      ) return false;

      const stepData = (proc.step_data || {}) as Record<string, unknown>;
      const currentStep = proc.current_step ?? 0;

      const uscisResult = stepData.uscis_official_result as string;
      const rfeResult = stepData.uscis_rfe_result as string;
      const motionResult = stepData.motion_final_result as string;
      const interviewResult = stepData.interview_outcome as string;

      const isApproved = uscisResult === 'approved' || rfeResult === 'approved' || motionResult === 'approved' || interviewResult === 'approved' || proc.status === 'completed';
      const isDenied = proc.status === 'rejected' || proc.status === 'denied' || motionResult === 'denied' || interviewResult === 'rejected' ||
                       (rfeResult === 'denied' && currentStep >= 18 && !uscisResult) ||
                       (uscisResult === 'denied' && currentStep >= 12 && !rfeResult && !motionResult);

      return !isApproved && !isDenied;
    });

    return { hasActive: trulyActive.length > 0, activeSlug: trulyActive[0]?.service_slug };
  },

  async getUserServiceBySlug(userId: string, slug: string): Promise<UserService | null> {
    return processRepository.findByUserAndSlug(userId, slug);
  },

  async getServiceById(id: string): Promise<UserService | null> {
    return processRepository.findById(id);
  },

  async requestStepReview(serviceId: string): Promise<void> {
    if (!serviceId) throw new Error("ID do serviço é obrigatório.");

    const service = await processRepository.findById(serviceId);
    if (!service) throw new Error("Serviço não encontrado");

    await processRepository.updateStatus(serviceId, 'awaiting_review');

    const { serviceName, currentTitle } = getStepTitles(service.service_slug, service.current_step);
    await notificationService.notifyAdmin({
      title: "Acao necessaria: revisar etapa",
      body: currentTitle
        ? `O cliente concluiu a etapa "${currentTitle}" de ${serviceName} e aguarda sua revisao.`
        : `O cliente concluiu uma etapa de ${serviceName} e aguarda sua revisao.`,
      serviceId: serviceId,
      userId: service.user_id,
      link: `/admin/processes/${serviceId}`,
    });

    await notificationService.notifyClient({
      userId: service.user_id,
      template: "admin_message",
      title: "Estamos Revisando! 📝",
      body: "Sua etapa foi enviada com sucesso para nossa equipe de análise. Aguarde a validação.",
      serviceId: serviceId,
      link: getProcessLink(service.service_slug),
    });
  },

  async approveStep(
    serviceId: string,
    nextStep: number,
    isFinal: boolean = false,
    result?: 'approved' | 'denied',
    additionalData?: Record<string, unknown>
  ): Promise<void> {
    if (!serviceId) throw new Error("ID do serviço é obrigatório.");

    const service = await processRepository.findById(serviceId);
    if (!service) throw new Error("Serviço não encontrado");

    const newStepData: Record<string, unknown> = {
      ...(service.step_data as Record<string, unknown> || {}),
      ...additionalData,
    };
    delete newStepData['admin_feedback'];
    delete newStepData['rejected_at'];

    if (isFinal && result) {
      newStepData.motion_final_result = result;
    }

    await processRepository.updateStepData(serviceId, newStepData);
    await processRepository.updateStep(serviceId, nextStep, isFinal ? "completed" : "active");

    try {
      const { serviceName, currentTitle, nextTitle } = getStepTitles(service.service_slug, service.current_step, nextStep);
      await notificationService.notifyClient({
        userId: service.user_id,
        template: isFinal ? "process_completed_approved" : "step_approved",
        serviceId: serviceId,
        templateData: isFinal
          ? { service_name: serviceName }
          : {
              step_name: currentTitle,
              next_step_name: nextTitle,
              service_name: serviceName,
            },
        link: getProcessLink(service.service_slug),
      });
    } catch (e) {
      console.warn("[processService] Notify client of approval failed:", e);
    }
  },

  async rejectStep(serviceId: string, isFinal: boolean = false, result?: 'approved' | 'denied'): Promise<void> {
    if (!serviceId) throw new Error("ID do serviço é obrigatório.");

    const service = await processRepository.findById(serviceId);
    if (!service) throw new Error("Serviço não encontrado");

    const updateData: Record<string, unknown> = {
      status: isFinal ? "completed" : "active",
    };

    if (isFinal && result) {
      updateData.step_data = {
        ...(service.step_data as object || {}),
        motion_final_result: result,
      };
    }

    if (isFinal && result) {
      await processRepository.updateStepData(serviceId, updateData.step_data as Record<string, unknown>);
    }
    const newStatus = isFinal ? "completed" : "active";
    await processRepository.updateStatus(serviceId, newStatus);

    try {
      const feedback = (service.step_data as Record<string, unknown> | undefined)?.admin_feedback as string | undefined
        || "Verifique os ajustes necessários no seu painel.";
      const { serviceName, currentTitle } = getStepTitles(service.service_slug, service.current_step);

      await notificationService.notifyClient({
        userId: service.user_id,
        template: isFinal ? "process_completed_denied" : "step_rejected_feedback",
        serviceId: serviceId,
        templateData: isFinal
          ? { service_name: serviceName }
          : {
              step_name: currentTitle,
              feedback,
            },
        link: getProcessLink(service.service_slug),
      });
    } catch (e) {
      console.warn("[processService] Notify client of rejection failed:", e);
    }
  },

  async updateStepData(serviceId: string, data: Record<string, unknown>): Promise<void> {
    if (!serviceId) throw new Error("ID do serviço é obrigatório.");
    const success = await processRepository.updateStepData(serviceId, data);
    if (!success) throw new Error("Falha ao atualizar step_data");
  },

  async startAdditionalWorkflow(processId: string, type: 'motion' | 'rfe'): Promise<void> {
    const service = await processRepository.findById(processId);
    if (!service) throw new Error("Serviço não encontrado");

    const stepData = (service.step_data || {}) as Record<string, unknown>;
    const history = Array.isArray(stepData.history) ? [...stepData.history] : [];

    const steps = type === 'motion' ? MOTION_STEPS_TEMPLATE : RFE_STEPS_TEMPLATE;

    const newCycle = {
      type,
      id: crypto.randomUUID(),
      started_at: new Date().toISOString(),
      current_step: 0,
      status: type === 'motion' ? 'not_started' : 'rfeInit',
      steps,
    };

    history.push(newCycle);

    await processRepository.updateStepData(processId, {
      ...stepData,
      recover: type === 'motion' ? 'not_started' : 'rfeInit',
      workflow_status: type === 'motion' ? 'not_started' : 'rfeInit',
      history,
      active_cycle_index: history.length - 1,
    });
  },

  async updateProcessStatus(serviceId: string, status: string): Promise<void> {
    if (!serviceId) throw new Error("ID do serviço é obrigatório.");
    const success = await processRepository.updateStatus(serviceId, status as any);
    if (!success) throw new Error("Falha ao atualizar status");
  },
};
