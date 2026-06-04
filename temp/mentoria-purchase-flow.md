# Fluxo de Compra — Pacotes de Mentoria (Bronze / Prata / Gold)

## Visão geral

```
[Onboarding F1/B1B2 — FinalPreparationStep]
        │
        │  navigate(`/checkout/${plan.id}?proc_id=${procId}`)
        ▼
[CheckoutPage  /checkout/:slug]
        │
        │  useCheckout → paymentOps → Stripe / Parcelow / Zelle
        │  localStorage.setItem("checkout_slug", slug)
        │  localStorage.setItem("checkout_order_id", orderId)
        ▼
[Stripe / Parcelow / Zelle] ──redirect──▶ [CheckoutSuccessPage /checkout-success]
        │
        │  verifica pagamento (orders table)
        │  seedMentorshipChat → ensureChatThread
        ▼
[Dashboard / Support Chat]
        │
[useAdminChats / useCustomerChats]
        └── buildMentoriaChatTitle → "F1 - Silver", "B1B2 - Gold", …
```

---

## 1. Ponto de entrada — FinalPreparationStep

O usuário vê os cards de pacote (Bronze / Prata / Gold) **no último passo do onboarding** de visto F1 ou B1B2.

| Arquivo | Função principal |
|---|---|
| `src/features/onboarding/f1/pages/F1OnboardingPage/steps/F1FinalPreparationStep.tsx` | Step "specialist" do F1; detecta pacotes já comprados; monta os cards de plano; navega para checkout |
| `src/features/onboarding/b1b2/pages/B1B2OnboardingPage/steps/B1B2FinalPreparationStep.tsx` | Equivalente para B1B2 |

### O que acontece aqui

1. Consulta `user_services` por slugs de mentoria para checar se o usuário já comprou.
2. Lê preços de `user_service_prices` filtrado por `office_id`.
3. Ao clicar em um plano: `navigate(`/checkout/${plan.id}?proc_id=${procId}&office_id=${officeId}`)`.
   - `plan.id` é um dos slugs: `mentoring-bronze`, `mentoring-silver`, `mentoring-gold` (aliases EN).
   - `proc_id` é o `id` do processo pai (ex: o processo F1 do usuário na tabela `user_services`).
4. Se já comprou → `handleOpenSpecialistSupport()` → navega para `/dashboard/support`.

---

## 2. Rota `/checkout/:slug`

| Arquivo | Responsabilidade |
|---|---|
| `src/app/router/appRoutes.tsx` (linha ~347) | Declara a rota `"/checkout/:slug"` → `CheckoutPage` |
| `src/features/payments/pages/CheckoutPage/index.tsx` | Página de checkout com formulário; lê `?proc_id`, `?office_id` da URL |

### O que acontece aqui

1. Lê `slug` da URL e `proc_id` / `office_id` do query string.
2. Valida produto ativo para o office (`assertProductIsActiveForOffice`).
3. Usuário preenche dados (nome, email, telefone) e escolhe método (Stripe card/PIX, Parcelow, Zelle).
4. Ao confirmar:
   - Chama `useCheckout().stripe()` / `parcelow()` / `zelle()`.
   - Salva no `localStorage`:
     - `checkout_slug` → slug do produto comprado.
     - `checkout_order_id` → id do pedido criado.
     - `checkout_parent_id` → proc_id do processo pai.
   - Redireciona para URL externa (Stripe, Parcelow) ou exibe modal de confirmação Zelle.

---

## 3. Processamento do pagamento — paymentOps

| Arquivo | Função |
|---|---|
| `src/features/payments/lib/paymentOps.ts` | Todas as funções de criação de checkout e verificação |
| `src/features/payments/hooks/useCheckout.ts` | Hook wrapper que expõe `stripe`, `parcelow`, `zelle` |

### Funções chave em `paymentOps.ts`

| Função | O que faz |
|---|---|
| `preRegisterOrder()` | Insere/atualiza linha na tabela `orders` com `payment_status: "pending"`, armazenando `proc_id`, `parent_service_slug`, `coupon_code`, `office_id` em `payment_metadata` |
| `createStripeCheckout()` | Invoca Edge Function `stripe-checkout`; retorna `{ url, orderId }` |
| `createParcelowCheckout()` | Invoca Edge Function `create-parcelow-checkout`; retorna `{ url, orderId }` |
| `createZellePayment()` | Invoca Edge Function `create-zelle-payment`; chama bot N8N para verificação automática |
| `verifyStripeSession()` | Invoca Edge Function `verify-stripe-session`; retorna `{ success, orderId }` |
| `checkOrderPaymentStatus()` | Polling na tabela `orders` até encontrar status `paid/approved/succeeded` (timeout configurável) |

