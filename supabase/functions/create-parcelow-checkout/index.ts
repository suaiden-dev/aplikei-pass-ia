import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STRIPE_PRICES: Record<string, { usd: number; name: string; dependentPrice: number }> = {
    'visto-b1-b2': { usd: 200, name: 'Guia Visto Americano B1/B2', dependentPrice: 50 },
    'visto-f1': { usd: 350, name: 'Guia Visto Americano F-1', dependentPrice: 100 },
    'extensao-status': { usd: 200, name: 'Guia Extensão de Status', dependentPrice: 100 },
    'troca-status': { usd: 350, name: 'Guia Troca de Status', dependentPrice: 100 },
};

function cleanDocumentNumber(doc: string | null | undefined): string | null {
    if (!doc) return null;
    return doc.replace(/\D/g, '');
}

serve(async (req) => {
    // 1. CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const payload = await req.json();
        console.log("[create-parcelow-checkout] Payload Recebido (v2):", JSON.stringify(payload));
        const { slug, email, fullName, phone, dependents = 0, cpf, payerInfo, paymentMethod, origin_url } = payload;

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

        // 2. Extrair preços baseando-se no slug fornecido
        let serviceName: string;
        let basePriceUSD: number;
        let depPriceUSD: number;

        const { data: product } = await supabase
            .from("visa_products")
            .select("*")
            .eq("slug", slug)
            .single();

        if (product) {
            serviceName = product.name;
            basePriceUSD = parseFloat(product.base_price_usd);
            depPriceUSD = parseFloat(product.price_per_dependent_usd);
        } else if (STRIPE_PRICES[slug]) {
            const service = STRIPE_PRICES[slug];
            serviceName = service.name;
            basePriceUSD = service.usd;
            depPriceUSD = service.dependentPrice;
        } else {
            throw new Error(`Serviço não catalogado: ${slug}`);
        }

        const subtotalUSD = basePriceUSD + (dependents * depPriceUSD);

        // -------------------------------------------------------------
        // DETECÇÃO DINÂMICA DE AMBIENTE (PRODUÇÃO VS HOMOLOGAÇÃO)
        // -------------------------------------------------------------
        const host = req.headers.get("host") || "";
        const originUrlRaw = origin_url || req.headers.get("origin") || req.headers.get("referer") || "";

        const isProductionDomain =
            originUrlRaw.includes('aplikei.com') ||
            host.includes('aplikei.com');

        const parcelowEnvironment = isProductionDomain ? 'production' : 'staging';

        // Endpoint base (Sem prefixo api/v1 conforme exemplo Migma)
        const parcelowApiUrl = parcelowEnvironment === 'staging'
            ? "https://sandbox-2.parcelow.com.br"
            : "https://app.parcelow.com";

        // Segredos de Auth
        const rawId = parcelowEnvironment === 'staging'
            ? Deno.env.get("PARCELOW_CLIENT_ID_STAGING")
            : Deno.env.get("PARCELOW_CLIENT_ID_PRODUCTION");

        const clientSecret = parcelowEnvironment === 'staging'
            ? Deno.env.get("PARCELOW_CLIENT_SECRET_STAGING")
            : Deno.env.get("PARCELOW_CLIENT_SECRET_PRODUCTION");

        // Lógica do Migma para tratar IDs Numéricos vs Hex
        let clientIdToUse: number | string = rawId || "";
        const parsedId = parseInt(rawId || "");
        if (!isNaN(parsedId) && parsedId.toString() === rawId?.trim()) {
            clientIdToUse = parsedId;
        }

        console.log(`[create-parcelow-checkout] Init: Env=${parcelowEnvironment} | ID=${clientIdToUse} | Type=${typeof clientIdToUse}`);
        // -------------------------------------------------------------

        // Determinar o pagador oficial
        const finalPayerName = payerInfo?.name || fullName;
        const finalPayerEmail = payerInfo?.email || email;
        const finalPayerCpf = cleanDocumentNumber(payerInfo?.cpf || cpf);
        const finalPayerPhone = cleanDocumentNumber(payerInfo?.phone || phone);

        // 4. Criar ordem pendente na Aplikei
        const orderUuid = crypto.randomUUID();
        const parcelowReference = `APK_${orderUuid}`;

        const { error: dbError } = await supabase
            .from("visa_orders")
            .insert({
                id: orderUuid,
                order_number: parcelowReference,
                client_name: fullName,
                client_email: email,
                product_slug: slug,
                total_price_usd: subtotalUSD,
                payment_status: "pending",
                payment_method: `parcelow_${paymentMethod || 'credit_card'}`,
                payment_metadata: {
                    dependents,
                    phone,
                    payerInfo: payerInfo || null,
                    parcelow_cpf: finalPayerCpf,
                    parcelow_phone: finalPayerPhone
                }
            });

        if (dbError) {
            console.error("[create-parcelow-checkout] ❌ Erro detalhado do DB:", JSON.stringify(dbError));
            throw new Error(`Falha ao criar registro pendente da ordem: ${dbError.message || dbError.details || 'Erro desconhecido'}`);
        }

        // 5. Enviar payload para Parcelow
        const amountInCents = Math.round(subtotalUSD * 100);

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
                    description: `Aplikei Checkout - ${serviceName}`,
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
                // 5.1 Obter Token OAuth2 (JSON conforme exemplo Migma)
                const oauthUrl = `${parcelowApiUrl}/oauth/token`;
                console.log(`[create-parcelow-checkout] Autenticando com Parcelow: ${oauthUrl}`);

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
                    console.error(`Erro auth Parcelow: ${authRes.status}`, errBody);
                    throw new Error(`Falha na autenticação Parcelow (${authRes.status}).`);
                }

                const { access_token } = await authRes.json();

                // 5.2 Criar Ordem (Rota /api/orders SEM /v1)
                const apiOrderEndpoint = `${parcelowApiUrl}/api/orders`;
                console.log(`[create-parcelow-checkout] Criando Ordem: ${apiOrderEndpoint}`);

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
                console.log(`[create-parcelow-checkout] Response Order:`, JSON.stringify(orderData));

                if (orderRes.ok && orderData.success) {
                    checkoutUrl = orderData.data?.url_checkout || checkoutUrl;
                    parcelowGenOrderId = orderData.data?.order_id?.toString() || parcelowGenOrderId;
                } else {
                    console.error(`Erro criar ordem:`, orderData);
                    throw new Error(orderData.message || "Erro ao gerar link na Parcelow.");
                }

            } catch (apiErr: any) {
                console.error("Parcelow API Error", apiErr);
                throw apiErr;
            }
        }

        // 6. Atualizar a ordem com o ID remoto
        await supabase
            .from("visa_orders")
            .update({ parcelow_order_id: parcelowGenOrderId })
            .eq("id", orderUuid);

        return new Response(JSON.stringify({ checkoutUrl, orderId: orderUuid }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (err: any) {
        console.error(`[create-parcelow-checkout] Erro:`, err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
