import { useSearchParams, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { submitZellePayment } from "@/lib/zelle/ZelleService";
import { toast } from "sonner";

const CheckoutSuccess = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { lang } = useLanguage();

    // Estados dinâmicos (suporta chaves encurtadas para caber em limites de URL)
    const rawStatus = (searchParams.get("s") || searchParams.get("status") || "success").toLowerCase();
    const [status, setStatus] = useState(
        rawStatus === "p" || rawStatus === "pending" ? "pending" : "success"
    );
    const [paymentId, setPaymentId] = useState<string | null>(searchParams.get("pid") || searchParams.get("payment_id"));
    const initialEmailParam = searchParams.get("ce");
    let initialEmail = null;
    try {
        if (initialEmailParam) initialEmail = atob(initialEmailParam);
    } catch (e) {
        console.error("Erro ao decodificar e-mail da URL", e);
    }
    const [clientEmail, setClientEmail] = useState<string | null>(initialEmail);
    const [isUploading, setIsUploading] = useState(!!location.state?.zelleData);

    const isPending = status === "pending";
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
        });

        const handleBackgroundUpload = async () => {
            if (location.state?.zelleData && isUploading) {
                try {
                    console.log("[CheckoutSuccess] Iniciando upload em background...");
                    const result = await submitZellePayment(location.state.zelleData);
                    setPaymentId(result.paymentId);
                    setIsUploading(false);
                    window.history.replaceState({}, document.title);
                } catch (error) {
                    console.error("[CheckoutSuccess] Background upload failed:", error);
                    setIsUploading(false);
                    toast.error(lang === "pt" ? "Erro ao processar comprovante. Tente novamente." : "Error processing proof.");
                }
            }
        };

        handleBackgroundUpload();
    }, [isUploading, location.state?.zelleData, lang]);

    useEffect(() => {
        if (!paymentId) return;

        let isMounted = true;

        const checkCurrentStatus = async () => {
            console.log(`[CheckoutSuccess] Buscando detalhes para ID: ${paymentId}`);

            // Tenta primeiro em zelle_payments
            const { data: zelleData, error: zelleError } = await supabase
                .from("zelle_payments")
                .select("status")
                .eq("id", paymentId)
                .single();

            if (zelleError) console.log("[CheckoutSuccess] Zelle não encontrado (ignorar se for Visa)");

            if (isMounted && zelleData?.status === "approved") {
                console.log("[CheckoutSuccess] Pagamento Zelle já estava aprovada.");
                setStatus("success");
                return;
            }

            // Tenta em visa_orders (Parcelow/Stripe)
            const { data: visaData, error: visaError } = await supabase
                .from("visa_orders")
                .select("payment_status, client_email")
                .eq("id", paymentId)
                .single();

            if (visaError) {
                console.error("❌ [CheckoutSuccess] ERRO CRÍTICO SUPABASE:", {
                    message: visaError.message,
                    code: visaError.code,
                    details: visaError.details,
                    hint: visaError.hint
                });
            }

            if (isMounted && visaData) {
                console.log("[CheckoutSuccess] Dados da Ordem encontrados:", visaData);
                if (visaData.client_email) {
                    setClientEmail(visaData.client_email);
                } else {
                    console.warn("[CheckoutSuccess] Ordem encontrada, mas client_email é nulo.");
                }

                if (visaData.payment_status === "approved" || visaData.payment_status === "paid") {
                    console.log("[CheckoutSuccess] Ordem Visa confirmada.");
                    setStatus("success");
                }
            } else if (isMounted && !visaData) {
                console.warn("[CheckoutSuccess] Ordem Visa não encontrada no banco com este ID.");
            }
        };

        checkCurrentStatus();

        console.log(`[CheckoutSuccess] Monitorando pagamento: ${paymentId}`);

        // Canal para Zelle
        const zelleChannel = supabase
            .channel(`public:zelle_payments:id=eq.${paymentId}`)
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "zelle_payments", filter: `id=eq.${paymentId}` },
                (payload: any) => {
                    if (isMounted && payload.new.status === "approved") {
                        console.log("[CheckoutSuccess] Zelle aprovado via Realtime.");
                        setStatus("success");
                    }
                }
            )
            .subscribe();

        // Canal para Visa Orders
        const visaChannel = supabase
            .channel(`public:visa_orders:id=eq.${paymentId}`)
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "visa_orders", filter: `id=eq.${paymentId}` },
                (payload: any) => {
                    if (isMounted) {
                        if (payload.new.client_email) setClientEmail(payload.new.client_email);
                        if (payload.new.payment_status === "approved" || payload.new.payment_status === "paid") {
                            console.log("[CheckoutSuccess] Ordem Visa aprovada via Realtime.");
                            setStatus("success");
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(zelleChannel);
            supabase.removeChannel(visaChannel);
        };
    }, [isPending, paymentId]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 md:p-12 text-center"
            >
                <div className="flex justify-center mb-10">
                    <div className="relative">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className={`w-20 h-20 ${isPending || isUploading ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20'} rounded-full flex items-center justify-center border-2 ${isPending || isUploading ? 'border-amber-100 dark:border-amber-800' : 'border-green-100 dark:border-green-800'}`}
                        >
                            {isPending || isUploading ? (
                                <ShieldCheck className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                            ) : (
                                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                            )}
                        </motion.div>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    {isUploading || isPending
                        ? (lang === 'pt' ? 'Pagamento sendo processado' : 'Payment being processed')
                        : (lang === 'pt' ? 'Pagamento Confirmado!' : 'Payment Confirmed!')
                    }
                </h1>

                <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
                    {isUploading || isPending
                        ? (lang === 'pt'
                            ? 'Por favor, aguarde alguns instantes. Estamos validando sua transação.'
                            : 'Please wait a moment. We are validating your transaction.')
                        : (lang === 'pt'
                            ? 'Agora falta apenas um pequeno passo para acessar seu guia.'
                            : 'Now just one small step to access your guide.')
                    }
                </p>

                {(!isUploading && !isPending) && (
                    <>
                        {!isLoggedIn ? (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 text-left border border-slate-100 dark:border-slate-800">
                                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                    <Mail className="w-5 h-5 text-primary" />
                                    {lang === 'pt' ? 'Próximos Passos:' : 'Next Steps:'}
                                </h2>
                                <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
                                        <span>
                                            {lang === 'pt' ? 'Acesse o e-mail ' : 'Check the email '}
                                            {clientEmail && <strong className="text-primary font-bold">{clientEmail}</strong>}
                                            {lang === 'pt'
                                                ? ' que você informou para o recebimento do guia.'
                                                : ' you used for the guide.'
                                            }
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
                                        <span>{lang === 'pt' ? 'Clique no link de "Ativação de Conta" (Convite).' : 'Click on the "Account Activation" (Invite) link.'}</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
                                        <span>{lang === 'pt' ? 'Defina sua senha e comece seu processo!' : 'Set your password and start your process!'}</span>
                                    </li>
                                    <li className="pt-2 text-xs text-slate-400 italic border-t border-slate-100 dark:border-slate-800 mt-2">
                                        {lang === 'pt'
                                            ? <span>*Nota: O acesso é enviado exclusivamente para o titular do guia ({clientEmail && <strong className="text-primary">{clientEmail}</strong>}), mesmo que o pagamento tenha sido feito por um terceiro.</span>
                                            : <span>*Note: Access is sent exclusively to the guide holder ({clientEmail && <strong className="text-primary">{clientEmail}</strong>}), even if payment was made by someone else.</span>
                                        }
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <div className="bg-primary/5 rounded-2xl p-6 mb-8 text-center border border-primary/20">
                                <p className="text-primary font-medium">
                                    {lang === 'pt'
                                        ? 'O novo guia já foi adicionado ao seu painel!'
                                        : 'The new guide has been added to your dashboard!'}
                                </p>
                            </div>
                        )}

                    </>
                )}
            </motion.div>
        </div>
    );
};

export default CheckoutSuccess;
