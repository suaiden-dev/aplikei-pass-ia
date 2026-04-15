import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const n8nWebhookUrl = Deno.env.get("N8N_ZELLE_WEBHOOK_URL");

        if (!supabaseUrl || !supabaseKey) throw new Error("Supabase configuration missing.");

        const supabase = createClient(supabaseUrl, supabaseKey);

        const authHeader = req.headers.get("Authorization");
        let userId: string | null = null;
        
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.replace("Bearer ", "").trim();
            // Evita erro 401 caso o token seja uma string vazia, "null" ou "undefined" (comum em guest sessions)
            if (token && token !== "null" && token !== "undefined" && token !== "") {
                try {
                    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
                    if (!authError && user) {
                        userId = user.id;
                    }
                } catch (e) {
                    console.warn("[Auth] Skip user retrieval due to invalid/expired JWT:", e.message);
                    // Não lançamos erro aqui para permitir Guest Checkout
                }
            }
        }

        const {
            amount,
            confirmation_code,
            payment_date,
            recipient_name,
            recipient_email,
            proof_path,
            service_slug,
            visa_order_id,
            contract_selfie_url,
            terms_accepted_at,
            guest_email,
            guest_name,
            coupon_code // <--- ADICIONADO coupon_code
        } = await req.json();

        const actualPaymentDate = payment_date || new Date().toISOString().split('T')[0];
        const imageUrl = `${supabaseUrl}/storage/v1/object/public/zelle_comprovantes/${proof_path}`;

        // --- NOVA LÓGICA DE CUPOM PARA ZELLE ---
        let discountAmount = 0;
        let finalCouponCode = coupon_code || null;

        if (coupon_code) {
           const { data: couponData, error: couponError } = await supabase.rpc("validate_coupon", {
                p_code: coupon_code.toUpperCase().trim(),
                p_slug: service_slug
            });

            if (!couponError && couponData?.valid) {
                 // Nota: No Zelle o valor 'amount' enviado pelo frontend já deve estar com desconto.
                 // Aqui apenas registramos para auditoria do admin.
                 if (couponData.discount_type === "percentage") {
                     // Cálculo apenas informativo
                     console.log(`[Zelle Coupon] Cupom ${coupon_code} identificado (Porcentagem).`);
                 } else {
                     discountAmount = couponData.discount_value;
                     console.log(`[Zelle Coupon] Cupom ${coupon_code} identificado (Valor Fixo: $${discountAmount}).`);
                 }
            } else {
                console.warn(`[Zelle Coupon] Cupom ${coupon_code} inválido ou não aplicado.`);
                finalCouponCode = null;
            }
        }

        // Insere o pagamento Zelle no banco
        const { data: payment, error: dbError } = await supabase
            .from("zelle_payments")
            .insert({
                user_id: userId,
                guest_email: guest_email || null,
                guest_name: guest_name || null,
                amount, // Valor total enviado pelo usuário
                confirmation_code: confirmation_code || null,
                payment_date: actualPaymentDate,
                recipient_name: recipient_name || null,
                recipient_email: recipient_email || null,
                proof_path,
                image_url: imageUrl,
                service_slug,
                status: 'pending_verification',
                visa_order_id: visa_order_id || null,
            })
            .select("id")
            .single();

        if (dbError) throw dbError;

        // Atualiza a visa_order com os dados de contrato e tracking do cupom
        if (visa_order_id) {
            const client_ip = req.headers.get("x-forwarded-for")
                || req.headers.get("cf-connecting-ip")
                || null;
            
            // Busca metadados atuais para não sobrescrever
            const { data: currentOrder } = await supabase.from("visa_orders").select("payment_metadata").eq("id", visa_order_id).single();
            const updatedMetadata = {
                ...(currentOrder?.payment_metadata || {}),
                coupon_code: finalCouponCode || "",
                discount_amount: discountAmount.toString()
            };

            await supabase
                .from("visa_orders")
                .update({
                    payment_method: "zelle",
                    payment_metadata: updatedMetadata,
                    ...(contract_selfie_url ? { contract_selfie_url } : {}),
                    ...(terms_accepted_at ? { terms_accepted_at } : {}),
                    ...(client_ip ? { client_ip } : {}),
                })
                .eq("id", visa_order_id);
        }

        // ──────────────────────────────────────────────────────────────
        // NOTIFICA O N8N E PROCESSA A RESPOSTA
        // ──────────────────────────────────────────────────────────────
        // O N8N vai receber o evento e retornar { approved: true } ou { approved: false }
        // - approved: true  → aprova automaticamente
        // - approved: false → mantém pending_verification para revisão manual do admin
        // ──────────────────────────────────────────────────────────────
        const N8N_WEBHOOK_URL = "https://nwh.suaiden.com/webhook/zelle-aplikei";
        
        let n8nApproved: boolean | null = null;
        const startTime = performance.now();
        console.log(`[n8n] Requesting verification for payment ${payment.id}...`);

        try {
            const callbackUrl = `${supabaseUrl}/functions/v1/validate-zelle-payment`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
            
            const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    event: "zelle_payment_created",
                    payment_id: payment.id,
                    email: guest_email || null,
                    amount,
                    user_id: userId,
                    service_slug,
                    image_url: imageUrl,
                    callback_url: callbackUrl
                })
            });

            clearTimeout(timeoutId);
            const duration = (performance.now() - startTime).toFixed(0);

            if (n8nResponse.ok) {
                const n8nData = await n8nResponse.json().catch(() => null);
                console.log(`[n8n] Response received in ${duration}ms:`, n8nData);
                if (n8nData && typeof n8nData.approved === "boolean") {
                    n8nApproved = n8nData.approved;
                }
            } else {
                console.warn(`[n8n] Error response (${n8nResponse.status}) in ${duration}ms`);
            }
        } catch (n8nError) {
            const duration = (performance.now() - startTime).toFixed(0);
            if (n8nError.name === "AbortError") {
                console.error(`[n8n] Timeout after ${duration}ms. Skipping sync approval.`);
            } else {
                console.error(`[n8n] Connection failed after ${duration}ms:`, n8nError.message);
            }
        }

        // ── Processa resultado do N8N ─────────────────────────────────
        if (n8nApproved === true) {
            // AUTO-APROVAÇÃO: n8n confirmou o pagamento
            await supabase.from("zelle_payments")
                .update({ status: "approved", admin_notes: "Aprovado automaticamente via n8n" })
                .eq("id", payment.id);

            // Ativa a order vinculada
            if (visa_order_id) {
                await supabase.from("visa_orders")
                    .update({ payment_status: "succeeded" })
                    .eq("id", visa_order_id);
            }

            // Notifica o cliente
            if (userId) {
                await supabase.from("notifications").insert({
                    type: "admin_action",
                    target_role: "client",
                    user_id: userId,
                    service_id: null,
                    title: "✅ Pagamento Zelle confirmado!",
                    message: `Seu pagamento de $${amount} foi verificado e aprovado automaticamente. Seu serviço já está ativo.`,
                    send_email: true
                });
            }
        } else if (n8nApproved === false) {
            // N8N REJEITOU: mantém pending_verification e anota para o admin
            await supabase.from("zelle_payments")
                .update({ admin_notes: "Verificação automática negada pelo n8n. Aguarda revisão manual." })
                .eq("id", payment.id);
        }
        // Se n8nApproved === null (n8n não respondeu ou falhou), mantém pending_verification
        // e cria notificação para o admin revisar manualmente
        
        // Notifica Admin (sempre — seja aprovação manual ou para monitoramento)
        try {
            const adminTitle = n8nApproved === true
                ? "✅ Pagamento Zelle aprovado automaticamente"
                : n8nApproved === false
                    ? "⚠️ Pagamento Zelle negado pelo n8n — revisão manual necessária"
                    : "💰 Novo pagamento Zelle aguardando verificação";

            const adminMessage = n8nApproved === true
                ? `Pagamento de $${amount} foi aprovado automaticamente via n8n.`
                : n8nApproved === false
                    ? `Pagamento de $${amount} não passou na verificação do n8n. Revise manualmente.`
                    : `Pagamento de $${amount} submetido. O n8n não respondeu — verifique manualmente.`;

            await supabase.from("notifications").insert({
                type: "client_action",
                target_role: "admin",
                user_id: userId || null,
                service_id: null,
                title: adminTitle,
                message: adminMessage,
                send_email: false
            });
        } catch (notifError) {
            console.error("Failed to insert admin notification:", notifError);
        }

        return new Response(JSON.stringify({
            success: true,
            payment_id: payment.id,
            auto_approved: n8nApproved === true
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (err: any) {
        console.error("Zelle Payment Error:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
