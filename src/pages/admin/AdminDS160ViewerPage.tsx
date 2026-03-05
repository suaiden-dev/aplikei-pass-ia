import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface DS160Field {
  label: string;
  value: string | number | null | undefined;
}

interface DS160Section {
  title: string;
  fields: DS160Field[];
}

export default function AdminDS160ViewerPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const clientName = location.state?.clientName || "Cliente Desconhecido";

  const { lang, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any> | null>(null);
  const [serviceData, setServiceData] = useState<{
    id: string;
    status: string;
    application_id?: string;
  } | null>(null);

  const fetchDS160Data = useCallback(async () => {
    setLoading(true);
    try {
      const { data: services, error: serviceError } = await supabase
        .from("user_services")
        .select("id, service_slug, status, application_id")
        .eq("user_id", userId!)
        .eq("service_slug", "visto-b1-b2")
        .order("created_at", { ascending: false })
        .limit(1);

      if (serviceError) {
        console.error("❌ Erro ao buscar serviço:", serviceError);
      }

      const service = (
        services as { id: string; status: string; application_id?: string }[]
      )?.[0];

      if (!service) {
        console.warn("⚠️ Nenhum serviço 'visto-b1-b2' encontrado.");
        setFormData(null);
        setServiceData(null);
        setLoading(false);
        return;
      }

      setServiceData({
        id: service.id,
        status: service.status,
        application_id: service.application_id,
      });
      const { data: responses, error } = await supabase
        .from("onboarding_responses")
        .select("step_slug, data")
        .eq("user_service_id", service.id);

      if (error) {
        console.error("❌ Erro ao buscar respostas:", error);
        throw error;
      }

      if (responses && responses.length > 0) {
        const combined = responses.reduce(
          (acc, curr) => ({ ...acc, ...(curr.data as Record<string, any>) }),
          {},
        );
        setFormData(combined);
      } else {
        console.warn("⚠️ Não há respostas na tabela.");
        setFormData(null);
      }
    } catch (err) {
      console.error("💥 Erro catastrófico no fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchDS160Data();
    }
  }, [userId, fetchDS160Data]);

  const translateYesNo = (val?: string) => {
    if (val === "yes") return lang === "pt" ? "Sim" : "Yes";
    if (val === "no") return lang === "pt" ? "Não" : "No";
    return val || "—";
  };

  const getFieldValue = (key: string, label?: string) => {
    if (formData[key + "DoesNotApply"]) return "Does Not Apply";
    if (formData[key]) return formData[key];
    return "—";
  };

  const sections = formData
    ? [
        {
          title: "1. Personal Information 1",
          fields: [
            { label: "Given Names", value: formData.firstName },
            { label: "Surname", value: formData.lastName },
            {
              label: "Full Name in Passport",
              value: formData.fullNamePassport,
            },
            { label: "Email", value: formData.email },
            { label: "Interview Location", value: formData.interviewLocation },
            {
              label: "Other Names Used?",
              value: translateYesNo(formData.hasOtherNames),
            },
            { label: "Details (Other Names)", value: formData.otherNames },
            {
              label: "Has Telecode?",
              value: translateYesNo(formData.hasTelecode),
            },
            { label: "Telecode Value", value: formData.telecodeValue },
            { label: "Gender", value: formData.gender },
            { label: "Marital Status", value: formData.maritalStatus },
            { label: "Birth Date", value: formData.birthDate },
            { label: "Birth City", value: formData.birthCity },
            { label: "Birth State", value: formData.birthState },
            { label: "Birth Country", value: formData.birthCountry },
          ],
        },
        {
          title: "2. Personal Information 2",
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
            {
              label: "Has Passport Other Country?",
              value: translateYesNo(formData.hasNationalityPassport),
            },
            {
              label: "Other Passport Number",
              value: formData.nationalityPassportNumber,
            },
            {
              label: "Permanent Resident Other Country?",
              value: translateYesNo(formData.isPermanentResidentOtherCountry),
            },
            {
              label: "Permanent Resident Details",
              value: formData.permResCountryDetails,
            },
            { label: "National ID (CPF)", value: getFieldValue("nationalID") },
            { label: "US Social Security #", value: getFieldValue("ssn") },
            { label: "US Taxpayer ID #", value: getFieldValue("taxID") },
          ],
        },
        {
          title: "3. Address & Phone",
          fields: [
            { label: "Home Address", value: formData.homeAddress },
            { label: "Home City", value: formData.homeCity },
            { label: "Home State", value: formData.homeState },
            { label: "Home Zip", value: formData.homeZip },
            { label: "Home Country", value: formData.homeCountry },
            {
              label: "Mailing same as Home?",
              value: translateYesNo(formData.isMailingSameAsHome),
            },
            { label: "Mailing Address", value: formData.mailingAddress },
            { label: "Mailing City", value: formData.mailingCity },
            { label: "Mailing State", value: formData.mailingState },
            { label: "Mailing Zip", value: formData.mailingZip },
            { label: "Primary Phone", value: formData.mobilePhone },
            { label: "Secondary Phone", value: formData.homePhone },
            { label: "Work Phone", value: formData.workPhone },
            {
              label: "Other Phone (Last 5 years)?",
              value: translateYesNo(formData.hasOtherPhoneLast5Years),
            },
            {
              label: "Other Phone Details",
              value: formData.otherPhonesDetails,
            },
            {
              label: "Other Email (Last 5 years)?",
              value: translateYesNo(formData.hasOtherEmailLast5Years),
            },
            {
              label: "Other Email Details",
              value: formData.otherEmailsDetails,
            },
          ],
        },
        {
          title: "4. Passport Information",
          fields: [
            { label: "Passport Type", value: formData.passportType },
            { label: "Passport Number", value: formData.passportNumberDS },
            { label: "Issuance City", value: formData.passportIssuanceCity },
            {
              label: "Issuance Country",
              value: formData.passportIssuanceCountry,
            },
            { label: "Issuance Date", value: formData.passportIssuanceDate },
            {
              label: "Expiration Date",
              value: formData.passportExpirationDate,
            },
          ],
        },
        {
          title: "5. Travel Information",
          fields: [
            {
              label: "Specific Travel Plan?",
              value: translateYesNo(formData.hasSpecificTravelPlan),
            },
            { label: "Arrival Date", value: formData.arrivalDate },
            {
              label: "Arrival Flight Number",
              value: formData.arrivalFlightNumber,
            },
            { label: "Arrival City", value: formData.arrivalCity },
            { label: "Departure Date", value: formData.departureDate },
            {
              label: "Departure Flight Number",
              value: formData.departureFlightNumber,
            },
            { label: "Departure City", value: formData.departureCity },
            {
              label: "Stay Duration",
              value:
                formData.stayDurationValue && formData.stayDurationUnit
                  ? `${formData.stayDurationValue} ${formData.stayDurationUnit}`
                  : null,
            },
            { label: "Visit Locations", value: formData.visitLocations },
            { label: "US Stay Address", value: formData.stayAddress },
            { label: "US Stay City", value: formData.stayCity },
            { label: "US Stay State", value: formData.stayState },
            { label: "US Stay Zip", value: formData.stayZip },
            { label: "Payer", value: formData.travelPayer },
            { label: "Payer Name", value: formData.payerName },
            { label: "Payer Relationship", value: formData.payerRelationship },
          ],
        },
        {
          title: "6. Travel Companions",
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
          title: "7. Previous US Travel",
          fields: [
            {
              label: "Been to US before?",
              value: translateYesNo(formData.hasBeenToUS),
            },
            { label: "Last Arrival Date", value: formData.lastUSTravelDate },
            {
              label: "Last Port of Entry",
              value: formData.lastUSTravelPortOfEntry,
            },
            {
              label: "Last Stay Duration",
              value:
                formData.lastUSTravelDurationValue &&
                formData.lastUSTravelDurationUnit
                  ? `${formData.lastUSTravelDurationValue} ${formData.lastUSTravelDurationUnit}`
                  : null,
            },
            {
              label: "Last Purpose of Visit",
              value: formData.lastUSTravelPurpose,
            },
            {
              label: "Has US Driver License?",
              value: translateYesNo(formData.hasUSDriverLicense),
            },
            {
              label: "US License Number",
              value: formData.usDriverLicenseNumber,
            },
            { label: "US License State", value: formData.usDriverLicenseState },
            {
              label: "Ever had US Visa?",
              value: translateYesNo(formData.hasHadUSVisa),
            },
            { label: "Last Visa Date", value: formData.lastVisaIssuanceDate },
            { label: "Last Visa Number", value: formData.lastVisaNumber },
            {
              label: "Same Type of Visa?",
              value: translateYesNo(formData.isSolicitingSameTypeVisa),
            },
            {
              label: "Applying in Same Country?",
              value: translateYesNo(formData.isApplyingInSameCountry),
            },
            {
              label: "Fingerprinted Before?",
              value: translateYesNo(formData.haveBeenFingerprintedBefore),
            },
            {
              label: "Visa Lost or Stolen?",
              value: translateYesNo(formData.hasVisaBeenLostStolen),
            },
            { label: "Lost Visa Year", value: formData.visaLostStolenYear },
            {
              label: "Lost Visa Explanation",
              value: formData.visaLostStolenExplanation,
            },
            {
              label: "Visa Cancelled/Revoked?",
              value: translateYesNo(formData.hasVisaBeenCancelled),
            },
            {
              label: "Cancellation Details",
              value: formData.visaCancellationDetails,
            },
            {
              label: "Visa Refused?",
              value: translateYesNo(formData.hasBeenDeniedVisa),
            },
            { label: "Refusal Details", value: formData.visaRefusalDetails },
            {
              label: "Immigration Petition?",
              value: translateYesNo(formData.hasImmigrationPetition),
            },
            {
              label: "Petition Details",
              value: formData.immigrationPetitionDetails,
            },
          ],
        },
        {
          title: "8. US Contact Information",
          fields: [
            { label: "Contact Name", value: formData.contactName },
            { label: "Organization", value: formData.contactOrganization },
            { label: "Relationship", value: formData.contactRelationship },
            { label: "Contact Address", value: formData.contactAddress },
            { label: "Contact City", value: formData.contactCity },
            { label: "Contact State", value: formData.contactState },
            { label: "Contact Zip", value: formData.contactZip },
            { label: "Contact Phone", value: formData.contactPhone },
            { label: "Contact Email", value: formData.contactEmail },
          ],
        },
        {
          title: "9. Family Information",
          fields: [
            { label: "Father's First Name", value: formData.fatherFirstName },
            { label: "Father's Last Name", value: formData.fatherLastName },
            { label: "Father's DOB", value: formData.fatherBirthDate },
            {
              label: "Is Father in US?",
              value: translateYesNo(formData.isFatherInUS),
            },
            { label: "Father's US Status", value: formData.fatherUSStatus },
            { label: "Mother's First Name", value: formData.motherFirstName },
            { label: "Mother's Last Name", value: formData.motherLastName },
            { label: "Mother's DOB", value: formData.motherBirthDate },
            {
              label: "Is Mother in US?",
              value: translateYesNo(formData.isMotherInUS),
            },
            { label: "Mother's US Status", value: formData.motherUSStatus },
            {
              label: "Has Immediate Relatives in US?",
              value: translateYesNo(formData.hasImmediateRelativesInUS),
            },
            {
              label: "Immediate Relative Name",
              value: formData.immediateRelativeName,
            },
            {
              label: "Immediate Relative Relationship",
              value: formData.immediateRelativeRelationship,
            },
            {
              label: "Immediate Relative Status",
              value: formData.immediateRelativeStatus,
            },
            {
              label: "Has Other Relatives in US?",
              value: translateYesNo(formData.hasOtherRelativesInUS),
            },
          ],
        },
        {
          title: "10. Work / Education / Training",
          fields: [
            { label: "Primary Occupation", value: formData.primaryOccupation },
            { label: "Employer/School Name", value: formData.employerName },
            { label: "Employer Phone", value: formData.employerPhone },
            { label: "Employer Address", value: formData.employerAddress },
            { label: "Employer City", value: formData.employerCity },
            { label: "Employer State", value: formData.employerState },
            { label: "Employer Zip", value: formData.employerZip },
            { label: "Employer Country", value: formData.employerCountry },
            { label: "Job Start Date", value: formData.jobStartDate },
            { label: "Monthly Income", value: formData.monthlyIncome },
            { label: "Job Description", value: formData.jobDescription },
            {
              label: "Previously Employed?",
              value: translateYesNo(formData.wasPreviouslyEmployed),
            },
            { label: "Prev. Employer Name", value: formData.prevEmployerName },
            { label: "Prev. Job Title", value: formData.prevJobTitle },
            { label: "Prev. Job Period", value: formData.prevJobPeriod },
            {
              label: "Prev. Supervisor",
              value: formData.prevEmployerSupervisor,
            },
            { label: "Reason for Leaving", value: formData.prevJobReasonLeft },
            {
              label: "Secondary Education?",
              value: translateYesNo(formData.hasSecondaryEducation),
            },
            {
              label: "Institution Name",
              value: formData.educationInstitutionName,
            },
            {
              label: "Completion Date",
              value: formData.educationCompletionDate,
            },
            { label: "Degree Obtained", value: formData.educationDegree },
          ],
        },
        {
          title: "11. Social Media",
          fields: [
            { label: "Platform 1", value: formData.socialMedia1 },
            { label: "Platform 2", value: formData.socialMedia2 },
            { label: "Platform 3", value: formData.socialMedia3 },
          ],
        },
        {
          title: "12. Additional Information",
          fields: [
            {
              label: "Belongs to Clan/Tribe?",
              value: translateYesNo(formData.belongsToClan),
            },
            { label: "Clan/Tribe Name", value: formData.clanName },
            { label: "Languages Spoken", value: formData.languagesSpoken },
            {
              label: "Traveled to other countries in last 5 years?",
              value: translateYesNo(formData.hasVisitedOtherCountries),
            },
            {
              label: "Countries Visited Details",
              value: formData.countriesVisitedDetails,
            },
          ],
        },
      ].map((s: DS160Section) => ({
        ...s,
        fields: s.fields.map((f: DS160Field) => {
          const isEmpty =
            f.value === undefined ||
            f.value === null ||
            f.value === "" ||
            f.value === "undefined undefined" ||
            f.value === "undefined" ||
            (typeof f.value === "string" && f.value.trim() === "");
          return {
            ...f,
            value: isEmpty ? "—" : f.value,
          };
        }),
      }))
    : [];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-accent" />
              Formulário DS-160 completo
            </h2>
            <p className="text-muted-foreground">
              Visualizando respostas detalhadas de{" "}
              <strong className="text-foreground">{clientName}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-xl p-8 min-h-[500px]">
        <div className="flex items-center gap-2 mb-8 p-3 bg-muted/30 rounded-lg border border-border/50">
          <AlertCircle className="h-4 w-4 text-accent" />
          <p className="text-xs text-muted-foreground">
            Clique no ícone de cópia ao lado de cada valor para agilizar o
            preenchimento no site do consulado.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-muted-foreground font-medium">
              Carregando informações do DS-160...
            </p>
          </div>
        ) : !formData ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground opacity-50" />
            <div className="max-w-md">
              <h3 className="text-lg font-bold mb-1">Nenhum dado encontrado</h3>
              <p className="text-muted-foreground">
                Não foi possível carregar as respostas do DS-160 para este
                cliente. Pode ser que o formulário não tenha sido preenchido
                ainda.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-12 flex flex-col h-full">
            {sections.map((section: DS160Section, idx: number) => (
              <div key={idx} className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="font-bold text-xl text-primary flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm">
                      {idx + 1}
                    </span>
                    {section.title}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.fields.map((field: DS160Field, fieldIdx: number) => {
                    const handleCopy = (text: string) => {
                      if (!text || text === "—") return;
                      navigator.clipboard.writeText(text);
                      toast.success(
                        `Copiado: ${text.length > 20 ? text.substring(0, 20) + "..." : text}`,
                      );
                    };

                    return (
                      <div
                        key={fieldIdx}
                        className="group space-y-2 p-4 rounded-xl bg-background border border-border hover:border-accent/40 transition-all hover:shadow-md relative"
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {field.label}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-accent"
                            onClick={() => handleCopy(String(field.value))}
                            disabled={!field.value || field.value === "—"}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p
                          className="text-sm font-bold text-foreground break-words cursor-pointer hover:text-accent transition-colors"
                          onClick={() => handleCopy(String(field.value))}
                        >
                          {field.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
