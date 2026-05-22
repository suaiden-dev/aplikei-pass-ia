# COS Flow Fix Spec

Complementa `cos-flow-spec.md` com as causas raiz concretas encontradas na análise de código
e um plano de execução passo a passo.

---

## Causa Raiz Principal

`index.tsx` e `useCOSOnboardingPage.ts` coexistem como implementações paralelas que nunca
foram integradas. O componente renderizado (`index.tsx`) não importa o hook novo, opera sobre
`user_services` (legado) e nunca avança o usuário pelo onboarding. O hook novo
(`useCOSOnboardingPage.ts`) usa `user_product_instances` + `user_steps` mas é código morto.

---

## Bugs Confirmados

### BUG-1 — `handleConcluir` redireciona para fora após cada submit
**Arquivo:** `src/features/onboarding/cos/pages/COSOnboardingPage/index.tsx:805`

```ts
// atual — manda o usuário para a página do processo, encerrando o onboarding
navigate(`/dashboard/processes/${slug}`)
```

O usuário nunca avança do step 0. Qualquer submit completa a navegação fora do fluxo.

**Fix:** após submeter, navegar para `?step=<nextIdx>` dentro do onboarding, e só
redirecionar para o processo quando o último step for concluído ou quando o próximo step
for `admin_action`.

---

### BUG-2 — `useCOSOnboardingPage.ts` é código morto
**Arquivo:** `src/features/onboarding/cos/pages/COSOnboardingPage/useCOSOnboardingPage.ts`

`index.tsx` replica toda a lógica de estado inline. O hook não é importado em nenhum lugar.

**Fix:** `index.tsx` deve ser refatorado para consumir `useCOSOnboardingPage()` e remover
o estado e os handlers duplicados.

---

### BUG-3 — `normalizeCosWorkflowSteps` trunca steps Motion/RFE
**Arquivo:** `src/features/onboarding/cos/pages/COSOnboardingPage/useCOSOnboardingPage.ts:46`

```ts
function normalizeCosWorkflowSteps(slug: string, steps: UserStep[]): UserStep[] {
  if (slug !== 'troca-status' && slug !== 'visa-cos') return steps
  return steps.slice(0, 12)   // ← apaga steps 12+ mesmo quando Motion/RFE está ativo
}
```

Além de cortar os steps de recuperação, inclui `'visa-cos'` que não é um slug válido nas
rotas (o slug real é `'troca-status'`).

**Fix:** remover a função ou limitá-la a não cortar quando há steps de recuperação ativos:

```ts
function normalizeCosWorkflowSteps(slug: string, steps: UserStep[]): UserStep[] {
  const isCos = slug === 'troca-status' || slug === 'extensao-status'
  if (!isCos) return steps
  // só trunca se não houver steps além do fluxo base
  if (steps.length <= 12) return steps
  return steps
}
```

---

### BUG-4 — `handleUSCISResult` e `handleMotionResult` em `useCOSOnboardingPage.ts` chamam
`processService.updateStepData(proc.id, ...)` com o ID errado
**Arquivo:** `src/features/onboarding/cos/pages/COSOnboardingPage/useCOSOnboardingPage.ts:388`

`buildProcShim` popula `proc.id = instance.id` (UUID de `user_product_instances`).
`processService.updateStepData` opera sobre `user_services.id` — tabela e sistema diferentes.
A escrita aterra no registro errado ou falha silenciosamente.

**Fix:** toda persistência de resultado (USCIS, Motion, RFE) no hook novo deve usar
`workflowOps` exclusivamente. Remover as chamadas a `processService` de
`useCOSOnboardingPage.ts`.

Mapeamento correto:
- `processService.updateStepData` → `workflowOps.saveDraft` / `workflowOps.submitStep`
- `processService.startAdditionalWorkflow` → lógica inline com `workflowOps.completeStep`
  + criação de steps virtuais se necessário
- `processService.updateProcessStatus` → `workflowOps.updateInstanceOutcome`

---

### BUG-5 — `updateInstanceOutcome` coloca `status = 'approved'` para resultados negativos
**Arquivo:** `src/features/workflow/services/workflowOps.ts:187`

```ts
const newStatus: InstanceStatus = isFinal ? 'approved' : 'in_progress'
```

`isFinal` é `true` para `approved`, `denied` e `rejected`. Processos negados ficam com
`status = 'approved'` no banco.

**Fix:**

```ts
function outcomeToStatus(result: string): InstanceStatus {
  if (result === 'approved') return 'approved'
  if (result === 'denied' || result === 'rejected') return 'rejected'
  return 'in_progress'
}
```

---

