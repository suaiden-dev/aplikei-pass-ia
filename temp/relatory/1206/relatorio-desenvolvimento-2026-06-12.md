# Relatório De Desenvolvimento (Hoje - 12/06/2026)

Contexto analisado:

- Repositório:

/home/vileladev/Projects/aplikei

- Branch atual:

developer

- Autor Git configurado:

Anderson-Vilela-op

<andersonlucash.al@gmail.com>

- Janela considerada:

2026-06-12 00:00:00 até 2026-06-12 23:59:59 (-0300)

- Fonte principal deste relatório:

Git local, commits registrados em 12/06/2026, worktree atual, diff pendente e comandos de validação executados durante a sessão.

- Worktree:

Possui alterações não comitadas. Antes da criação deste relatório, foram encontrados 24 arquivos alterados/novos no `git diff --stat` (+760/-111), incluindo binários de logo/favicon, um novo componente `AppLogo`, a redesenho da Home (`/landing`) e a migração de `office_id` (UUID) para `office` (slug) em fluxos do Page Builder e Checkout.

---

## 1. Resumo Executivo

O dia concentrou-se em três frentes: (1) consolidação do trabalho de Page Builder/Landing Builder iniciado no dia anterior através de merge para `developer` e ajustes de build; (2) criação/rebranding da nova Home pública (`/landing`) com seção hero, mockup de dashboard e CTA final no estilo "Pronto para escalar sua operação"; e (3) introdução do componente `AppLogo` (logo adaptável claro/escuro) com rollout em toda a navegação pública e privada, acompanhado da migração de identificação de escritório por `office_id` (UUID) para `office` (slug) em Login, Track My Visa, Checkout e Page Builder.

Totais do dia:

- 5 commits registrados no Git dentro da janela considerada (`b15b6970`, `120c5c51`, `4ddbcce8`, `db506c1e` merge, `0773248d`).
- Commits do dia: 1351+150+6+3 ≈ 1380 inserções e ~150 remoções em arquivos rastreados (detalhado na seção 2).
- Worktree pendente rastreada antes deste relatório: 24 arquivos, +760 linhas adicionadas / -111 linhas removidas (`git diff --stat`).
- Worktree pendente também possui arquivos novos não rastreados: `src/shared/components/atoms/AppLogo.tsx`, `public/logo-dark.png`, `temp/specs/checkout-office-slug-migration.md`, e o próprio diretório `temp/relatory/1206/`.
- Typecheck executado nesta sessão (`npx tsc --noEmit`): passou sem erros.

Principais eixos trabalhados:

- ajuste de prioridade do tema claro como padrão da aplicação;
- merge do trabalho de Page Builder/Discount Rules/Withdrawals (commit `120c5c51` de 11/06) para `developer`, seguido de correções de build;
- adição da nova Home pública (rota `/landing`) ao menu de navegação e pequenos ajustes em COS Onboarding e checkout success;
- redesenho da Home pública: CTA do hero, mockup de dashboard responsivo na seção final "Pronto para escalar sua operação", com correções iterativas de responsividade mobile;
- criação do componente `AppLogo` (alterna entre `/logo.png` e `/logo-dark.png` conforme o tema) e substituição de todas as referências hardcoded a `/logo.png` em navbar, footer, layouts, AuthCard, MaintenancePage e logo-loader;
- regeneração dos assets `logo.png`, `logo-dark.png`, `favicon.png`, `favicon.ico` (com fundo transparente) e atualização das tags de favicon no `index.html`;
- migração de identificação de escritório de `office_id` (UUID) para `office` (slug) em `LoginPage`/`authService.fetchOfficeLogo`, `CheckoutPage`, e Page Builder (`templateHtml.ts`, `usePageBuilder.ts`, `LandingTemplate.tsx`), documentada em `temp/specs/checkout-office-slug-migration.md`;
- ajuste de `ScrollToTop` (remoção de `setTimeout` e troca de `behavior: "smooth"` para `"auto"`);
- ajuste de `AuthLayout` para esconder a navbar apenas na rota `/track-my-visa`;
- início de melhorias no template gerado pelo Page Builder (menu mobile com hamburger e nova navegação de header) e nos controles de ordenação de seções do `InspectorPanel` (import de ícones `ArrowUp`/`ArrowDown`, ainda incompleto).

