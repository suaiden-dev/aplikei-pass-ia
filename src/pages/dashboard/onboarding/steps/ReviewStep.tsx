import { useState } from "react";
import { StepProps } from "../types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const ReviewStep = ({
  formData,
  o,
  t,
  lang,
  serviceSlug,
  serviceStatus,
}: StepProps) => {
  const [currentReviewStep, setCurrentReviewStep] = useState(0);
  const isDS160 = serviceSlug === "visto-b1-b2";
  const ds = t?.ds160;

  const translateYesNo = (val?: string) => {
    if (val === "yes")
      return lang === "pt" ? "Sim" : lang === "es" ? "Sí" : "Yes";
    if (val === "no") return lang === "pt" ? "Não" : "No";
    if (val === "yesApproved")
      return lang === "pt"
        ? "Sim, aprovado"
        : lang === "es"
          ? "Sí, aprobada"
          : "Yes, approved";
    if (val === "yesDenied")
      return lang === "pt"
        ? "Sim, negado"
        : lang === "es"
          ? "Sí, negada"
          : "Yes, denied";
    return val;
  };

  const formatSocialMedia = () => {
    if (
      !formData.socialMediaPlatforms ||
      !Array.isArray(formData.socialMediaPlatforms)
    )
      return "";
    return formData.socialMediaPlatforms
      .map((p) => `${p.platform}: ${p.identifier}`)
      .join(" | ");
  };

  const ds160Sections = isDS160
    ? [
        {
          title: ds?.interview?.title?.[lang] || "Local da Entrevista",
          fields: [
            {
              label: ds?.interview?.location?.[lang] || "Local",
              value: formData.interviewLocation,
            },
          ],
        },
        {
          title: ds?.personal1?.title?.[lang] || "Informações Pessoais 1",
          fields: [
            {
              label: ds?.personal1?.firstName?.[lang] || "Nome (Given Names)",
              value: formData.firstName,
            },
            {
              label: ds?.personal1?.lastName?.[lang] || "Sobrenome (Surname)",
              value: formData.lastName,
            },
            {
              label:
                ds?.personal1?.fullNamePassport?.[lang] ||
                "Nome completo no passaporte",
              value: formData.fullNamePassport,
            },
            {
              label: ds?.personal1?.email?.[lang] || "E-mail",
              value: formData.email,
            },
            {
              label:
                ds?.personal1?.hasOtherNames?.[lang] || "Usou outros nomes?",
              value: translateYesNo(formData.hasOtherNames),
            },
            { label: "Outros Nomes", value: formData.otherNames },
            {
              label: ds?.personal1?.hasTelecode?.[lang] || "Possui telecódigo?",
              value: translateYesNo(formData.hasTelecode),
            },
            { label: "Telecódigo", value: formData.telecodeValue },
            {
              label: ds?.personal1?.gender?.[lang] || "Sexo",
              value:
                formData.gender === "male"
                  ? "Masculino"
                  : formData.gender === "female"
                    ? "Feminino"
                    : formData.gender,
            },
            {
              label: ds?.personal1?.maritalStatus?.[lang] || "Estado Civil",
              value: formData.maritalStatus,
            },
            { label: "Data de Nascimento", value: formData.birthDate },
            { label: "Cidade de Nascimento", value: formData.birthCity },
            { label: "Estado de Nascimento", value: formData.birthState },
            { label: "País de Nascimento", value: formData.birthCountry },
          ],
        },
        {
          title: ds?.personal2?.title?.[lang] || "Informações Pessoais 2",
          fields: [
            {
              label: ds?.personal2?.nationalityInfo?.[lang] || "Nacionalidade",
              value: formData.nationalityInfo,
            },
            {
              label:
                ds?.personal2?.hasOtherNationality?.[lang] ||
                "Outra nacionalidade?",
              value: translateYesNo(formData.hasOtherNationality),
            },
            {
              label: "Outras Nacionalidades",
              value: formData.otherNationalities,
            },
            {
              label:
                ds?.personal2?.hasNationalityPassport?.[lang] ||
                "Passaporte de outra nacionalidade?",
              value: translateYesNo(formData.hasNationalityPassport),
            },
            {
              label: "Número do passaporte extra",
              value: formData.nationalityPassportNumber,
            },
            {
              label:
                ds?.personal2?.isPermanentResidentOtherCountry?.[lang] ||
                "Residente permanente de outro país?",
              value: translateYesNo(formData.isPermanentResidentOtherCountry),
            },
            {
              label: "País de residência permanente",
              value: formData.permResCountryDetails,
            },
            {
              label:
                ds?.personal2?.nationalID?.[lang] ||
                "Identidade Nacional (CPF/RG)",
              value: formData.nationalIDDoesNotApply
                ? "Não se aplica"
                : formData.nationalID,
            },
            {
              label:
                ds?.personal2?.ssn?.[lang] || "U.S. Social Security Number",
              value: formData.ssnDoesNotApply ? "Não se aplica" : formData.ssn,
            },
            {
              label: ds?.personal2?.taxID?.[lang] || "U.S. Taxpayer ID Number",
              value: formData.taxIDDoesNotApply
                ? "Não se aplica"
                : formData.taxID,
            },
          ],
        },
        {
          title: ds?.travel?.title?.[lang] || "Informações de Viagem",
          fields: [
            {
              label:
                ds?.travel?.hasSpecificTravelPlan?.[lang] ||
                "Plano de viagem específico?",
              value: translateYesNo(formData.hasSpecificTravelPlan),
            },
            { label: "Data de Chegada", value: formData.arrivalDate },
            { label: "Voo de Chegada", value: formData.arrivalFlightNumber },
            { label: "Cidade de Chegada", value: formData.arrivalCity },
            { label: "Data de Partida", value: formData.departureDate },
            { label: "Voo de Partida", value: formData.departureFlightNumber },
            { label: "Cidade de Partida", value: formData.departureCity },
            {
              label:
                ds?.travel?.stayDurationValue?.[lang] || "Duração da estadia",
              value: formData.stayDurationValue
                ? `${formData.stayDurationValue} ${formData.stayDurationUnit}`
                : "",
            },
            { label: "Locais a visitar", value: formData.visitLocations },
            {
              label: "Endereço de estadia nos EUA",
              value: formData.stayAddress,
            },
            { label: "Cidade de estadia", value: formData.stayCity },
            { label: "Estado de estadia", value: formData.stayState },
            { label: "CEP de estadia", value: formData.stayZip },
            {
              label: ds?.travel?.travelPayer?.[lang] || "Quem pagará a viagem?",
              value: formData.travelPayer,
            },
            { label: "Nome do pagador", value: formData.payerName },
            { label: "Relação com pagador", value: formData.payerRelationship },
          ],
        },
        {
          title: ds?.companions?.title?.[lang] || "Acompanhantes de Viagem",
          fields: [
            {
              label:
                ds?.companions?.hasTravelCompanions?.[lang] ||
                "Viajando com outras pessoas?",
              value: translateYesNo(formData.hasTravelCompanions),
            },
            { label: "Nome do Acompanhante", value: formData.companionName },
            {
              label: "Relação com Acompanhante",
              value: formData.companionRelationship,
            },
            {
              label:
                ds?.companions?.isTravelingWithGroup?.[lang] ||
                "Parte de um grupo?",
              value: translateYesNo(formData.isTravelingWithGroup),
            },
            { label: "Nome do Grupo", value: formData.groupName },
          ],
        },
        {
          title:
            ds?.previousTravel?.title?.[lang] || "Viagens Anteriores aos EUA",
          fields: [
            {
              label: "Já esteve nos EUA?",
              value: translateYesNo(formData.hasBeenToUS),
            },
            {
              label: "Data da última viagem",
              value: formData.lastUSTravelDate,
            },
            {
              label: "Porto de entrada",
              value: formData.lastUSTravelPortOfEntry,
            },
            {
              label: "Duração",
              value: formData.lastUSTravelDurationValue
                ? `${formData.lastUSTravelDurationValue} ${formData.lastUSTravelDurationUnit}`
                : "",
            },
            { label: "Motivo da viagem", value: formData.lastUSTravelPurpose },
            {
              label: "Carteira de motorista dos EUA?",
              value: translateYesNo(formData.hasUSDriverLicense),
            },
            {
              label: "Número da Habilitação",
              value: formData.usDriverLicenseNumber,
            },
            { label: "Estado Emissor", value: formData.usDriverLicenseState },
            {
              label: "Já teve um visto dos EUA?",
              value: translateYesNo(formData.hasHadUSVisa),
            },
            {
              label: "Data de emissão do último visto",
              value: formData.lastVisaIssuanceDate,
            },
            { label: "Número do visto", value: formData.lastVisaNumber },
            {
              label: "Visto já foi cancelado?",
              value: translateYesNo(formData.hasVisaBeenCancelled),
            },
            {
              label: "Detalhes do cancelamento",
              value: formData.visaCancellationDetails,
            },
            {
              label: "Já teve visto negado?",
              value: translateYesNo(formData.hasBeenDeniedVisa),
            },
            { label: "Detalhes da recusa", value: formData.visaRefusalDetails },
            {
              label: "Alguém já preencheu petição de imigração para você?",
              value: translateYesNo(formData.hasImmigrationPetition),
            },
            {
              label: "Detalhes da petição",
              value: formData.immigrationPetitionDetails,
            },
            {
              label: "Solicitando visto do mesmo tipo?",
              value: translateYesNo(formData.isSolicitingSameTypeVisa),
            },
            {
              label: "Aplicando no mesmo país?",
              value: translateYesNo(formData.isApplyingInSameCountry),
            },
            {
              label: "Já colheu digitais?",
              value: translateYesNo(formData.haveBeenFingerprintedBefore),
            },
            {
              label: "Passaporte/Visto roubado ou perdido?",
              value: translateYesNo(formData.hasVisaBeenLostStolen),
            },
            { label: "Ano do roubo/perda", value: formData.visaLostStolenYear },
            {
              label: "Explicação (Visto)",
              value: formData.visaLostStolenExplanation,
            },
          ],
        },
        {
          title: ds?.addressPhone?.title?.[lang] || "Endereço e Contato",
          fields: [
            { label: "Endereço residencial", value: formData.homeAddress },
            { label: "Cidade", value: formData.homeCity },
            { label: "Estado/Província", value: formData.homeState },
            { label: "CEP", value: formData.homeZip },
            { label: "País", value: formData.homeCountry },
            {
              label: "Endereço de correspondência é o mesmo?",
              value: translateYesNo(formData.isMailingSameAsHome),
            },
            {
              label: "Endereço de correspondência",
              value: formData.mailingAddress,
            },
            { label: "Cidade (Correspondência)", value: formData.mailingCity },
            { label: "Estado (Correspondência)", value: formData.mailingState },
            { label: "CEP (Correspondência)", value: formData.mailingZip },
            { label: "Celular Principal", value: formData.mobilePhone },
            { label: "Telefone Residencial", value: formData.homePhone },
            { label: "Telefone de Trabalho", value: formData.workPhone },
            {
              label: "Teve outros telefones (últimos 5 anos)?",
              value: translateYesNo(formData.hasOtherPhoneLast5Years),
            },
            { label: "Outros telefones", value: formData.otherPhonesDetails },
            {
              label: "Teve outros e-mails (últimos 5 anos)?",
              value: translateYesNo(formData.hasOtherEmailLast5Years),
            },
            { label: "Outros e-mails", value: formData.otherEmailsDetails },
          ],
        },
        {
          title: ds?.socialMedia?.title?.[lang] || "Mídias Sociais",
          fields: [
            { label: "Mídia Social Integrada", value: formatSocialMedia() },
            { label: "Plataforma 1", value: formData.socialMedia1 },
            { label: "Plataforma 2", value: formData.socialMedia2 },
            { label: "Plataforma 3", value: formData.socialMedia3 },
          ],
        },
        {
          title: ds?.passport?.title?.[lang] || "Passaporte",
          fields: [
            {
              label: ds?.passport?.type?.[lang] || "Tipo",
              value: formData.passportType,
            },
            {
              label: ds?.passport?.number?.[lang] || "Número do passaporte",
              value: formData.passportNumberDS,
            },
            {
              label: ds?.passport?.authority?.[lang] || "Autoridade Emissora",
              value: formData.passportAuthority,
            },
            {
              label: ds?.passport?.city?.[lang] || "Cidade de emissão",
              value: formData.passportIssuanceCity,
            },
            {
              label: ds?.passport?.state?.[lang] || "Estado de emissão",
              value: formData.passportIssuanceState,
            },
            {
              label: ds?.passport?.country?.[lang] || "País de emissão",
              value: formData.passportIssuanceCountry,
            },
            {
              label: ds?.passport?.issuanceDate?.[lang] || "Data de emissão",
              value: formData.passportIssuanceDate,
            },
            {
              label:
                ds?.passport?.expirationDate?.[lang] || "Data de expiração",
              value: formData.passportExpirationDate,
            },
            {
              label:
                ds?.passport?.lostStolen?.[lang] ||
                "Passaporte anterior perdido/roubado?",
              value: translateYesNo(formData.hasPassportBeenLostStolen),
            },
            {
              label: "Número do passaporte perdido/roubado",
              value: formData.lostPassportNumberDetails,
            },
            {
              label: "País emissor do perdido/roubado",
              value: formData.lostPassportCountryDetails,
            },
            {
              label: "Explicação (Passaporte)",
              value: formData.lostPassportExplanationDetails,
            },
          ],
        },
        {
          title: ds?.usContact?.title?.[lang] || "Contato nos EUA",
          fields: [
            {
              label: "Possui Contato nos EUA?",
              value: translateYesNo(formData.hasUSContact),
            },
            {
              label: "Nome do Contato",
              value: formData.contactNameDoesNotApply
                ? "Não sabe (Do Not Know)"
                : formData.contactName,
            },
            {
              label: "Organização do Contato",
              value: formData.contactOrganizationDoesNotApply
                ? "Não sabe (Do Not Know)"
                : formData.contactOrganization,
            },
            { label: "Relação com você", value: formData.contactRelationship },
            { label: "Endereço nos EUA", value: formData.contactAddress },
            { label: "Cidade nos EUA", value: formData.contactCity },
            { label: "Estado nos EUA", value: formData.contactState },
            { label: "CEP nos EUA", value: formData.contactZip },
            { label: "Telefone do Contato", value: formData.contactPhone },
            {
              label: "Email do Contato",
              value: formData.contactEmailDoesNotApply
                ? "Não sabe (Do Not Know)"
                : formData.contactEmail,
            },
          ],
        },
        {
          title: ds?.family?.title?.[lang] || "Informações Familiares",
          fields: [
            { label: "Sobrenome do Pai", value: formData.fatherLastName },
            { label: "Nome do Pai", value: formData.fatherFirstName },
            {
              label: "Data de Nascimento do Pai",
              value: formData.fatherBirthDate,
            },
            {
              label: "Pai está nos EUA?",
              value: translateYesNo(formData.isFatherInUS),
            },
            { label: "Status do Pai nos EUA", value: formData.fatherUSStatus },
            { label: "Sobrenome da Mãe", value: formData.motherLastName },
            { label: "Nome da Mãe", value: formData.motherFirstName },
            {
              label: "Data de Nascimento da Mãe",
              value: formData.motherBirthDate,
            },
            {
              label: "Mãe está nos EUA?",
              value: translateYesNo(formData.isMotherInUS),
            },
            { label: "Status da Mãe nos EUA", value: formData.motherUSStatus },
            {
              label: "Tem parentes imediatos nos EUA?",
              value: translateYesNo(formData.hasImmediateRelativesInUS),
            },
            { label: "Nome do Parente", value: formData.immediateRelativeName },
            { label: "Relação", value: formData.immediateRelativeRelationship },
            {
              label: "Status do Parente nos EUA",
              value: formData.immediateRelativeStatus,
            },
            {
              label: "Outros parentes nos EUA?",
              value: translateYesNo(formData.hasOtherRelativesInUS),
            },
          ],
        },
        {
          title: ds?.workEducation?.title?.[lang] || "Trabalho e Educação",
          fields: [
            { label: "Ocupação principal", value: formData.primaryOccupation },
            {
              label: "Nome da Empresa Subcontratada/Escola",
              value: formData.employerName,
            },
            { label: "Endereço de emprego", value: formData.employerAddress },
            { label: "Cidade", value: formData.employerCity },
            { label: "Estado/Província", value: formData.employerState },
            { label: "CEP/Código Postal", value: formData.employerZip },
            { label: "Telefone de emprego", value: formData.employerPhone },
            { label: "País de emprego", value: formData.employerCountry },
            { label: "Data de Início", value: formData.jobStartDate },
            { label: "Renda Mensal", value: formData.monthlyIncome },
            { label: "Descrição das funções", value: formData.jobDescription },
            {
              label: "Foi previamente empregado?",
              value: translateYesNo(formData.wasPreviouslyEmployed),
            },
            { label: "Empregador Anterior", value: formData.prevEmployerName },
            { label: "Cargo Anterior", value: formData.prevJobTitle },
            { label: "Período", value: formData.prevJobPeriod },
            { label: "Motivo da Saída", value: formData.prevJobReasonLeft },
            { label: "Supervisor", value: formData.prevEmployerSupervisor },
            {
              label: "Possui Ensino Médio/Superior?",
              value: translateYesNo(formData.hasSecondaryEducation),
            },
            { label: "Instituição", value: formData.educationInstitutionName },
            {
              label: "Data de Conclusão",
              value: formData.educationCompletionDate,
            },
            { label: "Grau/Curso", value: formData.educationDegree },
          ],
        },
        {
          title: ds?.additional?.title?.[lang] || "Informações Adicionais",
          fields: [
            {
              label: "Pertence a Clã/Tribo?",
              value: translateYesNo(formData.belongsToClan),
            },
            { label: "Nome do Clã/Tribo", value: formData.clanName },
            { label: "Idiomas falados", value: formData.languagesSpoken },
            {
              label: "Viajou a outros países nos últimos 5 anos?",
              value: translateYesNo(formData.hasVisitedOtherCountries),
            },
            {
              label: "Países Visitados",
              value: formData.countriesVisitedLast5Years,
            },
            {
              label: "Detalhes de Países Visitados",
              value: formData.countriesVisitedDetails,
            },
          ],
        },
      ]
        .map((section) => ({
          ...section,
          fields: section.fields.filter(
            (f) => f.value !== undefined && f.value !== "" && f.value !== null,
          ),
        }))
        .filter((section) => section.fields.length > 0)
    : [];

  const defaultSections = [
    {
      title: o.personalData?.[lang] || "Dados Pessoais",
      fields: [
        {
          label: o.fullName?.[lang] || "Nome Completo",
          value: formData.fullName,
        },
        { label: o.dob?.[lang] || "Data de Nascimento", value: formData.dob },
        {
          label: o.passportNumber?.[lang] || "Passaporte",
          value: formData.passportNumber,
        },
        {
          label: o.nationality?.[lang] || "Nacionalidade",
          value: formData.nationality,
        },
        {
          label: o.currentAddress?.[lang] || "Endereço",
          value: formData.currentAddress,
        },
      ],
    },
    {
      title: o.travelHistory?.[lang] || "Histórico de viagens",
      fields: [
        {
          label: o.travelledBefore?.[lang] || "Viajou antes?",
          value: translateYesNo(formData.travelledBefore),
        },
        {
          label: o.hadVisa?.[lang] || "Teve visto?",
          value: translateYesNo(formData.hadVisa),
        },
        {
          label: o.countriesVisited?.[lang] || "Países visitados",
          value: formData.countriesVisited,
        },
      ],
    },
    {
      title: o.processInfo?.[lang] || "Informações do processo",
      fields: [
        {
          label: o.travelPurpose?.[lang] || "Motivo",
          value: formData.travelPurpose,
        },
        {
          label: o.expectedDate?.[lang] || "Data",
          value: formData.expectedDate,
        },
        {
          label: o.expectedDuration?.[lang] || "Duração",
          value: formData.expectedDuration,
        },
        {
          label: o.consulateCity?.[lang] || "Consulado",
          value: formData.consulateCity,
        },
      ],
    },
  ]
    .map((section) => ({
      ...section,
      fields: section.fields.filter(
        (f) => f.value !== undefined && f.value !== "" && f.value !== null,
      ),
    }))
    .filter((section) => section.fields.length > 0);

  const sections = isDS160 ? ds160Sections : defaultSections;

  // Se estiver vazio, não se aplica paginação
  if (sections.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-foreground">
          {o.finalReview?.[lang] || "Revisão Final"}
        </h2>
        <div className="flex flex-col items-center justify-center p-5 text-center bg-muted/30 rounded-md border border-dashed border-border">
          <p className="text-muted-foreground">
            {o.fillPrevious?.[lang] ||
              "Preencha as informações anteriores para ver o resumo."}
          </p>
        </div>
      </div>
    );
  }

  const maxSteps = sections.length;
  const currentSection = sections[currentReviewStep];

  const nextSection = () => {
    if (currentReviewStep < maxSteps - 1)
      setCurrentReviewStep((prev) => prev + 1);
  };

  const prevSection = () => {
    if (currentReviewStep > 0) setCurrentReviewStep((prev) => prev - 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            {o.finalReview?.[lang] || "Revisão Final"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {o.finalReviewDesc?.[lang] ||
              "Revise suas informações revisando seção por seção."}
          </p>
        </div>
        <div className="bg-accent/10 text-accent font-medium px-3 py-1 rounded-full text-xs">
          {currentReviewStep + 1} / {maxSteps}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-4 space-y-4">
        <h3 className="font-medium text-accent border-b border-border/50 pb-2">
          {currentSection.title}
        </h3>

        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {currentSection.fields.map((field, fIdx) => (
            <div
              key={fIdx}
              className="flex flex-col bg-muted/30 p-3 rounded-md border border-border/50 transition-all hover:border-accent/40 min-w-0"
            >
              <span
                className="text-xs text-muted-foreground truncate"
                title={field.label}
              >
                {field.label}
              </span>
              <span className="font-medium text-foreground mt-1 break-all whitespace-normal leading-tight">
                {field.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSection}
            disabled={currentReviewStep === 0}
            className="gap-1.5 focus:ring-accent"
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />{" "}
            {o.previous?.[lang] || "Anterior"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSection}
            disabled={currentReviewStep === maxSteps - 1}
            className="gap-1.5 focus:ring-accent"
            type="button"
          >
            {o.next?.[lang] || "Próximo"} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {currentReviewStep === maxSteps - 1 && (
        <div
          className={`p-4 border rounded-md text-sm mt-4 animate-in fade-in slide-in-from-bottom-2 ${
            serviceStatus === "review_pending" ||
            serviceStatus === "review_assign"
              ? "bg-accent/10 border-accent/30 text-accent"
              : "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400"
          }`}
        >
          {serviceStatus === "review_pending"
            ? lang === "pt"
              ? "Seu formulário já está sendo processado pela nossa equipe. Você pode revisar as informações acima, mas não precisa enviar novamente."
              : lang === "es"
                ? "Su formulario ya está siendo procesado por nuestro equipo. Puede revisar la información anterior, pero no es necesario enviarlo de nuevo."
                : "Your form is already being processed by our team. You can review the information above, but you do not need to submit it again."
            : lang === "pt"
              ? "Você chegou ao fim da revisão! Se tudo estiver correto, clique no botão principal para confirmar e gerar seu pacote."
              : lang === "es"
                ? "¡Has llegado al final de la revisión! Si todo está correcto, haz clic en el botão principal para confirmar e gerar tu pacote."
                : "You have reached the end of the review! If everything is correct, click the main button to confirm and generate your package."}
        </div>
      )}
    </div>
  );
};
