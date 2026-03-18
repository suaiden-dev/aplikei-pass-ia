import { useState, useRef, useEffect } from "react";
import { Button } from "@/presentation/components/atoms/button";
import { Input } from "@/presentation/components/atoms/input";
import { Skeleton } from "@/presentation/components/atoms/skeleton";
import { Send, Bot, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

import { useAuth } from "@/contexts/AuthContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const { lang, t } = useLanguage();
  const { session, loading: authLoading } = useAuth();
  const user = session?.user;
  const c = t.chat;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    const loadChat = async () => {
      const { data: history } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (history && history.length > 0) {
        setMessages(history as Message[]);
      } else {
        setMessages([{ role: "assistant", content: c.initialMessage[lang] }]);
      }
      setLoading(false);
    };
    loadChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, user?.id, authLoading, session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset initial message when language changes
  useEffect(() => {
    setMessages([{ role: "assistant", content: c.initialMessage[lang] }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || !user) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      // Salvar mensagem do usuário no DB
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "user",
        content: userMessage.content,
      });

      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages: newMessages },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content:
          data.choices?.[0]?.message?.content ||
          data.message ||
          c.aiProblem[lang],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "assistant",
        content: assistantMessage.content,
      });
    } catch (error: unknown) {
      console.error("Chat error:", error);
      toast.error(c.aiError[lang]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col md:h-[calc(100vh-4rem)]">
      <div className="mb-4">
        <h1 className="font-display text-title font-bold text-foreground">
          {c.title[lang]}
        </h1>
        <p className="text-sm text-muted-foreground">{c.subtitle[lang]}</p>
      </div>
      <div className="flex-1 overflow-y-auto rounded-md border border-border bg-card p-4 shadow-card">
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}
                >
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton
                    className={`h-12 w-[70%] rounded-md ${i % 2 === 0 ? "bg-accent/20" : "bg-muted"}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "assistant" ? "bg-accent/10 text-accent" : "bg-primary text-primary-foreground"}`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-md px-4 py-3 text-sm md:max-w-[80%] ${msg.role === "assistant" ? "bg-muted text-foreground" : "bg-accent text-accent-foreground"}`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </>
          )}
          {isTyping && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Bot className="h-4 w-4" />
              </div>
              <div className="max-w-[80%] rounded-md bg-muted px-4 py-3 text-sm text-foreground">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/40 [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/40 [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/40"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="mt-4 flex gap-2 pb-2 md:pb-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={c.placeholder[lang]}
          className="flex-1 text-base md:text-sm" // Prevent zoom on iOS
          disabled={loading || isTyping}
        />
        <Button
          onClick={handleSend}
          className="bg-accent text-accent-foreground hover:bg-green-dark"
          size="icon"
          disabled={loading || isTyping}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