---

## 2. Commits De Hoje

| Hash | Horário | Mensagem |
|------|---------|----------|
| `b15b6970` | 10:57:27 -0300 | `Ajustado prioridade de tema claro` |
| `120c5c51` | 16:39:17 -0300 | `fix` |
| `4ddbcce8` | 16:42:01 -0300 | `ADicionada pagina home` |
| `db506c1e` | 16:45:30 -0300 | `Merge branch 'task-anderson_vilela' into developer` |
| `0773248d` | 16:58:54 -0300 | `resolve build` |

Resumo dos commits do dia:

- `b15b6970` (Matheus): 1 arquivo alterado, +1/-1 — `src/app/providers/ThemeProvider.tsx`.
- `120c5c51` (Anderson-Vilela-op): 27 arquivos alterados, +1351/-143 — trabalho de Page Builder, Discount Rules e Withdrawal History (continuação do dia 11/06), incluindo novos testes e relatórios temporários.
- `4ddbcce8` (Matheus): 3 arquivos alterados, +6/-4 — `COSOnboardingPage/index.tsx`, `checkoutSuccessService.ts`, `PublicNavbar.tsx`.
- `db506c1e` (Anderson-Vilela-op): merge de `120c5c51` (branch `task-anderson_vilela`) em `developer`, que já continha `4ddbcce8`. Diff combinado de 24 arquivos, +4013/-837.
- `0773248d` (Anderson-Vilela-op): 3 arquivos alterados, +3/-5 — `.claude/settings.local.json`, `DS160SingleFormStep.tsx`, `InspectorPanel.tsx` (correções pós-merge para resolver o build).

Observação:

- O trabalho de redesenho da Home (`/landing`), rollout do `AppLogo`, regeneração de logos/favicons e migração `office_id` → `office` (slug) ainda está em worktree pendente e não foi incluído em novo commit até o momento deste relatório.

---

## 3. Alterações Por Tema

### 3.1 - Tema Claro Como Padrão

Arquivo principal:

- `src/app/providers/ThemeProvider.tsx`

Mudanças:

- O valor inicial padrão de `theme` (quando não há preferência salva em `localStorage`) passou de `"dark"` para `"light"`.

### 3.2 - Merge Do Trabalho De Page Builder (11/06) Para `developer`

Arquivos principais (commit `120c5c51`, mergeado em `db506c1e`):

- `src/features/admin/pages/DiscountRulesPage/index.tsx`
- `src/features/admin/pages/billings/WithdrawalsPage/index.tsx`
- `src/features/admin/types.ts`
- `src/features/onboarding/b1b2/pages/B1B2OnboardingPage/steps/DS160SingleFormStep.tsx`
- `src/features/page-builder/pages/PageBuilderPage/components/InspectorPanel.tsx`
- `src/features/page-builder/pages/PageBuilderPage/components/LandingPagePreview.tsx`
- `src/features/page-builder/pages/PageBuilderPage/hooks/usePageBuilder.ts`
- `src/features/page-builder/pages/PageBuilderPage/index.tsx`
- `src/features/page-builder/pages/PageBuilderPage/lib/templateHtml.ts` (+ `templateHtml.test.ts`, novo)
- `src/features/page-builder/pages/PageBuilderPage/templates/LandingTemplate.tsx`
- `src/features/page-builder/pages/PageBuilderPage/types.ts`
- `src/features/page-builder/services/pageBuilderStorageService.ts` (+ `pageBuilderStorageService.test.ts`, novo)
- `tests/e2e/page-builder.spec.ts` (novo)
- `temp/relatory/1006/`, `temp/relatory/1106/` (relatórios temporários do dia anterior)
- `test-results/.last-run.json` e remoção de artefatos antigos de teste E2E

