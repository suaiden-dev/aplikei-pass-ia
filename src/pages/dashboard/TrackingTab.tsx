import { Clock, Truck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Skeleton } from "@/presentation/components/atoms/skeleton";
import { Button } from "@/presentation/components/atoms/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/presentation/components/atoms/alert-dialog";
import { useTracking } from "@/presentation/hooks/useTracking";
import { ProcessFinalStates } from "@/presentation/components/organisms/dashboard/tracking/ProcessFinalStates";
import { RecoveryFlow } from "@/presentation/components/organisms/dashboard/tracking/RecoveryFlow";
import { StandardTracking } from "@/presentation/components/organisms/dashboard/tracking/StandardTracking";

export default function TrackingTab() {
  const { lang, t } = useLanguage();
  const {
    loading,
    process,
    trackingCode,
    setTrackingCode,
    isEditing,
    setIsEditing,
    isSaving,
    isUpdatingStatus,
    selectedOutcome,
    setSelectedOutcome,
    isConfirmOpen,
    setIsConfirmOpen,
    recoveryCase,
    explanation,
    setExplanation,
    isAwaitingPaymentConfirm,
    handleSaveTracking,
    handleConfirmStatus,
    handleFileUpload,
    handleSubmitAnalysis,
    fetchProcess,
    navigate,
    user
  } = useTracking();

  const ct = (t.changeOfStatus as any)?.tracking;

  const renderContent = () => {
    console.log(`[TrackingTab] renderContent - Loading: ${loading}, Process: ${process?.id}, Status: ${process?.status}`);
    if (isAwaitingPaymentConfirm) {
      return (
        <div className="flex flex-col items-center py-24 text-center">
          <Clock className="w-10 h-10 animate-pulse mb-4" />
          <h2 className="text-xl font-bold">Confirmando pagamento...</h2>
        </div>
      );
    }

    if (loading) return <div className="p-8"><Skeleton className="h-48 w-full" /></div>;

    if (!process || !ct) {
      return (
        <div className="py-20 text-center">
          <Truck className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-bold">Processo Indisponível</h2>
          <Button onClick={() => window.location.reload()} className="mt-4">Recarregar</Button>
        </div>
      );
    }

    // Only truly FINAL rejections (after Motion) go to the end screen
    // 'rejected' (after RFE delivery) should go to Motion flow, not the final screen
    const isApproved = process.status === "COS_APPROVED" || process.status === "EOS_APPROVED" || process.status === "MOTION_APPROVED" || process.status === "approved" || process.status === "completed";
    const isRejected = process.status === "MOTION_REJECTED" || process.status === "COS_REJECTED_FINAL" || process.status === "EOS_REJECTED_FINAL";

    if (isApproved || isRejected) {
      return <ProcessFinalStates status={process.status} navigate={navigate} />;
    }

    const recoveryType = (process.service_metadata as any)?.recovery_type || 'none';
    const status = process.status || "";
    const isRecovering =
      status === "rejected" || // RFE was answered but USCIS still denied → go to Motion
      status.toLowerCase().includes("rejected") ||
      status.toLowerCase().includes("analise") ||
      status.toLowerCase().includes("motion") ||
      status.toLowerCase().includes("rfe") ||
      status.toLowerCase().includes("case_form") ||
      recoveryType !== 'none';

    if (isRecovering) {
      return (
        <RecoveryFlow
          process={process}
          recoveryCase={recoveryCase}
          explanation={explanation}
          setExplanation={setExplanation}
          isUpdatingStatus={isUpdatingStatus}
          handleSubmitAnalysis={handleSubmitAnalysis}
          handleFileUpload={handleFileUpload}
          fetchProcess={fetchProcess}
          handleManualRefresh={fetchProcess}
          setSelectedOutcome={setSelectedOutcome}
          setIsConfirmOpen={setIsConfirmOpen}
          navigate={navigate}
          loading={loading}
          userEmail={user?.email}
        />
      );
    }

    return (
      <StandardTracking
        trackingCode={trackingCode}
        setTrackingCode={setTrackingCode}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isSaving={isSaving}
        handleSaveTracking={handleSaveTracking}
        setSelectedOutcome={setSelectedOutcome}
        setIsConfirmOpen={setIsConfirmOpen}
        recoveryType={recoveryType}
      />
    );
  };

  const getOutcomeLabel = () => {
    if (selectedOutcome === "approved") return "APROVADO";
    if (selectedOutcome === "rejected") return "NEGADO";
    if (selectedOutcome === "rfe") return "PENDENTE DE RFE";
    return "";
  };

  const getOutcomeDescription = () => {
    const status = process?.status || "";
    const isAlreadyRecovering = status?.toUpperCase().includes('ANALISE') || status?.toUpperCase().includes('MOTION') || status?.toUpperCase().includes('RFE') || status?.toUpperCase().includes('CASE_FORM') || status?.toUpperCase().includes('REJECTED');
    
    if (selectedOutcome === "approved") return "Isso restabelecerá seu status no sistema como aprovado.";
    if (selectedOutcome === "rejected") {
      if (isAlreadyRecovering) return "Isso encerrará o acompanhamento deste processo definitivamente.";
      return "Isso levará você para o fluxo de Motion (Reconsideração) para tentar reverter a decisão.";
    }
    if (selectedOutcome === "rfe") return "Isso levará você para o fluxo de RFE (Request for Evidence) para enviar as provas solicitadas.";
    return "";
  };

  return (
    <div className="relative">
      {renderContent()}

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="rounded-3xl border border-slate-200 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-slate-800">Confirmar Resultado?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-base">
              Você está marcando este processo como <strong>{getOutcomeLabel()}</strong>.
              <br /><br />
              {getOutcomeDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel asChild>
              <Button variant="ghost" className="rounded-xl px-6 border-none hover:bg-slate-100">Cancelar</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleConfirmStatus}
                disabled={isUpdatingStatus}
                className={`rounded-xl px-10 font-bold ${selectedOutcome === "approved" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {isUpdatingStatus ? "Processando..." : "Confirmar e Encerrar"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
