# Roadmap de Refatoração Técnica 🛠️

Este documento organiza as tarefas de melhoria de código identificadas para otimizar a manutenção e escalabilidade do projeto.

---

## 📋 Lista de Tarefas (Backlog de Refatoração)

| Prioridade | Tarefa | Arquivo Alvo | Dificuldade | Impacto |
| :--- | :--- | :--- | :---: | :--- |
| **Alta** | Extrair Gatilhos de Pagamento para Use Cases | `src/pages/Checkout.tsx` | 🟢 4/5 | Facilita adicionar novos métodos de pagamento e isola erros de API. |
| **Alta** | Modularizar Fluxo Recursivo de RFE/Motion | `src/pages/dashboard/TrackingTab.tsx` | 🟢 4/5 | Evita que o componente de UI gerencie estados complexos de banco de dados. |
| **Média** | ✅ Split de Arquivo de Traduções (i18n) | `src/i18n/translations.ts` | 🟢 2/5 | **CONCLUÍDO:** Migrado para lazy-loading com `useT`. |
| **Média** | ✅ Desacoplar Lógica de Análise Administrativa | `AdminCosAnalysisPanel.tsx` | 🟢 3/5 | **CONCLUÍDO:** Lógica modularizada e independente. |
| **Média** | ✅ Simplificar Motor de Cards do Dashboard | `UserDashboard.tsx` | 🟢 3/5 | **CONCLUÍDO:** Cards agora usam transições modulares e estrutura limpa. |
| **Baixa** | ✅ Decomposição de Seções da Landing Page | `src/pages/Index.tsx` | 🟢 1/5 | **CONCLUÍDO:** Landing page e seções totalmente modularizadas. |

---

## 🧠 Detalhamento por Complexidade

### 🔴 Nível 4 e 5 (Arquitetura)
*   **Checkout & Tracking:** Estes são os "cérebros" do sistema. A refatoração envolve mover a lógica de `useEffect` e `handle` para a camada de `domain` e `application`. Isso exige testes rigorosos de regressão em pagamentos reais e transições de status do Supabase.

### 🟡 Nível 3 (Lógica de Negócio)
*   **Admin Panel & Dashboard:** Envolve a criação de novos hooks customizados (ex: `useRecoveryCase`) para esconder a complexidade das consultas e filtros do Supabase da camada de apresentação (React).

### 🟢 Nível 1 e 2 (Organização)
*   **i18n & Index Sections:** Tarefas seguras e rápidas. Podem ser feitas em paralelo com outras entregas para manter o "limpa" semanal no código.

---
> [!TIP]
> Recomenda-se realizar uma tarefa de dificuldade 4 acompanhada de uma de dificuldade 1 para equilibrar a velocidade de entrega com a qualidade técnica.
