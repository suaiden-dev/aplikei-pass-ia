# Roadmap de Refatoração Técnica 🛠️

Este documento organiza as tarefas de melhoria de código identificadas para otimizar o projeto.

---

### ✅ Concluído
- [x] **Split de Traduções (i18n):** Migrado para o sistema modular `useT`.
- [x] **Lógica Administrativa:** `AdminCosAnalysisPanel.tsx` totalmente desacoplado.
- [x] **Motor de Cards do Dashboard:** Seções extraídas do `UserDashboard.tsx`.
- [x] **Landing Page:** Decomposição total e centralização de assets no `Index.tsx`.
- [x] **Fragmentar Lógica de Onboarding:** Desmembrado em hooks específicos (`useOnboardingBase`, `useCOSFlow`, `useB1B2Flow`, `useF1F2Flow`) e renderizadores modulares. Redução drástica da complexidade do `index.tsx`.
- [x] **Gatilhos de Pagamento:** Lógica de checkout e APIs totalmente isoladas e centralizadas no `UnifiedPaymentService` e hook `useCheckout`.
- [x] **Fluxo RFE/Motion:** Componente `TrackingTab.tsx` modularizado em sub-componentes especializados e lógica extraída para o hook `useTracking`.
- [x] **Padronização Camada de UI (Átomos):**
    - [x] Criação da coleção `FormFields`
    - [x] Refatoração do `Checkout.tsx`
    - [x] Refatoração do `PaymentPendingStep.tsx` (Premium)
    - [x] Refatoração do `ChangeOfStatusOfficialFormsStep.tsx` (Premium)
    - [x] Refatoração do `ChangeOfStatusFinalPackageStep.tsx` (Premium)
    - [x] Refatoração de Onboarding Steps (`PersonalInfoStep`, `HistoryStep`, `ChangeOfStatusFormStep`)

---

### ⏳ Pendente (Próximos Passos)
- [ ] Revisão de Acessibilidade (WCAG) nos novos componentes Premium
- [ ] Otimização de Performance (Lazy loading de formulários pesados)

---
> [!NOTE]
> Foco atual: **Refinamento Estético Premium** e **Estabilidade do Fluxo de Pagamento**.
