# Checklist Executável: Subscrição Agnóstica

## Objetivo

Transformar a subscription atual do `admin_lawyer` em um sistema agnóstico, versionado e auditável, sem perder histórico e sem quebrar o checkout atual.

---

## Fase 0: Decisões de Produto

- [ ] Definir se a unidade de assinatura é `office`, `user` ou ambos.
- [ ] Definir se troca de plano entra em vigor imediatamente ou no próximo ciclo.
- [ ] Definir se haverá pro-rata em troca de plano no meio do período.
- [ ] Definir se billing pós-pago será mensal fixo ou por ciclo configurável.
- [ ] Definir se regras por produto/categoria serão configuradas em UI ou apenas em JSON avançado.
- [ ] Definir se invoices serão automáticos, manuais ou híbridos.

Done quando:
- [ ] As regras de negócio estão fechadas e documentadas.

---

## Fase 1: Modelo de Dados

### 1.1 Planos versionados

- [ ] Evoluir `subscription_plans` para suportar versão de regra.
- [ ] Adicionar `billing_model` / `pricing_model`.
- [ ] Adicionar `rules jsonb` para regras agnósticas.
- [ ] Adicionar campos para escopo, exceções e vigência.
- [ ] Garantir compatibilidade com `fixed_fee` e `percentage_fee` existentes.

### 1.2 Subscription por vigência

- [ ] Evoluir `office_subscriptions` para histórico.
- [ ] Adicionar `effective_from`.
- [ ] Adicionar `effective_to`.
- [ ] Adicionar `plan_version`.
- [ ] Garantir que uma mudança crie nova linha sem sobrescrever histórico.

### 1.3 Snapshot em orders

- [ ] Adicionar snapshot completo da subscription em `orders`.
- [ ] Persistir `subscription_id`.
- [ ] Persistir `subscription_plan_id`.
- [ ] Persistir `subscription_plan_version`.
- [ ] Persistir `subscription_rules_snapshot jsonb`.
- [ ] Persistir fees relevantes do momento da compra.

### 1.4 Ledger e billing

- [ ] Criar ou ampliar tabela de `billing_cycles`.
- [ ] Criar ou ampliar tabela de `billing_invoices`.
- [ ] Criar tabela de `billing_ledger` ou equivalente, se a auditoria precisar.

Done quando:
- [ ] O schema consegue representar plano, vigência, ordem e faturamento sem sobrescrever histórico.

---

## Fase 2: Backend de Regras

### 2.1 Seleção de plano vigente

- [ ] Criar função para localizar a subscription ativa por `office_id` e data da ordem.
- [ ] Garantir que a regra respeita `effective_from` e `effective_to`.
- [ ] Garantir fallback para dados antigos.

### 2.2 Snapshot da ordem

- [ ] Criar função server-side para salvar snapshot da subscription na criação da order.
- [ ] Garantir que o snapshot venha do backend, não do cliente.
- [ ] Garantir idempotência na criação/atualização da order.

### 2.3 Cálculo

- [ ] Criar função central de cálculo de fee.
- [ ] Suportar modelo fixo.
- [ ] Suportar modelo percentual.
- [ ] Suportar modelo híbrido.
- [ ] Suportar mínimo por transação.
- [ ] Suportar teto por transação.
- [ ] Suportar cobrança pós-paga.
- [ ] Suportar regras por produto, slug e categoria.

### 2.4 Troca e cancelamento

- [ ] Criar função para trocar plano com vigência definida.
- [ ] Criar função para cancelar subscription sem apagar histórico.
- [ ] Garantir que novas ordens usem o novo plano a partir da data correta.

### 2.5 Fechamento de ciclo

- [ ] Criar função para fechar ciclo.
- [ ] Consolidar ordens elegíveis.
- [ ] Gerar invoice.
- [ ] Marcar ciclo como fechado.
- [ ] Abrir próximo ciclo quando aplicável.

Done quando:
- [ ] O backend calcula e persiste tudo sem depender de lógica manual no frontend.

---

## Fase 3: Segurança e RLS

- [ ] Revisar policies de `subscription_plans`.
- [ ] Revisar policies de `office_subscriptions`.
- [ ] Revisar policies de `billing_cycles`.
- [ ] Revisar policies de `billing_invoices`.
- [ ] Revisar policies de qualquer tabela de ledger.
- [ ] Garantir que `admin_lawyer` só acessa o office próprio.
- [ ] Garantir que `manager` e outros perfis não consigam alterar subscription indevidamente.
- [ ] Limitar funções `security definer` ao menor escopo possível.
- [ ] Garantir que snapshot de ordem não seja editável pelo cliente.

Done quando:
- [ ] Não existe caminho de leitura ou escrita cross-office sem autorização.

---

## Fase 4: Frontend

### 4.1 Subscription Page

