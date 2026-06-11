import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@shared/lib/supabase";
import type { UserService } from "../types";

// ── COS step normalisation (side-effectful: corrects stale DB rows on read) ──

const COS_SLUGS = ["troca-status", "extensao-status", "visa-cos", "visa-eos"];

const COS_RECOVERY_STEPS = {
  rfeStart: 13,
  rfeInstruction: 14,
  motionAcquire: 19,
  motionInstruction: 20,
  motionProposal: 21,
  motionAcceptProposal: 22,
  motionEnd: 23,
};

function hasPurchase(stepData: Record<string, unknown>, slugs: string[]): boolean {
  const purchases = Array.isArray(stepData["purchases"])
    ? (stepData["purchases"] as Array<{ slug?: string }>)
    : [];
  return purchases.some((p) => p.slug && slugs.includes(p.slug));
}

function getTargetCOSStep(service: UserService): number | null {
  if (!COS_SLUGS.includes(service.service_slug)) return null;

  const sd = (service.step_data ?? {}) as Record<string, unknown>;
  const step = service.current_step ?? 0;
  const uscisResult = String(sd["uscis_official_result"] ?? "").toLowerCase();
  const rfeResult = String(sd["uscis_rfe_result"] ?? "").toLowerCase();
  const workflowStatus = String(sd["workflow_status"] ?? "").toLowerCase();

  const isDenied =
    uscisResult === "denied" ||
    uscisResult === "rejected" ||
    rfeResult === "denied" ||
    rfeResult === "rejected";

  if (!isDenied) {
    if (uscisResult !== "rfe" && rfeResult !== "rfe") return null;

    const rfeInitialPaid =
      Boolean(sd["rfe_initial_paid"]) ||
      hasPurchase(sd, [
        "analysis-rfe-cos",
        "analysis-rfe-eos",
        "apoio-rfe-motion-inicio",
        "analise-rfe-cos",
        "apoio-rfe-cos",
      ]);
    const target = rfeInitialPaid ? COS_RECOVERY_STEPS.rfeInstruction : COS_RECOVERY_STEPS.rfeStart;
    return step < target ? target : null;
  }

  const motionInitialPaid =
    Boolean(sd["motion_initial_paid"]) ||
    Boolean(sd["motion_analysis_paid"]) ||
    hasPurchase(sd, [
      "analysis-rfe-cos",
      "analysis-rfe-eos",
      "consultancy-motion-cos",
      "consultancy-motion-eos",
      "apoio-rfe-motion-inicio",
      "analise-motion",
      "analise-especialista-cos",
    ]);
  const motionReasonSubmitted =
    Boolean(sd["motion_reason"]) || workflowStatus === "awaiting_proposal";
  const motionProposalSent =
    Boolean(sd["motion_proposal_sent_at"]) || workflowStatus === "awaiting_payment";
  const motionProposalPaid =
    Boolean(sd["motion_proposal_paid"]) || Boolean(sd["motion_payment_completed_at"]);
  const motionFinished = Boolean(sd["motion_final_result"]);

  let target = COS_RECOVERY_STEPS.motionAcquire;
  if (motionInitialPaid) target = COS_RECOVERY_STEPS.motionInstruction;
  if (motionReasonSubmitted) target = COS_RECOVERY_STEPS.motionProposal;
  if (motionProposalSent) target = COS_RECOVERY_STEPS.motionAcceptProposal;
  if (motionProposalPaid) target = COS_RECOVERY_STEPS.motionEnd;
  if (motionFinished) target = 24;

  return step < target ? target : null;
}

function getCOSStepUpdate(service: UserService): { id: string; current_step: number; status: string } | null {
  const target = getTargetCOSStep(service);
  if (target == null) return null;
  return { id: service.id, current_step: target, status: "active" };
}

async function normaliseCOSSteps(services: UserService[]): Promise<UserService[]> {
  const updates = services
    .map(getCOSStepUpdate)
    .filter((update): update is { id: string; current_step: number; status: string } => Boolean(update));

  if (updates.length === 0) return services;

  const { error } = await supabase.rpc("bulk_update_user_service_steps", {
    p_updates: updates,
  });

  if (error) return services;

  const updateById = new Map(updates.map((update) => [update.id, update]));
  return services.map((service) => {
    const update = updateById.get(service.id);
    if (!update) return service;
    return { ...service, current_step: update.current_step, status: update.status };
  });
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useUserProcesses(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user-services", userId],
    enabled: !!userId,
    queryFn: async (): Promise<UserService[]> => {
      const { data, error } = await supabase
        .from("user_services")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const services = (data as UserService[]) ?? [];
      const normalised = await normaliseCOSSteps(services);

      const officeIdByProcessId: Record<string, string> = {};
      const officeIdByUserId: Record<string, string> = {};
      normalised.forEach((s) => {
        if (s.office_id) {
          officeIdByProcessId[s.id] = s.office_id;
          if (!officeIdByUserId[s.user_id]) officeIdByUserId[s.user_id] = s.office_id;
        }
      });

      const userIds = Array.from(new Set(normalised.map((s) => s.user_id).filter(Boolean)));
      if (userIds.length > 0) {
        const { data: accountRows } = await supabase
          .from("user_accounts")
          .select("id, office_id")
          .in("id", userIds);

        (accountRows ?? []).forEach((row: any) => {
          if (row?.id && row?.office_id && !officeIdByUserId[row.id]) {
            officeIdByUserId[row.id] = row.office_id;
          }
        });
      }

      const effectiveOfficeIdByProcessId: Record<string, string | undefined> = {};
      normalised.forEach((s) => {
        const sd = (s.step_data ?? {}) as Record<string, unknown>;
        const parentProcessId = String(sd.parent_process_id ?? "").trim();

        const effectiveOfficeId =
          s.office_id ||
          (parentProcessId ? officeIdByProcessId[parentProcessId] : undefined) ||
          officeIdByUserId[s.user_id];

        if (effectiveOfficeId) {
          effectiveOfficeIdByProcessId[s.id] = effectiveOfficeId;
        }
      });

      const officeIds = Array.from(
        new Set(
          Object.values(effectiveOfficeIdByProcessId)
            .filter((id): id is string => Boolean(id))
        )
      );

      const officeNameMap: Record<string, string> = {};
      const officeLogoMap: Record<string, string | undefined> = {};
      if (officeIds.length > 0) {
        const { data: officesData } = await supabase
          .from("offices")
          .select("id, name, logo_url, landing_page_config")
          .in("id", officeIds);

        (officesData ?? []).forEach((o: any) => {
          officeNameMap[o.id] = o.name;
          officeLogoMap[o.id] =
            o.logo_url ||
            (o.landing_page_config && typeof o.landing_page_config === "object"
              ? (o.landing_page_config as Record<string, unknown>).logoUrl as string | undefined
              : undefined);
        });
      }

      return normalised.map((s) => ({
        ...s,
        office_id: effectiveOfficeIdByProcessId[s.id] ?? s.office_id,
        officeName: effectiveOfficeIdByProcessId[s.id]
          ? officeNameMap[effectiveOfficeIdByProcessId[s.id] as string]
          : undefined,
        officeLogoUrl: effectiveOfficeIdByProcessId[s.id]
          ? officeLogoMap[effectiveOfficeIdByProcessId[s.id] as string]
          : undefined,
      }));
    },
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-processes-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_services", filter: `user_id=eq.${userId}` },
        () => queryClient.invalidateQueries({ queryKey: ["user-services", userId] }),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, queryClient]);

  return query;
}
