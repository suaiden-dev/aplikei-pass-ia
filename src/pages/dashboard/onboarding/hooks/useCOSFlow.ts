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

        if (serviceStatus === "COS_F1_I20") return stepSlugs.indexOf("cos-i20");
        if (serviceStatus === "COS_F1_SEVIS") return stepSlugs.indexOf("cos-sevis");
        if (serviceStatus === "COS_FINAL_FORMS") return stepSlugs.indexOf("cos-final-forms");

        const reviewMap: Record<string, string> = {
            "COS_ADMIN_SCREENING": "cos-documents",
            "COS_OFFICIAL_FORMS_REVIEW": "cos-official-forms",
            "COS_COVER_LETTER_ADMIN_REVIEW": "cos-cover-letter-form",
            "COS_F1_I20_REVIEW": "cos-i20",
            "COS_SEVIS_FEE_REVIEW": "cos-sevis",
            "COS_FINAL_FORMS_REVIEW": "cos-final-forms"
        };
        if (reviewMap[serviceStatus || ""]) return stepSlugs.indexOf(reviewMap[serviceStatus || ""]);

        return currentStep;
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
        const reviewStatuses = ["COS_ADMIN_SCREENING", "COS_OFFICIAL_FORMS_REVIEW", "COS_COVER_LETTER_ADMIN_REVIEW", "COS_F1_I20_REVIEW", "COS_SEVIS_FEE_REVIEW", "COS_FINAL_FORMS_REVIEW"];
        if (reviewStatuses.includes(serviceStatus || "")) {
            toast.error(lang === "pt" ? "Aguarde a revisão do administrador." : "Please wait for administrator review.");
            return;
        }

        await saveStep();
        const currentSlug = stepSlugs[currentStep];

        const statusTransitions: Record<string, { status: string, msg: string }> = {
            "cos-documents": { status: "COS_ADMIN_SCREENING", msg: lang === "pt" ? "Documentos enviados para triagem!" : "Documents sent for screening!" },
            "cos-i20": { status: "COS_F1_I20_REVIEW", msg: lang === "pt" ? "Documento I-20 enviado para triagem!" : "I-20 document sent for screening!" },
            "cos-cover-letter-form": { status: "COS_COVER_LETTER_ADMIN_REVIEW", msg: lang === "pt" ? "Respostas enviadas para revisão!" : "Responses sent for review!" },
            "cos-sevis": { status: "COS_SEVIS_FEE_REVIEW", msg: lang === "pt" ? "Comprovante SEVIS enviado!" : "SEVIS proof sent!" },
            "cos-final-forms": { status: "COS_FINAL_FORMS_REVIEW", msg: lang === "pt" ? "Formulários finais enviados!" : "Final forms sent!" }
        };

        if (statusTransitions[currentSlug]) {
            const { status, msg } = statusTransitions[currentSlug];
            try {
                const processRepo = getUserProcessRepository();
                await processRepo.updateStatus(serviceId!, status, currentStep + 1);
                toast.success(msg);
                window.location.reload();
                return;
            } catch (error) { console.error("Error transitioning COS status:", error); }
        }

        setCurrentStep(currentStep + 1);
    };

    return { steps, stepSlugs, effectiveStep: getEffectiveStep(), handleNext, saveStep };
};
