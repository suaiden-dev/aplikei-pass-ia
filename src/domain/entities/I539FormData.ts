/** Dados necessários para preencher o formulário USCIS I-539 */
export interface I539FormData {
  // ── Part 1 — Information About You ──
  familyName?: string;
  givenName?: string;
  middleName?: string;
  inCareOf?: string;
  streetName?: string;
  aptUnit?: "Apt" | "Ste" | "Flr";
  aptNumber?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  /** For overseas/foreign physical address */
  streetNameForeign?: string;
  aptUnitForeign?: "Apt" | "Ste" | "Flr";
  aptNumberForeign?: string;
  cityForeign?: string;
  stateForeign?: string;
  zipCodeForeign?: string;
  hasMailingAddress?: boolean;
  alienNumber?: string;
  uscisOnlineAccountNumber?: string;
  dateOfBirth?: string;
  countryOfCitizenship?: string;
  countryOfBirth?: string;
  ssn?: string;
  dateOfLastArrival?: string;
  i94Number?: string;
  passportNumber?: string;
  travelDocCountry?: string;
  countryOfIssuance?: string;
  passportExpirationDate?: string;
  currentImmigrationStatus?: string;
  statusExpirationDate?: string;
  statusExpiresDS?: boolean;

  // ── Part 2 — Application Type ──
  applicationType?: "extend" | "change";
  extendSelf?: boolean;
  extendSpouse?: boolean;
  extendChildren?: boolean;
  numberOfCoApplicants?: string;
  newStatusRequested?: string;
  requestedEffectiveDate?: string;
  priorExtensionDate?: string;

  // ── Part 3 — Processing Information ──
  priorExtensionYes?: boolean;
  priorExtensionNo?: boolean;
  petitionType_I130?: boolean;
  petitionType_I140?: boolean;
  petitionType_I360?: boolean;
  petitionerName?: string;
  petitionFiledDate?: string;
  receiptNumber?: string;
  docCountry1?: string;
  docCountry2?: string;
  docStreet?: string;
  docUnit0?: boolean; // Apt
  docUnit1?: boolean; // Ste
  docUnit2?: boolean; // Flr
  docUnitNumber?: string;
  docCity?: string;
  docProvince?: string;
  docPostalCode?: string;
  docCountry?: string;
  question3No?: boolean;
  question3Yes?: boolean;
  question4Yes?: boolean;
  question4No?: boolean;
  question5No?: boolean;
  question5Yes?: boolean;

  // ── Part 4 — Additional Information (Yes/No questions) ──
  q6Yes?: boolean; q6No?: boolean;
  q7Yes?: boolean; q7No?: boolean;
  q8Yes?: boolean; q8No?: boolean;
  q9Yes?: boolean; q9No?: boolean;
  q10Yes?: boolean; q10No?: boolean;
  q11Yes?: boolean; q11No?: boolean;
  q12Yes?: boolean; q12No?: boolean;
  q13Yes?: boolean; q13No?: boolean;
  q14Yes?: boolean; q14No?: boolean;
  q15Yes?: boolean; q15No?: boolean;
  q16Yes?: boolean; q16No?: boolean;
  q17Yes?: boolean; q17No?: boolean;
  q18Yes?: boolean; q18No?: boolean;
  q19Yes?: boolean; q19No?: boolean;
  q20Yes?: boolean; q20No?: boolean;

  // ── Part 5 — Applicant Statement ──
  daytimePhone?: string;
  mobilePhone?: string;
  email?: string;
  signature?: string;
  signatureDate?: string;

  // ── Part 6 — Interpreter ──
  interpreterFamilyName?: string;
  interpreterGivenName?: string;
  interpreterPhone?: string;
  interpreterPhoneAlt?: string;
  interpreterEmail?: string;
  interpreterLanguage?: string;
  interpreterSignature?: string;
  interpreterSignatureDate?: string;

  // ── Part 7 — Preparer ──
  preparerFamilyName?: string;
  preparerGivenName?: string;
  preparerBusiness?: string;
  preparerPhone?: string;
  preparerFax?: string;
  preparerEmail?: string;
  preparerSignature?: string;
  preparerSignatureDate?: string;
}
