# Relatório De Desenvolvimento (Hoje - 03/06/2026)

**Contexto analisado:**

- Repositório: `/home/vileladev/Projects/aplikei`
- Branch atual: `task-anderson_vilela`
- Autor Git configurado: Anderson-Vilela-op `<andersonlucash.al@gmail.com>`
- Janela considerada: 2026-06-03 00:00:00 até 2026-06-03 23:59:59 (-0300)

---

## 1. Resumo Executivo

Dois commits realizados hoje. Foi um dia de alta volumetria técnica, cobrindo seis eixos principais:

- migração completa e estabilização do sistema de notificações para arquitetura de duas tabelas;
- refatoração modular do Stripe checkout em edge functions;
- correção completa do fluxo de chat dos pacotes de mentoria (títulos, criação, roteamento);
- melhorias de UX no painel admin (copy de e-mail, filtros de processo);
- novos testes E2E cobrindo o fluxo de compra Bronze/Prata/Gold;
- novas migrações de banco de dados estabilizando o schema de notificações.

**Totais (excluindo test-results):**

- 95 arquivos modificados/criados/deletados
- +6920 linhas adicionadas / -3246 linhas removidas
- 2 commits de sua autoria

---

## 2. Commits De Hoje (Sua Autoria)

| Hash | Horário | Mensagem |
|---|---|---|
| `ebeb5b1` | 13:20 -0300 | `feat: refactore products and notifications` |
| `8384cb0` | 21:00 -0300 | `fix` |

---

## 3. Alterações Por Tema

### 3.1 — Sistema de Notificações (migração + estabilização)

Continuação e estabilização da migração do schema de notificações para `notifications_messages` (1 mensagem) + `notifications_groups` (N destinatários), iniciada em 02/06.

**Arquivos modificados:**

- `src/app/providers/NotificationProvider.tsx` (+2)
  - Campos `category` e `action` do grupo agora propagados para o `ToastItem`

- `src/app/i18n/locales/en/notifications.ts` / `es/` / `pt/` (+4 em cada)
  - Novos templates adicionados ao namespace (cobertura de category+action)

- `src/features/notifications/types.ts` (+2)
  - Interface `ToastItem` recebe campos opcionais `category` e `action` para roteamento de ícone/label

**Edge functions — novas migrações:**

- `supabase/migrations/20260603120000_add_target_to_notifications_messages.sql` (novo)
  - Adiciona coluna `target` em `notifications_messages`

- `supabase/migrations/20260603130000_notifications_groups_realtime.sql` (novo)
  - Habilita Realtime na tabela `notifications_groups`

- `supabase/migrations/20260603140000_add_requested_by_to_office_withdrawals.sql` (novo)
  - Adiciona `requested_by` em saques do office

- `supabase/migrations/20260603150000_drop_old_notifications_table.sql` (novo)
  - Remove tabela legada `notifications`

- `supabase/migrations/20260603160000_notifications_messages_drop_title_body.sql` (novo)
  - Remove campos `title` e `body` redundantes de `notifications_messages` (migrados para `notifications_groups`)

---

### 3.2 — Stripe Checkout: Refatoração Modular das Edge Functions

Refatoração do checkout Stripe para arquitetura modular em camada de aplicação (commit `ebeb5b1`).

**Edge functions simplificadas:**

- `supabase/functions/stripe-checkout/index.ts` (+30 / -227)
  - Delega toda lógica para módulos de aplicação

- `supabase/functions/stripe-webhook-aplikei/index.ts` (+19 / -150)
  - Delega para `handle-stripe-webhook`

- `supabase/functions/_shared/payments/application/verify-stripe-session.ts` (+21 / -65)
  - Refatorado e simplificado

**Módulos novos criados:**

- `application/create-stripe-checkout.ts` — orquestra a criação da sessão Stripe
- `application/confirm-stripe-checkout-payment.ts` — confirma pagamento e chama `applySuccessfulPayment`
- `application/handle-stripe-webhook.ts` — ponto de entrada do webhook
- `application/normalize-checkout-input.ts` — normaliza e valida entradas do checkout
- `application/register-payment-event.ts` — idempotência via `register_payment_event` RPC
- `application/resolve-checkout-price.ts` — calcula preço com desconto/cupom
- `application/resolve-stripe-account.ts` — determina conta Stripe do office
- `application/update-payment-from-stripe.ts` — atualiza order após confirmação
- `providers/strype.ts` — wrapper do SDK Stripe

