# Etapa 3 — Integrar `useCOSOnboardingPage` como Fonte Única de Estado

**Objetivo:** fazer `index.tsx` consumir `useCOSOnboardingPage()` e remover todo o estado e
os handlers duplicados. Pré-requisito: Etapas 1 e 2 validadas.

---

## Escopo

`index.tsx` atualmente replica inline toda a lógica que `useCOSOnboardingPage.ts` já
implementa corretamente sobre o sistema novo (`user_product_instances` + `user_steps`).
Esta etapa substitui o conteúdo do componente pelo hook, tornando o arquivo o único
ponto de entrada do fluxo COS.

---

## Estados e handlers a remover de `index.tsx`

Todos os itens abaixo existem no hook e devem ser **removidos do componente**:

**Estados**
- `proc`, `setProc`
- `isSubmitting`, `setIsSubmitting`
- `isSavingMotionResult`, `setIsSavingMotionResult`
- `isLoading`, `setIsLoading`
- `currentVisa`, `setCurrentVisa`
- `targetVisa`, `setTargetVisa`
- `i94Date`, `setI94Date`
- `dependents`, `setDependents`
- `docs`, `setDocs`

**Variáveis derivadas** (replicadas — remover e usar as do hook)
- `hasFeedback`
- `rejectedItems`
- `isFieldRejected`
- `isReadOnly`
- `canSubmitStep0`, `canSubmitStep1`, `canSubmit`
- `currentStepId`
- `isMotionResultStep`
- `motionReportedResult`
- `uscisResult`, `rfeResult`
- `currentProcessStep`
- `isRecoveryRangeStep`
- `isMotionContext`, `isRFEContext`
- `totalSteps`, `currentStepTitle`, `currentStepDescription`

**Handlers** (replicados — remover e usar os do hook)
- `handleMotionResultReport`
- `handleConcluir`
- `handleUSCISResult`
- `handleMotionResult`
- `handleRFEResult`
- `goToProcess`
- `jumpToOnboardingStep`
- `getDocSlots`
- `addDependent`, `updateDependent`, `removeDependent`
- `handleDocChange`

**`useEffect` de load** — remover completamente (substituído por `loadWorkflow` do hook)

**`useEffect` de redirecionamento por contexto** — avaliar se ainda é necessário ou se a
lógica de `deriveCurrentStepIdx` + `setSearchParams` do hook já cobre.

---

## Estrutura alvo de `index.tsx` após a integração

```tsx
export default function COSOnboardingPage() {
  const {
    t,
    slug,
    stepIdx,
    proc,
    isLoading,
    isSubmitting,
    isSavingMotionResult,
    currentVisa, setCurrentVisa,
    targetVisa,  setTargetVisa,
    i94Date,     setI94Date,
    dependents,
    docs,
    hasFeedback,
    isFieldRejected,
    isReadOnly,
    canSubmit,
    isMotionContext,
    isRFEContext,
    isMotionResultStep,
    motionReportedResult,
    addDependent,
    updateDependent,
    removeDependent,
    handleDocChange,
    handleConcluir,
    handleMotionResultReport,
    handleUSCISResult,
    handleMotionResult,
    handleRFEResult,
    getDocSlots,
    goToProcess,
    jumpToOnboardingStep,
    instance,
    steps,
  } = useCOSOnboardingPage()

  // guard de segurança visto-b1-b2 pode ficar (useEffect simples)
  // cálculo de currentStepId, totalSteps, títulos — podem ficar ou ir pro hook

  if (isLoading || !t || !t.cos) return <LoadingSpinner />

  return (
    <div className='min-h-screen bg-bg flex flex-col'>
      {/* ... JSX existente sem mudança visual ... */}
      <COSStepContent
        t={t}
        stepIdx={stepIdx}
        currentStepId={currentStepId}
        proc={proc}
        {/* ... resto das props igual ao atual ... */}
      />
    </div>
  )
}
```

---

## `COSApplicationStepConnected` — integração opcional nesta etapa

`COSApplicationStepConnected` já usa `useStepInitialInfo` (sistema novo) mas não é
referenciado por `COSStepContent`. Se a Etapa 3 for executada, considerar substituir o
trecho de `COSStepContent` que renderiza `COSApplicationStep` diretamente por
`COSApplicationStepConnected`:

```tsx
// COSStepContent.tsx — atual
if (isStep('cos_form', 'cos_application_form', ...)) {
  return <COSApplicationStep ... />
}

// após integração
if (isStep('cos_form', 'cos_application_form', ...) && instance) {
  return (
    <COSApplicationStepConnected
      instanceId={instance.id}
      productStepId={steps[0]?.product_step_id ?? ''}
      onSubmitted={refreshWorkflow}
    />
  )
}
```

Isso elimina a necessidade de passar todos os props de formulário do step 0 via `COSStepContent`.

---

## Imports a remover de `index.tsx`

```ts
import * as processService from "@features/process/services/processOps"
import { supabase, getSessionSafe } from "@shared/lib/supabase"
```

Estes só eram usados pelos handlers e pelo `useEffect` de load que serão removidos.
Verificar se algum uso remanescente existe antes de deletar.

---

## Imports a adicionar em `index.tsx`

```ts
import { useCOSOnboardingPage } from './useCOSOnboardingPage'
```

---

## Checklist de aceite desta etapa

- [ ] `index.tsx` não declara nenhum `useState` de formulário (visa, data, dependentes, docs).
- [ ] `index.tsx` não declara nenhum `useEffect` de load de `user_services`.
- [ ] Nenhum import de `processService` ou `supabase` direto em `index.tsx`.
- [ ] Fluxo base (steps 0–11) funciona igual ao final da Etapa 1.
- [ ] Motion e RFE continuam funcionando após o resultado do USCIS.
- [ ] `COSApplicationStepConnected` é o componente ativo para o step 0 (se integrado).
- [ ] Nenhuma regressão visual — o JSX de apresentação não muda.