### BUG-6 — stepIdx 23 e 24 resolvem para o mesmo `currentStepId`
**Arquivo:** `src/features/onboarding/cos/pages/COSOnboardingPage/index.tsx:150-155`

`MOTION_STEPS_TEMPLATE` tem 5 entradas (índices 0–4):
- stepIdx 23 → `MOTION_STEPS_TEMPLATE[4]` = `'cos_motion_end'`
- stepIdx 24 → `MOTION_STEPS_TEMPLATE[5]` = `undefined` → fallback `'cos_motion_end'`

`cosWorkflow.ts` define `COS_MOTION_END_STEP = 23` e `COS_MOTION_RESULT_STEP = 24`, mas
não há um step template para o índice 24.

**Fix:** ou eliminar o step 24 alinhando o máximo a 23, ou adicionar um step
`'cos_motion_result'` ao `MOTION_STEPS_TEMPLATE`. O mais simples é eliminar o índice 24
e fazer `COS_MOTION_RESULT_STEP = 23`.

---

### BUG-7 — `isLoading` em `index.tsx` bloqueia na ausência de `user_services`
**Arquivo:** `src/features/onboarding/cos/pages/COSOnboardingPage/index.tsx:259`

```ts
if (!data) return   // ← setIsLoading(false) nunca é chamado
```

Quando não há registro em `user_services` (instância nova no sistema novo), `isLoading`
permanece `true` eternamente e o spinner não some.

**Fix:** garantir que `setIsLoading(false)` seja chamado no finally de todo caminho de load.

---

## Ordem de Execução

### Etapa 1 — Corrigir `index.tsx` para funcionar com o sistema legado enquanto o hook não é integrado

1. **BUG-7:** mover `setIsLoading(false)` para um `finally` no `useEffect` de load.
2. **BUG-1:** substituir `navigate('/dashboard/processes/${slug}')` por navegação sequencial
   de steps, com redirecionamento ao processo apenas quando `nextStep?.type === 'admin_action'`
   ou quando não há próximo step.

Esses dois fixes restauram o fluxo base (steps 0–11) sem precisar trocar o sistema de dados.

### Etapa 2 — Corrigir problemas de dados no hook novo

3. **BUG-5:** corrigir `updateInstanceOutcome` em `workflowOps.ts`.
4. **BUG-3:** corrigir `normalizeCosWorkflowSteps`.
5. **BUG-6:** alinhar `COS_MOTION_RESULT_STEP` com o tamanho real do template.

### Etapa 3 — Integrar `useCOSOnboardingPage.ts` como fonte única de estado

6. **BUG-2:** fazer `index.tsx` importar e usar `useCOSOnboardingPage()`.
   Remover os estados inline duplicados (`proc`, `isLoading`, `isSubmitting`, `currentVisa`,
   `targetVisa`, `i94Date`, `dependents`, `docs`, todos os handlers).
7. **BUG-4:** remover chamadas a `processService` do hook novo; usar só `workflowOps`.

### Etapa 4 — Validação manual (ver `temp/execute/07-validation.md`)

---

## Arquivos Afetados

| Arquivo | Bugs | Tipo de mudança |
|---|---|---|
| `src/features/onboarding/cos/pages/COSOnboardingPage/index.tsx` | BUG-1, BUG-6, BUG-7 (Etapa 1), BUG-2 (Etapa 3) | Fix + refactor |
| `src/features/onboarding/cos/pages/COSOnboardingPage/useCOSOnboardingPage.ts` | BUG-3, BUG-4 | Fix |
| `src/features/workflow/services/workflowOps.ts` | BUG-5 | Fix |
| `src/shared/data/cosWorkflow.ts` | BUG-6 | Fix constante |
| `src/shared/data/workflowTemplates.ts` | BUG-6 (opcional) | Add step ou remover índice 24 |

---

## O Que Não Mudar

- `COSStepContent.tsx` — roteamento de step ID para componente está correto.
- `COSApplicationStepConnected.tsx` e `useStepInitialInfo.ts` — implementação correta do
  sistema novo para o step 0; integrar na Etapa 3.
- `workflowTemplates.ts` step IDs — estáveis, não renomear.
- `cosWorkflow.ts` funções utilitárias — corretas; apenas a constante `COS_MOTION_RESULT_STEP`
  precisa de ajuste.

---

## Critério de Aceite

- Fluxo base roda do step 0 ao `cos_final_package` sem redirecionar para fora no meio.
- Negativa cria o contexto de Motion e o usuário avança para o step 19.
- Steps futuros não aparecem como concluídos na timeline.
- Resultado de negativa no banco tem `status = 'rejected'`, não `'approved'`.
