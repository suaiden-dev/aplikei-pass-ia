# Etapa 1 — Restaurar o Fluxo Base

**Objetivo:** fazer o fluxo base (steps 0–11) funcionar de ponta a ponta sem trocar o
sistema de dados. Sem essa etapa o usuário não consegue avançar do step 0.

**Sistema de dados:** `user_services` + `processService` (legado — não alterar ainda).

---

## BUG-1 — `handleConcluir` redireciona para fora após cada submit

**Arquivo:** `src/features/onboarding/cos/pages/COSOnboardingPage/index.tsx`

**Problema:** a linha final de sucesso dentro de `handleConcluir` sempre navega para a
página do processo, encerrando o onboarding independentemente do step.

```ts
// linha ~805 — atual
toast.success(t.cos?.toasts?.stepSent)
navigate(`/dashboard/processes/${slug}`)
```

**Fix:** substituir por navegação sequencial de steps. Só redirecionar ao processo quando
o próximo step for do tipo `admin_action` ou quando não houver próximo step.

```ts
toast.success(t.cos?.toasts?.stepSent)

const nextStep = service?.steps[nextStepIdx]
const isAdminStep = nextStep?.type === 'admin_action'
const isFinished  = nextStepIdx >= totalSteps

if (isAdminStep || isFinished) {
  navigate(`/dashboard/processes/${slug}`)
} else {
  const params = new URLSearchParams(searchParams)
  params.set('step', String(nextStepIdx))
  if (proc?.id) params.set('id', proc.id)
  navigate(`/dashboard/processes/${slug}/onboarding?${params.toString()}`)
}
```

**Atenção:** o jump para step 19 (Motion) e 13 (RFE) em `handleUSCISResult` e
`handleRFEResult` já usam `jumpToOnboardingStep`, que está correto. Não alterar esses paths.

---

## BUG-7 — `isLoading` trava em `true` quando não há registro em `user_services`

**Arquivo:** `src/features/onboarding/cos/pages/COSOnboardingPage/index.tsx`

**Problema:** o `useEffect` de load retorna antes de chamar `setIsLoading(false)` quando
`data` é `null`:

```ts
if (!data) return   // setIsLoading(false) nunca chamado
```

**Fix:** mover o `setIsLoading(false)` para um `finally`:

```ts
useEffect(() => {
  async function load() {
    if (!user || !slug) return
    try {
      // ... fetch ...
      if (!data) return
      setProc(data)
      // ... resto da hidratação ...
    } catch (err) {
      console.error('[COSOnboardingPage] load error:', err)
    } finally {
      setIsLoading(false)   // ← sempre executado
    }
  }
  load()
}, [user, slug, parentProcessId, stepIdx])
```

---

## Checklist de aceite desta etapa

- [ ] Step 0 (formulário inicial) pode ser submetido sem sair do onboarding.
- [ ] Após submit do step 0 o usuário vê o step 1 (documentos).
- [ ] Após submit do step 1 o usuário avança para o step 2.
- [ ] Quando o próximo step é `admin_action`, o usuário é redirecionado ao processo.
- [ ] Spinner de carregamento some mesmo quando não há `user_services` para o slug.
- [ ] Nenhuma regressão em `handleUSCISResult`, `handleRFEResult`, `handleMotionResult`.
