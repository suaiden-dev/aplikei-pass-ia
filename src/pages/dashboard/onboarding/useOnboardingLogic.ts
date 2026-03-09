import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { OnboardingData, UploadedDocument } from "./types";
import { useAuth } from "@/contexts/AuthContext";

export const useOnboardingLogic = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlServiceId = searchParams.get("service_id");
    const { lang, t } = useLanguage();
    const { user, loading: authLoading } = useAuth();
    const [serviceSlug, setServiceSlug] = useState<string>("visto-b1-b2"); // Default to b1/b2
    const [loading, setLoading] = useState(true);
    const [serviceId, setServiceId] = useState<string | null>(null);
    const [serviceStatus, setServiceStatus] = useState<string | null>(null);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [securityData, setSecurityData] = useState<{ appId: string; dob: string; grandma: string } | null>(null);
    const [hasConsularCredentials, setHasConsularCredentials] = useState<boolean>(false);
    const [requiresSelfie, setRequiresSelfie] = useState<boolean>(false);
    const [uploadingSelfie, setUploadingSelfie] = useState<boolean>(false);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
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
            "work-education", "additional"
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
        if (authLoading || !user) return;

        const loadData = async () => {
            setLoading(true);

            // Fetch or create user service
            const { data: services, error: serviceError } = await supabase
                .from("user_services")
                .select("id, status, current_step, service_slug, application_id, date_of_birth, grandmother_name, consular_login")
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

                const svc = service as typeof service & { consular_login?: string };
                setHasConsularCredentials(!!(svc.consular_login && svc.consular_login.trim()));

                if (service.current_step !== undefined && service.current_step !== null) {
                    const maxStep = slug === "visto-b1-b2" ? 11 : 4;
                    const stepToIndex = Math.min(service.current_step, maxStep);
                    setCurrentStep(stepToIndex);
                }
            }

            if (sId) {
                const { data: orderData } = await supabase
                    .from("visa_orders")
                    .select("id, order_number, contract_selfie_url")
                    .eq("product_slug", slug)
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();
                
                if (orderData) {
                    if (orderData.order_number) {
                        setOrderNumber(orderData.order_number);
                    }
                    setPendingOrderId(orderData.id);
                    if (!orderData.contract_selfie_url) {
                        setRequiresSelfie(true);
                    }
                }
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, email")
                .eq("id", user.id)
                .maybeSingle();

            const { data: responses, error: responseError } = await supabase
                .from("onboarding_responses")
                .select("step_slug, data")
                .eq("user_service_id", sId);

            if (responseError) {
                console.error("Error loading responses:", responseError);
            } else if (responses) {
                const combinedData = responses.reduce((acc: Record<string, unknown>, curr: { step_slug: string; data: unknown }) => ({ ...acc, ...curr.data as object }), {});

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

            const { data: docs, error: docsError } = await supabase
                .from("documents")
                .select("name, storage_path, bucket_id")
                .eq("user_id", user.id)
                .eq("user_service_id", sId);

            if (docsError) {
                console.error("Error loading documents:", docsError);
            } else if (docs) {
                setUploadedDocs(docs.map(d => ({ name: d.name, path: d.storage_path, bucket_id: d.bucket_id })));
            }
        };
        loadData().finally(() => setLoading(false));
    }, [user, authLoading, reset, urlServiceId]);

    const normalizeFileName = (str: string) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9.-]/g, "_")
            .toLowerCase();
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const isProcessSpecialDoc = docName === "ds160_assinada" || docName === "ds160_comprovante";

        if (isProcessSpecialDoc) {
            setPendingFiles(prev => ({ ...prev, [docName]: file }));
            setUploadedDocs(prev => {
                if (prev.some(d => d.name === docName)) return prev;
                return [...prev, { name: docName, path: "pending..." }];
            });
            return;
        }

        setUploading(docName);
        try {
            const { data: service } = await supabase
                .from("user_services")
                .select("id")
                .eq("user_id", user.id)
                .in("status", [
                    "active", 
                    "review_pending", 
                    "review_assign", 
                    "ds160InProgress", 
                    "ds160Processing", 
                    "ds160upload_documents", 
                    "ds160AwaitingReviewAndSignature",
                    "uploadsUnderReview"
                ])
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

            const { data: docs } = await supabase.from("documents").select("name, storage_path").eq("user_id", user.id).eq("user_service_id", service.id);
            if (docs) {
                setUploadedDocs(docs.map(d => ({ name: d.name, path: d.storage_path })));
            }

        } catch (error: unknown) {
            toast.error((error as Error).message);
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
        } catch (error: unknown) {
            console.error("Error removing doc:", error);
            toast.error("Error removing document");
        }
    };

    const saveCurrentStep = async () => {
        if (!serviceId) return;

        const currentSlug = stepSlugs[currentStep];

        if (currentSlug === "documents" || currentSlug === "review") return;

        let stepData: Record<string, unknown> = {};

        if (serviceSlug === "visto-b1-b2") {
            stepData = { ...formData };
        } else {
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
                    data: stepData as any,
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
                    const requiredDocs = [o.docPhoto[lang]]; 
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

    const handleSelfieUpload = async () => {
        if (!selfieFile || !pendingOrderId || !user) return;

        setUploadingSelfie(true);
        try {
            const fileExt = selfieFile.name.split(".").pop();
            const fileName = `selfie_${Date.now()}.${fileExt}`;
            const filePath = `contracts/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("visa-documents")
                .upload(filePath, selfieFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("visa-documents")
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from("visa_orders")
                .update({
                    contract_selfie_url: publicUrl,
                    user_id: user.id
                })
                .eq("id", pendingOrderId);

            if (updateError) throw updateError;

            setRequiresSelfie(false);
            setSelfieFile(null);
            toast.success(lang === "pt" ? "Selfie enviada com sucesso!" : "Selfie uploaded successfully!");
        } catch (err: any) {
            console.error("Error uploading selfie:", err);
            toast.error(lang === "pt" ? "Erro ao enviar selfie" : "Error uploading selfie");
        } finally {
            setUploadingSelfie(false);
        }
    };

    const handleFinish = async () => {
        if (!user) return;
        await saveCurrentStep();

        try {
            if (serviceId) {
                const isSignatureSubmit = 
                    serviceStatus === "ds160upload_documents" || 
                    serviceStatus === "ds160AwaitingReviewAndSignature" || 
                    serviceStatus === "review_assign" ||
                    serviceStatus === "uploadsUnderReview";
                
                if (isSignatureSubmit) {
                    const hasAssinada = pendingFiles["ds160_assinada"] || uploadedDocs.some(d => d.name === "ds160_assinada");
                    const hasComprovante = pendingFiles["ds160_comprovante"] || uploadedDocs.some(d => d.name === "ds160_comprovante");

                    if (!hasAssinada || !hasComprovante) {
                        toast.error(lang === "pt" ? "Você deve selecionar os 2 documentos solicitados." : "You must select both requested documents.");
                        return;
                    }

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
                                user_id: user.id,
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

                const nextStatus = isSignatureSubmit ? "uploadsUnderReview" : "review_pending";

                const { error: updateError } = await supabase
                    .from("user_services")
                    .update({
                        current_step: serviceSlug === "visto-b1-b2" ? 11 : 4,
                        status: nextStatus,
                    })
                    .eq("id", serviceId);

                if (updateError) {
                    console.error("Error updating service:", updateError);
                }
            }
        } catch (err: unknown) {
            console.error("Unexpected error:", err);
            toast.error((err as Error).message || "Erro inesperado");
            setLoading(false);
            return;
        } finally {
            setLoading(false);
        }
        
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
        window.location.reload();
    };

    return {
        lang, t, o, steps, serviceSlug,
        currentStep, setCurrentStep,
        loading,
        serviceStatus,
        serviceId,
        orderNumber,
        securityData,
        hasConsularCredentials,
        uploading, uploadedDocs, fileInputRef, selectedDoc, setSelectedDoc,
        pendingFiles, setPendingFiles,
        register, handleSubmit, watch, errors, setValue, formData,
        handleUpload, handleRemoveDoc,
        handleNext, handleFinish, handleSkip,
        requiresSelfie, setRequiresSelfie, uploadingSelfie, selfieFile, setSelfieFile, handleSelfieUpload
    };
};