**Removidos (stripe-connect descontinuado):**

- `supabase/functions/_shared/billing/application/stripe-connect.ts` (deletado)
- `supabase/functions/stripe-connect/index.ts` (deletado)

---

### 3.3 — Mentoria: Correção Completa do Fluxo de Chat

Bug identificado: painel admin mostrava "F1 - BRONZE" para todos os tiers, independente do pacote comprado. A query de compra de mentoria no onboarding usava escopo global (todos os processos do usuário) em vez do processo atual.

**Arquivos modificados:**

- `src/features/chat/services/eligibility.ts` (+31)
  - Adicionadas funções `buildMentoriaChatTitle(mentoriaSlug, parentSlug)` e `isMentoriaService(serviceSlug)`
  - `buildMentoriaChatTitle` retorna `"${processLabel} - ${tier}"` (ex: `"F1 - Silver"`, `"B1B2 - Gold"`)
  - Tier derivado de: `gold/ouro` → Gold; `silver/prata` → Silver; demais → Bronze
  - Label derivado de: `b1` → B1B2; `f1` → F1; `troca/cos` → COS; `extensao/eos` → EOS

- `src/features/chat/hooks/useAdminChats.ts` (+22)
  - **Fix principal:** substituído `getAnalysisChatTitle(service.service_slug)` por lógica de dois caminhos:
    1. Se `isMentoriaService(slug)` → usa `buildMentoriaChatTitle(slug, stepData.parent_service_slug)`
    2. Caso contrário → busca `stepData.purchases` por slug de mentoria e usa `buildMentoriaChatTitle`, ou fallback para `getAnalysisChatTitle`
  - Importa `isMentoriaService` e `buildMentoriaChatTitle` de `eligibility.ts`

- `src/features/chat/hooks/useCustomerChats.ts` (+75)
  - Serviços mentoria agora usam sempre seu próprio `processId` (nunca roteiam para o pai)
  - `targetProcessId`: mentoria → `processId`; outros → `parentProcessId || processId`
  - Título: `isMentoria ? buildMentoriaChatTitle(slug, parentSlug) : getAnalysisChatTitle(slug)`
  - Fallback no loop: marca `parentProcessId` de mentorias como coberto, evitando duplicatas

- `src/features/payments/pages/CheckoutSuccessPage/index.tsx` (+17)
  - Adicionados slugs PT ausentes ao set `MENTORSHIP_SLUGS`: `mentoria-prata`, `mentoria-individual`, `consultoria-especialista`
  - `normalizeMentorshipSlug`: mapeia explicitamente `mentoria-prata` → `mentoring-silver` e `mentoria-individual` → `mentoring-bronze`
  - `canonicalCandidates` para silver inclui `mentoria-prata`
  - Fallback de chat: `chatProcessId = targetProcessId || parentProcId || ""`; remove early return quando `user_services` row não existe

- `src/features/onboarding/f1/pages/F1OnboardingPage/steps/F1FinalPreparationStep.tsx` (+59 / -44)
  - Query de mentoria agora escopada por `parent_process_id: procId` (elimina falso positivo quando usuário tem mentoria de outro processo)
  - Adicionado `mentoria-prata` ao array de slugs reconhecidos
  - `handleOpenSpecialistSupport`: fallback gracioso quando `purchasedMentorship` não encontrado — refaz query com escopo ampliado

- `src/features/onboarding/b1b2/pages/B1B2OnboardingPage/steps/B1B2FinalPreparationStep.tsx` (+57 / -44)
  - Mesmas correções do step F1: escopo por `parent_process_id`, `mentoria-prata`, fallback

- `src/shared/data/services.ts` (+1)
  - `getCanonicalSlug`: adicionado mapeamento `"mentoria-prata": "mentoria-bronze"`

---

### 3.4 — Classificação de Processos / Slugs

Correções nas funções de classificação de slugs usadas em `ProcessesPage` e `MyProcessesPage`.

