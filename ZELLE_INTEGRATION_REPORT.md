# 📋 Relatório de Sessão de Desenvolvimento — 23/02/2026

**Projeto:** Aplikei Pass IA  
**Data:** 23 de fevereiro de 2026  
**Horário:** ~14h00 às ~21h00 (BRT)  
**Responsável:** Desenvolvedor + AI Pairing (Antigravity)

---

> **Resumo executivo:** Nesta sessão implementamos dois grandes pilares de pagamento para a plataforma Aplikei: o fluxo completo de **pagamento via Zelle** (com upload de comprovante, notificação n8n e validação manual) e a consolidação do fluxo de **pagamento via Stripe** (cartão e PIX), incluindo a **criação automática de conta do usuário** logo após o pagamento ser confirmado.

---

## 🎯 Objetivo Principal

Implementar o fluxo completo de **pagamento via Zelle** na plataforma Aplikei, com integração ao n8n para validação e processamento dos pagamentos, mantendo os padrões de naming do projeto (sem copiar nomes do projeto Migma).

---

## 📦 O que foi feito

### 1. 🗃️ Criação da Tabela `zelle_payments`

**Arquivo:** `supabase/migrations/20260223230000_zelle_payments_migma_compatibility.sql`

Criada a tabela `zelle_payments` no Supabase com o seguinte schema:

```sql
CREATE TABLE IF NOT EXISTS public.zelle_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount NUMERIC NOT NULL,
    confirmation_code TEXT,
    fee_type_global TEXT DEFAULT 'standard',
    service_slug TEXT NOT NULL,
    status TEXT DEFAULT 'pending_verification',
    image_url TEXT,
    proof_path TEXT,
    admin_notes TEXT,
    processed_by_user_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    admin_approved_at TIMESTAMPTZ
);
```

**Campos-chave explicados:**
- `amount` — Valor em USD do pagamento
- `confirmation_code` — Código de confirmação da transação Zelle
- `fee_type_global` — Tipo de taxa (padrão: `standard`)
- `proof_path` — Caminho interno no bucket do Supabase Storage
- `image_url` — URL pública completa da imagem do comprovante
- `status` — Estado do pagamento (`pending_verification`, `approved`, `rejected`)

---

### 2. 🔐 Row Level Security (RLS) na Tabela

Adicionadas políticas de segurança na tabela `zelle_payments`:

- **Usuários:** Podem visualizar apenas seus próprios pagamentos (`user_id = auth.uid()`)
- **Admins:** Acesso total (SELECT, INSERT, UPDATE, DELETE) via perfil de role `admin`

```sql
CREATE POLICY "Users can view own payments" ON public.zelle_payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access" ON public.zelle_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

---

### 3. ☁️ Configuração do Bucket de Storage `zelle_comprovantes`

**Bucket:** `zelle_comprovantes` (Supabase Storage)

Configurado como **público** (para facilitar acesso do n8n às imagens de comprovante).

**Políticas configuradas via SQL:**

```sql
-- Bucket público
UPDATE storage.buckets SET public = true WHERE id = 'zelle_comprovantes';

-- Leitura pública
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'zelle_comprovantes');

-- Upload autenticado
CREATE POLICY "Authenticated Insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'zelle_comprovantes'
    AND auth.role() = 'authenticated'
  );

-- Acesso do proprietário para delete/update
CREATE POLICY "Owner Access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'zelle_comprovantes'
    AND (auth.uid()::text = (storage.foldername(name))[1])
  );
```

**Estrutura de pastas no bucket:**
```
zelle_comprovantes/
  └── {user_id}/
        └── {timestamp}_{service_slug}.{ext}
