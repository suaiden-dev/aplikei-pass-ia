import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiCheckboxCircleFill,
  RiDashboardLine,
  RiArrowRightLine,
  RiMailLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import { getServiceBySlug } from "@shared/data/services";
import { getCosPaymentStageTarget } from "@shared/data/cosWorkflow";
import { supabase } from "@shared/lib/supabase";
import { useT } from "@app/app/i18n";
import { LogoLoader } from "@shared/components/atoms/logo-loader";
import * as paymentService from "@features/payments/lib/paymentOps";
import * as processService from "@features/process/services/processOps";

type ActivationState = "loading" | "done" | "error";

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();

  const [slug] = useState<string>(() => {
    const urlSlug = params.get("slug") || "";
    const localSlug = localStorage.getItem("checkout_slug") || "";
    return (localSlug && (!urlSlug || localSlug.startsWith(urlSlug)))
      ? localSlug
      : (urlSlug || localSlug);
  });
  const [orderId] = useState<string | null>(() =>
    params.get("order_id") ||
    params.get("pid") ||
    localStorage.getItem("checkout_order_id")
  );
  const sessionId = params.get("session_id");
  const service = slug ? getServiceBySlug(slug) : null;

  const [activation, setActivation] = useState<ActivationState>(() => slug ? "loading" : "done");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t_base = useT("checkout");
  const t = t_base?.product?.success;

  useEffect(() => {
    if (!t || !slug) return;

    (async () => {
      const MENTORSHIP_SLUGS = new Set([
        "mentoring-bronze",
        "mentoring-silver",
        "mentoring-gold",
        "mentoria-individual",
        "mentoria-bronze",
        "mentoria-prata",
        "mentoria-silver",
        "mentoria-gold",
        "consultoria-especialista",
        "consultoria-f1-negativa",
        "consultancy-negative-f1",
        "mentoria-negativa-consular",
        "consultancy-negative-b1b2",
      ]);
      const normalizeMentorshipSlug = (value: string) => {
        const lower = String(value || "").trim().toLowerCase();
        if (lower === "mentoria-individual") return "mentoring-bronze";
        if (lower === "mentoria-bronze") return "mentoring-bronze";
        if (lower === "mentoria-prata") return "mentoring-silver";
        if (lower === "mentoria-silver") return "mentoring-silver";
        if (lower === "mentoria-gold") return "mentoring-gold";
        if (lower === "consultancy-negative-f1") return "consultoria-f1-negativa";
        if (lower === "consultancy-negative-b1b2") return "mentoria-negativa-consular";
        return lower;
      };

      const CHAT_SEED_MESSAGES: Record<string, string> = {
        "consultoria-f1-negativa": "Olá! Comprei a Mentoria Pós-Negativa F-1 e quero iniciar meu atendimento.",
        "mentoria-negativa-consular": "Olá! Comprei a Análise de Recusa e quero iniciar meu atendimento.",
        "consultoria-especialista": "Olá! Comprei a Consultoria Especialista e quero iniciar meu atendimento.",
      };

      const seedMentorshipChat = async (paidOrderId: string | null, currentUserId: string) => {
        const normalizedSlug = normalizeMentorshipSlug(slug);
        if (!MENTORSHIP_SLUGS.has(normalizedSlug)) return;

        let parentProcId: string | null = null;
        if (paidOrderId) {
          const { data: orderRow } = await supabase
            .from("orders")
            .select("proc_id")
            .eq("id", paidOrderId)
            .maybeSingle();
          parentProcId = String((orderRow as Record<string, unknown> | null)?.proc_id || "").trim() || null;
        }

        const canonicalCandidates = [normalizedSlug];
        if (normalizedSlug === "mentoring-bronze") canonicalCandidates.push("mentoria-bronze", "mentoria-individual");
        if (normalizedSlug === "mentoring-silver") canonicalCandidates.push("mentoria-silver");
        if (normalizedSlug === "mentoring-gold") canonicalCandidates.push("mentoria-gold");
        if (normalizedSlug === "mentoria-prata" || normalizedSlug === "mentoring-silver") {
          if (!canonicalCandidates.includes("mentoria-prata")) canonicalCandidates.push("mentoria-prata");
        }
        if (normalizedSlug === "consultoria-f1-negativa") canonicalCandidates.push("consultancy-negative-f1");
        if (normalizedSlug === "mentoria-negativa-consular") canonicalCandidates.push("consultancy-negative-b1b2");

        let query = supabase
          .from("user_services")
          .select("id")
          .eq("user_id", currentUserId)
          .in("service_slug", canonicalCandidates)
          .eq("status", "active");
        if (parentProcId) {
          query = query.contains("step_data", { parent_process_id: parentProcId });
        }
        const { data: mentorshipProcess } = await query
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const targetProcessId = String((mentorshipProcess as Record<string, unknown> | null)?.id || "").trim();
        // Chat-only flow (no user_services row): attach chat to parent process
        const chatProcessId = targetProcessId || parentProcId || "";
        if (!chatProcessId) return;

        const seedMessage =
          CHAT_SEED_MESSAGES[normalizedSlug] ??
          "Olá, comprei o pacote e quero iniciar meu atendimento com o especialista.";

        await processService.createChatThread(chatProcessId, currentUserId, seedMessage);
      };

      const hasOrderReference = !!orderId || !!sessionId;
      const { data: { user } } = await supabase.auth.getUser();
      const hasSession = !!user?.id;

      if (!hasSession && !hasOrderReference) {
        setErrorMsg(t.sessionExpired);
        setActivation("error");
        return;
      }

      const markAsDone = async () => {
        const pendingAdvanceRaw = localStorage.getItem("pending_payment_advance");

        if (pendingAdvanceRaw) {
          try {
            const pendingAdvance = JSON.parse(pendingAdvanceRaw) as {
              procId?: string;
              slug?: string;
              createdAt?: string;
              fromStep?: number;
              stage?: "initial" | "proposal";
              flow?: "motion" | "rfe";
              targetStep?: number;
            };
            if (pendingAdvance?.procId) {
              const pendingSlug = String(pendingAdvance.slug || "").trim().toLowerCase();
              const paidSlug = String(slug || "").trim().toLowerCase();
              const pendingCreatedAtMs = pendingAdvance.createdAt ? new Date(pendingAdvance.createdAt).getTime() : NaN;
              const isFreshPending =
                Number.isFinite(pendingCreatedAtMs) &&
                Date.now() - pendingCreatedAtMs <= 1000 * 60 * 60 * 2;
              const isValidPendingMetadata =
                pendingSlug.length > 0 &&
                pendingSlug === paidSlug &&
                (pendingAdvance.flow === "rfe" || pendingAdvance.flow === "motion") &&
                (pendingAdvance.stage === "initial" || pendingAdvance.stage === "proposal") &&
                isFreshPending;
              if (!isValidPendingMetadata) {
                localStorage.removeItem("pending_payment_advance");
              } else {
              const targetStep = pendingAdvance.targetStep ??
                getCosPaymentStageTarget({
                  slug,
                  fromStep: pendingAdvance.fromStep,
                  stage: pendingAdvance.stage,
                  flow: pendingAdvance.flow,
                }) ??
                0;

              const now = new Date().toISOString();
              const { data: row } = await supabase
                .from("user_services")
                .select("service_slug,current_step,step_data,status")
                .eq("id", pendingAdvance.procId)
                .maybeSingle();

              const currentStep = Number(row?.current_step ?? 0);
              const rowSlug = String(row?.service_slug || "").toLowerCase();
              const stepDataFromRow = ((row?.step_data as Record<string, unknown>) ?? {});
              const isRecoveryChild =
                rowSlug.includes("motion") ||
                rowSlug.includes("rfe") ||
                String(stepDataFromRow.parent_process_id || "").trim().length > 0;
              const normalizedTargetStep = isRecoveryChild
                ? (targetStep >= 19 ? targetStep - 19 : targetStep >= 13 ? targetStep - 13 : targetStep)
                : targetStep;
              const nextStep = Math.max(currentStep, normalizedTargetStep);
              const currentStepData = ((row?.step_data as Record<string, unknown>) ?? {});
              const paymentStepData: Record<string, unknown> = {};

              if (pendingAdvance.stage === "proposal" && pendingAdvance.flow === "rfe") {
                paymentStepData.rfe_proposal_paid = true;
                paymentStepData.rfe_payment_completed_at = now;
                if (user?.id) {
                  await processService.createChatThread(
                    pendingAdvance.procId,
                    user.id,
                    "Olá! Quero falar com o especialista sobre a proposta da minha RFE.",
                  );
                }
              }

              if (pendingAdvance.stage === "proposal" && pendingAdvance.flow === "motion") {
                paymentStepData.motion_proposal_paid = true;
                paymentStepData.motion_payment_completed_at = now;
              }

              await supabase
                .from("user_services")
                .update({
                  current_step: nextStep,
                  status: "active",
                  step_data: {
                    ...currentStepData,
                    ...paymentStepData,
                  },
                })
                .eq("id", pendingAdvance.procId);

              localStorage.removeItem("checkout_slug");
              localStorage.removeItem("checkout_order_id");
              localStorage.removeItem("checkout_dependents");
              localStorage.removeItem("checkout_parent_id");
              localStorage.removeItem("pending_payment_advance");

              const parentProcessId = String(stepDataFromRow.parent_process_id || "").trim();
              const parentServiceSlug = String(stepDataFromRow.parent_service_slug || "").trim() || "troca-status";
              const flow = pendingAdvance.flow || (rowSlug.includes("motion") ? "motion" : "rfe");

              if (isRecoveryChild && parentProcessId) {
                const absoluteStep = flow === "motion" ? 19 + nextStep : 13 + nextStep;
                window.location.assign(
                  `/dashboard/processes/${parentServiceSlug}/onboarding?id=${parentProcessId}&childId=${pendingAdvance.procId}&workflowType=${flow}&step=${absoluteStep}`,
                );
              } else {
                const targetSlug = row?.service_slug || "troca-status";
                window.location.assign(
                  `/dashboard/processes/${targetSlug}/onboarding?id=${pendingAdvance.procId}&step=${nextStep}`,
                );
              }
              return;
              }
            }
          } catch {
            // ignore parse/navigation fallback errors
          }
        }

        localStorage.removeItem("checkout_slug");
        localStorage.removeItem("checkout_order_id");
        localStorage.removeItem("checkout_dependents");
        localStorage.removeItem("checkout_parent_id");
        localStorage.removeItem("pending_payment_advance");
        setActivation("done");
        
      };

      try {
        let resolvedOrderId = orderId;
        if (sessionId) {
          const result = await paymentService.verifyStripeSession(sessionId);
          if (!resolvedOrderId && result?.orderId) {
            resolvedOrderId = result.orderId;
          }
        }

        const paid = await paymentService.checkOrderPaymentStatus(slug, 30000, resolvedOrderId);
        if (paid) {
          if (user?.id) {
            await seedMentorshipChat(resolvedOrderId, user.id);
          }
          await markAsDone();
        } else {
          setErrorMsg("Pagamento ainda não confirmado.");
          setActivation("error");
        }
      } catch (error: unknown) {
        console.error("[CheckoutSuccess] Verification failed:", error);
        setErrorMsg("Erro ao verificar status do pagamento.");
        setActivation("error");
      }
    })();
  }, [slug, t, orderId, sessionId]);

  if (!t) return null;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg text-center"
      >
        {activation === "loading" ? (
          <div className="py-12">
            <LogoLoader />
          </div>
        ) : activation === "error" ? (
          <>
            <div className="flex justify-center mb-6">
              <RiErrorWarningLine className="text-amber-400 text-[72px]" />
            </div>
            <h1 className="font-display text-2xl font-black text-text mb-2">
              {t.errorTitle}
            </h1>
            <p className="text-text-muted text-sm mb-4">
              {t.errorDesc}
            </p>
            {errorMsg && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6 font-medium text-left shadow-inner">
                {errorMsg}
              </p>
            )}
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-[#1649c0] transition-colors shadow-lg shadow-primary/20"
            >
              <RiDashboardLine />
              {t.goDashboard}
              <RiArrowRightLine />
            </Link>
          </>
        ) : (
          <>
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                <RiCheckboxCircleFill className="text-emerald-500 text-[72px] relative" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h1 className="font-display text-3xl font-black text-text mb-2">
                {t.confirmed}
              </h1>
              {service && (
                <p className="text-text-muted text-sm mb-1">
                  <span className="font-semibold text-text">{service.title}</span>
                </p>
              )}
              <p className="text-text-muted opacity-80 text-sm">{t.activated}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-8 rounded-2xl bg-bg-subtle border border-border p-6 text-left space-y-4"
            >
              <div className="flex items-start gap-3">
                <RiMailLine className="text-primary text-xl mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-text">{t.checkEmail}</p>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                    {t.checkEmailDesc}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RiDashboardLine className="text-primary text-xl mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-text">{t.accessDashboard}</p>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                    {t.accessDashboardDesc}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-6 flex flex-col sm:flex-row items-center gap-3"
            >
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
              >
                <RiDashboardLine />
                {t.goDashboard}
                <RiArrowRightLine />
              </Link>
              <Link
                to="/"
                className="w-full py-3.5 rounded-xl border border-border text-text-muted font-semibold text-sm hover:bg-bg-subtle transition-colors text-center"
              >
                {t.backHome}
              </Link>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
