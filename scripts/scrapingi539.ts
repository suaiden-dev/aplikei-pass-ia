/**
 * I-539 PDF Form Scraper, Filler & Supabase Uploader
 *
 * Commands:
 *   npx ts-node --esm scripts/scrapingi539.ts list          — List all form fields
 *   npx ts-node --esm scripts/scrapingi539.ts fill-sample   — Fill with sample data
 *
 * Exported functions (for use inside the app):
 *   fillI539Form(data)        → Uint8Array (filled PDF bytes)
 *   saveToSupabase(bytes, id) → string (public URL)
 */

import { PDFDocument } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as child_process from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FORM_URL = "https://www.uscis.gov/sites/default/files/document/forms/i-539.pdf";
const CACHE_PATH = path.join(__dirname, "i539_original.pdf");
/** Decrypted version — required for pdf-lib to write form fields */
const DECRYPTED_PATH = path.join(__dirname, "i539_decrypted.pdf");
/** qpdf binary installed by winget */
const QPDF_BIN = "C:\\Program Files\\qpdf 12.3.2\\bin\\qpdf.exe";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawField {
  name: string;
  type: "Tx" | "Btn" | "Ch";
  value: string | string[] | boolean;
  options?: string[];
  page: number;
}

export interface I539Data {
  // ── Part 1 — Information About You ──
  familyName?: string;
  givenName?: string;
  middleName?: string;
  inCareOf?: string;
  streetName?: string;
  aptSteFlrUnit?: "Apt" | "Ste" | "Flr"; // checkbox group
  aptSteFlrNumber?: string;
  city?: string;
  state?: string; // 2-letter
  zipCode?: string;
  /** For overseas/foreign mailing address */
  streetNameForeign?: string;
  aptSteFlrForeignUnit?: "Apt" | "Ste" | "Flr";
  aptSteFlrForeignNumber?: string;
  cityForeign?: string;
  stateForeign?: string;
  zipCodeForeign?: string;
  hasMailingAddress?: boolean; // P1_checkbox5
  alienNumber?: string; // A-Number (top of form and Part 1)
  uscisOnlineAccountNumber?: string;
  dateOfBirth?: string; // MM/DD/YYYY
  countryOfCitizenship?: string;
  countryOfBirth?: string;
  ssn?: string;
  /** Date of last arrival in US */
  dateOfArrival?: string;
  /** I-94 Arrival/Departure Record number */
  i94Number?: string;
  passportNumber?: string;
  travelDocCountry?: string;
  countryOfIssuance?: string;
  passportExpirationDate?: string;
  /** Current nonimmigrant status (dropdown) */
  currentStatus?: string;
  statusExpirationDate?: string;
  statusExpiresDS?: boolean; // "D/S" checkbox

  // ── Part 2 — Application Type ──
  /** extend (P2_checkbox4[0]) or change (P2_checkbox4[1]) */
  applicationType?: "extend" | "change";
  /** For extension: which co-applicants (checkboxes) */
  extendSelf?: boolean;
  extendSpouse?: boolean;
  extendChildren?: boolean;
  numberOfCoApplicants?: string;
  newStatusDropdown?: string; // Pt2Line2a_NewStatus — dropdown
  effectiveDate?: string;
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
  /** Country where docs should be sent */
  docCountry1?: string;
  docCountry2?: string;
  /** Address where docs sent (foreign) */
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
  /** Applicant signature (typed name) */
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

// ─── Download PDF ─────────────────────────────────────────────────────────────

function downloadPDF(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath)) {
      console.log("✓ PDF cached at", destPath);
      resolve();
      return;
    }
    console.log("⬇ Downloading I-539 PDF...");
    const file = fs.createWriteStream(destPath);

    function get(u: string) {
      https.get(u, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          get(res.headers.location!);
          return;
        }
        res.pipe(file);
        file.on("finish", () => { file.close(); resolve(); });
      }).on("error", (err) => { fs.unlink(destPath, () => undefined); reject(err); });
    }
    get(url);
  });
}

