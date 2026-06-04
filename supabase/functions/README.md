# Edge Functions — Guia de Extensão

## Como adicionar um slug novo

Todos os comportamentos por slug vivem em um único lugar:

```
_shared/domain/catalog/slugs.ts  →  SLUG_BEHAVIOR
```

**1. Identifique a estratégia correta:**

| Estratégia | Quando usar |
|---|---|
| `standalone` | Cria um processo próprio (ex: `visto-b1-b2`) |
| `slot-addition` | Incrementa dependentes em processo pai (ex: `dependente-adicional`) |
| `chat-only` | Anexa compra ao pai e abre chat de suporte, sem novo processo (ex: `mentoria-individual`) |
| `recovery-child` | Cria sub-processo de recuperação vinculado ao pai COS/EOS (ex: `analysis-rfe-cos`) |

**2. Adicione uma entrada em `SLUG_BEHAVIOR`:**

```ts
// antes
"meu-novo-slug": { strategy: "standalone", isAuxiliary: true },

// recovery-child com auto-advance:
"meu-recovery-slug": {
  strategy: "recovery-child",
  recoveryWorkflow: "rfe",       // ou "motion"
  autoAdvance: "rfe-analysis",   // opcional — ver seção abaixo
  isAuxiliary: true,
},
```

**3. Verifique:** `deno check supabase/functions/_shared/domain/catalog/slugs.ts`

Slugs não cadastrados funcionam via `inferSlugBehavior` (fallback por padrão de nome), mas é preferível cadastrar explicitamente.

---

## Como adicionar uma regra de auto-advance

Auto-advance atualiza o `current_step` e `negativa` do processo pai após um pagamento recovery.

**1. Crie o arquivo da regra:**

```
_shared/application/payments/auto-advance/rules/<nome>.ts
```

```ts
import { type AutoAdvanceContext, type AutoAdvanceResult } from "../context.ts";

export function applyMinhaRegra(ctx: AutoAdvanceContext): AutoAdvanceResult {
  return {
    next_step: (ctx.current_step ?? 0) + 1,
    extra_metadata: { minha_flag: true },
    next_negativa: ctx.negativa,  // ou use buildNextNegativeState(...)
  };
}
```

**2. Registre no dispatcher** (`auto-advance/index.ts`):

```ts
import { applyMinhaRegra } from "./rules/minha-regra.ts";

switch (rule) {
  case "minha-regra": return applyMinhaRegra(ctx);
  // ...
}
```

**3. Adicione o valor ao tipo** (`_shared/domain/catalog/slugs.ts`):

```ts
export type AutoAdvanceRule = "rfe-analysis" | "rfe-initial" | "motion-proposal" | "minha-regra";
```

**4. Conecte ao slug via `SLUG_BEHAVIOR`:**

```ts
"meu-slug": { strategy: "recovery-child", recoveryWorkflow: "rfe", autoAdvance: "minha-regra", isAuxiliary: true },
```

---

## Como debugar em produção

**Logs estruturados:** Todos os módulos usam `createLogger(scope)`. Cada linha de log é JSON com campos `scope`, `level`, `msg`. No painel Supabase → Edge Function Logs, filtre por:

```
scope = "apply-payment"
scope = "create-parcelow-checkout"
```

**Pagamento entrou, mas processo não avançou?**

1. Procure no log por `scope=apply-payment, level=warn` — indica compra sem proc_id ou chat-only sem pai.
2. Verifique se `register_payment_event` retornou `false` (evento duplicado): log `duplicate event skipped`.
3. Inspecione `user_services` pelo `user_id` — o processo pode ter sido criado mas o `current_step` não avançou se o slug não tem `autoAdvance`.

**Idempotência:** A função `register_payment_event` usa constraint única em `(provider, event_id)`. Se o webhook chegar duas vezes, o segundo retorna `false` e o pagamento não é processado novamente. Para forçar reprocessamento em staging, delete a linha em `payment_events`.
