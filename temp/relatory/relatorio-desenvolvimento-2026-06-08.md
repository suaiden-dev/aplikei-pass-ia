# Relatório De Desenvolvimento (Hoje - 08/06/2026)

Contexto analisado:

- Repositório:

/home/vileladev/Projects/aplikei

- Branch atual:

task-anderson_vilela

- Autor Git configurado:

Anderson-Vilela-op

<andersonlucash.al@gmail.com>

- Janela considerada:

2026-06-08 00:00:00 até 2026-06-08 23:59:59 (-0300)

- Worktree:

Possui alterações não comitadas. Foram encontrados 35 arquivos modificados e 5 arquivos novos pendentes.

---

## 1. Resumo Executivo

O trabalho de hoje concentrou-se em refatoração visual das páginas públicas, correções de fluxo no checkout/login, ajustes no Page Builder e implementação da regra de taxa mínima do Plano Escalável.

Totais do dia:

- 4 commits registrados no Git.
- 3 commits com alterações diretas e 1 merge.
- Commits do dia: 17 entradas de arquivos, +966 linhas adicionadas / -451 linhas removidas.
- Worktree pendente: 40 entradas de arquivos, aproximadamente +1329 linhas adicionadas / -330 linhas removidas.
- Total aproximado incluindo pendências: 57 entradas de arquivos, +2295 linhas adicionadas / -781 linhas removidas.

Principais eixos trabalhados:

- redesign/refatoração das páginas públicas `servicos`, `contato` e `quem-somos`;
- correção de rotas públicas, separando `/` como página de desenvolvimento e `/landing` como homepage configurada;
- ajuste do formulário de contato para envio de email para `admin@aplikei.com`;
- correções no fluxo de checkout, incluindo validação do aceite de termos;
- inclusão dos campos ausentes no I-539 e extensão, com preenchimento no PDF e tooltips multilíngues;
- correções visuais e de merge em `products`, `application flows` e cards;
- Page Builder com deploy live/off e publicação de template via `/:slug`;
- site template responsivo, somente tema claro, link correto de login e uso de `office_id`;
- implementação da spec de taxa mínima por transação no Plano Escalável;
- testes para a regra de taxa mínima;
- exibição da taxa mínima em `My Subscription` e no modal de confirmação;
- ajustes de navegação para `track-my-visa`;
- melhoria da sidebar mobile com idioma, tema e perfil.

---

## 2. Commits De Hoje

| Hash | Horário | Mensagem |
|------|---------|----------|
| `efeaa91` | 16:01 -0300 | `fix: i539` |
| `d629e67` | 14:20 -0300 | `fix: resolve link` |
| `b46e9b7` | 14:14 -0300 | `Merge branch 'developer' into task-anderson_vilela` |
| `c820539` | 14:13 -0300 | `feat: homepage` |

Resumo por commit:

### `c820539` - feat: homepage

- 4 arquivos modificados.
- +805 linhas adicionadas / -359 linhas removidas.
- Refatoração das páginas públicas:
  - `src/features/marketing/pages/ContactPage/index.tsx`
  - `src/features/marketing/pages/QuemSomosPage/index.tsx`
  - `src/features/marketing/pages/ServicosPage/index.tsx`
  - `src/shared/components/organisms/ContactSection.tsx`

### `d629e67` - fix: resolve link

- 4 arquivos modificados.
- +19 linhas adicionadas / -21 linhas removidas.
- Correção de links e rotas públicas:
  - `src/app/config/site.ts`
  - `src/app/layouts/PublicLayout.tsx`
  - `src/app/router/appRoutes.tsx`
  - `src/features/marketing/pages/ContactPage/index.tsx`

### `b46e9b7` - merge

- Merge da branch `developer` em `task-anderson_vilela`.

### `efeaa91` - fix: i539

