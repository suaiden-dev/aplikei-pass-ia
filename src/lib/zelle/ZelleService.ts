import { supabase } from "@/integrations/supabase/client";

export interface ZelleSubmitParams {
    file: File;
    amount: number;
    serviceSlug: string;
    guestEmail: string;
    guestName: string;
}

export interface ZelleSubmitResult {
    paymentId: string;
}

/**
 * ZelleService simplificado (Padrão MIGMA):
 * 1. Faz upload do comprovante.
 * 2. Envia payload completo para o n8n.
 * 3. n8n é o único responsável por dar o INSERT no banco.
 */
export async function submitZellePayment(params: ZelleSubmitParams): Promise<ZelleSubmitResult> {
    const { file, amount, serviceSlug, guestEmail, guestName } = params;

    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const safeEmail = guestEmail.replace(/[^a-zA-Z0-9]/g, "_");
    const filePath = `guest/${safeEmail}/${timestamp}_${serviceSlug}.${fileExt}`;

    // 1. Upload
    const { error: uploadError } = await supabase.storage
        .from("zelle_comprovantes")
        .upload(filePath, file);

    if (uploadError) throw new Error(`Falha no upload: ${uploadError.message}`);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/zelle_comprovantes/${filePath}`;
    const paymentId = crypto.randomUUID();

    // 2. Webhook n8n (Payload idêntico ao modelo de sucesso)
    const n8nWebhookUrl = import.meta.env.VITE_N8N_ZELLE_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
        throw new Error("Configuração do n8n ausente.");
    }

    const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            event: "zelle_payment_created",
            payment_id: paymentId,
            user_id: null, // Guest checkout
            email: guestEmail,
            full_name: guestName,
            amount: amount,
            proof_path: filePath,
            image_url: imageUrl,
            service_slug: serviceSlug,
            timestamp: new Date().toISOString()
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro no n8n:", errorText);
        throw new Error(`O servidor de processamento (n8n) falhou: ${response.status}`);
    }

    return { paymentId };
}
