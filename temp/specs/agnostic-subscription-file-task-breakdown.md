# Quebra Técnica por Arquivo: Subscrição Agnóstica

## Objetivo

Transformar o plano de implementação em uma lista de tarefas acionáveis por arquivo, com a ordem sugerida de execução.

---

## Ordem Recomendada

1. Banco e migrations
2. Regras de domínio e snapshots
3. RLS e segurança
4. Services e hooks do frontend
5. Telas e componentes
6. Backfill e compatibilidade
7. Testes

---

## 1. Banco e Migrations

### `supabase/migrations/20260507120000_subscription_system.sql`

Responsabilidade atual:
- cria `subscription_plans`
- cria `office_subscriptions`
- cria `billing_cycles`
- cria `billing_invoices`
- cria `calculate_cycle_billing`

Tarefas:
- adicionar versão de plano em `subscription_plans`;
- adicionar `billing_model` / `pricing_model`;
- adicionar `rules jsonb`;
- adicionar campos de vigência em `subscription_plans`;
- garantir compatibilidade com `fixed_fee` e `percentage_fee`;
- preparar estrutura para escopo por produto, categoria e slug;
- evitar quebra dos seeds e das queries antigas.

Critério de pronto:
- o schema aceita plano versionado sem quebrar leitura atual.

### `supabase/migrations/20260507130000_subscription_automation.sql`

Responsabilidade atual:
- trigger de automação da subscription;
- criação da view `v_office_current_subscription`.

Tarefas:
- ajustar trigger para considerar `effective_from` e `effective_to`;
- garantir que a view exponha os campos novos sem quebrar o frontend;
- manter compatibilidade com `subscription_id`, `status` e fees antigas;
- preparar a view para retornar snapshot suficiente para checkout e dashboard.

Critério de pronto:
- a view continua atendendo o app atual e passa a expor dados versionados.

### `supabase/migrations/20260508173500_fix_subscription_view.sql`

Responsabilidade atual:
- simplifica a view de subscription.

Tarefas:
- revisar a definição para refletir o novo modelo histórico;
- manter o nome da view estável;
- garantir que o frontend antigo ainda consiga consumir a leitura mínima.

Critério de pronto:
- a view continua compatível com `useSubscription()` e `fetchOfficeSubscriptionStatus()`.

### `supabase/migrations/20260508161000_simplify_subscriptions.sql`

Responsabilidade atual:
- limpa e simplifica planos antigos.

Tarefas:
- adaptar a limpeza para não remover versões históricas necessárias;
- preservar registros usados por ordens antigas;
- bloquear exclusões destrutivas em planos já referenciados por orders.

Critério de pronto:
- não existe perda de histórico de plano referenciado.

### Nova migration para `orders`

Arquivo sugerido:
- `supabase/migrations/<novo_timestamp>_orders_subscription_snapshot.sql`

Tarefas:
- adicionar `subscription_id`;
- adicionar `subscription_plan_id`;
- adicionar `subscription_plan_version`;
- adicionar `subscription_pricing_model`;
- adicionar `subscription_rules_snapshot jsonb`;
- adicionar `subscription_effective_from`;
- adicionar `subscription_effective_to`;
- adicionar `subscription_fee_mode`;
- adicionar `subscription_percentage_fee`;
- adicionar `subscription_fixed_fee`;
- adicionar `subscription_min_fee_per_transaction_usd`;
- adicionar `subscription_max_fee_per_transaction_usd`;
- adicionar `subscription_snapshot_created_at`;
- criar trigger ou função para preencher esses campos no backend.

Critério de pronto:
- toda order nova grava snapshot imutável da subscription aplicada.

### Nova migration para ledger e billing

Arquivo sugerido:
- `supabase/migrations/<novo_timestamp>_billing_ledger_and_cycles.sql`

Tarefas:
- ampliar `billing_cycles` se necessário;
- ampliar `billing_invoices` se necessário;
- criar `billing_ledger` ou tabela equivalente;
- incluir `status`, `calculated_amount`, `paid_amount`, `currency`, `period_start`, `period_end`;
- criar índices para busca por office, ciclo e invoice.

Critério de pronto:
- o sistema consegue auditar cobrança por período e por ordem.

---

## 2. Regras de Domínio

### `supabase/migrations/20260507130000_subscription_automation.sql`

Tarefas de regra:
- criar função para localizar subscription vigente por `office_id` e data;
- garantir fallback para dados legados;
- separar lógica de seleção da lógica de persistência;
- deixar o cálculo determinístico.

