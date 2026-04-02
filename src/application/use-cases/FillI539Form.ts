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
  tx("form1[0].#subform[0].AttorneyStateBarNumber[0]", undefined); // leave blank unless attorney
  tx("form1[0].#subform[0].USCISOnlineAcctNumber[0]", data.uscisOnlineAccountNumber);

  // ── Part 1 — Applicant Info ──
  tx("form1[0].#subform[0].P1Line1a_FamilyName[0]", data.familyName);
  tx("form1[0].#subform[0].P1_Line1b_GivenName[0]", data.givenName);
  tx("form1[0].#subform[0].P1_Line1c_MiddleName[0]", data.middleName);
  tx("form1[0].#subform[0].Part2_Item11_InCareOfName[0]", data.inCareOf);
  // Mailing address
  tx("form1[0].#subform[0].Part2_Item11_StreetName[0]", data.streetName);
  btn("form1[0].#subform[0].Part1_Item4_Unit[0]", data.aptUnit === "Apt");
  btn("form1[0].#subform[0].Part1_Item4_Unit[1]", data.aptUnit === "Ste");
  btn("form1[0].#subform[0].Part1_Item4_Unit[2]", data.aptUnit === "Flr");
  tx("form1[0].#subform[0].Part1_Item4_Number[0]", data.aptNumber);
  tx("form1[0].#subform[0].Part2_Item11_City[0]", data.city);
  dd("form1[0].#subform[0].Part2_Item11_State[0]", data.state);
  tx("form1[0].#subform[0].Part2_Item11_ZipCode[0]", data.zipCode);
  // Physical address (if different)
  tx("form1[0].#subform[0].Part1_Item6_StreetName[0]", data.streetNameForeign);
  btn("form1[0].#subform[0].Part1_Item6_Unit[0]", data.aptUnitForeign === "Apt");
  btn("form1[0].#subform[0].Part1_Item6_Unit[1]", data.aptUnitForeign === "Ste");
  btn("form1[0].#subform[0].Part1_Item6_Unit[2]", data.aptUnitForeign === "Flr");
  tx("form1[0].#subform[0].Part1_Item6_Number[0]", data.aptNumberForeign);
  tx("form1[0].#subform[0].Part1_Item6_City[0]", data.cityForeign);
  dd("form1[0].#subform[0].Part1_Item6_State[0]", data.stateForeign);
  tx("form1[0].#subform[0].Part1_Item6_ZipCode[0]", data.zipCodeForeign);
  // Same mailing? checkboxes (yes/no)
  btn("form1[0].#subform[0].P1_checkbox5[0]", data.hasMailingAddress === true);
  btn("form1[0].#subform[0].P1_checkbox5[1]", data.hasMailingAddress === false);

  // Page 2
  tx("form1[0].#subform[1].P1_Line8_DateOfBirth[0]", data.dateOfBirth);
  tx("form1[0].#subform[1].P1_Line7_CountryOfCitizenship[0]", data.countryOfCitizenship);
  tx("form1[0].#subform[1].P1_Line6_CountryOfBirth[0]", data.countryOfBirth);
  tx("form1[0].#subform[1].P1_Line9_SSN[0]", data.ssn);
  tx("form1[0].#subform[1].SupA_Line1i_DateOfArrival[0]", data.dateOfLastArrival);
  tx("form1[0].#subform[1].SupA_Line1j_ArrivalDeparture[0]", data.i94Number);
  tx("form1[0].#subform[1].SupA_Line1k_Passport[0]", data.passportNumber);
  tx("form1[0].#subform[1].SupA_Line1l_TravelDoc[0]", data.travelDocCountry);
  tx("form1[0].#subform[1].SupA_Line1m_CountryOfIssuance[0]", data.countryOfIssuance);
  tx("form1[0].#subform[1].SupA_Line1n_ExpDate[0]", data.passportExpirationDate);
  dd("form1[0].#subform[1].Pt1Line15a_NewStatus[0]", data.currentImmigrationStatus);
  tx("form1[0].#subform[1].SupA_Line1p_DateExpires[0]", data.statusExpirationDate);
  btn("form1[0].#subform[1].P1_Checkbox12c[0]", data.statusExpiresDS);

  // ── Part 2 — Application Type ──
  btn("form1[0].#subform[1].P2_checkbox4[0]", data.applicationType === "extend");
  btn("form1[0].#subform[1].P2_checkbox4[1]", data.applicationType === "change");
  btn("form1[0].#subform[1].P2_checkbox[0]", data.extendSelf);
  btn("form1[0].#subform[1].P2_checkbox[1]", data.extendSpouse);
  btn("form1[0].#subform[1].P2_checkbox[2]", data.extendChildren);
  tx("form1[0].#subform[1].P2_Line5b_TotalNumber[0]", data.numberOfCoApplicants);
  tx("form1[0].#subform[1].Pt2Line2b_EffectiveDate[0]", data.requestedEffectiveDate);
  dd("form1[0].#subform[1].Pt2Line2a_NewStatus[0]", data.newStatusRequested);

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

  // ── Part 4 — Additional Information (Yes/No questions) ──
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
