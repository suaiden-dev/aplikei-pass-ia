# Relatório Técnico Detalhado: Arquitetura End-to-End de Pagamentos Zelle

**Data:** 24 de Fevereiro de 2026
**Projeto:** Aplikei
**Autores:** Equipe de Engenharia / Assistente de IA
**Status:** Implementado em Produção (Supabase Cloud)

---

## 📌 1. Visão Geral da Arquitetura (System Design)
O sistema implementado visa automatizar totalmente a liquidação de pagamentos manuais via Zelle. A arquitetura foi projetada para suportar tanto usuários logados quanto **Guest Checkouts** (compradores não autenticados).

O fluxo de dados segue a estrutura:
1. **Frontend (React)** faz o upload do comprovante e chama a Edge Function `create-zelle-payment`.
2. A função salva o registro (`pending_verification`) e aciona um webhook do **n8n**.
3. O **n8n** extrai a imagem, envia para a API do **Gemini 2.5 Pro** com um prompt de validação rigoroso e recebe um JSON estruturado.
4. O n8n chama a Edge Function de callback `zelle-webhook`.
5. A função `zelle-webhook` decide a aprovação, lida com a criação silenciosa de contas Auth, provisiona serviços em `user_services` e envia o link de ativação via SMTP customizado.
6. O **Frontend** reflete a mudança de estado instantaneamente via **Supabase Realtime**.

---

## 🏗️ 2. Camada de Infraestrutura: Supabase (PostgreSQL & Storage)

### 2.1. Políticas de RLS (Row Level Security)
O ambiente precisou ser adaptado para tráfego anônimo seguro:
- **Storage Bucket (`zelle_comprovantes`)**: 
  - Configurado como Público (`public: true`).
  - `INSERT` Policy: Criada política permitindo operações anônimas sem necessidade de token JWT, garantindo que usuários na modalidade "Guest" consigam subir comprovantes de pagamento.
- **Tabela `zelle_payments`**:
  - `INSERT` Policy: Liberada para a role `anon`, permitindo preenchimento de `guest_email` e `guest_name` em vez de obrigatoriamente um `user_id`.
  - `SELECT` / `UPDATE`: Fechadas para restringir a visibilidade do registro de histórico de pagamentos apenas ao dono daquele UUID (se autenticado).

---

## ⚡ 3. Camada Serverless: Edge Functions (Deno Runtime)

### 3.1. Edge Function: `create-zelle-payment`
Essa função é a ponte entre o frontend e a camada de automação.
- **Stack**: Deno HTTP Server, Supabase JS Client v2.
- **Processamento**:
  - Deserializa o payload contendo: `amount`, `payment_date`, `proof_path`, `guest_email`, etc.
  - Verifica a presença da flag HTTP `Authorization`. Se presente, injeta o `user.id`. Constrói de forma absoluta a `image_url` através de concatenação da URL pública do bucket.
  - Insere o payload serializado no banco atestando estado isolado (`status: 'pending_verification'`).
  - Realiza um Fetch assíncrono padrão (Fire-and-Forget, sem travar o processamento da Promise) enviando um Webhook à rota do n8n configurada pelo env `N8N_ZELLE_WEBHOOK_URL`.

### 3.2. Edge Function: `zelle-webhook` (A Joia da Coroa)
Responsável pelo retorno (callback) do n8n. Refatorada pesadamente para evitar gargalos de processamento.
- **Autenticação Admin**: Utiliza a `SUPABASE_SERVICE_ROLE_KEY` bypassando políticas de RLS para gerenciamento nativo sistêmico.
- **Regras de Negócio de Machine Learning**:
  - Aceita chamadas apenas se o objeto tiver `payment_id` e a prop `response: "valid"`. Adicionalmente, exige taxa mínima de convergência (`confidence > 0.90`) atestada pelo Gemini.
- **Processo Múltiplo de Guest Auth (Implementação Silenciosa/Silent Creation)**:
  - Inicialmente a IA faz uma checagem restritiva usando `supabase.auth.admin.listUsers()`, procurando duplicidade real do `guest_email`.
  - Se o usuário não existe, o sistema **não invoca** um fluxo de Sign Up padrão. Motivo: Geração maciça de logs de spam no provedor.
  - A API executa `supabase.auth.admin.createUser` com `email_confirm: true`. Isso marca a conta como confirmada diretamente no núcleo GoTrue do postgres e contorna o e-mail de dupla verificação.