- 9 arquivos modificados.
- +142 linhas adicionadas / -71 linhas removidas.
- Correções em:
  - I-539 e extensão;
  - traduções do onboarding;
  - página de produtos;
  - validação de termos no checkout.

---

## 3. Alterações Por Tema

### 3.1 - Páginas Públicas: Services, Contato E Quem Somos

Arquivos principais:

- `src/features/marketing/pages/ServicosPage/index.tsx`
- `src/features/marketing/pages/ContactPage/index.tsx`
- `src/features/marketing/pages/QuemSomosPage/index.tsx`
- `src/shared/components/organisms/ContactSection.tsx`

Mudanças:

- Refatoração visual das páginas públicas para ficarem mais próximas da nova homepage.
- Remoção do modelo visual antigo em partes que tinham ficado duplicadas após merge.
- Ajustes de responsividade e espaçamento.
- Correção de cards sobrepostos na tela de contato.
- Ajuste do componente de métrica que estava muito baixo na página `quem-somos`.
- Troca de `Automação de formulários e cartas` para `automacao de processos`.
- Migração visual para classes Tailwind, reduzindo dependência de arquivos CSS separados.

### 3.2 - Roteamento Público E Homepage

Arquivos principais:

- `src/app/config/site.ts`
- `src/app/layouts/PublicLayout.tsx`
- `src/app/router/appRoutes.tsx`

Mudanças:

- Ajuste para `/` funcionar como página de desenvolvimento.
- `/landing` mantida como homepage pública configurada via `src/app/config/site.ts`.
- Correções para usar a porta correta `5173`.
- Remoção da rota duplicada `/track-my-case`.
- Padronização da rota pública de acompanhamento para `/track-my-visa`.

### 3.3 - Products E Application Flows

Arquivo principal:

- `src/features/admin/pages/ProductsPage/index.tsx`

Mudanças:

- Correção de problema de merge onde o modelo antigo ficou acima do novo.
- Reposicionamento de `application flows` ao lado, como estava antes.
- Remoção de usos de `font-black`.
- Padronização para `font-semibold` e pesos regulares em `application flows` e cards como `main visas`, `active` e `avg. ticket`.

### 3.4 - Checkout E Termos

Arquivos principais:

- `src/features/payments/pages/CheckoutPage/index.tsx`
- `src/features/payments/pages/OfficeCheckoutPage/index.tsx`

Mudanças:

- Correção do checkbox de aceite de termos no checkout.
- O erro `Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.` deixou de aparecer quando o checkbox está marcado.
- Ajustes relacionados ao fluxo legal e validação antes de continuar checkout.

### 3.5 - I-539 E Extension

Arquivos principais:

- `src/features/onboarding/cos/lib/i539.ts`
- `src/features/onboarding/cos/pages/COSOnboardingPage/I539FormStep.tsx`
- `src/features/onboarding/cos/schemas/i539.schema.ts`
- `src/app/i18n/locales/pt/onboarding.ts`
- `src/app/i18n/locales/en/onboarding.ts`
- `src/app/i18n/locales/es/onboarding.ts`

Mudanças:

- Inclusão dos campos ausentes:
  - `Total number of people in the application`;
  - `Name of the school you will attend`.
- Preenchimento desses campos no PDF I-539.
- Ajuste também para o fluxo de extensão.
- Inclusão de ícones de informação e explicações dos campos.
- Traduções adicionadas em português, inglês e espanhol, seguindo o padrão já usado nos outros campos.

### 3.6 - Padronização De Marca

Arquivos afetados:

- Template do Page Builder.
- Páginas públicas e configurações onde aplicável.

Mudanças:

- Substituição de ocorrências de `Premium Visa Advisory` por `Aplikei`.
- Ajustes no template público para evitar exibição de marca antiga.

### 3.7 - Page Builder: Deploy Live/Off E Publicação Via Slug

Arquivos principais:

