/** Dados necessários para preencher o formulário USCIS I-539 */
export interface I539FormData {
  // ── Part 1 ──
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
  hasSeparateMailingAddress?: boolean;
  alienNumber?: string;
  uscisOnlineAccountNumber?: string;
  dateOfBirth?: string;          // MM/DD/YYYY
  countryOfBirth?: string;
  countryOfCitizenship?: string;
  ssn?: string;
  dateOfLastArrival?: string;
  i94Number?: string;
  passportNumber?: string;
  passportCountry?: string;
  passportIssuingCountry?: string;
  passportExpirationDate?: string;
  currentImmigrationStatus?: string;
  statusExpirationDate?: string;
  statusExpiresDS?: boolean;

  // ── Part 2 ──
  applicationType?: "extend" | "change";
  includeSelf?: boolean;
  includeSpouse?: boolean;
  includeChildren?: boolean;
  totalCoApplicants?: string;
  requestedEffectiveDate?: string;
  newStatusRequested?: string;

  // ── Part 3 ──
  previouslyExtended?: boolean;
  previousExtensionDate?: string;

  // ── Part 4 — Yes/No questions ──
  q6Yes?: boolean;  q6No?: boolean;
  q7Yes?: boolean;  q7No?: boolean;
  q8Yes?: boolean;  q8No?: boolean;
  q9Yes?: boolean;  q9No?: boolean;
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

  // ── Part 5 ──
  daytimePhone?: string;
  mobilePhone?: string;
  email?: string;
  applicantSignature?: string;
  signatureDate?: string;
}
