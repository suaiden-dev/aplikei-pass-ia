import { PDFDocument } from "pdf-lib";
import { supabase } from "../lib/supabase";
import { processService } from "./process.service";

/**
 * Service to handle final package generation (PDF merging)
 */
export const packageService = {
  async mergeAndUploadPackage(processId: string, userId: string): Promise<string> {
    try {
      const proc = await processService.getUserServiceBySlug(userId, "troca-status");
      if (!proc || !proc.step_data) throw new Error("Process data not found");

      const data = proc.step_data as Record<string, unknown>;
      const docs = (data.docs || {}) as Record<string, unknown>;

      // 1. Build the ordered list of URLs/Paths to merge
      const mergeQueue: { label: string; url?: string }[] = [
        { label: "G-1145", url: data.g1145PdfUrl as string | undefined },
        { label: "G-1450", url: data.g1450PdfUrl as string | undefined },
        { label: "I-539", url: data.i539PdfUrl as string | undefined },
      ];

      // Dependents I-539A (if any)
      if (data.dependents && Array.isArray(data.dependents)) {
        // TODO: Generate I-539A from template when available
        // For now, if user uploaded a custom I-539A, use it
        if (docs.i539A) mergeQueue.push({ label: "I-539A", url: this.getPublicUrl(docs.i539A as string) });
      }

      // Main I-94
      if (docs.i94) mergeQueue.push({ label: "I-94 Principal", url: this.getPublicUrl(docs.i94 as string) });

      // Dependent I-94s
      Object.keys(docs).filter(k => k.startsWith("i94_dep_")).forEach(k => {
        mergeQueue.push({ label: "I-94 Dependent", url: this.getPublicUrl(docs[k] as string) });
      });

      // F1/F2 specific
      if (docs.i20Upload) mergeQueue.push({ label: "I-20 F1", url: this.getPublicUrl(docs.i20Upload as string) });
      if (docs.i20UploadDep) mergeQueue.push({ label: "I-20 F2", url: this.getPublicUrl(docs.i20UploadDep as string) });
      if (docs.sevisFee) mergeQueue.push({ label: "SEVIS Fee Receipt", url: this.getPublicUrl(docs.sevisFee as string) });

      // Financial
      if (docs.bankStatement) mergeQueue.push({ label: "Bank Statement", url: this.getPublicUrl(docs.bankStatement as string) });

      // Cover Letter (Currently HTML in DB, we'd need a PDF version)
      // For now, if there's a stored PDF URL, use it
      if (data.coverLetterPdfUrl) mergeQueue.push({ label: "Cover Letter", url: data.coverLetterPdfUrl as string });

      // Passports
      if (docs.passportVisa) mergeQueue.push({ label: "Passport Principal", url: this.getPublicUrl(docs.passportVisa as string) });
      Object.keys(docs).filter(k => k.startsWith("passportVisa_dep_")).forEach(k => {
        mergeQueue.push({ label: "Passport Dependent", url: this.getPublicUrl(docs[k] as string) });
      });

      // Certificates
      if (docs.marriageCertificate) mergeQueue.push({ label: "Marriage Certificate", url: this.getPublicUrl(docs.marriageCertificate as string) });
      Object.keys(docs).filter(k => k.startsWith("birthCertificate_dep_")).forEach(k => {
        mergeQueue.push({ label: "Birth Certificate", url: this.getPublicUrl(docs[k] as string) });
      });

      // Residence
      if (docs.proofBrazil) mergeQueue.push({ label: "Proof of Residence", url: this.getPublicUrl(docs.proofBrazil as string) });

      // 2. Perform the Merge
      const masterDoc = await PDFDocument.create();
      
      for (const item of mergeQueue) {
        if (!item.url) continue;
        try {
          const res = await fetch(item.url);
          if (!res.ok) continue;
          
          const bytes = await res.arrayBuffer();
          const contentType = res.headers.get("content-type") || "";

          if (contentType.includes("pdf") || item.url.toLowerCase().endsWith(".pdf")) {
            const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
            const copiedPages = await masterDoc.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(p => masterDoc.addPage(p));
          } else if (contentType.includes("image") || ["jpg", "jpeg", "png"].some(ext => item.url?.toLowerCase().endsWith(ext))) {
            // Handle Images (one image per page)
            const img = item.url.toLowerCase().endsWith("png") 
              ? await masterDoc.embedPng(bytes) 
              : await masterDoc.embedJpg(bytes);
            
            const page = masterDoc.addPage([img.width, img.height]);
            page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
          }
        } catch (err) {
          console.error(`Error merging ${item.label}:`, err);
        }
      }

      // 3. Save and Upload
      const mergedBytes = await masterDoc.save();
      const fileName = `final_package_${processId}_${Date.now()}.pdf`;
      const filePath = `${userId}/cos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, mergedBytes, { contentType: "application/pdf", upsert: true });

      if (uploadError) throw uploadError;

      const publicUrl = supabase.storage.from("profiles").getPublicUrl(filePath).data.publicUrl;

      // 4. Update Step Data
      await processService.updateStepData(processId, {
        finalPackagePdfUrl: publicUrl,
        finalPackageGeneratedAt: new Date().toISOString()
      });

      return publicUrl;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to merge package";
      throw new Error(message);
    }
  },

  getPublicUrl(path: string): string {
    if (path.startsWith("http")) return path;
    return supabase.storage.from("profiles").getPublicUrl(path).data.publicUrl;
  }
};
