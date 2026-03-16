# Documentação Técnica: Isolamento de Webhooks Stripe (Aplikei)

Este documento descreve as modificações feitas no projeto **Aplikei** para implementar o isolamento de eventos do Stripe.

Como o Aplikei e o Matricula USA dividem a mesma conta do Stripe, ambos os servidores recebem notificações (como o evento `checkout.session.completed`) geradas por qualquer das duas plataformas. 

Para evitar que o sistema do Aplikei tente processar indevidamente uma compra gerada pelo Matricula USA (o que poderia poluir o banco de dados e gerar erros críticos na plataforma), adotamos uma estratégia de "tagging/carimbo" de origem.

## 1. O que foi feito no código do Aplikei

### A. Adição do "Carimbo" no Checkout
No momento de criar a transação de pagamento para um cliente do Aplikei, os parâmetros (`metadata`) do Stripe agora incluem explicitamente o nome do projeto (`project: "aplikei"`).

**Arquivo Alterado:** `supabase/functions/stripe-checkout/index.ts`

```typescript
// Criação da sessão de checkout no Stripe
const session = await stripe.checkout.sessions.create({
    payment_method_types,
    line_items: [...],
    mode: "payment",
    // ...
    metadata: {
        slug,
        email,
        fullName,
        phone,
        // ... demais metadados do Aplikei ...
        origin_url: origin_url || "http://localhost:5173",
        project: "aplikei" // <--- Identificador exclusivo do projeto Aplikei
    },
});
```

### B. Trava de Segurança no Processamento do Webhook
O endpoint que escuta as respostas do Stripe (Webhook) foi modificado. Ao receber um evento, ele confere os metadados. Se o evento disser respeito a um pagamento com `project` diferente de `aplikei` (ex: compras vindas das lojas do Matricula USA), o webhook corta a execução imediatamente de forma sadia e ignorando o evento daquele outro projeto.

**Arquivo Alterado:** `supabase/functions/stripe-webhook/index.ts`

```typescript
// Extração da sessão e dados processados pelo webhook
const session = event.data.object as Stripe.Checkout.Session;
const metadata = session.metadata;

if (!metadata) throw new Error("No metadata in session");

// --- TRAVA DE SEGURANÇA (ISOLAMENTO APLIKEI) ---
// Ignorar qualquer notificação de projeto que não pertença a este servidor local
if (metadata.project !== 'aplikei') {
    console.log(`[IGNORADO] Evento Stripe de outro projeto (Projeto: ${metadata.project || 'N/A'}) - Sessão: ${session.id}`);
    
    // Responde com sucesso (200) para o Stripe não tentar reenviar
    return new Response(JSON.stringify({ received: true, ignored: true }), { status: 200 });
}
// -----------------------------------------------

// Daqui em diante, o serviço continua com os pedidos validos no Aplikei...
const supabaseAdmin = createClient(...)
```

> **Nota Adicional**: Durante a validação, trechos obsoletos de código que invocavam geração de PDFs de contrato (originários da estrutura do Matricula USA e que não pertencem ao contexto principal do Aplikei) também foram isolados/removidos para evitar estourar o erro de sistema `Deno.core.runMicrotasks() is not supported`. 

## 2. Deploys Realizados e Finalização
Com essas alterações prontas, o novo motor do webhook subiu em produção via os comandos padrão do Deno/Supabase:

```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
```

✅ **Resultado**: Agora o sistema de pagamentos do Aplikei é inteiramente autossuficiente e imune a dados externos vindos de outros projetos configurados na sua conta conjunta do Stripe.
