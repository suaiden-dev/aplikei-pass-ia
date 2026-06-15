# Plano de Implementação: Subscrição Agnóstica por Regras

## Objetivo

Evoluir o sistema atual de subscription do `admin_lawyer` para um modelo agnóstico, capaz de suportar:
- múltiplos critérios de cobrança;
- planos fixos, percentuais, híbridos e pós-pagos;
- troca de plano com vigência a partir de uma data específica;
- histórico imutável de vendas e cálculos;
- cobrança por produto, categoria, office e exceções;
- fechamento de ciclo e faturamento no final do período;
- regras compatíveis com o modelo atual sem quebrar produção.

## Estado Atual

Hoje o sistema está acoplado a:
- `office_subscriptions` como assinatura atual do office;
- `subscription_plans` com poucos tipos (`FIXED`, `PERCENTAGE`, `HYBRID`);
- `v_office_current_subscription` como fonte de leitura no frontend;
- `orders` com snapshot parcial de subscription;
- checkout que valida status do office por `v_office_current_subscription`;
- RLS e triggers já existentes para `admin_lawyer`.

Isso funciona para um modelo simples, mas não é suficiente para regras complexas e troca de plano com histórico preservado.

---

## 1. Princípios de Design

### 1.1. Histórico imutável

Toda venda precisa carregar o snapshot da regra aplicada no momento em que foi criada.

Isso evita:
- recalcular vendas antigas com o plano novo;
- inconsistência quando o admin trocar de plano;
- divergência entre invoices, ledger e dashboard.

### 1.2. Plano como regra, não como texto

Plano deve ser um conjunto estruturado de regras, e não apenas:
- nome;
- percentual;
- fee fixo.

### 1.3. Separar:
- `plano`
- `assinatura`
- `ciclo de billing`
- `lançamento/ledger`
- `snapshot na ordem`

### 1.4. Vigência explícita

Mudança de plano deve ter:
- `effective_from`
- `effective_to`
- `status`

### 1.5. Regras determinísticas

Qualquer cálculo precisa poder ser reproduzido depois, usando apenas dados persistidos.

---

## 2. Escopo Funcional

### 2.1. Planos suportados

O sistema deve suportar:
- plano fixo mensal;
- plano percentual;
- plano híbrido;
- plano pós-pago;
- plano com mínimo por transação;
- plano com teto por transação;
- plano por categoria de produto;
- plano por slug de produto;
- plano com exceções;
- plano exclusivo por office;
- plano com desconto temporal ou promoção, se necessário.

### 2.2. Troca de plano

Ao trocar de plano:
- vendas anteriores continuam no plano antigo;
- novas vendas usam o novo plano a partir da data de vigência;
- o ciclo anterior pode ser fechado e faturado;
- a troca não reescreve histórico.

### 2.3. Cobrança no final

Para plano pós-pago:
- a cobrança é consolidada no fechamento do ciclo;
- o invoice é gerado após o período;
- o fechamento precisa capturar todas as ordens elegíveis;
- o cálculo deve considerar o snapshot de cada ordem.

### 2.4. Regras por produto / categoria

Exemplos:
- cobrar 5% em main visas, mas 10% em consultas;
- aplicar mínimo apenas em main visas;
- isentar certos produtos;
- aplicar fee diferente por slug.

---

## 3. Mudanças de Modelo de Dados

### 3.1. Nova entidade de plano versionado

Criar ou evoluir `subscription_plans` para incluir regras estruturadas.

Campos sugeridos:
- `id`
- `name`
- `description`
- `billing_model` ou `pricing_model`
- `is_active`
- `is_exclusive`
- `version`
- `rules` `jsonb`
- `created_at`
- `updated_at`

`rules` pode conter:
- `base_fee`
- `percentage_fee`
- `min_fee_per_transaction`
- `max_fee_per_transaction`
- `billing_mode`
- `scope`
- `product_slugs`
- `categories`
- `exceptions`
- `effective_from`
- `effective_to`
- `invoice_timing`

### 3.2. Assinatura do office com vigência

Evoluir `office_subscriptions` para histórico:
- permitir múltiplas linhas por office;
- marcar a assinatura ativa por intervalo;
- armazenar vigência;
- manter snapshot do plano usado no período.