- [ ] Mostrar plano atual com vigência.
- [ ] Mostrar histórico de mudanças.
- [ ] Mostrar modelo de cobrança do plano.
- [ ] Exibir regras resumidas do plano.
- [ ] Explicar impacto da troca de plano nas vendas futuras.

### 4.2 Plan Builder

- [ ] Permitir criar/editar regras.
- [ ] Permitir selecionar billing model.
- [ ] Permitir configurar percentual, fixo, mínimo e teto.
- [ ] Permitir selecionar escopo por produto/categoria/slug.
- [ ] Permitir configurar cobrança no final.

### 4.3 Checkout

- [ ] Ler status da subscription pela nova camada compatível.
- [ ] Exibir produto disponível/inativo corretamente.
- [ ] Respeitar regras do snapshot no momento da compra.
- [ ] Não depender apenas do plano atual para vendas antigas.

Done quando:
- [ ] O usuário entende o que está ativo e o sistema usa a regra correta ao comprar.

---

## Fase 5: Migração

- [ ] Criar migração para novos campos.
- [ ] Criar backfill para planos existentes.
- [ ] Criar backfill para subscriptions existentes.
- [ ] Criar backfill de snapshots em orders, quando possível.
- [ ] Rodar compatibilidade com leitura antiga e nova ao mesmo tempo.
- [ ] Preparar remoção gradual das dependências antigas.

Done quando:
- [ ] Dados antigos continuam funcionando e dados novos usam o modelo agnóstico.

---

## Fase 6: Testes

### 6.1 Unit tests

- [ ] Seleção de subscription vigente por data.
- [ ] Cálculo fixo.
- [ ] Cálculo percentual.
- [ ] Cálculo híbrido.
- [ ] Mínimo por transação.
- [ ] Teto por transação.
- [ ] Troca de plano com vigência.
- [ ] Cancelamento sem perda histórica.
- [ ] Fallback para dados legados.

### 6.2 Integration tests

- [ ] Snapshot em order no backend.
- [ ] View de subscription atual.
- [ ] Criação de billing cycle.
- [ ] Geração de invoice.
- [ ] RLS por office.
- [ ] Atualização e cancelamento de subscription.

### 6.3 E2E tests

- [ ] `admin_lawyer` vê subscription do office.
- [ ] `admin_lawyer` ativa plano.
- [ ] `admin_lawyer` troca plano.
- [ ] Compras posteriores usam o plano novo.
- [ ] Compras anteriores continuam com o plano antigo.
- [ ] Plano pós-pago aparece com mensagem correta.
- [ ] Cancelamento bloqueia novas compras quando aplicável.

Done quando:
- [ ] Os fluxos principais e os regressivos passam sem flakiness.

---

## Fase 7: Observabilidade

- [ ] Registrar eventos de ativação de plano.
- [ ] Registrar eventos de cancelamento.
- [ ] Registrar geração de ciclo.
- [ ] Registrar geração de invoice.
- [ ] Registrar divergências de cálculo.
- [ ] Registrar reprocessamentos manuais.

Done quando:
- [ ] Existe trilha para auditar quem mudou o quê e quando.

---

## Fase 8: Critérios de Aceitação Final

- [ ] Um office pode ter múltiplas subscriptions ao longo do tempo, sem apagar histórico.
- [ ] Uma ordem sempre carrega snapshot suficiente para reproduzir a cobrança.
- [ ] Troca de plano só afeta vendas a partir da data definida.
- [ ] Planos pós-pagos fecham e faturam por ciclo.
- [ ] Regras por produto/categoria/slug funcionam.
- [ ] RLS protege dados financeiros por office.
- [ ] Checkout e dashboard continuam funcionando com o novo modelo.

---

## Riscos Principais

- [ ] Recalcular ordens antigas com regra nova.
- [ ] Quebrar checkout durante migração.
- [ ] Criar duplication de ciclos/invoices.
- [ ] Abrir brecha de segurança cross-office.
- [ ] Deixar o modelo flexível demais e virar um “deus objeto”.

Mitigação:
- [ ] Snapshot imutável em orders.
- [ ] Versionamento de plano.
- [ ] Migração em fases.
- [ ] RLS rígida.
- [ ] Regras pequenas e explícitas.

---

## Avaliação de Segurança

### Risco atual

- [ ] Médio para alto se os snapshots forem editáveis ou se a troca de plano for calculada no frontend.
- [ ] Alto se o backend permitir alteração retroativa de fee sem auditoria.

### Estado desejado

- [ ] Snapshot criado no backend.
- [ ] Policies por office.
- [ ] Funções críticas com escopo mínimo.
- [ ] Histórico auditável.
- [ ] Sem writes diretos do cliente em campos financeiros sensíveis.

### Resultado esperado

- [ ] Segurança boa para operação comercial se as políticas e snapshots forem implementados corretamente.

