# Spec — Fluxo de Resultado Final do Pacote COS (Aprovado / Reprovado / RFE)

> **Arquivo-alvo principal:** `src/pages/customer/COSOnboardingPage/FinalPackageStep.tsx`
> **Contexto:** Após enviar o pacote físico ao USCIS, o cliente informa o resultado na seção de feedback. Este spec descreve os três caminhos possíveis e o que deve acontecer em cada um.

---

## 1. Visão Geral do Diagrama

```
                ┌─────────────────────────────────────────┐
                │        FinalPackageStep (Envio)          │
                │   [Aprovado] [Reprovado] [RFE]           │
                └──────┬──────────────┬───────────┬────────┘
                       │              │           │
              ┌────────▼──┐   ┌───────▼──┐   ┌───▼───────────┐
              │ APROVADO  │   │REPROVADO │   │     RFE       │
              │           │   │(Motion)  │   │               │
              └────────┬──┘   └───────┬──┘   └───────┬───────┘
                       │              │               │
              ┌────────▼──┐   ┌───────▼──┐   ┌───────▼───────┐
              │Finalizado │   │  Motion  │   │      RFE      │
              │(completo) │   │ Workflow │   │   Workflow    │
                              └───────┬──┘   └───────┬───────┘
                                      │               │
                               [fluxo motion]  [fluxo rfe]
                               (ver seção 3)   (ver seção 4)
```

---

## 2. Fluxo APROVADO

### O que acontece:
1. Cliente clica em **"Aprovado"** no `FinalPackageStep`.
2. Sistema salva `uscis_official_result: 'approved'` + `uscis_reported_at: now()`.
3. Tela de celebração (`showCelebration = true`) aparece.
4. Botão **"Ir para o Dashboard"** chama `processService.updateProcessStatus(proc.id, 'completed')` e redireciona para `/dashboard`.

### Status final do processo: `completed`

### Código atual (já implementado):
```tsx
// FinalPackageStep.tsx — botão Aprovado (linha ~458)
onClick={async () => {
  await processService.updateStepData(proc.id, {
    uscis_official_result: 'approved',
    uscis_reported_at: new Date().toISOString(),
  })
  setShowCelebration(true)
}}
```

---

## 3. Fluxo REPROVADO → Motion Workflow

### Sequência de passos (conforme diagrama):

```
Reprovado
  └─► Motion (Pagamento inicial - taxa de análise)
        └─► Explicação do caso do cliente (formulário)
              └─► Admin cria proposta (admin action)
                    └─► Cliente paga valor da proposta
                          └─► Abre chat para tratar o motion
                                └─► Admin finaliza o chat (admin action)
                                      └─► Pergunta se foi: Aprovado ou Reprovado
                                              ├─► Aprovado → Finalizado
                                              └─► Reprovado → Finalizado
```

### Passos do Motion Workflow (step indices atuais):

| Idx | Componente               | Tipo         | Quem age  |
|-----|--------------------------|--------------|-----------|
| 19  | `MotionExplanationStep`  | Pagamento inicial (taxa análise `apoio-rfe-motion-inicio`) | Cliente |
| 20  | `MotionInstructionStep`  | Upload carta negativa + descrição do caso | Cliente |
| 21  | *(admin_action)*         | Admin cria proposta de valor | Admin |
| 22  | `MotionAcceptProposalStep` | Cliente paga proposta (`proposta-rfe-motion`) | Cliente |
| 23  | `MotionEndStep`          | Chat aberto automaticamente; cliente aguarda | Cliente |
| 24  | *(admin_action)*         | Admin finaliza chat e registra resultado | Admin |
| —   | `MotionEndStep` - seção resultado | Pergunta ao cliente: foi Aprovado ou Reprovado | Cliente |

> **Nota:** O step 23/`MotionEndStep` abre um chat (`processService.ensureChatThread`) automaticamente ao montar. O admin finaliza o chat externamente e registra o resultado via painel admin. O cliente então reporta o resultado final clicando em "Aprovado" ou "Reprovado" no `MotionEndStep`.

