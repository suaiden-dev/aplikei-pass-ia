import { z } from "zod";
import { zodValidate } from "../utils/zodValidate";

/**
 * Standard USCIS Format Regexes
 */
const SSN_REGEX = /^\d{3}-\d{2}-\d{4}$/;
const DATE_REGEX = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
const ANUMBER_REGEX = /^A?(\d{7,9})$/; // Match 7-9 digits, optional 'A' prefix
const I94_REGEX = /^\d{11}$/; // I-94 is exactly 11 digits
const ZIP_REGEX = /^\d{5}(-\d{4})?$/; // US Zip
const PHONE_REGEX = /^(\(\d{3}\) \d{3}-\d{4})|(\+\d{2} \(\d{5}\) \d{4})$/;

/**
 * I-539 Zod Schema - Professional Implementation
 * Covers Part 1 to Part 7 of USCIS I-539 Form
 * Aligned with I539Data type (string | undefined)
 */
export const I539ValidationSchema = z.object({
  // --- Part 1: Identification ---
  familyName: z.string()
    .min(1, "Family Name is required / Sobrenome é obrigatório")
    .max(40, "Maximum 40 characters / Máximo 40 caracteres"),
  givenName: z.string()
    .min(1, "Given Name is required / Nome é obrigatório")
    .max(40, "Maximum 40 characters / Máximo 40 caracteres"),
  hasMiddleName: z.boolean().optional(),
  middleName: z.string()
    .max(40, "Maximum 40 characters / Máximo 40 caracteres")
    .optional()
    .or(z.literal("")),

  alienNumber: z.string()
    .refine(val => !val || ANUMBER_REGEX.test(val), {
      message: "Invalid A-Number format / Formato de A-Number inválido"
    })
    .optional()
    .or(z.literal("")),
  uscisOnlineAccountNumber: z.string()
    .max(15, "USCIS Account number is too long / Conta USCIS longa demais")
    .optional()
    .or(z.literal("")),

  // Mailing Address
  inCareOf: z.string().optional().or(z.literal("")),
  streetName: z.string()
    .min(1, "Street Name is required / Nome da rua é obrigatório")
    .max(40, "Maximum 40 characters / Máximo 40 caracteres"),
  aptSteFlrUnit: z.enum(["Apt", "Ste", "Flr"]).optional(),
  aptSteFlrNumber: z.string()
    .max(10, "Unit number is too long / Nº de unidade longo demais")
    .optional()
    .or(z.literal("")),
  city: z.string()
    .min(1, "City is required / Cidade é obrigatória")
    .max(30, "Maximum 30 characters / Máximo 30 caracteres"),
  state: z.string()
    .min(1, "State is required / Estado é obrigatório"),
  zipCode: z.string()
    .min(1, "ZIP Code is required / ZIP Code é obrigatório")
    .regex(ZIP_REGEX, "Invalid ZIP format / Formato de ZIP inválido"),
  hasMailingAddress: z.boolean().optional(),

  // Physical/Foreign Address (Conditional in superRefine)
  streetNameForeign: z.string().optional().or(z.literal("")),
  aptSteFlrForeignUnit: z.enum(["Apt", "Ste", "Flr"]).optional(),
  aptSteFlrForeignNumber: z.string().optional().or(z.literal("")),
  cityForeign: z.string().optional().or(z.literal("")),
  stateForeign: z.string().optional().or(z.literal("")),
  zipCodeForeign: z.string().optional().or(z.literal("")),

  // Biographics & Arrival
  dateOfBirth: z.string()
    .min(1, "Date of Birth is required / Data de nascimento é obrigatória")
    .regex(DATE_REGEX, "Invalid date format (MM/DD/YYYY) / Formato de data inválido"),
  countryOfCitizenship: z.string()
    .min(1, "Country of Citizenship is required / País de cidadania é obrigatório"),
  countryOfBirth: z.string()
    .min(1, "Country of Birth is required / País de nascimento é obrigatório"),
  ssn: z.string()
    .refine(val => !val || SSN_REGEX.test(val), {
      message: "Invalid SSN format (XXX-XX-XXXX) / SSN deve seguir o formato XXX-XX-XXXX"
    })
    .optional()
    .or(z.literal("")),
  dateOfArrival: z.string()
    .min(1, "Date of Last Arrival is required / Data de chegada é obrigatória")
    .regex(DATE_REGEX, "Invalid date format (MM/DD/YYYY) / Formato de data inválido"),
  i94Number: z.string()
    .min(1, "I-94 Number is required / Nº do I-94 é obrigatório")
    .regex(I94_REGEX, "I-94 must be 11 digits / I-94 deve ter 11 dígitos"),
  passportNumber: z.string()
    .min(1, "Passport Number is required / Nº do passaporte é obrigatório")
    .max(20, "Passport too long / Passaporte longo demais"),
  travelDocCountry: z.string().optional().or(z.literal("")),
  countryOfIssuance: z.string().optional().or(z.literal("")),
  passportExpirationDate: z.string()
    .min(1, "Passport Expiration is required / Expiração do passaporte é obrigatória")
    .regex(DATE_REGEX, "Invalid date format (MM/DD/YYYY) / Formato de data inválido"),
  currentStatus: z.string()
    .min(1, "Current Nonimmigrant Status is required / Status atual é obrigatório"),
  statusExpirationDate: z.string().optional().or(z.literal("")),
  statusExpiresDS: z.boolean().optional(),

  // --- Part 2: Application Details ---
  applicationType: z.literal("change"),
  extendSelf: z.boolean().optional(),
  extendSpouse: z.boolean().optional(),
  extendChildren: z.boolean().optional(),
  numberOfCoApplicants: z.string().optional().or(z.literal("")),
  newStatusDropdown: z.string().optional().or(z.literal("")),
  effectiveDate: z.string()
    .refine(val => !val || DATE_REGEX.test(val), {
      message: "Invalid date format (MM/DD/YYYY) / Formato de data inválido"
    })
    .optional()
    .or(z.literal("")),
  priorExtensionDate: z.string().optional().or(z.literal("")),

  // --- Part 3: Additional Information ---
  priorExtensionYes: z.boolean().optional(),
  priorExtensionNo: z.boolean().optional(),
  petitionType_I130: z.boolean().optional(),
  petitionType_I140: z.boolean().optional(),
  petitionType_I360: z.boolean().optional(),
  petitionerName: z.string().optional().or(z.literal("")),
  petitionFiledDate: z.string().optional().or(z.literal("")),
  receiptNumber: z.string().optional().or(z.literal("")),
  docCountry1: z.string().optional().or(z.literal("")),
  docCountry2: z.string().optional().or(z.literal("")),
  docStreet: z.string().optional().or(z.literal("")),
  docUnit0: z.boolean().optional(),
  docUnit1: z.boolean().optional(),
  docUnit2: z.boolean().optional(),
  docUnitNumber: z.string().optional().or(z.literal("")),
  docCity: z.string().optional().or(z.literal("")),
  docProvince: z.string().optional().or(z.literal("")),
  docPostalCode: z.string().optional().or(z.literal("")),
  docCountry: z.string().optional().or(z.literal("")),
  question3Yes: z.boolean().optional(),
  question3No: z.boolean().optional(),
  question4Yes: z.boolean().optional(),
  question4No: z.boolean().optional(),
  question5Yes: z.boolean().optional(),
  question5No: z.boolean().optional(),

  // --- Part 4: Security Questions ---
  q6Yes: z.boolean().optional(),   q6No:  z.boolean().optional(),
  q7Yes: z.boolean().optional(),   q7No:  z.boolean().optional(),
  q8Yes: z.boolean().optional(),   q8No:  z.boolean().optional(),
  q9Yes: z.boolean().optional(),   q9No:  z.boolean().optional(),
  q10Yes: z.boolean().optional(), q10No: z.boolean().optional(),
  q11Yes: z.boolean().optional(), q11No: z.boolean().optional(),
  q12Yes: z.boolean().optional(), q12No: z.boolean().optional(),
  q13Yes: z.boolean().optional(), q13No: z.boolean().optional(),
  q14Yes: z.boolean().optional(), q14No: z.boolean().optional(),
  q15Yes: z.boolean().optional(), q15No: z.boolean().optional(),
  q16Yes: z.boolean().optional(), q16No: z.boolean().optional(),
  q17Yes: z.boolean().optional(), q17No: z.boolean().optional(),
  q18Yes: z.boolean().optional(), q18No: z.boolean().optional(),
  q19Yes: z.boolean().optional(), q19No: z.boolean().optional(),
  q20Yes: z.boolean().optional(), q20No: z.boolean().optional(),

  // --- Part 5: Contact & Signature ---
  daytimePhone: z.string()
    .min(1, "Daytime Phone is required / Telefone diurno é obrigatório")
    .regex(PHONE_REGEX, "Invalid phone format (555) 555-5555 / Formato de telefone inválido"),
  mobilePhone: z.string()
    .refine(val => !val || PHONE_REGEX.test(val), {
      message: "Invalid phone format (555) 555-5555 / Formato de telefone inválido"
    })
    .optional()
    .or(z.literal("")),
  email: z.string()
    .min(1, "Email is required / E-mail é obrigatório")
    .email("Invalid email / E-mail inválido")
    .max(60, "Email too long / E-mail longo demais"),
  signature: z.string()
    .max(50, "Signature too long / Assinatura longa demais")
    .optional()
    .or(z.literal("")),
  signatureDate: z.string()
    .optional()
    .or(z.literal("")),

  // --- Part 6 & 7: Interpreter & Preparer ---
  interpreterFamilyName: z.string().optional().or(z.literal("")),
  interpreterGivenName: z.string().optional().or(z.literal("")),
  interpreterPhone: z.string()
    .refine(val => !val || PHONE_REGEX.test(val), {
      message: "Invalid phone format / Formato de telefone inválido"
    })
    .optional()
    .or(z.literal("")),
  interpreterPhoneAlt: z.string()
    .refine(val => !val || PHONE_REGEX.test(val), {
      message: "Invalid phone format / Formato de telefone inválido"
    })
    .optional()
    .or(z.literal("")),
  interpreterEmail: z.string().optional().or(z.literal("")),
  interpreterLanguage: z.string().optional().or(z.literal("")),
  interpreterSignature: z.string().optional().or(z.literal("")),
  interpreterSignatureDate: z.string().optional().or(z.literal("")),
  preparerFamilyName: z.string().optional().or(z.literal("")),
  preparerGivenName: z.string().optional().or(z.literal("")),
  

  
  preparerPhone: z.string()
    .refine(val => !val || PHONE_REGEX.test(val), {
      message: "Invalid phone format / Formato de telefone inválido"
    })
    .optional()
    .or(z.literal("")),
  preparerFax: z.string().optional().or(z.literal("")),
  preparerEmail: z.string().optional().or(z.literal("")),
  preparerSignature: z.string().optional().or(z.literal("")),
  preparerSignatureDate: z.string().optional().or(z.literal("")),
  
  dependentsA: z.array(z.any()).optional(),

}).passthrough()
.superRefine((data, ctx) => {
  // 1. Conditional Middle Name: If hasMiddleName is true, middleName must not be empty
  if (data.hasMiddleName && (!data.middleName || data.middleName.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Middle Name is required / Nome do meio é obrigatório",
      path: ["middleName"]
    });
  }

  // 2. Conditional Change of Status: If applicationType is 'change', newStatus is required
  if (data.applicationType === "change") {
    if (!data.newStatusDropdown || data.newStatusDropdown.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New Status Requested is required / Novo status é obrigatório",
        path: ["newStatusDropdown"]
      });
    }
  }

  // 3. Conditional Physical Address: Only require if 'hasMailingAddress' is explicitly false
  if (data.hasMailingAddress === false) {
    if (!data.streetNameForeign || data.streetNameForeign.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required / Obrigatório", path: ["streetNameForeign"] });
    }
    if (!data.cityForeign || data.cityForeign.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required / Obrigatório", path: ["cityForeign"] });
    }
    if (!data.stateForeign) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required / Obrigatório", path: ["stateForeign"] });
    }
    if (!data.zipCodeForeign || data.zipCodeForeign.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required / Obrigatório", path: ["zipCodeForeign"] });
    }
  }

  // 4. Security Questions: Ensure one is selected (Yes or No)
  for (let i = 6; i <= 20; i++) {
    const yKey = `q${i}Yes` as keyof typeof data;
    const nKey = `q${i}No` as keyof typeof data;
    if (data[yKey] === false && data[nKey] === false) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selection required / Seleção obrigatória", path: [yKey] });
    }
  }

  // 5. Part 3 Questions (3, 4, 5): Ensure selection
  for (let i = 3; i <= 5; i++) {
    const yKey = `question${i}Yes` as keyof typeof data;
    const nKey = `question${i}No` as keyof typeof data;
    if (data[yKey] === false && data[nKey] === false) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selection required / Seleção obrigatória", path: [yKey] });
    }
  }

  // 6. Interpreter: Only require more details IF the name has more than 1 character (avoid accidental spaces)
  if (data.interpreterFamilyName && data.interpreterFamilyName.trim().length > 1) {
    if (!data.interpreterPhone) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required / Obrigatório", path: ["interpreterPhone"] });
    if (!data.interpreterLanguage) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required / Obrigatório", path: ["interpreterLanguage"] });
    if (!data.interpreterSignature) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required / Obrigatório", path: ["interpreterSignature"] });
  }

  // 7. Preparer: Only require signature/phone if the name is NOT the default organization "Aplikei"
  // If it IS Aplikei, we assume it's pre-filled and valid.
  if (data.preparerFamilyName && data.preparerFamilyName.trim() !== "" && data.preparerFamilyName !== "Aplikei") {
    if (!data.preparerPhone) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required / Obrigatório", path: ["preparerPhone"] });
    else if (!PHONE_REGEX.test(data.preparerPhone)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid format / Formato inválido", path: ["preparerPhone"] });
    if (!data.preparerSignature) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required / Obrigatório", path: ["preparerSignature"] });
  }

  // 8. Status Expiration: If not D/S, then statusExpirationDate is required
  if (!data.statusExpiresDS && (!data.statusExpirationDate || !DATE_REGEX.test(data.statusExpirationDate))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required / Obrigatório (MM/DD/YYYY)", path: ["statusExpirationDate"] });
  }
});

/**
 * Highly reusable type from schema
 */
export type I539FormInput = z.infer<typeof I539ValidationSchema>;

/**
 * Ready-to-use Form Validator using the existing zodValidate utility
 */
export const i539Validator = zodValidate(I539ValidationSchema);