Campos sugeridos:
- `office_id`
- `plan_id`
- `plan_version`
- `status`
- `effective_from`
- `effective_to`
- `current_period_start`
- `current_period_end`
- `cancel_at_period_end`
- `metadata`

### 3.3. Snapshot por ordem

Ampliar `orders` com snapshot completo da subscription usada no momento da compra.

Campos sugeridos:
- `subscription_id`
- `subscription_plan_id`
- `subscription_plan_version`
- `subscription_pricing_model`
- `subscription_rules_snapshot` `jsonb`
- `subscription_effective_from`
- `subscription_effective_to`
- `subscription_fee_mode`
- `subscription_percentage_fee`
- `subscription_fixed_fee`
- `subscription_min_fee_per_transaction_usd`
- `subscription_max_fee_per_transaction_usd`
- `subscription_snapshot_created_at`

### 3.4. Ledger / accounting

Se o negócio quiser auditoria forte, criar tabela de ledger:
- `billing_ledger`
- `billing_ledger_entries`
- `billing_invoices`
- `billing_cycles`

Cada entrada deve referenciar:
- `order_id`
- `office_id`
- `subscription_id`
- `plan_id`
- `calculation_id` ou `rule_version`
- `amount`
- `currency`
- `type` (`fee`, `discount`, `adjustment`, `minimum`, `cap`)
- `created_at`

### 3.5. Event log opcional

Se quiser rastreabilidade extra:
- `subscription_events`
- `billing_events`

Eventos:
- `plan_created`
- `plan_updated`
- `subscription_activated`
- `subscription_changed`
- `subscription_canceled`
- `cycle_closed`
- `invoice_generated`
- `invoice_paid`

---

## 4. Regras de Cálculo

### 4.1. Regra de seleção do plano

Quando uma ordem é criada:
- determinar o `office_id`;
- localizar a subscription ativa na data/hora da ordem;
- escolher o plano vigente;
- aplicar regras do snapshot.

### 4.2. Regra de cálculo

Definir uma função central de cálculo que receba:
- `order`
- `subscription snapshot`
- `product metadata`
- `category`
- `created_at`

E retorne:
- fee base;
- fee percentual;
- fee mínimo;
- fee máximo;
- fee final;
- justificativa do cálculo;
- versão da regra usada.

### 4.3. Regras por tipo de cobrança

#### Prepaid
- cobrança calculada no ato da venda;
- snapshot persistido na ordem;
- ledger imediato ou quase imediato.

#### Postpaid
- cobrança acumulada por ciclo;
- invoice gerada no fechamento;
- orders ficam pendentes de consolidação até o fechamento.

#### Hybrid
- combinar fee fixo + percentual;
- aplicar mínimo e máximo se configurado.

#### Threshold / minimum
- se o cálculo percentual for menor que o mínimo, aplicar mínimo.

#### Cap
- se o cálculo passar do teto, aplicar teto.

### 4.4. Troca no meio do ciclo

Regra recomendada:
- ordens até `effective_to` usam a subscription anterior;
- ordens a partir de `effective_from` usam a nova;
- ciclo antigo pode ser fechado proporcionalmente ou encerrado na data da mudança;
- o comportamento precisa ser explícito e configurável.

---

## 5. Mudanças de Backend

### 5.1. Função de snapshot no momento da ordem

Substituir a lógica parcial por uma função que:
- busque a subscription vigente;
- copie as regras relevantes;
- salve o snapshot no pedido;
- mantenha compatibilidade com fluxos existentes.

### 5.2. Função de cálculo consolidado

Criar função de cálculo para:
- gerar invoice;
- recalcular ledger;
- auditar divergências;
- suportar reprocessamento idempotente.

### 5.3. Função de fechamento de ciclo

Criar função que:
- fecha o ciclo atual;
- agrega ordens elegíveis;
- gera invoice;
- marca ciclo como encerrado;
- abre ciclo novo se necessário.

### 5.4. Função de troca de plano

Ao trocar de plano:
- encerrar a subscription atual na data de corte;
- criar nova subscription com `effective_from` na mesma data;
- opcionalmente encerrar/iniciar ciclo;
- preservar histórico.

### 5.5. Função de cancelamento

Cancelar deve:
- encerrar vigência no período atual;
- impedir novas ordens sob aquele plano a partir da data de cancelamento;
- manter histórico consultável.

---

## 6. Mudanças no Frontend

### 6.1. SubscriptionPage