- `src/features/page-builder/pages/PageBuilderPage/index.tsx`
- `src/features/page-builder/pages/PageBuilderPage/hooks/usePageBuilder.ts`
- `src/features/page-builder/pages/PageBuilderPage/components/InspectorPanel.tsx`
- `src/features/page-builder/pages/PageBuilderPage/lib/templateHtml.ts`
- `src/features/page-builder/pages/PageBuilderPage/templates/LandingTemplate.tsx`
- `src/features/page-builder/pages/PageBuilderPage/types.ts`
- `src/features/page-builder/pages/PublicLandingPage/index.tsx`
- `src/app/router/appRoutes.tsx`

Mudanças:

- Criação do botão de deploy no Page Builder.
- Estado `live` ou `off` para controlar publicação do template.
- Quando `live`, o template pode ser acessado via `/:slug`.
- Criação da página pública `PublicLandingPage`.
- Inclusão da rota dinâmica `/:slug`.
- Salvamento do estado de publicação no banco via configuração do Page Builder.
- Exibição e cópia da URL pública gerada pelo slug.

### 3.8 - Site Template

Arquivos principais:

- `src/features/page-builder/pages/PageBuilderPage/templates/LandingTemplate.tsx`
- `src/features/page-builder/pages/PageBuilderPage/lib/templateHtml.ts`

Mudanças:

- Correções de responsividade mobile no template.
- Remoção do tema escuro, mantendo somente tema claro.
- Remoção do toggle de tema do template publicado.
- Correção do link de login.
- Troca de `acompanhar-meu-caso` / `track-my-case` para `track-my-visa`.
- Passagem de `office_id` para permitir carregar logo e configurações do escritório.
- Conferência dos itens de `landing configuration` usados dentro do site template.

### 3.9 - Navegação Pública E Acompanhamento De Caso

Arquivos principais:

- `src/shared/components/organisms/PublicNavbar.tsx`
- `src/shared/components/organisms/DashboardNavbar.tsx`
- `src/app/router/appRoutes.tsx`
- `src/app/layouts/RoleDashboardLayout.tsx`

Mudanças:

- Remoção da rota antiga `/track-my-case`.
- Public navbar agora aponta para `/track-my-visa`.
- Correção de logout/redirecionamento de cliente para `/track-my-visa`.
- Ajuste de textos e links que ainda apontavam para `my-case`.

### 3.10 - Plano Escalável: Taxa Mínima Por Transação

Arquivos principais:

- `specs/scalable-plan-min-fee.md`
- `supabase/migrations/20260608120000_scalable_plan_min_fee_per_transaction.sql`
- `supabase/functions/_shared/domain/catalog/slugs.ts`
- `supabase/functions/_shared/domain/catalog/slugs.test.ts`
- `supabase/migrations/scalable-plan-min-fee.test.ts`
- `vitest.config.ts`

Mudanças:

- Implementação da spec de taxa mínima para o Plano Escalável.
- Nova coluna `min_fee_per_transaction_usd` em `subscription_plans`.
- Snapshot da taxa mínima em `orders`.
- Espelhamento da taxa mínima em `office_amounts_ledger`.
- Função SQL `is_main_visa_slug`.
- Regra:
  - para main visas, a taxa aplicada é `max(valor calculado por percentual, taxa mínima)`;
  - para serviços auxiliares, a taxa mínima não se aplica.
- Inclusão de slugs principais no catálogo compartilhado.
- Inclusão de testes para slugs e migration.
- Configuração do Vitest para incluir testes em `supabase/**/*.{test,spec}.ts?(x)`.

### 3.11 - My Subscription E Modal De Confirmação

Arquivos principais:

- `src/features/admin/hooks/useSubscription.ts`
- `src/features/admin/pages/SubscriptionPage/index.tsx`
- `src/app/i18n/locales/en/admin.ts`
- `src/app/i18n/locales/pt/admin.ts`

Mudanças:

