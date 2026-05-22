# COS Flow Fix — Plano de Execução

Resolve os bugs identificados na análise do fluxo COS.
Spec completa: [`../../cos-flow-fix.md`](../../cos-flow-fix.md)

## Etapas

| Arquivo | O que faz | Pré-requisito |
|---|---|---|
| `01-restore-base-flow.md` | Restaura o fluxo base (steps 0–11) sem trocar o sistema de dados | — |
| `02-fix-data-layer.md` | Corrige problemas de dados no hook novo e no workflowOps | Etapa 1 validada |
| `03-integrate-hook.md` | Integra `useCOSOnboardingPage.ts` como fonte única de estado | Etapa 2 validada |

## Critério global de aceite

- Fluxo base roda do step 0 ao `cos_final_package` sem sair do onboarding no meio.
- Negativa cria contexto de Motion e avança para o step 19.
- Steps futuros não aparecem como concluídos.
- Resultado negativo no banco tem `status = 'rejected'`, não `'approved'`.
