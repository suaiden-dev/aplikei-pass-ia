# tasks.md — Lista de Tarefas: Refatoração MVC

## Visão Geral
Refatoração incremental do projeto para MVC Clean Code.
**Abordagem:** Uma página por vez, mantendo backward compatibility.

---

## Fase 1: Foundation (Models + Repositories + Services)

### 1.1 Models

| # | Tarefa | Arquivo | Prioridade |
|---|--------|---------|------------|
| 1.1.1 | Criar `src/models/index.ts` com exports | src/models/index.ts | HIGH |
| 1.1.2 | Criar `src/models/process.model.ts` | src/models/process.model.ts | HIGH |
| 1.1.3 | Criar `src/models/payment.model.ts` | src/models/payment.model.ts | MEDIUM |
| 1.1.4 | Criar `src/models/notification.model.ts` | src/models/notification.model.ts | MEDIUM |
| 1.1.5 | Criar `src/models/workflow.model.ts` | src/models/workflow.model.ts | MEDIUM |
| 1.1.6 | Criar `src/models/ds160.model.ts` | src/models/ds160.model.ts | MEDIUM |
| 1.1.7 | Criar `src/models/i539.model.ts` | src/models/i539.model.ts | MEDIUM |
| 1.1.8 | Criar `src/models/chat.model.ts` | src/models/chat.model.ts | LOW |

### 1.2 Repositories

| # | Tarefa | Arquivo | Prioridade |
|---|--------|---------|------------|
| 1.2.1 | Criar `src/repositories/index.ts` | src/repositories/index.ts | HIGH |
| 1.2.2 | Criar `src/repositories/user.repository.ts` | src/repositories/user.repository.ts | HIGH |
| 1.2.3 | Criar `src/repositories/process.repository.ts` | src/repositories/process.repository.ts | HIGH |
| 1.2.4 | Criar `src/repositories/payment.repository.ts` | src/repositories/payment.repository.ts | MEDIUM |
| 1.2.5 | Criar `src/repositories/notification.repository.ts` | src/repositories/notification.repository.ts | MEDIUM |
| 1.2.6 | Criar `src/repositories/chat.repository.ts` | src/repositories/chat.repository.ts | LOW |

### 1.3 Services Refactoring

| # | Tarefa | Arquivo | Prioridade |
|---|--------|---------|------------|
| 1.3.1 | Refatorar `src/services/process.service.ts` para usar repository | src/services/process.service.ts | HIGH |
| 1.3.2 | Refatorar `src/services/payment.service.ts` para usar repository | src/services/payment.service.ts | MEDIUM |
| 1.3.3 | Refatorar `src/services/notification.service.ts` para usar repository | src/services/notification.service.ts | MEDIUM |
| 1.3.4 | Refatorar `src/services/i539.service.ts` para usar repository | src/services/i539.service.ts | MEDIUM |
| 1.3.5 | Simplificar `src/services/index.ts` exports | src/services/index.ts | LOW |

---

## Fase 2: Controllers + Views (Pilot: Dashboard)

### 2.1 Controllers

| # | Tarefa | Arquivo | Prioridade |
|---|--------|---------|------------|
| 2.1.1 | Criar `src/controllers/index.ts` | src/controllers/index.ts | HIGH |
| 2.1.2 | Criar `src/controllers/shared/useServiceState.ts` | src/controllers/shared/useServiceState.ts | HIGH |
| 2.1.3 | Criar `src/controllers/shared/useStepNavigation.ts` | src/controllers/shared/useStepNavigation.ts | HIGH |
| 2.1.4 | Criar `src/controllers/dashboard/DashboardController.ts` | src/controllers/dashboard/DashboardController.ts | HIGH |
| 2.1.5 | Criar `src/controllers/dashboard/index.ts` | src/controllers/dashboard/index.ts | MEDIUM |

### 2.2 Views

| # | Tarefa | Arquivo | Prioridade |
|---|--------|---------|------------|
| 2.2.1 | Criar `src/views/index.ts` | src/views/index.ts | HIGH |
| 2.2.2 | Criar `src/views/dashboard/DashboardView.tsx` | src/views/dashboard/DashboardView.tsx | HIGH |
| 2.2.3 | Criar `src/views/dashboard/ActiveProcessCard.tsx` | src/views/dashboard/ActiveProcessCard.tsx | MEDIUM |
| 2.2.4 | Criar `src/views/dashboard/ServiceCard.tsx` | src/views/dashboard/ServiceCard.tsx | MEDIUM |

### 2.3 Page Refactoring (Dashboard)

| # | Tarefa | Arquivo | Prioridade |
|---|--------|---------|------------|
| 2.3.1 | Modificar `DashboardPage` para usar Controller + View | src/pages/customer/DashboardPage/index.tsx | HIGH |
| 2.3.2 | Testar DashboardPage refatorado | - | HIGH |

---

## Fase 3: B1B2 Onboarding

### 3.1 Controllers

| # | Tarefa | Arquivo | Prioridade |
|---|--------|---------|------------|
| 3.1.1 | Criar `src/controllers/B1B2/index.ts` | src/controllers/B1B2/index.ts | HIGH |
| 3.1.2 | Criar `src/controllers/B1B2/B1B2OnboardingController.ts` | src/controllers/B1B2/B1B2OnboardingController.ts | HIGH |
| 3.1.3 | Criar `src/controllers/B1B2/B1B2ProcessDetailController.ts` | src/controllers/B1B2/B1B2ProcessDetailController.ts | MEDIUM |

