import { supabase } from "../lib/supabase";
import { processService } from "./process.service";
import { PDFDocument } from "pdf-lib";
import type { FinalFormsData } from "../pages/customer/COSOnboardingPage/FinalFormsStep";
import g1145Url from "../forms/g1145_template.pdf?url";
import g1450Url from "../forms/g1450_template.pdf?url";

export const finalFormsService = {
  async generateAndUploadFinalForms(userId: string, processId: string, data: FinalFormsData): Promise<void> {
    try {
      // 1. Fetch templates using Vite processed URLs
      const [res1145, res1450] = await Promise.all([
        fetch(g1145Url),
        fetch(g1450Url)
      ]);
      
      if (!res1145.ok || !res1450.ok) throw new Error("Could not find G-1145 or G-1450 template files in /forms directory");
      
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

      // --- Fill G-1145 (E-Notification) ---
      tx(form1145, "form1[0].#subform[0].FamilyName[0]", data.g1145.lastName);
      tx(form1145, "form1[0].#subform[0].GivenName[0]", data.g1145.firstName);
      tx(form1145, "form1[0].#subform[0].MiddleName[0]", data.g1145.middleName);
      tx(form1145, "form1[0].#subform[0].EmailAddress[0]", data.g1145.email);
      tx(form1145, "form1[0].#subform[0].MobilePhoneNumber[0]", data.g1145.mobile);

      // --- Fill G-1450 (Credit Card) ---
      tx(form1450, "form1[0].#subform[0].LastName[0]", data.g1450.applicantLastName);
      tx(form1450, "form1[0].#subform[0].FirstName[0]", data.g1450.applicantFirstName);
      tx(form1450, "form1[0].#subform[0].MiddleName[0]", data.g1450.applicantMiddleName);
      tx(form1450, "form1[0].#subform[0].DateOfBirth[0]", data.g1450.dateOfBirth);
      tx(form1450, "form1[0].#subform[0].AlienNumber[0]", data.g1450.aNumber);
      
      tx(form1450, "form1[0].#subform[0].NameOnCard[0]", data.g1450.cardholderName);
      tx(form1450, "form1[0].#subform[0].CreditCardNumber[0]", data.g1450.cardNumber);
      tx(form1450, "form1[0].#subform[0].ExpirationDate[0]", data.g1450.expirationDate);
      tx(form1450, "form1[0].#subform[0].CVVNumber[0]", data.g1450.cvv);

      tx(form1450, "form1[0].#subform[0].StreetAddress[0]", data.g1450.streetAddress);
      tx(form1450, "form1[0].#subform[0].City[0]", data.g1450.city);
      tx(form1450, "form1[0].#subform[0].State[0]", data.g1450.state);
      tx(form1450, "form1[0].#subform[0].ZipCode[0]", data.g1450.zipCode);

      console.log("PDFs preenchidos com os dados capturados.");
      
      const g1145PdfBytes = await g1145Doc.save();
      const g1450PdfBytes = await g1450Doc.save();

      // 2. Upload to profiles bucket
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

      // 3. Get Public URLs
      const g1145PublicUrl = supabase.storage.from("profiles").getPublicUrl(g1145Path).data.publicUrl;
      const g1450PublicUrl = supabase.storage.from("profiles").getPublicUrl(g1450Path).data.publicUrl;

      // 4. Update Process Step Data
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
