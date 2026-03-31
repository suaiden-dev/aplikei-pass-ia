# Roadmap de Refatoração Técnica 🛠️

Este documento organiza as tarefas de melhoria de código identificadas para otimizar o projeto.

---

### ✅ Concluído
- [x] **Split de Traduções (i18n):** Migrado para o sistema modular `useT`.
- [x] **Lógica Administrativa:** `AdminCosAnalysisPanel.tsx` totalmente desacoplado.
- [x] **Motor de Cards do Dashboard:** Seções extraídas do `UserDashboard.tsx`.
- [x] **Landing Page:** Decomposição total e centralização de assets no `Index.tsx`.

---

### ⏳ Pendente (Próximos Passos)
- [ ] **Fragmentar Lógica de Onboarding:** Desmembrar `useOnboardingLogic.ts` e `index.tsx` (~80kb).
- [ ] **Gatilhos de Pagamento:** Isolar a lógica de checkout e APIs no `Checkout.tsx`.
- [ ] **Fluxo RFE/Motion:** Modularizar o componente de rastreamento `TrackingTab.tsx`.
- [ ] **Padronização de UI:** Extrair átomos de formulário para componentes reutilizáveis.

---
> [!NOTE]
> Foco atual: **Redução de complexidade em arquivos gigantes** e **Desacoplamento de APIs**.