Atualizar para:
- mostrar plano atual e histórico de versões;
- exibir modelo de cobrança do plano;
- mostrar regras resumidas por scope;
- permitir troca com vigência clara;
- mostrar impacto sobre vendas futuras;
- explicar que pedidos antigos não mudam.

### 6.2. Plan Builder

Expandir UI para criação de regras:
- escolher billing model;
- escolher escopo;
- definir produtos ou categorias;
- configurar percentual/fixo/mínimo/teto;
- configurar cobrança no final;
- definir exclusões e exceções.

### 6.3. Checkout / product availability

Atualizar mensagens e estados:
- produto disponível/inativo por plano;
- regra do office aplicada naquele momento;
- exibir quando a cobrança é postpaid ou sujeita a fechamento posterior;
- manter UX clara para não confundir o usuário final.

---

## 7. Migração de Dados

### 7.1. Compatibilidade reversa

Antes de mudar o schema:
- manter leitura compatível com o modelo atual;
- suportar dados antigos sem `rules`;
- manter `percentage_fee` e `fixed_fee` como fallback.

### 7.2. Backfill de snapshots

Para ordens antigas:
- preencher snapshots derivados do plano atual da época, se possível;
- marcar origem como `backfilled`;
- não reescrever valores históricos sem indicação.

### 7.3. Backfill de subscriptions

Converter subscriptions correntes para o novo modelo:
- criar versão 1 para os planos existentes;
- mapear regras simples para `rules jsonb`;
- manter `office_subscriptions` legível pelo frontend antigo durante a migração.

### 7.4. Estratégia de rollout

Recomendação:
1. adicionar colunas novas;
2. escrever em dual-write;
3. ler do novo modelo com fallback;
4. migrar histórico;
5. remover dependências antigas depois da estabilização.

---

## 8. Critérios de Aceitação

### 8.1. Funcionais

- o `admin_lawyer` consegue ativar um novo plano do office;
- a troca de plano cria nova vigência sem alterar vendas antigas;
- ordens após a troca usam o plano novo;
- ordens antes da troca continuam com o plano antigo;
- planos pós-pagos consolidam valores no fechamento;
- regras por produto/categoria funcionam;
- mínimo e teto por transação são respeitados;
- o frontend mostra o estado atual e o histórico corretamente.

### 8.2. Dados

- uma ordem sempre possui snapshot suficiente para reproduzir o cálculo;
- o cálculo pode ser reexecutado de forma idempotente;
- o histórico não perde rastreabilidade;
- o ledger bate com os invoices gerados.

### 8.3. Segurança

- o `admin_lawyer` só altera dados do próprio office;
- não pode ver ou mexer em subscriptions de outras offices;
- RLS continua protegendo leituras e escritas;
- o snapshot impede que mudanças retroativas alterem vendas passadas.

---

## 9. Plano de Testes

### 9.1. Unit tests

Cobrir:
- seleção de plano vigente por data;
- snapshot de subscription em ordem;
- cálculo de fee por modelo;
- mínimo e teto;
- plano pós-pago;
- troca de plano com corte de vigência;
- cancelamento;
- fallback para dados antigos.

### 9.2. Integration tests

Cobrir:
- leitura da `v_office_current_subscription`;
- ativação e cancelamento em `office_subscriptions`;
- geração de billing cycle;
- geração de invoice;
- persistência do snapshot em `orders`;
- compatibilidade com checkout.

### 9.3. E2E tests

Cobrir:
- `admin_lawyer` visualiza subscription atual;
- ativa plano A;
- muda para plano B;
- novas compras depois da troca usam B;
- compras anteriores continuam associadas a A;
- plano pós-pago exibe aviso de cobrança posterior;
- cancelamento bloqueia novas compras quando aplicável.

### 9.4. Regression tests

Cobrir fluxos atuais:
- checkout de produtos principais;
- cobrança mínima em main visa;
- chat pós-compra;
- planos exclusivos;
- cancelamento e reativação de subscription.

---

## 10. Riscos

### 10.1. Financeiro

Risco:
- recalcular vendas antigas com regras novas.

Mitigação:
- snapshot imutável na ordem;
- versionamento de plano;
- migração gradual.

### 10.2. Consistência de dados

Risco:
- duplicar billing cycle;
- inconsistencia entre invoice e ledger;
- troca de plano no meio do ciclo sem corte claro.

