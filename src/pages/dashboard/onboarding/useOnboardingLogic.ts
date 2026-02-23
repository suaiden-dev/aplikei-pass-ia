
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { OnboardingData, UploadedDocument } from "./types";

export const useOnboardingLogic = () => {
    const { lang, t } = useLanguage();
    const o = t.onboardingPage;
    const steps = o.steps[lang];
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        localStorage.setItem("onboarding_step", currentStep.toString());
    }, [currentStep]);

    // Document Upload State
    const [uploading, setUploading] = useState<string | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form Handling
    const { register, handleSubmit, setValue, watch, reset, trigger, formState: { errors } } = useForm<OnboardingData>();
    const formData = watch();

    // Load User Data & Service
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch or create user service
            let { data: service, error: serviceError } = await supabase
                .from("user_services")
                .select("id, status, current_step")
                .eq("user_id", user.id)
                .in("status", ["active", "review_pending"])
                .maybeSingle();

            if (serviceError) {
                console.error("Error fetching service:", serviceError);
                return;
            }

            let serviceId;
            if (!service) {
                try {
                    const { data: newService, error: createError } = await supabase
                        .from("user_services")
                        .insert({ user_id: user.id, service_slug: "visto-b1-b2", status: "active" })
                        .select()
                        .single();

                    if (createError) throw createError;
                    serviceId = newService.id;
                } catch (err) {
                    console.error("Error creating service:", err);
                    return;
                }
            } else {
                serviceId = service.id;

                // Synchronize step from DB
                // @ts-ignore
                if (service.current_step !== undefined && service.current_step !== null) {
                    // If current_step is 5 (finalized), show the last step (Review - index 4)
                    // @ts-ignore
                    const stepToIndex = Math.min(service.current_step, 4);
                    setCurrentStep(stepToIndex);
                }
            }

            // Load form responses
            const { data: responses } = await supabase
                .from("onboarding_responses")
                .select("step_slug, data")
                .eq("user_service_id", serviceId);

            if (responses) {
                const combinedData = responses.reduce((acc: any, curr: any) => ({ ...acc, ...curr.data }), {});
                reset(combinedData);
            }

            // Load uploaded documents
            const { data: docs } = await supabase.from("documents").select("name, storage_path").eq("user_id", user.id);
            if (docs) {
                setUploadedDocs(docs.map(d => ({ name: d.name, path: d.storage_path })));
            }
        };
        loadData().finally(() => setLoading(false));
    }, [reset]);

    const normalizeFileName = (str: string) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9.-]/g, "_")
            .toLowerCase();
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(docName);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data: service } = await supabase
                .from("user_services")
                .select("id")
                .eq("user_id", user.id)
                .eq("status", "active")
                .maybeSingle();

            if (!service) throw new Error("No active service");

            const fileExt = file.name.split(".").pop();
            const safeDocName = normalizeFileName(docName);
            const filePath = `${user.id}/${safeDocName}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("documents")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { error: dbError } = await supabase
                .from("documents")
                .upsert({
                    user_id: user.id,
                    user_service_id: service.id,
                    name: docName,
                    storage_path: filePath,
                    status: "received",
                    created_at: new Date().toISOString()
                }, { onConflict: "user_id,name" });

            if (dbError) throw dbError;

            toast.success(lang === "pt" ? "Documento enviado!" : "Document uploaded!");

            // Refresh uploaded docs list
            const { data: docs } = await supabase.from("documents").select("name, storage_path").eq("user_id", user.id);
            if (docs) {
                setUploadedDocs(docs.map(d => ({ name: d.name, path: d.storage_path })));
            }

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setUploading(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveDoc = async (docName: string) => {
        try {
            const { error } = await supabase.from("documents").delete().match({ name: docName });
            if (!error) {
                toast.success(lang === 'pt' ? 'Removido!' : 'Removed!');
                setUploadedDocs(prev => prev.filter(d => d.name !== docName));
            } else {
                throw error;
            }
        } catch (error: any) {
            console.error("Error removing doc:", error);
            toast.error("Error removing document");
        }
    };

    const saveCurrentStep = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: service } = await supabase
            .from("user_services")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "active")
            .maybeSingle();

        if (!service) return;

        const stepSlugs = ["personal", "history", "process", "documents", "review"];
        const currentSlug = stepSlugs[currentStep];

        // Only save form data steps
        let stepData: any = {};
        if (currentStep === 0) {
            stepData = {
                fullName: formData.fullName,
                dob: formData.dob,
                passportNumber: formData.passportNumber,
                nationality: formData.nationality,
                currentAddress: formData.currentAddress
            };
        } else if (currentStep === 1) {
            stepData = {
                travelledBefore: formData.travelledBefore,
                hadVisa: formData.hadVisa,
                countriesVisited: formData.countriesVisited
            };
        } else if (currentStep === 2) {
            stepData = {
                travelPurpose: formData.travelPurpose,
                expectedDate: formData.expectedDate,
                expectedDuration: formData.expectedDuration,
                consulateCity: formData.consulateCity
            };
        }

        if (Object.keys(stepData).length > 0) {
            const { error } = await supabase
                .from("onboarding_responses")
                .upsert({
                    user_service_id: service.id,
                    step_slug: currentSlug,
                    data: stepData,
                    updated_at: new Date().toISOString()
                }, { onConflict: "user_service_id,step_slug" });

            if (error) console.error("Error saving step:", error);
        }
    };

    const validateCurrentStep = async () => {
        if (currentStep === 0) {
            return await trigger(["fullName", "dob", "passportNumber", "nationality", "currentAddress"]);
        } else if (currentStep === 1) {
            return await trigger(["travelledBefore", "hadVisa", "countriesVisited"]);
        } else if (currentStep === 2) {
            return await trigger(["travelPurpose", "expectedDate", "expectedDuration", "consulateCity"]);
        } else if (currentStep === 3) {
            const requiredDocs = [o.docPassport[lang], o.docPhoto[lang]]; // Example requirements
            const uploadedNames = uploadedDocs.map(d => d.name);
            const missing = requiredDocs.filter(req => !uploadedNames.includes(req));

            if (missing.length > 0) {
                toast.error(lang === 'pt' ? `Faltam documentos: ${missing.join(", ")}` : `Missing documents: ${missing.join(", ")}`);
                return false;
            }
            return true;
        }
        return true;
    };

    const handleNext = async () => {
        const isValid = await validateCurrentStep();
        if (!isValid) return;

        await saveCurrentStep();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: service } = await supabase
                    .from("user_services")
                    .select("id")
                    .eq("user_id", user.id)
                    .eq("status", "active")
                    .maybeSingle();

                if (service) {
                    // @ts-ignore
                    await supabase.from("user_services").update({ current_step: currentStep + 1 }).eq("id", service.id);
                }
            }
        } catch (error) {
            console.error("Error updating step:", error);
        }

        setCurrentStep((s) => s + 1);
    };

    const handleFinish = async () => {
        console.log("🔵 [handleFinish] Starting onboarding finalization...");
        await saveCurrentStep();
        console.log("🟢 [handleFinish] Current step data saved.");

        try {
            const { data: { user } } = await supabase.auth.getUser();
            console.log("👤 [handleFinish] User authenticated:", user?.id);

            if (user) {
                const { data: service, error: serviceError } = await supabase
                    .from("user_services")
                    .select("id, status")
                    .eq("user_id", user.id)
                    .eq("status", "active")
                    .maybeSingle();

                if (serviceError) console.error("🔴 [handleFinish] Error fetching service:", serviceError);
                console.log("🛠️ [handleFinish] Active service found:", service);

                if (service) {
                    console.log("🔄 [handleFinish] Updating service status to 'review_pending'...");
                    const { error: updateError } = await supabase
                        .from("user_services")
                        // @ts-ignore
                        .update({ current_step: 5, status: 'review_pending' })
                        .eq("id", service.id);

                    if (updateError) {
                        console.error("🔴 [handleFinish] Error updating service:", updateError);
                    } else {
                        console.log("✅ [handleFinish] Service updated successfully.");
                    }
                } else {
                    console.warn("⚠️ [handleFinish] No active service found to update.");
                }
            }
        } catch (err) {
            console.error("🔴 [handleFinish] Unexpected error:", err);
        }

        console.log("🏁 [handleFinish] Redirecting to dashboard...");
        toast.success(lang === 'pt' ? 'Pacote gerado com sucesso!' : 'Package generated successfully!');
        localStorage.removeItem("onboarding_step");
        window.location.href = "/dashboard";
    };

    return {
        lang, t, o, steps,
        currentStep, setCurrentStep,
        loading,
        uploading, uploadedDocs, fileInputRef, selectedDoc, setSelectedDoc,
        register, handleSubmit, watch, errors, setValue, formData,
        handleUpload, handleRemoveDoc,
        handleNext, handleFinish
    };
};
