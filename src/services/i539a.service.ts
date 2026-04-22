import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import i539aPdfUrl from "../forms/i539a_flat_template.pdf?url";
import { I539A_LAYOUT } from "./i539a-layout";

export type I539AData = {
  familyName?: string;
  givenName?: string;
  middleName?: string;
  dateOfBirth?: string;
  countryOfBirth?: string;
  countryOfCitizenship?: string;
  alienNumber?: string;
  ssn?: string;
  uscisOnlineAccountNumber?: string;
  
  // Arrival Info
  dateOfArrival?: string;
  i94Number?: string;
  passportNumber?: string;
  travelDocNumber?: string;
  countryOfIssuance?: string;
  passportExpirationDate?: string;
  
  // Status Info
  currentStatus?: string;
  statusExpirationDate?: string;
  
  // Part 3: Security Questions (Similar to I-539 Part 4)
  q1Yes?: boolean; q1No?: boolean;
  q2Yes?: boolean; q2No?: boolean;
  q3Yes?: boolean; q3No?: boolean;
  q4Yes?: boolean; q4No?: boolean;
  q5Yes?: boolean; q5No?: boolean;
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
  
  // Part 4: Contact
  daytimePhone?: string;
  mobilePhone?: string;
  email?: string;
  signature?: string;
  signatureDate?: string;
};

async function fetchI539APDF(): Promise<Uint8Array> {
  const res = await fetch(i539aPdfUrl);
  if (!res.ok) throw new Error("PDF I-539A base não encontrado.");
  return new Uint8Array(await res.arrayBuffer());
}

