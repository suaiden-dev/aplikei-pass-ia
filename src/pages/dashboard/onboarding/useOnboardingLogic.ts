import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { OnboardingData, UploadedDocument } from "./types";

export const useOnboardingLogic = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlServiceId = searchParams.get("service_id");
    const { lang, t } = useLanguage();
    const [serviceSlug, setServiceSlug] = useState<string>("visto-b1-b2"); // Default to b1/b2
    const [loading, setLoading] = useState(true);
    const [serviceId, setServiceId] = useState<string | null>(null);
    const [serviceStatus, setServiceStatus] = useState<string | null>(null);
    const [securityData, setSecurityData] = useState<{ appId: string; dob: string; grandma: string } | null>(null);
    const [currentStep, setCurrentStep] = useState(() => {
        const saved = localStorage.getItem("onboarding_step");
        return saved ? parseInt(saved, 10) : 0;
    });
    const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});

    const o = t.onboardingPage;
    const ds = t.ds160;

    // Dynamically determine steps based on service
    const steps = serviceSlug === "visto-b1-b2" ? ds.steps[lang] : o.steps[lang];
    const totalSteps = steps.length;

    const stepSlugs = serviceSlug === "visto-b1-b2"
        ? [
            "personal1", "personal2", "travel",
            "companions", "previous-travel", "address-phone",
            "social-media", "passport", "us-contact", "family",
            "work-education", "additional", "documents", "review"
        ]
        : ["personal", "history", "process", "documents", "review"];

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
            // We order by created_at desc to get the latest one if multiple exist, 
            // but we also try to find the one that matches our target slug or just the active one.
            const { data: services, error: serviceError } = await supabase
                .from("user_services")
                .select("id, status, current_step, service_slug, application_id, date_of_birth, grandmother_name")
                .eq("user_id", user.id)
                .in("status", [
                    "active", 
                    "review_pending", 
                    "review_assign", 
                    "ds160InProgress", 
                    "ds160Processing", 
                    "ds160upload_documents", 
                    "ds160AwaitingReviewAndSignature",
                    "uploadsUnderReview",
                    "casvSchedulingPending",
                    "casvFeeProcessing",
                    "casvPaymentPending",
                    "awaitingInterview",
                    "approved",
                    "rejected",
                    "completed"
                ])
                .order("created_at", { ascending: false });

            if (serviceError) {
                console.error("Error fetching service:", serviceError);
                return;
            }

            // Find the best service to use: 
            // 1. Match the ID from URL if provided
            // 2. Match the target slug
            // 3. Take the most recent one
            const service = urlServiceId 
                ? services?.find(s => s.id === urlServiceId)
                : (services?.find(s => s.service_slug === "visto-b1-b2") || services?.[0]);

            let sId: string;
            let slug = "visto-b1-b2";

            if (!service) {
                try {
                    const { data: newService, error: createError } = await supabase
                        .from("user_services")
                        .insert({ user_id: user.id, service_slug: slug, status: "ds160InProgress" })
                        .select()
                        .single();

                    if (createError || !newService) throw createError || new Error("Failed to create service");
                    sId = newService.id;
                    setServiceId(sId);
                    setServiceSlug(slug);
                } catch (err) {
                    console.error("Error creating service:", err);
                    return;
                }
            } else {
                sId = service.id;
                setServiceId(sId);
                const status = service.status || "active";
                setServiceStatus(status);
                slug = service.service_slug || "visto-b1-b2";
                setServiceSlug(slug);

                if (service.application_id) {
                    setSecurityData({
                        appId: service.application_id,
                        dob: service.date_of_birth || "",
                        grandma: service.grandmother_name || ""
                    });
                }

                // Synchronize step from DB
                if (service.current_step !== undefined && service.current_step !== null) {
                    // Adjust max step based on service
                    const maxStep = slug === "visto-b1-b2" ? 13 : 4;
                    const stepToIndex = Math.min(service.current_step, maxStep);
                    setCurrentStep(stepToIndex);
                }
            }

            // Fetch profile for pre-filling
            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, email")
                .eq("id", user.id)
                .maybeSingle();

            // Load form responses
            const { data: responses, error: responseError } = await supabase
                .from("onboarding_responses")
                .select("step_slug, data")
                .eq("user_service_id", sId);

            if (responseError) {
                console.error("Error loading responses:", responseError);
            } else if (responses) {
                const combinedData = responses.reduce((acc: any, curr: any) => ({ ...acc, ...curr.data }), {});

                // Pre-fill with profile data if empty
                if (profile) {
                    if (!combinedData.email && profile.email) {
                        combinedData.email = profile.email;
                    }
                    if (profile.full_name && (!combinedData.firstName || !combinedData.lastName)) {
                        const nameParts = profile.full_name.trim().split(" ");
                        if (nameParts.length > 1) {
                            if (!combinedData.firstName) combinedData.firstName = nameParts.slice(0, -1).join(" ");
                            if (!combinedData.lastName) combinedData.lastName = nameParts[nameParts.length - 1];
                        } else if (nameParts.length === 1 && !combinedData.firstName) {
                            combinedData.firstName = nameParts[0];
                        }
                    }
                }

                reset(combinedData);
            }

            // Load uploaded documents
            const { data: docs, error: docsError } = await supabase
                .from("documents")
                .select("name, storage_path")
                .eq("user_id", user.id);

            if (docsError) {
                console.error("Error loading documents:", docsError);
            } else if (docs) {
                setUploadedDocs(docs.map(d => ({ name: d.name, path: d.storage_path })));
            }
        };
        loadData().finally(() => setLoading(false));
    }, [reset, urlServiceId]);

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

        const isProcessSpecialDoc = docName === "ds160_assinada" || docName === "ds160_comprovante";

        if (isProcessSpecialDoc) {
            setPendingFiles(prev => ({ ...prev, [docName]: file }));
            // Add a mock document to the list so UI shows it as selected
            setUploadedDocs(prev => {
                if (prev.some(d => d.name === docName)) return prev;
                return [...prev, { name: docName, path: "pending..." }];
            });
            return;
        }

        setUploading(docName);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data: service } = await supabase
                .from("user_services")
                .select("id")
                .eq("user_id", user.id)
                .in("status", ["ds160InProgress", "ds160Processing", "ds160upload_documents", "ds160AwaitingReviewAndSignature", "uploadsUnderReview", "active", "review_pending", "review_assign"])
                .maybeSingle();

            if (!service) throw new Error("No active service");

            const isProcessSpecialDoc = docName === "ds160_assinada" || docName === "ds160_comprovante";
            const bucketName = isProcessSpecialDoc ? "process-documents" : "documents";
            const folderPath = isProcessSpecialDoc ? (service.id) : (user.id);
            const fileExt = file.name.split(".").pop();
            const safeDocName = normalizeFileName(docName);
            const filePath = `${folderPath}/${safeDocName}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { error: dbError } = await supabase
                .from("documents")
                .upsert({
                    user_id: user.id,
                    user_service_id: service.id,
                    name: docName,
                    storage_path: filePath,
                    bucket_id: bucketName,
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
        const isProcessSpecialDoc = docName === "ds160_assinada" || docName === "ds160_comprovante";
        
        if (isProcessSpecialDoc && pendingFiles[docName]) {
            setPendingFiles(prev => {
                const next = { ...prev };
                delete next[docName];
                return next;
            });
            setUploadedDocs(prev => prev.filter(d => d.name !== docName));
            return;
        }

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
        if (!serviceId) return;

        const currentSlug = stepSlugs[currentStep];

        // Only save form data steps (not documents or review)
        if (currentSlug === "documents" || currentSlug === "review") return;

        // In the new approach, we can save the entire formData 
        // specifically for the current step's context if needed, 
        // but for now let's keep it simple and save what's in the form.
        // For DS-160 we'll save the relevant fields per step.

        let stepData: any = {};

        if (serviceSlug === "visto-b1-b2") {
            // Mapping DS-160 steps to fields (simplified for now to save everything)
            // Ideally we'd filter, but since we are using a JSON column, we can save the current state
            stepData = { ...formData };
        } else {
            // Legacy flow
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
        }

        if (Object.keys(stepData).length > 0) {
            const { error } = await supabase
                .from("onboarding_responses")
                .upsert({
                    user_service_id: serviceId,
                    step_slug: currentSlug,
                    data: stepData,
                    updated_at: new Date().toISOString()
                }, { onConflict: "user_service_id,step_slug" });

            if (error) console.error("Error saving step:", error);
        }
    };

    const validateCurrentStep = async () => {
        const currentSlug = stepSlugs[currentStep];

        if (serviceSlug === "visto-b1-b2") {
            switch (currentSlug) {
                case "personal1":
                    return await trigger(["email", "firstName", "lastName", "gender", "maritalStatus", "birthDate", "birthCity", "birthCountry"]);
                case "personal2":
                    return await trigger(["nationalityInfo", "nationalID"]);
                case "travel":
                    return await trigger(["hasSpecificTravelPlan", "arrivalDate", "travelPayer"]);
                case "companions":
                    return await trigger(["hasTravelCompanions", "isTravelingWithGroup"]);
                case "previous-travel":
                    return await trigger(["hasBeenToUS", "hasUSDriverLicense", "hasHadUSVisa", "hasBeenDeniedVisa", "hasImmigrationPetition"]);
                case "address-phone":
                    return await trigger(["homeAddress", "homeCity", "mobilePhone", "hasOtherPhoneLast5Years", "hasOtherEmailLast5Years"]);
                case "social-media":
                    return await trigger(["socialMedia1"]);
                case "passport":
                    return await trigger(["passportType", "passportNumberDS", "passportIssuanceCountry", "passportIssuanceDate", "passportExpirationDate", "hasPassportBeenLostStolen"]);
                case "us-contact":
                    return await trigger(["hasUSContact", "contactName", "contactRelationship", "contactPhone"]);
                case "family":
                    return await trigger(["fatherLastName", "fatherFirstName", "motherLastName", "motherFirstName"]);
                case "work-education":
                    return await trigger(["primaryOccupation", "employerName", "jobStartDate"]);
                case "additional":
                    return true;
                case "documents": {
                    const requiredDocs = [o.docPhoto[lang]]; // Only selfie for B1/B2
                    const uploadedNames = uploadedDocs.map(d => d.name);
                    const missing = requiredDocs.filter(req => !uploadedNames.includes(req));

                    if (missing.length > 0) {
                        toast.error(lang === 'pt' ? `Faltam documentos: ${missing.join(", ")}` : `Missing documents: ${missing.join(", ")}`);
                        return false;
                    }
                    return true;
                }
                default:
                    return true;
            }
        }

        // Legacy validation
        if (currentStep === 0) {
            return await trigger(["fullName", "dob", "passportNumber", "nationality", "currentAddress"]);
        } else if (currentStep === 1) {
            return await trigger(["travelledBefore", "hadVisa", "countriesVisited"]);
        } else if (currentStep === 2) {
            return await trigger(["travelPurpose", "expectedDate", "expectedDuration", "consulateCity"]);
        } else if (currentStep === 3) {
            const requiredDocs = [o.docPassport[lang], o.docPhoto[lang]];
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

        if (serviceId) {
            try {
                await supabase
                    .from("user_services")
                    .update({ current_step: currentStep + 1 })
                    .eq("id", serviceId);
            } catch (error) {
                console.error("Error updating step:", error);
            }
        }

        setCurrentStep((s) => s + 1);
    };

    const handleSkip = async () => {
        await saveCurrentStep();

        if (serviceId) {
            try {
                await supabase
                    .from("user_services")
                    .update({ current_step: currentStep + 1 })
                    .eq("id", serviceId);
            } catch (error) {
                console.error("Error updating step:", error);
            }
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

            if (serviceId) {
                const isSignatureSubmit = 
                    serviceStatus === "ds160upload_documents" || 
                    serviceStatus === "ds160AwaitingReviewAndSignature" || 
                    serviceStatus === "review_assign" ||
                    serviceStatus === "uploadsUnderReview";
                
                if (isSignatureSubmit) {
                    // Check if both files are present (either in pendingFiles or already in uploadedDocs)
                    const hasAssinada = pendingFiles["ds160_assinada"] || uploadedDocs.some(d => d.name === "ds160_assinada");
                    const hasComprovante = pendingFiles["ds160_comprovante"] || uploadedDocs.some(d => d.name === "ds160_comprovante");

                    if (!hasAssinada || !hasComprovante) {
                        toast.error(lang === "pt" ? "Você deve selecionar os 2 documentos solicitados." : "You must select both requested documents.");
                        return;
                    }

                    // Perform actual uploads for pending files
                    setLoading(true);
                    for (const [docName, file] of Object.entries(pendingFiles)) {
                        const bucketName = "process-documents";
                        const folderPath = serviceId;
                        const fileExt = file.name.split(".").pop();
                        const safeDocName = normalizeFileName(docName);
                        const filePath = `${folderPath}/${safeDocName}_${Date.now()}.${fileExt}`;

                        const { error: uploadError } = await supabase.storage
                            .from(bucketName)
                            .upload(filePath, file);

                        if (uploadError) throw uploadError;

                        const { error: dbError } = await supabase
                            .from("documents")
                            .upsert({
                                user_id: user?.id,
                                user_service_id: serviceId,
                                name: docName,
                                storage_path: filePath,
                                bucket_id: bucketName,
                                status: "received",
                                created_at: new Date().toISOString()
                            }, { onConflict: "user_id,name" });

                        if (dbError) throw dbError;
                    }
                    setPendingFiles({});
                }

                const nextStatus = isSignatureSubmit ? "ds160AwaitingReviewAndSignature" : "review_pending";

                console.log(`🔄 [handleFinish] Updating service status to '${nextStatus}'...`);
                const { error: updateError } = await supabase
                    .from("user_services")
                    .update({
                        current_step: 13, // Final step for DS-160
                        status: nextStatus,
                    })
                    .eq("id", serviceId);

                if (updateError) {
                    console.error("🔴 [handleFinish] Error updating service:", updateError);
                } else {
                    console.log("✅ [handleFinish] Service updated successfully.");
                }
            } else {
                console.warn("⚠️ [handleFinish] No serviceId found to update.");
            }
        } catch (err: any) {
            console.error("🔴 [handleFinish] Unexpected error:", err);
            toast.error(err.message || "Erro inesperado");
            setLoading(false);
            return;
        } finally {
            setLoading(false);
        }

        console.log("🏁 [handleFinish] Redirecting to dashboard...");
        
        const isSignatureSubmit = 
            serviceStatus === "ds160upload_documents" || 
            serviceStatus === "ds160AwaitingReviewAndSignature" || 
            serviceStatus === "review_assign" ||
            serviceStatus === "uploadsUnderReview";
        toast.success(
            lang === 'pt' 
                ? (isSignatureSubmit ? 'Documentos enviados com sucesso!' : 'Pacote gerado com sucesso!') 
                : (isSignatureSubmit ? 'Documents submitted successfully!' : 'Package generated successfully!')
        );
        localStorage.removeItem("onboarding_step");
        navigate("/dashboard");
    };

    return {
        lang, t, o, steps, serviceSlug,
        currentStep, setCurrentStep,
        loading,
        serviceStatus,
        serviceId,
        securityData,
        uploading, uploadedDocs, fileInputRef, selectedDoc, setSelectedDoc,
        pendingFiles, setPendingFiles,
        register, handleSubmit, watch, errors, setValue, formData,
        handleUpload, handleRemoveDoc,
        handleNext, handleFinish, handleSkip
    };
};
