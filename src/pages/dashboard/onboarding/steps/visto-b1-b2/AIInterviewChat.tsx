import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  Bot,
  Send,
  User,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

interface AIInterviewChatProps {
  onBack: () => void;
}

export function AIInterviewChat({ onBack }: AIInterviewChatProps) {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        lang === "pt"
          ? "Olá! Sou seu instrutor de IA. Vamos treinar para sua entrevista no consulado? Posso fazer perguntas reais e avaliar suas respostas. Por onde quer começar?"
          : "Hello! I'm your AI instructor. Shall we practice for your consulate interview? I can ask real questions and evaluate your answers. Where would you like to start?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulated AI Response (Future automation endpoint)
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          lang === "pt"
            ? "Essa é uma ótima resposta! Em breve estarei integrado com um motor de inteligência artificial avançado para te dar feedbacks detalhados sobre cada frase. Por enquanto, continue praticando sua confiança!"
            : "That's a great answer! Soon I'll be integrated with an advanced AI engine to give you detailed feedback on every sentence. For now, keep practicing your confidence!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[600px] max-w-3xl mx-auto bg-card border border-border rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <header className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="group hover:bg-white dark:hover:bg-slate-800 rounded-2xl px-4 gap-2"
        >
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">
            {lang === "pt" ? "Sair do Treino" : "Leave Training"}
          </span>
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
            <Bot className="h-6 w-6" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-black uppercase tracking-widest text-accent">
              Simulado IA
            </p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">
              Online & Pronto
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onClick={() => setMessages([messages[0]])}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </header>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-90"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-full items-start gap-3 animate-in fade-in duration-300",
              msg.role === "user" ? "flex-row-reverse" : "flex-row",
            )}
          >
            <div
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                msg.role === "assistant"
                  ? "bg-accent text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
              )}
            >
              {msg.role === "assistant" ? (
                <Sparkles className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed",
                msg.role === "assistant"
                  ? "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm rounded-tl-none text-foreground"
                  : "bg-accent text-white shadow-lg shadow-accent/10 rounded-tr-none",
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-lg bg-accent text-white flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="p-4 bg-muted/40 rounded-3xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <footer className="p-6 bg-white dark:bg-slate-900 border-t border-border">
        <div className="relative flex items-center gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              lang === "pt"
                ? "Digite sua resposta aqui..."
                : "Type your answer here..."
            }
            className="h-14 pl-6 pr-14 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus-visible:ring-accent font-medium shadow-inner"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 h-11 w-11 rounded-xl bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20 transition-all active:scale-95"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-4 font-bold uppercase tracking-widest opacity-50">
          Powered by Aplikei Intelligence
        </p>
      </footer>
    </div>
  );
}
