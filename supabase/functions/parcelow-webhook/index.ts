import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const payload = await req.json();
        console.log(`[parcelow-webhook] Payload recebido:`, JSON.stringify(payload));

        const eventType = payload.event || "";
        const parcelowOrder = payload.order;

        if (!parcelowOrder || !parcelowOrder.id) {
            throw new Error("Payload inválido. ID da ordem do Parcelow ausente.");
        }

        const parcelowOrderId = parcelowOrder.id.toString();

        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // 1. Buscar a ordem atrelada (Tenta por ID remoto, depois por Number/UUID interno)
        let { data: orderData, error: orderError } = await supabase
            .from("visa_orders")
            .select("*")
            .eq("parcelow_order_id", parcelowOrderId)
            .maybeSingle();

        // Fallback: Buscar por reference (order_number ou ID extraído do APK_)
        if (!orderData) {
            const reference = parcelowOrder.reference || "";
            console.log(`[parcelow-webhook] Fallback: buscando por reference ${reference}`);

            const uuidOnly = reference.startsWith("APK_") ? reference.replace("APK_", "") : reference;

            const { data: fallbackData } = await supabase
                .from("visa_orders")
                .select("*")
                .or(`id.eq.${uuidOnly},order_number.eq.${reference}`)
                .maybeSingle();

            if (fallbackData) {
                orderData = fallbackData;
                // Vincula imediatamente o ID remoto para as próximas chamadas serem rápidas
                await supabase.from("visa_orders").update({ parcelow_order_id: parcelowOrderId }).eq("id", orderData.id);
            }
        }

        if (orderError || !orderData) {
            console.error(`[parcelow-webhook] Ordem não encontrada para parcelow_order_id: ${parcelowOrderId} ou reference: ${parcelowOrder.reference}`);
            return new Response(JSON.stringify({ error: "Order not found" }), {
                status: 200, // Retornamos 200 para o roteador não reenviar infinitamente algo que não temos
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // 2. Mapeamento de Status Flexível (Aceita event_order_paid e Paid)
        let newStatus = orderData.payment_status;
        const isPaid =
            eventType.includes("order_paid") ||
            parcelowOrder.status_text === "Paid" ||
            parcelowOrder.status === 2 ||
            payload.status === "paid" ||
            parcelowOrder.status === "paid";

        const isDeclined =
            eventType.includes("order_declined") ||
            parcelowOrder.status === 3 ||
            payload.status === "declined" ||
            parcelowOrder.status === "declined";

        const isCanceled =
            eventType.includes("order_canceled") ||
            parcelowOrder.status === 4 ||
            payload.status === "canceled" ||
            parcelowOrder.status === "canceled";

        if (isPaid) {
            newStatus = "paid";
        } else if (isDeclined || isCanceled) {
            newStatus = "failed";
        } else {
            console.log(`[parcelow-webhook] Evento ignorado ou informativo: ${eventType} | Status: ${parcelowOrder.status_text}`);
            return new Response("OK", { status: 200, headers: corsHeaders });
        }

        // 3. Persistir mudança se necessário
        if (newStatus !== orderData.payment_status) {
            console.log(`[parcelow-webhook] Atualizando ordem ${orderData.id}: ${orderData.payment_status} -> ${newStatus}`);

            const { error: updateError } = await supabase
                .from("visa_orders")
                .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
                .eq("id", orderData.id);

            if (updateError) throw new Error(`Erro ao atualizar status: ${updateError.message}`);

            // 3.1 Pós-Processamento (Se pago com sucesso)
            if (newStatus === "paid") {
                let finalUserId = orderData.user_id;

                if (!finalUserId && orderData.client_email) {
                    console.log(`[parcelow-webhook] Guest order detectada para ${orderData.client_email}`);

                    try {
                        const { data: users } = await supabase.auth.admin.listUsers();
                        let existingUser = users?.users?.find((u: any) => u.email === orderData.client_email);

                        if (existingUser) {
                            finalUserId = existingUser.id;
                        } else {
                            console.log(`[parcelow-webhook] Criando acc via convite...`);
                            const { data: authUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
                                orderData.client_email,
                                {
                                    redirectTo: `${Deno.env.get("FRONTEND_URL")}/auth/confirm-password`,
                                    data: { full_name: orderData.client_name ?? "Client" }
                                }
                            );

                            if (!inviteError && authUser?.user) {
                                finalUserId = authUser.user.id;
                            }
                        }
                    } catch (e) { console.error("Erro Auth:", e); }
                }

                if (finalUserId) {
                    // Vincula user_id na ordem
                    await supabase.from("visa_orders").update({ user_id: finalUserId }).eq("id", orderData.id);

                    // Ativa o serviço
                    if (orderData.product_slug) {
                        await supabase.from("user_services").upsert({
                            user_id: finalUserId,
                            service_slug: orderData.product_slug,
                            status: "active"
                        });
                        console.log(`[parcelow-webhook] Serviço ${orderData.product_slug} ativado.`);
                    }

                    // Gera o PDF do contrato após pagamento confirmado
                    try {
                        const { error: pdfError } = await supabase.functions.invoke("generate-contract-pdf", {
                            body: { order_id: orderData.id }
                        });
                        if (pdfError) console.error(`[parcelow-webhook] Erro ao gerar PDF:`, pdfError);
                        else console.log(`[parcelow-webhook] PDF enfileirado para ordem ${orderData.id}`);
                    } catch (pdfErr: any) {
                        console.error(`[parcelow-webhook] Erro inesperado ao gerar PDF:`, pdfErr.message);
                    }
                }
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err: any) {
        console.error(`[parcelow-webhook] Erro crítico:`, err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
