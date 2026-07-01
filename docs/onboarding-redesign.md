# Onboarding Redesign — Referência MatriculaUSA → Aplikei

**Data:** 2026-06-29

---

## Como o MatriculaUSA faz o Onboarding (referência)

### Estrutura
- **Página dedicada full-screen** (`/student/onboarding`) — não é modal flutuante
- Cada step substitui o conteúdo central — layout fixo (header + progress bar + conteúdo + footer)
- Fundo: `bg-slate-300/80 backdrop-blur-3xl` com blob decorativo no canto inferior esquerdo
- Header: logo + botão Back + notificações + link para o Dashboard

### Progress Indicator (StepIndicator)
- Card branco `rounded-3xl shadow-xl` com barra de progresso `from-blue-500 to-indigo-500`
- Barra animada: `transition-all duration-700` + glow shadow
- Texto: "STEP X OF Y" uppercase + nome do step atual em bold
- Desktop: círculos por step — ✅ concluído (emerald), ● atual (azul + `animate-pulse`), ○ futuro (cinza)
- Step atual tem `scale-110`

### Navegação
- Botões Back/Next na parte inferior do conteúdo de cada step (dentro do step, não globais)
- `window.scrollTo({ top: 0 })` com 100ms delay em cada transição
- URL sync: `?step=<key>` — browser back/forward funcionam

### Animações
- Entre seções internas (survey): `framer-motion` `y: 20→0, opacity: 0→1, duration: 0.4`
- Step dot atual: `animate-pulse`
- Overlay de sucesso de pagamento: componente dedicado `PaymentSuccessOverlay`

### Estado
- Salvo em Supabase (`user_profiles.onboarding_current_step`) a cada step
- URL sync com `?step=key`
- Draft de formulário em localStorage

---

## Onboarding Atual do Aplikei — Problemas

O modal atual (`OnboardingModal`) é um **widget flutuante no canto superior direito** (`fixed right-6 top-6`). Problemas:

| # | Problema | Impacto |
|---|---|---|
| 1 | Widget pequeno (420px) sobreposto à página — não comunica seriedade do processo | Alto |
| 2 | O usuário pode minimizar e "esquecer" do onboarding | Médio |
| 3 | Não há visibilidade do progresso global (só uma barra fina) | Alto |
| 4 | Os steps de "tour" (Overview, Processes, Team) não têm ação concreta — apenas navegam para a página | Médio |
| 5 | Mistura contexto de setup obrigatório (Company, Subscription) com tour opcional | Alto |
| 6 | Modal cobre parte do conteúdo em telas menores | Médio |
| 7 | Não é uma experiência imersiva — o usuário está no dashboard enquanto configura | Alto |

---

## Proposta de Redesign

### Conceito: Página Dedicada de Onboarding (`/admin/onboarding`)

Em vez do modal flutuante, redirecionar o advogado para uma **página dedicada full-screen** até completar o setup obrigatório. Após completar, redireciona para `/admin`.

```
/admin/onboarding?step=<key>
```

---

### Layout da Página

```
┌─────────────────────────────────────────────────────────┐
│  [Logo Aplikei]                    [Minimizar / Sair?]  │  ← Header fixo
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ●──────────●──────────○                        │   │  ← StepIndicator
│  │  Company   Subscription  Done                   │   │
│  │  STEP 1 OF 3 — Create your company              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │           [Conteúdo do Step atual]              │   │  ← Área de conteúdo
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                              [Back]  [Save & Continue →]│  ← Footer fixo
└─────────────────────────────────────────────────────────┘
```

---

### Steps Propostos (3 obrigatórios)

| # | Key | Rota destino | Completo quando |
|---|---|---|---|
| 1 | `company` | Embed form inline (não navega para outra rota) | `office.id` existe |
| 2 | `subscription` | Embed planos inline | `subscription.is_active` |
| 3 | `done` | Tela de boas-vindas + redirect `/admin` | — |

> **Diferença chave:** os formulários ficam **dentro da página de onboarding** — não navega para `/settings/company` e deixa o usuário perdido. O formulário é embutido no step.