```

---

### 4. ⚡ Edge Function: `create-zelle-payment`

**Arquivo:** `supabase/functions/create-zelle-payment/index.ts`  
**Deploy:** Versão 4 publicada  
**JWT Verify:** Desativado (JWT validado manualmente dentro da função)

**Responsabilidades:**
1. Recebe o pagamento do frontend com dados e `proof_path`
2. Valida o JWT do usuário via `supabase.auth.getUser()`
3. Monta a URL pública completa da imagem: `{SUPABASE_URL}/storage/v1/object/public/zelle_comprovantes/{proof_path}`
4. Insere o registro na tabela `zelle_payments` com `image_url` e `proof_path`
5. Envia notificação POST ao n8n via `N8N_ZELLE_WEBHOOK_URL`

**Payload enviado ao n8n:**
```json
{
  "event": "zelle_payment_created",
  "payment_id": "UUID",
  "user_id": "UUID",
  "email": "email@usuario.com",
  "amount": 350,
  "confirmation_code": null,
  "proof_path": "user_id/timestamp_slug.png",
  "image_url": "https://nkhblkilekfpqhyuhrrj.supabase.co/storage/v1/object/public/zelle_comprovantes/...",
  "service_slug": "visto-f1",
  "timestamp": "2026-02-23T23:30:42.231Z"
}
```

**Variável de ambiente usada:**
- `N8N_ZELLE_WEBHOOK_URL` → `https://nwh.suaiden.com/webhook/zelle-aplikei`

---

### 5. ⚡ Edge Function: `validate-zelle-payment`

**Arquivo:** `supabase/functions/validate-zelle-payment/index.ts`  
**Deploy:** Versão 2 publicada  
**JWT Verify:** Desativado (chamada feita pelo n8n, sem token)

**Responsabilidades:**
1. Recebe `payment_id`, `status` e `admin_notes` do n8n
2. Atualiza o registro em `zelle_payments`
3. Se `status = 'approved'`, ativa o serviço para o usuário na tabela `user_services`

**Chamada esperada pelo n8n:**
```http
POST https://nkhblkilekfpqhyuhrrj.supabase.co/functions/v1/validate-zelle-payment
Content-Type: application/json

{
  "payment_id": "9daa33e5-e7e3-45f3-b41d-61a555b56619",
  "status": "approved",
  "admin_notes": "Pagamento confirmado"
}
```

---

---

### 6. 💳 Integração Stripe: Edge Function `stripe-checkout`

**Arquivo:** `supabase/functions/stripe-checkout/index.ts`  
**Deploy:** Versão 5 publicada  
**JWT Verify:** Desativado

**Responsabilidades:**
1. Recebe os dados do formulário de checkout (slug, email, nome, telefone, dependentes, método)
2. Consulta a tabela `visa_products` para obter o preço do produto; caso não encontre, usa fallback de preços hardcoded
3. Detecta o ambiente automaticamente a partir da `origin_url` (`PROD`, `STAGING`, `TEST`) e seleciona a Stripe Secret Key correta
4. Se PIX: busca a taxa de câmbio dinâmica e aplica markup de 4% + taxas Stripe PIX
5. Se Cartão: aplica taxas de processamento Stripe (cartão USD)
6. Cria uma sessão Stripe Checkout e retorna a `url` de redirecionamento

**Detecção de ambiente:**
```typescript
const host = new URL(origin_url).hostname;
let env = 'TEST';
if (host === 'aplikei.com' || host === 'www.aplikei.com') env = 'PROD';
else if (host.includes('netlify.app')) env = 'STAGING';

const stripeSecret = Deno.env.get(`STRIPE_SECRET_KEY_${env}`) || Deno.env.get("STRIPE_SECRET_KEY");
```

**Produtos suportados com preços de fallback:**

| Slug | Preço USD | Dependente |
|---|---|---|
| `visto-b1-b2` | $200 | +$50 |
| `visto-f1` | $350 | +$100 |
| `extensao-status` | $200 | +$100 |
| `troca-status` | $350 | +$100 |

**Metadados salvos na sessão Stripe (para uso no webhook):**
```json
{
  "slug": "visto-f1",
  "email": "usuario@email.com",
  "fullName": "Nome Completo",
  "phone": "+5511999999999",
  "dependents": "0",
  "env": "TEST",
  "basePrice": "350",
  "dependentPrice": "100",
  "paymentMethod": "card",
  "netAmountUSD": "350",
  "exchange_rate": "",
  "origin_url": "http://localhost:5173"
}
```

**Correção aplicada:** Adicionado envio explícito do header `Authorization` ao invocar a função:
```typescript
const { data: { session: currentSession } } = await supabase.auth.getSession();
const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: { ... },
    headers: { Authorization: `Bearer ${currentSession?.access_token}` }
});
```

---

### 7. 🔔 Integração Stripe: Edge Function `stripe-webhook` + Criação Automática de Conta

**Arquivo:** `supabase/functions/stripe-webhook/index.ts`  
**Deploy:** Versão 6 publicada  
**JWT Verify:** Desativado (chamada vem do Stripe, não do frontend)