### O que acontece ao clicar "Reprovado" no FinalPackageStep:
```tsx
// Comportamento atual (já implementado):
await processService.updateStepData(proc.id, {
  uscis_official_result: 'denied',
  uscis_reported_at: new Date().toISOString(),
})
await processService.startAdditionalWorkflow(proc.id, 'motion')
if (onJumpToStep) onJumpToStep(19) // Jump para MotionExplanationStep
```

### Resultado final do Motion:
- **Aprovado** → `motion_final_result: 'approved'`, `workflow_status: 'approved'` → processo **Finalizado**
- **Reprovado** → `motion_final_result: 'rejected'`, `workflow_status: 'rejected'` → processo **Finalizado**

---

## 4. Fluxo RFE → RFE Workflow

### Sequência de passos (conforme diagrama):

```
RFE
  └─► RFE (Pagamento inicial - taxa de análise)
        └─► Explicação do caso do cliente (upload carta RFE + descrição)
              └─► Admin cria proposta (admin action)
                    └─► Cliente paga valor da proposta
                          └─► Abre chat para tratar a RFE (admin finaliza)
                                └─► Admin finaliza o chat (admin action)
                                      └─► Pergunta se foi: Aprovado / Reprovado / RFE novamente
                                              ├─► Aprovado → Finalizado
                                              ├─► Reprovado → Motion Workflow (seção 3)
                                              └─► RFE → recomeça RFE Workflow (loop)
```

### Passos do RFE Workflow (step indices atuais):

| Idx | Componente               | Tipo         | Quem age  |
|-----|--------------------------|--------------|-----------|
| 13  | `RFEExplanationStep`     | Pagamento inicial (taxa análise `apoio-rfe-motion-inicio`) | Cliente |
| 14  | `RFEInstructionStep`     | Upload carta RFE + descrição do caso | Cliente |
| 15  | *(admin_action)*         | Admin cria proposta de valor | Admin |
| 16  | `RFEAcceptProposalStep`  | Cliente paga proposta (`proposta-rfe-motion`) | Cliente |
| 17  | *(admin_action)*         | Admin monta pacote RFE + finaliza chat | Admin |
| 18  | `RFEEndStep`             | Pergunta ao cliente: Aprovado / RFE / Reprovado | Cliente |

### O que acontece ao clicar "RFE" no FinalPackageStep:
```tsx
// Comportamento atual (já implementado):
await processService.updateStepData(proc.id, {
  uscis_official_result: 'rfe',
  uscis_reported_at: new Date().toISOString(),
})
await processService.startAdditionalWorkflow(proc.id, 'rfe')
if (onJumpToStep) onJumpToStep(13) // Jump para RFEExplanationStep
```

### Decisão no `RFEEndStep` (step 18) — `handleRFEOutcome`:

| Resultado | Ação |
|-----------|------|
| `approved` | Salva histórico → `updateProcessStatus('completed')` → Finalizado |
| `rfe`      | Salva histórico → limpa dados do ciclo → `onJumpToNewRFE?.()` (volta ao step 13) |
| `denied`   | Salva histórico → `onJumpToMotion?.()` (vai para step 19 — Motion) |

---

## 5. Campos de Dados por Fluxo

### Step data — Motion:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `uscis_official_result` | `'denied'` | Resultado USCIS que disparou o Motion |
| `uscis_reported_at` | ISO string | Quando o cliente reportou |
| `motion_reason` | string | Descrição do caso pelo cliente |
| `docs.motion_denial_letter` | storage path | Carta de negativa |
| `docs.motion_supporting_docs` | storage path | Documentos de apoio (opcional) |
| `motion_proposal_text` | string | Proposta do admin |
| `motion_amount` / `motion_proposal_amount` | number | Valor da proposta |
| `motion_payment_completed_at` | ISO string | Confirmação de pagamento |
| `motion_chat_started_at` | ISO string | Quando o chat foi criado |
| `motion_final_result` | `'approved'` / `'rejected'` | Resultado final informado pelo cliente |
| `workflow_status` | `'approved'` / `'rejected'` / `'in_progress'` | Status atual |
| `motion_result_reported_at` | ISO string | Quando o resultado foi reportado |

