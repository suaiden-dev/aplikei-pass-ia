import { supabase } from "@/integrations/supabase/client";

export interface ZelleSubmitParams {
    file: File;
    amount: number;
    serviceSlug: string;
    guestEmail: string;
    guestName: string;
    visaOrderId?: string;
    contractSelfieUrl?: string;
    termsAcceptedAt?: string;
}

export interface ZelleSubmitResult {
    paymentId: string;
}

/**
 * ZelleService:
 * 1. Faz upload do comprovante no storage.
 * 2. Chama a Edge Function `create-zelle-payment` que salva no banco e retorna o ID real.
 * 3. Retorna o ID real do banco para o Realtime conseguir escutar corretamente.
 */
export async function submitZellePayment(params: ZelleSubmitParams): Promise<ZelleSubmitResult> {
    const { file, amount, serviceSlug, guestEmail } = params;

    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const safeEmail = guestEmail.replace(/[^a-zA-Z0-9]/g, "_");
    const filePath = `guest/${safeEmail}/${timestamp}_${serviceSlug}.${fileExt}`;

    // 1. Upload do comprovante no storage
    const { error: uploadError } = await supabase.storage
        .from("zelle_comprovantes")
        .upload(filePath, file);

    if (uploadError) throw new Error(`Falha no upload: ${uploadError.message}`);

    // 2. Sessão do usuário (pode ser guest/anon)
    const { data: sessionData } = await supabase.auth.getSession();
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";

    // 3. Chama a Edge Function create-zelle-payment que salva no banco e retorna o ID real
    const token = sessionData?.session?.access_token ?? anonKey;
    const response = await fetch(`${supabaseUrl}/functions/v1/create-zelle-payment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            amount,
            confirmation_code: null,
            payment_date: new Date().toISOString().split("T")[0],
            recipient_name: "SU AI DEN INC",
            recipient_email: "admin@suaiden.com",
            proof_path: filePath,
            service_slug: serviceSlug,
            guest_email: guestEmail,
            guest_name: params.guestName,
            visa_order_id: params.visaOrderId || null,
            contract_selfie_url: params.contractSelfieUrl || null,
            terms_accepted_at: params.termsAcceptedAt || null,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("[ZelleService] Erro na Edge Function:", errorText);
        throw new Error(`Falha ao registrar pagamento: ${response.status}`);
    }

    const result = await response.json();
    const paymentId = result.payment_id;

    if (!paymentId) throw new Error("Edge Function não retornou payment_id.");

    console.log("[ZelleService] Pagamento registrado no banco com ID:", paymentId);
    return { paymentId };
}
