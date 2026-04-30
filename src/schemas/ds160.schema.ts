import { z } from "zod";
import { zodValidate } from "../utils/zodValidate";

// ─── Base helpers ────────────────────────────────────────────────────────────
const requiredString = (msg: string) => z.string({ message: msg }).min(1, msg);
const optionalString = () => z.string().optional().or(z.literal(""));
const yesNo = () => z.enum(["sim", "nao"], { message: "Selecione uma opção" });
const yesNoOptional = () => z.enum(["sim", "nao"]).optional();

// ─── DS-160 B1/B2 Zod Schema ─────────────────────────────────────────────────
export const DS160Schema = z
  .object({
    // 1. Entrevista
    interviewLocation: requiredString("Selecione o local da entrevista"),
    isBrazilian: yesNo(),

    // 2. Dados Pessoais
    surname: requiredString("Surname é obrigatório"),
    givenName: requiredString("Given Name é obrigatório"),
    fullNameNativeAlphabet: optionalString(),
    hasTelecodeForName: yesNo(),
    maternalGrandmotherName: requiredString("O nome da mãe da sua mãe é obrigatório"),
    fullName: requiredString("Nome completo é obrigatório (conforme passaporte)"),
    hasOtherNames: yesNo(),
    otherNames: optionalString(),
    gender: z.enum(["masculino", "feminino"], { message: "Selecione o sexo" }),
    maritalStatus: requiredString("Estado civil é obrigatório"),
    birthDate: requiredString("Data de nascimento é obrigatória"),
    birthCity: requiredString("Cidade de nascimento é obrigatória"),
    birthState: requiredString("Estado de nascimento é obrigatório"),
    birthCountry: requiredString("País de nascimento é obrigatório"),

    // 3. Nacionalidade
    hasOtherNationality: yesNo(),
    otherNationalityDetails: optionalString(),
    hasOtherResidence: yesNo(),
    otherResidenceCountry: optionalString(),
    cpf: requiredString("CPF é obrigatório"),

    // 4. Passaporte
    passportNumber: requiredString("Número do passaporte é obrigatório"),
    passportIssueDate: requiredString("Data de emissão é obrigatória"),
    passportExpDate: requiredString("Data de vencimento é obrigatória"),
    lostPassport: yesNo(),
    lostPassportNumber: optionalString(),
    lostPassportExpanation: optionalString(),

    // 5. Viagem
    travelPurpose: requiredString("Finalidade da viagem é obrigatória"),
    specificTravelPlan: yesNo(),
    arrivalDate: optionalString(),
    arrivalFlight: optionalString(),
    arrivalCity: optionalString(),
    placesToVisit: optionalString(),
    departureDate: optionalString(),
    departureFlight: optionalString(),
    departureCity: optionalString(),
    estArrivalDate: optionalString(),
    estStayLength: optionalString(),
    usStayName: requiredString("Local de hospedagem nos EUA é obrigatório"),
    usStayStreet: requiredString("Rua da hospedagem é obrigatória"),
    usStayCity: requiredString("Cidade da hospedagem é obrigatória"),
    usStayState: requiredString("Estado da hospedagem é obrigatório"),
    usStayZip: optionalString(),
    payingTrip: requiredString("Selecione quem vai pagar a viagem"),
    payerName: optionalString(),
    payerPhone: optionalString(),
    payerEmail: optionalString(),
    payerRelation: optionalString(),

    // 6. Acompanhantes
    travelingWithOthers: yesNo(),
    travelGroup: yesNoOptional(),
    companionsDetails: optionalString(),

    // 7. Viagens Anteriores
    beenToUS: yesNo(),
    previousVisitsDetails: optionalString(),
    hadUSDriverLicense: yesNoOptional(),
    hadUSVisa: yesNo(),
    lastVisaDate: optionalString(),
    lastVisaNumber: optionalString(),
    sameVisaType: yesNoOptional(),
    sameVisaCountry: yesNoOptional(),
    tenPrinted: yesNoOptional(),
    visaLost: yesNoOptional(),
    visaCancelled: yesNoOptional(),
    refusedUSVisa: yesNo(),
    refusedExpanation: optionalString(),
    immigrationPetition: yesNo(),
    petitionExpanation: optionalString(),

    // 8. Contato
    homeStreet: requiredString("Rua é obrigatória"),
    homeZip: requiredString("CEP é obrigatório"),
    homeCity: requiredString("Cidade é obrigatória"),
    homeState: requiredString("Estado é obrigatório"),
    homeCountry: requiredString("País é obrigatório"),
    differentMailingAddress: yesNo(),
    mailingAddressFull: optionalString(),
    primaryPhone: requiredString("Telefone principal é obrigatório"),
    secondaryPhone: optionalString(),
    cellPhone: optionalString(),
    otherPhones5Y: yesNo(),
    otherPhonesList: optionalString(),
    primaryEmail: z
      .string({ message: "E-mail é obrigatório" })
      .min(1, "E-mail é obrigatório")
      .email("E-mail inválido"),
    otherEmails5Y: yesNo(),
    otherEmailList: optionalString(),
    socialMediaAccounts: requiredString("Informe suas redes sociais"),

    // 9. Família
    fatherName: optionalString(),
    fatherBirth: optionalString(),
    fatherInUS: yesNoOptional(),
    fatherUSStatus: optionalString(),
    motherName: optionalString(),
    motherBirth: optionalString(),
    motherInUS: yesNoOptional(),
    motherUSStatus: optionalString(),
    otherRelInUS: yesNoOptional(),
    spouseName: optionalString(),
    spouseBirth: optionalString(),
    spouseCity: optionalString(),
    spouseCountry: optionalString(),
    spouseSameAddress: yesNoOptional(),

    // 10. Trabalho e Educação
    primaryJobSector: requiredString("Área de atuação é obrigatória"),
    primaryJobEntity: requiredString("Empresa/Escola é obrigatória"),
    primaryJobAddress: optionalString(),
    primaryJobPhone: optionalString(),
    primaryJobSalary: optionalString(),
    primaryJobDuties: optionalString(),
    employedLast5Y: yesNo(),
    prevEmployerName: optionalString(),
    prevEmployerTitle: optionalString(),
    prevEmployerStart: optionalString(),
    prevEmployerEnd: optionalString(),
    prevEmployerDuties: optionalString(),
    higherEducation: yesNo(),
    eduName: optionalString(),
    eduCourse: optionalString(),
    eduStart: optionalString(),
    eduEnd: optionalString(),
    belongsToTribe: yesNo(),
    fluentLanguages: requiredString("Informe os idiomas que fala"),
    countriesVisited5Y: optionalString(),
    servedMilitary: yesNo(),
    militaryBranch: optionalString(),
    militarySpecialty: optionalString(),

    // 11. Segurança
    securityExceptions: z.enum(["sim", "nao"]).default("nao"),
    securityExceptionsDetails: optionalString(),
  })
  .superRefine((data, ctx) => {
    // Outros nomes: se sim, campo obrigatório
    if (data.hasOtherNames === "sim" && !data.otherNames?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe o outro nome", path: ["otherNames"] });
    }

    // Passaporte perdido: campos obrigatórios
    if (data.lostPassport === "sim") {
      if (!data.lostPassportNumber?.trim())
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe o número do passaporte perdido", path: ["lostPassportNumber"] });
      if (!data.lostPassportExpanation?.trim())
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Explique o ocorrido", path: ["lostPassportExpanation"] });
    }

    // Plano específico: datas obrigatórias se sim
    if (data.specificTravelPlan === "sim") {
      if (!data.arrivalDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Data de chegada obrigatória", path: ["arrivalDate"] });
      if (!data.arrivalCity?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cidade de chegada obrigatória", path: ["arrivalCity"] });
    }
    if (data.specificTravelPlan === "nao") {
      if (!data.estArrivalDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Data estimada obrigatória", path: ["estArrivalDate"] });
    }

    // Pagador: dados obrigatórios se não for eu
    if (data.payingTrip && data.payingTrip !== "eu") {
      if (!data.payerName?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nome do pagador é obrigatório", path: ["payerName"] });
      if (!data.payerRelation?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Relação é obrigatória", path: ["payerRelation"] });
    }

    // Visita anterior: detalhes obrigatórios
    if (data.beenToUS === "sim" && !data.previousVisitsDetails?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe os detalhes das visitas", path: ["previousVisitsDetails"] });
    }

    // Visto anterior: número obrigatório
    if (data.hadUSVisa === "sim" && !data.lastVisaDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe a data do último visto", path: ["lastVisaDate"] });
    }

    // Visto negado: explicação
    if (data.refusedUSVisa === "sim" && !data.refusedExpanation?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Explique o motivo da recusa", path: ["refusedExpanation"] });
    }

    // Petição: explicação
    if (data.immigrationPetition === "sim" && !data.petitionExpanation?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Explique a petição", path: ["petitionExpanation"] });
    }

    // Emprego anterior
    if (data.employedLast5Y === "sim" && !data.prevEmployerName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe o nome do empregador anterior", path: ["prevEmployerName"] });
    }

    // Escolaridade
    if (data.higherEducation === "sim" && !data.eduName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe a instituição de ensino", path: ["eduName"] });
    }

    // Segurança: detalhes obrigatórios
    if (data.securityExceptions === "sim" && !data.securityExceptionsDetails?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Detalhe a exceção de segurança", path: ["securityExceptionsDetails"] });
    }
  });

export type DS160FormValues = z.infer<typeof DS160Schema>;

export const ds160Validator = zodValidate(DS160Schema as z.ZodTypeAny);
