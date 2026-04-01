
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { getAuthService } from "@/infrastructure/factories/authFactory";
import { getPaymentService, getExchangeRateService } from "@/infrastructure/factories/paymentFactory";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutRequest } from "@/application/ports/IPaymentService";
import { toast } from "sonner";

export const useCheckout = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  
  const action = searchParams.get("action");
  const serviceId = searchParams.get("serviceId");
  const amountOverride = searchParams.get("amount") ? Number(searchParams.get("amount")) : undefined;

  const service = t.servicesData.find((s) => s.slug === slug);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dependents: "0",
    paymentMethod: "stripe",
    cpf: "",
    parcelowSubMethod: "credit_card",
    isAlternativePayer: false,
    payerName: "",
    payerEmail: "",
    payerCpf: "",
    payerPhone: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isZelleModalOpen, setIsZelleModalOpen] = useState(false);
  const [zelleOrderId, setZelleOrderId] = useState<string | null>(null);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  
  const [uploadedDocsUrls, setUploadedDocsUrls] = useState({
    selfie: "",
    termsAcceptedAt: "",
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      const savedData = localStorage.getItem("aplikei_checkout_data");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Erro ao carregar cache do formulário", e);
        }
      }

      const authService = getAuthService();
      const session = await authService.getSession();
      
      if (session.user) {
        setIsLoggedIn(true);
        setFormData((prev) => ({
          ...prev,
          email: session.user?.email || prev.email,
        }));

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile) {
          const profileData = profile as Record<string, string | null>;
          setFormData((prev) => ({
            ...prev,
            name: profileData.full_name || prev.name,
            phone: profileData.phone || prev.phone,
          }));
        }
      }
    };

    const loadExchangeRate = async () => {
      const exchangeRateService = getExchangeRateService();
      const rate = await exchangeRateService.getExchangeRate();
      setExchangeRate(rate);
    };

    loadInitialData();
    loadExchangeRate();
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("aplikei_checkout_data", JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setPaymentMethod = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value }));
  };

  const setDependents = (value: string) => {
    setFormData((prev) => ({ ...prev, dependents: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contractAccepted) {
      toast.error("Por favor, aceite os termos do contrato antes de prosseguir.");
      return;
    }

    setIsProcessing(true);
    
    try {
      const selfieUrl = ""; // Logic from original component
      const acceptedAt = uploadedDocsUrls.termsAcceptedAt || new Date().toISOString();
      setUploadedDocsUrls(prev => ({ ...prev, termsAcceptedAt: acceptedAt }));

      const authService = getAuthService();
      const session = await authService.getSession();
      
      const paymentService = getPaymentService();
      
      const payerInfo = formData.isAlternativePayer
        ? {
            name: formData.payerName,
            email: formData.payerEmail,
            cpf: formData.payerCpf,
            phone: formData.payerPhone,
          }
        : null;

      const checkoutRequest: CheckoutRequest = {
        slug: slug!,
        email: formData.email,
        fullName: formData.name,
        phone: formData.phone,
        dependents: parseInt(formData.dependents) || 0,
        originUrl: window.location.origin,
        paymentMethod: formData.paymentMethod,
        contractSelfieUrl: selfieUrl,
        termsAcceptedAt: acceptedAt,
        action,
        serviceId,
        amount: totalPrice,
        cpf: formData.cpf,
        parcelowSubMethod: formData.parcelowSubMethod,
        isAlternativePayer: formData.isAlternativePayer,
        payerInfo,
      };

      const result = await paymentService.initiateCheckout(checkoutRequest, session.accessToken);

      if (formData.paymentMethod === "zelle") {
        if (result?.id) {
          setZelleOrderId(result.id);
          setIsZelleModalOpen(true);
        } else {
          toast.error("Erro ao gerar pedido Zelle.");
        }
      } else if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error("Não foi possível gerar a sessão de pagamento.");
      }
    } catch (err: any) {
      console.error("Erro no checkout:", err);
      toast.error("Houve um erro ao processar o seu pedido. Por favor, tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedIds = useMemo(() => [
    slug || '',
    ...Array(Number(formData.dependents)).fill(
      slug === 'visto-b1-b2' ? 'dependente-b1-b2' : 'dependente-estudante'
    )
  ], [slug, formData.dependents]);

  return {
    slug,
    service,
    formData,
    setFormData,
    handleInputChange,
    handleSubmit,
    isProcessing,
    isLoggedIn,
    exchangeRate,
    totalPrice,
    setTotalPrice,
    isZelleModalOpen,
    setIsZelleModalOpen,
    zelleOrderId,
    contractAccepted,
    setContractAccepted,
    uploadedDocsUrls,
    isUploadingDocs,
    selectedIds,
    setPaymentMethod,
    setDependents,
    amountOverride,
    lang,
    t
  };
};
