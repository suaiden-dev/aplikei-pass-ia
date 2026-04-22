# checklist.md — Verificação de Refatoração MVC

## Como Usar
Marque cada item como `[x]` quando completar. Requisitos de cada fase devem estar 100% completos antes de avançar.

---

## Fase 1: Foundation (Models + Repositories + Services)

### 1.1 Models ✅

- [ ] **1.1.1** `src/models/index.ts` existe e exporta todos os models
- [ ] **1.1.2** `src/models/process.model.ts` contém:
  - [ ] `ProcessStatus` type
  - [ ] `UserService` interface
  - [ ] `StepData` interface
  - [ ] `WorkflowStep` interface
- [ ] **1.1.3** `src/models/payment.model.ts` contém:
  - [ ] `Order` interface
  - [ ] `Coupon` interface
  - [ ] `PaymentStatus` type
- [ ] **1.1.4** `src/models/notification.model.ts` contém:
  - [ ] `Notification` interface
  - [ ] `NotificationTemplate` type
- [ ] **1.1.5** `src/models/workflow.model.ts` contém:
  - [ ] `MotionWorkflow` interface
  - [ ] `RFEWorkflow` interface
- [ ] **1.1.6** `src/models/ds160.model.ts` exporta `DS160FormValues`
- [ ] **1.1.7** `src/models/i539.model.ts` exporta `I539FormValues`

### 1.2 Repositories ✅

- [ ] **1.2.1** `src/repositories/index.ts` existe e exporta todos os repositories
- [ ] **1.2.2** `src/repositories/user.repository.ts`:
  - [ ] `findById(id)` retorna `User | null`
  - [ ] `findByEmail(email)` retorna `User | null`
  - [ ] `update(user)` atualiza usuário
- [ ] **1.2.3** `src/repositories/process.repository.ts`:
  - [ ] `findById(id)` retorna `UserService | null`
  - [ ] `findByUserAndSlug(userId, slug)` retorna `UserService | null`
  - [ ] `findByUser(userId)` retorna `UserService[]`
  - [ ] `create(data)` cria novo serviço
  - [ ] `updateStatus(id, status)` atualiza status
  - [ ] `updateStepData(id, stepData)` atualiza step_data
- [ ] **1.2.4** `src/repositories/payment.repository.ts`:
  - [ ] `findOrderById(id)` retorna `Order | null`
  - [ ] `findByUser(userId)` retorna `Order[]`
  - [ ] `create(order)` cria order
- [ ] **1.2.5** `src/repositories/notification.repository.ts`:
  - [ ] `create(notification)` cria notificação
  - [ ] `findByUser(userId)` retorna `Notification[]`
- [ ] **1.2.6** `src/repositories/chat.repository.ts`:
  - [ ] `findByProcess(processId)` retorna `ChatMessage[]`
  - [ ] `create(message)` cria mensagem

### 1.3 Services Refactoring ✅

- [ ] **1.3.1** `src/services/process.service.ts`:
  - [ ] NÃO tem queries Supabase diretas
  - [ ] USA `processRepository` para acesso a dados
  - [ ] Mantém lógica de negócio (validações, notificações)
- [ ] **1.3.2** `src/services/payment.service.ts`:
  - [ ] NÃO tem queries Supabase diretas
  - [ ] USA `paymentRepository`
- [ ] **1.3.3** `src/services/notification.service.ts`:
  - [ ] NÃO tem queries Supabase diretas
  - [ ] USA `notificationRepository`
- [ ] **1.3.4** `src/services/i539.service.ts`:
  - [ ] NÃO tem queries Supabase diretas
  - [ ] USA repositories adequados
- [ ] **1.3.5** Rodar `npm run build` sem erros
- [ ] **1.3.6** Rodar testes: `npm run test` passing

**Fase 1 COMPLETA quando: [ ] Todos os itens acima marcados**

---

## Fase 2: Controllers + Views (Dashboard Pilot)

### 2.1 Controllers ✅

- [ ] **2.1.1** `src/controllers/index.ts` existe
- [ ] **2.1.2** `src/controllers/shared/useServiceState.ts`:
  - [ ] Hook `useServiceState` existe
  - [ ] Aceita `userId` e `slug` como params
  - [ ] Retorna `{ service, isLoading, error, refetch }`
- [ ] **2.1.3** `src/controllers/shared/useStepNavigation.ts`:
  - [ ] Hook `useStepNavigation` existe
  - [ ] Lógica de navegação entre steps
- [ ] **2.1.4** `src/controllers/dashboard/DashboardController.ts`:
  - [ ] Hook `useDashboardController` existe
  - [ ] Busca user services via `processService`
  - [ ] Busca preços via `paymentService`
  - [ ] Lida com realtime subscription
  - [ ] Retorna `{ userServices, activeServices, isLoading, ... }`

### 2.2 Views ✅

- [ ] **2.2.1** `src/views/index.ts` existe
- [ ] **2.2.2** `src/views/dashboard/DashboardView.tsx`:
  - [ ] Componente é puro (sem lógica de negócio)
  - [ ] Recebe dados via props
  - [ ] Emite eventos via callbacks
  - [ ] Renderiza `ActiveProcessCard` e `ServiceCard`
- [ ] **2.2.3** `src/views/dashboard/ActiveProcessCard.tsx`:
  - [ ] Componente é puro
  - [ ] Recebe `proc: UserService` como prop
  - [ ] Mostra progresso, status, badge
