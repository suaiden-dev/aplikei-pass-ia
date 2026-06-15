# Spec: Migrar identificação de escritório por `office_id` (UUID) para `office` (slug) em fluxos voltados ao cliente

## Contexto

No Page Builder, o link de "Login"/"Entrar" e o botão "Acompanhar Caso" já foram
migrados de `?office_id=<uuid>` para `?office=<slug>` (ver `templateHtml.ts` /
`usePageBuilder.ts`). O objetivo dessa migração é não expor UUIDs internos em URLs
públicas e tornar os links legíveis/compartilháveis (`?office=silva-law`).

Hoje o app está em um **estado misto**: algumas rotas/CTAs já usam `office`
(slug), outras ainda usam `office_id`/`officeId` (UUID), e o `CheckoutPage`
(`/checkout/:slug`) trata **qualquer um dos três parâmetros como se fosse o
mesmo valor** — o que quebra quando o valor recebido é um slug.

Este documento mapeia todos os pontos voltados ao cliente que ainda usam
`office_id`/UUID e propõe o plano de migração para `office` (slug), seguindo o
mesmo padrão já adotado em `/login`, `/track-my-visa` e `/checkout` (rota
`OfficeCheckoutPage`).

---

## Estado atual por rota

### ✅ Já usa slug (`office=<slug>`)

- `src/features/page-builder/pages/PageBuilderPage/lib/templateHtml.ts`
  - `normalizeLoginHref` → `/track-my-visa?office=<slug>`
  - `normalizeProfessionalLoginHref` → `/login?office=<slug>`
  - `buildCheckoutUrl` (linha ~140) → `/checkout?office=<slug>&product=<slug>`
- `src/features/payments/pages/OfficeCheckoutPage/index.tsx`
  - Rota `/checkout` (sem `:slug`) lê `searchParams.get("office")` e resolve via
    `fetchOfficeBySlug` (`checkoutPageService.ts`).
- `src/features/payments/pages/ShortLinkPage/index.tsx`
  - Decodifica o token curto (`/l/:token`) e redireciona para
    `/checkout?office=<slug>&product=<slug>&ref=<uuid>`.
- `src/features/auth/pages/LoginPage.tsx` + `authService.fetchOfficeLogo`
  - Já aceitam `office` (slug) com fallback para `office_id` (UUID legado).

### ⚠️ Ainda usa UUID (`office_id` / `officeId`)

1. **`src/features/payments/pages/CheckoutPage/index.tsx`** (rota `/checkout/:slug`)
   - Linha 231: `officeIdParam = searchParams.get("office_id") || searchParams.get("officeId") || searchParams.get("office")`
     — aceita os três nomes, mas **trata o valor sempre como UUID** nas chamadas
     subsequentes:
     - `fetchOfficeSubscriptionStatus(officeId)` → `eq("office_id", officeId)` (tabela `v_office_current_subscription`, FK real, precisa de UUID)
     - `fetchCheckoutOfficeBrand(officeId)` → `eq("id", officeId)` (tabela `offices`, precisa de UUID)
     - `fetchOfficeServicePrice(officeId, serviceId)` → `eq("office_id", officeId)` (tabela `user_service_prices`, FK real, precisa de UUID)
   - Se o Page Builder ou outro fluxo passar `?office=silva-law` (slug) para
     `/checkout/:slug`, essas três consultas falham silenciosamente
     (`.maybeSingle()` retorna `null`) e a página perde marca do escritório,
     status de assinatura e preço customizado.

2. **Fluxos de onboarding** (B1/B2, F1, COS) — geram links para
   `/checkout/:slug` usando `office_id=<uuid>` (de `user.officeId`,
   que é sempre UUID vindo da sessão autenticada):
   - `src/features/onboarding/b1b2/pages/B1B2OnboardingPage/steps/B1B2FinalPreparationStep.tsx` (linhas 195-198, 486-489, ~516-519)
   - `src/features/onboarding/f1/pages/F1OnboardingPage/steps/F1FinalPreparationStep.tsx` (linhas 219-222, 468-471, ~480-483)
   - `src/features/onboarding/cos/pages/COSOnboardingPage/components/COSApplicationStepConnected.tsx` (linha 180) — usa `instanceId`, não `office_id` diretamente, mas a página de destino (`/checkout/:slug`) ainda herda o problema acima.
   - `src/features/onboarding/cos/pages/COSOnboardingPage/index.tsx` (linha 1096) — usa `proc_id`, idem.

   Esses fluxos só fazem sentido com UUID, pois vêm de `user.officeId`
   (sessão autenticada) — **não precisam mudar para slug**, mas o
   `CheckoutPage` precisa continuar aceitando UUID nesse caso.

