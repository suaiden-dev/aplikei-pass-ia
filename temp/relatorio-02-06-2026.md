# Relatório De Desenvolvimento (Hoje - 02/06/2026)

**Contexto analisado:**

- Repositório: `/home/vileladev/Projects/aplikei`
- Branch atual: `task-anderson_vilela`
- Autor Git configurado: Anderson-Vilela-op `<andersonlucash.al@gmail.com>`
- Janela considerada: 2026-06-02 00:00:00 até 2026-06-02 23:59:59 (-0300)

---

## 1. Resumo Executivo

Hoje não há commits no histórico — todo o trabalho do dia está no working tree não commitado. Foi um dia de trabalho técnico intenso e transversal, cobrindo:

- migração completa do sistema de notificações para arquitetura de duas tabelas;
- i18n do sistema de notificações (en/pt/es);
- refatoração e modularização do Stripe checkout em edge functions;
- correção de roteamento de notificações por papel (customer → office, admin_lawyer → master);
- ajustes admin UX em produtos, receita, assinatura, saques e desconto.

**Totais não commitados (excluindo test-results):**

- 43 arquivos modificados/criados/deletados
- +3110 linhas adicionadas / -2508 linhas removidas
- 14 arquivos novos (untracked)
- 3 arquivos deletados

---

## 2. Commits De Hoje (Sua Autoria)

Nenhum commit de sua autoria hoje. Todos os trabalhos estão pendentes de commit no working tree.

---

## 3. Alterações Não Commitadas (Working Tree Atual)

### 3.1 — Sistema de Notificações (migração completa para novo schema)

**Tema principal do dia.** Migração da tabela antiga `notifications` para arquitetura de duas tabelas: `notifications_messages` (1 mensagem) + `notifications_groups` (N destinatários por mensagem), com fan-out por papel.

**Arquivos modificados:**

- `src/app/providers/NotificationProvider.tsx` (+235 / -131)
  - Rewrite completo para ler `notifications_groups` com join em `notifications_messages`
  - Realtime agora assina `notifications_groups` (INSERT/UPDATE)
  - `AppNotification` reexportado com `viewed`, `category`, `action`, `is_read` (backward-compat)
  - `markAsRead` atualiza `notifications_groups.viewed = true`

- `src/features/notifications/components/NotificationBell.tsx` (+28 / -35)
  - Filtros migrados para categorias: `all | unread | process | payment | admin | system`
  - Ícone/cor derivados de `notification.category` (não mais de `n.type`)

- `src/features/notifications/lib/localizeNotification.ts` (+89 / -51)
  - Prioridade de localização: template → category+action → fallback por título legado
  - `categoryActionToLabelKey` mapeia process/scheduling → labels de i18n
  - Correção de parse error: `(labels?.[labelKey] ?? title) || fallbackTitle`

- `src/features/notifications/services/notify.ts` (+48 / -24)
  - `templateToCategory` mapeia todos os 13 `NotifTemplate` para `{category, action}`
  - `notifyClient`, `notifyAdmin` agora enviam `category` e `action`
  - `notifyMaster` adicionado para roteamento de ações admin_lawyer → master

- `src/features/admin/hooks/useAdminOverview.ts` (+8 / -8)
  - `recentActivity` agora lê de `notifications_messages` (novo schema)

- `src/features/admin/hooks/useMasterOverview.ts` (+8 / -8)
  - Idem acima para o dashboard master

**Arquivos novos (i18n):**

- `src/app/i18n/locales/en/notifications.ts` (novo)
- `src/app/i18n/locales/pt/notifications.ts` (novo)
- `src/app/i18n/locales/es/notifications.ts` (novo)
  - Chave de formato `{category}__{action}` (ex: `process__step_approved`)
  - Cobre: bell UI, filtros, estado vazio, toast, log, labels de status/categoria/ação, conteúdo por category+action

- `src/app/i18n/locales/en/index.ts`, `pt/index.ts`, `es/index.ts` (+1 cada)
  - Inclusão do namespace `notifications`

- `src/app/i18n/types.ts` (+3 / -1)
  - `"notifications"` adicionado à union `TranslationNamespace` e interface `LocaleTranslations`

**Edge functions:**

