import { PDFDocument } from "pdf-lib";
import { supabase } from "@shared/lib/supabase";
import { getServiceById, updateStepData } from "../../../process/services/processOps";
import { fillI539AForm, type I539AData } from "./i539a";

const STORAGE_BUCKET = "aplikei-profiles";

type PlainRecord = Record<string, unknown>;

function isRecord(value: unknown): value is PlainRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toPublicUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(value).data.publicUrl;
}

function splitFullName(fullName: string): { familyName: string; givenName: string; middleName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { familyName: "", givenName: "", middleName: "" };
  }

  if (parts.length === 1) {
    return { familyName: parts[0], givenName: parts[0], middleName: "" };
  }

  return {
    familyName: parts.at(-1) ?? "",
    givenName: parts[0] ?? "",
    middleName: parts.slice(1, -1).join(" "),
  };
}

function toPdfDate(value: unknown): string | undefined {
  const raw = asString(value);
  if (!raw) return undefined;
  if (raw.includes("/")) return raw;

  const [year, month, day] = raw.split("-");
  if (year && month && day) {
    return `${month}/${day}/${year}`;
  }

  return raw;
}

function normalizeI539ADependent(
  dependent: PlainRecord,
  fallback?: PlainRecord,
): I539AData {
  const fullName = asString(dependent.name ?? fallback?.name ?? fallback?.fullName ?? "");
  const split = splitFullName(fullName);
  const savedSignature = asString(dependent.signature ?? fallback?.signature ?? "");

  return {
    familyName: asString(dependent.familyName ?? fallback?.familyName ?? split.familyName),
    givenName: asString(dependent.givenName ?? fallback?.givenName ?? split.givenName),
    middleName: asString(dependent.middleName ?? fallback?.middleName ?? split.middleName),
    dateOfBirth: toPdfDate(dependent.dateOfBirth ?? fallback?.dateOfBirth ?? fallback?.birthDate),
    countryOfBirth: asString(dependent.countryOfBirth ?? fallback?.countryOfBirth),
    countryOfCitizenship: asString(dependent.countryOfCitizenship ?? fallback?.countryOfCitizenship),
    alienNumber: asString(dependent.alienNumber ?? fallback?.alienNumber),
    ssn: asString(dependent.ssn ?? fallback?.ssn),
    uscisOnlineAccountNumber: asString(
      dependent.uscisOnlineAccountNumber ?? fallback?.uscisOnlineAccountNumber,
    ),
    dateOfArrival: toPdfDate(dependent.dateOfArrival ?? fallback?.dateOfArrival ?? fallback?.i94Date),
    i94Number: asString(dependent.i94Number ?? fallback?.i94Number),
    passportNumber: asString(dependent.passportNumber ?? fallback?.passportNumber),
    travelDocNumber: asString(dependent.travelDocNumber ?? fallback?.travelDocNumber),
    countryOfIssuance: asString(dependent.countryOfIssuance ?? fallback?.countryOfIssuance),
    passportExpirationDate: toPdfDate(
      dependent.passportExpirationDate ?? fallback?.passportExpirationDate,
    ),
    currentStatus: asString(dependent.currentStatus ?? fallback?.currentStatus),
    statusExpirationDate: toPdfDate(
      dependent.statusExpirationDate ?? fallback?.statusExpirationDate,
    ),
    q1Yes: Boolean(dependent.q1Yes ?? fallback?.q1Yes),
    q1No: dependent.q1No === undefined ? undefined : Boolean(dependent.q1No),
    q2Yes: Boolean(dependent.q2Yes ?? fallback?.q2Yes),
    q2No: dependent.q2No === undefined ? undefined : Boolean(dependent.q2No),
    q3Yes: Boolean(dependent.q3Yes ?? fallback?.q3Yes),
    q3No: dependent.q3No === undefined ? undefined : Boolean(dependent.q3No),
    q4Yes: Boolean(dependent.q4Yes ?? fallback?.q4Yes),
    q4No: dependent.q4No === undefined ? undefined : Boolean(dependent.q4No),
    q5Yes: Boolean(dependent.q5Yes ?? fallback?.q5Yes),
    q5No: dependent.q5No === undefined ? undefined : Boolean(dependent.q5No),
    q6Yes: Boolean(dependent.q6Yes ?? fallback?.q6Yes),
    q6No: dependent.q6No === undefined ? undefined : Boolean(dependent.q6No),
    q7Yes: Boolean(dependent.q7Yes ?? fallback?.q7Yes),
    q7No: dependent.q7No === undefined ? undefined : Boolean(dependent.q7No),
    q8Yes: Boolean(dependent.q8Yes ?? fallback?.q8Yes),
    q8No: dependent.q8No === undefined ? undefined : Boolean(dependent.q8No),
    q9Yes: Boolean(dependent.q9Yes ?? fallback?.q9Yes),
    q9No: dependent.q9No === undefined ? undefined : Boolean(dependent.q9No),
    q10Yes: Boolean(dependent.q10Yes ?? fallback?.q10Yes),
    q10No: dependent.q10No === undefined ? undefined : Boolean(dependent.q10No),
    q11Yes: Boolean(dependent.q11Yes ?? fallback?.q11Yes),
    q11No: dependent.q11No === undefined ? undefined : Boolean(dependent.q11No),
    q12Yes: Boolean(dependent.q12Yes ?? fallback?.q12Yes),
    q12No: dependent.q12No === undefined ? undefined : Boolean(dependent.q12No),
    q13Yes: Boolean(dependent.q13Yes ?? fallback?.q13Yes),
    q13No: dependent.q13No === undefined ? undefined : Boolean(dependent.q13No),
    q14Yes: Boolean(dependent.q14Yes ?? fallback?.q14Yes),
    q14No: dependent.q14No === undefined ? undefined : Boolean(dependent.q14No),
    q15Yes: Boolean(dependent.q15Yes ?? fallback?.q15Yes),
    q15No: dependent.q15No === undefined ? undefined : Boolean(dependent.q15No),
    daytimePhone: asString(dependent.daytimePhone ?? fallback?.daytimePhone),
    mobilePhone: asString(dependent.mobilePhone ?? fallback?.mobilePhone),
    email: asString(dependent.email ?? fallback?.email),
    signature: savedSignature || fullName || `${split.givenName} ${split.familyName}`.trim(),
    signatureDate: toPdfDate(dependent.signatureDate ?? fallback?.signatureDate) ?? new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
  };
}

