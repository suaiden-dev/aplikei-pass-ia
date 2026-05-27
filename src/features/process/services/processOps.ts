import { supabase } from "@shared/lib/supabase";
import { notifyAdmin, notifyClient } from "@features/notifications/services/notify";
import { getServiceBySlug, isSameService, getServiceSlugs } from "@shared/data/services";
import {
  COS_RFE_ACCEPT_PROPOSAL_STEP,
  COS_RFE_END_STEP,
  COS_RFE_INSTRUCTION_STEP,
  COS_RFE_PROPOSAL_STEP,
  COS_RFE_START_STEP,
  COS_MOTION_ACQUISITION_STEP,
  COS_MOTION_ACCEPT_PROPOSAL_STEP,
  COS_MOTION_END_STEP,
  COS_MOTION_INSTRUCTION_STEP,
  COS_MOTION_PROPOSAL_STEP,
  isCosServiceSlug,
} from "@shared/data/cosWorkflow";
import type { UserService, ProcessStatus } from "../types";

export type { UserService };

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function findServiceById(id: string): Promise<UserService | null> {
  const { data } = await supabase
    .from("user_services")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as UserService | null) ?? null;
}

async function dbUpdateStep(
  id: string,
  step: number,
  status: ProcessStatus,
): Promise<boolean> {
  const { error } = await supabase
    .from("user_services")
    .update({ current_step: step, status })
    .eq("id", id);
  return !error;
}

async function dbUpdateStatus(id: string, status: ProcessStatus): Promise<boolean> {
  const { error } = await supabase
    .from("user_services")
    .update({ status })
    .eq("id", id);
  return !error;
}

async function dbUpdateStepData(
  id: string,
  stepData: Record<string, unknown>,
): Promise<boolean> {
  const { error } = await supabase
    .from("user_services")
    .update({ step_data: stepData })
    .eq("id", id);
  return !error;
}

async function dbUpdateNegativa(
  id: string,
  negativa: Record<string, unknown>,
): Promise<boolean> {
  const { error } = await supabase
    .from("user_services")
    .update({ negativa } as never)
    .eq("id", id);
  return !error;
}

// ── COS recovery normalization ────────────────────────────────────────────────

const COS_RECOVERY_STEPS = {
  rfeStart: COS_RFE_START_STEP,
  rfeInstruction: COS_RFE_INSTRUCTION_STEP,
  rfeProposal: COS_RFE_PROPOSAL_STEP,
  rfeAcceptProposal: COS_RFE_ACCEPT_PROPOSAL_STEP,
  rfeEnd: COS_RFE_END_STEP,
  motionAcquire: COS_MOTION_ACQUISITION_STEP,
  motionInstruction: COS_MOTION_INSTRUCTION_STEP,
  motionProposal: COS_MOTION_PROPOSAL_STEP,
  motionAcceptProposal: COS_MOTION_ACCEPT_PROPOSAL_STEP,
  motionEnd: COS_MOTION_END_STEP,
  motionResult: COS_MOTION_END_STEP,
};

function hasPurchase(stepData: Record<string, unknown>, slugs: string[]): boolean {
  const purchases = Array.isArray(stepData.purchases)
    ? (stepData.purchases as Array<{ slug?: string }>)
    : [];
  return purchases.some((p) => p.slug && slugs.includes(p.slug));
}