- `useSubscription` agora carrega `minFeePerTransactionUsd`.
- Card `My Subscription` mostra a informação da taxa mínima quando aplicável.
- Modal de confirmação de assinatura mostra o aviso:
  - se a taxa calculada dos main visas ficar abaixo de USD 30, a Aplikei cobra o valor mínimo fixo.
- Correção do placeholder `{{amount}}`, que agora é substituído por valor formatado em USD.
- Refatoração visual da página para visual mais limpo.
- Remoção de `font-black` em áreas ajustadas, usando `font-semibold` e pesos regulares.

### 3.12 - Banner De Assinatura E Sidebar Mobile

Arquivos principais:

- `src/app/layouts/RoleDashboardLayout.tsx`
- `src/shared/components/organisms/DashboardNavbar.tsx`

Mudanças:

- Correção do botão `Activate now`, que levava para 404.
- Botão passa a navegar para `/admin/subscription`.
- Sidebar mobile agora mostra:
  - perfil;
  - seletor de idioma;
  - toggle de tema;
  - logout.
- Mantido o comportamento desktop separado, evitando duplicação visual indevida.
- Ajustes visuais no cabeçalho do dashboard e no estado de feature bloqueada.

### 3.13 - Formulário De Contato

Arquivos principais:

- `src/shared/components/organisms/ContactSection.tsx`
- `supabase/functions/contact-form/index.ts`
- `supabase/functions/_shared/application/contact-form/send.ts`
- `supabase/functions/_shared/notifications/providers/smtp.ts`

Mudanças:

- O formulário de `/contato` chama a edge function `contact-form`.
- Destinatário configurado para `admin@aplikei.com`.
- Assunto do email:
  - `Aplikei Demo: {nome}`.
- Corpo do email inclui:
  - `Name`;
  - `Email`;
  - `Subject`;
  - `Message`.
- Ajuste do provider SMTP para permitir assunto direto sem prefixo extra nesse email.
- Remoção do CTA do portal nesse email específico.
- Escape de HTML no conteúdo para reduzir risco de injeção via formulário.

### 3.14 - Análise De Segurança

Foi feita uma revisão dos pontos mais sensíveis observados durante o desenvolvimento.

Pontos destacados:

- formulários públicos chamando edge functions precisam de validação server-side;
- templates publicados por slug exigem controle claro de `live/off`;
- links de login/acompanhamento precisam evitar rotas duplicadas e obsoletas;
- conteúdo HTML gerado ou enviado por usuário deve ser escapado quando renderizado ou enviado por email;
- regras financeiras precisam de snapshot auditável para não depender de alterações futuras de plano.

---

## 4. Arquivos Pendentes Na Worktree

Arquivos modificados:

- `src/app/i18n/locales/en/admin.ts`
- `src/app/i18n/locales/pt/admin.ts`
- `src/app/layouts/AdminDashboardLayout.tsx`
- `src/app/layouts/AuthLayout.tsx`
- `src/app/layouts/CustomerLayout.tsx`
- `src/app/layouts/MasterDashboardLayout.tsx`
- `src/app/layouts/RoleDashboardLayout.tsx`
- `src/app/layouts/SellerDashboardLayout.tsx`
- `src/app/router/appRoutes.tsx`
- `src/app/router/authGuard.test.ts`
- `src/app/router/authGuard.ts`
- `src/app/router/authRedirect.test.ts`
- `src/app/router/authRedirect.ts`
- `src/features/admin/hooks/useSubscription.ts`
- `src/features/admin/pages/RevenuePage/index.tsx`
- `src/features/admin/pages/SubscriptionPage/index.tsx`
- `src/features/auth/pages/ForgotPasswordPage.tsx`
- `src/features/auth/pages/LoginPage.tsx`
- `src/features/auth/pages/ResetPasswordPage.tsx`
- `src/features/auth/pages/SignUpPage.tsx`
- `src/features/auth/services/mockAuthService.ts`
- `src/features/legal/pages/LegalLayout.tsx`
- `src/features/offices/services/officeOps.ts`
- `src/features/page-builder/pages/PageBuilderPage/components/InspectorPanel.tsx`
- `src/features/page-builder/pages/PageBuilderPage/hooks/usePageBuilder.ts`
- `src/features/page-builder/pages/PageBuilderPage/index.tsx`
- `src/features/page-builder/pages/PageBuilderPage/lib/templateHtml.ts`
- `src/features/page-builder/pages/PageBuilderPage/templates/LandingTemplate.tsx`
- `src/features/page-builder/pages/PageBuilderPage/types.ts`
- `src/shared/components/organisms/DashboardNavbar.tsx`
- `src/shared/components/organisms/PublicNavbar.tsx`
- `supabase/functions/_shared/application/contact-form/send.ts`
- `supabase/functions/_shared/domain/catalog/slugs.ts`
- `supabase/functions/_shared/notifications/providers/smtp.ts`
- `vitest.config.ts`

