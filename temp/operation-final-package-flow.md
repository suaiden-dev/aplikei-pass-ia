# Operation — Fluxo Final COS (Aprovado / Reprovado / RFE)

> **Referência:** `temp/spec-final-package-outcome-flow.md`
> **Arquitetura real do projeto:**
> - `models/` — tipos e interfaces de domínio
> - `services/` — acesso a dados (Supabase + fallback mock)
> - `controllers/` — hooks de orquestração de estado (ex: `COSOnboardingController.ts`)
> - `pages/` — componentes de tela (customer + admin + shared)

---

## Mapa Completo de Arquivos por Camada

```
models/
  process.model.ts          ← TASK 1: adicionar tipo USCISOutcome

services/
  workflow.service.ts       ← TASK 2: adicionar updateInstanceOutcome()
  cos-notification.service  ← TASK 3: adicionar eventos de resultado

controllers/
  COS/COSOnboardingController.ts  ← TASK 4: expor handlers de resultado

pages/customer/COSOnboardingPage/
  FinalPackageStep.tsx      ← TASK 5: loading state + read-only
  MotionWorkflow.tsx        ← TASK 6: encerrar processo corretamente
  RFEWorkflow.tsx           ← TASK 7: reset de ciclo + iniciar Motion
  components/COSStepContent.tsx  ← TASK 8: props corretas no RFEEndStep

pages/shared/
  CaseOnboardingPage.tsx    ← TASK 9: painéis admin (proposta + chat)
```

---

## TASK 1 — Model: Tipos de Resultado USCIS

**Arquivo:** `src/models/process.model.ts`

**Problema:** `ProcessResults.uscis_official_result` é `string | undefined` — sem enum, qualquer typo passa sem erro.

**Adicionar após linha 48:**
```ts
export type USCISOutcome = 'approved' | 'denied' | 'rfe'
export type MotionOutcome = 'approved' | 'rejected'
export type RFEOutcome   = 'approved' | 'rfe' | 'denied'

// Atualizar ProcessResults:
export interface ProcessResults {
  uscis_official_result?: USCISOutcome   // era string
  uscis_rfe_result?:      RFEOutcome     // era string
  motion_final_result?:   MotionOutcome  // era string
  interview_outcome?:     string
  admin_feedback?:        string
  rejected_at?:           string
  rejected_items?:        string[]
}
```

**Critério:** TypeScript deve apontar erro se `uscis_official_result = 'APPROVED'` (uppercase).

---

## TASK 2 — Service: `workflowService.updateInstanceOutcome()`

**Arquivo:** `src/services/workflow.service.ts`

**Problema:** Não existe método no `workflowService` para atualizar o status final da instância (`user_product_instances`) com o resultado USCIS. Atualmente os componentes chamam `processService.updateProcessStatus()` (que opera sobre o mock) e `processService.updateStepData()` em paralelo — sem nenhum mecanismo que atualize o Supabase real.

**Adicionar no `workflowService` (após `completeStep`):**
```ts
/**
 * Registra o resultado final da instância (USCIS / Motion / RFE).
 * Atualiza status da instância e persiste metadata de resultado.
 */
async updateInstanceOutcome(
  instanceId: string,
  outcome: {
    type: 'uscis' | 'motion' | 'rfe'
    result: 'approved' | 'denied' | 'rfe' | 'rejected'
    reportedAt?: string
  },
): Promise<void> {
  const supabase = getSupabaseClient()
  const isFinal = outcome.result === 'approved' ||
                  outcome.result === 'denied'   ||
                  outcome.result === 'rejected'

  const newStatus: InstanceStatus = isFinal ? 'approved' : 'in_progress'
  // 'approved' aqui = processo encerrado (independe de ser aprovado ou reprovado)

  if (!supabase || preferMockWorkflow) {
    // mock: apenas loga
    console.info('[workflowService.mock] updateInstanceOutcome', instanceId, outcome)
    return
  }

  try {
    const { error } = await supabase
      .from('user_product_instances')
      .update({
        status: newStatus,
        completed_at: isFinal ? new Date().toISOString() : null,
        metadata: supabase // merge via jsonb || operator via RPC ou update manual
      })
      .eq('id', instanceId)

    if (error) throw new Error(error.message)
  } catch (error) {
    if (shouldFallbackToMock(error)) {
      activateMockWorkflowFallback(error)
      return
    }
    throw error
  }
},
```

