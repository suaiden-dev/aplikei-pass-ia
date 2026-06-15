# Spec: Implementação da Subscrição do `admin_lawyer`

## Objetivo

Documentar como a subscrição do `admin_lawyer` está implementada hoje no projeto, qual é a cadeia de dados envolvida e onde a regra é aplicada no frontend, no banco e nas policies.

## Resumo Executivo

No projeto, `admin_lawyer` não tem uma assinatura “do usuário”.
A assinatura é do `office` ao qual esse usuário pertence.

O papel `admin_lawyer` funciona como uma camada de acesso:
- o usuário recebe o role `admin_lawyer`;
- o usuário precisa estar ligado a um `office`;
- o `office` é quem possui a subscription ativa em `office_subscriptions`;
- o frontend resolve a assinatura atual via `v_office_current_subscription`;
- a interface de `SubscriptionPage` permite ativar/cancelar o plano do office;
- algumas ações de checkout e billing usam essa subscription como fonte de verdade.

## Fluxo Atual

### 1. Criação do usuário

Quando um novo usuário é criado, o trigger `handle_new_user()` define o role e o estado inicial.

Arquivo:
- `supabase/migrations/20260507110001_make_lawyer_active_by_default.sql`

Comportamento:
- `admin_lawyer` entra ativo por padrão;
- `seller`, `manager` e `admin` entram inativos;
- o role é lido do `raw_user_meta_data`;
- o `office_id` também é persistido na conta quando disponível.

### 2. Vínculo obrigatório com office

Antes de permitir o role `admin_lawyer`, o banco exige um office vinculado ao usuário.

Arquivo:
- `supabase/migrations/20260505000000_require_office_for_admin_lawyer.sql`

Regra:
- se `new.role = 'admin_lawyer'`, precisa existir um `office` com `owner_id = user.id`;
- se não existir, a atualização falha com exception;
- o trigger roda em `before update of role` na tabela `user_accounts`.

### 3. Subscrição do office

A subscription é armazenada em `public.office_subscriptions`.

Arquivo base:
- `supabase/migrations/20260507120000_subscription_system.sql`

Campos principais:
- `office_id`
- `plan_id`
- `status`
- `current_period_start`
- `current_period_end`
- `cancel_at_period_end`

Características:
- existe uma única subscription por office (`unique(office_id)`);
- o plano é referenciado por `subscription_plans`;
- a subscription é de ciclo mensal;
- billing cycles são gerados automaticamente por trigger.

### 4. View de leitura usada pelo app

O frontend não lê `office_subscriptions` diretamente na maior parte do tempo.
Ele consulta a view `v_office_current_subscription`.

Arquivos:
- `supabase/migrations/20260507130000_subscription_automation.sql`
- `supabase/migrations/20260508173500_fix_subscription_view.sql`
- `supabase/migrations/20260508161000_simplify_subscriptions.sql`

O que a view entrega:
- `subscription_id`
- `office_id`
- `status`
- `current_period_start`
- `current_period_end`
- `plan_name`
- `plan_type`
- `fixed_fee`
- `percentage_fee`
- `min_fee_per_transaction_usd` em versões mais recentes

Observação:
- a view passou por simplificações ao longo das migrations;
- a versão mais recente usada pelo código tende a ser a que expõe `status`, `plan_name`, `plan_type`, `fixed_fee`, `percentage_fee` e `min_fee_per_transaction_usd`.

### 5. Hook de acesso do frontend

O hook `useSubscription()` resolve a subscription atual do office do usuário.

Arquivo:
- `src/features/admin/hooks/useSubscription.ts`

Lógica:
- tenta usar `user.officeId`;
- se não existir, busca o `office` por `owner_id = auth.uid()`;
- consulta `v_office_current_subscription` pelo `office_id`;
- define:
  - `status`
  - `planName`
  - `planType`
  - `fixedFee`
  - `percentageFee`
  - `minFeePerTransactionUsd`
  - `currentPeriodEnd`
  - `isActive`
  - `isRestricted`

Ponto importante:
- `isRestricted` fica `true` para `admin_lawyer`, `manager` e `seller` quando a subscription não está ativa.

### 6. Página de assinatura

A tela `SubscriptionPage` permite contratar, trocar e cancelar o plano do office.

Arquivo:
- `src/features/admin/pages/SubscriptionPage/index.tsx`

Service layer:
- `src/features/admin/services/subscriptionPageService.ts`

Operações:
- listar planos ativos com `fetchActiveSubscriptionPlans()`;
- ler histórico com `fetchBillingHistory()`;
- cancelar subscription com `cancelOfficeSubscription(officeId)`;
- ativar subscription com `activateOfficeSubscription({ officeId, planId })`.

