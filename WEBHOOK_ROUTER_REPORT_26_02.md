# 📄 Relatório Técnico: Arquitetura de Roteamento de Webhooks & Integração de Matrícula

**Data:** 26 de Fevereiro de 2026  
**Engenheiro Responsável:** Antigravity (AI Senior Software Engineer)  
**Status:** Implementado via Código (Edge Functions)  
**Assunto:** Webhook Router (Core Logic), Automação de Matrícula e Processamento Zelle (n8n Worker).

---

## 1. O Webhook Router (Arquitetura via Código)

O "Webhook Router" no ecossistema Aplikei não é uma ferramenta externa, mas sim uma **camada de lógica inteligente implementada em TypeScript** dentro das Supabase Edge Functions. Ele atua como o cérebro que decide o que fazer com cada sinal de pagamento recebido.

### 1.1. Inteligência de Roteamento de Ordens
Na função `parcelow-webhook`, o router executa uma busca em cascata para garantir que nenhum pagamento se perca:
- **Rota 1 (ID Remoto):** Tenta localizar a ordem pelo `parcelow_order_id`.
- **Rota 2 (Fallback Reference):** Se falhar, o roteador analisa o campo `reference`. Ele identifica prefixos como `APK_`, remove-os e busca por `order_number` ou o UUID da tabela `visa_orders`.
- **Rota 3 (Auto-Healing):** Ao encontrar a ordem via referência, o código vincula automaticamente o ID da Parcelow para otimizar transações futuras.

### 1.2. Orquestração de Pós-Pagamento
O router não apenas altera o status para "pago". Ele gerencia o fluxo operacional:
- Identifica se o pagamento é de um usuário logado ou um convidado (Guest).
- Dispara o fluxo de criação de identidade se necessário.
- Ativa o serviço correspondente na tabela `user_services`.

---

## 2. O Papel do n8n: Worker Especialista em Zelle

Diferente do Router principal (que é código puro no Supabase), o **n8n** é utilizado exclusivamente como um **Worker de Processamento Zelle**.

### 2.1. Fluxo de Validação de Imagem
O n8n entra em cena apenas para a tarefa específica de processar comprovantes:
1. Recebe a `image_url` enviada pela Edge Function `create-zelle-payment`.
2. Encaminha para a IA (Gemini/GPT) para análise visual.
3. **Data Extraction (Código Real):** O n8n utiliza o script de parsing que recuperamos para extrair o JSON da resposta da IA:
   ```javascript
   const rawText = $item(0).$node["DATA EXTRACTION"].json["candidates"][0]["content"]["parts"][0]["text"];
   try {
     const parsed = JSON.parse(rawText.replace(/```json|```/g, "")); 
     return [{ json: parsed }];
   } catch (error) {
     return [{ json: { error: error.message, rawText } }];
   }
   ```
4. **Retorno ao Router:** O n8n então "devolve" o resultado para o `zelle-webhook` da Aplikei, que reassume o controle do roteamento de matrícula.

---

## 3. Fluxo de Matrícula (Ativação Automática)

A junção definitiva entre pagamento e matrícula foi concluída hoje através de código robusto nas funções de Webhook.

### 3.1. Automação de Convite (Invite Flow)
Implementamos uma lógica de convite "on-the-fly" para garantir que o cliente comece a usar o serviço imediatamente após o pagamento:
- **Detecção de Guest:** Se `user_id` for nulo, o código busca pelo e-mail do cliente/pagador.
- **Invite:** Executa `supabase.auth.admin.inviteUserByEmail` apontando para `/auth/confirm-password`.
- **Provisionamento:** Insere o registro em `user_services` com `status: 'active'`, eliminando etapas manuais da equipe administrativa.

### 3.2. Integração Parcelow (Matrícula via Cartão/PIX)
Mapeamos todos os eventos da Parcelow (`order_paid`, `status: 2`, `Paid`) para que o router dispare a matrícula instantaneamente, independente de como a Parcelow chame o evento de sucesso no payload.

---

## 4. Resumo Técnico das Implementações

| Componente | Tipo | Responsabilidade Principal |
| :--- | :--- | :--- |
| `parcelow-webhook` | Código (TS) | Roteamento de referências APK_ e ativação de matrícula Parcelow. |
| `zelle-webhook` | Código (TS) | Receber validação do n8n e realizar o invite/ativação do usuário. |
| `n8n Flow` | Automação | Especialista em análise OCR/IA do comprovante Zelle. |
| `visa_orders` | DB | Tabela central onde o router reconcilia todos os gateways. |

---

> [!TIP]
> A inteligência agora reside no código das Edge Functions, tornando o sistema independente de ferramentas de terceiros para a lógica de negócio principal. O n8n fica restrito apenas ao que ele faz de melhor: orquestração de APIs de IA e OCR.

**Próxima Etapa:** Validar o tempo de resposta do Realtime no frontend após o Router processar uma ativação de matrícula via Parcelow.