Arquivos novos:

- `specs/scalable-plan-min-fee.md`
- `src/features/page-builder/pages/PublicLandingPage/index.tsx`
- `supabase/functions/_shared/domain/catalog/slugs.test.ts`
- `supabase/migrations/20260608120000_scalable_plan_min_fee_per_transaction.sql`
- `supabase/migrations/scalable-plan-min-fee.test.ts`

---

## 5. Validações Executadas

Validações executadas durante o trabalho:

- `npm run build`
  - Resultado: passou.
- `npx eslint supabase/functions/_shared/notifications/providers/smtp.ts supabase/functions/_shared/application/contact-form/send.ts src/shared/components/organisms/ContactSection.tsx`
  - Resultado: passou.
- Validações anteriores relacionadas ao visual/subscription também foram executadas:
  - build passou;
  - eslint apontou apenas warnings já existentes em arquivos de layout/subscription.

---

## 6. Observações Finais

A worktree não está limpa. Há mudanças importantes ainda pendentes, especialmente em Page Builder, publicação por slug, Plano Escalável, sidebar mobile, assinatura e formulário de contato.

Antes de fechar o dia com commit final, recomenda-se:

- revisar rapidamente o diff pendente;
- rodar novamente `npm run build`;
- rodar os testes do Vitest relacionados ao Plano Escalável;
- commitar as alterações pendentes em um ou mais commits temáticos.

---

# Relatório De Desenvolvimento (09/06/2026)

## 1. Resumo Executivo

O trabalho deste dia concentrou-se em duas frentes complementares: (1) migração de todas as strings de toast hardcoded do feature `admin` para o sistema de i18n existente, com adição das chaves faltantes nos locales `en` e `pt`; (2) aplicação das melhorias de qualidade de código identificadas em análise técnica da base.

Totais do dia:

- Arquivos modificados: 44+
- Novas chaves i18n adicionadas: 30+
- `as any` eliminados de `ProcessDetailPage`: 49 ocorrências substituídas por tipagem real (`StepData`)
- Query keys inline eliminadas: 34 ocorrências centralizadas
- Testes: 101/101 Vitest passando; Playwright 44/47 (3 falhas pré-existentes, sem regressões introduzidas)

---

## 2. Migração de Strings para i18n

### 2.1 - Novas chaves adicionadas nos locales

Arquivos alterados:

- `src/app/i18n/locales/en/admin.ts`
- `src/app/i18n/locales/pt/admin.ts`

Chaves adicionadas:

