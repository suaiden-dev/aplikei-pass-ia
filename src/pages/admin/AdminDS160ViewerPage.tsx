import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/presentation/components/atoms/button";
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
import { Badge } from "@/presentation/components/atoms/badge";
import { Input } from "@/presentation/components/atoms/input";
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
  const [formData, setFormData] = useState<Record<string, unknown> | null>(null);
  const [serviceData, setServiceData] = useState<{
    id: string;
    status: string;
    application_id?: string;
  } | null>(null);

  const fetchDS160Data = useCallback(async () => {
    setLoading(true);
    try {
      const serviceIdFromState = location.state?.serviceId;
      let service;

      if (serviceIdFromState) {
        const { data: svc, error: svcErr } = await supabase
          .from("user_services")
          .select("id, service_slug, status, application_id")
          .eq("id", serviceIdFromState)
          .single();
        
        if (!svcErr) service = svc;
      }

      if (!service) {
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
        service = services?.[0];
      }

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
          (acc, curr) => ({ ...acc, ...(curr.data as Record<string, unknown>) }),
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
  }, [userId, location.state?.serviceId]);

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

  const getFieldValue = (key: string) => {
    if (!formData) return "—";
    if (formData[key + "DoesNotApply"]) return "Does Not Apply";
    if (formData[key]) return formData[key] as string | number;
    return "—";
  };

  const sections = formData
    ? [
        {
          title: "1. Personal Information 1",
          fields: [
            { label: "Given Names", value: formData.firstName as string },
            { label: "Surname", value: formData.lastName as string },
            {
              label: "Full Name in Passport",
              value: formData.fullNamePassport as string,
            },
            { label: "Email", value: formData.email as string },
            { label: "Interview Location", value: formData.interviewLocation as string },
            {
              label: "Other Names Used?",
              value: translateYesNo(formData.hasOtherNames as string),
            },
            { label: "Details (Other Names)", value: formData.otherNames as string },
            {
              label: "Has Telecode?",
              value: translateYesNo(formData.hasTelecode as string),
            },
            { label: "Telecode Value", value: formData.telecodeValue as string },
            { label: "Gender", value: formData.gender as string },
            { label: "Marital Status", value: formData.maritalStatus as string },
            { label: "Birth Date", value: formData.birthDate as string },
            { label: "Birth City", value: formData.birthCity as string },
            { label: "Birth State", value: formData.birthState as string },
            { label: "Birth Country", value: formData.birthCountry as string },
          ],
        },
        {
          title: "2. Personal Information 2",
          fields: [
            { label: "Nationality", value: formData.nationalityInfo as string },
            {
              label: "Other Nationality?",
              value: translateYesNo(formData.hasOtherNationality as string),
            },
            {
              label: "Other Nationalities",
              value: formData.otherNationalities as string,
            },
            {
              label: "Has Passport Other Country?",
              value: translateYesNo(formData.hasNationalityPassport as string),
            },
            {
              label: "Other Passport Number",
              value: formData.nationalityPassportNumber as string,
            },
            {
              label: "Permanent Resident Other Country?",
              value: translateYesNo(formData.isPermanentResidentOtherCountry as string),
            },
            {
              label: "Permanent Resident Details",
              value: formData.permResCountryDetails as string,
            },
            { label: "National ID (CPF)", value: getFieldValue("nationalID") },
            { label: "US Social Security #", value: getFieldValue("ssn") },
            { label: "US Taxpayer ID #", value: getFieldValue("taxID") },
          ],
        },
        {
          title: "3. Address & Phone",
          fields: [
            { label: "Home Address", value: formData.homeAddress as string },
            { label: "Home City", value: formData.homeCity as string },
            { label: "Home State", value: formData.homeState as string },
            { label: "Home Zip", value: formData.homeZip as string },
            { label: "Home Country", value: formData.homeCountry as string },
            {
              label: "Mailing same as Home?",
              value: translateYesNo(formData.isMailingSameAsHome as string),
            },
            { label: "Mailing Address", value: formData.mailingAddress as string },
            { label: "Mailing City", value: formData.mailingCity as string },
            { label: "Mailing State", value: formData.mailingState as string },
            { label: "Mailing Zip", value: formData.mailingZip as string },
            { label: "Primary Phone", value: formData.mobilePhone as string },
            { label: "Secondary Phone", value: formData.homePhone as string },
            { label: "Work Phone", value: formData.workPhone as string },
            {
              label: "Other Phone (Last 5 years)?",
              value: translateYesNo(formData.hasOtherPhoneLast5Years as string),
            },
            {
              label: "Other Phone Details",
              value: formData.otherPhonesDetails as string,
            },
            {
              label: "Other Email (Last 5 years)?",
              value: translateYesNo(formData.hasOtherEmailLast5Years as string),
            },
            {
              label: "Other Email Details",
              value: formData.otherEmailsDetails as string,
            },
          ],
        },
        {
          title: "4. Passport Information",
          fields: [
            { label: "Passport Type", value: formData.passportType as string },
            { label: "Passport Number", value: formData.passportNumberDS as string },
            { label: "Issuance City", value: formData.passportIssuanceCity as string },
            {
              label: "Issuance Country",
              value: formData.passportIssuanceCountry as string,
            },
            { label: "Issuance Date", value: formData.passportIssuanceDate as string },
            {
              label: "Expiration Date",
              value: formData.passportExpirationDate as string,
            },
          ],
        },
        {
          title: "5. Travel Information",
          fields: [
            {
              label: "Specific Travel Plan?",
              value: translateYesNo(formData.hasSpecificTravelPlan as string),
            },
            { label: "Arrival Date", value: formData.arrivalDate as string },
            {
              label: "Arrival Flight Number",
              value: formData.arrivalFlightNumber as string,
            },
            { label: "Arrival City", value: formData.arrivalCity as string },
            { label: "Departure Date", value: formData.departureDate as string },
            {
              label: "Departure Flight Number",
              value: formData.departureFlightNumber as string,
            },
            { label: "Departure City", value: formData.departureCity as string },
            {
              label: "Stay Duration",
              value:
                formData.stayDurationValue && formData.stayDurationUnit
                  ? `${formData.stayDurationValue} ${formData.stayDurationUnit}`
                  : null,
            },
            { label: "Visit Locations", value: formData.visitLocations as string },
            { label: "US Stay Address", value: formData.stayAddress as string },
            { label: "US Stay City", value: formData.stayCity as string },
            { label: "US Stay State", value: formData.stayState as string },
            { label: "US Stay Zip", value: formData.stayZip as string },
            { label: "Payer", value: formData.travelPayer as string },
            { label: "Payer Name", value: formData.payerName as string },
            { label: "Payer Relationship", value: formData.payerRelationship as string },
          ],
        },
        {
          title: "6. Travel Companions",
          fields: [
            {
              label: "Traveling with Others?",
              value: translateYesNo(formData.hasTravelCompanions as string),
            },
            { label: "Companion Name", value: formData.companionName as string },
            {
              label: "Companion Relationship",
              value: formData.companionRelationship as string,
            },
          ],
        },
        {
          title: "7. Previous US Travel",
          fields: [
            {
              label: "Been to US before?",
              value: translateYesNo(formData.hasBeenToUS as string),
            },
            { label: "Last Arrival Date", value: formData.lastUSTravelDate as string },
            {
              label: "Last Port of Entry",
              value: formData.lastUSTravelPortOfEntry as string,
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
              value: formData.lastUSTravelPurpose as string,
            },
            {
              label: "Has US Driver License?",
              value: translateYesNo(formData.hasUSDriverLicense as string),
            },
            {
              label: "US License Number",
              value: formData.usDriverLicenseNumber as string,
            },
            { label: "US License State", value: formData.usDriverLicenseState as string },
            {
              label: "Ever had US Visa?",
              value: translateYesNo(formData.hasHadUSVisa as string),
            },
            { label: "Last Visa Date", value: formData.lastVisaIssuanceDate as string },
            { label: "Last Visa Number", value: formData.lastVisaNumber as string },
            {
              label: "Same Type of Visa?",
              value: translateYesNo(formData.isSolicitingSameTypeVisa as string),
            },
            {
              label: "Applying in Same Country?",
              value: translateYesNo(formData.isApplyingInSameCountry as string),
            },
            {
              label: "Fingerprinted Before?",
              value: translateYesNo(formData.haveBeenFingerprintedBefore as string),
            },
            {
              label: "Visa Lost or Stolen?",
              value: translateYesNo(formData.hasVisaBeenLostStolen as string),
            },
            { label: "Lost Visa Year", value: formData.visaLostStolenYear as string },
            {
              label: "Lost Visa Explanation",
              value: formData.visaLostStolenExplanation as string,
            },
            {
              label: "Visa Cancelled/Revoked?",
              value: translateYesNo(formData.hasVisaBeenCancelled as string),
            },
            {
              label: "Cancellation Details",
              value: formData.visaCancellationDetails as string,
            },
            {
              label: "Visa Refused?",
              value: translateYesNo(formData.hasBeenDeniedVisa as string),
            },
            { label: "Refusal Details", value: formData.visaRefusalDetails as string },
            {
              label: "Immigration Petition?",
              value: translateYesNo(formData.hasImmigrationPetition as string),
            },
            {
              label: "Petition Details",
              value: formData.immigrationPetitionDetails as string,
            },
          ],
        },
        {
          title: "8. US Contact Information",
          fields: [
            { label: "Contact Name", value: formData.contactName as string },
            { label: "Organization", value: formData.contactOrganization as string },
            { label: "Relationship", value: formData.contactRelationship as string },
            { label: "Contact Address", value: formData.contactAddress as string },
            { label: "Contact City", value: formData.contactCity as string },
            { label: "Contact State", value: formData.contactState as string },
            { label: "Contact Zip", value: formData.contactZip as string },
            { label: "Contact Phone", value: formData.contactPhone as string },
            { label: "Contact Email", value: formData.contactEmail as string },
          ],
        },
        {
          title: "9. Family Information",
          fields: [
            { label: "Father's First Name", value: formData.fatherFirstName as string },
            { label: "Father's Last Name", value: formData.fatherLastName as string },
            { label: "Father's DOB", value: formData.fatherBirthDate as string },
            {
              label: "Is Father in US?",
              value: translateYesNo(formData.isFatherInUS as string),
            },
            { label: "Father's US Status", value: formData.fatherUSStatus as string },
            { label: "Mother's First Name", value: formData.motherFirstName as string },
            { label: "Mother's Last Name", value: formData.motherLastName as string },
            { label: "Mother's DOB", value: formData.motherBirthDate as string },
            {
              label: "Is Mother in US?",
              value: translateYesNo(formData.isMotherInUS as string),
            },
            { label: "Mother's US Status", value: formData.motherUSStatus as string },
            {
              label: "Has Immediate Relatives in US?",
              value: translateYesNo(formData.hasImmediateRelativesInUS as string),
            },
            {
              label: "Immediate Relative Name",
              value: formData.immediateRelativeName as string,
            },
            {
              label: "Immediate Relative Relationship",
              value: formData.immediateRelativeRelationship as string,
            },
            {
              label: "Immediate Relative Status",
              value: formData.immediateRelativeStatus as string,
            },
            {
              label: "Has Other Relatives in US?",
              value: translateYesNo(formData.hasOtherRelativesInUS as string),
            },
            {
              label: "Maternal Grandmother's Name",
              value: formData.maternalGrandmotherName as string,
            },
          ],
        },
        {
          title: "10. Work / Education / Training",
          fields: [
            { label: "Primary Occupation", value: formData.primaryOccupation as string },
            { label: "Employer/School Name", value: formData.employerName as string },
            { label: "Employer Phone", value: formData.employerPhone as string },
            { label: "Employer Address", value: formData.employerAddress as string },
            { label: "Employer City", value: formData.employerCity as string },
            { label: "Employer State", value: formData.employerState as string },
            { label: "Employer Zip", value: formData.employerZip as string },
            { label: "Employer Country", value: formData.employerCountry as string },
            { label: "Job Start Date", value: formData.jobStartDate as string },
            { label: "Monthly Income", value: formData.monthlyIncome as string },
            { label: "Job Description", value: formData.jobDescription as string },
            {
              label: "Previously Employed?",
              value: translateYesNo(formData.wasPreviouslyEmployed as string),
            },
            { label: "Prev. Employer Name", value: formData.prevEmployerName as string },
            { label: "Prev. Job Title", value: formData.prevJobTitle as string },
            { label: "Prev. Job Period", value: formData.prevJobPeriod as string },
            {
              label: "Prev. Supervisor",
              value: formData.prevEmployerSupervisor as string,
            },
            { label: "Reason for Leaving", value: formData.prevJobReasonLeft as string },
            {
              label: "Secondary Education?",
              value: translateYesNo(formData.hasSecondaryEducation as string),
            },
            {
              label: "Institution Name",
              value: formData.educationInstitutionName as string,
            },
            {
              label: "Completion Date",
              value: formData.educationCompletionDate as string,
            },
            { label: "Degree Obtained", value: formData.educationDegree as string },
          ],
        },
        {
          title: "11. Social Media",
          fields: [
            { label: "Platform 1", value: formData.socialMedia1 as string },
            { label: "Platform 2", value: formData.socialMedia2 as string },
            { label: "Platform 3", value: formData.socialMedia3 as string },
          ],
        },
        {
          title: "12. Additional Information",
          fields: [
            {
              label: "Belongs to Clan/Tribe?",
              value: translateYesNo(formData.belongsToClan as string),
            },
            { label: "Clan/Tribe Name", value: formData.clanName as string },
            { label: "Languages Spoken", value: formData.languagesSpoken as string },
            {
              label: "Traveled to other countries in last 5 years?",
              value: translateYesNo(formData.hasVisitedOtherCountries as string),
            },
            {
              label: "Countries Visited Details",
              value: formData.countriesVisitedDetails as string,
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
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-display text-title font-bold flex items-center gap-2">
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

      <div className="bg-card border border-border shadow-sm rounded-md p-5 min-h-[500px]">
        <div className="flex items-center gap-2 mb-5 p-3 bg-muted/30 rounded-md border border-border/50">
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
              <div key={idx} className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-bold text-subtitle text-primary flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-md text-sm">
                      {idx + 1}
                    </span>
                    {section.title}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        className="group space-y-2 p-4 rounded-md bg-background border border-border hover:border-accent/40 transition-all hover:shadow-md relative"
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
