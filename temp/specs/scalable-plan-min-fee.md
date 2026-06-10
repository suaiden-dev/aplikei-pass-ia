# Spec: Scalable Plan — Taxa mínima por transação ($30) em Main Visas

## Contexto

O Plano Escalável (Scalable) cobra uma **porcentagem sobre cada transação**.  
Para viabilidade financeira da plataforma, toda transação de **main visa** deve gerar
pelo menos **$30,00** de taxa Aplikei — independente do percentual configurado no plano.

**Regra:**

```
fee = max(gross × percentage / 100, min_fee_per_transaction)
```

- Se `gross × percentage / 100 < 30.00` → taxa = **$30.00**
- Se `gross × percentage / 100 ≥ 30.00` → taxa = valor calculado normalmente

## Escopo: Main Visas

A taxa mínima aplica-se **somente** a serviços principais (não auxiliares):

| Slug(s)                                      | Serviço             |
|----------------------------------------------|---------------------|
| `visto-b1-b2`, `visa-b1b2`                   | B1/B2 Tourist Visa  |
| `visto-f1`, `visa-f1`, `visa-f1f2`           | F1 Student Visa     |
| `extensao-status`, `visa-eos`                 | Status Extension    |
| `troca-status`, `visa-cos`                    | Change of Status    |

Serviços auxiliares (`isAuxiliary: true` no catalog `slugs.ts`) — dependentes,
mentorias, slots, RFE, motion — **não** recebem taxa mínima.

---

## Mudanças necessárias

### 1. `subscription_plans` — nova coluna

```sql
-- migration: 2026XXXX_scalable_plan_min_fee_per_transaction.sql
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS min_fee_per_transaction_usd NUMERIC(10,2) DEFAULT NULL;
```

- `NULL` = sem piso por transação (comportamento atual de todos os planos existentes).
- Plano Escalável recebe `min_fee_per_transaction_usd = 30.00`.

### 2. `orders` — snapshot da taxa mínima no momento do pedido

```sql
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subscription_min_fee_per_transaction_usd NUMERIC(10,2) DEFAULT NULL;
```

Snapshotado junto com os demais campos do plano no trigger, para auditabilidade
histórica (o piso pode mudar no plano sem afetar ordens antigas).

### 3. `office_amounts_ledger` — coluna espelho

```sql
ALTER TABLE public.office_amounts_ledger
  ADD COLUMN IF NOT EXISTS min_fee_per_transaction_usd NUMERIC(10,2) DEFAULT NULL;
```

Seguir o mesmo padrão das outras colunas já sincronizadas pelo trigger
`sync_office_amounts_ledger`.

### 4. Função auxiliar SQL — detecção de main visa

Criar uma função reutilizável para evitar lista de slugs espalhada pelo código:

```sql
CREATE OR REPLACE FUNCTION public.is_main_visa_slug(p_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_slug = ANY(ARRAY[
    'visto-b1-b2', 'visa-b1b2',
    'visto-f1',    'visa-f1',   'visa-f1f2',
    'extensao-status', 'visa-eos',
    'troca-status',    'visa-cos'
  ]);
$$;
```

> Se um novo slug de main visa for adicionado ao catálogo `slugs.ts`,
> esta função deve ser atualizada na mesma migração.

### 5. Atualização do trigger `set_order_subscription_snapshot`

**Arquivo:** `supabase/migrations/20260511212000_orders_subscription_snapshot_and_office_amounts_ledger.sql`
(recriar via nova migration — nunca editar a migration original).

**Mudanças no `DECLARE`:**
```sql
v_min_fee_per_tx  NUMERIC(10,2);
```

**Mudança na query de leitura do plano:**
```sql
SELECT os.plan_id,
       p.percentage_fee,
       coalesce(p.available_after_minutes, 20160),
       p.min_fee_per_transaction_usd          -- novo
  INTO v_plan_id, v_percentage, v_available_minutes, v_min_fee_per_tx
  FROM public.office_subscriptions os
  JOIN public.subscription_plans p ON p.id = os.plan_id
 WHERE os.office_id = new.office_id
   AND os.status    = 'active'
 ORDER BY os.created_at DESC
 LIMIT 1;
```

