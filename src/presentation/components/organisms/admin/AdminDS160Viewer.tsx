import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/presentation/components/atoms/dialog";
import { Button } from "@/presentation/components/atoms/button";
import {
  Loader2,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/presentation/components/atoms/badge";
import { OnboardingData } from "@/pages/dashboard/onboarding/types";
import { useCallback } from "react";

interface AdminDS160ViewerProps {
  userId: string;
  clientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminDS160Viewer({
  userId,
  clientName,
  isOpen,
  onClose,
}: AdminDS160ViewerProps) {
  const { lang, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const ds = t.ds160;

  const fetchDS160Data = useCallback(async () => {
    console.log("🔍 [AdminDS160Viewer] Iniciando busca para userId:", userId);
    setLoading(true);
    try {
      // 1. Get the service ID for b1/b2 (order by latest to avoid multiple rows error)
      const { data: services, error: serviceError } = await supabase
        .from("user_services")
        .select("id, service_slug, status")
        .eq("user_id", userId)
        .eq("service_slug", "visto-b1-b2")
        .order("created_at", { ascending: false })
        .limit(1);

      if (serviceError) {
        console.error(
          "❌ [AdminDS160Viewer] Erro ao buscar serviço:",
          serviceError,
        );
      }

      const service = services?.[0];
      console.log(
        "📄 [AdminDS160Viewer] Serviço (mais recente) encontrado:",
        service,
      );

      if (!service) {
        console.warn(
          "⚠️ [AdminDS160Viewer] Nenhum serviço 'visto-b1-b2' encontrado para este usuário.",
        );
        setFormData(null);
        setLoading(false);
        return;
      }

      // 2. Fetch all responses
      const { data: responses, error } = await supabase
        .from("onboarding_responses")
        .select("step_slug, data")
        .eq("user_service_id", service.id);

      if (error) {
        console.error("❌ [AdminDS160Viewer] Erro ao buscar respostas:", error);
        throw error;
      }

      console.log(
        "📦 [AdminDS160Viewer] Respostas brutas do banco:",
        responses,
      );

      if (responses && responses.length > 0) {
        const combined = responses.reduce(
          (acc, curr) => ({ ...acc, ...(curr.data as Partial<OnboardingData>) }),
          {} as Partial<OnboardingData>,
        );
        console.log(
          "✅ [AdminDS160Viewer] Dados combinados com sucesso:",
          combined,
        );
        setFormData(combined as OnboardingData);
      } else {
        console.warn(
          "⚠️ [AdminDS160Viewer] O serviço existe, mas não há respostas na tabela onboarding_responses.",
        );
        setFormData(null);
      }
    } catch (err) {
      console.error("💥 [AdminDS160Viewer] Erro catastrófico no fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && userId) {
      fetchDS160Data();
    }
  }, [isOpen, userId, fetchDS160Data]);

  const translateYesNo = (val?: string) => {
    if (val === "yes") return lang === "pt" ? "Sim" : "Yes";
    if (val === "no") return lang === "pt" ? "Não" : "No";
    return val || "—";
  };

  // Reusing the same logic from ReviewStep but for admin display
  const sections = formData
    ? [
        {
          title: "Personal Information 1",
          fields: [
            { label: "Given Names", value: formData.firstName },
            { label: "Surname", value: formData.lastName },
            {
              label: "Full Name in Passport",
              value: formData.fullNamePassport,
            },
            { label: "Email", value: formData.email },
            {
              label: "Other Names Used?",
              value: translateYesNo(formData.hasOtherNames),
            },
            { label: "Details (Other Names)", value: formData.otherNames },
            { label: "Gender", value: formData.gender },
            { label: "Marital Status", value: formData.maritalStatus },
            { label: "Birth Date", value: formData.birthDate },
            { label: "Birth City", value: formData.birthCity },
            { label: "Birth Country", value: formData.birthCountry },
          ],
        },
        {
          title: "Personal Information 2",
          fields: [
            { label: "Nationality", value: formData.nationalityInfo },
            {
              label: "Other Nationality?",
              value: translateYesNo(formData.hasOtherNationality),
            },
            {
              label: "Other Nationalities",
              value: formData.otherNationalities,
            },
            { label: "National ID (CPF/RG)", value: formData.nationalID },
            { label: "US Social Security #", value: formData.ssn },
            { label: "US Taxpayer ID #", value: formData.taxID },
          ],
        },
        {
          title: "Travel Information",
          fields: [
            {
              label: "Plan Type",
              value:
                formData.hasSpecificTravelPlan === "yes"
                  ? "Specific Plan"
                  : "Estimated",
            },
            { label: "Arrival Date", value: formData.arrivalDate },
            { label: "Departure Date", value: formData.departureDate },
            {
              label: "Stay Duration",
              value: `${formData.stayDurationValue} ${formData.stayDurationUnit}`,
            },
            {
              label: "US Address",
              value: `${formData.stayAddress}, ${formData.stayCity}, ${formData.stayState} ${formData.stayZip}`,
            },
            { label: "Payer", value: formData.travelPayer },
            {
              label: "Payer Name/Relationship",
              value: `${formData.payerName} (${formData.payerRelationship})`,
            },
          ],
        },
        {
          title: "Travel Companions",
          fields: [
            {
              label: "Traveling with Others?",
              value: translateYesNo(formData.hasTravelCompanions),
            },
            { label: "Companion Name", value: formData.companionName },
            {
              label: "Companion Relationship",
              value: formData.companionRelationship,
            },
          ],
        },
        {
          title: "Previous US Travel",
          fields: [
            {
              label: "Been to US before?",
              value: translateYesNo(formData.hasBeenToUS),
            },
            { label: "Last Arrival Date", value: formData.lastUSTravelDate },
            {
              label: "Last Stay Duration",
              value: `${formData.lastUSTravelDurationValue} ${formData.lastUSTravelDurationUnit}`,
            },
            {
              label: "Ever had US Visa?",
              value: translateYesNo(formData.hasHadUSVisa),
            },
            {
              label: "Last Visa Number/Date",
              value: `${formData.lastVisaNumber} (${formData.lastVisaIssuanceDate})`,
            },
            {
              label: "Visa Refused?",
              value: translateYesNo(formData.hasBeenDeniedVisa),
            },
            { label: "Refusal Details", value: formData.visaRefusalDetails },
          ],
        },
        {
          title: "Address & Contact",
          fields: [
            {
              label: "Home Address",
              value: `${formData.homeAddress}, ${formData.homeCity}, ${formData.homeState}, ${formData.homeCountry}`,
            },
            { label: "Phone", value: formData.mobilePhone },
            { label: "Other Phones", value: formData.otherPhonesDetails },
            { label: "Other Emails", value: formData.otherEmailsDetails },
          ],
        },
        {
          title: "Passport Information",
          fields: [
            { label: "Passport Type", value: formData.passportType },
            { label: "Passport Number", value: formData.passportNumberDS },
            {
              label: "Issuance City/Country",
              value: `${formData.passportIssuanceCity}, ${formData.passportIssuanceCountry}`,
            },
            { label: "Issuance Date", value: formData.passportIssuanceDate },
            {
              label: "Expiration Date",
              value: formData.passportExpirationDate,
            },
          ],
        },
        {
          title: "US Contact Information",
          fields: [
            { label: "Contact Name", value: formData.contactName },
            { label: "Organization", value: formData.contactOrganization },
            { label: "Relationship", value: formData.contactRelationship },
            {
              label: "Contact Address",
              value: `${formData.contactAddress}, ${formData.contactCity}, ${formData.contactState} ${formData.contactZip}`,
            },
            {
              label: "Contact Phone/Email",
              value: `${formData.contactPhone} / ${formData.contactEmail}`,
            },
          ],
        },
        {
          title: "Work / Education / Training",
          fields: [
            { label: "Primary Occupation", value: formData.primaryOccupation },
            { label: "Employer/School Name", value: formData.employerName },
            {
              label: "Employer Address",
              value: `${formData.employerAddress}, ${formData.employerCity}, ${formData.employerState}, ${formData.employerCountry}`,
            },
            { label: "Job Start Date", value: formData.jobStartDate },
            { label: "Monthly Income", value: formData.monthlyIncome },
            { label: "Job Description", value: formData.jobDescription },
          ],
        },
      ]
        .map((s) => ({
          ...s,
          fields: s.fields.filter(
            (f) =>
              f.value && f.value !== "—" && f.value !== "undefined undefined",
          ),
        }))
        .filter((s) => s.fields.length > 0)
    : [];

  const currentSection = sections[currentSectionIdx];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-md">
              <FileText className="h-5 w-5 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-subtitle">Formulário DS-160</DialogTitle>
              <DialogDescription>
                Visualizando respostas de <strong>{clientName}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 min-h-[300px]">
          {loading ? (
            <div className="flex h-full items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : !formData ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhum dado do DS-160 encontrado para este usuário.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-lg text-primary">
                  {currentSection?.title}
                </h3>
                <Badge variant="secondary">
                  {currentSectionIdx + 1} de {sections.length}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {currentSection?.fields.map((field, i) => (
                  <div key={i} className="space-y-1 min-w-0">
                    <p
                      className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate"
                      title={field.label}
                    >
                      {field.label}
                    </p>
                    <p className="text-sm font-semibold text-foreground bg-muted/30 p-2 rounded-md border border-border/40 break-all leading-tight">
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t mt-auto">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground"
          >
            Fechar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSectionIdx((i) => Math.max(0, i - 1))}
              disabled={currentSectionIdx === 0 || !formData}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentSectionIdx((i) =>
                  Math.min(sections.length - 1, i + 1),
                )
              }
              disabled={currentSectionIdx === sections.length - 1 || !formData}
            >
              Próximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