- `supabase/functions/_shared/notifications/application/create-notification.ts` (+200 / -38)
  - Rewrite: resolve destinatários no servidor (bypass RLS com service_role)
  - Fan-out: customer trigger → todos managers/admin_lawyers do office
  - Correção master routing: fallback `else` cobre qualquer usuário restante como destinatário direto
  - Insere `notifications_messages` → insere `notifications_groups` por destinatário

- `supabase/functions/_shared/notifications/application/send-notification-email.ts` (+32 / -13)
  - Rewrite para ler `notifications_groups` + join `notifications_messages` no webhook
  - Marca `email_sent = true` após envio

**Migrações novas:**

- `supabase/migrations/20260602100000_create_notifications_tables.sql` (novo)
  - Cria `notifications_messages` e `notifications_groups` com RLS

- `supabase/migrations/20260602110000_extend_notifications_tables.sql` (novo)
  - Adiciona `title`, `body`, `link`, `metadata`, `send_email` em `notifications_messages`
  - Adiciona `created_at` em `notifications_groups`
  - Cria índices e trigger `notify_groups_send_email`

---

### 3.2 — Roteamento de Notificações por Papel

Correção do fluxo completo: quem faz o quê gera notificação para quem.

- `src/features/process/services/processOps.ts` (+43 / -2)
  - Import de `notifyMaster`
  - `approveStep`: novo parâmetro `options.actorRole`; quando `admin_lawyer`, chama `notifyMaster`
  - `rejectStep`: novo 4º parâmetro `options`; quando `actorRole === "admin_lawyer"`, chama `notifyMaster`

- `src/features/admin/pages/ProcessDetailPage/index.tsx` (+7 / -5)
  - `MotionProposalPanel`: adicionado `useAuth()` interno; passa `actorRole: panelUser?.role` no `approveStep`
  - `RFEProposalPanel`: idem
  - `handleApproveStep`: passa `{ actorRole: user?.role }` no `approveStep`
  - `handleRejectStep`: passa `{ actorRole: user?.role }` em ambas as chamadas de `rejectStep`

- `supabase/functions/_shared/payments/application/create-zelle-payment.ts` (+22 / -13)
  - Notificação migrada da tabela antiga para `notifications_messages` + `notifications_groups`

- `supabase/functions/_shared/payments/application/validate-zelle-payment.ts` (+54 / -49)
  - 3 inserções de notificação migradas para novo schema

---

### 3.3 — Stripe Checkout: Refatoração Modular das Edge Functions

Reestruturação do checkout Stripe para arquitetura modular em camada de aplicação.

**Arquivos modificados:**

- `supabase/functions/stripe-checkout/index.ts` (+30 / -227)
  - Simplificado: delega lógica para módulos de aplicação

- `supabase/functions/stripe-webhook-aplikei/index.ts` (+19 / -150)
  - Simplificado: delega para `handle-stripe-webhook`

- `supabase/functions/_shared/payments/application/verify-stripe-session.ts` (+21 / -65)
  - Refatorado

**Arquivos novos (módulos de aplicação):**

- `supabase/functions/_shared/payments/application/create-stripe-checkout.ts`
- `supabase/functions/_shared/payments/application/confirm-stripe-checkout-payment.ts`
- `supabase/functions/_shared/payments/application/handle-stripe-webhook.ts`
- `supabase/functions/_shared/payments/application/normalize-checkout-input.ts`
- `supabase/functions/_shared/payments/application/register-payment-event.ts`
- `supabase/functions/_shared/payments/application/resolve-checkout-price.ts`
- `supabase/functions/_shared/payments/application/resolve-stripe-account.ts`
- `supabase/functions/_shared/payments/application/update-payment-from-stripe.ts`
- `supabase/functions/_shared/payments/providers/strype.ts`

**Deletados (stripe-connect removido):**

- `supabase/functions/_shared/billing/application/stripe-connect.ts` (deletado)
- `supabase/functions/stripe-connect/index.ts` (deletado)

---

### 3.4 — Admin UX / Painéis

- `src/features/admin/pages/ProductsPage/index.tsx` (+896 / -465)
  - Refatoração estrutural grande: layout dinâmico estilo protótipo com flows e builder por fases
  - Mapeamento explícito de fases por produto
  - Ajustes tipográficos conforme protótipo
  - Login URL ajustado para `track-my-visa`

- `src/features/admin/pages/RevenuePage/index.tsx` (+967 / -958)
  - Ajustes de receita/analytics no painel admin

