import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configuração do Supabase Client com Service Role (Admin)
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

interface ZelleWebhookPayload {
    payment_id: string; // uuid
    response: "valid" | "invalid" | "uncertain";
    confidence: number;
    reason?: string;
}

serve(async (req) => {
    // 1. Tratamento de CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // [OPCIONAL] 2. Autenticação (Webhook Secret)
        // const authHeader = req.headers.get("Authorization");
        // if (authHeader !== `Bearer ${Deno.env.get("ZELLE_WEBHOOK_SECRET")}`) {
        //     return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }});
        // }

        // 3. Receber payload do n8n
        const payload: ZelleWebhookPayload = await req.json();
        console.log(`[zelle-webhook] Recebido payload do n8n:`, payload);

        if (!payload.payment_id) {
            throw new Error("payment_id é obrigatório");
        }

        // 4. Buscar informações do pagamento
        const { data: payment, error: fetchError } = await supabase
            .from("zelle_payments")
            .select("*")
            .eq("id", payload.payment_id)
            .single();

        if (fetchError || !payment) {
            throw new Error(`Pagamento não encontrado: ${fetchError?.message}`);
        }

        // 5. Atualizar o registro com o resultado da IA
        const { error: updateAIError } = await supabase
            .from("zelle_payments")
            .update({
                n8n_confidence: payload.confidence,
                n8n_response: payload.response,
                admin_notes: payload.reason ? `[IA]: ${payload.reason}` : null
            })
            .eq("id", payload.payment_id);

        if (updateAIError) {
            console.error("[zelle-webhook] Erro ao atualizar retorno da IA:", updateAIError);
        }

        // 6. Regra de Negócio: Aprovação ou Ação Manual
        // Se a IA diz que é válido e a confiança for alta (> 0.90), aprovamos automaticamente.
        // Caso contrário, deixamos como pending_verification para o Admin aprovar manualmente.

        const requiresManualApproval = payload.response !== "valid" || payload.confidence < 0.90;

        if (requiresManualApproval) {
            console.log(`[zelle-webhook] Pagamento ${payload.payment_id} precisa de revisão manual.`);
            return new Response(
                JSON.stringify({ message: "Recebido. Requer aprovação manual.", status: "pending_verification" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
        }

        console.log(`[zelle-webhook] Pagamento ${payload.payment_id} aprovado automaticamente pela IA.`);

        // 7. Lógica de Aprovação Automática (Criar conta ou ativar serviço)
        let finalUserId = payment.user_id;

        // Se for Guest (não tem user_id)
        if (!finalUserId && payment.guest_email) {
            console.log(`[zelle-webhook] Guest checkout detectado. Verificando/Criando conta para ${payment.guest_email}`);

            try {
                // Buscar se já existe um usuário com esse e-mail
                const { data: users, error: listUserError } = await supabase.auth.admin.listUsers();
                let existingUser = null;
                if (!listUserError && users?.users) {
                    existingUser = users.users.find(u => u.email === payment.guest_email);
                }

                if (existingUser) {
                    console.log(`[zelle-webhook] Usuário já existe. UID: ${existingUser.id}`);
                    finalUserId = existingUser.id;
                } else {
                    console.log(`[zelle-webhook] Criando nova conta e enviando convite para ${payment.guest_email}...`);

                    // Determinamos origin default ou baseada no env se houver configuração cross-service
                    const originUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:5173";
                    const redirectTo = `${originUrl}/auth/confirm-password`;

                    const { data: authUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
                        payment.guest_email,
                        {
                            redirectTo,
                            data: { full_name: payment.guest_name ?? "Guest User" }
                        }
                    );

                    if (inviteError) {
                        console.error(`[zelle-webhook] Erro ao convidar usuário (Auth): ${inviteError.message}`);
                    } else if (authUser?.user) {
                        finalUserId = authUser.user.id;
                        console.log(`[zelle-webhook] Novo usuário criado via convite. UID: ${finalUserId}`);
                    }
                }
            } catch (authError: any) {
                console.error(`[zelle-webhook] Erro no fluxo de Auth:`, authError.message);
            }
        }

        // 8. Finaliza Aprovação
        console.log(`[zelle-webhook] Ativando serviço ${payment.service_slug} para usuário ${finalUserId}`);

        const { error: finalUpdateError } = await supabase
            .from("zelle_payments")
            .update({
                status: "approved",
                user_id: finalUserId,
                admin_approved_at: new Date().toISOString(),
                admin_notes: `[Aprovado Automaticamente - Confiança IA: ${payload.confidence}]`
            })
            .eq("id", payload.payment_id);

        if (finalUpdateError) {
            throw new Error(`Erro ao finalizar pagamento: ${finalUpdateError.message}`);
        }

        // Ativa o serviço para o usuário
        if (payment.service_slug && finalUserId) {
            const { error: serviceError } = await supabase
                .from("user_services")
                .insert({
                    user_id: finalUserId,
                    service_slug: payment.service_slug,
                    status: "active"
                });

            if (serviceError) {
                console.error(`[zelle-webhook] Erro ao ativar serviço:`, serviceError);
            }
        }

        return new Response(
            JSON.stringify({ message: "Pagamento processado e serviço ativado com sucesso.", status: "approved" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );

    } catch (err: any) {
        console.error(`[zelle-webhook] Erro inesperado:`, err.message);
        return new Response(
            JSON.stringify({ error: err.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