### Tabela `orders` (Supabase)

Campos relevantes gravados:

```
id, user_id, client_name, client_email, total_price_usd,
product_slug,          ← slug canonicalizado (ex: "mentoria-bronze")
payment_method,        ← "stripe_card" | "stripe_pix" | "parcelow" | "zelle"
payment_status,        ← "pending" → "paid" / "approved" / "succeeded"
coupon_code,
office_id,
seller_id,
payment_metadata: {
  proc_id,             ← ID do processo pai (user_services.id)
  parent_process_id,   ← mesmo valor que proc_id
  parent_service_slug, ← slug do processo pai (ex: "visto-f1")
  dependents,
  phone,
  service_id
}
```

---

## 4. Retorno após pagamento — CheckoutSuccessPage

| Arquivo | Responsabilidade |
|---|---|
| `src/features/payments/pages/CheckoutSuccessPage/index.tsx` | Página `/checkout-success`; verifica pagamento; seed do chat de mentoria |

### Fluxo interno

1. Lê `session_id` (Stripe), `order_id` / `pid`, `slug` da URL e do `localStorage`.
2. Chama `verifyStripeSession(sessionId)` se houver session_id.
3. Chama `checkOrderPaymentStatus(slug, 30000, orderId)` — polling de até 30s.
4. Se pago: chama `seedMentorshipChat(orderId, userId)`.
5. Se não pago: exibe estado de erro.

### `seedMentorshipChat` — lógica de criação do chat

```
slug recebido (ex: "mentoria-prata")
        │
        ▼
normalizeMentorshipSlug()
  "mentoria-prata"    → "mentoring-silver"
  "mentoria-bronze"   → "mentoring-bronze"
  "mentoria-individual" → "mentoring-bronze"
  "mentoria-silver"   → "mentoring-silver"
  "mentoria-gold"     → "mentoring-gold"
        │
        ▼
Busca proc_id do pai na tabela orders (orders.proc_id)
        │
        ▼
Busca user_services com service_slug IN [slug normalizado + aliases]
        │
    ┌───┴──────────────┐
    │ Encontrou row    │ Não encontrou (chat-only flow)
    │ targetProcessId  │ usa parentProcId
    └───┬──────────────┘
        │
        ▼
processService.ensureChatThread(chatProcessId, userId, mensagem inicial)
```

**Slugs reconhecidos (MENTORSHIP_SLUGS):**
`mentoring-bronze`, `mentoring-silver`, `mentoring-gold`, `mentoria-individual`,
`mentoria-bronze`, `mentoria-prata`, `mentoria-silver`, `mentoria-gold`, `consultoria-especialista`

---

## 5. Criação do chat — processOps

| Arquivo | Função |
|---|---|
| `src/features/process/services/processOps.ts` | Contém `ensureChatThread` |

### `ensureChatThread(processId, senderId, content)`

1. Verifica se já existe mensagem na conversa (`hasChatMessages`).
2. Se não existir: busca conversa ativa (tabela `conversations`) ou cria uma nova.
3. Insere mensagem inicial na tabela `conversation_messages` com `sender_role: "customer"`.

### Tabelas Supabase envolvidas

| Tabela | Uso |
|---|---|
| `conversations` | `process_id`, `office_id`, `is_closed` — uma por processo |
| `conversation_messages` | `conversation_id`, `sender_id`, `sender_role`, `content` |
| `user_services` | Processo do usuário — contém `service_slug`, `step_data`, `office_id` |

---

## 6. Exibição do chat no painel admin — useAdminChats

| Arquivo | Responsabilidade |
|---|---|
| `src/features/chat/hooks/useAdminChats.ts` | Carrega todos as conversas do admin; calcula título do chat |
| `src/features/chat/hooks/useCustomerChats.ts` | Equivalente do lado do cliente |
| `src/features/chat/services/eligibility.ts` | Funções de título e elegibilidade |

### Lógica de título (após fix)

```typescript
// caso 1: processo é diretamente uma mentoria
if (isMentoriaService(service.service_slug)) {
  const parentSlug = stepData.parent_service_slug;
  chatTitle = buildMentoriaChatTitle(service.service_slug, parentSlug);
  // ex: "mentoring-silver" + "visto-f1" → "F1 - Silver"
}

// caso 2: processo pai (F1/B1B2) com compra de mentoria em step_data.purchases
const mentoriaPurchaseSlug = purchases.find(p => isMentoriaService(p.slug));
if (mentoriaPurchaseSlug) {
  chatTitle = buildMentoriaChatTitle(mentoriaPurchaseSlug, service.service_slug);
  // ex: "mentoria-prata" + "visto-f1" → "F1 - Silver"
}

// caso 3: qualquer outro processo
chatTitle = getAnalysisChatTitle(service.service_slug);
```

