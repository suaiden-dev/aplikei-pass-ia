# Guia de Ajuste: Isolamento de Webhooks Stripe (Matricula USA)

Este documento detalha os ajustes necessários no projeto **Matricula USA** para evitar conflitos de processamento com o projeto **Aplikei**, uma vez que ambos compartilham a mesma conta do Stripe.

## 1. Contexto do Problema
O Stripe envia eventos de Webhook para todos os endpoints cadastrados na conta. Atualmente, quando uma compra ocorre no Aplikei, o Webhook do Matricula USA também recebe o evento. Sem uma trava, o Matricula USA tenta processar dados que não lhe pertencem, o que pode causar erros de banco de dados ou execução de funções inexistentes.

## 2. Solução Técnica
Implementamos um sistema de "carimbo" via metadados. Cada projeto deve se identificar na criação do checkout e validar essa identidade no recebimento do webhook.

---

## 3. Ações Necessárias no Matricula USA

### A. No arquivo de Criação de Checkout
Localize a função responsável por criar a `Stripe Checkout Session` (geralmente em `supabase/functions/stripe-checkout/index.ts`).

Adicione a chave `project: 'matricula_usa'` dentro do objeto `metadata`:

```typescript
// Local onde a sessão é criada
const session = await stripe.checkout.sessions.create({
    payment_method_types: [...],
    line_items: [...],
    mode: "payment",
    // ...
    metadata: {
        // ... seus metadados existentes ...
        project: "matricula_usa" // <--- ADICIONE ESTA LINHA
    },
});
```

### B. No arquivo de Webhook
Localize a função que recebe as notificações do Stripe (geralmente em `supabase/functions/stripe-webhook/index.ts`).

Adicione a validação logo no início do processamento do evento, após extrair os metadados da sessão:

```typescript
// Dentro do processamento do evento do webhook
const session = event.data.object as Stripe.Checkout.Session;
const metadata = session.metadata;

if (!metadata) throw new Error("No metadata in session");

// --- TRAVA DE SEGURANÇA ---
// Verifica se o evento pertence a este projeto. 
// Se for do 'aplikei' ou estiver vazio, o evento é ignorado com sucesso.
if (metadata.project !== 'matricula_usa') {
    console.log(`[IGNORADO] Evento de outro projeto (Projeto: ${metadata.project || 'N/A'})`);
    return new Response(JSON.stringify({ received: true, ignored: true }), { status: 200 });
}
// --------------------------

// Seguir com a lógica normal de processamento do banco de dados...
```

## 4. Deploy
Após realizar as alterações no código, não esqueça de realizar o deploy das funções para que as mudanças entrem em vigor no Supabase:

```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
```

---
**Nota:** O projeto Aplikei já foi atualizado com essa lógica (carimbando como `project: 'aplikei'`). Assim que o Matricula USA aplicar estas mudanças, ambos estarão 100% isolados.