### Nova function de snapshot

Arquivo sugerido:
- `supabase/migrations/<novo_timestamp>_set_order_subscription_snapshot.sql`

Tarefas:
- criar função server-side para snapshot na criação da order;
- impedir que o cliente informe campos financeiros sensíveis;
- tornar a operação idempotente;
- usar a subscription vigente na data da ordem;
- registrar a regra aplicada no momento da compra.

### Nova function de cálculo

Arquivo sugerido:
- `supabase/migrations/<novo_timestamp>_calculate_subscription_fee.sql`

Tarefas:
- suportar `fixed`;
- suportar `percentage`;
- suportar `hybrid`;
- suportar mínimo por transação;
- suportar teto por transação;
- suportar cobrança pós-paga;
- suportar exceções por produto/categoria/slug;
- suportar troca de plano com vigência.

### Nova function de fechamento de ciclo

Arquivo sugerido:
- `supabase/migrations/<novo_timestamp>_close_billing_cycle.sql`

Tarefas:
- consolidar ordens elegíveis;
- gerar invoice;
- marcar ciclo como fechado;
- abrir próximo ciclo quando aplicável;
- impedir duplicação de cobrança.

Critério de pronto para o bloco de regras:
- a cobrança é reproduzível a partir do banco sem depender do frontend.

---

## 3. Segurança e RLS

### `supabase/migrations/20260508181000_allow_lawyer_cancel_sub.sql`

Tarefas:
- revisar a policy para suportar atualização por vigência;
- impedir alteração retroativa sem permissão;
- manter restrição por `office_id`.

### `supabase/migrations/20260508181500_allow_lawyer_insert_sub.sql`

Tarefas:
- revisar a policy de insert para o modelo histórico;
- restringir criação a `admin_lawyer` do próprio office;
- evitar inserção em outras offices.

### Nova migration de policies

Arquivo sugerido:
- `supabase/migrations/<novo_timestamp>_subscription_rls_hardening.sql`

Tarefas:
- revisar policies de `subscription_plans`;
- revisar policies de `office_subscriptions`;
- revisar policies de `billing_cycles`;
- revisar policies de `billing_invoices`;
- revisar policies de `billing_ledger`;
- garantir leitura apenas do próprio office para `admin_lawyer`;
- restringir writes a funções `security definer` mínimas;
- bloquear edição direta de snapshots de ordem.

Critério de pronto:
- não existe leitura nem escrita cross-office sem autorização explícita.

---

## 4. Frontend

### `src/features/admin/hooks/useSubscription.ts`

Tarefas:
- continuar resolvendo o office do usuário;
- consumir a nova view sem quebrar o contrato atual;
- expor `effectiveFrom`, `effectiveTo` e versão quando existirem;
- manter `isRestricted` funcionando com o novo modelo;
- evitar dependência de campos removidos.

### `src/features/admin/hooks/useSubscriptionPage.ts`

Tarefas:
- adaptar o carregamento para histórico de subscriptions;
- lidar com troca de plano com vigência;
- lidar com cancelamento sem perda de histórico;
- continuar consumindo status e plano atual.

### `src/features/admin/services/subscriptionPageService.ts`

Tarefas:
- adaptar `activateOfficeSubscription()` para criar nova linha histórica;
- adaptar `cancelOfficeSubscription()` para encerrar vigência;
- evitar `upsert` destrutivo quando o modelo passar a ser histórico;
- manter leitura de histórico e billing.

### `src/features/admin/services/subscriptionPlansService.ts`

Tarefas:
- ampliar a criação/edição de planos para regras versionadas;
- suportar `billing_model` e `rules`;
- preservar compatibilidade com o editor atual de percentual e fixo;
- validar payload antes de salvar.

### `src/features/admin/pages/SubscriptionPage/index.tsx`

Tarefas:
- exibir plano atual com vigência;
- exibir histórico de troca;
- mostrar modelo de cobrança do plano;
- explicar impacto na venda futura;
- deixar claro quando a mudança entra em vigor.

### `src/features/admin/pages/PlansPage/index.tsx`

Tarefas:
- adaptar o formulário para regras agnósticas;
- incluir campos para mínimo, teto, exceções e cobrança pós-paga;
- manter edição simples para o caso legado;
- impedir salvar combinação inválida.

### `src/features/payments/services/checkoutPageService.ts`

Tarefas:
- continuar lendo status do office com compatibilidade;
- usar snapshot da order para regras já vendidas;
- evitar depender apenas do plano atual;
- garantir que produtos antigos não mudem de regra retroativamente.

