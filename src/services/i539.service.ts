/**
 * Browser-compatible I-539 form filler.
 * Uses only pdf-lib (works in browser) — no Node.js dependencies.
 * Field names mirror src/scripts/scrapingi539.ts exactly.
 */
import { PDFDocument } from "pdf-lib";
import { supabase } from "../lib/supabase";
import i539PdfUrl from "../forms/i539_template.pdf?url";
import i539aPdfUrl from "../forms/i539a_template.pdf?url";

export type I539AData = {
  id?: string;
  familyName?: string; givenName?: string; middleName?: string;
  dateOfBirth?: string; countryOfBirth?: string; countryOfCitizenship?: string;
  alienNumber?: string; ssn?: string; uscisOnlineAccountNumber?: string;
  dateOfArrival?: string; i94Number?: string; passportNumber?: string;
  travelDocNumber?: string; countryOfIssuance?: string; passportExpirationDate?: string;
  currentStatus?: string; statusExpirationDate?: string;
  q1Yes?: boolean; q1No?: boolean; q2Yes?: boolean; q2No?: boolean;
  q3Yes?: boolean; q3No?: boolean; q4Yes?: boolean; q4No?: boolean;
  q5Yes?: boolean; q5No?: boolean; q6Yes?: boolean; q6No?: boolean;
  q7Yes?: boolean; q7No?: boolean; q8Yes?: boolean; q8No?: boolean;
  q9Yes?: boolean; q9No?: boolean; q10Yes?: boolean; q10No?: boolean;
  q11Yes?: boolean; q11No?: boolean; q12Yes?: boolean; q12No?: boolean;
  q13Yes?: boolean; q13No?: boolean; q14Yes?: boolean; q14No?: boolean;
  q15Yes?: boolean; q15No?: boolean;
  daytimePhone?: string; mobilePhone?: string; email?: string;
  signature?: string; signatureDate?: string;
};

export type I539Data = {
  familyName?: string; givenName?: string; middleName?: string;
  inCareOf?: string; alienNumber?: string; uscisOnlineAccountNumber?: string;
  streetName?: string; aptSteFlrUnit?: "Apt" | "Ste" | "Flr"; aptSteFlrNumber?: string;
  city?: string; state?: string; zipCode?: string; hasMailingAddress?: boolean;
  streetNameForeign?: string; aptSteFlrForeignUnit?: "Apt" | "Ste" | "Flr"; aptSteFlrForeignNumber?: string;
  cityForeign?: string; stateForeign?: string; zipCodeForeign?: string;
  dateOfBirth?: string; countryOfCitizenship?: string; countryOfBirth?: string; ssn?: string;
  dateOfArrival?: string; i94Number?: string; passportNumber?: string;
  travelDocCountry?: string; countryOfIssuance?: string; passportExpirationDate?: string;
  currentStatus?: string; statusExpirationDate?: string; statusExpiresDS?: boolean;
  applicationType?: "extend" | "change";
  extendSelf?: boolean; extendSpouse?: boolean; extendChildren?: boolean;
  numberOfCoApplicants?: string; newStatusDropdown?: string; effectiveDate?: string; priorExtensionDate?: string;
  priorExtensionYes?: boolean; priorExtensionNo?: boolean;
  petitionType_I130?: boolean; petitionType_I140?: boolean; petitionType_I360?: boolean;
  petitionerName?: string; petitionFiledDate?: string; receiptNumber?: string;
  docCountry1?: string; docCountry2?: string;
  docStreet?: string; docUnit0?: boolean; docUnit1?: boolean; docUnit2?: boolean;
  docUnitNumber?: string; docCity?: string; docProvince?: string; docPostalCode?: string; docCountry?: string;
  question3Yes?: boolean; question3No?: boolean; question4Yes?: boolean; question4No?: boolean;
  question5Yes?: boolean; question5No?: boolean;
  q6Yes?: boolean; q6No?: boolean; q7Yes?: boolean; q7No?: boolean;
  q8Yes?: boolean; q8No?: boolean; q9Yes?: boolean; q9No?: boolean;
  q10Yes?: boolean; q10No?: boolean; q11Yes?: boolean; q11No?: boolean;
  q12Yes?: boolean; q12No?: boolean; q13Yes?: boolean; q13No?: boolean;
  q14Yes?: boolean; q14No?: boolean; q15Yes?: boolean; q15No?: boolean;
  q16Yes?: boolean; q16No?: boolean; q17Yes?: boolean; q17No?: boolean;
  q18Yes?: boolean; q18No?: boolean; q19Yes?: boolean; q19No?: boolean;
  q20Yes?: boolean; q20No?: boolean;
  daytimePhone?: string; mobilePhone?: string; email?: string;
  signature?: string; signatureDate?: string;
  interpreterFamilyName?: string; interpreterGivenName?: string;
  interpreterPhone?: string; interpreterPhoneAlt?: string;
  interpreterEmail?: string; interpreterLanguage?: string;
  interpreterSignature?: string; interpreterSignatureDate?: string;
  preparerSignature?: string; preparerSignatureDate?: string;
  dependentsA?: I539AData[];
};


