import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-customer-auth",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const n8nWebhookUrl = Deno.env.get("N8N_ZELLE_WEBHOOK_URL");

        if (!supabaseUrl || !supabaseKey) throw new Error("Supabase configuration missing.");

        const supabase = createClient(supabaseUrl, supabaseKey);

        const authHeader = req.headers.get("X-Customer-Auth") || req.headers.get("Authorization");
        let userId: string | null = null;
        
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.replace("Bearer ", "").trim();
            // Evita erro 401 caso o token seja uma string vazia, "null" ou "undefined" (comum em guest sessions)
            if (token && token !== "null" && token !== "undefined" && token !== "" && token !== supabaseKey) {
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
            coupon_code,
            dependents // <--- ADICIONADO dependents
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
            const { data: currentOrder } = await supabase.from("orders").select("payment_metadata").eq("id", visa_order_id).single();
            const updatedMetadata = {
                ...(currentOrder?.payment_metadata || {}),
                coupon_code: finalCouponCode || "",
                discount_amount: discountAmount.toString(),
                dependents: dependents || 0 // <--- ADICIONADO dependents
            };

            await supabase
                .from("orders")
                .update({
                    payment_method: "zelle",
                    payment_metadata: updatedMetadata,
                    ...(contract_selfie_url ? { contract_selfie_url } : {}),
                    ...(terms_accepted_at ? { terms_accepted_at } : {}),
                    ...(client_ip ? { client_ip } : {}),
                })
                .eq("id", visa_order_id);
        }

        // ── NOTIFICAÇÃO PARA O ADMIN (Sempre que um Zelle é criado) ─────────────────
        try {
            await supabase.from("notifications").insert({
                type: "client_action",
                target_role: "admin",
                user_id: userId || null,
                service_id: null,
                title: "💰 Novo pagamento Zelle submetido",
                message: `Um novo pagamento de $${amount} via Zelle foi submetido e aguarda verificação manual no painel.`,
                send_email: true,
                metadata: {
                    payment_id: payment.id,
                    amount: amount
                }
            });
        } catch (notifError) {
            console.error("Failed to insert admin notification:", notifError);
        }

        return new Response(JSON.stringify({
            success: true,
            payment_id: payment.id,
            auto_approved: false
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