> **Nota:** Para o merge de `metadata` sem sobrescrever campos existentes, usar SQL:
> `UPDATE user_product_instances SET metadata = metadata || $1 WHERE id = $2`
> via `supabase.rpc('merge_instance_metadata', { p_id: instanceId, p_data: outcomeData })`.
> Criar essa RPC no Supabase ou fazer via `updateStepData` que já faz merge no mock.

---

## TASK 3 — Service: Novos Eventos de Notificação COS

**Arquivo:** `src/services/cos-notification.service.ts`

**Problema:** O serviço atual tem apenas `notifyAdmin` genérico. Não há tipagem de eventos específicos do fluxo de resultado.

**Reescrever o arquivo:**
```ts
import { notificationService } from './notification.service'

export type COSNotificationEvent =
  | 'motion_denial_letter_uploaded'
  | 'motion_supporting_docs_uploaded'
  | 'motion_reason_submitted'
  | 'rfe_letter_uploaded'
  | 'rfe_description_submitted'
  | 'uscis_result_reported'   // NOVO
  | 'motion_started'          // NOVO
  | 'rfe_started'             // NOVO
  | 'motion_result_reported'  // NOVO
  | 'rfe_result_reported'     // NOVO

export interface COSNotificationParams {
  event: COSNotificationEvent
  processId: string
  userId: string
  metadata?: Record<string, unknown>
}

export const cosNotificationService = {
  async notifyAdmin(params: COSNotificationParams): Promise<void> {
    const titles: Record<COSNotificationEvent, string> = {
      motion_denial_letter_uploaded: 'Carta de negativa enviada',
      motion_supporting_docs_uploaded: 'Docs de apoio Motion enviados',
      motion_reason_submitted: 'Cliente descreveu caso Motion',
      rfe_letter_uploaded: 'Carta RFE enviada',
      rfe_description_submitted: 'Cliente descreveu caso RFE',
      uscis_result_reported: 'Cliente informou resultado USCIS',
      motion_started: 'Workflow Motion iniciado',
      rfe_started: 'Workflow RFE iniciado',
      motion_result_reported: 'Cliente informou resultado Motion',
      rfe_result_reported: 'Cliente informou resultado RFE',
    }
    await notificationService.notifyAdmin({
      title: titles[params.event] ?? params.event,
      serviceId: params.processId,
      userId: params.userId,
      link: `/admin/cases?id=${params.processId}`,
    })
  },
}
```

---

## TASK 4 — Controller: Handlers de Resultado no COSOnboardingController

**Arquivo:** `src/controllers/COS/COSOnboardingController.ts`

**Problema:** O controller não expõe handlers para os três resultados finais (aprovado/reprovado/RFE). Os componentes chamam `processService` e `workflowService` diretamente — violando a separação de camadas.

**Adicionar à interface `UseCOSOnboardingControllerResult` (após linha 89):**
```ts
handleUSCISResult: (
  result: 'approved' | 'denied' | 'rfe',
  opts: { jumpToStep: (n: number) => void }
) => Promise<void>

handleMotionResult: (result: 'approved' | 'rejected') => Promise<void>

handleRFEResult: (
  result: 'approved' | 'rfe' | 'denied',
  opts: { jumpToStep: (n: number) => void }
) => Promise<void>
```