Esta é a função **mais crítica** da integração Stripe. Ela é chamada diretamente pelo Stripe após a confirmação do pagamento e executa **automaticamente** todo o provisionamento do serviço e conta do usuário.

**Eventos monitorados:**
- `checkout.session.completed` — Pagamento por cartão ou geração de QR PIX
- `checkout.session.async_payment_succeeded` — Confirmação assíncrona do PIX

**Fluxo completo executado pelo webhook:**

#### Passo 1 — Verificação de Duplicidade
```typescript
const { data: existingOrder } = await supabaseAdmin
    .from('visa_orders')
    .select('id, payment_status')
    .eq('stripe_session_id', session.id)
    .maybeSingle();

if (existingOrder?.payment_status === 'paid') {
    // Já processado → retorna 200 sem reprocessar
    return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

#### Passo 2 — Tratamento Especial de PIX
```typescript
// PIX gerado mas ainda não pago → aguarda evento async
if (metadata.paymentMethod === 'pix' && event.type === 'checkout.session.completed' && session.payment_status === 'unpaid') {
    return new Response(JSON.stringify({ received: true, message: "Waiting for confirmation" }), { status: 200 });
}
```

#### Passo 3 — 🔑 Criação Automática de Conta do Usuário

Este é o ponto **central** da sessão de hoje. Após um pagamento confirmado, o sistema verifica se o usuário já existe e, caso não exista, **cria a conta automaticamente via convite por e-mail**:

```typescript
// Busca perfil existente pelo e-mail
const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

if (profile) {
    userId = profile.id; // Usuário já existe
} else {
    // Usuário não existe → cria via invite
    const originUrl = metadata.origin_url || "http://localhost:5173";
    const redirectTo = `${originUrl}/auth/confirm-password`;

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
            redirectTo,             // Link no e-mail aponta para criar senha
            data: {                 // Dados pré-preenchidos no perfil
                full_name: fullName,
                phone: phone
            }
        }
    );

    if (!authError && authUser?.user) {
        userId = authUser.user.id;
    }
}
```

**O que acontece com o usuário:**
1. Recebe um **e-mail de convite** do Supabase
2. Clica no link → vai para `/auth/confirm-password`
3. Define sua senha e fica com a conta ativa
4. Já entra no dashboard com o serviço disponível

#### Passo 4 — Registro do Pedido (`visa_orders`)
```typescript
await supabaseAdmin.from('visa_orders').upsert({
    stripe_session_id: session.id,
    user_id: userId,
    client_name: fullName,
    client_email: email,
    product_slug: slug,
    total_price_usd: totalUSD,
    total_price_brl: totalBRL,         // Calculado se PIX
    exchange_rate: appliedExchangeRate, // Taxa aplicada no ato
    payment_status: 'paid',
    payment_method: 'stripe_card' | 'stripe_pix',
    payment_metadata: { ...metadata, stripe_id: session.id, event_type }
}, { onConflict: 'stripe_session_id' });
```

#### Passo 5 — Ativação do Serviço (`user_services`)
```typescript
await supabaseAdmin.from('user_services').insert({
    user_id: userId,
    service_slug: slug,
    status: 'active'
});
```

Assim que o registro é criado em `user_services`, o usuário já tem acesso ao guia no dashboard.

**Autenticação do webhook:**
```typescript
const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret!);
```
O Stripe assina cada requisição; a assinatura é validada para garantir que é realmente o Stripe enviando.

---

### 8. 🖥️ Frontend: `ZellePaymentModal.tsx`

**Arquivo:** `src/components/checkout/ZellePaymentModal.tsx`

**Funcionalidades:**
- Modal com instruções de pagamento Zelle (e-mail: `admin@suaiden.com`, Nome: `Suaiden LLC`)
- Campo de data do pagamento
- Upload de comprovante (imagem)
- Estado de loading com feedback visual

**Fluxo do frontend:**
1. Usuário faz upload da imagem direto para o bucket `zelle_comprovantes`
2. Modalidade de chamada: `supabase.storage.from('zelle_comprovantes').upload(filePath, file)`
3. Chama a Edge Function `create-zelle-payment` com o `proof_path` retornado

**Correção aplicada:** Adicionado envio explícito do header `Authorization: Bearer {access_token}` na chamada para a Edge Function:

```typescript
const { data: { session: currentSession } } = await supabase.auth.getSession();