async function fetchDecryptedPDF(): Promise<Uint8Array> {
  const res = await fetch(i539PdfUrl);
  if (!res.ok) throw new Error("PDF I-539 base não encontrado.");
  return new Uint8Array(await res.arrayBuffer());
}

async function fetchI539APDF(): Promise<Uint8Array> {
  const res = await fetch(i539aPdfUrl);
  if (!res.ok) throw new Error("PDF I-539A base não encontrado.");
  return new Uint8Array(await res.arrayBuffer());
}

/** Fill the I-539 PDF form with user data and return filled bytes */
export async function fillI539Form(
  data: I539Data,
  pdfBytes?: Uint8Array
): Promise<Uint8Array> {
  const bytes = pdfBytes ?? (await fetchDecryptedPDF());
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();

  const tx = (name: string, value: string | undefined) => {
    if (!value) return;
    try { form.getTextField(name).setText(value); } catch { /* field not in this version */ }
  };

  const btn = (name: string, checked: boolean | undefined) => {
    if (checked === undefined) return;
    try {
      const f = form.getCheckBox(name);
      checked ? f.check() : f.uncheck();
    } catch { /* skip */ }
  };

  const dropdown = (name: string, value: string | undefined) => {
    if (!value) return;
    try { form.getDropdown(name).select(value); } catch { /* skip */ }
  };

  // ── Header ──
  tx("form1[0].#subform[0].Pt1Line2_AlienNumber[0]", data.alienNumber);
  tx("form1[0].#subform[0].Pt1Line2_USCISOnlineAcctNumber[0]", data.uscisOnlineAccountNumber);
  tx("form1[0].#subform[0].USCISOnlineAcctNumber[0]", data.uscisOnlineAccountNumber);

  // ── Part 1 ──
  tx("form1[0].#subform[0].P1Line1a_FamilyName[0]", data.familyName);
  tx("form1[0].#subform[0].P1_Line1b_GivenName[0]", data.givenName);
  tx("form1[0].#subform[0].P1_Line1c_MiddleName[0]", data.middleName);
  tx("form1[0].#subform[0].Part2_Item11_InCareOfName[0]", data.inCareOf);
  tx("form1[0].#subform[0].Part2_Item11_StreetName[0]", data.streetName);
  btn("form1[0].#subform[0].Part1_Item4_Unit[0]", data.aptSteFlrUnit === "Apt");
  btn("form1[0].#subform[0].Part1_Item4_Unit[1]", data.aptSteFlrUnit === "Ste");
  btn("form1[0].#subform[0].Part1_Item4_Unit[2]", data.aptSteFlrUnit === "Flr");
  tx("form1[0].#subform[0].Part1_Item4_Number[0]", data.aptSteFlrNumber);
  tx("form1[0].#subform[0].Part2_Item11_City[0]", data.city);
  dropdown("form1[0].#subform[0].Part2_Item11_State[0]", data.state);
  tx("form1[0].#subform[0].Part2_Item11_ZipCode[0]", data.zipCode);
  tx("form1[0].#subform[0].Part1_Item6_StreetName[0]", data.streetNameForeign);
  btn("form1[0].#subform[0].Part1_Item6_Unit[0]", data.aptSteFlrForeignUnit === "Apt");
  btn("form1[0].#subform[0].Part1_Item6_Unit[1]", data.aptSteFlrForeignUnit === "Ste");
  btn("form1[0].#subform[0].Part1_Item6_Unit[2]", data.aptSteFlrForeignUnit === "Flr");
  tx("form1[0].#subform[0].Part1_Item6_Number[0]", data.aptSteFlrForeignNumber);
  tx("form1[0].#subform[0].Part1_Item6_City[0]", data.cityForeign);
  dropdown("form1[0].#subform[0].Part1_Item6_State[0]", data.stateForeign);
  tx("form1[0].#subform[0].Part1_Item6_ZipCode[0]", data.zipCodeForeign);
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

  // ── Part 2 ──
  btn("form1[0].#subform[1].P2_checkbox4[0]", data.applicationType === "extend");
  btn("form1[0].#subform[1].P2_checkbox4[1]", data.applicationType === "change");
  btn("form1[0].#subform[1].P2_checkbox[0]", data.extendSelf);
  btn("form1[0].#subform[1].P2_checkbox[1]", data.extendSpouse);
  btn("form1[0].#subform[1].P2_checkbox[2]", data.extendChildren);
  tx("form1[0].#subform[1].P2_Line5b_TotalNumber[0]", data.numberOfCoApplicants);
  tx("form1[0].#subform[1].Pt2Line2b_EffectiveDate[0]", data.effectiveDate);
  dropdown("form1[0].#subform[1].Pt2Line2a_NewStatus[0]", data.newStatusDropdown);

  // ── Part 3 ──
  btn("form1[0].#subform[1].P3_checkbox2a[0]", data.priorExtensionYes);
  btn("form1[0].#subform[1].P3_checkbox2a[1]", data.priorExtensionNo);
  tx("form1[0].#subform[1].P3_Line1a_DateExtended[0]", data.priorExtensionDate);

  tx("form1[0].#subform[2].P3_Line5_ReceiptNumber[0]", data.receiptNumber);
  tx("form1[0].#subform[2].P3_Line4_NameofPetitioner[0]", data.petitionerName);
  btn("form1[0].#subform[2].P3_checkbox1[0]", data.petitionType_I130);
  btn("form1[0].#subform[2].P3_checkbox1[1]", data.petitionType_I140);
  btn("form1[0].#subform[2].P3_checkbox1[2]", data.petitionType_I360);
  tx("form1[0].#subform[2].P3_Line5_DateFiled[0]", data.petitionFiledDate);
  tx("form1[0].#subform[2].P4_Line1a_CountryOfIssuance[0]", data.docCountry1);
  tx("form1[0].#subform[2].P4_Line1a_CountryOfIssuance[1]", data.docCountry2);
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

  // ── Part 4 ──
  btn("form1[0].#subform[3].P4_checkbox6_Yes[0]", data.q6Yes);   btn("form1[0].#subform[3].P4_checkbox6_No[0]", data.q6No);
  btn("form1[0].#subform[3].P4_checkbox7_Yes[0]", data.q7Yes);   btn("form1[0].#subform[3].P4_checkbox7_No[0]", data.q7No);
  btn("form1[0].#subform[3].P4_checkbox8_Yes[0]", data.q8Yes);   btn("form1[0].#subform[3].P4_checkbox8_No[0]", data.q8No);
  btn("form1[0].#subform[3].P4_checkbox9_Yes[0]", data.q9Yes);   btn("form1[0].#subform[3].P4_checkbox9_No[0]", data.q9No);
  btn("form1[0].#subform[3].P4_checkbox10_Yes[0]", data.q10Yes); btn("form1[0].#subform[3].P4_checkbox10_No[0]", data.q10No);
  btn("form1[0].#subform[3].P4_checkbox11_Yes[0]", data.q11Yes); btn("form1[0].#subform[3].P4_checkbox11_No[0]", data.q11No);
  btn("form1[0].#subform[3].P4_checkbox12_Yes[0]", data.q12Yes); btn("form1[0].#subform[3].P4_checkbox12_No[0]", data.q12No);
  btn("form1[0].#subform[3].P4_checkbox13_Yes[0]", data.q13Yes); btn("form1[0].#subform[3].P4_checkbox13_No[0]", data.q13No);
  btn("form1[0].#subform[3].P4_checkbox14_Yes[0]", data.q14Yes); btn("form1[0].#subform[3].P4_checkbox14_No[0]", data.q14No);
  btn("form1[0].#subform[3].P4_checkbox15_Yes[0]", data.q15Yes); btn("form1[0].#subform[3].P4_checkbox15_No[0]", data.q15No);
  btn("form1[0].#subform[3].P4_checkbox16_Yes[0]", data.q16Yes); btn("form1[0].#subform[3].P4_checkbox16_No[0]", data.q16No);
  btn("form1[0].#subform[3].P4_checkbox17_Yes[0]", data.q17Yes); btn("form1[0].#subform[3].P4_checkbox17_No[0]", data.q17No);
  btn("form1[0].#subform[3].P4_checkbox18_Yes[0]", data.q18Yes); btn("form1[0].#subform[3].P4_checkbox18_No[0]", data.q18No);
  btn("form1[0].#subform[3].P4_checkbox19_Yes[0]", data.q19Yes); btn("form1[0].#subform[3].P4_checkbox19_No[0]", data.q19No);
  btn("form1[0].#subform[3].P4_checkbox20_Yes[0]", data.q20Yes); btn("form1[0].#subform[3].P4_checkbox20_No[0]", data.q20No);

  // ── Part 5 ──
  tx("form1[0].#subform[4].P5_Line3_DaytimePhoneNumber[0]", data.daytimePhone);
  tx("form1[0].#subform[4].P5_Line4_MobilePhoneNumber[0]", data.mobilePhone);
  tx("form1[0].#subform[4].P5_Line5_EmailAddress[0]", data.email);
  tx("form1[0].#subform[4].P6_Line7_SignatureApplicant[0]", data.signature);
  tx("form1[0].#subform[4].P6_Line7_DateofSignature[0]", data.signatureDate);

  // ── Part 6 ──
  tx("form1[0].#subform[4].P7_Line1_PreparerFamilyName[0]", data.interpreterFamilyName);
  tx("form1[0].#subform[4].P7_Line1_PreparerGivenName[0]", data.interpreterGivenName);
  tx("form1[0].#subform[4].P6_Line4_DaytimePhoneNumber[0]", data.interpreterPhone);
  tx("form1[0].#subform[4].P6_Line4_DaytimePhoneNumber[1]", data.interpreterPhoneAlt);
  tx("form1[0].#subform[4].P6_Line5_EmailAddress[0]", data.interpreterEmail);
  tx("form1[0].#subform[4].P7_Line6_Language[0]", data.interpreterLanguage);
  tx("form1[0].#subform[4].P6_Line7_SignatureApplicant[1]", data.interpreterSignature);
  tx("form1[0].#subform[4].P6_Line7_DateofSignature[1]", data.interpreterSignatureDate);

  // ── Part 7 ──
  tx("form1[0].#subform[5].P7_Line1a_PreparerFamilyName[0]", data.preparerFamilyName);
  tx("form1[0].#subform[5].P7_Line1b_PreparerGivenName[0]", data.preparerGivenName);
  tx("form1[0].#subform[5].P7_Line2_BusinessName[0]", data.preparerBusiness);
  tx("form1[0].#subform[5].P7_Line4_PreparerDaytimePhoneNumber[0]", data.preparerPhone);
  tx("form1[0].#subform[5].P7_Line5_FaxPhoneNumber[0]", data.preparerFax);
  tx("form1[0].#subform[5].P7_Line6_EmailAddress[0]", data.preparerEmail);
  tx("form1[0].#subform[5].P7_Line8a_SignatureofPreparer[0]", data.preparerSignature);
  tx("form1[0].#subform[5].P7_Line8b_DateofSignature[0]", data.preparerSignatureDate);

  // ── Part 8 (name repeat) ──
  tx("form1[0].#subform[6].P8_Line2_ANumber[0].Pt1Line2_AlienNumber[1]", data.alienNumber);

  // ── Append Dependents (I-539A) ──
  if (data.dependentsA && data.dependentsA.length > 0) {
    const aBytes = await fetchI539APDF();
    for (const dep of data.dependentsA) {
      const depDoc = await PDFDocument.load(aBytes, { ignoreEncryption: true });
      const depForm = depDoc.getForm();

      const dtx = (name: string, value: string | undefined) => {
        if (!value) return;
        try { depForm.getTextField(name).setText(value); } catch { /* skip */ }
      };
      const dbtn = (name: string, checked: boolean | undefined) => {
        if (checked === undefined) return;
        try {
          const f = depForm.getCheckBox(name);
          checked ? f.check() : f.uncheck();
        } catch { /* skip */ }
      };

      dtx("form1[0].#subform[0].P1Line1a_FamilyName[0]", dep.familyName);
      dtx("form1[0].#subform[0].P1_Line1b_GivenName[0]", dep.givenName);
      dtx("form1[0].#subform[0].P1_Line1c_MiddleName[0]", dep.middleName);
      dtx("form1[0].#subform[0].SupA_Line2_DateOfBirth[0]", dep.dateOfBirth);
      dtx("form1[0].#subform[0].SupA_Line3_CountryOfBirth[0]", dep.countryOfBirth);
      dtx("form1[0].#subform[0].SupA_Line1f_CountryOfCitz[0]", dep.countryOfCitizenship);
      dtx("form1[0].#subform[0].SupA_Line1g_SSN[0]", dep.ssn);
      dtx("form1[0].#subform[0].#area[0].Pt1Line6_AlienNumber[0]", dep.alienNumber);
      dtx("form1[0].#subform[0].USCISOnlineAcctNumber[0]", dep.uscisOnlineAccountNumber);
      dtx("form1[0].#subform[0].SupA_Line1i_DateOfArrival[0]", dep.dateOfArrival);
      dtx("form1[0].#subform[0].SupA_Line1j_ArrivalDeparture[0]", dep.i94Number);
      dtx("form1[0].#subform[0].SupA_Line1k_Passport[0]", dep.passportNumber);
      dtx("form1[0].#subform[0].SupA_Line1l_TravelDoc[0]", dep.travelDocNumber);
      dtx("form1[0].#subform[0].SupA_Line1m_CountryOfIssuance[0]", dep.countryOfIssuance);
      dtx("form1[0].#subform[0].SupA_Line1n_ExpDate[0]", dep.passportExpirationDate);
      dtx("form1[0].#subform[0].Pt1Line15a_NewStatus[0]", dep.currentStatus);
      dtx("form1[0].#subform[0].SupA_Line1p_DateExpires[0]", dep.statusExpirationDate);

      // Part 3 Security
      dbtn("form1[0].#subform[1].P3_Line1_ImmVisa[0]", dep.q1Yes);
      dbtn("form1[0].#subform[1].P3_Line1_ImmVisa[1]", dep.q1No);
      dbtn("form1[0].#subform[1].P3_Line2_PetFiled[0]", dep.q2Yes);
      dbtn("form1[0].#subform[1].P3_Line2_PetFiled[1]", dep.q2No);
      dbtn("form1[0].#subform[1].P3_Line3_I485Filed[0]", dep.q3Yes);
      dbtn("form1[0].#subform[1].P3_Line3_I485Filed[1]", dep.q3No);
      dbtn("form1[0].#subform[1].P3_Line4_CrimOffense[0]", dep.q4Yes);
      dbtn("form1[0].#subform[1].P3_Line4_CrimOffense[1]", dep.q4No);
      dbtn("form1[0].#subform[1].P3_Line5_TorGeno[0]", dep.q5Yes);
      dbtn("form1[0].#subform[1].P3_Line5_TorGeno[1]", dep.q5No);
      dbtn("form1[0].#subform[1].P3_Line6_Killing[0]", dep.q6Yes);
      dbtn("form1[0].#subform[1].P3_Line6_Killing[1]", dep.q6No);
      dbtn("form1[0].#subform[1].P3_Line7_IntSevInjury[0]", dep.q7Yes);
      dbtn("form1[0].#subform[1].P3_Line7_IntSevInjury[1]", dep.q7No);
      dbtn("form1[0].#subform[1].P3_Line8_SexContRel[0]", dep.q8Yes);
      dbtn("form1[0].#subform[1].P3_Line8_SexContRel[1]", dep.q8No);
      dbtn("form1[0].#subform[1].P3_Line9_LimDenRelBel[0]", dep.q9Yes);
      dbtn("form1[0].#subform[1].P3_Line9_LimDenRelBel[1]", dep.q9No);
      dbtn("form1[0].#subform[1].P3_Line10_MilUnit[0]", dep.q10Yes);
      dbtn("form1[0].#subform[1].P3_Line10_MilUnit[1]", dep.q10No);
      dbtn("form1[0].#subform[1].P3_Line11_WorkPrison[0]", dep.q11Yes);
      dbtn("form1[0].#subform[1].P3_Line11_WorkPrison[1]", dep.q11No);
      dbtn("form1[0].#subform[1].P3_Line12_MemOfGroup[0]", dep.q12Yes);
      dbtn("form1[0].#subform[1].P3_Line12_MemOfGroup[1]", dep.q12No);
      dbtn("form1[0].#subform[1].P3_Line12_SoldProvWeap[0]", dep.q13Yes);
      dbtn("form1[0].#subform[1].P3_Line12_SoldProvWeap[1]", dep.q13No);
      dbtn("form1[0].#subform[1].P3_Line14_WeapParamilTrg[0]", dep.q14Yes);
      dbtn("form1[0].#subform[1].P3_Line14_WeapParamilTrg[1]", dep.q14No);
      dbtn("form1[0].#subform[1].P3_Line15_NonImmViolSt[0]", dep.q15Yes);
      dbtn("form1[0].#subform[1].P3_Line15_NonImmViolSt[1]", dep.q15No);

      dtx("form1[0].#subform[2].P12_Line3_Telephone[0]", dep.daytimePhone);
      dtx("form1[0].#subform[2].P12_Line3_Mobile[0]", dep.mobilePhone);
      dtx("form1[0].#subform[2].P12_Line5_Email[0]", dep.email);
      dtx("form1[0].#subform[2].P12_SignatureApplicant[0]", dep.signature);
      dtx("form1[0].#subform[2].P13_DateofSignature[0]", dep.signatureDate);

      // Merge pages into main document
      const depPages = await pdfDoc.copyPages(depDoc, depDoc.getPageIndices());
      depPages.forEach(p => pdfDoc.addPage(p));
    }
  }

  return new Uint8Array(await pdfDoc.save());
}

/** Upload filled PDF to Supabase Storage, returns public URL */
export async function uploadFilledI539(filledBytes: Uint8Array, serviceId: string, userId: string): Promise<string> {
  const fileName = `i539_${serviceId}_${Date.now()}.pdf`;
  const storagePath = `${userId}/cos/filled_${fileName}`;

  const { error } = await supabase.storage
    .from("profiles")
    .upload(storagePath, filledBytes, { contentType: "application/pdf", upsert: true });

  if (error) throw new Error(`Erro ao salvar PDF: ${error.message}`);

  const { data } = supabase.storage.from("profiles").getPublicUrl(storagePath);
  return data.publicUrl;
}
