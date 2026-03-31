# Plano de Implementação: Extensão de Status (EOS)

O objetivo é disponibilizar o produto "Extensão de Status" com a mesma robustez do "Change of Status", mas utilizando status e identidades visuais próprias no banco de dados.

---

## 1. Banco de Dados (Status Whitelist)
Criar uma nova migração SQL para adicionar os status com prefixo `EOS_` na constraint `user_services_status_check`.

**Status EOS:**
- `EOS_ADMIN_SCREENING`
- `EOS_FORMS_SUBMITTED`
- `EOS_OFFICIAL_FORMS`
- `EOS_TRACKING`
- `EOS_RFE`
- `EOS_CASE_FORM`
- `EOS_MOTION_IN_PROGRESS`
- `EOS_MOTION_COMPLETED`

## 2. Abstração de Status (TrackingTab.tsx)
Refatorar o componente de Rastreio para ser "Status-Agnostic".
- Implementar a função `getStatusPrefix(serviceSlug)` que retorna `EOS_` ou `COS_`.
- Atualizar todas as verificações de `p.status.includes("COS_")` para aceitar ambos os prefixos.
- Garantir que ao atualizar o status, o sistema use o prefixo correto do serviço atual.

## 3. Mapeamento de UI (UserProcessStatus.ts)
Adicionar os novos status no dicionário de exibição do Dashboard.
- Mapear `EOS_TRACKING`, `EOS_RFE`, `EOS_CASE_FORM`, etc., para os mesmos rótulos amigáveis do COS, mas mantendo a separação lógica de etapas.

## 4. Ativação do Produto (UserDashboard.tsx)
- Alterar o card de "Extensão de Status" para `available: true`.
- Garantir que o redirecionamento leve para o checkout correto.

## 5. Admin Panel (AdminCosAnalysisPanel.tsx)
- Atualizar a lógica de busca e atualização para respeitar o prefixo do serviço que está sendo analisado (se for EOS, o Admin entrega como `EOS_MOTION_COMPLETED`).

---
**Resultado Esperado:** O usuário poderá contratar a Extensão de Status, passar pelo onboarding idêntico ao COS, e caso receba um RFE ou Negação, terá acesso ao mesmo fluxo de Upsell de Motion/RFE, porém com registros de histórico totalmente separados no banco de dados.