// ─── Decrypt PDF (qpdf) ───────────────────────────────────────────────────────

function decryptPDF(srcPath: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath)) {
      console.log("✓ Decrypted PDF cached at", destPath);
      resolve();
      return;
    }
    console.log("🔓 Decrypting PDF with qpdf...");
    child_process.execFile(
      QPDF_BIN,
      ["--decrypt", srcPath, destPath],
      (err) => {
        if (err) reject(new Error(`qpdf failed: ${err.message}`));
        else { console.log("✓ Decrypted →", destPath); resolve(); }
      },
    );
  });
}

// ─── List all fields (discovery) ─────────────────────────────────────────────

export async function listFormFields(pdfBytes?: Uint8Array): Promise<RawField[]> {
  // pdfjs-dist is better for reading encrypted USCIS PDFs
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs" as string);
  const data = pdfBytes ?? new Uint8Array(fs.readFileSync(CACHE_PATH));
  const doc = await (getDocument as Function)({ data, useSystemFonts: true }).promise;

  const fields: RawField[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const annotations = await page.getAnnotations();
    for (const ann of annotations) {
      if (ann.subtype === "Widget" && ann.fieldName) {
        fields.push({
          name: ann.fieldName,
          type: ann.fieldType as "Tx" | "Btn" | "Ch",
          value: ann.fieldValue,
          options: ann.options,
          page: i,
        });
      }
    }
  }
  return fields;
}

// ─── Fill form ────────────────────────────────────────────────────────────────