Mitigação:
- transações;
- constraints;
- funções idempotentes;
- auditoria por evento.

### 10.3. Complexidade de regras

Risco:
- plano virar um “deus objeto” difícil de manter.

Mitigação:
- schema estruturado e versionado;
- regras pequenas e compostas;
- validação explícita de cada regra.

### 10.4. Migração

Risco:
- quebrar checkout e dashboards existentes durante o rollout.

Mitigação:
- dual read/dual write temporário;
- feature flags;
- backfill validado;
- testes de compatibilidade.

### 10.5. UX

Risco:
- o admin não entender a diferença entre subscription, billing cycle e snapshot.

Mitigação:
- nomes claros na UI;
- descrição curta de vigência;
- histórico visível;
- labels consistentes.

---

## 11. Avaliação de Segurança

### 11.1. Superfície de ataque atual

Áreas sensíveis:
- `office_subscriptions`;
- `subscription_plans`;
- `orders` com snapshot;
- billing cycles e invoices;
- policies de RLS;
- funções `security definer`.

### 11.2. Riscos de segurança

- alteração indevida de plano por office errado;
- leitura cross-office de billing history;
- manipulação de snapshot via frontend;
- corrida entre ativação e criação de pedidos;
- função `security definer` com escopo amplo demais;
- bypass de RLS em RPC ou trigger.

### 11.3. Controles necessários

- RLS por office em todas as tabelas financeiras;
- policies explícitas para select/insert/update/delete;
- validação server-side do `office_id`;
- snapshot criado no backend, não no cliente;
- campos de regra imutáveis após ativação;
- auditoria de mudanças em plano e subscription;
- logs de billing e recalculo;
- transações em operações críticas.

### 11.4. Boas práticas recomendadas

- nunca confiar em `plan_id` vindo do cliente sem validar office;
- não permitir update direto de snapshot financeiro pelo frontend;
- limitar `security definer` a funções pequenas;
- evitar trigger que silenciosamente altere valores sem registrar evento;
- registrar `created_by`, `changed_by` e timestamps;
- tratar reprocessamento como operação administrativa auditada.

### 11.5. Nível de segurança esperado

Se implementado com:
- snapshot imutável,
- RLS rigorosa,
- versionamento de plano,
- auditoria,
- cálculo server-side,

o sistema pode atingir um nível bom para operação comercial.

Sem isso, o risco principal é financeiro, não apenas técnico.

---

## 12. Sequência Recomendada de Execução

### Fase 1: Estrutura
- adicionar campos de versionamento e regras em `subscription_plans`;
- adicionar vigência em `office_subscriptions`;
- adicionar snapshot completo em `orders`;
- criar tabela de ledger se necessário.

### Fase 2: Backend de cálculo
- criar função de seleção de subscription vigente;
- criar função de snapshot de ordem;
- criar função de cálculo consolidado;
- criar função de fechamento de ciclo.

### Fase 3: Frontend
- adaptar `SubscriptionPage`;
- adaptar `useSubscription`;
- adaptar telas de checkout e mensagens de billing;
- criar UI de regras do plano.

### Fase 4: Migração
- backfill histórico;
- compatibilidade com dados antigos;
- dual-write temporário;
- feature flags.

### Fase 5: Testes e hardening
- unit, integration e e2e;
- validação de RLS;
- auditoria de dados;
- revisão de segurança.

---

## 13. Decisões em Aberto

Antes de implementar, é preciso decidir:
- os planos serão por office, por user ou ambos?
- cobrança pós-paga será mensal fixa ou por ciclo customizado?
- uma troca de plano corta o ciclo na hora ou só no próximo período?
- haverá pro-rata em mudanças de plano?
- regras por produto serão configuradas via UI ou JSON avançado?
- invoices serão geradas automaticamente ou manualmente?

Essas decisões afetam profundamente o schema final.

---

## 14. Conclusão

É totalmente possível criar um sistema agnóstico de subscrição, mas isso não é uma simples evolução de UI.
O núcleo do trabalho está em:
- modelagem histórica;
- snapshot de regras por venda;
- cálculo server-side;
- vigência por período;
- segurança e RLS;
- migração sem quebrar o modelo atual.

O caminho mais seguro é implementar em fases, mantendo compatibilidade até o novo modelo estar estável.