### 3.2 Views

| # | Tarefa | Arquivo | Prioridade |
|---|--------|---------|------------|
| 3.2.1 | Criar `src/views/onboarding/B1B2OnboardingView.tsx` | src/views/onboarding/B1B2OnboardingView.tsx | HIGH |
| 3.2.2 | Criar `src/views/onboarding/steps/DS160StepView.tsx` | src/views/onboarding/steps/DS160StepView.tsx | MEDIUM |
| 3.2.3 | Criar `src/views/components/AdminFeedbackBanner.tsx` | src/views/components/AdminFeedbackBanner.tsx | MEDIUM |

### 3.3 Page Refactoring (B1B2)

| # | Tarefa | Arquivo | Prioridade |
|---|--------|---------|------------|
| 3.3.1 | Modificar `B1B2OnboardingPage` para usar Controller + View | src/pages/customer/B1B2OnboardingPage/index.tsx | HIGH |
| 3.3.2 | Testar B1B2OnboardingPage refatorado | - | HIGH |

---

## Fase 4: COS Onboarding

### 4.1 Controllers

| # | Tarefa | Arquivo | Prioridade |
|---|--------|---------|------------|
| 4.1.1 | Criar `src/controllers/COS/index.ts` | src/controllers/COS/index.ts | HIGH |
| 4.1.2 | Criar `src/controllers/COS/COSOnboardingController.ts` | src/controllers/COS/COSOnboardingController.ts | HIGH |
| 4.1.3 | Criar `src/controllers/COS/COSProcessDetailController.ts` | src/controllers/COS/COSProcessDetailController.ts | MEDIUM |

### 4.2 Views

| # | Tarefa | Arquivo | Prioridade |
|---|--------|---------|------------|
| 4.2.1 | Criar `src/views/onboarding/COSOnboardingView.tsx` | src/views/onboarding/COSOnboardingView.tsx | HIGH |

### 4.3 Page Refactoring (COS)

| # | Tarefa | Arquivo | Prioridade |
|---|--------|---------|------------|
| 4.3.1 | Modificar `COSOnboardingPage` para usar Controller + View | src/pages/customer/COSOnboardingPage/index.tsx | HIGH |
| 4.3.2 | Testar COSOnboardingPage refatorado | - | HIGH |

---

## Fase 5: F1 Onboarding

### 5.1 Controllers

| # | Tarefa | Arquivo | Prioridade |
|---|--------|---------|------------|
| 5.1.1 | Criar `src/controllers/F1/index.ts` | src/controllers/F1/index.ts | MEDIUM |
| 5.1.2 | Criar `src/controllers/F1/F1OnboardingController.ts` | src/controllers/F1/F1OnboardingController.ts | MEDIUM |

### 5.2 Page Refactoring (F1)

| # | Tarefa | Arquivo | Prioridade |
|---|--------|---------|------------|
| 5.2.1 | Modificar `F1OnboardingPage` para usar Controller + View | src/pages/customer/F1OnboardingPage/index.tsx | MEDIUM |

---

## Fase 6: Remaining Pages

| # | Tarefa | Prioridade |
|---|---------|------------|
| 6.1 | MyProcessesPage | MEDIUM |
| 6.2 | ProcessDetailPage | MEDIUM |
| 6.3 | ProfileSettingsPage | LOW |
| 6.4 | SupportPage | LOW |
| 6.5 | AIChatPage | LOW |

---

## Fase 7: Admin Pages

| # | Tarefa | Prioridade |
|---|---------|------------|
| 7.1 | OverviewPage | MEDIUM |
| 7.2 | ProcessesPage | MEDIUM |
| 7.3 | ProcessDetailPage | MEDIUM |
| 7.4 | CustomersPage | LOW |
| 7.5 | ChatsPage | LOW |
| 7.6 | ZellePaymentsPage | LOW |
| 7.7 | ProductsPage | LOW |
| 7.8 | CouponsPage | LOW |

---

## Fase 8: Cleanup

| # | Tarefa | Prioridade |
|---|---------|------------|
| 8.1 | Remover lógica duplicada em services | HIGH |
| 8.2 | Garantir components são "dumb" | MEDIUM |
| 8.3 | Adicionar testes unitários | MEDIUM |
| 8.4 | Documentar padrões em README | LOW |
| 8.5 | Limpar imports não usados | LOW |

---

## Resumo de Tarefas

| Fase | Tarefas | Prioridade Alta |
|------|---------|-----------------|
| 1 | 20 | 11 |
| 2 | 9 | 6 |
| 3 | 7 | 4 |
| 4 | 5 | 3 |
| 5 | 3 | 2 |
| 6 | 5 | 2 |
| 7 | 8 | 3 |
| 8 | 5 | 2 |
| **TOTAL** | **62** | **33** |

---

## Ordem de Execução Recomendada

1. **Fase 1** → Foundation (não quebra nada)
2. **Fase 2** → Dashboard (pilot, validar padrão)
3. **Fase 3** → B1B2 (fluxo principal)
4. **Fase 4** → COS (fluxo principal)
5. **Fase 5** → F1
6. **Fase 6-7** → Páginas restantes
7. **Fase 8** → Cleanup
