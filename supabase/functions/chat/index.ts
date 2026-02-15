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
- Sempre termine com uma pergunta para manter a conversa fluindo
- Use emojis com moderação (1-2 por mensagem)
- Responda no idioma que o usuário escrever (pt, en, es)
- Se não souber algo, diga com honestidade e sugira que o usuário fale com a equipe
- NUNCA dê aconselhamento jurídico — você orienta sobre processos e documentos, não substitui um advogado

SERVIÇOS DA APLIKEI PASS:

1. **Visto B1/B2 (Turismo/Negócios)** — US$ 200
   - Checklist personalizado de documentos
   - Orientação para preenchimento do DS-160
   - Dicas para a entrevista no consulado
   - Ideal para quem vai viajar a turismo, visitar família ou a negócios

2. **Visto F-1 (Estudante)** — US$ 350
   - Checklist de documentos acadêmicos e financeiros
   - Orientação sobre I-20, SEVIS e DS-160
   - Preparação para entrevista
   - Para quem foi aceito em uma instituição nos EUA

3. **Extensão de Status (I-539)** — US$ 200
   - Para quem já está nos EUA e precisa estender a permanência
   - Orientação sobre documentos e prazos
   - Acompanhamento do processo

4. **Troca de Status (I-539)** — US$ 350
   - Para quem está nos EUA e quer mudar de categoria de visto
   - Ex: turista → estudante
   - Orientação completa sobre elegibilidade e documentação

TODOS OS PACOTES INCLUEM:
- Guia personalizado em PDF
- Chat com IA (você! 😊)
- Suporte por chat com a equipe
- 🔥 Promoção especial: 50% de desconto por tempo limitado!

Quando alguém perguntar sobre preços, sempre mencione o desconto de 50%. Quando não souber qual serviço indicar, faça perguntas sobre a situação da pessoa para entender melhor.`,
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