3. **Logs de interação** (`checkout_logs` via `logCheckoutInteraction` /
   `logCheckoutInteractionEventually`)
   - `CheckoutPage` e `OfficeCheckoutPage` gravam `office_id: officeId` /
     `office_id: office?.id` — **correto**, é a coluna real da tabela
     (`checkout_logs.office_id` é FK UUID). Não precisa mudar; é uso interno
     de banco, não exposto na URL.

---

## Plano de migração

### 1. `CheckoutPage` (`/checkout/:slug`) — aceitar slug OU UUID

Hoje a página é alcançada de duas formas distintas:
- **Onboarding (usuário autenticado)** → `?office_id=<uuid>` (sempre UUID, correto).
- **Page Builder / links públicos** → potencialmente `?office=<slug>` (gerado
  por `buildCheckoutUrl`, que aponta para `/checkout?office=...&product=...`,
  rota `OfficeCheckoutPage` — **não** `/checkout/:slug`). Hoje não há CTA do
  Page Builder apontando para `/checkout/:slug?office=<slug>`, mas para
  manter consistência e evitar links quebrados se isso vier a existir, o
  `CheckoutPage` deve resolver `office` como slug.

Mudança proposta em `src/features/payments/pages/CheckoutPage/index.tsx`:

```ts
// antes
const officeIdParam = searchParams.get("office_id") || searchParams.get("officeId") || searchParams.get("office");

// depois
const officeIdParam = searchParams.get("office_id") || searchParams.get("officeId");
const officeSlugParam = searchParams.get("office");
```

E resolver `officeSlugParam` para um UUID real via `fetchOfficeBySlug` (já
existe em `checkoutPageService.ts`, usado por `OfficeCheckoutPage`) antes de
chamar `fetchOfficeSubscriptionStatus`, `fetchCheckoutOfficeBrand` e
`fetchOfficeServicePrice` — todas essas funções continuam recebendo UUID
internamente (são FKs reais, não precisam mudar de tipo).

```ts
const [resolvedOfficeId, setResolvedOfficeId] = useState<string | null>(officeIdParam);

useEffect(() => {
  if (officeIdParam || !officeSlugParam) return;
  fetchOfficeBySlug(officeSlugParam).then((office) => {
    if (office?.id) setResolvedOfficeId(office.id);
  });
}, [officeIdParam, officeSlugParam]);
```

`officeId` passa a ser `resolvedOfficeId` em vez de `officeIdParam` direto.

### 2. Onboarding (B1/B2, F1, COS) — sem mudança de comportamento

Mantêm `office_id=<uuid>` vindo de `user.officeId`. `CheckoutPage` continua
aceitando esse parâmetro como está (passo 1 preserva compatibilidade).

### 3. `checkoutPageService.ts` — nenhuma mudança de schema

Todas as funções que recebem `officeId` continuam recebendo UUID (FK real do
banco). `fetchOfficeBySlug` já existe e é reaproveitada.

### 4. Testes

- Adicionar caso em `templateHtml.test.ts` (ou novo teste de `CheckoutPage`)
  cobrindo:
  - `/checkout/:slug?office=<slug>` resolve marca/preço do escritório via
    `fetchOfficeBySlug`.
  - `/checkout/:slug?office_id=<uuid>` continua funcionando (regressão
    onboarding).

---

## Fora de escopo

- Páginas internas/autenticadas (`AdminLawyer`, dashboards, `/payments`, etc.)
  continuam usando `office_id` (UUID) — são FKs de banco, nunca expostas como
  slug, e não fazem parte do fluxo "voltado ao cliente".
- `checkout_logs.office_id` (coluna do banco) não muda — é UUID por design.