### Step data — RFE:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `uscis_official_result` | `'rfe'` | Resultado USCIS que disparou o RFE |
| `uscis_reported_at` | ISO string | Quando o cliente reportou |
| `rfe_description` | string | Descrição do caso pelo cliente |
| `docs.rfe_letter` | storage path | Carta de RFE |
| `rfe_proposal_text` | string | Proposta do admin |
| `rfe_proposal_amount` | number | Valor da proposta |
| `rfe_proposal_sent_at` | ISO string | Quando a proposta foi enviada |
| `docs.rfe_final_package` | storage path | Pacote de resposta RFE montado pelo admin |
| `uscis_rfe_result` | `'approved'` / `'rfe'` / `'denied'` | Resultado deste ciclo RFE |
| `rfe_history` | `RFEHistoryItem[]` | Histórico de todos os ciclos RFE |

### Estrutura `RFEHistoryItem`:
```ts
interface RFEHistoryItem {
  proposal_text: string
  proposal_amount: number
  result: 'approved' | 'rfe' | 'denied'
  rfe_letter?: string        // storage path
  rfe_final_package?: string // storage path
  sent_at: string            // ISO string
}
```

---

## 6. Contexto de Renderização no `useCOSOnboardingPage`

```ts
// Detecção do contexto atual
const uscisResult = proc?.step_data?.uscis_official_result  // 'approved' | 'denied' | 'rfe'
const rfeResult   = proc?.step_data?.uscis_rfe_result       // 'approved' | 'rfe' | 'denied'

const isMotionContext = uscisResult === 'denied' || rfeResult === 'denied' || stepIdx >= 19
const isRFEContext    = !isMotionContext && (uscisResult === 'rfe' || rfeResult === 'rfe' || (stepIdx >= 13 && stepIdx <= 18))
const isMotionResultStep = stepIdx === 23 || stepIdx === 24
```

---

## 7. Navegação entre Steps

```ts
// COSOnboardingPage/index.tsx
const jumpToOnboardingStep = (target: number) => {
  params.set('step', String(target))
  setSearchParams(params)
}

// FinalPackageStep.tsx usa:
onJumpToStep(19) // → Motion start
onJumpToStep(13) // → RFE start
```

---

## 8. O que Falta Implementar / Melhorias Necessárias

### 8.1 — `FinalPackageStep`: Lógica de Resultado (Status)

O `FinalPackageStep` atualmente renderiza o painel de feedback mas **não persiste o resultado de forma condicional** de maneira clara para o admin. Melhorias:

- [ ] Ao clicar **Aprovado**: mostrar tela de celebração + botão "Finalizar Processo" que chama `updateProcessStatus('completed')`.
- [ ] Ao clicar **Reprovado**: iniciar Motion (`startAdditionalWorkflow('motion')`) + navegar para step 19.
- [ ] Ao clicar **RFE**: iniciar RFE (`startAdditionalWorkflow('rfe')`) + navegar para step 13.
- [ ] **Botão não deve poder ser clicado mais de uma vez** (impedir duplo clique com estado `loading`).
- [ ] Exibir resultado já informado anteriormente se `uscis_official_result` já foi salvo (estado read-only do painel de feedback).

### 8.2 — `MotionEndStep`: Resultado Final

Atualmente o `MotionEndStep` (step 23) pede ao cliente para informar Aprovado/Reprovado mas **não redireciona para Finalizado** nem encerra o processo. Melhorias:

