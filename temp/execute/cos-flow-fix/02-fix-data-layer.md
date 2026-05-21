# Etapa 2 — Corrigir a Camada de Dados

**Objetivo:** corrigir bugs de dados no hook novo e no `workflowOps` antes de integrá-los
ao componente. Pré-requisito: Etapa 1 validada.

---

## BUG-5 — `updateInstanceOutcome` salva `status = 'approved'` para negativas

**Arquivo:** `src/features/workflow/services/workflowOps.ts`

**Problema:** toda outcome final (incluindo `denied` e `rejected`) resulta em
`status = 'approved'` no banco:

```ts
const isFinal   = outcome.result === 'approved' || outcome.result === 'denied' || outcome.result === 'rejected'
const newStatus: InstanceStatus = isFinal ? 'approved' : 'in_progress'
```

**Fix:** mapear resultado para status correto:

```ts
function outcomeToInstanceStatus(result: string): InstanceStatus {
  if (result === 'approved') return 'approved'
  if (result === 'denied' || result === 'rejected') return 'rejected'
  return 'in_progress'
}

// substituir a linha newStatus:
const newStatus = outcomeToInstanceStatus(outcome.result)
```

---

## BUG-3 — `normalizeCosWorkflowSteps` trunca steps de recuperação e usa slug inválido

**Arquivo:** `src/features/onboarding/cos/pages/COSOnboardingPage/useCOSOnboardingPage.ts`

**Problema 1:** corta incondicionalmente para 12 steps, removendo qualquer step de
Motion/RFE que já exista na instância.

**Problema 2:** inclui `'visa-cos'` que não existe nas rotas (slug real: `'troca-status'`).

```ts
// atual
function normalizeCosWorkflowSteps(slug: string, steps: UserStep[]): UserStep[] {
  if (slug !== 'troca-status' && slug !== 'visa-cos') return steps
  return steps.slice(0, 12)
}
```

**Fix:** remover a função por completo. Os steps retornados pelo banco já refletem o estado
real da instância. Se for necessário um limite, aplicar apenas quando a instância for nova
(sem steps além do índice 11):

```ts
// remover normalizeCosWorkflowSteps e suas chamadas em loadWorkflow e handleConcluir
// substituir por uso direto de workflowOps.getSteps(inst.id)
```

---

## BUG-4 — Handlers em `useCOSOnboardingPage.ts` chamam `processService` com ID errado

**Arquivo:** `src/features/onboarding/cos/pages/COSOnboardingPage/useCOSOnboardingPage.ts`

**Problema:** `buildProcShim` popula `proc.id = instance.id` (UUID de
`user_product_instances`). Os handlers `handleUSCISResult`, `handleMotionResult` e
`handleRFEResult` passam `proc.id` para `processService.updateStepData`, que opera sobre
`user_services.id` — tabela diferente.

```ts
// exemplo em handleUSCISResult — atual (errado)
await processService.updateStepData(proc.id, {
  uscis_official_result: result,
  uscis_reported_at: now,
})
```

**Fix:** persistir resultados diretamente na `user_steps` correspondente via `workflowOps`:

1. Para salvar resultado de outcome (USCIS/Motion/RFE), usar `workflowOps.saveDraft` no
   step atual antes de avançar:

```ts
// dentro de handleUSCISResult
const currentStep = steps[stepIdx]
if (currentStep) {
  await workflowOps.saveDraft(currentStep.id, {
    uscis_official_result: result,
    uscis_reported_at: now,
  })
}
```

2. Remover todas as chamadas a `processService` de `useCOSOnboardingPage.ts`:
   - `processService.updateStepData` → `workflowOps.saveDraft`
   - `processService.updateProcessStatus` → `workflowOps.updateInstanceOutcome`
   - `processService.startAdditionalWorkflow` → pode ser removido neste hook
     (o Motion/RFE no sistema novo é representado pelos steps existentes na instância,
     não por um sub-workflow separado)
   - `processService.updateNegativa` → remover (campo legado de `user_services.step_data`)

3. Remover o import de `processService` do arquivo após limpeza.

**Atenção:** `cosNotificationService.notifyAdmin` pode continuar — não depende do sistema
de dados.

---

## BUG-6 — `COS_MOTION_RESULT_STEP = 24` sem template correspondente

**Arquivo:** `src/shared/data/cosWorkflow.ts`

**Problema:** `MOTION_STEPS_TEMPLATE` tem 5 entradas (índices 0–4, stepIdx 19–23).
O índice 24 cai fora do array e faz fallback para `'cos_motion_end'`, duplicando o step 23.

```ts
// cosWorkflow.ts — atual
export const COS_MOTION_END_STEP    = 23
export const COS_MOTION_RESULT_STEP = 24   // ← não tem template
```

**Fix:** remover `COS_MOTION_RESULT_STEP` e usar `COS_MOTION_END_STEP = 23` como o índice
final do Motion. Atualizar todos os lugares que referenciam o valor `24`:

- `src/shared/data/cosWorkflow.ts`: remover `COS_MOTION_RESULT_STEP`
- `src/features/onboarding/cos/pages/COSOnboardingPage/index.tsx`: substituir `24` por
  `COS_MOTION_END_STEP` (importado)
- `src/features/onboarding/cos/pages/COSOnboardingPage/useCOSOnboardingPage.ts`:
  substituir `stepIdx === 23 || stepIdx === 24` por `stepIdx === COS_MOTION_END_STEP`

---

## Checklist de aceite desta etapa

- [ ] Resultado `denied` grava `status = 'rejected'` em `user_product_instances`.
- [ ] Resultado `approved` grava `status = 'approved'`.
- [ ] `getSteps` retorna todos os steps da instância sem truncagem.
- [ ] Nenhuma chamada a `processService` existe em `useCOSOnboardingPage.ts`.
- [ ] stepIdx 24 não existe mais como referência no código.
- [ ] `isMotionResultStep` resolve corretamente para stepIdx 23.