**Implementar após `removeDependent` (~linha 318):**
```ts
const handleUSCISResult = useCallback(async (
  result: 'approved' | 'denied' | 'rfe',
  opts: { jumpToStep: (n: number) => void }
) => {
  if (!proc) return
  const now = new Date().toISOString()

  await processService.updateStepData(proc.id, {
    uscis_official_result: result,
    uscis_reported_at: now,
  })

  await cosNotificationService.notifyAdmin({
    event: 'uscis_result_reported',
    processId: proc.id,
    userId: proc.user_id,
    metadata: { result },
  })

  if (result === 'approved') {
    // Processo encerrado com sucesso
    return
  }

  if (result === 'denied') {
    await processService.startAdditionalWorkflow(proc.id, 'motion')
    await cosNotificationService.notifyAdmin({
      event: 'motion_started',
      processId: proc.id,
      userId: proc.user_id,
    })
    opts.jumpToStep(19)
    return
  }

  if (result === 'rfe') {
    await processService.startAdditionalWorkflow(proc.id, 'rfe')
    await cosNotificationService.notifyAdmin({
      event: 'rfe_started',
      processId: proc.id,
      userId: proc.user_id,
    })
    opts.jumpToStep(13)
  }
}, [proc])

const handleMotionResult = useCallback(async (result: 'approved' | 'rejected') => {
  if (!proc) return
  await processService.updateStepData(proc.id, {
    motion_final_result: result,
    workflow_status: result,
    motion_result_reported_at: new Date().toISOString(),
    motion_result_reported_by: 'customer',
  })
  await processService.updateProcessStatus(proc.id, 'completed')
  await cosNotificationService.notifyAdmin({
    event: 'motion_result_reported',
    processId: proc.id,
    userId: proc.user_id,
    metadata: { result },
  })
  await loadProc()
}, [proc, loadProc])

const handleRFEResult = useCallback(async (
  result: 'approved' | 'rfe' | 'denied',
  opts: { jumpToStep: (n: number) => void }
) => {
  if (!proc) return
  const data = (proc.step_data || {}) as Record<string, unknown>
  const history = (data.rfe_history as object[]) || []

  // 1. Salvar histórico do ciclo atual
  const currentDocs = (data.docs as Record<string, string>) || {}
  const newHistoryItem = {
    proposal_text: data.rfe_proposal_text,
    proposal_amount: Number(data.rfe_proposal_amount) || 0,
    result,
    rfe_letter: currentDocs.rfe_letter,
    rfe_final_package: currentDocs.rfe_final_package,
    sent_at: (data.rfe_proposal_sent_at as string) || new Date().toISOString(),
  }

  // 2. Resetar campos do ciclo
  const { rfe_letter: _l, rfe_final_package: _p, ...remainingDocs } = currentDocs
  const resetData: Record<string, unknown> = {
    rfe_history: [...history, newHistoryItem],
    rfe_proposal_text: null,
    rfe_proposal_amount: null,
    rfe_proposal_sent_at: null,
    rfe_description: null,
    uscis_rfe_result: result,
  }

  await cosNotificationService.notifyAdmin({
    event: 'rfe_result_reported',
    processId: proc.id,
    userId: proc.user_id,
    metadata: { result },
  })

  if (result === 'approved') {
    await processService.updateStepData(proc.id, resetData)
    await processService.updateProcessStatus(proc.id, 'completed')
    return
  }

  if (result === 'rfe') {
    await processService.updateStepData(proc.id, {
      ...resetData,
      docs: remainingDocs,
      uscis_official_result: 'rfe',
    })
    opts.jumpToStep(13)
    return
  }

  if (result === 'denied') {
    await processService.updateStepData(proc.id, {
      ...resetData,
      uscis_official_result: 'denied',
    })
    await processService.startAdditionalWorkflow(proc.id, 'motion')
    await cosNotificationService.notifyAdmin({
      event: 'motion_started',
      processId: proc.id,
      userId: proc.user_id,
    })
    opts.jumpToStep(19)
  }
}, [proc])
```

**Adicionar ao `return` do controller:**
```ts
handleUSCISResult,
handleMotionResult,
handleRFEResult,
```

---

## TASK 5 — UI: FinalPackageStep — Loading + Read-Only

**Arquivo:** `src/pages/customer/COSOnboardingPage/FinalPackageStep.tsx`

**Props a adicionar na interface:**
```ts
interface Props {
  proc: UserService
  onComplete: () => Promise<void>
  onJumpToStep?: (step: number) => void
  onUSCISResult?: (result: 'approved' | 'denied' | 'rfe') => Promise<void>  // NOVO
}
```

**Mudanças no componente:**

1. Adicionar state: `const [resultLoading, setResultLoading] = useState(false)`

