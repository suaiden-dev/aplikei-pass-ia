
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProcessRepository } from "@/infrastructure/factories/processFactory";
import { GetUserProcesses } from "@/application/use-cases/user/GetUserProcesses";
import { UserProcess } from "@/domain/user/UserEntities";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

export const useTracking = () => {
  const { session } = useAuth();
  const user = session?.user;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlServiceId = searchParams.get("service_id");

  const [loading, setLoading] = useState(true);
  const [process, setProcess] = useState<UserProcess | null>(null);
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [recoveryCase, setRecoveryCase] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isAwaitingPaymentConfirm, setIsAwaitingPaymentConfirm] = useState(false);

  const getStatusPrefix = (p: UserProcess | null) => {
    if (!p) return "COS_";
    if (p.productType) return p.productType + "_";
    return p.serviceSlug === "extensao-status" ? "EOS_" : "COS_";
  };

  const fetchProcess = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const repo = getUserProcessRepository();
      const getUserProcesses = new GetUserProcesses(repo);
      const processes = await getUserProcesses.execute(user.id);
      
      const cosProcess = urlServiceId 
        ? processes.find(p => p.id === urlServiceId)
        : processes.find(p => 
            (p.productType === 'COS' || p.productType === 'EOS' || p.serviceSlug === "troca-status" || p.serviceSlug === "extensao-status") &&
            (p.status.startsWith("COS_") || p.status.startsWith("EOS_") || p.status.includes("ANALISE") || p.status.includes("MOTION"))
          ) || processes.find(p => 
            p.productType === 'COS' || p.productType === 'EOS' || p.serviceSlug === "troca-status" || p.serviceSlug === "extensao-status"
          ) || processes[0]; 
      
      if (cosProcess) {
        setProcess(cosProcess);
        if (cosProcess.data?.trackingCode) {
          setTrackingCode(cosProcess.data.trackingCode);
        }
        
        const isRecovery = cosProcess.status.startsWith("COS_") || 
                           cosProcess.status.startsWith("EOS_") ||
                           cosProcess.status.includes("ANALISE") || 
                           cosProcess.status.includes("MOTION");
                           
        if (isRecovery) {
          const { data: rc } = await supabase
            .from("cos_recovery_cases")
            .select("*")
            .eq("user_service_id", cosProcess.id)
            .maybeSingle();
          if (rc) {
            setRecoveryCase(rc);
          }
        }
      }
    } catch (error) {
      console.error("useTracking: Error fetching process:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchProcess();
    
    const serviceChannel = supabase.channel(`user_services_all`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "user_services" }, (payload: any) => {
        if (payload.new.user_id === user.id) {
          setProcess(prev => prev && prev.id === payload.new.id ? { ...prev, status: payload.new.status } : prev);
        }
      })
      .subscribe();

    const recoveryChannel = supabase.channel(`cos_recovery_all`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "cos_recovery_cases" }, (payload: any) => {
        if (process && payload.new.user_service_id === process.id) {
          setRecoveryCase(payload.new);
        }
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(serviceChannel); 
      supabase.removeChannel(recoveryChannel);
    };
  }, [user, process?.id, fetchProcess]);

  const handleSaveTracking = async () => {
    if (!process || !trackingCode.trim()) return;
    setIsSaving(true);
    try {
      const repo = getUserProcessRepository();
      const updatedData = { ...process.data, trackingCode: trackingCode.trim().toUpperCase() };
      await repo.updateData(process.id, updatedData);
      setProcess({ ...process, data: updatedData });
      setIsEditing(false);
      toast.success("Código de rastreio salvo!");
    } catch (e) {
      toast.error("Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmStatus = async () => {
    if (!process || !selectedOutcome) return;
    setIsUpdatingStatus(true);
    const metadata = (process.service_metadata as any) || {};
    const currentType = metadata.recovery_type || 'none';
    const prefix = getStatusPrefix(process);
    
    // State detection for routing rejection to the correct flow:
    // - At standard tracking → COS_REJECTED (begins Motion)
    // - After RFE flow completed/in-progress → COS_REJECTED (begins Motion)
    // - Already in Motion flow → "rejected" (truly final)
    const isAtStart = process.status.endsWith("_TRACKING");
    const isAfterRfe = process.status.includes("_RFE") || 
                       process.status.includes("_COMPLETED") ||
                       process.status === "rejected"; 
    const isAlreadyInMotion = process.status.includes("_MOTION_") || 
                              process.status.includes("MOTION_IN_PROGRESS");

    try {
      let statusToSave = "";
      let newRecursiveType = "";
      
      if (selectedOutcome === "approved") {
        statusToSave = "approved";
      } else if (selectedOutcome === "rejected") {
        if (isAlreadyInMotion) {
          // Motion was tried and still denied → truly final
          statusToSave = "MOTION_REJECTED";
        } else if (isAtStart || isAfterRfe) {
          // Either initial rejection or post-RFE denial → start Motion
          statusToSave = prefix + "REJECTED";
          newRecursiveType = "motion";
        } else {
          // Fallback: treat as starting Motion
          statusToSave = prefix + "REJECTED";
          newRecursiveType = "motion";
        }
      } else if (selectedOutcome === "rfe") {
        statusToSave = prefix + "RFE"; // Starts RFE
        newRecursiveType = "rfe";
      }

      const { data: currentSvc } = await supabase
        .from("user_services")
        .select("service_metadata")
        .eq("id", process.id)
        .single();

      const existingMetadata = (currentSvc as any)?.service_metadata || {};
      const updatedMetadata = { ...existingMetadata };
      
      if (newRecursiveType) {
        updatedMetadata.recovery_type = newRecursiveType;
      }

      const { error } = await supabase
        .from("user_services")
        .update({ 
          status: statusToSave,
          service_metadata: updatedMetadata
        })
        .eq("id", process.id);
      
      if (error) {
        console.error("Error updating status:", error);
        throw error;
      }
      
      toast.success("Status atualizado com sucesso!");
      setIsConfirmOpen(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) {
      toast.error(`Erro: ${e.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !process || !user) return;
    setIsUploading(true);
    try {
      const newUrls = [...uploadedFiles];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = `recovery_cases/${user.id}/${process.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('process-documents').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = await supabase.storage.from('process-documents').createSignedUrl(filePath, 31536000);
        if (data?.signedUrl) newUrls.push(data.signedUrl);
      }
      setUploadedFiles(newUrls);
      toast.success("Documentos enviados!");
    } catch (e) {
      toast.error("Erro no upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitAnalysis = async () => {
    if (!process || !explanation.trim()) return;
    setIsUpdatingStatus(true);
    const prefix = getStatusPrefix(process);
    
    try {
      const { data: existing, error: fetchErr } = await supabase.from("cos_recovery_cases").select("id").eq("user_service_id", process.id).maybeSingle();
      if (fetchErr) throw fetchErr;
      
      const payload = { 
        explanation: explanation.trim(), 
        document_urls: uploadedFiles, 
        submitted_at: new Date().toISOString(), 
        status: "pending", 
        updated_at: new Date().toISOString() 
      };
      
      if (existing?.id) {
        const { error: updateErr } = await supabase.from("cos_recovery_cases").update(payload).eq("id", existing.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase.from("cos_recovery_cases").insert({ ...payload, user_service_id: process.id, user_id: user!.id });
        if (insertErr) throw insertErr;
      }
      
      const nextStatus = prefix + "ANALISE_PENDENTE";
      const { error: svcErr } = await supabase.from("user_services").update({ status: nextStatus }).eq("id", process.id);
      if (svcErr) throw svcErr;
      
      setProcess({ ...process, status: nextStatus });
      toast.success("Enviado para análise!");
    } catch (e: any) {
      console.error("[useTracking] Error submitting analysis:", e);
      toast.error(`Erro ao enviar: ${e.message || "Erro desconhecido"}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return {
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
    isUploading,
    explanation,
    setExplanation,
    uploadedFiles,
    isAwaitingPaymentConfirm,
    handleSaveTracking,
    handleConfirmStatus,
    handleFileUpload,
    handleSubmitAnalysis,
    fetchProcess,
    navigate,
    user
  };
};