- `products.messages`: `configSaved`, `configError`, `invalidPrice` (com `{{name}}`), `linkCopied`, `loginUrlCopied`, `noSlug`
- `teams.messages` (novo): `activated`, `rejected`, `roleUpdated`, `removed`, `linkError`
- `subscription.modals`: `planActivated` (com `{{name}}`), `activateError`
- `companyProfile.messages`: `logoUploadSuccess`, `logoUploadError`, `slugConflict`
- `payoutSettings.messages`: `enableAtLeastOne`, `requestCreated`
- `discountRules.messages` (novo): `officeNotFound`, `saveSuccess`, `saveError`
- `plansPage.messages` (novo): `saveError`, `loadError`, `updateSuccess`
- `officeModal.messages` (novo): `nameRequired`, `selectOffice`, `duplicateName` (com `{{name}}`)
- `withdrawalModal.messages`: `stripeRequired`

### 2.2 - Hooks migrados

- `src/features/admin/hooks/useTeams.ts` — adicionado `useT("admin")`; 5 toasts migrados
- `src/features/admin/hooks/useProductsPage.ts` — 3 toasts migrados
- `src/features/admin/hooks/useSubscriptionPage.ts` — 2 toasts migrados
- `src/features/admin/hooks/useWithdrawals.ts` — adicionado `useT("admin")`; 2 toasts migrados

### 2.3 - Páginas migradas

- `src/features/admin/pages/CompanyProfilePage/index.tsx` — 3 toasts
- `src/features/admin/pages/billings/PaymentSettingsPage/index.tsx` — 1 toast
- `src/features/admin/pages/DiscountRulesPage/index.tsx` — adicionado `useT`; 3 toasts
- `src/features/admin/pages/PlansPage/index.tsx` — adicionado `useT` em dois componentes; 3 toasts
- `src/features/admin/pages/ProductsPage/index.tsx` — adicionado `useT`; 3 toasts
- `src/features/admin/components/OfficeModal.tsx` — adicionado `useT`; 3 toasts
- `src/features/admin/components/WithdrawalModal.tsx` — 1 toast

---

## 3. Correção de Runtime Crash em ProcessDetailPage

**Arquivo:** `src/features/admin/pages/ProcessDetailPage/index.tsx`

**Causa:** O código acessava `t.motion.*` e `t.rfe.*` como chaves de topo do namespace `admin`, mas as chaves reais estão em `t.processDetail.motion.*` e `t.processDetail.rfe.*`. Resultado: `Cannot read properties of undefined (reading 'clientReasonLabel')` no console do browser.

**Correção:** Substituição global (`replace_all`) de todos os acessos `t.motion.` → `t.processDetail.motion.` e `t.rfe.` → `t.processDetail.rfe.` no arquivo.

---

## 4. Correções de Testes (Vitest)

Quatro falhas pré-existentes corrigidas:

| Arquivo | Causa | Correção |
|---------|-------|----------|
| `authGuard.test.ts` | Esperava `/login-office` mas authGuard foi unificado para `/login` | Atualizado valor esperado |
| `financeAnalyticsService.test.ts` | Serviço passou a fazer query secundária `from("orders").in(...)` depois que o teste foi escrito | Mock de `supabase.from` refatorado para retornar stubs diferentes por table name |
| `FinanceAnalyticsPage/index.test.tsx` | (1) `getOfficeSalesMetricsByDateRange` não mockado causava erro; (2) fixtures de transação sem `officeNetAmount`/`platformFeeAmount` causavam crash no render | Adicionado mock da função e campos ausentes nas fixtures |
| `chatIntegration.test.ts` | `localStorage.clear()` lançava TypeError em contexto jsdom sem localStorage | Adicionado guard `typeof localStorage !== "undefined"` |

---

## 5. Melhorias de Qualidade de Código

### 5.1 - Centralização de Query Keys do React Query

**Arquivo criado:** `src/features/admin/lib/queryKeys.ts`

Problema: 34 query keys eram strings literais inline, duplicadas entre hooks. Uma typo impede invalidação silenciosamente.

Solução: Objeto `adminQueryKeys` com funções tipadas para cada chave. Todos os 10 hooks do feature `admin` atualizados para usar as funções centralizadas:

