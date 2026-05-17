import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { corsHeaders } from "../_shared/core/http.ts";
import { applyCoupon } from "../_shared/payments/domain/fees.ts";
import {
    getSlugCandidates,
} from "../_shared/payments/domain/catalog.ts";
import { resolveCatalogPricing } from "../_shared/payments/application/resolve-catalog-pricing.ts";
import {
    cleanDocumentNumber,
    createParcelowOrder,
    resolveParcelowEnvironment,
} from "../_shared/payments/providers/parcelow.ts";
import { 
    resolveUseAplicei, 
    resolveParcelowConfig,
} from "../_shared/payments/office-payment.ts";

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
            action, serviceId, processId, proc_id, order_id, parent_service_slug, coupon_code,
            office_id
        } = payload;

        const rawSlug = String(slug || "").toLowerCase();
        const slugCandidates = getSlugCandidates(rawSlug);
        const normalizedSlug = rawSlug;

        if (!rawSlug || !email || (!cpf && !payerInfo?.cpf)) {
            console.error("[create-parcelow-checkout] Falha na validação. Dados recebidos:", { slug: normalizedSlug, email, cpf, hasPayer: !!payerInfo?.cpf });
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

        const pricing = await resolveCatalogPricing({
            supabase,
            slug: normalizedSlug,
            slugCandidates,
            officeId: office_id,
            serviceId,
        });
        const mainPriceName = pricing.mainPriceName;
        const basePriceUSD = pricing.basePriceUSD;
        const depPriceUSD = pricing.dependentPriceUSD;

        const serviceName = mainPriceName;
        const subtotalUSD = basePriceUSD + (dependents * depPriceUSD);

        // --- NOVA LÓGICA DE CUPOM (ESTENDIDA) ---
        let finalSubtotalUSD = subtotalUSD;
        let appliedCouponId = null;

        if (coupon_code) {
            const { data: couponData, error: couponError } = await supabase.rpc("validate_coupon", {
                p_code: coupon_code.toUpperCase().trim(),
                p_slug: normalizedSlug
            });

            if (!couponError && couponData?.valid) {
                const minPurchase = couponData.min_purchase_usd || 0;
                if (subtotalUSD >= minPurchase) {
                    finalSubtotalUSD = applyCoupon(subtotalUSD, couponData).finalAmount;
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
        const { name: parcelowEnvironment, apiUrl: parcelowApiUrl } =
            resolveParcelowEnvironment(req, origin_url);

        let rawId = parcelowEnvironment === 'staging'
            ? Deno.env.get("PARCELOW_CLIENT_ID_STAGING")
            : Deno.env.get("PARCELOW_CLIENT_ID_PRODUCTION");

        let clientSecret = parcelowEnvironment === 'staging'
            ? Deno.env.get("PARCELOW_CLIENT_SECRET_STAGING")
            : Deno.env.get("PARCELOW_CLIENT_SECRET_PRODUCTION");

        if (office_id) {
            const useAplicei = await resolveUseAplicei(supabase, office_id);
            if (!useAplicei) {
                const officeParcelow = await resolveParcelowConfig(supabase, office_id);
                if (officeParcelow.merchant_id && officeParcelow.api_key) {
                    rawId = officeParcelow.merchant_id;
                    clientSecret = officeParcelow.api_key;
                    console.log(`[create-parcelow-checkout] Usando credenciais do Office: ${office_id}`);
                }
            }
        }

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
                office_id: office_id || null,
                payment_metadata: {
                    ...existingMetadata,
                    dependents,
                    phone,
                    office_id: office_id || "",
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
                    product_type: normalizedSlug === 'troca-status' || normalizedSlug === 'visa-cos'
                        ? 'COS'
                        : (normalizedSlug === 'extensao-status' || normalizedSlug === 'visa-eos' ? 'EOS' : 'B1B2'),
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
                    reference: normalizedSlug,
                    description: `Aplikei Checkout - ${serviceName}${coupon_code ? ' (Com Cupom)' : ''}`,
                    quantity: 1,
                    amount: amountInCents
                }
            ],
            redirect: {
                success: `${origin_url}/checkout-success?s=s&pid=${orderUuid}&ce=${btoa(email)}`,
                failed: `${origin_url}/servicos/${normalizedSlug}`
            }
        };

        let checkoutUrl = `${origin_url}/checkout-mock/parcelow?ref=${orderUuid}`;
        let parcelowGenOrderId = `par_${crypto.randomUUID().substring(0, 16)}`;

        if (clientIdToUse && clientSecret) {
            try {
                const orderData = await createParcelowOrder({
                    apiUrl: parcelowApiUrl,
                    clientId: clientIdToUse,
                    clientSecret,
                    payload: parcelowPayload,
                });
                checkoutUrl = orderData.data?.url_checkout || checkoutUrl;
                parcelowGenOrderId = orderData.data?.order_id?.toString() || parcelowGenOrderId;

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