2. Ler resultado já informado:
```ts
const uscisResult = data.uscis_official_result as string | undefined
```

3. Na seção de feedback, substituir o grid de 3 botões por lógica condicional:
```tsx
{uscisResult ? (
  // Badge read-only mostrando resultado já informado
  <div className='rounded-2xl border p-6 text-center bg-slate-50'>
    <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2'>
      Resultado já informado
    </p>
    <p className='text-xl font-black text-slate-800'>
      {uscisResult === 'approved' ? '✅ Aprovado'
       : uscisResult === 'denied' ? '❌ Reprovado'
       : '⚠️ RFE'}
    </p>
  </div>
) : (
  // Grid dos 3 botões — wrappear cada onClick com:
  // setResultLoading(true) → try { ... } finally { setResultLoading(false) }
  // disabled={resultLoading}
  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
    {/* botões existentes com loading state */}
  </div>
)}
```

4. Os handlers dos botões devem chamar `onUSCISResult?.()` (do controller) em vez de chamar `processService` diretamente.

---

## TASK 6 — UI: MotionEndStep — Encerrar Processo

**Arquivo:** `src/pages/customer/COSOnboardingPage/MotionWorkflow.tsx`

**Problema:** Após clicar Aprovado/Reprovado, não chama `updateProcessStatus('completed')` nem exibe tela de encerramento.

**Props a adicionar:**
```ts
interface StepProps {
  proc: UserService
  user?: ...
  onComplete?: () => void
  onMotionResult?: (result: 'approved' | 'rejected') => Promise<void>  // NOVO
}
```

**Mudanças:**
1. Os botões Aprovado/Reprovado devem chamar `onMotionResult?.()` em vez de `processService` diretamente.
2. Condicionar exibição dos botões: `{normalizedStatus === 'in_progress' && (...)}`
3. Adicionar bloco de "Processo Encerrado" quando resultado já registrado:
```tsx
{(normalizedStatus === 'approved' || normalizedStatus === 'rejected') && (
  <div className='mt-8 rounded-3xl bg-slate-50 border border-slate-100 p-8 text-center'>
    <p className='text-xs font-black uppercase tracking-widest text-slate-400 mb-2'>
      Processo Encerrado
    </p>
    <p className='text-base font-black text-slate-800'>
      {normalizedStatus === 'approved'
        ? 'Motion aprovada. Processo finalizado com sucesso!'
        : 'Motion encerrada como reprovada. Processo finalizado.'}
    </p>
    <button
      onClick={() => navigate('/dashboard')}
      className='mt-6 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest'
    >
      Ir para o Dashboard
    </button>
  </div>
)}
```

---

## TASK 7 — UI: RFEEndStep — Delegar para Controller

**Arquivo:** `src/pages/customer/COSOnboardingPage/RFEWorkflow.tsx`

**Problema:** `handleRFEOutcome` dentro do componente faz tudo diretamente. Deve delegar para o controller.

**Props a adicionar:**
```ts
interface StepProps {
  proc: UserService
  onComplete?: () => void
  onJumpToMotion?: () => void
  onJumpToNewRFE?: () => void
  onRFEResult?: (result: 'approved' | 'rfe' | 'denied') => Promise<void>  // NOVO
}
```

**Mudança:** Os três botões no `RFEEndStep` chamam `onRFEResult?.(outcome)`. A lógica de reset, histórico e navegação sai do componente e vai para o controller (TASK 4).

**Manter `loading` state local** para desabilitar os botões durante a operação.

---

## TASK 8 — UI: COSStepContent — Conectar Navegação Real

**Arquivo:** `src/pages/customer/COSOnboardingPage/components/COSStepContent.tsx`

**Problema:** `RFEEndStep` recebe `onJumpToMotion={onComplete}` e `onJumpToNewRFE={onComplete}` (ambos errados).

**Substituir (linhas 219-228):**
```tsx
// ANTES:
<RFEEndStep
  proc={proc}
  onComplete={onComplete}
  onJumpToMotion={onComplete}
  onJumpToNewRFE={onComplete}
/>

// DEPOIS:
<RFEEndStep
  proc={proc}
  onComplete={onComplete}
  onJumpToMotion={() => onJumpToStep(19)}
  onJumpToNewRFE={() => onJumpToStep(13)}
  onRFEResult={/* receber do hook via prop */}
/>
```