export async function fillI539AForm(data: I539AData): Promise<Uint8Array> {
  const bytes = await fetchI539APDF();
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const tx = (name: string, value: string | undefined) => {
    if (!value) return;

    const field = I539A_LAYOUT[name];
    if (!field) return;

    const [x1, y1, x2, y2] = field.rect;
    const width = x2 - x1;
    const height = y2 - y1;
    const fontSize = Math.min(10, Math.max(8, height - 6));

    pages[field.page - 1]?.drawText(value, {
      x: x1 + 2,
      y: y1 + Math.max(1, (height - fontSize) / 2),
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
      maxWidth: Math.max(0, width - 4),
    });
  };

  const btn = (name: string, checked: boolean | undefined) => {
    if (!checked) return;

    const field = I539A_LAYOUT[name];
    if (!field) return;

    const [x1, y1, x2, y2] = field.rect;
    const inset = 1.5;
    const page = pages[field.page - 1];
    if (!page) return;

    page.drawLine({
      start: { x: x1 + inset, y: y1 + inset },
      end: { x: x2 - inset, y: y2 - inset },
      thickness: 1.2,
      color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: { x: x1 + inset, y: y2 - inset },
      end: { x: x2 - inset, y: y1 + inset },
      thickness: 1.2,
      color: rgb(0, 0, 0),
    });
  };

  // --- Part 1 ---
  tx("form1[0].#subform[0].P1Line1a_FamilyName[0]", data.familyName); 
  tx("form1[0].#subform[0].P1_Line1b_GivenName[0]", data.givenName);
  tx("form1[0].#subform[0].P1_Line1c_MiddleName[0]", data.middleName);
  tx("form1[0].#subform[0].SupA_Line2_DateOfBirth[0]", data.dateOfBirth);
  tx("form1[0].#subform[0].SupA_Line3_CountryOfBirth[0]", data.countryOfBirth);
  tx("form1[0].#subform[0].SupA_Line1f_CountryOfCitz[0]", data.countryOfCitizenship);
  tx("form1[0].#subform[0].SupA_Line1g_SSN[0]", data.ssn);
  tx("form1[0].#subform[0].#area[0].Pt1Line6_AlienNumber[0]", data.alienNumber);
  tx("form1[0].#subform[0].USCISOnlineAcctNumber[0]", data.uscisOnlineAccountNumber);

  // Arrival info
  tx("form1[0].#subform[0].SupA_Line1i_DateOfArrival[0]", data.dateOfArrival);
  tx("form1[0].#subform[0].SupA_Line1j_ArrivalDeparture[0]", data.i94Number);
  tx("form1[0].#subform[0].SupA_Line1k_Passport[0]", data.passportNumber);
  tx("form1[0].#subform[0].SupA_Line1l_TravelDoc[0]", data.travelDocNumber);
  tx("form1[0].#subform[0].SupA_Line1m_CountryOfIssuance[0]", data.countryOfIssuance);
  tx("form1[0].#subform[0].SupA_Line1n_ExpDate[0]", data.passportExpirationDate);
  
  tx("form1[0].#subform[0].Pt1Line15a_NewStatus[0]", data.currentStatus);
  tx("form1[0].#subform[0].SupA_Line1p_DateExpires[0]", data.statusExpirationDate);

  // --- Part 3: Security ---
  btn("form1[0].#subform[1].P3_Line1_ImmVisa[0]", data.q1Yes);
  btn("form1[0].#subform[1].P3_Line1_ImmVisa[1]", data.q1No);
  btn("form1[0].#subform[1].P3_Line2_PetFiled[0]", data.q2Yes);
  btn("form1[0].#subform[1].P3_Line2_PetFiled[1]", data.q2No);
  btn("form1[0].#subform[1].P3_Line3_I485Filed[0]", data.q3Yes);
  btn("form1[0].#subform[1].P3_Line3_I485Filed[1]", data.q3No);
  btn("form1[0].#subform[1].P3_Line4_CrimOffense[0]", data.q4Yes);
  btn("form1[0].#subform[1].P3_Line4_CrimOffense[1]", data.q4No);
  btn("form1[0].#subform[1].P3_Line5_TorGeno[0]", data.q5Yes);
  btn("form1[0].#subform[1].P3_Line5_TorGeno[1]", data.q5No);
  btn("form1[0].#subform[1].P3_Line6_Killing[0]", data.q6Yes);
  btn("form1[0].#subform[1].P3_Line6_Killing[1]", data.q6No);
  btn("form1[0].#subform[1].P3_Line7_IntSevInjury[0]", data.q7Yes);
  btn("form1[0].#subform[1].P3_Line7_IntSevInjury[1]", data.q7No);
  btn("form1[0].#subform[1].P3_Line8_SexContRel[0]", data.q8Yes);
  btn("form1[0].#subform[1].P3_Line8_SexContRel[1]", data.q8No);
  btn("form1[0].#subform[1].P3_Line9_LimDenRelBel[0]", data.q9Yes);
  btn("form1[0].#subform[1].P3_Line9_LimDenRelBel[1]", data.q9No);
  btn("form1[0].#subform[1].P3_Line10_MilUnit[0]", data.q10Yes);
  btn("form1[0].#subform[1].P3_Line10_MilUnit[1]", data.q10No);
  btn("form1[0].#subform[1].P3_Line11_WorkPrison[0]", data.q11Yes);
  btn("form1[0].#subform[1].P3_Line11_WorkPrison[1]", data.q11No);
  btn("form1[0].#subform[1].P3_Line12_MemOfGroup[0]", data.q12Yes);
  btn("form1[0].#subform[1].P3_Line12_MemOfGroup[1]", data.q12No);
  btn("form1[0].#subform[1].P3_Line12_SoldProvWeap[0]", data.q13Yes);
  btn("form1[0].#subform[1].P3_Line12_SoldProvWeap[1]", data.q13No);
  btn("form1[0].#subform[1].P3_Line14_WeapParamilTrg[0]", data.q14Yes);
  btn("form1[0].#subform[1].P3_Line14_WeapParamilTrg[1]", data.q14No);
  btn("form1[0].#subform[1].P3_Line15_NonImmViolSt[0]", data.q15Yes);
  btn("form1[0].#subform[1].P3_Line15_NonImmViolSt[1]", data.q15No);

  // --- Part 4: Statement ---
  tx("form1[0].#subform[2].P12_Line3_Telephone[0]", data.daytimePhone);
  tx("form1[0].#subform[2].P12_Line3_Mobile[0]", data.mobilePhone);
  tx("form1[0].#subform[2].P12_Line5_Email[0]", data.email);
  tx("form1[0].#subform[2].P12_SignatureApplicant[0]", data.signature);
  tx("form1[0].#subform[2].P13_DateofSignature[0]", data.signatureDate);

  return new Uint8Array(await pdfDoc.save());
}