**Aplicação do piso (após calcular `v_fee`):**
```sql
v_fee := round((v_gross * v_percentage) / 100.0, 2);

-- Aplicar taxa mínima por transação apenas em main visas
IF v_min_fee_per_tx IS NOT NULL
   AND public.is_main_visa_slug(coalesce(new.product_slug, ''))
   AND v_fee < v_min_fee_per_tx
THEN
  v_fee := v_min_fee_per_tx;
END IF;
```

**Snapshot para o order:**
```sql
new.subscription_min_fee_per_transaction_usd := v_min_fee_per_tx;
```

### 6. Atualização do trigger `sync_office_amounts_ledger`

Incluir a nova coluna no `INSERT ... ON CONFLICT DO UPDATE`:

```sql
-- Na lista de colunas do INSERT:
min_fee_per_transaction_usd,

-- No VALUES correspondente:
coalesce(new.subscription_min_fee_per_transaction_usd, null),

-- No ON CONFLICT DO UPDATE:
min_fee_per_transaction_usd = excluded.min_fee_per_transaction_usd,
```

### 7. Seed do Plano Escalável

```sql
INSERT INTO public.subscription_plans (
  name,
  plan_type,
  monthly_fee,
  percentage_fee,
  min_fee_per_transaction_usd,
  available_after_minutes
) VALUES (
  'Scalable',
  'PERCENTAGE',
  0.00,
  <PERCENTUAL_DEFINIDO_PELO_PRODUTO>,  -- ex: 8.00 (%)
  30.00,
  20160  -- 14 dias (padrão)
)
ON CONFLICT DO NOTHING;
```

> O percentual exato deve ser definido pelo time de produto antes da migration.

---

## Fluxo completo de um pedido no Plano Escalável

```
Cliente paga $200 em visa B1/B2
Plano: 8% com min_fee_per_transaction = $30

fee_calculada = 200 × 8 / 100 = $16,00
$16,00 < $30,00  →  fee aplicada = $30,00
net_office      = $200 - $30 = $170,00
```

```
Cliente paga $600 em visa F1
Plano: 8% com min_fee_per_transaction = $30

fee_calculada = 600 × 8 / 100 = $48,00
$48,00 ≥ $30,00  →  fee aplicada = $48,00
net_office      = $600 - $48 = $552,00
```

```
Cliente paga $50 em mentoria (auxiliar)
Plano: 8% — mas isAuxiliary = true → piso NÃO se aplica

fee_calculada = 50 × 8 / 100 = $4,00
fee aplicada  = $4,00  (sem piso)
net_office    = $46,00
```

---

## Checklist de implementação

- [ ] Migration: `ALTER TABLE subscription_plans ADD COLUMN min_fee_per_transaction_usd`
- [ ] Migration: `ALTER TABLE orders ADD COLUMN subscription_min_fee_per_transaction_usd`
- [ ] Migration: `ALTER TABLE office_amounts_ledger ADD COLUMN min_fee_per_transaction_usd`
- [ ] Migration: `CREATE FUNCTION is_main_visa_slug`
- [ ] Migration: recriar `set_order_subscription_snapshot` com piso por transação
- [ ] Migration: recriar `sync_office_amounts_ledger` com nova coluna
- [ ] Migration: seed do plano Scalable com `min_fee_per_transaction_usd = 30.00`
- [ ] Atualizar `is_main_visa_slug` sempre que novo slug de main visa for adicionado ao catálogo
- [ ] Verificar view `v_finance_analytics_transactions` — `platformFeeAmount` já lê de `office_fee_amount_usd`, não precisa de ajuste

---

## Arquivos tocados

| Arquivo | Mudança |
|---------|---------|
| `supabase/migrations/2026XXXX_scalable_plan_min_fee_per_transaction.sql` | Migration principal (nova) |
| `supabase/functions/_shared/domain/catalog/slugs.ts` | Manter lista de main visas em sync com `is_main_visa_slug` |
