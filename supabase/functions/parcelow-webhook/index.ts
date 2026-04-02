import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const payload = await req.json();
        console.log(`[parcelow-webhook] Payload recebido:`, JSON.stringify(payload));

        const eventType = (payload.event as string) || "";
        // Justification: Usando 'any' tático para facilitar o acesso a propriedades dinâmicas do webhook do Parcelow.
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const parcelowOrder = payload.order as any;

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

        interface VisaOrderRecord {
            id: string;
            user_id: string | null;
            order_number: string | null;
            payment_status: string;
            client_email: string | null;
            client_name: string | null;
            product_slug: string | null;
            payment_metadata: Record<string, unknown> | null;
        }

        // 1. Buscar a ordem atrelada (Tenta por ID remoto, depois por Number/UUID interno)
        const { data: maybeOrderData, error: orderError } = await (supabase
            .from("visa_orders")
            .select("*")
            .eq("parcelow_order_id", parcelowOrderId)
            .maybeSingle() as any);
        
        let orderData = maybeOrderData;

        // Fallback: Buscar por reference (order_number ou ID extraído do APK_)
        if (!orderData) {
            const reference = parcelowOrder.reference as string || "";
            console.log(`[parcelow-webhook] Fallback: buscando por reference ${reference}`);

            const uuidOnly = reference.startsWith("APK_") ? reference.replace("APK_", "") : reference;

            const { data: fallbackData } = await (supabase
                .from("visa_orders")
                .select("*")
                .or(`id.eq.${uuidOnly},order_number.eq.${reference}`)
                .maybeSingle() as any);

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
            (payload.status as string) === "paid" ||
            parcelowOrder.status === "paid";

        const isDeclined =
            eventType.includes("order_declined") ||
            parcelowOrder.status === 3 ||
            (payload.status as string) === "declined" ||
            parcelowOrder.status === "declined";

        const isCanceled =
            eventType.includes("order_canceled") ||
            parcelowOrder.status === 4 ||
            (payload.status as string) === "canceled" ||
            parcelowOrder.status === "canceled";

        if (isPaid) {
            newStatus = "paid";
        } else if (isDeclined || isCanceled) {
            newStatus = "failed";
        } else {
            console.log(`[parcelow-webhook] Evento ignorado ou informativo: ${eventType} | Status: ${parcelowOrder.status_text}`);
            /* eslint-enable @typescript-eslint/no-explicit-any */
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
                        const userList = (users as unknown as { users: { id: string, email?: string }[] })?.users || [];
                        const existingUser = userList.find((u: { email?: string }) => u.email === orderData!.client_email);

                        if (existingUser) {
                            finalUserId = existingUser.id;
                        } else {
                            const originUrl = orderData.payment_metadata?.origin_url || Deno.env.get("FRONTEND_URL") || "https://aplikeipass.com";
                            console.log(`[parcelow-webhook] Criando acc via convite para ${orderData.client_email} (Origin: ${originUrl})`);
                            
                            const { data: authUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
                                orderData.client_email,
                                {
                                    redirectTo: `${originUrl}/auth/confirm-password`,
                                    data: { full_name: orderData.client_name ?? "Client" }
                                }
                            );
        
                            if (inviteError) {
                                console.error("[parcelow-webhook] Erro ao convidar usuário:", inviteError.message);
                            } else if (authUser?.user) {
                                console.log("[parcelow-webhook] Convite enviado com sucesso para:", orderData.client_email);
                                finalUserId = authUser.user.id;
                            }
                        }
                    } catch (e: unknown) { 
                        console.error("Erro Auth:", (e as Error).message); 
                    }
                }

                if (finalUserId) {
                    // Vincula user_id na ordem
                    await supabase.from("visa_orders").update({ user_id: finalUserId }).eq("id", orderData.id);

                    // Ativa o serviço
                    if (orderData.product_slug) {
                        // Justification: Usando 'any' tático para facilitar o acesso a propriedades dinâmicas do metadata.
                        /* eslint-disable @typescript-eslint/no-explicit-any */
                        const metadata = (orderData.payment_metadata as any) || {};
                        if (metadata.action === 'restart' && metadata.serviceId) {
                            console.log(`[parcelow-webhook] Restarting service ${metadata.serviceId}`);
                            await supabase.from("user_services").update({
                                status: "active",
                                product_type: (metadata.product_type || 'COS')
                            }).eq("id", metadata.serviceId);
                        } else if (metadata.action && metadata.serviceId) {
                            const action = metadata.action;
                            const sId = metadata.serviceId;
                            const actionPrefix = action.split('_')[0].toUpperCase(); 
                            
                            // Verificamos o status atual para saber se devemos ir para FORM ou MOTION
                            const { data: currentService } = await supabase
                                .from('user_services')
                                .select('status')
                                .eq('id', sId)
                                .single();
                            
                            const isRfeFlow = currentService?.status?.endsWith('_RFE');
                            let nextStatus = "";
                            
                            if (['cos_analyst', 'eos_analyst', 'rfe_analyst', 'specialist_review', 'specialist_training'].includes(action)) {
                                nextStatus = `${actionPrefix}_CASE_FORM`;
                            } else if (['cos_recovery', 'eos_recovery', 'rfe_recovery', 'cos_motion', 'eos_motion', 'motion_recovery'].includes(action)) {
                                nextStatus = isRfeFlow ? `${actionPrefix}_CASE_FORM` : `${actionPrefix}_MOTION_IN_PROGRESS`;
                            }
                            
                            if (nextStatus) {
                                console.log(`[parcelow-webhook] Advancing service ${sId} to ${nextStatus} for action ${action} (current: ${currentService?.status})`);
                                await supabase
                                    .from("user_services")
                                    .update({ 
                                        status: nextStatus,
                                        product_type: metadata.product_type || (actionPrefix === 'COS' ? 'COS' : 'EOS')
                                    })
                                    .eq("id", sId);
                            } else {
                                // Default fallback to active
                                await supabase.from("user_services").upsert({
                                    user_id: finalUserId,
                                    service_slug: orderData.product_slug,
                                    status: "active"
                                });
                            }
                        } else {
                            await supabase.from("user_services").upsert({
                                user_id: finalUserId,
                                service_slug: orderData.product_slug,
                                status: "active"
                            });
                            console.log(`[parcelow-webhook] Serviço ${orderData.product_slug} ativado.`);
                        }
                        /* eslint-enable @typescript-eslint/no-explicit-any */
                    }

                    // Gera o PDF do contrato após pagamento confirmado
                    try {
                        const { error: pdfError } = await supabase.functions.invoke("generate-contract-pdf", {
                            body: { order_id: orderData.id }
                        });
                        if (pdfError) console.error(`[parcelow-webhook] Erro ao gerar PDF:`, pdfError);
                        else console.log(`[parcelow-webhook] PDF enfileirado para ordem ${orderData.id}`);
                    } catch (pdfErr: unknown) {
                        console.error(`[parcelow-webhook] Erro inesperado ao gerar PDF:`, (pdfErr as Error).message);
                    }
                }
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err: unknown) {
        console.error(`[parcelow-webhook] Erro crítico:`, (err as Error).message);
        return new Response(JSON.stringify({ error: (err as Error).message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