Mudanças:

- Trouxe para `developer` toda a expansão do Page Builder descrita no relatório de 11/06 (SEO, tema visual, seções configuráveis, upload de fotos de depoimentos, testes unitários e E2E).
- Trouxe também os ajustes de Withdrawal History (filtro por status) e Discount Rules (tooltips de explicação em inglês) do mesmo dia.

### 3.3 - Adição Da Página Home Ao Menu E Pequenos Ajustes (Matheus)

Arquivos principais (commit `4ddbcce8`):

- `src/shared/components/organisms/PublicNavbar.tsx`
- `src/features/onboarding/cos/pages/COSOnboardingPage/index.tsx`
- `src/features/payments/services/checkoutSuccessService.ts`

Mudanças:

- Adicionado link `/landing` (`t.home`) como primeiro item de `navLinks` na navbar pública.
- Em `COSOnboardingPage`, o `OnboardingStepper` (mobile e desktop) passou a forçar `stepIdx = 19` quando `uscisResult === 'approved'`, garantindo que o indicador de progresso mostre o processo como concluído nesse caso.
- `checkoutSuccessService.fetchOrderProcessId` deixou de ler a coluna `proc_id` diretamente de `orders` e passou a extrair `proc_id`/`parent_process_id` de dentro de `orders.payment_metadata` (JSON).

### 3.4 - Resolução De Build Pós-Merge

Arquivos principais (commit `0773248d`):

- `.claude/settings.local.json`
- `src/features/onboarding/b1b2/pages/B1B2OnboardingPage/steps/DS160SingleFormStep.tsx`
- `src/features/page-builder/pages/PageBuilderPage/components/InspectorPanel.tsx`

Mudanças:

- Pequenos ajustes (remoção de linha duplicada/import não utilizado) para corrigir o build após o merge de `120c5c51` com `4ddbcce8`.
- Atualização de permissões locais do Claude Code (`.claude/settings.local.json`).

### 3.5 - Redesenho Da Home Pública (`/landing`) — Hero CTA E Seção Final "Pronto Para Escalar"

Arquivos principais (worktree pendente):

- `src/features/marketing/pages/HomePage/index.tsx`
- `src/features/marketing/pages/HomePage/landing.css`

Mudanças:

- CTA primário do hero (`hero.ctaPrimary`) teve o texto alterado para "Começar agora" (pt) / "Get started now" (en) / "Comenzar ahora" (es), com estilo trocado de `lp-btn-primary` para `lp-btn-light` (botão branco em pílula).
- O mesmo texto/estilo foi aplicado ao botão da seção final de CTA (`cta.btn`).
- A seção final `id="lp-cta"` ("Pronto para digitalizar e escalar seu escritório de imigração?") foi reestruturada em um bloco `.lp-cta-block` com gradiente navy/roxo, contendo:
  - logo da Aplikei (`/logo-dark.png`);
  - grupo de avatares de clientes + badge "125+";
  - título, texto de apoio e botão "Começar agora" (`lp-btn-light`);
  - um mockup de dashboard (`DashboardMockup`) dentro de uma moldura estilo monitor (`.lp-cta-monitor`) com "pé" de monitor (`.lp-cta-monitor-stand`).
- O componente `DashboardMockup` (topbar com busca/avatar/sino, sidebar de navegação, 4 cards de estatísticas, gráfico de receita em linha, lista de tarefas, gráfico donut de status de processos e lista de processos recentes) foi recriado e posicionado dentro do monitor da seção final.
- CSS novo/ajustado para `.lp-cta-block`, `.lp-cta-grid`, `.lp-cta-copy`, `.lp-cta-logo`, `.lp-cta-mock`, `.lp-cta-monitor`, `.lp-cta-monitor-stand` e todo o bloco `.lp-dash-*` do mockup.
- Correções iterativas de responsividade mobile do mockup:
  - pé do monitor centralizado via `position: absolute; left: 50%; transform: translateX(-50%)` com `clip-path` trapezoidal;
  - grid de stat cards ajustado para `minmax(0,1fr)` e `gap: 8px` para evitar overflow do 4º card ("Conversão");
  - em telas `max-width: 600px`: ocultação da busca do topbar, dos cards de "Tarefas" e "Processos recentes", redução de paddings/fontes/donut, e cards de estatística em linha horizontal (label à esquerda, valor+badge à direita);
  - correção de `.lp-dash-body` para `grid-template-columns: 1fr` no mobile, evitando que `.lp-dash-main` ficasse restrito à largura de coluna (120px) originalmente reservada para a sidebar oculta.