- `useAdminOverview.ts` — 4 chaves migradas
- `useMasterOverview.ts` — 5 chaves migradas
- `useSubscription.ts` — 2 chaves migradas
- `useProductsPage.ts` — 3 chaves migradas
- `useTeams.ts` — 4 chaves migradas
- `useSubscriptionPage.ts` — 5 chaves migradas
- `useAdminRoles.ts` — 2 chaves migradas
- `useRevenuePage.ts` — 2 chaves migradas
- `useZellePayments.ts` — 2 chaves migradas
- `useWithdrawals.ts` — 3 chaves migradas

### 5.2 - Tipagem de StepData

**Arquivo alterado:** `src/features/process/types.ts`

Problema: `StepData` era `{ [key: string]: unknown }`, obrigando 49 usos de `as any` em `ProcessDetailPage` para acessar campos conhecidos como `seller_id`, `current_step`, `history`, `coverLetter`, etc.

Solução: Adicionados 25 campos nomeados à interface `StepData`, mantendo o index signature `[key: string]: unknown` para campos dinâmicos. Todos os `(proc.step_data as any)`, `(processRow.service_metadata as any)` e equivalentes em `ProcessDetailPage` substituídos por `(... as StepData)`.

Benefício: TypeScript agora valida acesso a esses campos em tempo de compilação — um typo como `.seler_id` vira erro, não silêncio.

### 5.3 - Remoção de console.log de Produção

**Arquivo:** `src/features/admin/services/couponService.ts`

Removido `console.log("Validating coupon:", code, "for service:", slug)` de dentro da função `validateCoupon` (stub que sempre retorna inválido). Parâmetros não utilizados renomeados para `_code` e `_slug` para evitar warnings de linter.

### 5.4 - Tipagem de roleLabels em RolesPage

**Arquivo:** `src/features/admin/pages/RolesPage/index.tsx`

Substituídos 2 usos de `(t.shared.roleLabels as any)[key]` por `(t.shared.roleLabels as Record<string, string>)[key]` — cast mais preciso que documenta a intenção sem recorrer a `any`.

### 5.5 - landing_page_config tipado em ProcessDetailPage

**Arquivo:** `src/features/admin/pages/ProcessDetailPage/index.tsx`

Substituído `(ownOfficeData.landing_page_config as any)?.logoUrl` por extração com tipagem explícita:
```ts
const landingConfig = ownOfficeData.landing_page_config as Record<string, unknown> | null;
setOfficeLogoUrl(ownOfficeData.logo_url ?? (landingConfig?.logoUrl as string | null) ?? null);
```

---

## 6. Validações Executadas (09/06/2026)

- `npm run build` — ✓ passou (zero erros TypeScript)
- `npx vitest run` — ✓ 101/101 testes passando
- `npx playwright test` — 44/47 passando; 3 falhas pré-existentes (`eos-onboarding.spec.ts:5`, `eos-onboarding.spec.ts:19` — EOS não implementado; `b1b2-onboarding.spec.ts:44` — flaky sob carga paralela, passa isolado)

---

## 7. Dívidas Técnicas Documentadas (não corrigidas neste ciclo)

| Item | Complexidade | Impacto |
|------|-------------|---------|
| `ProcessDetailPage` com 3 506 linhas — 8 seções distintas sem separação em componentes | Alta | Manutenibilidade |
| 10 páginas admin com `useState(loading)` manual em vez de React Query | Média | Consistência, UX |
| `adminCustomerService.ts:165` — TODO com arrays estáticos vazios (feature inacabada) | Média | Funcionalidade (`CustomersPage` sempre renderiza vazio) |
| `tsconfig.app.json` sem `strict: true` — `noUnusedLocals` e `noUnusedParameters` desabilitados | Baixa (habilitar) / Alta (corrigir erros) | Segurança de tipos |
| Cobertura de testes: 1 serviço e 1 página testados de 15+ serviços e 20+ páginas no feature `admin` | Alta | Regressões futuras |
