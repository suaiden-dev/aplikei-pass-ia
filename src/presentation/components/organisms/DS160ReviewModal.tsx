import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingData } from "@/domain/onboarding/OnboardingEntities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/presentation/components/atoms/dialog";
import { Button } from "@/presentation/components/atoms/button";
import { Loader2, FileText, AlertCircle, Shield } from "lucide-react";

interface DS160ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  lang: string;
}

export function DS160ReviewModal({
  isOpen,
  onClose,
  serviceId,
  lang,
}: DS160ReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<OnboardingData> | null>(
    null,
  );

  const fetchDS160Data = useCallback(async () => {
    setLoading(true);
    try {
      const { data: responses, error } = await supabase
        .from("onboarding_responses")
        .select("data")
        .eq("user_service_id", serviceId);

      if (error) throw error;

      if (responses && responses.length > 0) {
        const combined = responses.reduce<Partial<OnboardingData>>(
          (acc, curr) => ({
            ...acc,
            ...(curr.data as Partial<OnboardingData>),
          }),
          {},
        );
        setFormData(combined);
      }
    } catch (err) {
      console.error("Error fetching DS-160 data:", err);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    if (isOpen && serviceId) {
      fetchDS160Data();
    }
  }, [isOpen, serviceId, fetchDS160Data]);

  const getVal = (field: keyof OnboardingData | string) => {
    const val = formData?.[field as keyof OnboardingData];
    if (val === "yes" || val === "YES" || val === true)
      return lang === "pt" ? "Sim" : "Yes";
    if (val === "no" || val === "NO" || val === false)
      return lang === "pt" ? "Não" : "No";
    if (val === undefined || val === null || val === "") return "—";
    return typeof val === "string" ? val : String(val);
  };

  const sections = formData
    ? [
        {
          title: lang === "pt" ? "Configuração Inicial" : "Initial Setup",
          fields: [
            {
              label:
                lang === "pt" ? "Local da Entrevista" : "Interview Location",
              value: getVal("interviewLocation"),
            },
          ],
        },
        {
          title:
            lang === "pt"
              ? "Etapa 1: Informações Pessoais I"
              : "Step 1: Personal Information I",
          fields: [
            { label: "Email", value: getVal("email") },
            {
              label: lang === "pt" ? "Nomes Próprios" : "Given Names",
              value: getVal("firstName"),
            },
            {
              label: lang === "pt" ? "Sobrenome" : "Surname",
              value: getVal("lastName"),
            },
            {
              label:
                lang === "pt" ? "Nome no Passaporte" : "Full Name in Passport",
              value: getVal("fullNamePassport"),
            },
            {
              label: lang === "pt" ? "Possui outros nomes?" : "Other Names?",
              value: getVal("hasOtherNames"),
            },
            {
              label: lang === "pt" ? "Outros nomes" : "Other names details",
              value: getVal("otherNames"),
            },
            {
              label: lang === "pt" ? "Telecode?" : "Telecode?",
              value: getVal("hasTelecode"),
            },
            { label: "Telecode Value", value: getVal("telecodeValue") },
            {
              label: lang === "pt" ? "Gênero" : "Gender",
              value: getVal("gender"),
            },
            {
              label: lang === "pt" ? "Estado Civil" : "Marital Status",
              value: getVal("maritalStatus"),
            },
            {
              label: lang === "pt" ? "Data Nascimento" : "Birth Date",
              value: getVal("birthDate"),
            },
            {
              label: lang === "pt" ? "Cidade Nascimento" : "Birth City",
              value: getVal("birthCity"),
            },
            {
              label: lang === "pt" ? "Estado Nascimento" : "Birth State",
              value: getVal("birthState"),
            },
            {
              label: lang === "pt" ? "País Nascimento" : "Birth Country",
              value: getVal("birthCountry"),
            },
          ],
        },
        {
          title:
            lang === "pt"
              ? "Etapa 2: Informações Pessoais II"
              : "Step 2: Personal Information II",
          fields: [
            {
              label: lang === "pt" ? "Nacionalidade" : "Nationality",
              value: getVal("nationalityInfo"),
            },
            {
              label:
                lang === "pt" ? "Outra Nacionalidade?" : "Other Nationality?",
              value: getVal("hasOtherNationality"),
            },
            {
              label:
                lang === "pt" ? "Quais nacionalidades?" : "Other nationalities",
              value: getVal("otherNationalities"),
            },
            {
              label:
                lang === "pt"
                  ? "Possui passaporte desta nacionalidade?"
                  : "Passport for other nationality?",
              value: getVal("hasNationalityPassport"),
            },
            {
              label:
                lang === "pt"
                  ? "Número Passaporte Sec."
                  : "Passport Number Details",
              value: getVal("nationalityPassportNumber"),
            },
            {
              label:
                lang === "pt"
                  ? "Residente Permanente outro país?"
                  : "Permanent Resident other country?",
              value: getVal("isPermanentResidentOtherCountry"),
            },
            {
              label:
                lang === "pt" ? "Detalhes Residência" : "Residence Details",
              value: getVal("permResCountryDetails"),
            },
            {
              label: lang === "pt" ? "ID Nacional (CPF)" : "National ID",
              value: getVal("nationalID"),
            },
            { label: "SSN", value: getVal("ssn") },
            { label: "Tax ID", value: getVal("taxID") },
          ],
        },
        {
          title: lang === "pt" ? "Etapa 3: Viagem" : "Step 3: Travel Info",
          fields: [
            {
              label:
                lang === "pt"
                  ? "Possui plano específico?"
                  : "Specific Travel Plan?",
              value: getVal("hasSpecificTravelPlan"),
            },
            {
              label: lang === "pt" ? "Data Chegada" : "Arrival Date",
              value: getVal("arrivalDate"),
            },
            {
              label: lang === "pt" ? "Voo Chegada" : "Arrival Flight",
              value: getVal("arrivalFlightNumber"),
            },
            {
              label: lang === "pt" ? "Cidade Chegada" : "Arrival City",
              value: getVal("arrivalCity"),
            },
            {
              label: lang === "pt" ? "Data Partida" : "Departure Date",
              value: getVal("departureDate"),
            },
            {
              label: lang === "pt" ? "Voo Partida" : "Departure Flight",
              value: getVal("departureFlightNumber"),
            },
            {
              label: lang === "pt" ? "Cidade Partida" : "Departure City",
              value: getVal("departureCity"),
            },
            {
              label: lang === "pt" ? "Duração Estadia" : "Stay Duration",
              value: formData.stayDurationValue
                ? `${formData.stayDurationValue} ${formData.stayDurationUnit}`
                : "—",
            },
            {
              label: lang === "pt" ? "Locais a visitar" : "Visit Locations",
              value: getVal("visitLocations"),
            },
            {
              label: lang === "pt" ? "Endereço Estadia" : "Stay Address",
              value: getVal("stayAddress"),
            },
            {
              label: lang === "pt" ? "Cidade Estadia" : "Stay City",
              value: getVal("stayCity"),
            },
            {
              label: lang === "pt" ? "Estado Estadia" : "Stay State",
              value: getVal("stayState"),
            },
            { label: "ZIP Code", value: getVal("stayZip") },
            {
              label: lang === "pt" ? "Quem pagará?" : "Travel Payer",
              value: getVal("travelPayer"),
            },
            {
              label:
                lang === "pt" ? "Parentesco Pagador" : "Payer Relationship",
              value: getVal("payerRelationship"),
            },
            {
              label: lang === "pt" ? "Nome Pagador" : "Payer Name",
              value: getVal("payerName"),
            },
          ],
        },
        {
          title:
            lang === "pt" ? "Etapa 4: Acompanhantes" : "Step 4: Companions",
          fields: [
            {
              label:
                lang === "pt" ? "Viajando com alguém?" : "Travel Companions?",
              value: getVal("hasTravelCompanions"),
            },
            {
              label: lang === "pt" ? "Nome Acompanhante" : "Companion Name",
              value: getVal("companionName"),
            },
            {
              label: lang === "pt" ? "Parentesco" : "Relationship",
              value: getVal("companionRelationship"),
            },
            {
              label:
                lang === "pt" ? "Viajando em Grupo?" : "Traveling with group?",
              value: getVal("isTravelingWithGroup"),
            },
            {
              label: lang === "pt" ? "Nome do Grupo" : "Group Name",
              value: getVal("groupName"),
            },
          ],
        },
        {
          title:
            lang === "pt"
              ? "Etapa 5: Viagens Anteriores"
              : "Step 5: Previous US Travel",
          fields: [
            {
              label: lang === "pt" ? "Já esteve nos EUA?" : "Been to US?",
              value: getVal("hasBeenToUS"),
            },
            {
              label:
                lang === "pt" ? "Última viagem (Data)" : "Last Travel Date",
              value: getVal("lastUSTravelDate"),
            },
            {
              label:
                lang === "pt"
                  ? "Última viagem (Duração)"
                  : "Last Travel Duration",
              value: formData.lastUSTravelDurationValue
                ? `${formData.lastUSTravelDurationValue} ${formData.lastUSTravelDurationUnit}`
                : "—",
            },
            {
              label: lang === "pt" ? "Porto de Entrada" : "Port of Entry",
              value: getVal("lastUSTravelPortOfEntry"),
            },
            {
              label:
                lang === "pt" ? "Possui Driver License?" : "US Driver License?",
              value: getVal("hasUSDriverLicense"),
            },
            {
              label: lang === "pt" ? "Número Driver License" : "License Number",
              value: getVal("usDriverLicenseNumber"),
            },
            {
              label: lang === "pt" ? "Estado Emissor" : "License State",
              value: getVal("usDriverLicenseState"),
            },
            {
              label:
                lang === "pt" ? "Já teve visto Americano?" : "Had US Visa?",
              value: getVal("hasHadUSVisa"),
            },
            {
              label:
                lang === "pt" ? "Data Emissão Visto" : "Visa Issuance Date",
              value: getVal("lastVisaIssuanceDate"),
            },
            {
              label: lang === "pt" ? "Número do Visto" : "Visa Number",
              value: getVal("lastVisaNumber"),
            },
            {
              label:
                lang === "pt" ? "Solicitando mesmo tipo?" : "Same type visa?",
              value: getVal("isSolicitingSameTypeVisa"),
            },
            {
              label:
                lang === "pt" ? "Mesmo país/local?" : "Same country applying?",
              value: getVal("isApplyingInSameCountry"),
            },
            {
              label:
                lang === "pt"
                  ? "Já coletou digitais?"
                  : "Fingerprinted before?",
              value: getVal("haveBeenFingerprintedBefore"),
            },
            {
              label: lang === "pt" ? "Visto extraviado?" : "Visa lost/stolen?",
              value: getVal("hasVisaBeenLostStolen"),
            },
            {
              label:
                lang === "pt"
                  ? "Explicação Visto Perdi."
                  : "Visa Lost Explanation",
              value: getVal("visaLostStolenExplanation"),
            },
            {
              label: lang === "pt" ? "Visto Cancelado?" : "Visa cancelled?",
              value: getVal("hasVisaBeenCancelled"),
            },
            {
              label:
                lang === "pt"
                  ? "Detalhes Cancelamento"
                  : "Cancellation Details",
              value: getVal("visaCancellationDetails"),
            },
            {
              label: lang === "pt" ? "Visto Negado?" : "Visa Denied?",
              value: getVal("hasBeenDeniedVisa"),
            },
            {
              label: lang === "pt" ? "Detalhes Negação" : "Refusal Details",
              value: getVal("visaRefusalDetails"),
            },
            {
              label:
                lang === "pt" ? "Petição Imigração?" : "Immigration Petition?",
              value: getVal("hasImmigrationPetition"),
            },
            {
              label: lang === "pt" ? "Detalhes Petição" : "Petition Details",
              value: getVal("immigrationPetitionDetails"),
            },
          ],
        },
        {
          title:
            lang === "pt"
              ? "Etapa 6: Endereço e Telefone"
              : "Step 6: Address & Phone",
          fields: [
            {
              label: lang === "pt" ? "Endereço Residencial" : "Home Address",
              value: getVal("homeAddress"),
            },
            {
              label: lang === "pt" ? "Cidade" : "City",
              value: getVal("homeCity"),
            },
            {
              label: lang === "pt" ? "Estado" : "State",
              value: getVal("homeState"),
            },
            { label: "ZIP Code", value: getVal("homeZip") },
            {
              label: lang === "pt" ? "País" : "Country",
              value: getVal("homeCountry"),
            },
            {
              label:
                lang === "pt"
                  ? "Ender. Correspondência Igual?"
                  : "Mailing same as home?",
              value: getVal("isMailingSameAsHome"),
            },
            {
              label:
                lang === "pt" ? "Endereço Correspondência" : "Mailing Address",
              value: getVal("mailingAddress"),
            },
            {
              label: lang === "pt" ? "Cidade correspondência" : "Mailing City",
              value: getVal("mailingCity"),
            },
            {
              label: lang === "pt" ? "Celular" : "Mobile Phone",
              value: getVal("mobilePhone"),
            },
            {
              label: lang === "pt" ? "Fixo" : "Home Phone",
              value: getVal("homePhone"),
            },
            {
              label: lang === "pt" ? "Trabalho" : "Work Phone",
              value: getVal("workPhone"),
            },
            {
              label:
                lang === "pt"
                  ? "Outros Telefones (5 anos)?"
                  : "Other phones (5 years)?",
              value: getVal("hasOtherPhoneLast5Years"),
            },
            {
              label:
                lang === "pt" ? "Detalhes Telefones" : "Other phones details",
              value: getVal("otherPhonesDetails"),
            },
            {
              label:
                lang === "pt"
                  ? "Outros E-mails (5 anos)?"
                  : "Other emails (5 years)?",
              value: getVal("hasOtherEmailLast5Years"),
            },
            {
              label:
                lang === "pt" ? "Detalhes E-mails" : "Other emails details",
              value: getVal("otherEmailsDetails"),
            },
          ],
        },
        {
          title:
            lang === "pt" ? "Etapa 7: Redes Sociais" : "Step 7: Social Media",
          fields: [
            { label: "Social Media 1", value: getVal("socialMedia1") },
            { label: "Social Media 2", value: getVal("socialMedia2") },
            { label: "Social Media 3", value: getVal("socialMedia3") },
          ],
        },
        {
          title:
            lang === "pt" ? "Etapa 8: Passaporte" : "Step 8: Passport Info",
          fields: [
            {
              label: lang === "pt" ? "Tipo de Passaporte" : "Passport Type",
              value: getVal("passportType"),
            },
            {
              label: lang === "pt" ? "Número do Passaporte" : "Passport Number",
              value: getVal("passportNumberDS"),
            },
            {
              label:
                lang === "pt" ? "Autoridade Emissora" : "Passport Authority",
              value: getVal("passportAuthority"),
            },
            {
              label: lang === "pt" ? "Cidade Emissão" : "Issuance City",
              value: getVal("passportIssuanceCity"),
            },
            {
              label: lang === "pt" ? "Estado Emissão" : "Issuance State",
              value: getVal("passportIssuanceState"),
            },
            {
              label: lang === "pt" ? "País Emissão" : "Issuance Country",
              value: getVal("passportIssuanceCountry"),
            },
            {
              label: lang === "pt" ? "Data Emissão" : "Issuance Date",
              value: getVal("passportIssuanceDate"),
            },
            {
              label: lang === "pt" ? "Data Validade" : "Expiration Date",
              value: getVal("passportExpirationDate"),
            },
            {
              label:
                lang === "pt"
                  ? "Passaporte extraviado?"
                  : "Passport lost/stolen?",
              value: getVal("hasPassportBeenLostStolen"),
            },
            {
              label:
                lang === "pt" ? "Detalhes Extravio" : "Lost passport details",
              value: getVal("lostPassportExplanationDetails"),
            },
          ],
        },
        {
          title:
            lang === "pt"
              ? "Etapa 9: Contato EUA"
              : "Step 9: US Point of Contact",
          fields: [
            {
              label: lang === "pt" ? "Nome do Contato" : "Contact Name",
              value: getVal("contactName"),
            },
            {
              label: lang === "pt" ? "Organização" : "Organization",
              value: getVal("contactOrganization"),
            },
            {
              label: lang === "pt" ? "Parentesco" : "Relationship",
              value: getVal("contactRelationship"),
            },
            {
              label: lang === "pt" ? "Endereço Contato" : "Contact Address",
              value: getVal("contactAddress"),
            },
            {
              label: lang === "pt" ? "Cidade Contato" : "Contact City",
              value: getVal("contactCity"),
            },
            {
              label: lang === "pt" ? "Estado Contato" : "Contact State",
              value: getVal("contactState"),
            },
            { label: "ZIP Code", value: getVal("contactZip") },
            {
              label: lang === "pt" ? "Telefone Contato" : "Contact Phone",
              value: getVal("contactPhone"),
            },
            { label: "Email Contato", value: getVal("contactEmail") },
          ],
        },
        {
          title:
            lang === "pt" ? "Etapa 10: Família" : "Step 10: Family Information",
          fields: [
            {
              label: lang === "pt" ? "Sobrenome Pai" : "Father Surname",
              value: getVal("fatherLastName"),
            },
            {
              label: lang === "pt" ? "Nome Pai" : "Father Given Name",
              value: getVal("fatherFirstName"),
            },
            {
              label: lang === "pt" ? "Nascimento Pai" : "Father Birth Date",
              value: getVal("fatherBirthDate"),
            },
            {
              label: lang === "pt" ? "Pai está nos EUA?" : "Is father in US?",
              value: getVal("isFatherInUS"),
            },
            {
              label: lang === "pt" ? "Status Pai nos EUA" : "Father US Status",
              value: getVal("fatherUSStatus"),
            },
            {
              label: lang === "pt" ? "Sobrenome Mãe" : "Mother Surname",
              value: getVal("motherLastName"),
            },
            {
              label: lang === "pt" ? "Nome Mãe" : "Mother Given Name",
              value: getVal("motherFirstName"),
            },
            {
              label: lang === "pt" ? "Nascimento Mãe" : "Mother Birth Date",
              value: getVal("motherBirthDate"),
            },
            {
              label: lang === "pt" ? "Mãe está nos EUA?" : "Is mother in US?",
              value: getVal("isMotherInUS"),
            },
            {
              label: lang === "pt" ? "Status Mãe nos EUA" : "Mother US Status",
              value: getVal("motherUSStatus"),
            },
            {
              label:
                lang === "pt"
                  ? "Parentes diretos nos EUA?"
                  : "Immediate relatives in US?",
              value: getVal("hasImmediateRelativesInUS"),
            },
            {
              label: lang === "pt" ? "Nome Parente" : "Relative Name",
              value: getVal("immediateRelativeName"),
            },
            {
              label:
                lang === "pt" ? "Parentesco Parente" : "Relative Relationship",
              value: getVal("immediateRelativeRelationship"),
            },
            {
              label: lang === "pt" ? "Status Parente" : "Relative Status",
              value: getVal("immediateRelativeStatus"),
            },
            {
              label:
                lang === "pt"
                  ? "Outros parentes nos EUA?"
                  : "Other relatives in US?",
              value: getVal("hasOtherRelativesInUS"),
            },
          ],
        },
        {
          title:
            lang === "pt"
              ? "Etapa 11: Trabalho e Educação"
              : "Step 11: Work & Education",
          fields: [
            {
              label:
                lang === "pt" ? "Ocupação Principal" : "Primary Occupation",
              value: getVal("primaryOccupation"),
            },
            {
              label: lang === "pt" ? "Nome Empresa/Inst." : "Employer/School",
              value: getVal("employerName"),
            },
            {
              label: lang === "pt" ? "Endereço" : "Address",
              value: getVal("employerAddress"),
            },
            {
              label: lang === "pt" ? "Cidade" : "City",
              value: getVal("employerCity"),
            },
            {
              label: lang === "pt" ? "Estado" : "State",
              value: getVal("employerState"),
            },
            { label: "ZIP Code", value: getVal("employerZip") },
            {
              label: lang === "pt" ? "Telefone" : "Phone",
              value: getVal("employerPhone"),
            },
            {
              label: lang === "pt" ? "País" : "Country",
              value: getVal("employerCountry"),
            },
            {
              label: lang === "pt" ? "Data Início" : "Start Date",
              value: getVal("jobStartDate"),
            },
            {
              label: lang === "pt" ? "Renda Mensal" : "Monthly Income",
              value: getVal("monthlyIncome"),
            },
            {
              label: lang === "pt" ? "Descrição Cargo" : "Job Description",
              value: getVal("jobDescription"),
            },
            {
              label:
                lang === "pt" ? "Empregos Anteriores?" : "Previous employment?",
              value: getVal("wasPreviouslyEmployed"),
            },
            {
              label:
                lang === "pt"
                  ? "Ensino Médio concluído?"
                  : "Secondary education?",
              value: getVal("hasSecondaryEducation"),
            },
            {
              label:
                lang === "pt"
                  ? "Instituição de Ensino"
                  : "Education Institution",
              value: getVal("educationInstitutionName"),
            },
          ],
        },
        {
          title: lang === "pt" ? "Etapa 12: Adicional" : "Step 12: Additional",
          fields: [
            {
              label: lang === "pt" ? "Clã/Tribo?" : "Clan/Tribe?",
              value: getVal("belongsToClan"),
            },
            {
              label: lang === "pt" ? "Nome Clã" : "Clan Name",
              value: getVal("clanName"),
            },
            {
              label: lang === "pt" ? "Idiomas" : "Languages",
              value: getVal("languagesSpoken"),
            },
            {
              label:
                lang === "pt"
                  ? "Visitou outros países (5 anos)?"
                  : "Visited other countries?",
              value: getVal("hasVisitedOtherCountries"),
            },
            {
              label: lang === "pt" ? "Quais países?" : "Countries details",
              value: getVal("countriesVisitedDetails"),
            },
          ],
        },
      ]
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-none p-0 bg-white dark:bg-slate-950 shadow-2xl">
        <div className="relative">
          {/* Header Section */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-accent/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <div>
                <DialogTitle className="text-title font-bold text-slate-900 dark:text-white">
                  {lang === "pt" ? "Revisão DS-160" : "DS-160 Review"}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400">
                  {lang === "pt"
                    ? "Confira todos os dados coletados para o preenchimento oficial."
                    : "Review all data collected for official filing."}
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
                <p className="text-slate-500 animate-pulse">
                  {lang === "pt" ? "Carregando dados..." : "Loading data..."}
                </p>
              </div>
            ) : !formData ? (
              <div className="text-center py-20 px-4">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {lang === "pt" ? "Dados não encontrados" : "Data not found"}
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  {lang === "pt"
                    ? "Não foi possível localizar as respostas para este processo."
                    : "Could not locate responses for this process."}
                </p>
              </div>
            ) : (
              <div className="space-y-12 pb-6">
                {sections.map((section, idx) => (
                  <div
                    key={idx}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shadow-lg">
                        {idx}
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 tracking-tight">
                        {section.title}
                      </h3>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1 ml-2"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {section.fields.map((field, i) => (
                        <div
                          key={i}
                          className="group p-4 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 rounded-md border border-transparent hover:border-accent/20 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 min-w-0"
                        >
                          <p
                            className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 group-hover:text-accent transition-colors truncate"
                            title={field.label}
                          >
                            {field.label}
                          </p>
                          <p
                            className="text-sm font-semibold text-slate-700 dark:text-slate-300 break-all whitespace-normal leading-tight"
                            title={field.value}
                          >
                            {field.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="p-4 bg-gradient-to-br from-accent/5 to-transparent border border-accent/10 rounded-3xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-md bg-accent/20 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                      {lang === "pt"
                        ? "Informações Protegidas"
                        : "Protected Information"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                      {lang === "pt"
                        ? "Estes dados são protegidos por criptografia de ponta a ponta e serão utilizados exclusivamente para o preenchimento do formulário oficial DS-160 da embaixada americana."
                        : "This data is protected by end-to-end encryption and will be used exclusively for filing the official US Embassy DS-160 form."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