### 3.6 - Componente `AppLogo` E Rollout De Logo Adaptável Ao Tema

Arquivo novo:

- `src/shared/components/atoms/AppLogo.tsx`

Arquivos principais alterados:

- `src/shared/components/organisms/PublicNavbar.tsx`
- `src/shared/components/organisms/PublicFooter.tsx`
- `src/shared/components/organisms/AuthCard.tsx`
- `src/shared/components/atoms/logo-loader.tsx`
- `src/app/layouts/CustomerLayout.tsx`
- `src/app/layouts/RoleDashboardLayout.tsx`
- `src/features/system/pages/MaintenancePage.tsx`

Mudanças:

- Criado `AppLogo`, componente que usa `useTheme()` e renderiza `/logo-dark.png` (tema dark) ou `/logo.png` (tema light) com `alt` configurável.
- `PublicNavbar`: substituída `<img src="/logo.png" ...>` por `<AppLogo className="h-12 w-auto object-contain drop-shadow-[0_8px_24px_rgba(15,23,42,0.12)]" />`.
- `PublicFooter`: substituído o texto "Aplikei" por `<AppLogo className="h-10 w-auto object-contain" />`.
- `CustomerLayout` e `RoleDashboardLayout`: logo de fallback (quando o escritório não tem logo próprio) passou a usar `AppLogo`.
- `MaintenancePage` e `logo-loader`: logos estáticos substituídos por `AppLogo` (no loader, com `brightness-110 drop-shadow-2xl`).
- `AuthCard`: `logoSrc` tornou-se prop opcional (sem default fixo); quando não informado, renderiza `AppLogo` com `alt={logoAlt}`; adicionada nova prop opcional `officeName?: string`, exibida como texto abaixo do logo.

### 3.7 - Regeneração De Assets De Logo E Favicon

Arquivos binários alterados/novos:

- `public/logo.png` (modificado, fundo transparente)
- `public/logo-dark.png` (novo)
- `public/favicon.png` (modificado)
- `public/favicon.ico` (modificado)
- `index.html`

Mudanças:

- `logo.png` e novo `logo-dark.png` foram gerados a partir do material de referência (`/tmp/.../2.png`), recortados, com fundo tornado transparente via flood-fill e cor adaptada para versão dark (`logo_dark.png` com tons claros sobre fundo escuro).
- `favicon.png`/`favicon.ico` regenerados com fundo transparente e múltiplos tamanhos (`icon:auto-resize=256,128,64,48,32,16`).
- `index.html`: tags de ícone atualizadas — `rel="icon"` agora aponta para `/favicon.ico`, `rel="alternate icon"` e `rel="apple-touch-icon"` para `/favicon.png` (antes todas apontavam para `/logo.png`).
- Todo o processo de geração de assets (via `imagemagick`/`magick`) ficou registrado como permissões adicionais em `.claude/settings.local.json`.

### 3.8 - Migração `office_id` (UUID) → `office` (Slug) Em Fluxos Voltados Ao Cliente

Arquivo de especificação (novo, não rastreado):

- `temp/specs/checkout-office-slug-migration.md`

Arquivos principais alterados:

- `src/features/auth/services/authService.ts`
- `src/features/auth/types.ts`
- `src/features/auth/pages/LoginPage.tsx`
- `src/features/payments/pages/CheckoutPage/index.tsx`
- `src/features/page-builder/pages/PageBuilderPage/lib/templateHtml.ts`
- `src/features/page-builder/pages/PageBuilderPage/hooks/usePageBuilder.ts`