### `buildMentoriaChatTitle(mentoriaSlug, parentSlug)` em `eligibility.ts`

| mentoriaSlug contém | tier |
|---|---|
| "gold" ou "ouro" | Gold |
| "silver" ou "prata" | Silver |
| qualquer outro | Bronze |

| parentSlug contém | processLabel |
|---|---|
| "b1" | B1B2 |
| "f1" | F1 |
| "troca" / "cos" | COS |
| "extensao" / "eos" | EOS |

Resultado: `"${processLabel} - ${tier}"` → ex: `"F1 - Silver"`, `"B1B2 - Gold"`.

---

## 7. Mapa de slugs (canonicais)

Definido em `src/shared/data/services.ts` → `getCanonicalSlug()`:

| Slug recebido | Canonical | Título no sistema |
|---|---|---|
| `mentoring-bronze` | `mentoria-individual` | Pacote Bronze |
| `mentoring-silver` | `mentoria-bronze` | Pacote Prata |
| `mentoring-gold` | `mentoria-gold` | Pacote Gold |
| `mentoria-prata` | `mentoria-bronze` | Pacote Prata |
| `consultancy-negative-b1b2` | `mentoria-negativa-consular` | Análise de Recusa |

> **Atenção:** o slug canônico `mentoria-bronze` tem título "Pacote Prata" (confusão histórica de nomenclatura).
> O slug `mentoring-silver` também mapeia para `mentoria-bronze`.

---

## 8. Rotas relevantes

| Rota | Componente |
|---|---|
| `/checkout/:slug` | `CheckoutPage` |
| `/checkout` | `OfficeCheckoutPage` (sem slug — via shortlink ou office) |
| `/checkout-success` | `CheckoutSuccessPage` |
| `/s/:token` | `ShortLinkPage` → decodifica token e redireciona para `/checkout` |
| `/dashboard/support` | Painel de chat do cliente |
| `/dashboard/admin/chats` | Painel de chat do admin |

---

## 9. Edge Functions (Supabase)

| Nome | Chamada por | Descrição |
|---|---|---|
| `stripe-checkout` | `createStripeCheckout` | Cria sessão Stripe e retorna URL |
| `create-parcelow-checkout` | `createParcelowCheckout` | Cria sessão Parcelow e retorna URL |
| `create-zelle-payment` | `createZellePayment` | Registra pagamento Zelle; aprova automaticamente via bot N8N |
| `validate-zelle-payment` | `approveZellePayment` / `rejectZellePayment` | Admin aprova ou rejeita Zelle manualmente |
| `verify-stripe-session` | `verifyStripeSession` | Confirma sessão Stripe e retorna orderId |

---

## 10. localStorage — chaves usadas no fluxo

| Chave | Escrita em | Lida em | Limpa em |
|---|---|---|---|
| `checkout_slug` | `CheckoutPage` ao redirecionar | `CheckoutSuccessPage` (init) | `CheckoutSuccessPage` (markAsDone) |
| `checkout_order_id` | `CheckoutPage` ao redirecionar | `CheckoutSuccessPage` (init) | `CheckoutSuccessPage` (markAsDone) |
| `checkout_parent_id` | `CheckoutPage` ao redirecionar | — | `CheckoutSuccessPage` (markAsDone) |
| `checkout_dependents` | `CheckoutPage` ao redirecionar | — | `CheckoutSuccessPage` (markAsDone) |
| `pending_payment_advance` | `COSOnboardingPage` / `RFEWorkflow` (COS recovery flows) | `CheckoutSuccessPage` (markAsDone) | `CheckoutSuccessPage` (markAsDone) |

---

## 11. Testes E2E

| Arquivo | O que testa |
|---|---|
| `tests/e2e/checkout-success.spec.ts` | Criação do chat pós-compra Bronze/Prata/Gold; título correto na sidebar ("F1 - Silver", "B1B2 - Gold") |
| `tests/e2e/cos-onboarding.spec.ts` | Todos os passos COS e EOS (0–11) |
| `tests/e2e/cos-recovery-flows.spec.ts` | Fluxos RFE e Motion no COS |