function collectI539ADependents(stepData: PlainRecord): I539AData[] {
  const i539Data = isRecord(stepData.i539) ? stepData.i539 : null;
  const savedDependents = Array.isArray(i539Data?.dependentsA)
    ? (i539Data.dependentsA as PlainRecord[])
    : [];
  const fallbackDependents = Array.isArray(stepData.dependents)
    ? (stepData.dependents as PlainRecord[])
    : [];

  if (savedDependents.length > 0) {
    return savedDependents.map((dependent, index) =>
      normalizeI539ADependent(dependent, fallbackDependents[index]),
    );
  }

  return fallbackDependents.map((dependent) => normalizeI539ADependent(dependent));
}

async function generateI539APdf(
  processId: string,
  userId: string,
  stepData: PlainRecord,
): Promise<string | null> {
  const dependents = collectI539ADependents(stepData);
  if (dependents.length === 0) return null;

  const masterDoc = await PDFDocument.create();

  for (const dependent of dependents) {
    const dependentBytes = await fillI539AForm(dependent);
    const dependentDoc = await PDFDocument.load(dependentBytes, { ignoreEncryption: true });
    const copiedPages = await masterDoc.copyPages(dependentDoc, dependentDoc.getPageIndices());
    copiedPages.forEach((page) => masterDoc.addPage(page));
  }

  const mergedBytes = await masterDoc.save();
  const fileName = `i539a_${processId}_${Date.now()}.pdf`;
  const storagePath = `${userId}/cos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, mergedBytes, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const publicUrl = toPublicUrl(storagePath);
  const docs = isRecord(stepData.docs) ? stepData.docs : {};

  await updateStepData(processId, {
    i539APdfUrl: publicUrl,
    i539AGeneratedAt: new Date().toISOString(),
    docs: {
      ...docs,
      i539A: storagePath,
    },
  });

  return publicUrl;
}

export const packageService = {
  async mergeAndUploadPackage(processId: string, userId: string): Promise<string> {
    try {
      const proc = await getServiceById(processId);
      if (!proc || !proc.step_data) throw new Error("Process data not found");

      const data = proc.step_data as PlainRecord;
      const docs = isRecord(data.docs) ? data.docs : {};
      const mergeQueue: { label: string; url?: string }[] = [
        { label: "G-1145", url: asString(data.g1145PdfUrl) || undefined },
        { label: "G-1450", url: asString(data.g1450PdfUrl) || undefined },
        { label: "I-539", url: asString(data.i539PdfUrl) || undefined },
      ];

      const storedI539A = asString(docs.i539A);
      const i539AUrl =
        asString(data.i539APdfUrl) ||
        asString(data.i539aPdfUrl) ||
        (storedI539A ? toPublicUrl(storedI539A) : "") ||
        (await generateI539APdf(processId, userId, data)) ||
        undefined;

      if (i539AUrl) {
        mergeQueue.push({ label: "I-539A", url: i539AUrl });
      }

      if (asString(docs.i94)) {
        mergeQueue.push({ label: "I-94 Principal", url: toPublicUrl(asString(docs.i94)) });
      }

      Object.keys(docs)
        .filter((key) => key.startsWith("i94_dep_"))
        .forEach((key) => {
          const url = asString(docs[key]);
          if (url) {
            mergeQueue.push({ label: "I-94 Dependent", url: toPublicUrl(url) });
          }
        });

      if (asString(docs.i20Upload)) {
        mergeQueue.push({ label: "I-20 F1", url: toPublicUrl(asString(docs.i20Upload)) });
      }
      if (asString(docs.i20UploadDep)) {
        mergeQueue.push({ label: "I-20 F2", url: toPublicUrl(asString(docs.i20UploadDep)) });
      }
      if (asString(docs.sevisFee)) {
        mergeQueue.push({ label: "SEVIS Fee Receipt", url: toPublicUrl(asString(docs.sevisFee)) });
      }
      if (asString(docs.bankStatement)) {
        mergeQueue.push({ label: "Bank Statement", url: toPublicUrl(asString(docs.bankStatement)) });
      }

      if (asString(data.coverLetterPdfUrl)) {
        mergeQueue.push({ label: "Cover Letter", url: asString(data.coverLetterPdfUrl) });
      }

      if (asString(docs.passportVisa)) {
        mergeQueue.push({ label: "Passport Principal", url: toPublicUrl(asString(docs.passportVisa)) });
      }

      Object.keys(docs)
        .filter((key) => key.startsWith("passportVisa_dep_"))
        .forEach((key) => {
          const url = asString(docs[key]);
          if (url) {
            mergeQueue.push({ label: "Passport Dependent", url: toPublicUrl(url) });
          }
        });

      if (asString(docs.marriageCertificate)) {
        mergeQueue.push({
          label: "Marriage Certificate",
          url: toPublicUrl(asString(docs.marriageCertificate)),
        });
      }

      Object.keys(docs)
        .filter((key) => key.startsWith("birthCertificate_dep_"))
        .forEach((key) => {
          const url = asString(docs[key]);
          if (url) {
            mergeQueue.push({ label: "Birth Certificate", url: toPublicUrl(url) });
          }
        });

      if (asString(docs.proofBrazil)) {
        mergeQueue.push({ label: "Proof of Residence", url: toPublicUrl(asString(docs.proofBrazil)) });
      }

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
            copiedPages.forEach((page) => masterDoc.addPage(page));
            continue;
          }

          const isImage =
            contentType.includes("image") ||
            ["jpg", "jpeg", "png"].some((ext) => item.url?.toLowerCase().endsWith(ext));

          if (isImage) {
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

      const mergedBytes = await masterDoc.save();
      const fileName = `final_package_${processId}_${Date.now()}.pdf`;
      const filePath = `${userId}/cos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, mergedBytes, { contentType: "application/pdf", upsert: true });

      if (uploadError) {
        throw new Error(uploadError.message, { cause: uploadError });
      }

      const publicUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath).data.publicUrl;

      await updateStepData(processId, {
        finalPackagePdfUrl: publicUrl,
        finalPackageGeneratedAt: new Date().toISOString(),
      });

      return publicUrl;
    } catch (e: unknown) {
      throw new Error(
        e instanceof Error ? e.message : "Failed to merge package",
        { cause: e },
      );
    }
  },

  getPublicUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
  },
};