function getNormalizedCOSRecoveryStep(service: UserService): number | null {
  if (!isCosServiceSlug(service.service_slug)) {
    return null;
  }

  const stepData = (service.step_data || {}) as Record<string, unknown>;
  const currentStep = service.current_step ?? 0;
  const uscisResult = String(stepData.uscis_official_result || "").toLowerCase();
  const rfeResult = String(stepData.uscis_rfe_result || "").toLowerCase();
  const workflowStatus = String(stepData.workflow_status || "").toLowerCase();
  const isDenied =
    uscisResult === "denied" ||
    uscisResult === "rejected" ||
    rfeResult === "denied" ||
    rfeResult === "rejected";

  if (!isDenied) {
    if (uscisResult !== "rfe" && rfeResult !== "rfe") return null;

    const rfeInitialPaid =
      Boolean(stepData.rfe_initial_paid) ||
      Boolean(stepData.rfe_analysis_paid) ||
      hasPurchase(stepData, ["apoio-rfe-motion-inicio", "analise-rfe-cos", "apoio-rfe-cos", "analysis-rfe-cos", "analysis-rfe-eos"]);
    const rfeDescriptionSubmitted = Boolean(stepData.rfe_description) || workflowStatus === "awaiting_proposal";
    const rfeProposalSent = Boolean(stepData.rfe_proposal_sent_at) || workflowStatus === "awaiting_payment";
    const rfeProposalPaid = Boolean(stepData.rfe_proposal_paid) || Boolean(stepData.rfe_payment_completed_at);
    const rfeFinished = Boolean(stepData.rfe_final_result);

    let rfeTarget = COS_RECOVERY_STEPS.rfeStart;
    if (rfeInitialPaid) rfeTarget = COS_RECOVERY_STEPS.rfeInstruction;
    if (rfeDescriptionSubmitted) rfeTarget = COS_RECOVERY_STEPS.rfeProposal;
    if (rfeProposalSent) rfeTarget = COS_RECOVERY_STEPS.rfeAcceptProposal;
    if (rfeProposalPaid) rfeTarget = COS_RECOVERY_STEPS.rfeEnd;
    if (rfeFinished) rfeTarget = 18;

    return currentStep < rfeTarget ? rfeTarget : null;
  }

  const motionInitialPaid =
    Boolean(stepData.motion_initial_paid) ||
    Boolean(stepData.motion_analysis_paid) ||
    hasPurchase(stepData, [
      "analysis-rfe-cos",
      "analysis-rfe-eos",
      "consultancy-motion-cos",
      "consultancy-motion-eos",
      "apoio-rfe-motion-inicio",
      "analise-motion",
      "analise-especialista-cos",
    ]);
  const motionReasonSubmitted =
    Boolean(stepData.motion_reason) || workflowStatus === "awaiting_proposal";
  const motionProposalSent =
    Boolean(stepData.motion_proposal_sent_at) || workflowStatus === "awaiting_payment";
  const motionProposalPaid =
    Boolean(stepData.motion_proposal_paid) ||
    Boolean(stepData.motion_payment_completed_at);
  const motionFinished = Boolean(stepData.motion_final_result);

  let targetStep = COS_RECOVERY_STEPS.motionAcquire;
  if (motionInitialPaid) targetStep = COS_RECOVERY_STEPS.motionInstruction;
  if (motionReasonSubmitted) targetStep = COS_RECOVERY_STEPS.motionProposal;
  if (motionProposalSent) targetStep = COS_RECOVERY_STEPS.motionAcceptProposal;
  if (motionProposalPaid) targetStep = COS_RECOVERY_STEPS.motionEnd;
  if (motionFinished) targetStep = COS_RECOVERY_STEPS.motionResult;

  return currentStep < targetStep ? targetStep : null;
}

async function normalizeCOSRecoveryStep(
  service: UserService | null,
): Promise<UserService | null> {
  if (!service) return null;
  const normalizedStep = getNormalizedCOSRecoveryStep(service);
  if (normalizedStep == null) return service;
  const ok = await dbUpdateStep(service.id, normalizedStep, "active");
  if (!ok) return service;
  return { ...service, current_step: normalizedStep, status: "active" };
}

// ── Step title helpers ────────────────────────────────────────────────────────

function getStepTitles(serviceSlug: string, currentStep: number | null, nextStep?: number) {
  const serviceMeta = getServiceBySlug(serviceSlug);
  return {
    serviceName: serviceMeta?.title ?? serviceSlug,
    currentTitle: currentStep != null ? (serviceMeta?.steps[currentStep]?.title ?? "") : "",
    nextTitle: nextStep != null ? (serviceMeta?.steps[nextStep]?.title ?? "") : "",
  };
}

