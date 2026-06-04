# Aplikei — Instruções para o Claude

## Edge Functions

O guia completo de extensão está em [`supabase/functions/README.md`](supabase/functions/README.md).

**Regras essenciais:**

- Toda mudança "por slug" (novo serviço, novo comportamento de pagamento) passa pelo catálogo:
  `supabase/functions/_shared/domain/catalog/slugs.ts`
- Nunca adicione predicados de slug espalhados pelo código — use `resolveSlugBehavior(slug)` ou os helpers existentes (`isRecoveryChild`, `isAuxiliaryService`, etc.).
- Logs em edge functions usam `createLogger(scope)` — não usar `console.log/warn/error` diretamente.
- Cada `index.ts` de edge function deve ter ≤ 40 linhas; toda lógica fica em `_shared/`.
