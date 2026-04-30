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
import { getServiceBySlug } from "../../../data/services";
import { useT } from "../../../i18n";
import { LogoLoader } from "../../../components/ui/LogoLoader";
import { paymentService } from "../../../services/payment.service";

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

  const [activation, setActivation] = useState<ActivationState>(() => orderId ? "loading" : "done");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t_base = useT("checkout");
  const t = t_base?.product?.success;

  useEffect(() => {
    if (!t || !orderId) return;

    const markAsDone = () => {
      localStorage.removeItem("checkout_slug");
      localStorage.removeItem("checkout_order_id");
      localStorage.removeItem("checkout_dependents");
      localStorage.removeItem("checkout_parent_id");
      setActivation("done");
    };

    (async () => {
      try {
        // Stripe: consulta a sessão e atualiza o payment direto (sem webhook)
        if (sessionId) {
          const result = await paymentService.confirmStripeSession(sessionId);
          if (result.payment_status === "failed") {
            setErrorMsg("Pagamento não foi concluído.");
            setActivation("error");
            return;
          }
          if (result.order_status === "paid") {
            markAsDone();
            return;
          }
        }

        // Fallback: polling no banco (Zelle, Parcelow ou se confirm não conseguiu mas trigger ainda vai rodar)
        await paymentService.verifyOrderActivation({
          orderId,
          onSuccess: markAsDone,
          onError: (msg) => {
            setErrorMsg(msg);
            setActivation("error");
          },
        });
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "Erro ao confirmar pagamento.");
        setActivation("error");
      }
    })();
  }, [t, orderId, sessionId]);

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
            <h1 className="font-display text-2xl font-black text-text mb-2 uppercase tracking-tight">
              {t.errorTitle}
            </h1>
            <p className="text-text-muted text-sm mb-4 font-medium italic">
              {t.errorDesc}
            </p>
            {errorMsg && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-2xl px-6 py-4 mb-8 font-bold text-left shadow-sm">
                {errorMsg}
              </p>
            )}
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
            >
              <RiDashboardLine className="text-lg" />
              {t.goDashboard}
              <RiArrowRightLine className="text-lg" />
            </Link>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-3xl flex items-center justify-center relative shadow-xl">
                  <RiCheckboxCircleFill className="text-5xl" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h1 className="font-display text-3xl font-black text-text mb-3 uppercase tracking-tight">
                {t.confirmed}
              </h1>
              {service && (
                <p className="text-text font-bold text-lg mb-2">
                  {service.title}
                </p>
              )}
              <p className="text-text-muted font-medium italic mb-10">{t.activated}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-8 rounded-[2rem] bg-card border border-border p-8 text-left space-y-6 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <RiMailLine className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-black text-text uppercase tracking-tight">{t.checkEmail}</p>
                  <p className="text-xs text-text-muted mt-1 font-medium leading-relaxed italic">
                    {t.checkEmailDesc}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <RiDashboardLine className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-black text-text uppercase tracking-tight">{t.accessDashboard}</p>
                  <p className="text-xs text-text-muted mt-1 font-medium leading-relaxed italic">
                    {t.accessDashboardDesc}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-10 flex flex-col sm:flex-row items-center gap-4"
            >
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest hover:bg-primary-hover transition-all shadow-2xl shadow-primary/20 hover:-translate-y-1"
              >
                <RiDashboardLine className="text-xl" />
                {t.goDashboard}
                <RiArrowRightLine className="text-xl" />
              </Link>
              <Link
                to="/"
                className="w-full py-5 rounded-2xl border-2 border-border text-text font-black text-sm uppercase tracking-widest hover:bg-card transition-all text-center"
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
