import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown } from "pdf-lib";
import { I539FormData } from "@/domain/entities/I539FormData";

export interface FillI539FormDeps {
  /** URL pública do template descriptografado (Supabase Storage ou /public/) */
  templateUrl: string;
  /** Supabase Storage bucket onde o PDF preenchido será salvo */
  bucket: string;
  /** Função de upload: retorna o storagePath após fazer upload dos bytes */
  uploadBytes: (bucket: string, storagePath: string, bytes: Uint8Array) => Promise<void>;
}

export interface FillI539FormResult {
  /** Caminho no bucket (use para criar signed URL ou salvar no banco) */
  storagePath: string;
}

export async function fillI539Form(
  data: I539FormData,
  orderId: string,
  deps: FillI539FormDeps,
): Promise<FillI539FormResult> {
  // 1. Fetch template from Supabase Storage (runs in browser or Node)
  const response = await fetch(deps.templateUrl);
  if (!response.ok) throw new Error(`Failed to fetch I-539 template: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  const templateBytes = new Uint8Array(arrayBuffer);

  // 2. Fill form fields with pdf-lib (works in browser — no Node APIs used)
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  const tx = (name: string, value: string | undefined) => {
    if (!value) return;
    try { (form.getField(name) as PDFTextField).setText(value); } catch { /* field absent in this revision */ }
  };

  const btn = (name: string, checked: boolean | undefined) => {
    if (checked === undefined) return;
    try {
      const f = form.getField(name) as PDFCheckBox;
      checked ? f.check() : f.uncheck();
    } catch { /* skip */ }
  };

  const dd = (name: string, value: string | undefined) => {
    if (!value) return;
    try { (form.getField(name) as PDFDropdown).select(value); } catch { /* skip */ }
  };

  // ── Header (A-Number & USCIS account) ──
  tx("form1[0].#subform[0].Pt1Line2_AlienNumber[0]", data.alienNumber);
  tx("form1[0].#subform[0].Pt1Line2_USCISOnlineAcctNumber[0]", data.uscisOnlineAccountNumber);

  // ── Part 1 — Applicant ──
  tx("form1[0].#subform[0].P1Line1a_FamilyName[0]", data.familyName);
  tx("form1[0].#subform[0].P1_Line1b_GivenName[0]", data.givenName);
  tx("form1[0].#subform[0].P1_Line1c_MiddleName[0]", data.middleName);
  tx("form1[0].#subform[0].Part2_Item11_InCareOfName[0]", data.inCareOf);
  tx("form1[0].#subform[0].Part2_Item11_StreetName[0]", data.streetName);
  btn("form1[0].#subform[0].Part1_Item4_Unit[0]", data.aptUnit === "Apt");
  btn("form1[0].#subform[0].Part1_Item4_Unit[1]", data.aptUnit === "Ste");
  btn("form1[0].#subform[0].Part1_Item4_Unit[2]", data.aptUnit === "Flr");
  tx("form1[0].#subform[0].Part1_Item4_Number[0]", data.aptNumber);
  tx("form1[0].#subform[0].Part2_Item11_City[0]", data.city);
  dd("form1[0].#subform[0].Part2_Item11_State[0]", data.state);
  tx("form1[0].#subform[0].Part2_Item11_ZipCode[0]", data.zipCode);
  btn("form1[0].#subform[0].P1_checkbox5[0]", data.hasSeparateMailingAddress === true);
  btn("form1[0].#subform[0].P1_checkbox5[1]", data.hasSeparateMailingAddress === false);

  tx("form1[0].#subform[1].P1_Line8_DateOfBirth[0]", data.dateOfBirth);
  tx("form1[0].#subform[1].P1_Line7_CountryOfCitizenship[0]", data.countryOfCitizenship);
  tx("form1[0].#subform[1].P1_Line6_CountryOfBirth[0]", data.countryOfBirth);
  tx("form1[0].#subform[1].P1_Line9_SSN[0]", data.ssn);
  tx("form1[0].#subform[1].SupA_Line1i_DateOfArrival[0]", data.dateOfLastArrival);
  tx("form1[0].#subform[1].SupA_Line1j_ArrivalDeparture[0]", data.i94Number);
  tx("form1[0].#subform[1].SupA_Line1k_Passport[0]", data.passportNumber);
  tx("form1[0].#subform[1].SupA_Line1l_TravelDoc[0]", data.passportCountry);
  tx("form1[0].#subform[1].SupA_Line1m_CountryOfIssuance[0]", data.passportIssuingCountry);
  tx("form1[0].#subform[1].SupA_Line1n_ExpDate[0]", data.passportExpirationDate);
  dd("form1[0].#subform[1].Pt1Line15a_NewStatus[0]", data.currentImmigrationStatus);
  tx("form1[0].#subform[1].SupA_Line1p_DateExpires[0]", data.statusExpirationDate);
  btn("form1[0].#subform[1].P1_Checkbox12c[0]", data.statusExpiresDS);

  // ── Part 2 — Application Type ──
  btn("form1[0].#subform[1].P2_checkbox4[0]", data.applicationType === "extend");
  btn("form1[0].#subform[1].P2_checkbox4[1]", data.applicationType === "change");
  btn("form1[0].#subform[1].P2_checkbox[0]", data.includeSelf);
  btn("form1[0].#subform[1].P2_checkbox[1]", data.includeSpouse);
  btn("form1[0].#subform[1].P2_checkbox[2]", data.includeChildren);
  tx("form1[0].#subform[1].P2_Line5b_TotalNumber[0]", data.totalCoApplicants);
  tx("form1[0].#subform[1].Pt2Line2b_EffectiveDate[0]", data.requestedEffectiveDate);
  dd("form1[0].#subform[1].Pt2Line2a_NewStatus[0]", data.newStatusRequested);

  // ── Part 3 — Processing ──
  btn("form1[0].#subform[1].P3_checkbox2a[0]", data.previouslyExtended === true);
  btn("form1[0].#subform[1].P3_checkbox2a[1]", data.previouslyExtended === false);
  tx("form1[0].#subform[1].P3_Line1a_DateExtended[0]", data.previousExtensionDate);

  // ── Part 4 — Additional Info (Yes/No) ──
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

  // ── Part 5 — Applicant Statement ──
  tx("form1[0].#subform[4].P5_Line3_DaytimePhoneNumber[0]", data.daytimePhone);
  tx("form1[0].#subform[4].P5_Line4_MobilePhoneNumber[0]", data.mobilePhone);
  tx("form1[0].#subform[4].P5_Line5_EmailAddress[0]", data.email);
  tx("form1[0].#subform[4].P6_Line7_SignatureApplicant[0]", data.applicantSignature);
  tx("form1[0].#subform[4].P6_Line7_DateofSignature[0]", data.signatureDate);

  // ── Last page — name repeat ──
  tx("form1[0].#subform[6].P1Line1a_FamilyName[1]", data.familyName);
  tx("form1[0].#subform[6].P1_Line1b_GivenName[1]", data.givenName);
  tx("form1[0].#subform[6].P1_Line1c_MiddleName[1]", data.middleName);
  tx("form1[0].#subform[6].P8_Line2_ANumber[0].Pt1Line2_AlienNumber[1]", data.alienNumber);

  // 3. Serialize filled PDF
  const filledBytes = await pdfDoc.save();

  // 4. Upload — storagePath follows the app convention: {serviceId}/{fileName}
  const storagePath = `${orderId}/i539_oficial_${Date.now()}.pdf`;
  await deps.uploadBytes(deps.bucket, storagePath, filledBytes);

  return { storagePath };
}
