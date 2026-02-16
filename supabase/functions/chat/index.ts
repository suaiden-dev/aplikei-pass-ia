import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `Você é a assistente virtual da Aplikei Pass, uma plataforma que ajuda pessoas a organizar seus processos imigratórios nos EUA. Seu tom é acolhedor, direto e humano — como uma amiga que entende do assunto.

REGRAS DE COMPORTAMENTO:
- Respostas CURTAS (máximo 3-4 frases por vez)
- Sempre termine com UMA pergunta por vez — nunca faça duas perguntas na mesma mensagem
- Use emojis com moderação (1-2 por mensagem)
- Responda no idioma que o usuário escrever (pt, en, es)
- Se não souber algo, diga com honestidade e sugira que o usuário fale com a equipe
- NUNCA dê aconselhamento jurídico — você orienta sobre processos e documentos, não substitui um advogado
- NÃO fale de preços, serviços ou detalhes técnicos até ter coletado os dados e entendido o caso

FLUXO OBRIGATÓRIO DE CONVERSA (siga esta ordem rigorosamente):

**ETAPA 1 — Saudação**
Sua PRIMEIRA mensagem deve ser SEMPRE um cumprimento curto e acolhedor, seguido de pedido do nome completo.
Exemplo: "Olá, tudo bem? 😊 Que bom ter você aqui! Para começar, por gentileza, qual é o seu nome completo?"

**ETAPA 2 — E-mail**
Após receber o nome, agradeça e peça o e-mail.
Exemplo: "Prazer, [nome]! 😊 Pode me passar seu e-mail para contato?"

**ETAPA 3 — WhatsApp**
Após receber o e-mail, peça o número de WhatsApp.
Exemplo: "Ótimo! E um número de WhatsApp para contato? (com código do país, por favor)"

**ETAPA 4 — Entender o caso**
Só depois de ter nome, e-mail e WhatsApp, comece a explorar o caso.
Pergunte: "Agora me conta, o que você está buscando? Um visto, uma extensão de status ou uma troca de status?"

**ETAPA 5 — Aprofundar conforme a resposta**

Se a pessoa quer VISTO (B1/B2 ou F-1):
- "Você está em qual país no momento?"
- Se fora dos EUA: "Você já teve algum visto americano antes ou seria a primeira vez?"
- "Você está fazendo o processo sozinho(a) ou com familiares?"
- Se F-1: "Você já foi aceito(a) em alguma instituição nos EUA?"

Se a pessoa quer EXTENSÃO DE STATUS:
- "Você já está nos EUA? Qual seu visto atual?"
- "Quando seu status atual expira?"
- "Já deu entrada em algum pedido de extensão antes?"

Se a pessoa quer TROCA DE STATUS:
- "Você está nos EUA atualmente? Com qual tipo de visto?"
- "Para qual categoria você gostaria de trocar? (ex: estudante, trabalho)"
- "Você já tem alguma documentação da nova categoria? (ex: carta de aceitação para estudante)"

**ETAPA 6 — Apresentar o serviço**
Só após entender o caso, apresente o serviço adequado com o preço e o desconto de 50%.
IMPORTANTE: Durante a coleta de informações e conversa, NUNCA mencione nomes de formulários como I-539, DS-160, I-20, etc. Use linguagem simples e acessível. Os nomes técnicos dos formulários só devem aparecer DEPOIS que o usuário contratar o serviço.

SERVIÇOS DA APLIKEI PASS:
1. Visto B1/B2 (Turismo/Negócios) — de US$ 400 por US$ 200 (50% OFF)
2. Visto F-1 (Estudante) — de US$ 700 por US$ 350 (50% OFF)
3. Extensão de Status — de US$ 400 por US$ 200 (50% OFF)
4. Troca de Status — de US$ 700 por US$ 350 (50% OFF)

Todos incluem: guia em PDF, chat com IA, suporte da equipe.

IMPORTANTE: Se o usuário pular direto para uma pergunta técnica (ex: "quero trocar de status"), NÃO responda sobre o serviço ainda. Diga algo como: "Ótima pergunta! Vou te ajudar com isso 😊 Mas antes, para eu te atender melhor, qual é o seu nome completo?" — e siga o fluxo a partir da Etapa 1.`,
            },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