- [ ] **2.2.4** `src/views/dashboard/ServiceCard.tsx`:
  - [ ] Componente é puro
  - [ ] Recebe `service: Service` e callbacks como props

### 2.3 Page Refactoring ✅

- [ ] **2.3.1** `src/pages/customer/DashboardPage/index.tsx`:
  - [ ] USA `useDashboardController` hook
  - [ ] USA `DashboardView` component
  - [ ] NÃO tem lógica de negócio (só glue code)
  - [ ] Compila sem erros
- [ ] **2.3.2** Dashboard funciona em browser:
  - [ ] Lista de processos ativos aparece
  - [ ] Cards de serviços aparecem
  - [ ] Navegação funciona
  - [ ] Realtime updates funcionam
- [ ] **2.3.3** Rodar `npm run lint` sem errors
- [ ] **2.3.4** Rodar `npm run build` sem erros

**Fase 2 COMPLETA quando: [ ] Todos os itens acima marcados**

---

## Fase 3: B1B2 Onboarding

### 3.1 Controllers ✅

- [ ] **3.1.1** `src/controllers/B1B2/index.ts` existe
- [ ] **3.1.2** `src/controllers/B1B2/B1B2OnboardingController.ts`:
  - [ ] Hook `useB1B2OnboardingController` existe
  - [ ] `loadService(idParam)` funciona
  - [ ] `handleSubmit(values)` salva e avança step
  - [ ] `handleSaveDraft(values)` salva rascunho
  - [ ] `handleRequestReview()` notifica admin

### 3.2 Views ✅

- [ ] **3.2.1** `src/views/onboarding/B1B2OnboardingView.tsx`:
  - [ ] Componente é puro
  - [ ] Formik integrado (mas validação no controller)
  - [ ] Renderiza steps corretos baseado em `stepIdx`
- [ ] **3.2.2** `src/views/onboarding/steps/DS160StepView.tsx`:
  - [ ] Wrapper puro em torno de `DS160SingleFormStep`
- [ ] **3.2.3** `src/views/components/AdminFeedbackBanner.tsx`:
  - [ ] Componente reutilizável para feedback admin

### 3.3 Page Refactoring ✅

- [ ] **3.3.1** `src/pages/customer/B1B2OnboardingPage/index.tsx`:
  - [ ] USA `useB1B2OnboardingController`
  - [ ] USA `B1B2OnboardingView`
  - [ ] NÃO tem lógica de negócio
- [ ] **3.3.2** B1B2 Onboarding funciona:
  - [ ] Carrega dados do serviço
  - [ ] Salva form DS160
  - [ ] Avança para próximo step
  - [ ] Mostra feedback admin se existir
- [ ] **3.3.3** Rodar `npm run build` sem erros

**Fase 3 COMPLETA quando: [ ] Todos os itens acima marcados**

---

## Fase 4: COS Onboarding

### 4.1 Controllers ✅

- [ ] **4.1.1** `src/controllers/COS/index.ts` existe
- [ ] **4.1.2** `src/controllers/COS/COSOnboardingController.ts`:
  - [ ] Hook `useCOSOnboardingController` existe
  - [ ] Lógica de Motion Workflow
  - [ ] Lógica de RFE Workflow
  - [ ] Gerencia múltiplos steps

### 4.2 Views ✅

- [ ] **4.2.1** `src/views/onboarding/COSOnboardingView.tsx`:
  - [ ] Renderiza steps corretos
  - [ ] Workflow indicators

### 4.3 Page Refactoring ✅

- [ ] **4.3.1** `src/pages/customer/COSOnboardingPage/index.tsx`:
  - [ ] USA controller + view
- [ ] **4.3.2** COS Onboarding funciona (teste completo)

**Fase 4 COMPLETA quando: [ ] Todos os itens acima marcados**

---

## Fase 5: F1 Onboarding

- [ ] **5.1.1** Controller criado
- [ ] **5.1.2** View criada
- [ ] **5.2.1** Page refatorada e funcionando

**Fase 5 COMPLETA quando: [ ] Todos os itens acima marcados**

---

## Fase 6-7: Remaining Pages

- [ ] MyProcessesPage refatorado
- [ ] ProcessDetailPage refatorado
- [ ] ProfileSettingsPage refatorado
- [ ] SupportPage refatorado
- [ ] AIChatPage refatorado
- [ ] Admin pages (8 páginas)

**Fases 6-7 COMPLETAS quando: [ ] Todos os itens acima marcados**

---

## Fase 8: Cleanup

- [ ] **8.1** Nenhum service tem queries Supabase diretas
- [ ] **8.2** Todos components são "dumb" (sem useEffect, sem useState para lógica)
- [ ] **8.3** Cobertura de testes > 60%
- [ ] **8.4** `npm run lint` sem errors
- [ ] **8.5** `npm run build` succeeds
- [ ] **8.6** Imports não usados limpos

**Fase 8 COMPLETA quando: [ ] Todos os itens acima marcados**

---

## Critérios Finais de Conclusão

- [ ] **Fase 1** 100% completa
- [ ] **Fase 2** 100% completa (pilot validado)
- [ ] **Fase 3** 100% completa
- [ ] **Fase 4** 100% completa
- [ ] **Fase 5** 100% completa
- [ ] **Fases 6-7** 100% completas
- [ ] **Fase 8** 100% completa
- [ ] Projeto compila sem erros
- [ ] Testes passando
- [ ] Lint limpo

**REFATORAÇÃO COMPLETA: [ ] Quando todos os itens acima marcados**