---

### Step 1 — Company (embutido)

- Renderiza o mesmo form de `CompanyProfilePage` dentro do step
- Header do step: ícone de prédio + "Set up your company" + descrição
- Botão primário: "Save & Continue" — faz submit + se sucesso avança automaticamente
- Validação em tempo real no slug
- Ao salvar com sucesso → avança para step 2 com animação

### Step 2 — Subscription (embutido)

- Renderiza os planos disponíveis inline (mesmo conteúdo de `SubscriptionPage`)
- Após assinar → avança automaticamente para step 3

### Step 3 — Done

- Tela de celebração: ícone animado (checkmark pulsante ou confetti)
- Mensagem: "Your office is ready. Welcome to Aplikei."
- Botão "Go to Dashboard" → `/admin`
- Marcar `has_completed_onboarding = true` no DB

---

### StepIndicator (inspirado no MatriculaUSA)

```tsx
// Barra de progresso com gradiente e glow
<div
  className="h-1.5 bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(var(--primary),0.4)]"
  style={{ width: `${progress}%` }}
/>

// Círculos dos steps
// Concluído: CheckCircle verde, scale-100
// Atual: círculo azul preenchido + animate-pulse no dot interno
// Futuro: círculo vazio cinza
```

---

### Animações entre Steps

```tsx
// framer-motion — AnimatePresence + motion.div por step
<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}
    initial={{ x: 40, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -40, opacity: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    {renderStep()}
  </motion.div>
</AnimatePresence>
```

---

### Guard de Rota

```tsx
// Em RoleDashboardLayout ou no router
// Se admin_lawyer && !hasCompletedOnboarding && !hasDismissedOnboarding:
//   → redirect para /admin/onboarding (preservando ?step= do localStorage)
// Exceto rotas públicas e de auth
```

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---|---|
| `src/features/admin/pages/OnboardingPage/index.tsx` | Criar — página principal do wizard |
| `src/features/admin/pages/OnboardingPage/StepIndicator.tsx` | Criar — barra de progresso visual |
| `src/features/admin/pages/OnboardingPage/steps/CompanyStep.tsx` | Criar — form de empresa embutido |
| `src/features/admin/pages/OnboardingPage/steps/SubscriptionStep.tsx` | Criar — planos embutidos |
| `src/features/admin/pages/OnboardingPage/steps/DoneStep.tsx` | Criar — tela de conclusão |
| `src/app/router/` | Adicionar rota `/admin/onboarding` |
| `src/app/layouts/RoleDashboardLayout.tsx` | Substituir `showOnboarding` modal por redirect para `/admin/onboarding` |
| `src/shared/components/organisms/OnboardingModal.tsx` | Deprecar (manter para compatibilidade ou remover) |
| `src/features/admin/pages/CompanyProfilePage/index.tsx` | Extrair form para componente reutilizável `CompanyProfileForm` |
| `src/features/admin/pages/SubscriptionPage/index.tsx` | Extrair plans list para componente reutilizável `SubscriptionPlans` |

---

## Reutilização de Código Existente

- **`saveOfficeProfile`** (`src/features/admin/services/companyProfileService.ts`) — reusar no CompanyStep
- **`useSubscriptionPage`** hook (`src/features/admin/hooks/useSubscriptionPage.ts`) — reusar no SubscriptionStep
- **`framer-motion`** — já instalado no projeto
- **`localStorage` key** `admin_lawyer_onboarding_step_v1` — manter para persistência do step atual
- **`authService.updateAccount`** — para marcar `has_completed_onboarding = true` no DB

---

## Checklist de Teste

- [ ] Novo advogado → login → redirect para `/admin/onboarding?step=company`
- [ ] Preencher Company → Save → avança automaticamente para step 2
- [ ] Reload na página → volta para o step correto (via localStorage + DB)
- [ ] Assinar plano → avança para step Done → redirect `/admin`
- [ ] Advogado com onboarding completo → não redireciona mais para `/admin/onboarding`
- [ ] Browser back/forward durante onboarding funciona (URL sync)
- [ ] Tela responsiva — mobile funciona