- [ ] Ao clicar **Aprovado**: salvar `motion_final_result: 'approved'` + `workflow_status: 'approved'` + chamar `updateProcessStatus('completed')` → exibir tela de encerramento.
- [ ] Ao clicar **Reprovado**: salvar `motion_final_result: 'rejected'` + `workflow_status: 'rejected'` + chamar `updateProcessStatus('completed')` → exibir tela de encerramento (processo finalizado independente do resultado).
- [ ] Após selecionar qualquer resultado, **esconder os botões** e exibir badge de status informado.

### 8.3 — `RFEEndStep`: Resultado e Loop

O `RFEEndStep` (step 18) já tem lógica de outcome mas necessita:

- [ ] Ao retornar `rfe` (nova RFE): limpar campos do ciclo atual (`rfe_proposal_text`, `rfe_proposal_amount`, `rfe_proposal_sent_at`, `rfe_description`, `docs.rfe_letter`, `docs.rfe_final_package`) **antes** de fazer jump para step 13, para garantir que o próximo ciclo começa limpo.
- [ ] O `rfe_history` deve ser persistido **antes** do reset dos dados do ciclo.
- [ ] Ao retornar `denied` (Motion): disparar `startAdditionalWorkflow('motion')` além do jump para step 19.

### 8.4 — Admin Panel: Registrar Resultado

O admin precisa, via painel de gestão do caso, poder:

- [ ] **Registrar resultado da Motion**: campo dropdown Aprovado/Reprovado no `CaseOnboardingPage` admin.
- [ ] **Registrar resultado da RFE por ciclo**: após cada ciclo, registrar o desfecho no histórico.
- [ ] **Finalizar chat**: botão que fecha o chat e avança o fluxo para a etapa de resultado.

### 8.5 — Notificações

- [ ] Ao cliente clicar em qualquer resultado no `FinalPackageStep`, notificar admin via `cosNotificationService.notifyAdmin({ event: 'uscis_result_reported', ... })`.
- [ ] Ao Motion ou RFE ser iniciado, notificar admin via `event: 'motion_started'` ou `event: 'rfe_started'`.

---

## 9. Arquivos Relacionados

| Arquivo | Responsabilidade |
|---------|-----------------|
| `FinalPackageStep.tsx` | Exibe pacote final, coleta resultado USCIS (Aprovado/Reprovado/RFE) |
| `MotionWorkflow.tsx` | Steps 19–23: Motion Explanation, Instruction, Proposal, End |
| `RFEWorkflow.tsx` | Steps 13–18: RFE Explanation, Instruction, Proposal, End |
| `useCOSOnboardingPage.ts` | Hook de orquestração; detecta contextos (motion/rfe), controla stepIdx |
| `components/COSStepContent.tsx` | Switch de renderização de cada step (mapeia stepIdx → componente) |
| `services/process.service.ts` | `updateStepData`, `updateProcessStatus`, `startAdditionalWorkflow`, `ensureChatThread` |
| `services/cos-notification.service.ts` | Notificações de eventos para admin |

---

## 10. Sequência de Implementação Recomendada

1. **Fix `FinalPackageStep`** — garantir que resultado já informado seja exibido como read-only; adicionar loading state nos botões.
2. **Fix `MotionEndStep`** — após resultado informado, chamar `updateProcessStatus('completed')` e exibir tela de encerramento.
3. **Fix `RFEEndStep`** — garantir reset correto dos dados do ciclo antes de reiniciar RFE; disparar `startAdditionalWorkflow('motion')` no denied.
4. **Adicionar notificações** — `cosNotificationService.notifyAdmin` nos três pontos de resultado.
5. **Admin panel** — registrar campo de resultado final no painel de gestão do caso.

---

## 11. Invariantes de Segurança

- Nenhum resultado pode ser registrado **antes** do pagamento da proposta ser confirmado.
- O histórico de RFE (`rfe_history`) deve ser **append-only** — nunca sobrescrever itens anteriores.
- O processo só deve ir para `status: 'completed'` quando **Aprovado** for reportado; um resultado **Reprovado** no Motion deve também marcar como `completed` (processo encerrado, não volta).
- O `startAdditionalWorkflow` deve ser idempotente — não criar workflows duplicados.
