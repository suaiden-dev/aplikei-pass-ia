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
import { getServiceBySlug } from "../../data/services";
import { supabase } from "../../lib/supabase";
import { processService } from "../../services/process.service";

type ActivationState = "loading" | "done" | "error";

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  console.log("[CheckoutSuccess] Component mounted. Params:", Object.fromEntries(params.entries()));

  // Capture slug ONCE at mount time (using useState initializer).
  // localStorage is read here before the effect clears it. If we recomputed on every render,
  // clearing localStorage mid-effect would change `slug`, re-trigger the effect, and
  // upsert the wrong product a second time.
  const [slug] = useState<string>(() => {
    const urlSlug = params.get("slug") || "";
    const localSlug = localStorage.getItem("checkout_slug") || "";
    // Prefer localStorage when it's a more specific variant of the URL slug
    // (e.g. localStorage = "visto-b1-b2-reaplicacao", url = "visto-b1-b2")
    return (localSlug && (!urlSlug || localSlug.startsWith(urlSlug)))
      ? localSlug
      : (urlSlug || localSlug);
  });
  const service = slug ? getServiceBySlug(slug) : null;

  const [activation, setActivation] = useState<ActivationState>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Use the Supabase session directly — no dependency on user_accounts profile loading.
    // This runs once at mount since `slug` is stable (captured via useState initializer).
    if (!slug) {
      setActivation("done");
      return;
    }

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const authUserId = session?.user?.id;

      if (!authUserId) {
        setErrorMsg("Sessão expirada. Faça login novamente.");
        setActivation("error");
        return;
      }

      const checkoutDependents = localStorage.getItem("checkout_dependents");
      const paidDependents = checkoutDependents ? parseInt(checkoutDependents, 10) : 0;
      const pendingAdvanceRaw = localStorage.getItem('pending_payment_advance');
      const isAdvancement = !!pendingAdvanceRaw;

      // Only create/upsert a process if this is a NEW purchase (not an advancement of an existing one)
      if (!isAdvancement) {
        try {
          await processService.activateService(authUserId, slug, paidDependents);
        } catch (error: any) {
           console.error("[CheckoutSuccess] activation failed:", error.code, error.message);
           setErrorMsg(`${error.message} (code: ${error.code})`);
           setActivation("error");
           return;
        }
      }

      // Handle post-payment advancement for existing processes (Motion, Proposal, etc)
      if (pendingAdvanceRaw) {
        try {
          const { procId, fromStep } = JSON.parse(pendingAdvanceRaw);
          
          // Fetch current process to verify
          const { data: proc } = await supabase
            .from("user_services")
            .select("id, current_step, status")
            .eq("id", procId)
            .single();

          if (proc && proc.current_step === fromStep) {
            await supabase
              .from("user_services")
              .update({ 
                current_step: fromStep + 1,
                status: 'active' 
              })
              .eq("id", procId);
          }
          localStorage.removeItem('pending_payment_advance');
        } catch (e) {
          console.error("[CheckoutSuccess] advancement error:", e);
        }
      }

      // Fallback: auto-repair registration in visa_orders if missing or pending
      try {
        const userEmail = session?.user?.email;
        if (userEmail) {
          // Check if record exists (use limit 1 to avoid error when multiple rows exist)
          const { data: existingRows } = await supabase
            .from("visa_orders")
            .select("id")
            .eq("client_email", userEmail)
            .eq("product_slug", slug)
            .limit(1);
          const existing = existingRows?.[0] ?? null;

          if (!existing) {
            // Create missing record as complete
            await supabase.from("visa_orders").insert({
              user_id: authUserId,
              client_name: session.user.user_metadata?.full_name || "Cliente",
              client_email: userEmail,
              product_slug: slug,
              total_price_usd: 0, // Fallback as we don't have price info here easily
              payment_method: "stripe_card",
              payment_status: "complete",
            });
          } else {
            // Update existing pending record
            await supabase
              .from("visa_orders")
              .update({ payment_status: "complete" })
              .match({ client_email: userEmail, product_slug: slug, payment_status: "pending" });
          }
        }
      } catch (e) {
        console.error("[CheckoutSuccess] repair error:", e);
      }

      localStorage.removeItem("checkout_slug");
      localStorage.removeItem("checkout_dependents");
      setActivation("done");
    })();
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg text-center"
      >
        {activation === "loading" ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm font-medium">Ativando seu processo...</p>
          </div>
        ) : activation === "error" ? (
          <>
            <div className="flex justify-center mb-6">
              <RiErrorWarningLine className="text-amber-400 text-[72px]" />
            </div>
            <h1 className="font-display text-2xl font-black text-slate-800 mb-2">
              Aviso sobre o seu serviço
            </h1>
            <p className="text-slate-500 text-sm mb-4">
              Seu pagamento foi recebido com sucesso, porém o sistema encontrou um alerta na hora de iniciar o serviço:
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
              Ir para o Dashboard
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
              <h1 className="font-display text-3xl font-black text-slate-800 mb-2">
                Pagamento confirmado!
              </h1>
              {service && (
                <p className="text-slate-500 text-sm mb-1">
                  <span className="font-semibold text-slate-700">{service.title}</span>
                </p>
              )}
              <p className="text-slate-400 text-sm">Seu processo foi ativado com sucesso.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-8 rounded-2xl bg-slate-50 border border-slate-100 p-6 text-left space-y-4"
            >
              <div className="flex items-start gap-3">
                <RiMailLine className="text-primary text-xl mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Verifique seu e-mail</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Enviamos uma confirmação com os detalhes do seu processo.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RiDashboardLine className="text-primary text-xl mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Acesse seu dashboard</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Acompanhe o progresso do seu processo e receba atualizações em tempo real.
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
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-[#1649c0] transition-colors shadow-lg shadow-primary/20"
              >
                <RiDashboardLine />
                Ir para o Dashboard
                <RiArrowRightLine />
              </Link>
              <Link
                to="/"
                className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors text-center"
              >
                Voltar ao início
              </Link>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
