import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown } from "pdf-lib";

export interface G1145Data {
  lastName?: string;
  firstName?: string;
  middleName?: string;
  email?: string;
  mobilePhone?: string;
}

export interface G1450Data {
  // Applicant
  familyName?: string;
  givenName?: string;
  middleName?: string;
  dateOfBirth?: string; // MM/DD/YYYY
  alienNumber?: string;
  // Cardholder name (may differ from applicant)
  cardholderFamilyName?: string;
  cardholderGivenName?: string;
  cardholderMiddleName?: string;
  // Billing address
  streetAddress?: string;
  aptUnit?: "Apt" | "Ste" | "Flr";
  aptNumber?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  daytimePhone?: string;
  email?: string;
  // Card info
  /** "Visa" | "Mastercard" | "AmericanExpress" | "Discover" */
  cardType?: string;
  /** Full 16-digit number — will be split into 4 groups automatically */
  cardNumber?: string;
  expirationDate?: string; // MM/YYYY
  /** Typed name as signature */
  signature?: string;
  /** Amount to charge (e.g. "370.00") */
  paymentAmount?: string;
}

export interface FillFormsResult {
  g1145Path: string;
  g1450Path: string;
}

export interface FillG1145G1450Deps {
  g1145TemplateUrl: string;
  g1450TemplateUrl: string;
  bucket: string;
  uploadBytes: (bucket: string, storagePath: string, bytes: Uint8Array) => Promise<void>;
}

async function loadTemplate(url: string): Promise<PDFDocument> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch template: ${url} — ${res.statusText}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  return PDFDocument.load(bytes);
}

function tx(doc: PDFDocument, name: string, value: string | undefined) {
  if (!value) return;
  try { (doc.getForm().getField(name) as PDFTextField).setText(value); } catch { /* field absent */ }
}

function btn(doc: PDFDocument, name: string, checked: boolean | undefined) {
  if (checked === undefined) return;
  try {
    const f = doc.getForm().getField(name) as PDFCheckBox;
    checked ? f.check() : f.uncheck();
  } catch { /* skip */ }
}

function dd(doc: PDFDocument, name: string, value: string | undefined) {
  if (!value) return;
  try { (doc.getForm().getField(name) as PDFDropdown).select(value); } catch { /* skip */ }
}

export async function fillG1145(data: G1145Data, templateUrl: string): Promise<Uint8Array> {
  const doc = await loadTemplate(templateUrl);

  tx(doc, "form1[0].#subform[0].LastName[0]",          data.lastName);
  tx(doc, "form1[0].#subform[0].FirstName[0]",         data.firstName);
  tx(doc, "form1[0].#subform[0].MiddleName[0]",        data.middleName);
  tx(doc, "form1[0].#subform[0].Email[0]",             data.email);
  tx(doc, "form1[0].#subform[0].MobilePhoneNumber[0]", data.mobilePhone);

  return doc.save();
}

/** Maps card type string to checkbox index: 0=Visa, 1=Mastercard, 2=AmEx, 3=Discover */
const CARD_TYPE_INDEX: Record<string, number> = {
  Visa: 0,
  Mastercard: 1,
  "American Express": 2,
  Discover: 3,
};

export async function fillG1450(data: G1450Data, templateUrl: string): Promise<Uint8Array> {
  const doc = await loadTemplate(templateUrl);

  // Applicant
  tx(doc, "form1[0].#subform[0].FamilyName[0]",  data.familyName);
  tx(doc, "form1[0].#subform[0].GivenName[0]",   data.givenName);
  tx(doc, "form1[0].#subform[0].MiddleName[0]",  data.middleName);

  // Cardholder (defaults to applicant name if not provided separately)
  tx(doc, "form1[0].#subform[0].CCHolderFamilyName[0]", data.cardholderFamilyName ?? data.familyName);
  tx(doc, "form1[0].#subform[0].CCHolderGivenName[0]",  data.cardholderGivenName  ?? data.givenName);
  tx(doc, "form1[0].#subform[0].CCHolderMiddleName[0]", data.cardholderMiddleName ?? data.middleName);

  // Billing address
  tx(doc, "form1[0].#subform[0].Pt1Line2b_StreetNumberName[0]", data.streetAddress);
  btn(doc, "form1[0].#subform[0].CCHolderAptSteFlr_Unit[0]", data.aptUnit === "Apt");
  btn(doc, "form1[0].#subform[0].CCHolderAptSteFlr_Unit[1]", data.aptUnit === "Ste");
  btn(doc, "form1[0].#subform[0].CCHolderAptSteFlr_Unit[2]", data.aptUnit === "Flr");
  tx(doc, "form1[0].#subform[0].CCHolderAptSteFlrNumber[0]", data.aptNumber);
  tx(doc, "form1[0].#subform[0].CityOrTown[0]",              data.city);
  dd(doc, "form1[0].#subform[0].State[0]",                   data.state);
  tx(doc, "form1[0].#subform[0].ZipCode[0]",                 data.zipCode);
  tx(doc, "form1[0].#subform[0].DaytimeTelephoneNumber[0]",  data.daytimePhone);
  tx(doc, "form1[0].#subform[0].Email[0]",                   data.email);

  // Card type checkboxes
  if (data.cardType !== undefined) {
    const idx = CARD_TYPE_INDEX[data.cardType] ?? -1;
    for (let i = 0; i <= 3; i++) {
      btn(doc, `form1[0].#subform[0].CreditCardTypeChBx[${i}]`, i === idx);
    }
  }

  // Card number — split 16 digits into 4 groups of 4
  if (data.cardNumber) {
    const digits = data.cardNumber.replace(/\D/g, "");
    tx(doc, "form1[0].#subform[0].CreditCardNumber_1[0]", digits.slice(0, 4));
    tx(doc, "form1[0].#subform[0].CreditCardNumber_2[0]", digits.slice(4, 8));
    tx(doc, "form1[0].#subform[0].CreditCardNumber_3[0]", digits.slice(8, 12));
    tx(doc, "form1[0].#subform[0].CreditCardNumber_4[0]", digits.slice(12, 16));
  }

  tx(doc, "form1[0].#subform[0].ExpirationDate[0]",        data.expirationDate);
  tx(doc, "form1[0].#subform[0].SignatureOfApplicant[0]",  data.signature);
  tx(doc, "form1[0].#subform[0].AuthorizedPaymentAmt[0]",  data.paymentAmount);

  return doc.save();
}

export async function fillG1145G1450Forms(
  g1145Data: G1145Data,
  g1450Data: G1450Data,
  serviceId: string,
  deps: FillG1145G1450Deps,
): Promise<FillFormsResult> {
  const [g1145Bytes, g1450Bytes] = await Promise.all([
    fillG1145(g1145Data, deps.g1145TemplateUrl),
    fillG1450(g1450Data, deps.g1450TemplateUrl),
  ]);

  const ts = Date.now();
  const g1145Path = `${serviceId}/g1145_oficial_${ts}.pdf`;
  const g1450Path = `${serviceId}/g1450_oficial_${ts}.pdf`;

  await Promise.all([
    deps.uploadBytes(deps.bucket, g1145Path, g1145Bytes),
    deps.uploadBytes(deps.bucket, g1450Path, g1450Bytes),
  ]);

  return { g1145Path, g1450Path };
}
