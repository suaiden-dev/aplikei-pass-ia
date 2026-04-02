import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useOnboardingBase } from "./useOnboardingBase";
import { COS_FIELD_MAPPING, COS_STEP_SLUGS } from "./OnboardingConfig";
import { getOnboardingRepository } from "@/infrastructure/factories/onboardingFactory";
import { getUserProcessRepository } from "@/infrastructure/factories/processFactory";
import { SaveOnboardingStep } from "@/application/use-cases/onboarding/SaveOnboardingStep";

export const useCOSFlow = (base: ReturnType<typeof useOnboardingBase>) => {
    const { 
        serviceId, formData, currentStep, setCurrentStep, serviceStatus, setServiceStatus,
        lang, o, t, uploadedDocs 
    } = base;

    const navigate = useNavigate();
    const allSteps = (t.changeOfStatus as any).steps[lang];
    const isF1F2 = formData?.targetVisa === "f1/f2";
    
    const steps = isF1F2 ? allSteps : allSteps.filter((_: any, i: number) => i !== 4 && i !== 5);
    const stepSlugs = isF1F2 ? COS_STEP_SLUGS : COS_STEP_SLUGS.filter((_: any, i: number) => i !== 4 && i !== 5);

    const getEffectiveStep = () => {
        const rejectedDocNames = uploadedDocs.filter((d) => d.status === "resubmit").map((d) => d.name);
        const phase1DocPrefixes = ["cos_i94", "cos_passport", "cos_visa", "cos_proof", "cos_bank", "cos_marriage", "cos_birth"];
        
        if (rejectedDocNames.some((name) => phase1DocPrefixes.some((prefix) => name.startsWith(prefix)))) return stepSlugs.indexOf("cos-documents");
        if (rejectedDocNames.some((name) => name.includes("i539"))) return stepSlugs.indexOf("cos-official-forms");
        if (rejectedDocNames.some((name) => name.includes("i20"))) return stepSlugs.indexOf("cos-i20");
        if (rejectedDocNames.some((name) => name.includes("sevis"))) return stepSlugs.indexOf("cos-sevis");
        if (rejectedDocNames.some((name) => name.includes("g1145") || name.includes("g1450"))) return stepSlugs.indexOf("cos-final-forms");

        const finalStepIdx = stepSlugs.length - 1;
        
        if (serviceStatus?.includes("REJECTED") || serviceStatus?.includes("RFE") || serviceStatus?.includes("TRACKING")) return finalStepIdx;
        if (serviceStatus?.includes("ANALISE") || serviceStatus?.includes("MOTION")) return finalStepIdx;

        let index = -1;
        if (serviceStatus?.includes("OFFICIAL_FORMS")) index = stepSlugs.indexOf("cos-official-forms");
        else if (serviceStatus?.includes("COVER_LETTER")) index = stepSlugs.indexOf("cos-cover-letter-form");
        else if (serviceStatus?.includes("F1_I20")) index = stepSlugs.indexOf("cos-i20");
        else if (serviceStatus?.includes("SEVIS")) index = stepSlugs.indexOf("cos-sevis");
        else if (serviceStatus?.includes("FINAL_FORMS")) index = stepSlugs.indexOf("cos-final-forms");
        else if (serviceStatus?.includes("ADMIN_SCREENING")) index = stepSlugs.indexOf("cos-documents");
        else if (serviceStatus?.includes("PACK_READY")) index = stepSlugs.indexOf("cos-review");

        if (index !== -1) return Math.min(index, finalStepIdx);
        
        // Se estiver em qualquer status que comece com COS_ ou EOS_ mas não caiu nos mapeamentos acima,
        // consideramos que já está no fluxo de acompanhamento/análise final.
        if (serviceStatus?.startsWith("COS_") || serviceStatus?.startsWith("EOS_")) {
            return finalStepIdx;
        }

        return Math.min(currentStep, finalStepIdx);
    };

    const saveStep = async () => {
        if (!serviceId) return;
        const currentSlug = stepSlugs[currentStep];
        if (!currentSlug || currentSlug.includes("documents") || currentSlug === "cos-review") return;

        try {
            const onboardingRepo = getOnboardingRepository();
            const processRepo = getUserProcessRepository();
            const saveUseCase = new SaveOnboardingStep(onboardingRepo, processRepo);
            
            const fieldsToSave = COS_FIELD_MAPPING[currentSlug] || Object.keys(formData);
            const scopedData = fieldsToSave.reduce((acc, key) => {
                if (formData[key as keyof typeof formData] !== undefined) acc[key] = formData[key as keyof typeof formData];
                return acc;
            }, {} as Record<string, unknown>);

            await saveUseCase.execute(serviceId, currentSlug, currentStep, scopedData);
        } catch (error) {
            console.error("Error saving COS step:", error);
            toast.error(o.errorSavingStep[lang]);
        }
    };

    const handleNext = async () => {
        const prefix = formData?.targetVisa === "f1/f2" ? "COS_" : (base.originalServiceSlug === "extensao-status" ? "EOS_" : "COS_");
        
        const reviewStatuses = [
            "COS_ADMIN_SCREENING", "EOS_ADMIN_SCREENING",
            "COS_OFFICIAL_FORMS_REVIEW", "EOS_OFFICIAL_FORMS_REVIEW",
            "COS_COVER_LETTER_ADMIN_REVIEW", "EOS_COVER_LETTER_ADMIN_REVIEW",
            "COS_F1_I20_REVIEW", "EOS_F1_I20_REVIEW",
            "COS_SEVIS_FEE_REVIEW", "EOS_SEVIS_FEE_REVIEW",
            "COS_FINAL_FORMS_REVIEW", "EOS_FINAL_FORMS_REVIEW"
        ];
        
        if (reviewStatuses.includes(serviceStatus || "")) {
            toast.error(lang === "pt" ? "Aguarde a revisão do administrador." : "Please wait for administrator review.");
            return;
        }

        base.setIsNextLoading(true);
        try {
            await saveStep();
            const eStep = getEffectiveStep();
            const currentSlug = stepSlugs[eStep];

            const statusTransitions: Record<string, { status: string, msg: string }> = {
                "cos-documents": { status: prefix + "ADMIN_SCREENING", msg: lang === "pt" ? "Documentos enviados para triagem!" : "Documents sent for screening!" },
                "cos-official-forms": { status: prefix + "OFFICIAL_FORMS_REVIEW", msg: lang === "pt" ? "Formulário enviado para revisão!" : "Form sent for review!" },
                "cos-i20": { status: prefix + "F1_I20_REVIEW", msg: lang === "pt" ? "Documento I-20 enviado para triagem!" : "I-20 document sent for screening!" },
                "cos-cover-letter-form": { status: prefix + "COVER_LETTER_ADMIN_REVIEW", msg: lang === "pt" ? "Respostas enviadas para revisão!" : "Responses sent for review!" },
                "cos-sevis": { status: prefix + "SEVIS_FEE_REVIEW", msg: lang === "pt" ? "Comprovante SEVIS enviado!" : "SEVIS proof sent!" },
                "cos-final-forms": { status: prefix + "FINAL_FORMS_REVIEW", msg: lang === "pt" ? "Formulários finais enviados!" : "Final forms sent!" }
            };

            if (currentSlug === "cos-review") {
                const processRepo = getUserProcessRepository();
                // Determinar o próximo status baseado no fluxo (Standard ou Recovery)
                let nextStatus = prefix + "TRACKING";
                
                // Se o status atual for relacionado a Motion/RFE e estiver completo
                if (serviceStatus?.includes("MOTION") || serviceStatus?.includes("RFE")) {
                    nextStatus = prefix + "MOTION_COMPLETED";
                }

                try {
                   await processRepo.updateStatus(serviceId!, nextStatus, eStep + 1);
                } catch (err) {
                   console.error("Error updating status to final tracking:", err);
                }
                
                navigate(`/dashboard/acompanhamento?service_id=${serviceId}`);
                return;
            }

            if (statusTransitions[currentSlug]) {
                const { status, msg } = statusTransitions[currentSlug];
                try {
                    const processRepo = getUserProcessRepository();
                    await processRepo.updateStatus(serviceId!, status, eStep + 1);
                    toast.success(msg);
                    
                    // Force state update before reload to be safe
                    setServiceStatus(status);
                    
                    if (status.endsWith("TRACKING")) {
                        navigate(`/dashboard/acompanhamento?service_id=${serviceId}`);
                    } else {
                        window.location.reload();
                    }
                    return; // Crucial: stop execution here
                } catch (error) { 
                    console.error("Error transitioning COS status:", error);
                    toast.error(lang === "pt" ? "Erro ao salvar progresso. Tente novamente." : "Error saving progress. Try again.");
                    return; // Stop here! Don't let it increment step locally
                }
            }

            // Only increment step if NO status transition was required
            setCurrentStep(eStep + 1);
        } finally {
            base.setIsNextLoading(false);
        }
    };

    return { steps, stepSlugs, effectiveStep: getEffectiveStep(), handleNext, saveStep };
};