- `src/features/admin/pages/SubscriptionPage/index.tsx` (+124 / -108)
  - Ajustes na página de assinatura

- `src/features/admin/pages/DiscountRulesPage/index.tsx` (+6 / -6)
  - Remove prefill "configurado por padrão"; defaults zerados

- `src/features/admin/pages/billings/PaymentSettingsPage/index.tsx` (+11 / -2)
  - Payout method exclusivo: Stripe ou Zelle, não ambos simultaneamente

- `src/features/admin/pages/billings/WithdrawalsPage/index.tsx` (+56 / -4)
  - Sem método de saque configurado → CTA redireciona para `/admin/settings/payout`

---

### 3.5 — Auth / Layout / Roteamento

- `src/app/layouts/AuthLayout.tsx` (+5 / -2)
  - Oculta navbar em rotas de tracking/login de visto (`track-my-case` / `track-my-visa`)

- `src/app/layouts/RoleDashboardLayout.tsx` (+24 / -5)
  - Ajustes de layout por papel

- `src/app/router/appRoutes.tsx` (+8 / -0)
  - Novas rotas adicionadas

- `src/features/auth/pages/LoginPage.tsx` (+27 / -4)
  - Ajustes na página de login

---

### 3.6 — Checkout (Frontend)

- `src/features/payments/pages/CheckoutPage/index.tsx` (+44 / -7)
- `src/features/payments/pages/OfficeCheckoutPage/index.tsx` (+26 / -5)

---

### 3.7 — Page Builder

- `src/features/page-builder/pages/PageBuilderPage/components/LandingPagePreview.tsx` (+9 / -4)
- `src/features/page-builder/pages/PageBuilderPage/hooks/usePageBuilder.ts` (+1 / -1)
- `src/features/page-builder/pages/PageBuilderPage/lib/templateHtml.ts` (+16 / -5)

---

### 3.8 — Tipos e Dados Compartilhados

- `src/shared/types/db.ts` (+27 / -0)
  - Tipos `NotificationMessageRow` e `NotificationGroupRow` exportados

- `src/features/offices/services/officeOps.ts` (+2 / -2)
- `src/features/offices/types/office.ts` (+1 / -0)
- `src/features/process/pages/MyProcessesPage/index.tsx` (+1 / -9)
- `supabase/functions/_shared/core/supabase.ts` (+6 / -0)

---

## 4. Macro-Temas Trabalhados Hoje

- **Migração do sistema de notificações**
  - Arquitetura de duas tabelas com fan-out por papel substituindo a tabela plana legada
  - Backend (edge function), provider, bell, localização e banco (migrações) atualizados em conjunto

- **i18n de notificações**
  - Namespace `notifications` criado em en/pt/es com chave `category__action`
  - Cobre todo o ciclo: título, mensagem, labels de filtro, estado vazio

- **Roteamento correto de notificações por ator**
  - Customer → office managers + admin_lawyers
  - Admin_lawyer (ao aprovar/rejeitar etapa) → master
  - Manager → customer do processo
  - Correção do bug onde usuário `master` como `user_id` ficava sem destinatário

- **Stripe checkout modularizado**
  - Edge functions decompostas em módulos de aplicação focados
  - Stripe Connect removido (consolidação)

- **Admin UX**
  - ProductsPage com layout dinâmico por fases/flows
  - PaymentSettings com exclusividade de método de payout
  - Withdrawals com CTA de configuração quando sem método definido

---

## 5. Riscos / Observações Técnicas

- **Nenhum commit hoje**: todo o trabalho está apenas local. Em caso de perda de máquina ou reset, o trabalho do dia se perde. Recomendável commitar ao fim do dia, mesmo que seja um único commit WIP.

- **Mudança de schema de notificações é breaking**: qualquer parte do código que ainda referencia a tabela `notifications` (antiga) vai falhar silenciosamente. Pontos críticos a verificar: queries em pages admin não mapeadas neste diff, e qualquer trigger PostgreSQL legado que possa conflitar com os novos.

- **Stripe checkout refatorado mas não testado em produção**: a separação em módulos é positiva, mas a superfície de risco de regressão é alta dado o volume de mudança (+30/-227 no index, +9 novos módulos). Testar especialmente fluxo completo de pagamento e webhook.

- **ProductsPage teve refatoração muito grande** (+896/-465): risco de regressão em comportamento de exibição de produtos/fases. Validar visualmente o builder dinâmico antes de subir.