function getProcessLink(serviceSlug: string): string {
  return `/dashboard/processes/${serviceSlug}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getUserServices(userId: string): Promise<UserService[]> {
  const { data } = await supabase
    .from("user_services")
    .select("*")
    .eq("user_id", userId);
  const services = (data as UserService[] | null) ?? [];
  return Promise.all(
    services.map((s) => normalizeCOSRecoveryStep(s) as Promise<UserService>),
  );
}

export async function hasActiveService(userId: string, slug: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_services")
    .select("id")
    .eq("user_id", userId)
    .in("service_slug", getServiceSlugs(slug))
    .not("status", "in", "(completed,cancelled,rejected,denied)");
  return (data?.length ?? 0) > 0;
}

export async function hasAnyActiveProcess(
  userId: string,
): Promise<{ hasActive: boolean; activeSlug?: string }> {
  const { data } = await supabase
    .from("user_services")
    .select("*")
    .eq("user_id", userId)
    .not("status", "in", "(completed,cancelled,rejected,denied)");
  const services = (data as UserService[] | null) ?? [];

  if (services.length === 0) return { hasActive: false };

  const trulyActive = services.filter((proc) => {
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

    const isApproved =
      uscisResult === "approved" ||
      rfeResult === "approved" ||
      motionResult === "approved" ||
      interviewResult === "approved" ||
      proc.status === "completed";
    const isDenied =
      proc.status === "rejected" ||
      proc.status === "denied" ||
      motionResult === "denied" ||
      interviewResult === "rejected" ||
      (rfeResult === "denied" && currentStep >= 18 && !uscisResult) ||
      (uscisResult === "denied" && currentStep >= 12 && !rfeResult && !motionResult);

    return !isApproved && !isDenied;
  });

  return { hasActive: trulyActive.length > 0, activeSlug: trulyActive[0]?.service_slug };
}

export async function getUserServiceBySlug(
  userId: string,
  slug: string,
): Promise<UserService | null> {
  const { data } = await supabase
    .from("user_services")
    .select("*")
    .eq("user_id", userId)
    .in("service_slug", getServiceSlugs(slug))
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return normalizeCOSRecoveryStep((data as UserService | null) ?? null);
}

export async function getServiceById(id: string): Promise<UserService | null> {
  return normalizeCOSRecoveryStep(await findServiceById(id));
}

export async function updateStepData(
  serviceId: string,
  data: Record<string, unknown>,
): Promise<void> {
  if (!serviceId) throw new Error("ID do serviço é obrigatório.");
  const service = await findServiceById(serviceId);
  if (!service) throw new Error("Serviço não encontrado");
  const currentData = (service.step_data as Record<string, unknown>) || {};
  const mergedData = { ...currentData, ...data };
  
  const currentNegativa = (service.negativa as Record<string, unknown>) || {};
  let updateNegativaAlso = false;

  if (data.rfe_history !== undefined || data.history !== undefined || data.rfe_cycles !== undefined) {
    if (data.rfe_history !== undefined) currentNegativa.rfe_history = data.rfe_history;
    if (data.history !== undefined) currentNegativa.motion_history = data.history;
    if (data.rfe_cycles !== undefined) currentNegativa.rfe_cycles = data.rfe_cycles;
    updateNegativaAlso = true;
  }

  const ok = await dbUpdateStepData(serviceId, mergedData);
  if (!ok) throw new Error("Falha ao atualizar step_data");
  
  if (updateNegativaAlso) {
    await dbUpdateNegativa(serviceId, currentNegativa);
  }
}

export async function updateNegativa(
  serviceId: string,
  negativa: Record<string, unknown>,
): Promise<void> {
  if (!serviceId) throw new Error("ID do serviço é obrigatório.");
  const service = await findServiceById(serviceId);
  if (!service) throw new Error("Serviço não encontrado");
  const currentNegativa = (service.negativa as Record<string, unknown>) || {};
  const ok = await dbUpdateNegativa(serviceId, {
    ...currentNegativa,
    ...negativa,
  });
  if (!ok) throw new Error("Falha ao atualizar negativa");
}

export async function updateCurrentStep(
  serviceId: string,
  step: number,
  status: ProcessStatus = "active",
): Promise<void> {
  if (!serviceId) throw new Error("ID do serviço é obrigatório.");
  const ok = await dbUpdateStep(serviceId, step, status);
  if (!ok) throw new Error("Falha ao atualizar etapa atual");
}

export async function updateProcessStatus(
  serviceId: string,
  status: string,
): Promise<void> {
  if (!serviceId) throw new Error("ID do serviço é obrigatório.");
  const ok = await dbUpdateStatus(serviceId, status as ProcessStatus);
  if (!ok) throw new Error("Falha ao atualizar status");
}

export async function requestStepReview(serviceId: string): Promise<void> {
  if (!serviceId) throw new Error("ID do serviço é obrigatório.");

  const service = await findServiceById(serviceId);
  if (!service) throw new Error("Serviço não encontrado");

  await dbUpdateStatus(serviceId, "awaiting_review");

  const { serviceName, currentTitle } = getStepTitles(service.service_slug, service.current_step);
  await notifyAdmin({
    title: "Action required: review step",
    body: currentTitle
      ? `Client completed step "${currentTitle}" in ${serviceName} and is waiting for your review.`
      : `Client completed a step in ${serviceName} and is waiting for your review.`,
    serviceId,
    userId: service.user_id ?? undefined,
    link: `/master/processes/${serviceId}`,
  });

  await notifyClient({
    userId: service.user_id ?? undefined,
    template: "admin_message",
    title: "We are reviewing!",
    body: "Your step was submitted successfully to our review team. Please wait for validation.",
    serviceId,
    link: getProcessLink(service.service_slug),
  });
}

export async function approveStep(
  serviceId: string,
  nextStep: number,
  isFinal: boolean = false,
  result?: "approved" | "denied",
  additionalData?: Record<string, unknown>,
  options?: { notifyClient?: boolean },
): Promise<void> {
  if (!serviceId) throw new Error("ID do serviço é obrigatório.");

  const service = await findServiceById(serviceId);
  if (!service) throw new Error("Serviço não encontrado");

  const newStepData: Record<string, unknown> = {
    ...((service.step_data as Record<string, unknown>) || {}),
    ...additionalData,
  };
  delete newStepData["admin_feedback"];
  delete newStepData["rejected_at"];

  if (isFinal && result) {
    newStepData.motion_final_result = result;
  }

  await dbUpdateStepData(serviceId, newStepData);
  await dbUpdateStep(serviceId, nextStep, isFinal ? "completed" : "active");

  if (options?.notifyClient !== false) {
    try {
      const { serviceName, currentTitle, nextTitle } = getStepTitles(
        service.service_slug,
        service.current_step,
        nextStep,
      );
      await notifyClient({
        userId: service.user_id ?? undefined,
        template: isFinal ? "process_completed_approved" : "step_approved",
        serviceId,
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
      console.warn("[processOps] Notify client of approval failed:", e);
    }
  }
}

export async function rejectStep(
  serviceId: string,
  isFinal: boolean = false,
  result?: "approved" | "denied",
): Promise<void> {
  if (!serviceId) throw new Error("ID do serviço é obrigatório.");

  const service = await findServiceById(serviceId);
  if (!service) throw new Error("Serviço não encontrado");

  if (isFinal && result) {
    await dbUpdateStepData(serviceId, {
      ...((service.step_data as object) || {}),
      motion_final_result: result,
    });
  }

  await dbUpdateStatus(serviceId, isFinal ? "completed" : "active");

  try {
    const feedback =
      ((service.step_data as Record<string, unknown> | undefined)?.admin_feedback as
        | string
        | undefined) ?? "Verifique os ajustes necessários no seu painel.";
    const { serviceName, currentTitle } = getStepTitles(
      service.service_slug,
      service.current_step,
    );

    await notifyClient({
      userId: service.user_id ?? undefined,
      template: isFinal ? "process_completed_denied" : "step_rejected_feedback",
      serviceId,
      templateData: isFinal
        ? { service_name: serviceName }
        : { step_name: currentTitle, feedback },
      link: getProcessLink(service.service_slug),
    });
  } catch (e) {
    console.warn("[processOps] Notify client of rejection failed:", e);
  }
}

export async function startAdditionalWorkflow(
  processId: string,
  type: "motion" | "rfe",
): Promise<{ childProcessId?: string }> {
  const service = await findServiceById(processId);
  if (!service) throw new Error("Serviço não encontrado");

  const parentStepData = (service.step_data || {}) as Record<string, unknown>;
  const recoveryChildSlug =
    type === "motion"
      ? service.service_slug === "extensao-status"
        ? "consultancy-motion-eos"
        : "consultancy-motion-cos"
      : service.service_slug === "extensao-status"
      ? "analysis-rfe-eos"
      : "analysis-rfe-cos";

  const { data: existingChild } = await supabase
    .from("user_services")
    .select("id")
    .eq("user_id", service.user_id)
    .eq("service_slug", recoveryChildSlug)
    .contains("step_data", { parent_process_id: processId })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let childProcessId: string | undefined = existingChild?.id;
  if (!childProcessId) {
    const { data: insertedChild, error: childInsertError } = await supabase
      .from("user_services")
      .insert({
        user_id: service.user_id,
        service_slug: recoveryChildSlug,
        office_id: service.office_id ?? null,
        status: "active",
        current_step: 0,
        step_data: {
          parent_process_id: processId,
          parent_service_slug: service.service_slug,
          workflow_type: type,
          origin: "recovery_child",
          created_from: "startAdditionalWorkflow",
          created_at: new Date().toISOString(),
        },
        data: {},
      })
      .select("id")
      .single();

    if (!childInsertError) {
      childProcessId = insertedChild?.id;
    }
  }
  return { childProcessId };
}

export async function hasChatMessages(processId: string): Promise<boolean> {
  const { count } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("process_id", processId);
  return (count ?? 0) > 0;
}

export async function ensureChatThread(
  processId: string,
  senderId: string,
  content: string,
  force = false,
): Promise<boolean> {
  if (!force) {
    const alreadyExists = await hasChatMessages(processId);
    if (alreadyExists) return false;
  }

  const { error } = await supabase.from("chat_messages").insert({
    process_id: processId,
    sender_id: senderId,
    sender_role: "customer",
    content,
  });

  return !error;
}