export async function fillI539Form(data: I539Data, pdfBytes?: Uint8Array): Promise<Uint8Array> {
  const bytes = pdfBytes ?? new Uint8Array(fs.readFileSync(DECRYPTED_PATH));
  const pdfDoc = await PDFDocument.load(bytes);
  const form = pdfDoc.getForm();

  // Helper: set text field (silently skips if field not found)
  const tx = (name: string, value: string | undefined) => {
    if (!value) return;
    try { form.getTextField(name).setText(value); } catch { /* field not in this version */ }
  };

  // Helper: check/uncheck a checkbox
  const btn = (name: string, checked: boolean | undefined) => {
    if (checked === undefined) return;
    try {
      const f = form.getCheckBox(name);
      checked ? f.check() : f.uncheck();
    } catch { /* skip */ }
  };

  // Helper: set dropdown
  const dropdown = (name: string, value: string | undefined) => {
    if (!value) return;
    try { form.getDropdown(name).select(value); } catch { /* skip */ }
  };

  // ── Attorney / Preparer header ──
  tx("form1[0].#subform[0].Pt1Line2_AlienNumber[0]", data.alienNumber);
  tx("form1[0].#subform[0].Pt1Line2_USCISOnlineAcctNumber[0]", data.uscisOnlineAccountNumber);
  tx("form1[0].#subform[0].AttorneyStateBarNumber[0]", undefined); // leave blank unless attorney
  tx("form1[0].#subform[0].USCISOnlineAcctNumber[0]", data.uscisOnlineAccountNumber);

  // ── Part 1 — Applicant Info ──
  tx("form1[0].#subform[0].P1Line1a_FamilyName[0]", data.familyName);
  tx("form1[0].#subform[0].P1_Line1b_GivenName[0]", data.givenName);
  tx("form1[0].#subform[0].P1_Line1c_MiddleName[0]", data.middleName);
  tx("form1[0].#subform[0].Part2_Item11_InCareOfName[0]", data.inCareOf);
  // Mailing address (item 4)
  tx("form1[0].#subform[0].Part2_Item11_StreetName[0]", data.streetName);
  btn("form1[0].#subform[0].Part1_Item4_Unit[0]", data.aptSteFlrUnit === "Apt");
  btn("form1[0].#subform[0].Part1_Item4_Unit[1]", data.aptSteFlrUnit === "Ste");
  btn("form1[0].#subform[0].Part1_Item4_Unit[2]", data.aptSteFlrUnit === "Flr");
  tx("form1[0].#subform[0].Part1_Item4_Number[0]", data.aptSteFlrNumber);
  tx("form1[0].#subform[0].Part2_Item11_City[0]", data.city);
  dropdown("form1[0].#subform[0].Part2_Item11_State[0]", data.state);
  tx("form1[0].#subform[0].Part2_Item11_ZipCode[0]", data.zipCode);
  // Physical address (item 6 — if different)
  tx("form1[0].#subform[0].Part1_Item6_StreetName[0]", data.streetNameForeign);
  btn("form1[0].#subform[0].Part1_Item6_Unit[0]", data.aptSteFlrForeignUnit === "Apt");
  btn("form1[0].#subform[0].Part1_Item6_Unit[1]", data.aptSteFlrForeignUnit === "Ste");
  btn("form1[0].#subform[0].Part1_Item6_Unit[2]", data.aptSteFlrForeignUnit === "Flr");
  tx("form1[0].#subform[0].Part1_Item6_Number[0]", data.aptSteFlrForeignNumber);
  tx("form1[0].#subform[0].Part1_Item6_City[0]", data.cityForeign);
  dropdown("form1[0].#subform[0].Part1_Item6_State[0]", data.stateForeign);
  tx("form1[0].#subform[0].Part1_Item6_ZipCode[0]", data.zipCodeForeign);
  // Same mailing? checkboxes (yes/no)
  btn("form1[0].#subform[0].P1_checkbox5[0]", data.hasMailingAddress === true);
  btn("form1[0].#subform[0].P1_checkbox5[1]", data.hasMailingAddress === false);

  // Page 2
  tx("form1[0].#subform[1].P1_Line8_DateOfBirth[0]", data.dateOfBirth);
  tx("form1[0].#subform[1].P1_Line7_CountryOfCitizenship[0]", data.countryOfCitizenship);
  tx("form1[0].#subform[1].P1_Line6_CountryOfBirth[0]", data.countryOfBirth);
  tx("form1[0].#subform[1].P1_Line9_SSN[0]", data.ssn);
  tx("form1[0].#subform[1].SupA_Line1i_DateOfArrival[0]", data.dateOfArrival);
  tx("form1[0].#subform[1].SupA_Line1j_ArrivalDeparture[0]", data.i94Number);
  tx("form1[0].#subform[1].SupA_Line1k_Passport[0]", data.passportNumber);
  tx("form1[0].#subform[1].SupA_Line1l_TravelDoc[0]", data.travelDocCountry);
  tx("form1[0].#subform[1].SupA_Line1m_CountryOfIssuance[0]", data.countryOfIssuance);
  tx("form1[0].#subform[1].SupA_Line1n_ExpDate[0]", data.passportExpirationDate);
  dropdown("form1[0].#subform[1].Pt1Line15a_NewStatus[0]", data.currentStatus);
  tx("form1[0].#subform[1].SupA_Line1p_DateExpires[0]", data.statusExpirationDate);
  btn("form1[0].#subform[1].P1_Checkbox12c[0]", data.statusExpiresDS);

  // ── Part 2 — Application Type ──
  btn("form1[0].#subform[1].P2_checkbox4[0]", data.applicationType === "extend");
  btn("form1[0].#subform[1].P2_checkbox4[1]", data.applicationType === "change");
  btn("form1[0].#subform[1].P2_checkbox[0]", data.extendSelf);
  btn("form1[0].#subform[1].P2_checkbox[1]", data.extendSpouse);
  btn("form1[0].#subform[1].P2_checkbox[2]", data.extendChildren);
  tx("form1[0].#subform[1].P2_Line5b_TotalNumber[0]", data.numberOfCoApplicants);
  tx("form1[0].#subform[1].Pt2Line2b_EffectiveDate[0]", data.effectiveDate);
  // Co-applicant passport numbers
  tx("form1[0].#subform[1].SupA_Line1k_Passport[1]", undefined);
  tx("form1[0].#subform[1].SupA_Line1k_Passport[2]", undefined);
  dropdown("form1[0].#subform[1].Pt2Line2a_NewStatus[0]", data.newStatusDropdown);

  // ── Part 3 — Processing Information ──
  btn("form1[0].#subform[1].P3_checkbox2a[0]", data.priorExtensionYes);
  btn("form1[0].#subform[1].P3_checkbox2a[1]", data.priorExtensionNo);
  tx("form1[0].#subform[1].P3_Line1a_DateExtended[0]", data.priorExtensionDate);

  // Page 3
  tx("form1[0].#subform[2].P3_Line5_ReceiptNumber[0]", data.receiptNumber);
  tx("form1[0].#subform[2].P3_Line4_NameofPetitioner[0]", data.petitionerName);
  btn("form1[0].#subform[2].P3_checkbox1[0]", data.petitionType_I130);
  btn("form1[0].#subform[2].P3_checkbox1[1]", data.petitionType_I140);
  btn("form1[0].#subform[2].P3_checkbox1[2]", data.petitionType_I360);
  tx("form1[0].#subform[2].P3_Line5_DateFiled[0]", data.petitionFiledDate);
  btn("form1[0].#subform[2].P3_checkbox4[0]", data.question3No);
  btn("form1[0].#subform[2].P3_checkbox4[1]", data.question3Yes);
  tx("form1[0].#subform[2].P4_Line1b_ExpirationDate[0]", undefined);
  tx("form1[0].#subform[2].P4_Line1a_CountryOfIssuance[0]", data.docCountry1);
  tx("form1[0].#subform[2].P4_Line1a_CountryOfIssuance[1]", data.docCountry2);
  // Foreign mailing address for documents
  tx("form1[0].#subform[2].P2_Line10_StreetName[0]", data.docStreet);
  btn("form1[0].#subform[2].P2_Line10_Unit[0]", data.docUnit0);
  btn("form1[0].#subform[2].P2_Line10_Unit[1]", data.docUnit1);
  btn("form1[0].#subform[2].P2_Line10_Unit[2]", data.docUnit2);
  tx("form1[0].#subform[2].P2_Line10_Number[0]", data.docUnitNumber);
  tx("form1[0].#subform[2].P2_Line10_City[0]", data.docCity);
  tx("form1[0].#subform[2].P2_Line10_Province[0]", data.docProvince);
  tx("form1[0].#subform[2].P2_Line10_PostalCode[0]", data.docPostalCode);
  tx("form1[0].#subform[2].P2_Line10_Country[0]", data.docCountry);
  btn("form1[0].#subform[2].P4_checkbox3_No[0]", data.question3No);
  btn("form1[0].#subform[2].P4_checkbox3_Yes[0]", data.question3Yes);
  btn("form1[0].#subform[2].P4_checkbox5_No[0]", data.question5No);
  btn("form1[0].#subform[2].P4_checkbox5_Yes[0]", data.question5Yes);
  btn("form1[0].#subform[2].P4_checkbox4_Yes[0]", data.question4Yes);
  btn("form1[0].#subform[2].P4_checkbox4_No[0]", data.question4No);
  tx("form1[0].#subform[2].P3_Line4_NameofPetitioner[1]", data.petitionerName);

  // ── Part 4 — Additional Questions (page 4) ──
  btn("form1[0].#subform[3].P4_checkbox6_Yes[0]", data.q6Yes);
  btn("form1[0].#subform[3].P4_checkbox6_No[0]", data.q6No);
  btn("form1[0].#subform[3].P4_checkbox7_Yes[0]", data.q7Yes);
  btn("form1[0].#subform[3].P4_checkbox7_No[0]", data.q7No);
  btn("form1[0].#subform[3].P4_checkbox8_Yes[0]", data.q8Yes);
  btn("form1[0].#subform[3].P4_checkbox8_No[0]", data.q8No);
  btn("form1[0].#subform[3].P4_checkbox9_Yes[0]", data.q9Yes);
  btn("form1[0].#subform[3].P4_checkbox9_No[0]", data.q9No);
  btn("form1[0].#subform[3].P4_checkbox10_Yes[0]", data.q10Yes);
  btn("form1[0].#subform[3].P4_checkbox10_No[0]", data.q10No);
  btn("form1[0].#subform[3].P4_checkbox11_Yes[0]", data.q11Yes);
  btn("form1[0].#subform[3].P4_checkbox11_No[0]", data.q11No);
  btn("form1[0].#subform[3].P4_checkbox12_Yes[0]", data.q12Yes);
  btn("form1[0].#subform[3].P4_checkbox12_No[0]", data.q12No);
  btn("form1[0].#subform[3].P4_checkbox13_Yes[0]", data.q13Yes);
  btn("form1[0].#subform[3].P4_checkbox13_No[0]", data.q13No);
  btn("form1[0].#subform[3].P4_checkbox14_Yes[0]", data.q14Yes);
  btn("form1[0].#subform[3].P4_checkbox14_No[0]", data.q14No);
  btn("form1[0].#subform[3].P4_checkbox15_Yes[0]", data.q15Yes);
  btn("form1[0].#subform[3].P4_checkbox15_No[0]", data.q15No);
  btn("form1[0].#subform[3].P4_checkbox16_Yes[0]", data.q16Yes);
  btn("form1[0].#subform[3].P4_checkbox16_No[0]", data.q16No);
  btn("form1[0].#subform[3].P4_checkbox17_Yes[0]", data.q17Yes);
  btn("form1[0].#subform[3].P4_checkbox17_No[0]", data.q17No);
  btn("form1[0].#subform[3].P4_checkbox18_Yes[0]", data.q18Yes);
  btn("form1[0].#subform[3].P4_checkbox18_No[0]", data.q18No);
  btn("form1[0].#subform[3].P4_checkbox19_Yes[0]", data.q19Yes);
  btn("form1[0].#subform[3].P4_checkbox19_No[0]", data.q19No);
  btn("form1[0].#subform[3].P4_checkbox20_Yes[0]", data.q20Yes);
  btn("form1[0].#subform[3].P4_checkbox20_No[0]", data.q20No);

  // ── Part 5 — Applicant Statement (page 5) ──
  tx("form1[0].#subform[4].P5_Line3_DaytimePhoneNumber[0]", data.daytimePhone);
  tx("form1[0].#subform[4].P5_Line4_MobilePhoneNumber[0]", data.mobilePhone);
  tx("form1[0].#subform[4].P5_Line5_EmailAddress[0]", data.email);
  tx("form1[0].#subform[4].P6_Line7_SignatureApplicant[0]", data.signature);
  tx("form1[0].#subform[4].P6_Line7_DateofSignature[0]", data.signatureDate);

  // ── Part 6 — Interpreter ──
  tx("form1[0].#subform[4].P7_Line1_PreparerFamilyName[0]", data.interpreterFamilyName);
  tx("form1[0].#subform[4].P7_Line1_PreparerGivenName[0]", data.interpreterGivenName);
  tx("form1[0].#subform[4].P6_Line4_DaytimePhoneNumber[0]", data.interpreterPhone);
  tx("form1[0].#subform[4].P6_Line4_DaytimePhoneNumber[1]", data.interpreterPhoneAlt);
  tx("form1[0].#subform[4].P6_Line5_EmailAddress[0]", data.interpreterEmail);
  tx("form1[0].#subform[4].P7_Line6_Language[0]", data.interpreterLanguage);
  tx("form1[0].#subform[4].P6_Line7_SignatureApplicant[1]", data.interpreterSignature);
  tx("form1[0].#subform[4].P6_Line7_DateofSignature[1]", data.interpreterSignatureDate);

  // ── Part 7 — Preparer ──
  tx("form1[0].#subform[5].P7_Line1a_PreparerFamilyName[0]", data.preparerFamilyName);
  tx("form1[0].#subform[5].P7_Line1b_PreparerGivenName[0]", data.preparerGivenName);
  tx("form1[0].#subform[5].P7_Line2_BusinessName[0]", data.preparerBusiness);
  tx("form1[0].#subform[5].P7_Line4_PreparerDaytimePhoneNumber[0]", data.preparerPhone);
  tx("form1[0].#subform[5].P7_Line5_FaxPhoneNumber[0]", data.preparerFax);
  tx("form1[0].#subform[5].P7_Line6_EmailAddress[0]", data.preparerEmail);
  tx("form1[0].#subform[5].P7_Line8a_SignatureofPreparer[0]", data.preparerSignature);
  tx("form1[0].#subform[5].P7_Line8b_DateofSignature[0]", data.preparerSignatureDate);

  // ── Part 8 — Additional Information (name repeat on last page) ──
  tx("form1[0].#subform[6].P1Line1a_FamilyName[1]", data.familyName);
  tx("form1[0].#subform[6].P1_Line1b_GivenName[1]", data.givenName);
  tx("form1[0].#subform[6].P1_Line1c_MiddleName[1]", data.middleName);
  tx("form1[0].#subform[6].P8_Line2_ANumber[0].Pt1Line2_AlienNumber[1]", data.alienNumber);

  return pdfDoc.save();
}