Mudanças:

- `authService.fetchOfficeLogo(officeSlugOrId)`: agora detecta se o parâmetro é UUID (regex) e busca por `id` ou por `slug` na tabela `offices`; passou a retornar `{ name, src }` mesmo quando `src` é `null` (antes retornava `null` se não houvesse logo).
- `OfficeLogo.src` (em `src/features/auth/types.ts`) mudou de `string` para `string | null`.
- `LoginPage`: lê `office` (slug) com fallback para `office_id` (UUID legado); estado `officeLogo.src` agora aceita `null`; removida a antiga aba de seleção "Profissional / Cliente" (links para `/login` e `/track-my-visa`); adicionada prop `officeName` ao `AuthCard`.
- `CheckoutPage` (`/checkout/:slug`): introduzido `UUID_PATTERN`; o parâmetro recebido em `office_id`/`officeId`/`office` agora é classificado como `officeIdParam` (se UUID) ou `officeSlugParam` (se slug). Quando é slug, um novo `useEffect` chama `fetchOfficeBySlug` para resolver o UUID real (`officeIdFromSlug`) antes de buscar marca, status de assinatura e preço customizado do escritório. Adicionado estado de loading `resolvingOfficeSlug`, combinado com `resolvingOfficeId` na tela de carregamento.
- Page Builder `templateHtml.ts`: nova função `normalizeProfessionalLoginHref` (gera `/login?office=<slug>`) e nova função `replaceTrackCaseHeaderButton` (atualiza o botão "Acompanhar Caso" do header gerado com `/track-my-visa?office=<slug>`); `normalizeLoginHref` passou a aceitar/priorizar `office` (slug) em vez de `office_id`.
- Page Builder `usePageBuilder.ts`: `sanitizeLoginUrl` agora recebe `officeSlug` opcional e normaliza URLs de login para usar `office=<slug>` (removendo `office_id`/`officeId`); o link gerado para `/track-my-visa` a partir dos dados do escritório também passou a usar `office=<slug>`.
- Esses pontos seguem o plano descrito em `temp/specs/checkout-office-slug-migration.md`, que documenta o estado "antes/depois" por rota e o que ainda é aceitável continuar usando UUID (fluxos de onboarding autenticado, `checkout_logs.office_id`).

### 3.9 - `ScrollToTop` E `AuthLayout`

Arquivos principais:

- `src/shared/components/organisms/ScrollToTop.tsx`
- `src/app/layouts/AuthLayout.tsx`

Mudanças:

- `ScrollToTop`: removido o `setTimeout(..., 100)` que envolvia a lógica de scroll; `behavior: "smooth"` foi trocado por `"auto"` tanto para `window.scrollTo` quanto para os containers com `overflow-y-auto`.
- `AuthLayout`: `hideNavbar` deixou de ser sempre `false` e passou a ser `pathname === "/track-my-visa"` (navbar oculta apenas na rota de acompanhamento de caso).

### 3.10 - Melhorias Pendentes/Incompletas No Template Do Page Builder

Arquivos principais:

- `src/features/page-builder/pages/PageBuilderPage/templates/LandingTemplate.tsx`
- `src/features/page-builder/pages/PageBuilderPage/components/InspectorPanel.tsx`

Mudanças:

- `LandingTemplate.tsx`: adicionado menu mobile com botão hamburger (`.menu-toggle`, `[data-menu-toggle]`) que alterna a classe `is-open` em `.nav-actions`; header reestruturado com `.nav-actions` contendo `.nav` (links "Início", "Quem Somos", "Nossos Serviços", "Fale Conosco") e `.header-actions` (toggle de tema, botão "Acompanhar Caso" `.btn-track` apontando para `/track-my-visa`, e botão "Entrar"); novos estilos responsivos para `max-width: 1080px`.
- `InspectorPanel.tsx`: adicionados imports `ArrowDown`/`ArrowUp` de `lucide-react`, aparentemente em preparação para controles de reordenação de seções — mudança ainda incompleta (apenas o import foi alterado em relação ao estado pós-merge).

