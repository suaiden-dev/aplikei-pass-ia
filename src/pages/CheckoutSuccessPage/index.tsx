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
import { useT } from "../../i18n";

type ActivationState = "loading" | "done" | "error";

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();

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

  const t_base = useT("checkout");
  const t = t_base?.product?.success;

  if (!t) return null; // Wait for translations to load to avoid crashes

  useEffect(() => {
    if (!slug) {
      setActivation("done");
      return;
    }

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const authUserId = session?.user?.id;

      if (!authUserId) {
        setErrorMsg(t.sessionExpired);
        setActivation("error");
        return;
      }

      try {
        // Here we poll the database for up to 20 seconds waiting for the Payment Webhook to confirm the purchase
        const { paymentService } = await import("../../services/payment.service");
        const isPaid = await paymentService.checkOrderPaymentStatus(slug);

        if (isPaid) {
          // If the webhook confirmed the payment, the backend already created the user_services row.
          // Clean up local storage
          localStorage.removeItem("checkout_slug");
          localStorage.removeItem("checkout_dependents");
          localStorage.removeItem("checkout_parent_id");
          localStorage.removeItem('pending_payment_advance');
          setActivation("done");
        } else {
          setErrorMsg("Aguardando a confirmação do pagamento pelo provedor. Verifique seu e-mail ou painel em alguns minutos.");
          setActivation("error");
        }
      } catch (error: any) {
        console.error("[CheckoutSuccess] validation failed:", error);
        setErrorMsg("Erro ao validar o pagamento com o servidor.");
        setActivation("error");
      }
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
            <p className="text-slate-500 text-sm font-medium">{t.activating}</p>
          </div>
        ) : activation === "error" ? (
          <>
            <div className="flex justify-center mb-6">
              <RiErrorWarningLine className="text-amber-400 text-[72px]" />
            </div>
            <h1 className="font-display text-2xl font-black text-slate-800 mb-2">
              {t.errorTitle}
            </h1>
            <p className="text-slate-500 text-sm mb-4">
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
              <h1 className="font-display text-3xl font-black text-slate-800 mb-2">
                {t.confirmed}
              </h1>
              {service && (
                <p className="text-slate-500 text-sm mb-1">
                  <span className="font-semibold text-slate-700">{service.title}</span>
                </p>
              )}
              <p className="text-slate-400 text-sm">{t.activated}</p>
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
                  <p className="text-sm font-semibold text-slate-700">{t.checkEmail}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {t.checkEmailDesc}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RiDashboardLine className="text-primary text-xl mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">{t.accessDashboard}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
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
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-[#1649c0] transition-colors shadow-lg shadow-primary/20"
              >
                <RiDashboardLine />
                {t.goDashboard}
                <RiArrowRightLine />
              </Link>
              <Link
                to="/"
                className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors text-center"
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