- `src/features/admin/pages/ProcessesPage/index.tsx` (+24 / -18)
  - `isAuxiliarySlug`: normaliza slug para lowercase antes dos comparativos; adiciona `consultoria-` como prefixo auxiliar

- `src/features/process/services/caseService.ts` (+2)
  - `shouldIncludeAsCase`: exclui explicitamente `mentoring-` e `consultancy-` da listagem de casos

- `src/shared/types/process.model.ts` (+11 / -1)
  - `isAnalysisServiceSlug`: expandida para cobrir `analysis-`, `apoio-`, `support-`, `revisao-`, `review-`, `mentoring-`, `consultancy-`, `dependente-`, `slot-` além dos prefixos PT já existentes

---

### 3.5 — Admin UX: Copy de E-mail

- `src/features/admin/pages/ProcessDetailPage/index.tsx` (+25)
  - Painel de criação de conta: botão de copy com ícone dinâmico (`RiFileCopyLine` / `RiCheckboxCircleLine`)
  - Estado `copiedAccountEmail` com auto-reset após 2s
  - Texto truncado com `title` para emails longos

- `src/features/process/pages/CaseOnboardingPage.tsx` (+48 / -14)
  - `B1B2AccountCreationPanel`: mesmo botão de copy de e-mail com feedback visual
  - `handleCopyEmail` memoizado via `useCallback`

---

### 3.6 — Testes E2E

- `tests/e2e/checkout-success.spec.ts` (novo, +492 linhas)
  - Cobre criação de chat pós-compra para os três tiers: Bronze, Prata (Silver), Gold
  - Verifica títulos corretos na sidebar: `"F1 - Bronze"`, `"F1 - Silver"`, `"F1 - Gold"`
  - Usa route mocking via `page.route()` para Supabase e edge functions
  - Testa fluxo F1 e B1B2 separadamente

- `tests/e2e/cos-onboarding.spec.ts` (-44 linhas líquidas)
  - Simplificação de mocks, remoção de lógica duplicada

- `tests/e2e/cos-recovery-flows.spec.ts` (-9 linhas)
  - Ajustes menores de mocks

---

### 3.7 — Documentação

- `temp/mentoria-purchase-flow.md` (novo, +291 linhas)
  - Mapa completo do fluxo de compra dos pacotes de mentoria (Bronze/Prata/Gold)
  - Cobre: FinalPreparationStep → CheckoutPage → paymentOps → CheckoutSuccessPage → seedMentorshipChat → ensureChatThread → useAdminChats
  - Inclui diagrama de fluxo, tabela de arquivos por responsabilidade, mapa de slugs canonicais, localStorage keys, edge functions e testes E2E

---

## 4. Macro-Temas Trabalhados Hoje

- **Estabilização do schema de notificações**
  - 5 migrações de banco de dados: realtime, target column, drop da tabela legada, ajuste de colunas
  - `ToastItem` propagando `category`/`action` para roteamento de ícone no client

- **Stripe checkout modularizado**
  - Edge functions decompostas em 9 módulos de aplicação
  - Stripe Connect removido (consolidação de métodos de payout)

- **Mentoria — fluxo de chat corrigido de ponta a ponta**
  - Bug de título no painel admin: `useAdminChats` usava `getAnalysisChatTitle` para todos → corrigido com `buildMentoriaChatTitle`
  - Bug de chat não criado na compra de `mentoria-prata`: slug não reconhecido em `CheckoutSuccessPage` → corrigido com mapeamentos explícitos
  - Query de compra nos steps F1/B1B2 agora escopada por processo, eliminando falso positivo cross-process
  - `useCustomerChats` roteado corretamente para o processo dedicado de mentoria

- **Classificação de slugs ampliada**
  - `isAnalysisServiceSlug` cobre EN+PT, evitando aparição de serviços auxiliares em listagens de casos principais

- **Admin UX: copy de e-mail**
  - Botão copy com feedback em dois painéis (ProcessDetailPage e CaseOnboardingPage B1B2)

- **E2E: cobertura do fluxo de mentoria**
  - `checkout-success.spec.ts` cobre Bronze/Prata/Gold com verificação de título de sidebar
