import { supabase } from "../lib/supabase";
import { processService } from "./process.service";
import { PDFDocument } from "pdf-lib";
import type { FinalFormsData } from "../pages/customer/COSOnboardingPage/FinalFormsStep";
import g1145Url from "../forms/g1145_template.pdf?url";
import g1450Url from "../forms/g1450_template.pdf?url";

export const finalFormsService = {
  async generateAndUploadFinalForms(userId: string, processId: string, data: FinalFormsData): Promise<void> {
    try {
      const [res1145, res1450] = await Promise.all([
        fetch(g1145Url),
        fetch(g1450Url)
      ]);
      
      if (!res1145.ok || !res1450.ok) throw new Error("Could not find G-1145 or G-1450 template files");
      
      const g1145Bytes = await res1145.arrayBuffer();
      const g1450Bytes = await res1450.arrayBuffer();

      const g1145Doc = await PDFDocument.load(g1145Bytes, { ignoreEncryption: true });
      const g1450Doc = await PDFDocument.load(g1450Bytes, { ignoreEncryption: true });

      const form1145 = g1145Doc.getForm();
      const form1450 = g1450Doc.getForm();

      const tx = (form: ReturnType<typeof g1145Doc.getForm>, name: string, value: string | undefined) => {
        if (!value) return;
        try { form.getTextField(name).setText(value); } catch { /* field not found */ }
      };

      const cb = (form: ReturnType<typeof g1145Doc.getForm>, name: string) => {
        try { form.getCheckBox(name).check(); } catch { /* field not found */ }
      };

      const dd = (form: ReturnType<typeof g1145Doc.getForm>, name: string, value: string | undefined) => {
        if (!value) return;
        try { form.getDropdown(name).select(value); } catch { /* field not found */ }
      };

      // --- Fill G-1145 (E-Notification) ---
      tx(form1145, "form1[0].#subform[0].LastName[0]", data.g1145.lastName);
      tx(form1145, "form1[0].#subform[0].FirstName[0]", data.g1145.firstName);
      tx(form1145, "form1[0].#subform[0].MiddleName[0]", data.g1145.middleName);
      tx(form1145, "form1[0].#subform[0].Email[0]", data.g1145.email);
      tx(form1145, "form1[0].#subform[0].MobilePhoneNumber[0]", data.g1145.mobile);

      // --- Fill G-1450 (Credit Card) ---
      tx(form1450, "form1[0].#subform[0].FamilyName[0]", data.g1450.applicantLastName);
      tx(form1450, "form1[0].#subform[0].GivenName[0]", data.g1450.applicantFirstName);
      tx(form1450, "form1[0].#subform[0].MiddleName[0]", data.g1450.applicantMiddleName);
      
      const ccFull = data.g1450.cardholderName.split(" ");
      const ccFirst = ccFull[0] || "";
      const ccLast = ccFull.length > 1 ? ccFull[ccFull.length - 1] : "";
      tx(form1450, "form1[0].#subform[0].CCHolderGivenName[0]", ccFirst);
      tx(form1450, "form1[0].#subform[0].CCHolderFamilyName[0]", ccLast);
      
      const ctype = data.g1450.cardType.toLowerCase();
      if (ctype.includes("visa")) cb(form1450, "form1[0].#subform[0].CreditCardTypeChBx[0]");
      if (ctype.includes("mastercard")) cb(form1450, "form1[0].#subform[0].CreditCardTypeChBx[1]");
      if (ctype.includes("american express") || ctype.includes("amex")) cb(form1450, "form1[0].#subform[0].CreditCardTypeChBx[2]");
      if (ctype.includes("discover")) cb(form1450, "form1[0].#subform[0].CreditCardTypeChBx[3]");

      // Billing Address
      tx(form1450, "form1[0].#subform[0].Pt1Line2b_StreetNumberName[0]", data.g1450.streetAddress);
      
      // Apt/Ste/Flr Logic
      if (data.g1450.aptSteFlr === "Apt") cb(form1450, "form1[0].#subform[0].CCHolderAptSteFlr_Unit[0]");
      if (data.g1450.aptSteFlr === "Ste") cb(form1450, "form1[0].#subform[0].CCHolderAptSteFlr_Unit[1]");
      if (data.g1450.aptSteFlr === "Flr") cb(form1450, "form1[0].#subform[0].CCHolderAptSteFlr_Unit[2]");
      tx(form1450, "form1[0].#subform[0].CCHolderAptSteFlrNumber[0]", data.g1450.aptSteFlrNumber);

      tx(form1450, "form1[0].#subform[0].CityOrTown[0]", data.g1450.city);
      
      // Try dropdown first for state, fallback to text if possible (though we know it's a dropdown)
      dd(form1450, "form1[0].#subform[0].State[0]", data.g1450.state);
      tx(form1450, "form1[0].#subform[0].ZipCode[0]", data.g1450.zipCode);

      // Contact
      tx(form1450, "form1[0].#subform[0].DaytimeTelephoneNumber[0]", data.g1145.mobile);
      tx(form1450, "form1[0].#subform[0].Email[0]", data.g1145.email);

      // Authorized Amount - Hardcoded to 470
      tx(form1450, "form1[0].#subform[0].AuthorizedPaymentAmt[0]", "470");

      const g1145PdfBytes = await g1145Doc.save();
      const g1450PdfBytes = await g1450Doc.save();

      const timestamp = new Date().getTime();
      const g1145Path = `${userId}/cos/g1145_${processId}_${timestamp}.pdf`;
      const g1450Path = `${userId}/cos/g1450_${processId}_${timestamp}.pdf`;

      const { error: err1 } = await supabase.storage
        .from("profiles")
        .upload(g1145Path, g1145PdfBytes, { contentType: "application/pdf", upsert: true });

      const { error: err2 } = await supabase.storage
        .from("profiles")
        .upload(g1450Path, g1450PdfBytes, { contentType: "application/pdf", upsert: true });

      if (err1 || err2) throw new Error("Erro de RLS ao fazer upload para bucket profiles");

      const g1145PublicUrl = supabase.storage.from("profiles").getPublicUrl(g1145Path).data.publicUrl;
      const g1450PublicUrl = supabase.storage.from("profiles").getPublicUrl(g1450Path).data.publicUrl;

      await processService.updateStepData(processId, {
        g1145PdfUrl: g1145PublicUrl,
        g1450PdfUrl: g1450PublicUrl,
        finalFormsGeneratedAt: new Date().toISOString()
      });

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro na geração final_forms";
      throw new Error(msg);
    }
  }
};