const { data, error: functionError } = await supabase.functions.invoke('create-zelle-payment', {
    body: { amount, payment_date, proof_path, service_slug, ... },
    headers: {
        Authorization: `Bearer ${currentSession?.access_token}`
    }
});
```

---

### 7. 🛒 Frontend: `Checkout.tsx`

**Arquivo:** `src/pages/Checkout.tsx`

**Alterações realizadas:**
1. **Renomeação de estado:** `isSubmitting` → `isProcessing` para evitar conflito de escopo e clareza
2. **Header explícito:** Envio do token de autenticação ao invocar a função `stripe-checkout`:

```typescript
const { data: { session: currentSession } } = await supabase.auth.getSession();

const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: { slug, email, fullName, phone, dependents, origin_url, paymentMethod },
    headers: {
        Authorization: `Bearer ${currentSession?.access_token}`
    }
});
```

3. **Fluxo Zelle:** Ao selecionar Zelle + clicar em "Finalizar", abre o `ZellePaymentModal`
4. **Pós-pagamento:** Redirect para `/checkout-success?status=pending`

---

### 8. 🔧 Variáveis de Ambiente Configuradas no Supabase

| Variável | Valor |
|---|---|
| `SUPABASE_URL` | `https://nkhblkilekfpqhyuhrrj.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `(service role key)` |
| `N8N_ZELLE_WEBHOOK_URL` | `https://nwh.suaiden.com/webhook/zelle-aplikei` |

---

### 9. 🔄 Integração com n8n

**Webhook URL:** `https://nwh.suaiden.com/webhook/zelle-aplikei`

**Confirmação:** O n8n recebeu o payload com sucesso (log capturado durante teste real):

```json
{
  "body": {
    "event": "zelle_payment_created",
    "payment_id": "9daa33e5-e7e3-45f3-b41d-61a555b56619",
    "user_id": "c750c150-e91f-429c-994f-edd173c2ffd5",
    "email": "touda3869@uorak.com",
    "amount": 350,
    "proof_path": "c750c150-.../1771889444612_visto-f1.png",
    "service_slug": "visto-f1",
    "timestamp": "2026-02-23T23:30:42.231Z"
  }
}
```

**Erro encontrado e corrigido no n8n:**
- O nó "HTTP Request" estava tentando ler `image_url` do webhook, mas o campo não estava sendo enviado pela Edge Function.
- **Solução:** Atualizada a Edge Function para gerar e enviar `image_url` (URL pública completa do arquivo no bucket).
- **Expressão correta a usar no n8n:**
  ```
  {{ $json.body.image_url }}
  ```

---

## 🐛 Bugs Resolvidos

| Bug | Causa | Solução |
|---|---|---|
| `401 Unauthorized` na `create-zelle-payment` | Token JWT não estava sendo enviado corretamente do frontend | Adicionado header `Authorization` explícito no `invoke()` |
| `401 Unauthorized` na `stripe-checkout` (intermitente) | Idem anterior | Idem |
| `URL parameter must be string, got undefined` no n8n | Campo `image_url` ausente no payload enviado ao webhook | Edge Function atualizada para calcular e enviar `image_url` |
| Upload falhou com erro de permissão no bucket | Bucket estava configurado como privado | Bucket alterado para público + políticas de acesso recriadas |
| `ReferenceError: isSubmitting is not defined` (console) | Nome de variável potencialmente conflitante | Renomeado para `isProcessing` |

---

## 📁 Arquivos Modificados/Criados

| Arquivo | Tipo | Ação |
|---|---|---|
| `supabase/migrations/20260223230000_zelle_payments_migma_compatibility.sql` | SQL | ✅ Criado |
| `supabase/functions/create-zelle-payment/index.ts` | Edge Function (Deno) | ✅ Criado + Atualizado (v4) |
| `supabase/functions/validate-zelle-payment/index.ts` | Edge Function (Deno) | ✅ Criado (v2) |
| `supabase/functions/stripe-checkout/index.ts` | Edge Function (Deno) | ✅ Atualizado (v5) |
| `supabase/functions/stripe-webhook/index.ts` | Edge Function (Deno) | ✅ Atualizado (v6) |
| `src/components/checkout/ZellePaymentModal.tsx` | React TSX | ✅ Criado + Atualizado |
| `src/pages/Checkout.tsx` | React TSX | ✅ Atualizado |

