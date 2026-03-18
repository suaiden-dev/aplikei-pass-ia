import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Loader2, ThumbsDown, MessageSquare } from "lucide-react";
import { Button } from "@/presentation/components/atoms/button";
import { Badge } from "@/presentation/components/atoms/badge";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RejectedReapplyStepProps {
  serviceId: string | null;
  serviceSlug: string | null;
  onShowSpecialist?: () => void;
}

export function RejectedReapplyStep({
  serviceId,
  serviceSlug,
  onShowSpecialist,
}: RejectedReapplyStepProps) {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const aw = t.onboardingPage.awaitingInterview;
  const { session } = useAuth();
  const user = session?.user;
  const [loading, setLoading] = useState(false);

  const handleReapply = async () => {
    if (!user || !serviceSlug) return;
    setLoading(true);

    try {
      // Fetch user profile for email/name
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name, phone")
        .eq("id", user.id)
        .single();

      const originUrl = window.location.origin;

      const { data, error } = await supabase.functions.invoke(
        "stripe-checkout",
        {
          body: {
            slug: serviceSlug,
            email: profile?.email || user.email,
            fullName: profile?.full_name || "",
            phone: profile?.phone || "",
            dependents: 0,
            origin_url: originUrl,
            paymentMethod: "card",
            action: "reapply",
            serviceId: serviceId,
            discountPct: 20,
          },
        },
      );

      if (error || !data?.url) throw new Error(error?.message || "Checkout error");

      window.location.href = data.url;
    } catch (err) {
      console.error("Reapply checkout error:", err);
      toast.error("Erro ao abrir checkout. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-2xl mx-auto">
      {/* Rejection acknowledgement */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-red-100 dark:bg-red-900/40 rounded-full">
          <ThumbsDown className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-500 border-red-500/20 px-4 py-1 rounded-full font-black text-[10px] tracking-[0.2em] uppercase"
        >
          {aw.outcome[lang]}
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          {aw.visaRefusedTitle[lang]}
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {aw.visaRefusedDesc[lang]}
        </p>
      </div>

      {/* Reapply offer card */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/5 via-background to-accent/10 p-6 sm:p-8 shadow-xl shadow-accent/10">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <Badge className="bg-accent text-white border-none font-black text-xs tracking-wider px-3 py-1 shadow-lg shadow-accent/30">
                {aw.reapplyDiscount[lang]}
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2">
              {aw.reapplyTitle[lang]}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {aw.reapplyDesc[lang]}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              className="w-full sm:flex-1 bg-accent hover:bg-accent/90 text-white font-black shadow-lg shadow-accent/25 gap-2 h-auto py-4 sm:py-6"
              onClick={handleReapply}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin hidden sm:block" />
                  {aw.reapplyProcessing[lang]}
                </>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5 hidden sm:block" />
                  {aw.reapplyCTA[lang]}
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:flex-1 border-accent/30 text-accent hover:bg-accent/5 font-bold gap-2 h-auto py-4 sm:py-6"
              onClick={onShowSpecialist}
              disabled={loading}
            >
              <MessageSquare className="h-5 w-5 hidden sm:block" />
              {aw.reviewCaseSpecialist[lang]}
            </Button>
          </div>
        </div>
      </div>

      {/* Back to Dashboard Link */}
      <div className="text-center pt-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm font-bold text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          {lang === "pt" ? "Voltar ao Início" : "Back to Home"}
        </button>
      </div>
    </div>
  );
}
