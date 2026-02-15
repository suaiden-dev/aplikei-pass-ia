import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "Olá! Sou a IA da Aplikei. Posso te ajudar a organizar seus dados e documentos para o processo. O que gostaria de saber?\n\n**Lembre-se:** Eu não ofereço aconselhamento jurídico, não analiso elegibilidade e não garanto aprovação.",
  },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    // Simulate response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Obrigado pela sua pergunta! Para uma resposta completa, o sistema de IA será conectado na versão final. Por enquanto, este é um preview do chat.",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:h-[calc(100vh-4rem)]">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Chat IA</h1>
        <p className="text-sm text-muted-foreground">
          A IA ajuda a organizar dados e documentos. Não oferece aconselhamento jurídico.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "assistant"
                    ? "bg-accent/10 text-accent"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === "assistant"
                    ? "bg-muted text-foreground"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Digite sua pergunta..."
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          className="bg-accent text-accent-foreground hover:bg-green-dark"
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