Detalhes da ativação:
- `activateOfficeSubscription()` faz `upsert` em `office_subscriptions`;
- define `status = 'active'`;
- define `current_period_start = now`;
- define `current_period_end = now + 30 dias`;
- usa `onConflict: "office_id"`.

Detalhes do cancelamento:
- `cancelOfficeSubscription()` atualiza `status = 'canceled'`;
- restringe a atualização para subscriptions `active` ou `trialing`.

### 7. Policies de RLS

As policies permitem que o `admin_lawyer` enxergue e altere a própria subscription do office.

Arquivos:
- `supabase/migrations/20260508181000_allow_lawyer_cancel_sub.sql`
- `supabase/migrations/20260508181500_allow_lawyer_insert_sub.sql`

Regras:
- `SELECT`: o staff pode ver a subscription do próprio office;
- `UPDATE`: `admin_lawyer` pode cancelar/alterar a própria subscription;
- `INSERT`: `admin_lawyer` pode criar subscription do próprio office;
- a permissão é validada por `office_id in (select office_id from user_accounts where id = auth.uid())`;
- `current_user_role() = 'admin_lawyer'` é exigido para escrita.

### 8. Plano e precificação

O catálogo de planos é lido de `subscription_plans`.

Arquivos:
- `src/features/admin/services/subscriptionPlansService.ts`
- `supabase/migrations/20260507130001_seed_plans.sql`

Pontos relevantes:
- os planos são filtrados por `is_active`;
- a UI de subscription mostra `FIXED`, `PERCENTAGE` e `HYBRID`;
- versões posteriores adicionaram `is_exclusive`;
- há suporte a `min_fee_per_transaction_usd` para planos percentuais ou híbridos.

### 9. Integração com checkout

O checkout público usa a subscription do office como parte da validação de compra.

Arquivo:
- `src/features/payments/services/checkoutPageService.ts`

Ponto de integração:
- `fetchOfficeSubscriptionStatus()` consulta `v_office_current_subscription`;
- o checkout também usa `user_service_prices` para decidir se o produto do office está ativo;
- isso significa que a subscription do office influencia disponibilidade, preço e bloqueio de produto.

### 10. Métodos de pagamento do office

Há uma tabela separada para meios de pagamento do `admin_lawyer`.

Arquivo:
- `supabase/migrations/20260505230000_create_admin_lawyer_payment_methods.sql`

Uso:
- armazena métodos de pagamento por usuário;
- tem RLS próprio;
- é parte da infraestrutura financeira do office, não da subscription em si.

## Relação Entre Role e Subscription

Ponto central:
- `admin_lawyer` é um role de usuário;
- subscription é uma entidade do office;
- o usuário só “vê” a própria subscription porque ele é dono do office ou está vinculado a ele;
- quando o app fala em `current subscription`, está falando da subscription do `office`, não da conta individual.

## Sequência de Execução

Ordem prática do sistema:
1. usuário é criado com `role = admin_lawyer`;
2. trigger exige que exista um `office` para esse usuário;
3. o frontend resolve `officeId` do usuário;
4. `useSubscription()` consulta a view da subscription do office;
5. a página de assinatura exibe o plano atual;
6. o usuário pode ativar, trocar ou cancelar o plano;
7. `office_subscriptions` é atualizada;
8. billing cycles e histórico são derivados dessa tabela;
9. checkout e produtos passam a respeitar o status da subscription.

## Pontos de Atenção

- Existe uma sobreposição de nomes entre `admin_lawyer` como role e “subscription do admin_lawyer”; na prática a implementação é por `office`.
- Há migrations antigas que simplificam a view de subscription; o código atual depende da forma mais recente da view.
- A UI de subscription usa textos e labels que variam por idioma, mas a lógica de status vem da view.
- Se o office não estiver vinculado ao usuário, o fluxo de subscription quebra cedo por design.

## Arquivos-Chave

- `src/features/admin/hooks/useSubscription.ts`
- `src/features/admin/hooks/useSubscriptionPage.ts`
- `src/features/admin/pages/SubscriptionPage/index.tsx`
- `src/features/admin/services/subscriptionPageService.ts`
- `src/features/admin/services/subscriptionPlansService.ts`
- `src/features/payments/services/checkoutPageService.ts`
- `supabase/migrations/20260507120000_subscription_system.sql`
- `supabase/migrations/20260507130000_subscription_automation.sql`
- `supabase/migrations/20260508173500_fix_subscription_view.sql`
- `supabase/migrations/20260508181000_allow_lawyer_cancel_sub.sql`
- `supabase/migrations/20260508181500_allow_lawyer_insert_sub.sql`
- `supabase/migrations/20260505000000_require_office_for_admin_lawyer.sql`
- `supabase/migrations/20260507110001_make_lawyer_active_by_default.sql`

