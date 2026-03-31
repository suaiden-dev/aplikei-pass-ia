import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fillI539Form } from "@/application/use-cases/FillI539Form";
import { I539FormData } from "@/domain/entities/I539FormData";

const TEMPLATE_URL = import.meta.env.VITE_I539_TEMPLATE_URL as string;
const BUCKET = "documents";

async function uploadBytes(bucket: string, storagePath: string, bytes: Uint8Array): Promise<string> {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const { error } = await supabase.storage.from(bucket).upload(storagePath, blob, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

export function useI539Form() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ formData, orderId }: { formData: I539FormData; orderId: string }) => {
      if (!TEMPLATE_URL) throw new Error("VITE_I539_TEMPLATE_URL not set in .env");
      return fillI539Form(formData, orderId, {
        templateUrl: TEMPLATE_URL,
        bucket: BUCKET,
        uploadBytes,
      });
    },
    onSuccess: (result) => {
      setPdfUrl(result.publicUrl);
    },
  });

  return {
    /** Preenche o I-539 e faz upload. Retorna a URL pública do PDF gerado. */
    generate: (formData: I539FormData, orderId: string) =>
      mutation.mutateAsync({ formData, orderId }),
    isGenerating: mutation.isPending,
    error: mutation.error,
    pdfUrl,
  };
}