- **Otimização de SMTP Fallback**:
  - Limitamos o tráfego chamando exclusivamente o comando `generateLink({ type: "recovery" })`.
  - Foram injetados blocos `try/catch` independentes no disparo de links. Subjacente a regras complexas, mesmo que ocorra *"Rate Limit Exceeded"* (por limites da API SendGrid interna ou Google local), o pagamento transita independentemente seu callback vital, ativando `user_services` proativamente, nunca refazendo a operação de captura.

---

## 🤖 4. Camada de Automação e IA (n8n + Gemini 2.5 Pro)

Foi montada uma topografia em nós complexa focada estritamente em **Document Parsing & Validation**:
- **Prompt Engineering**:
  - A estruturação foi desenhada com tag-nodes (`<validation-criteria>`, `<logic>`, `<response-format>`).
  - **Validação de Data Dinâmica**: Utiliza injeção em JavaScript nativo para compilar localmente o formato America/Sao_Paulo (Ex: `24/02/2026`) combinando com short_string US.
  - **Identificadores Obrigatórios**: Condiciona a inferência booleana à captação cruzada do valor numérico (Value) preenchido em checkout e símbolo cambial esperado (USD). Sem conciliação em array visual da imagem, nega a transação sumariamente.
- **Fluxo de Roteamento (Switches & PostgreSQL)**:
  - Nó `Switch`: Cria ramificações baseadas em status `isValid` + análise estrita sobre se o array JSON retornou com a chave nativa `transaction_code`.
  - Nó `Postgres`: Para fins extra-oficiais/log, grava de prontidão as aprovações validando transições históricas (Evita duplo uso da mesma Transaction ID em tickets futuros).

---

## 💻 5. Camada de Apresentação e UX (Frontend React)

### 5.1. Componente: `CheckoutSuccess.tsx`
Redesenhado de forma extrema para atuar de modo "Listening-only".
- **Monitoramento Síncrono via Realtime Channels**:
  - Implementado `supabase.channel('*')` com listener rigoroso a `UPDATE` baseando a chave primária `eq("id", paymentId)`.
  - Em casos de instabilidade de WebSocket, o hook `useEffect` faz imediatamente uma chamada de conferência via `select()` preenchendo a flag de estado preventivamente.
  - **Memory Leaks Guards**: Construído bloco `let isMounted = true` para barrar despachos lógicos e atualizações de Hooks após possível roteamento de abas.
- **Arquitetura de Transição de Animações**:
  - Integração plena com a library **Framer Motion**. Transição visual partindo de instâncias pendentes (`ShieldCheck` dourado rodando para representar auditoria) em sobreposição modular de Checkmarks verdes ao mudar o enum do banco de dados em *runtime*.

---

## 🔧 6. Tratamento de Conflitos e Correção (Troubleshooting SMTP e Local CLI)

Durante o processo final, nos deparamos com falhas complexas de envio de SMTP ("Erro 500").
- **Análise do Problema (Host Hijacking)**:
  - Os disparos da Engine da Aplikei estavam silenciados, rodando apenas virtualmente no CLI (`Listening on http://localhost:9999/`). O nó executivo Deno no Windows (Docker) atraia para o processo `deno.exe` a webhook.
  - Consequência: O e-mail nunca transitava pela nuvem sendo encurralado na caixa sintética *Inbucket (localhost:54324)*.
- **Solução Infraestrutural Limpa**:
  - Extermínio processual total utilizando comandos avançados em background do Powershell: `stop-process -name "deno" -force`.
  - Paralisação manual da containerização (`supabase stop`).
- **Implementação do Custom SMTP Host**:
  - Ajustado diretamente no Painel de Produção a saída nativa pelo portal Google TLS/SSL (Porta 587) com credencial de "App Passwords" associado diretamente em `admin@aplikei.com`.
  - A topografia livre foi reiniciada isolando a Edge Function v6 ("Deploy via MCP Tool"), obrigando que o n8n invocasse trânsito restrito de Cloud. O ambiente atestou subseqüentemente aprovação com entrega bem-sucedida do convite Zelle.

---
**Fim de Relatório - Autorizado para submissão técnica / Documentação base da Arquitetura C2.**
