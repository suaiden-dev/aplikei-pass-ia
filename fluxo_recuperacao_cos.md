# Relatório do Fluxo de Recuperação de COS (RFE & Motion)

Este documento descreve o funcionamento ponta-a-ponta da inteligência recursiva implementada para lidar com **RFEs** (Request for Evidence) e **Motions** (Motion for Reconsideration) no USCIS.

---

## 1. Mapeamento de Status no Banco de Dados
Para evitar erros de restrição (`CHECK constraints`), o sistema utiliza um conjunto centralizado de status que já existem no banco de dados, multiplexados pelo campo `data.recovery_type`.

| Status (user_services) | Significado no Fluxo | Visão do Cliente |
| :--- | :--- | :--- |
| `COS_TRACKING` | Ponto de Partida | Rastreio Inicial (Fedex/USPS) |
| `COS_CASE_FORM` | Preparação | Formulário de Instruções ao Especialista |
| `ANALISE_PENDENTE` | Em Análise | "Aguardando Resposta em 24h" |
| `ANALISE_CONCLUIDA` | Proposta Pronta | Botão de Contratação (USD) |
| `COS_MOTION_IN_PROGRESS` | Execução (Pago) | "Preparando seus Documentos" |
| `COS_MOTION_COMPLETED` | Entrega Final | Download dos Arquivos e Botões de Feedback |
| `approved` | Sucesso Final | Tela de Celebração Azul |
| `rejected` | Insucesso Final | Tela de "Fim da Linha" (Somente após Motion) |

---

## 2. A Inteligência Recursiva (Logica de Negativa)
O campo `data.recovery_type` (JSON) decide a próxima ação do sistema quando o cliente clica em **"Foi Negado"**.

### Fluxo A: RFE (Recuperação Intermediária)
- **Tipo Inicial:** `data.recovery_type = "rfe"`
- **Se Negado na Entrega:** 
  1. O sistema muda o tipo para `motion`.
  2. Volta o status para `COS_CASE_FORM`.
  3. **Resultado:** O cliente é convidado a iniciar o Motion (Segunda Chance).

### Fluxo B: Motion (Última Instância)
- **Tipo Inicial:** `data.recovery_type = "motion"`
- **Se Negado na Entrega:** 
  1. O sistema mantém o tipo `motion`.
  2. Muda o status final para `rejected`.
  3. **Resultado:** O cliente vê a tela de **Fim da Linha**, bloqueando novos pedidos de COS.

---

## 3. Comportamento das Telas

### TrackingTab.tsx (Cliente)
- **Helper `getRecoveryLabel()`:** Troca todos os textos dinamicamente. Se o tipo for `rfe`, exibe "RFE", se for `motion`, exibe "Motion".
- **Gatilho de RFE:** No rastreio normal, o botão "RFE Recebido" agora inicia o formulário com a tag correta.
- **Sincronização:** Usa `postgres_changes` em tempo real para atualizar o dashboard assim que o Admin envia os arquivos.

---
**Status Final:** O sistema está resiliente, com tratamento de erros de banco de dados e UX fluida para o cliente final.