**Adicionar `onRFEResult`, `onUSCISResult`, `onMotionResult` na interface `COSStepContentProps`** e passar do `COSOnboardingPage/index.tsx`.

---

## TASK 9 — Admin Panel: Painéis de Proposta e Chat

**Arquivo:** `src/pages/shared/CaseOnboardingPage.tsx`

### Sub-task 9A — Componente `COSProposalPanel`

Seguindo exato o padrão dos painéis B1B2 existentes (`B1B2CredentialsPanel`, `B1B2AccountCreationPanel`):

```tsx
function COSProposalPanel({
  procId, stepData, type, currentDBStep, isActive, onDone,
}: {
  procId: string
  stepData: Record<string, unknown>
  type: 'motion' | 'rfe'
  currentDBStep: number
  isActive: boolean
  onDone: () => Promise<void>
}) {
  const prefix = type === 'motion' ? 'motion' : 'rfe'
  const [text, setText] = useState((stepData[`${prefix}_proposal_text`] as string) || '')
  const [amount, setAmount] = useState(
    String(stepData[`${prefix}_proposal_amount`] ?? stepData[`${prefix}_amount`] ?? '')
  )
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!text.trim() || !amount || Number(amount) <= 0) {
      toast.error('Preencha a proposta e o valor.')
      return
    }
    setLoading(true)
    try {
      await processService.updateStepData(procId, {
        [`${prefix}_proposal_text`]: text.trim(),
        [`${prefix}_proposal_amount`]: Number(amount),
        [`${prefix}_proposal_sent_at`]: new Date().toISOString(),
      })
      await processService.approveStep(procId, currentDBStep + 1, false)
      toast.success('Proposta enviada ao cliente.')
      await onDone()
    } catch {
      toast.error('Erro ao enviar proposta.')
    } finally {
      setLoading(false)
    }
  }

  const alreadySent = !isActive && !!stepData[`${prefix}_proposal_text`]

  return (
    <div className='rounded-2xl border border-border bg-card p-6 space-y-5'>
      <p className='text-xs font-bold uppercase tracking-widest text-primary'>
        Proposta {type === 'motion' ? 'Motion' : 'RFE'}
      </p>
      <AdminField label='Estratégia / Plano de ação'>
        <textarea rows={4} value={text} onChange={e => setText(e.target.value)}
          disabled={!isActive} className={fieldCls}
          placeholder='Descreva a estratégia para este caso...' />
      </AdminField>
      <AdminField label='Valor (USD)'>
        <input type='number' min='0' step='0.01' value={amount}
          onChange={e => setAmount(e.target.value)}
          disabled={!isActive} className={fieldCls} placeholder='Ex: 1500.00' />
      </AdminField>
      {isActive && (
        <Button onClick={() => void handleSave()} disabled={loading}
          className='h-11 w-full rounded-2xl'>
          {loading ? 'Enviando...' : '✓ Enviar Proposta ao Cliente'}
        </Button>
      )}
      {alreadySent && (
        <div className='rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-center gap-3'>
          <CheckCircle2 className='w-4 h-4 text-emerald-600' />
          <p className='text-xs font-semibold text-emerald-700'>
            Proposta enviada. Aguardando pagamento do cliente.
          </p>
        </div>
      )}
    </div>
  )
}
```

### Sub-task 9B — Componente `COSChatFinalizationPanel`

