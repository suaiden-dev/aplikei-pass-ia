import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Bot,
  Users,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Package,
  Building2,
  AlertTriangle,
  PartyPopper,
  Loader2,
  Plane,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { InterviewGuide } from "./InterviewGuide";
import { AIInterviewChat } from "./AIInterviewChat";
import { SpecialistTraining } from "./SpecialistTraining";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
// import { t } from "@/i18n/translations";

interface AwaitingInterviewStepProps {
  serviceId: string | null;
  serviceStatus?: string | null;
}

interface AwaitingInterviewData {
  interview_date: string | null;
  interview_time: string | null;
  interview_location_casv: string | null;
  interview_location_consulate: string | null;
  consulate_interview_date: string | null;
  consulate_interview_time: string | null;
  same_location: boolean | null;
}

export function AwaitingInterviewStep({
  serviceId,
  serviceStatus,
}: AwaitingInterviewStepProps) {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const aw = t.onboardingPage.awaitingInterview;
  const [data, setData] = useState<AwaitingInterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showSpecialist, setShowSpecialist] = useState(false);
  const [activeGuide, setActiveGuide] = useState<
    "correios" | "consular" | "entrada_eua" | null
  >(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!serviceId) return;
      const { data: service } = await supabase
        .from("user_services")
        .select(
          "interview_date, interview_time, interview_location_casv, interview_location_consulate, consulate_interview_date, consulate_interview_time, same_location",
        )
        .eq("id", serviceId)
        .single();

      if (service) {
        setData(service as unknown as AwaitingInterviewData);
      }

      setLoading(false);
    };

    fetchData();
  }, [serviceId]);

  const tools = [
    {
      id: "guide",
      title: aw.tools.guide.title[lang],
      description: aw.tools.guide.desc[lang],
      icon: BookOpen,
      color: "bg-blue-500",
      action: () => setShowGuide(true),
    },
    {
      id: "ai",
      title: aw.tools.ai.title[lang],
      description: aw.tools.ai.desc[lang],
      icon: Bot,
      color: "bg-accent",
      action: () => setShowAIChat(true),
    },
    {
      id: "specialist",
      title: aw.tools.specialist.title[lang],
      description: aw.tools.specialist.desc[lang],
      icon: Users,
      color: "bg-purple-500",
      tag: "PREMIUM",
      action: () => setShowSpecialist(true),
    },
  ];

  // Priority logic for which date to compare:
  // 1. If locations are different (same_location === false), we MUST wait for consulate_interview_date.
  // 2. If locations are the same (same_location === true), we use interview_date.
  // 3. If same_location is not set yet, we fall back to any available date (safe default).

  const interviewDateToCompare =
    data?.same_location === false
      ? data.consulate_interview_date
      : data?.interview_date;

  const isInterviewDateReached = interviewDateToCompare
    ? (() => {
        // Get today's local date in YYYY-MM-DD format
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const todayStr = `${year}-${month}-${day}`;

        // interviewDateToCompare is YYYY-MM-DD
        return todayStr >= (interviewDateToCompare || "");
      })()
    : false;

  const handleInterviewOutcome = async (outcome: "approved" | "rejected") => {
    if (!serviceId) return;
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("user_services")
        .update({ status: outcome })
        .eq("id", serviceId);

      if (error) throw error;

      // Reload is required to let standard routing pick up the new state
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error(aw.errorUpdatingStatus[lang]);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeliveryGuide = (
    guide: "correios" | "consular" | "entrada_eua",
  ) => {
    setActiveGuide(guide);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Clock className="h-8 w-8 animate-spin text-accent/50" />
      </div>
    );
  }

  if (showGuide) {
    return <InterviewGuide onBack={() => setShowGuide(false)} />;
  }

  if (showAIChat) {
    return (
      <AIInterviewChat
        onBack={() => setShowAIChat(false)}
        serviceId={serviceId}
      />
    );
  }

  if (showReview) {
    return (
      <SpecialistTraining
        onBack={() => setShowReview(false)}
        serviceId={serviceId}
        mode="review"
      />
    );
  }

  if (showSpecialist) {
    return (
      <SpecialistTraining
        onBack={() => setShowSpecialist(false)}
        serviceId={serviceId}
      />
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-full lg:max-w-5xl mx-auto space-y-4 sm:space-y-5">
      {serviceStatus === "rejected" && (
        <div className="text-center space-y-4">
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-500 border-red-500/20 px-4 py-1 rounded-full font-black text-[10px] tracking-[0.2em] uppercase mb-4"
          >
            {aw.outcome[lang]}
          </Badge>
          <div className="inline-flex items-center justify-center p-4 bg-red-100 dark:bg-red-900/40 rounded-full mb-2">
            <ThumbsDown className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground text-balance px-4 sm:px-0">
            {aw.visaRefusedTitle[lang]}
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            {aw.visaRefusedDesc[lang]}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowReview(true)}
            >
              <Users className="mr-2 h-4 w-4" />
              {aw.reviewCaseSpecialist[lang]}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() =>
                navigate(
                  `/checkout/visto-b1-b2?action=restart&serviceId=${serviceId}`,
                )
              }
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              {aw.startAgain[lang]}
            </Button>
          </div>
        </div>
      )}

      {serviceStatus === "awaitingInterview" && (
        <div className="text-center space-y-4">
          <Badge
            variant="outline"
            className={`px-4 py-1 rounded-full font-black text-[10px] tracking-[0.2em] uppercase mb-4 ${
              isInterviewDateReached
                ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                : "bg-accent/10 text-accent border-accent/20"
            }`}
          >
            {isInterviewDateReached
              ? aw.interviewDateArrived[lang]
              : aw.finalStagePrep[lang]}
          </Badge>
          {isInterviewDateReached ? (
            <div className="inline-flex items-center justify-center p-4 bg-yellow-100 dark:bg-yellow-900/40 rounded-full mb-2">
              <AlertTriangle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
            </div>
          ) : null}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground text-balance px-4 sm:px-0">
            {isInterviewDateReached
              ? aw.howWasInterview[lang]
              : aw.awaitingInterviewTitle[lang]}
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            {isInterviewDateReached
              ? aw.interviewArrivedDesc[lang]
              : aw.datesConfirmedDesc[lang]}
          </p>
        </div>
      )}

      {(serviceStatus === "approved" || serviceStatus === "completed") && (
        <div className="text-center space-y-4">
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500/20 px-4 py-1 rounded-full font-black text-[10px] tracking-[0.2em] uppercase mb-4"
          >
            {aw.successTag[lang]}
          </Badge>
          <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-900/40 rounded-full mb-2">
            <PartyPopper className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground text-balance px-4 sm:px-0">
            {aw.visaApprovedTitle[lang]}
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            {aw.visaApprovedDesc[lang]}
          </p>

          <div className="max-w-2xl p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left mx-4 sm:mx-auto">
            <AlertTriangle className="h-8 w-8 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-500 shrink-0 sm:mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-800 dark:text-amber-400">
                {aw.visaApprovedDisclaimerTitle[lang]}
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                {aw.visaApprovedDisclaimerBody[lang].replace(
                  "{date}",
                  interviewDateToCompare
                    ? new Date(
                        interviewDateToCompare + "T12:00:00",
                      ).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "---",
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {(serviceStatus === "awaitingInterview" ||
        serviceStatus === "rejected") && (
        <div
          className={cn(
            "grid gap-3 sm:gap-4 w-full px-2 sm:px-0",
            data?.same_location === false
              ? "md:grid-cols-2"
              : "max-w-xl mx-auto",
          )}
        >
          {/* CASV Card */}
          <Card className="border-none bg-slate-50 dark:bg-slate-900/50 rounded-2xl sm:rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden h-full flex flex-col w-full">
            <CardHeader className="bg-accent/5 p-3 sm:p-5 pb-3 sm:pb-5 shrink-0">
              <div className="flex items-center gap-2 text-accent mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {aw.confirmedCasvDate[lang]}
                </span>
              </div>
              <CardTitle className="text-title-xl font-black leading-tight">
                {data?.interview_date
                  ? new Date(
                      data.interview_date + "T12:00:00",
                    ).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  : aw.processing[lang]}
              </CardTitle>
              <CardDescription className="text-lg font-bold text-accent italic">
                {data?.interview_time ? `@ ${data.interview_time}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4 flex-1">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      {aw.casvLocation[lang]}
                    </p>
                    <p className="font-bold text-sm leading-tight">
                      {data?.interview_location_casv || aw.informedShortly[lang]}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consulate Card - Only shown if same_location is false */}
          {data?.same_location === false && (
            <Card className="border-none bg-accent/5 dark:bg-accent/10 rounded-2xl sm:rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden h-full flex flex-col w-full">
              <CardHeader className="bg-accent/10 p-3 sm:p-5 pb-3 sm:pb-5 shrink-0">
                <div className="flex items-center gap-2 text-accent mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {aw.confirmedConsulateDate[lang]}
                  </span>
                </div>
                <CardTitle className="text-title-xl font-black leading-tight">
                  {data?.consulate_interview_date
                    ? new Date(
                        data.consulate_interview_date + "T12:00:00",
                      ).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })
                    : aw.processing[lang]}
                </CardTitle>
                <CardDescription className="text-lg font-bold text-accent italic">
                  {data?.consulate_interview_time
                    ? `@ ${data.consulate_interview_time}`
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4 flex-1 text-foreground">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                        {aw.consulate[lang]}
                      </p>
                      <p className="font-bold text-sm leading-tight">
                        {data?.interview_location_consulate || aw.informedShortly[lang]}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Post-Interview Guide Selector */}
      {(serviceStatus === "approved" || serviceStatus === "completed") && (
        <div className="max-w-3xl mx-auto mt-6">
          {activeGuide === null ? (
            /* Guide Selection Screen */
            <Card className="border-border shadow-2xl rounded-[40px] overflow-hidden bg-card/50 backdrop-blur-md relative">
              <CardHeader className="text-center pb-4 pt-6">
                <CardTitle className="text-title font-black">
                  {aw.howReceiveVisa[lang]}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {aw.consulateRetainsDesc[lang]}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 grid md:grid-cols-2 gap-4">
                {/* Correios Option */}
                <button
                  onClick={() => handleDeliveryGuide("correios")}
                  className="p-5 rounded-[32px] border-2 border-border bg-card hover:border-accent hover:bg-accent/5 transition-all group flex flex-col items-center text-center space-y-4"
                >
                  <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-subtitle font-black tracking-tight mb-2">
                      {aw.postalHome[lang]}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {aw.postalHomeDesc[lang]}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-accent uppercase tracking-widest">
                    {aw.viewGuide[lang]}
                  </span>
                </button>

                {/* CASV Option */}
                <button
                  onClick={() => handleDeliveryGuide("consular")}
                  className="p-5 rounded-[32px] border-2 border-border bg-card hover:border-accent hover:bg-accent/5 transition-all group flex flex-col items-center text-center space-y-4"
                >
                  <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-subtitle font-black tracking-tight mb-2">
                      {aw.pickUpCasv[lang]}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {aw.pickUpCasvDesc[lang]}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-accent uppercase tracking-widest">
                    {aw.viewGuide[lang]}
                  </span>
                </button>
              </CardContent>
            </Card>
          ) : activeGuide === "correios" ? (
            /* Correios Guide */
            <Card className="border-accent/20 shadow-2xl rounded-[40px] overflow-hidden bg-card">
              <CardHeader className="bg-blue-50 dark:bg-blue-950/20 p-4 sm:p-5">
                <button
                  onClick={() => setActiveGuide(null)}
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 mb-4 transition-colors"
                >
                  ← {aw.back[lang]}
                </button>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-blue-500 rounded-md flex items-center justify-center text-white shadow-lg">
                    <Package className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="text-title font-black">
                      {aw.postalServiceDelivery[lang]}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {aw.receivePassportHomeGuide[lang]}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="space-y-4">
                  {aw.guides.correios.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 rounded-md bg-muted/30"
                    >
                      <span className="text-title font-black text-blue-500/30">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="font-bold text-sm">{item.title[lang]}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                          {item.desc[lang]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveGuide(null)}
                  className="w-full mt-2 p-4 rounded-md border-2 border-dashed border-border text-sm font-bold text-muted-foreground hover:border-accent hover:text-accent transition-all"
                >
                  ← {aw.chooseAnother[lang]}
                </button>
              </CardContent>
            </Card>
          ) : activeGuide === "consular" ? (
            /* CASV Guide */
            <Card className="border-accent/20 shadow-2xl rounded-[40px] overflow-hidden bg-card">
              <CardHeader className="bg-purple-50 dark:bg-purple-950/20 p-4 sm:p-5">
                <button
                  onClick={() => setActiveGuide(null)}
                  className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-800 mb-4 transition-colors"
                >
                  ← {aw.back[lang]}
                </button>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-purple-500 rounded-md flex items-center justify-center text-white shadow-lg">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="text-title font-black">
                      {aw.casvPickup[lang]}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {aw.collectPassportPersonGuide[lang]}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="space-y-4">
                  {aw.guides.casv.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 rounded-md bg-muted/30"
                    >
                      <span className="text-title font-black text-purple-500/30">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="font-bold text-sm">{item.title[lang]}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                          {item.desc[lang]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveGuide(null)}
                  className="w-full mt-2 p-4 rounded-md border-2 border-dashed border-border text-sm font-bold text-muted-foreground hover:border-accent hover:text-accent transition-all"
                >
                  ← {aw.chooseAnother[lang]}
                </button>
              </CardContent>
            </Card>
          ) : null}

          {/* US Entry Guide */}
          {activeGuide === "entrada_eua" && (
            <Card className="border-accent/20 shadow-2xl rounded-[40px] overflow-hidden bg-card">
              <CardHeader className="bg-green-50 dark:bg-green-950/20 p-4 sm:p-5">
                <button
                  onClick={() => setActiveGuide(null)}
                  className="flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-800 mb-4 transition-colors"
                >
                  ← {aw.back[lang]}
                </button>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-green-500 rounded-md flex items-center justify-center text-white shadow-lg">
                    <Plane className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="text-title font-black">
                      {aw.usEntryGuide[lang]}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {aw.whatExpectImmigration[lang]}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="space-y-4">
                  {aw.guides.usEntry.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 rounded-md bg-muted/30"
                    >
                      <span className="text-title font-black text-green-500/30">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="font-bold text-sm">{item.title[lang]}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                          {item.desc[lang]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveGuide(null)}
                  className="w-full mt-2 p-4 rounded-md border-2 border-dashed border-border text-sm font-bold text-muted-foreground hover:border-accent hover:text-accent transition-all"
                >
                  ← {aw.chooseAnother[lang]}
                </button>
              </CardContent>
            </Card>
          )}
          {/* Standalone US Entry Guide Card */}
          {activeGuide === null && (
            <button
              onClick={() => handleDeliveryGuide("entrada_eua")}
              className="w-full mt-4 p-4 rounded-[32px] border-2 border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-950/20 hover:border-green-400 dark:hover:border-green-700 hover:bg-green-100 dark:hover:bg-green-950/40 transition-all group flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
            >
              <div className="h-14 w-14 bg-green-500 rounded-md flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform">
                <Plane className="h-7 w-7" />
              </div>
              <div className="flex-1 flex flex-col items-center sm:items-start">
                <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">
                  {aw.nextStep[lang]}
                </p>
                <h3 className="text-lg font-black tracking-tight">
                  {aw.usEntryGuide[lang]}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  {aw.usEntryGuideDesc[lang]}
                </p>
              </div>
              <span className="text-green-600 font-black text-lg shrink-0 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          )}
        </div>
      )}

      {/* Outcome Selection for Awaiting Interview - Only if date is reached */}
      {serviceStatus === "awaitingInterview" && isInterviewDateReached && (
        <Card className="max-w-4xl border-border shadow-2xl rounded-2xl sm:rounded-[40px] overflow-hidden bg-card/10 backdrop-blur-md relative border-dashed mt-6 sm:mt-12 w-full mx-2 sm:mx-auto">
          <CardContent className="p-4 sm:p-5 md:p-12 space-y-4 sm:space-y-5 text-center">
            <div className="space-y-3">
              <h3 className="text-title-xl font-black tracking-tight">
                {aw.interviewTakenPlace[lang]}
              </h3>
              <p className="text-muted-foreground">
                {aw.informOutcome[lang]}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-16 border-2 border-green-500/20 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 hover:text-green-700 font-bold text-lg rounded-[24px]"
                disabled={isUpdatingStatus}
                onClick={() => handleInterviewOutcome("approved")}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ThumbsUp className="h-5 w-5 mr-3" />
                )}
                {aw.iWasApproved[lang]}
              </Button>
              <Button
                variant="outline"
                className="h-16 border-2 border-red-500/20 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 font-bold text-lg rounded-[24px]"
                disabled={isUpdatingStatus}
                onClick={() => handleInterviewOutcome("rejected")}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ThumbsDown className="h-5 w-5 mr-3" />
                )}
                {aw.iWasRefused[lang]}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preparation Tools Section — only shown before the interview date */}
      {serviceStatus === "awaitingInterview" && !isInterviewDateReached && (
        <div className="space-y-4 max-w-4xl mx-auto mt-12">
          <div className="px-4 text-center">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {aw.prepTools[lang]}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-widest">
              {aw.prepApproval[lang]}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3 sm:gap-4 pb-5 px-2 sm:px-0 w-full">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={tool.action}
                className="group flex flex-col items-center text-center p-3 sm:p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-[32px] md:rounded-[40px] hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10 transition-all relative overflow-hidden h-full w-full"
              >
                <div
                  className={cn(
                    "h-16 w-16 rounded-[24px] flex items-center justify-center text-white shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mb-4",
                    tool.color,
                  )}
                >
                  <tool.icon className="h-8 w-8" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-black text-lg tracking-tight leading-tight">
                      {tool.title}
                    </span>
                    {tool.tag && (
                      <Badge
                        variant="secondary"
                        className="bg-accent/10 text-accent text-[8px] font-black h-5 px-2 rounded-md"
                      >
                        {tool.tag}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    {tool.description}
                  </p>
                </div>
                <div className="mt-4 h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