### Componentes e páginas de produto

Arquivos prováveis:
- `src/features/products/...`
- `src/features/admin/pages/ProductsPage/...`

Tarefas:
- usar a subscription vigente apenas para validação atual;
- não recalcular pedidos antigos na UI;
- exibir corretamente produtos bloqueados por regra nova.

Critério de pronto para frontend:
- o usuário consegue entender plano atual, histórico e impacto da troca.

---

## 5. Migração e Compatibilidade

### Migrations de backfill

Arquivos sugeridos:
- `supabase/migrations/<novo_timestamp>_backfill_subscription_versions.sql`
- `supabase/migrations/<novo_timestamp>_backfill_order_snapshots.sql`

Tarefas:
- converter planos existentes para a nova estrutura;
- criar versions iniciais sem perder o plano legado;
- preencher snapshots em orders antigas quando houver informação suficiente;
- preservar leitura antiga durante transição.

### Compatibilidade temporária

Tarefas:
- manter `v_office_current_subscription` estável enquanto o frontend migra;
- manter colunas antigas até o corte final;
- evitar renomear campos consumidos por hooks atuais sem fallback.

Critério de pronto:
- o sistema novo e o legado coexistem por uma janela segura.

---

## 6. Testes

### Unit tests

Arquivos sugeridos:
- `src/features/admin/hooks/__tests__/useSubscription.test.ts`
- `src/features/admin/services/__tests__/subscriptionPageService.test.ts`
- `src/features/admin/services/__tests__/subscriptionPlansService.test.ts`
- `src/features/payments/services/__tests__/checkoutPageService.test.ts`

Tarefas:
- validar seleção de subscription vigente por data;
- validar cálculo fixo, percentual e híbrido;
- validar mínimo e teto por transação;
- validar troca de plano com vigência;
- validar cancelamento sem perda histórica;
- validar fallback para dados legados.

### Integration tests

Arquivos sugeridos:
- `supabase/migrations/*.test.ts`
- testes de service com Supabase mock ou banco local

Tarefas:
- validar snapshot em order;
- validar view de subscription atual;
- validar geração de cycle e invoice;
- validar RLS por office.

### E2E tests

Arquivos sugeridos:
- `tests/e2e/f1-onboarding.spec.ts`
- `tests/e2e/checkout-success.spec.ts`
- `tests/e2e/admin-subscription.spec.ts` novo

Tarefas:
- validar que `admin_lawyer` vê a subscription do próprio office;
- validar ativação de plano;
- validar troca de plano;
- validar cancelamento;
- validar que compras posteriores usam o plano novo;
- validar que compras anteriores continuam com o plano antigo;
- validar plano pós-pago com mensagem correta;
- validar que o fluxo de compra não quebra no legado.

Critério de pronto:
- os fluxos críticos passam sem regressão.

---

## 7. Observabilidade

### Nova migration de eventos

Arquivo sugerido:
- `supabase/migrations/<novo_timestamp>_subscription_events.sql`

Tarefas:
- registrar ativação;
- registrar troca;
- registrar cancelamento;
- registrar geração de ciclo;
- registrar geração de invoice;
- registrar divergência de cálculo;
- registrar reprocessamento manual.

Critério de pronto:
- existe trilha auditável para investigar qualquer cobrança.

---

## 8. Ordem de Execução Sugerida

1. criar migrations de estrutura
2. criar função de snapshot em orders
3. criar função de cálculo central
4. ajustar RLS
5. adaptar `useSubscription()` e `checkoutPageService`
6. adaptar `SubscriptionPage` e `PlansPage`
7. criar backfills
8. ampliar testes unitários
9. ampliar testes de integração
10. ampliar testes E2E

---

## 9. Riscos por Arquivo

- migrations de `subscription_plans`: risco de quebrar plano legado;
- migrations de `orders`: risco de reescrever histórico de venda;
- policies RLS: risco de vazamento cross-office;
- `checkoutPageService`: risco de bloquear compra indevidamente;
- `SubscriptionPage`: risco de UX confusa ao trocar de plano;
- backfill: risco de inconsistência entre dados antigos e novos.

---

## 10. Resultado Esperado

Ao final dessa quebra:
- cada mudança tem dono técnico claro;
- cada arquivo tem responsabilidade bem delimitada;
- o plano agnóstico pode ser implementado sem misturar domínio, UI e segurança;
- a migração pode ser executada em etapas seguras.
