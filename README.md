# Aplikei Pass IA 🚀

Sistema inteligente de gestão de vistos e transição de status migratório (COS/EOS), com automação de formulários (I-539) e integração de pagamentos multicanal.

## 🛠️ Tecnologias
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend/DB**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Pagamentos**: Stripe (Cartão/PIX), Zelle (EUA), Parcelow (Brasil)
- **Automação**: Deno Edge Functions, Puppeteer (IA PDF Fill), n8n (Verificação Zelle)

## 📁 Estrutura do Projeto
```bash
├── src
│   ├── components      # Componentes UI reutilizáveis
│   ├── contexts        # Estados globais (Auth, Processos)
│   ├── data            # Catálogo de serviços e preços
│   ├── layouts         # Templates de página (Admin, Customer)
│   ├── pages           # Páginas da aplicação
│   ├── services        # Integração com APIs e Supabase
│   └── i18n            # Sistema de multi-idioma
├── supabase
│   ├── functions       # Deno Edge Functions (Webhooks, Verify)
│   └── migrations      # Esquemas e Triggers do Banco
└── scripts             # Scripts de utilidade e manutenção
```

## ⚙️ Configuração Local

1. **Clone o repositório**:
   ```bash
   git clone <repo-url>
   npm install
   ```

2. **Variáveis de Ambiente**:
   Copie o `.env.example` para `.env` e preencha as credenciais do Supabase e Provedores de Pagamento.

3. **Inicie o servidor**:
   ```bash
   npm run dev
   ```

## 🚀 Fluxos de Pagamento e Ativação

O sistema utiliza uma arquitetura de **Redundância e Segurança Total**:
- **Stripe/Parcelow**: Processado via Webhook + Verificação Instantânea Server-side (`verify-stripe-session`).
- **Zelle**: Verificação híbrida via Bot de IA (n8n) e aprovação manual administrativa.
- **Sincronização de Slots**: O sistema gerencia automaticamente o incremento de dependentes pagos e vincula compras auxiliares ao processo principal do usuário.

## ⚖️ Segurança e Auditoria
- **RLS (Row Level Security)**: Garante que clientes acessem apenas seus próprios dados.
- **Audit Log**: Todas as transações financeiras são registradas com IDs de sessão originais dos provedores.
- **Server Verification**: Ativações instantâneas são validadas diretamente nas APIs de pagamento antes de serem persistidas.

---
© 2026 Aplikei. Todos os direitos reservados.
