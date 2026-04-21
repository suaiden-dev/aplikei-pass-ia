/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-customer-auth",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Mapeamento de dependentes por serviço
const DEPENDENT_SERVICE_MAP: Record<string, string> = {
    'visto-b1-b2': 'dependente-b1-b2',
    'visto-f1': 'dependente-estudante',
    'extensao-status': 'dependente-estudante',
    'troca-status': 'dependente-estudante',
};

function cleanDocumentNumber(doc: string | null | undefined): string | null {
    if (!doc) return null;
    return doc.replace(/\D/g, '');
}

Deno.serve(async (req: Request) => {
    // 1. CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const payload = await req.json();
        console.log("[create-parcelow-checkout] Payload Recebido (v2):", JSON.stringify(payload));
        const {
            slug, email, fullName, phone, dependents = 0,
            cpf, payerInfo, paymentMethod, origin_url,
            action, serviceId, processId, proc_id, order_id, parent_service_slug, coupon_code
        } = payload;

        if (!slug || !email || (!cpf && !payerInfo?.cpf)) {
            console.error("[create-parcelow-checkout] Falha na validação. Dados recebidos:", { slug, email, cpf, hasPayer: !!payerInfo?.cpf });
            throw new Error("Parâmetros obrigatórios ausentes (slug, email ou CPF do pagador). [V2]");
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // 2. Buscar preços na nova tabela services_prices
        const dependentId = DEPENDENT_SERVICE_MAP[slug] || 'dependente-b1-b2';
        const { data: dbPrices, error: dbError } = await supabase
            .from("services_prices")
            .select("service_id, name, price")
            .in("service_id", [slug, dependentId]);

        // Fallback catalog
        const FALLBACK_PRICES: Record<string, { name: string; price: number }> = {
            'analise-especialista-cos': { name: 'Análise de Especialista (COS)', price: 50 },
            'analise-especialista-eos': { name: 'Análise de Especialista (EOS)', price: 50 },
            'motion-reconsideracao-cos': { name: 'Motion para Reconsideração (COS)', price: 150 },
            'motion-reconsideracao-eos': { name: 'Motion para Reconsideração (EOS)', price: 150 },
            'rfe-support': { name: 'Apoio Técnico ao RFE', price: 497 },
            'suporte-rfe-eos': { name: 'Suporte ao RFE (EOS)', price: 497 },
            'suporte-rfe-cos': { name: 'Apoio ao RFE (Troca de Status)', price: 497 },
            'recovery-eos': { name: 'Recuperação de Caso - Motion (EOS)', price: 897 },
            'recovery-cos': { name: 'Recuperação de Caso - Motion (Troca de Status)', price: 897 },
            'motion-support': { name: 'Motion de Reconsideração', price: 897 },
        };

        let mainPriceInfo = dbPrices?.find(p => p.service_id === slug);
        if (!mainPriceInfo && FALLBACK_PRICES[slug]) {
            mainPriceInfo = { service_id: slug, ...FALLBACK_PRICES[slug] };
        }

        if (!mainPriceInfo) {
            console.error("[parcelow-checkout] Serviço não encontrado:", slug);
            throw new Error(`Serviço não encontrado no catálogo: ${slug}`);
        }

        const depPriceInfo = dbPrices?.find(p => p.service_id === dependentId);

        const serviceName = mainPriceInfo.name;
        const basePriceUSD = Number(mainPriceInfo.price);
        const depPriceUSD = depPriceInfo ? Number(depPriceInfo.price) : 0;

        const subtotalUSD = basePriceUSD + (dependents * depPriceUSD);

        // --- NOVA LÓGICA DE CUPOM (ESTENDIDA) ---
        let finalSubtotalUSD = subtotalUSD;
        let appliedCouponId = null;

        if (coupon_code) {
            const { data: couponData, error: couponError } = await supabase.rpc("validate_coupon", {
                p_code: coupon_code.toUpperCase().trim(),
                p_slug: slug
            });

            if (!couponError && couponData?.valid) {
                const minPurchase = couponData.min_purchase_usd || 0;
                if (subtotalUSD >= minPurchase) {
                    if (couponData.discount_type === "percentage") {
                        finalSubtotalUSD = Math.max(0, subtotalUSD * (1 - (couponData.discount_value / 100)));
                    } else {
                        finalSubtotalUSD = Math.max(0, subtotalUSD - couponData.discount_value);
                    }
                    appliedCouponId = couponData.coupon_id;
                    console.log(`[Coupon Parcelow] Aplicado ${coupon_code}: $${subtotalUSD} -> $${finalSubtotalUSD}`);
                }
            } else if (couponError) {
                console.error("[Coupon Parcelow] Erro na validação:", couponError);
            }
        }

        // -------------------------------------------------------------
        // DETECÇÃO DINÂMICA DE AMBIENTE (PRODUÇÃO VS HOMOLOGAÇÃO)
        // -------------------------------------------------------------
        const host = req.headers.get("host") || "";
        const originUrlRaw = origin_url || req.headers.get("origin") || req.headers.get("referer") || "";

        const isProductionDomain =
            originUrlRaw.includes('aplikei.com') ||
            host.includes('aplikei.com');

        const parcelowEnvironment = isProductionDomain ? 'production' : 'staging';

        const parcelowApiUrl = parcelowEnvironment === 'staging'
            ? "https://sandbox-2.parcelow.com.br"
            : "https://app.parcelow.com";

        const rawId = parcelowEnvironment === 'staging'
            ? Deno.env.get("PARCELOW_CLIENT_ID_STAGING")
            : Deno.env.get("PARCELOW_CLIENT_ID_PRODUCTION");

        const clientSecret = parcelowEnvironment === 'staging'
            ? Deno.env.get("PARCELOW_CLIENT_SECRET_STAGING")
            : Deno.env.get("PARCELOW_CLIENT_SECRET_PRODUCTION");

        let clientIdToUse: number | string = rawId || "";
        const parsedId = parseInt(rawId || "");
        if (!isNaN(parsedId) && parsedId.toString() === rawId?.trim()) {
            clientIdToUse = parsedId;
        }

        console.log(`[create-parcelow-checkout] Init: Env=${parcelowEnvironment} | ID=${clientIdToUse}`);

        // Determinar o pagador oficial
        const finalPayerName = payerInfo?.name || fullName;
        const finalPayerEmail = payerInfo?.email || email;
        const finalPayerCpf = cleanDocumentNumber(payerInfo?.cpf || cpf);
        const finalPayerPhone = cleanDocumentNumber(payerInfo?.phone || phone);

        // 4. Atualizar ordem pré-criada pelo service (nunca inserir aqui)
        const orderUuid = order_id;
        if (!orderUuid) {
            throw new Error("order_id é obrigatório. A ordem deve ser pré-criada pelo service antes de chamar esta função.");
        }
        const parcelowReference = `APK_${orderUuid}`;

        const { data: existingOrder } = await supabase
            .from("orders")
            .select("payment_metadata")
            .eq("id", orderUuid)
            .maybeSingle();

        const existingMetadata = existingOrder?.payment_metadata || {};
        const targetProcId = proc_id || processId || existingMetadata.proc_id || existingMetadata.parent_process_id || "";
        const parentServiceSlug = parent_service_slug || existingMetadata.parent_service_slug || "";

        const { error: orderError } = await supabase
            .from("orders")
            .update({
                order_number: parcelowReference,
                total_price_usd: finalSubtotalUSD,
                payment_method: `parcelow_${paymentMethod || 'credit_card'}`,
                payment_metadata: {
                    ...existingMetadata,
                    dependents,
                    phone,
                    payerInfo: payerInfo || null,
                    parcelow_cpf: finalPayerCpf,
                    parcelow_phone: finalPayerPhone,
                    action: action || "",
                    serviceId: serviceId || "",
                    proc_id: targetProcId,
                    parent_process_id: targetProcId,
                    processId: targetProcId,
                    parent_service_slug: parentServiceSlug,
                    coupon_code: coupon_code || "",
                    applied_coupon_id: appliedCouponId || "",
                    original_subtotal: subtotalUSD.toString(),
                    discount_amount: (subtotalUSD - finalSubtotalUSD).toString(),
                    product_type: slug === 'troca-status' ? 'COS' : (slug === 'extensao-status' ? 'EOS' : 'B1B2'),
                }
            })
            .eq("id", orderUuid);

        if (orderError) {
            console.error("[create-parcelow-checkout] ❌ Erro detalhado do DB:", JSON.stringify(orderError));
            throw new Error(`Falha ao criar registro pendente da ordem: ${orderError.message || orderError.details || 'Erro desconhecido'}`);
        }

        // 5. Enviar payload para Parcelow
        const amountInCents = Math.round(finalSubtotalUSD * 100); // <--- USA VALOR COM DESCONTO

        const parcelowPayload = {
            reference: parcelowReference,
            client: {
                cpf: finalPayerCpf,
                name: finalPayerName,
                email: finalPayerEmail,
                phone: finalPayerPhone || undefined
            },
            items: [
                {
                    reference: slug,
                    description: `Aplikei Checkout - ${serviceName}${coupon_code ? ' (Com Cupom)' : ''}`,
                    quantity: 1,
                    amount: amountInCents
                }
            ],
            redirect: {
                success: `${origin_url}/checkout-success?s=s&pid=${orderUuid}&ce=${btoa(email)}`,
                failed: `${origin_url}/servicos/${slug}`
            }
        };

        let checkoutUrl = `${origin_url}/checkout-mock/parcelow?ref=${orderUuid}`;
        let parcelowGenOrderId = `par_${crypto.randomUUID().substring(0, 16)}`;

        if (clientIdToUse && clientSecret) {
            try {
                // 5.1 Obter Token OAuth2
                const oauthUrl = `${parcelowApiUrl}/oauth/token`;
                const authRes = await fetch(oauthUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        client_id: clientIdToUse,
                        client_secret: clientSecret,
                        grant_type: "client_credentials"
                    })
                });

                if (!authRes.ok) {
                    const errBody = await authRes.text();
                    throw new Error(`Falha na autenticação Parcelow (${authRes.status}).`);
                }

                const { access_token } = await authRes.json();

                // 5.2 Criar Ordem
                const apiOrderEndpoint = `${parcelowApiUrl}/api/orders`;
                const orderRes = await fetch(apiOrderEndpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(parcelowPayload)
                });

                const orderData = await orderRes.json();
                if (orderRes.ok && orderData.success) {
                    checkoutUrl = orderData.data?.url_checkout || checkoutUrl;
                    parcelowGenOrderId = orderData.data?.order_id?.toString() || parcelowGenOrderId;
                } else {
                    throw new Error(orderData.message || "Erro ao gerar link na Parcelow.");
                }

            } catch (apiErr: unknown) {
                console.error("Parcelow API Error", apiErr);
                throw apiErr;
            }
        }

        // 6. Atualizar a ordem com o ID remoto
        await supabase
            .from("orders")
            .update({ parcelow_order_id: parcelowGenOrderId })
            .eq("id", orderUuid);

        return new Response(JSON.stringify({ checkoutUrl, orderId: orderUuid }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (err: unknown) {
        const error = err as Error;
        console.error(`[create-parcelow-checkout] Erro:`, error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