```tsx
function COSChatFinalizationPanel({
  procId, stepData, currentDBStep, isActive, onDone,
}: {
  procId: string
  stepData: Record<string, unknown>
  currentDBStep: number
  isActive: boolean
  onDone: () => Promise<void>
}) {
  const [loading, setLoading] = useState(false)

  const handleFinalize = async () => {
    setLoading(true)
    try {
      await processService.updateStepData(procId, {
        admin_chat_finalized_at: new Date().toISOString(),
      })
      await processService.approveStep(procId, currentDBStep + 1, false)
      toast.success('Chat finalizado. Cliente liberado para informar resultado.')
      await onDone()
    } catch {
      toast.error('Erro ao finalizar chat.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='rounded-2xl border border-border bg-card p-6 space-y-4'>
      <p className='text-xs font-bold uppercase tracking-widest text-primary'>
        Finalização do Chat
      </p>
      <p className='text-sm text-text-muted'>
        Após concluir a conversa no chat, clique abaixo para liberar o cliente.
      </p>
      {isActive ? (
        <Button onClick={() => void handleFinalize()} disabled={loading}
          className='h-11 w-full rounded-2xl'>
          {loading ? 'Finalizando...' : '✓ Finalizar Chat e Liberar Resultado'}
        </Button>
      ) : stepData.admin_chat_finalized_at ? (
        <div className='rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-center gap-3'>
          <CheckCircle2 className='w-4 h-4 text-emerald-600' />
          <p className='text-xs font-semibold text-emerald-700'>
            Chat finalizado em {formatDate(stepData.admin_chat_finalized_at as string)}.
          </p>
        </div>
      ) : null}
    </div>
  )
}
```

### Sub-task 9C — Conectar nos Steps Admin Corretos

No switch de steps do `CaseOnboardingPage`, para `service_slug === 'troca-status'` ou `'extensao-status'`:

| Step | Painel a renderizar |
|------|-------------------|
| 21 (admin_action — Motion proposal) | `<COSProposalPanel type='motion' ...>` |
| 15 (admin_action — RFE proposal)    | `<COSProposalPanel type='rfe' ...>` |
| 24 (admin_action — Motion chat fin) | `<COSChatFinalizationPanel ...>` |
| 17 (admin_action — RFE chat fin)    | `<COSChatFinalizationPanel ...>` |

---

## Ordem de Execução

```
TASK 1 → TASK 2 → TASK 3 → TASK 4 → TASK 8 → TASK 7 → TASK 6 → TASK 5 → TASK 9
Model    Service  Notif    Controller  Step     RFE      Motion   Final    Admin
Types    Outcome  Events   Handlers   Content  EndStep  EndStep  Package  Panels
```

---

## Critérios de Aceite

| Task | Critério |
|------|---------|
| 1 | TS erro em `uscis_official_result = 'APPROVED'` |
| 2 | `workflowService.updateInstanceOutcome()` salva no Supabase real |
| 3 | `cosNotificationService` aceita apenas eventos do tipo `COSNotificationEvent` |
| 4 | `handleUSCISResult`, `handleMotionResult`, `handleRFEResult` exportados pelo controller |
| 5 | Resultado já informado → badge read-only; duplo clique → impossível |
| 6 | Após Aprovado/Reprovado no Motion → processo aparece `completed` no admin |
| 7 | RFE denied → `startAdditionalWorkflow('motion')` + jump step 19 |
| 8 | `onJumpToMotion={() => onJumpToStep(19)}` no RFEEndStep |
| 9A | Admin preenche proposta → cliente avança para pagamento |
| 9B | Admin finaliza chat → cliente avança para tela de resultado |
| 9C | Painéis aparecem nos steps 15, 17, 21, 24 para slug `troca-status` |

---

## Riscos

> [!WARNING]
> **TASK 4 vs TASK 6/7:** Os componentes `MotionEndStep` e `RFEEndStep` recebem `onMotionResult`/`onRFEResult` como props. O `COSStepContent` precisa receber esses handlers do `COSOnboardingPage/index.tsx` que os obtém do hook `useCOSOnboardingPage`. Garantir que o fluxo de props não quebre TypeScript.

> [!WARNING]
> **TASK 2 — Supabase RPC:** Se a função `merge_instance_metadata` não existir no banco, usar update com `jsonb_build_object` direto ou serializar o metadata completo. Não usar `||` sem garantir que o campo não seja null.

> [!NOTE]
> **COSOnboardingController vs useCOSOnboardingPage:** O projeto tem **dois** controllers paralelos. O `COSOnboardingController.ts` (legacy, usa mock) e o `useCOSOnboardingPage.ts` (novo, usa Supabase real). A TASK 4 deve implementar os handlers no **`useCOSOnboardingPage.ts`** — que é o utilizado pela tela atual.