---

## 🏗️ Arquitetura do Fluxo Zelle

#### Fluxo Zelle:
```
[Usuário]
    |
    | 1. Seleciona Zelle + Clica em Finalizar
    v
[Checkout.tsx] → abre ZellePaymentModal
    |
    | 2. Upload do comprovante
    v
[Supabase Storage] ← zelle_comprovantes/{user_id}/{timestamp}_{slug}.png
    |
    | 3. Chama Edge Function com proof_path + JWT token
    v
[create-zelle-payment Edge Function]
    |
    | 4a. Valida JWT
    | 4b. Monta image_url pública
    | 4c. INSERT em zelle_payments {status: 'pending_verification'}
    | 4d. POST → n8n webhook
    v
[n8n Workflow - zelle-aplikei]
    |
    | 5. Processa, analisa comprovante, verifica duplicata
    |
    | 6. POST para validate-zelle-payment
    v
[validate-zelle-payment Edge Function]
    |
    | 7a. UPDATE zelle_payments {status: 'approved'/'rejected'}
    | 7b. Se aprovado → INSERT em user_services
    v
[Usuário] ← Recebe acesso ao serviço contratado
```

#### Fluxo Stripe (Cartão e PIX) + Criação Automática de Conta:
```
[Usuário]
    |
    | 1. Preenche checkout → Stripe ou Stripe PIX
    v
[Checkout.tsx]
    |
    | 2. POST para stripe-checkout Edge Function
    v
[stripe-checkout Edge Function]
    |
    | 3a. Detecta ambiente (PROD/STAGING/TEST)
    | 3b. Calcula preço (+ taxas card ou PIX com câmbio dinâmico)
    | 3c. Cria sessão Stripe com metadados do usuário
    | 3d. Retorna URL de checkout
    v
[Stripe Checkout] ← Usuário paga com cartão ou PIX
    |
    | 4. Stripe confirma pagamento
    | Evento: checkout.session.completed
    |      OU checkout.session.async_payment_succeeded (PIX)
    v
[stripe-webhook Edge Function]
    |
    | 5a. Valida assinatura do Stripe
    | 5b. Verifica duplicidade (idempotência)
    |
    | 6. Busca usuário por e-mail em 'profiles'
    |    ┌─ Existe? → usa userId existente
    |    └─ Não existe? → cria conta via inviteUserByEmail()
    |                      ↳ Usuário recebe e-mail com link
    |                      ↳ Define senha em /auth/confirm-password
    |
    | 7. Upsert em visa_orders {payment_status: 'paid'}
    | 8. INSERT em user_services {status: 'active'}
    v
[Dashboard do Usuário] ← Serviço já disponível imediatamente
```

---

## 🔗 Referências Técnicas

- **Supabase Project ID:** `nkhblkilekfpqhyuhrrj`
- **n8n Webhook:** `https://nwh.suaiden.com/webhook/zelle-aplikei`
- **Bucket Storage:** `zelle_comprovantes` (público)
- **Tabela BD:** `public.zelle_payments`
- **Edge Functions deployadas:**
  - `create-zelle-payment` — versão 4
  - `validate-zelle-payment` — versão 2

---

## ✅ Status Final

| Item | Status |
|---|---|
| Tabela `zelle_payments` | ✅ Criada e migrada |
| Bucket `zelle_comprovantes` | ✅ Público + Políticas configuradas |
| Edge Function `create-zelle-payment` | ✅ Deployada (v4) |
| Edge Function `validate-zelle-payment` | ✅ Deployada (v2) |
| Edge Function `stripe-checkout` | ✅ Deployada (v5) |
| Edge Function `stripe-webhook` | ✅ Deployada (v6) |
| Modal de pagamento Zelle no frontend | ✅ Funcionando |
| Chamada Stripe Checkout no frontend | ✅ Funcionando |
| Webhook recebendo dados no n8n | ✅ Confirmado com teste real |
| `image_url` sendo enviada ao n8n | ✅ Corrigido (v4 da função) |
| Erros 401 nos invoices corrigidos | ✅ |
| Criação automática de conta pós-pagamento Stripe | ✅ Funcionando |
| Ativação automática de serviço pós-pagamento | ✅ Funcionando (Stripe e Zelle) |

---

*Relatório gerado em 23/02/2026 — Sessão de Desenvolvimento Aplikei Pass IA*
