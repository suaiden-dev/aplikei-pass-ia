# Documentação de Integração de IA - Aplikei Pass

Este documento detalha as APIs e integrações de Inteligência Artificial utilizadas no projeto para referência futura e configuração.

## 1. Supabase Edge Function: `chat`

A principal integração de IA ocorre através de uma Edge Function chamada `chat`. Esta função atua como um proxy seguro entre o frontend e a API do Google Gemini.

### Detalhes Técnicos:
- **Localização:** `supabase/functions/chat/index.ts`
- **Modelo Utilizado:** `google/gemini-3-flash-preview` (configurado via endpoint compatível com OpenAI do Gemini).
- **Provedor:** Google AI Studio (Gemini API).

### Variáveis de Ambiente Necessárias:
Para que a função funcione no Supabase, é obrigatório configurar a seguinte variável:

- `GEMINI_API_KEY`: Sua chave de API obtida no [Google AI Studio](https://aistudio.google.com/).

**Como configurar no Supabase CLI:**
```bash
supabase secrets set GEMINI_API_KEY=sua_chave_aqui
```

**Como configurar no Dashboard do Supabase:**
Vá em `Edge Functions` > `chat` > `Settings` e adicione a chave.

### Regras de Negócio (System Prompt):
A IA está configurada com um prompt de sistema rigoroso que define:
- Tom acolhedor e direto.
- Fluxo de conversa em 6 etapas (Saudação -> E-mail -> WhatsApp -> Entender o caso -> Aprofundar -> Apresentar serviço).
- Proibição de aconselhamento jurídico.
- Tabela de preços dos serviços da Aplikei Pass.

---

## 2. Integração no Frontend

O frontend consome a IA através da biblioteca `@supabase/supabase-js`.

### Componente: `src/pages/dashboard/Chat.tsx`
O componente envia o histórico de mensagens para a Edge Function:

```typescript
const { data, error } = await supabase.functions.invoke("chat", {
  body: { messages: newMessages },
});
```

### Persistência de Dados:
Todas as mensagens trocadas são salvas na tabela `chat_messages` do banco de dados para que o usuário não perca o contexto ao recarregar a página.

---

## 3. Histórico de Mudanças
- **Fev/2026:** Migração do Gateway da Lovable para integração direta com Google Gemini via `generativelanguage.googleapis.com`.
- **Fev/2026:** Substituição da variável `LOVABLE_API_KEY` por `GEMINI_API_KEY`.