---

## 4. Arquivos Pendentes Na Worktree

Arquivos modificados rastreados (`git diff --stat`, 24 arquivos, +760/-111):

- `.claude/settings.local.json`
- `index.html`
- `public/favicon.ico` (binário)
- `public/favicon.png` (binário)
- `public/logo.png` (binário)
- `src/app/layouts/AuthLayout.tsx`
- `src/app/layouts/CustomerLayout.tsx`
- `src/app/layouts/RoleDashboardLayout.tsx`
- `src/features/auth/pages/LoginPage.tsx`
- `src/features/auth/services/authService.ts`
- `src/features/auth/types.ts`
- `src/features/marketing/pages/HomePage/index.tsx`
- `src/features/marketing/pages/HomePage/landing.css`
- `src/features/page-builder/pages/PageBuilderPage/components/InspectorPanel.tsx`
- `src/features/page-builder/pages/PageBuilderPage/hooks/usePageBuilder.ts`
- `src/features/page-builder/pages/PageBuilderPage/lib/templateHtml.ts`
- `src/features/page-builder/pages/PageBuilderPage/templates/LandingTemplate.tsx`
- `src/features/payments/pages/CheckoutPage/index.tsx`
- `src/features/system/pages/MaintenancePage.tsx`
- `src/shared/components/atoms/logo-loader.tsx`
- `src/shared/components/organisms/AuthCard.tsx`
- `src/shared/components/organisms/PublicFooter.tsx`
- `src/shared/components/organisms/PublicNavbar.tsx`
- `src/shared/components/organisms/ScrollToTop.tsx`

Arquivos novos observados (não rastreados):

- `src/shared/components/atoms/AppLogo.tsx`
- `public/logo-dark.png`
- `temp/specs/checkout-office-slug-migration.md`
- `temp/relatory/1206/relatorio-desenvolvimento-2026-06-12.md` (este relatório)

---

## 5. Validações Executadas

Comandos executados:

```bash
npx tsc --noEmit
```

Resultado:

- Passou sem erros (nenhuma saída).

Observações:

- Não foi executada a suíte completa de testes unitários (`npm run test`) nem o E2E `tests/e2e/page-builder.spec.ts` durante esta sessão de relatório.
- A verificação visual da Home redesenhada (hero e seção final "Pronto para escalar sua operação") foi feita via Playwright/screenshots em desktop e mobile (390px) ao longo da sessão, cobrindo as correções de pé do monitor, overflow do card "Conversão" e responsividade geral do mockup.

---

## 6. Pendências E Próximos Pontos De Atenção

- Commitar o conjunto pendente (redesenho da Home, rollout do `AppLogo`, assets de logo/favicon, migração `office_id` → `office`) após revisão visual final.
- Finalizar os controles de reordenação de seções no `InspectorPanel` (imports `ArrowUp`/`ArrowDown` já adicionados, mas sem uso/implementação ainda).
- Validar em ambiente real (Supabase) a busca de `offices` por `slug` em `fetchOfficeLogo` e `fetchOfficeBySlug` para os casos de `CheckoutPage` e `LoginPage`.
- Adicionar testes cobrindo `CheckoutPage` com `?office=<slug>` e `?office_id=<uuid>`, conforme previsto em `temp/specs/checkout-office-slug-migration.md` (seção "Testes").
- Revisar o novo menu mobile do `LandingTemplate.tsx` (Page Builder) quanto a acessibilidade e tradução dos links fixos ("Início", "Quem Somos", "Nossos Serviços", "Fale Conosco").
- Confirmar que `checkoutSuccessService.fetchOrderProcessId` encontra `proc_id`/`parent_process_id` corretamente em `payment_metadata` para todas as ordens existentes (mudança de coluna direta para campo JSON).
- Executar a suíte de testes unitários e o E2E do Page Builder antes do commit final.