// ─── Upload to Supabase Storage ───────────────────────────────────────────────

export async function saveToSupabase(
  filledPdfBytes: Uint8Array,
  orderId: string,
  supabaseUrl: string,
  supabaseKey: string,
): Promise<string> {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  const fileName = `i539_${orderId}_${Date.now()}.pdf`;
  const storagePath = `forms/i539/${fileName}`;

  const { error } = await supabase.storage
    .from("documents")
    .upload(storagePath, filledPdfBytes, { contentType: "application/pdf", upsert: true });

  if (error) throw new Error(`Supabase upload error: ${error.message}`);

  const { data } = supabase.storage.from("documents").getPublicUrl(storagePath);
  return data.publicUrl;
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

async function main() {
  const command = process.argv[2] ?? "list";
  await downloadPDF(FORM_URL, CACHE_PATH);
  await decryptPDF(CACHE_PATH, DECRYPTED_PATH);

  if (command === "list") {
    const fields = await listFormFields();
    console.log("\n=== I-539 Form Fields ===\n");
    for (const f of fields) {
      const opts = f.options?.length ? ` [${f.options.join(" | ")}]` : "";
      console.log(`[${f.type}] p${f.page} — ${f.name}${opts}`);
    }
    console.log(`\nTotal: ${fields.length} fields`);
    fs.writeFileSync(path.join(__dirname, "i539_fields.json"), JSON.stringify(fields, null, 2));
    console.log("Saved → scripts/i539_fields.json");
    return;
  }

  if (command === "fill-sample") {
    const sample: I539Data = {
      familyName: "Silva",
      givenName: "João",
      middleName: "Carlos",
      streetName: "123 Brickell Ave",
      aptSteFlrUnit: "Apt",
      aptSteFlrNumber: "4B",
      city: "Miami",
      state: "FL",
      zipCode: "33101",
      hasMailingAddress: false,
      dateOfBirth: "01/15/1990",
      countryOfBirth: "Brazil",
      countryOfCitizenship: "Brazil",
      dateOfArrival: "06/01/2025",
      passportNumber: "AB123456",
      travelDocCountry: "Brazil",
      passportExpirationDate: "12/31/2030",
      currentStatus: "B-2",
      statusExpirationDate: "12/31/2026",
      applicationType: "extend",
      extendSelf: true,
      daytimePhone: "3055551234",
      email: "joao.silva@email.com",
      signature: "João Carlos Silva",
      signatureDate: new Date().toLocaleDateString("en-US"),
      // All Part 4 questions answered "No"
      q6No: true, q7No: true, q8No: true, q9No: true, q10No: true,
      q11No: true, q12No: true, q13No: true, q14No: true, q15No: true,
      q16No: true, q17No: true, q18No: true, q19No: true, q20No: true,
    };

    const filled = await fillI539Form(sample);
    const out = path.join(__dirname, "i539_filled_sample.pdf");
    fs.writeFileSync(out, filled);
    console.log(`✓ Filled PDF → ${out}`);
    return;
  }

  console.log("Usage:\n  list          — list all fields\n  fill-sample   — fill with sample data");
}

main().catch(console.error);
