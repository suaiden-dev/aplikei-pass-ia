import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiUserLine,
  RiSearchLine,
  RiLoader4Line,
  RiChat3Line,
  RiTimeLine,
  RiCheckDoubleLine,
  RiCircleFill,
  RiCloseLine,
  RiSendPlane2Line,
  RiSettings3Line,
  RiFlagLine,
} from "react-icons/ri";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";
import type { UserAccount } from "../../../services/auth.service";
import { useT, useLocale } from "../../../i18n";
import { cn } from "../../../utils/cn";

export default function ChatsPage() {
  const t = useT("admin");
  const { lang: language } = useLocale();
  const [customers, setCustomers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState<UserAccount | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_accounts")
        .select("*")
        .eq("role", "customer")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err: unknown) {
      console.error("Error loading chats:", err);
      toast.error("Erro ao carregar conversas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredChats = useMemo(() => {
    if (!searchTerm) return customers;
    const s = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s)
    );
  }, [customers, searchTerm]);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
        <div className="text-left">
          <h1 className="font-display font-black text-2xl text-slate-800 tracking-tight flex items-center gap-3">
            <RiChat3Line className="text-primary" />
            {t.chats.title}
          </h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest leading-none">
            {t.chats.subtitle}
          </p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat List */}
        <div className="w-full md:w-96 border-r border-slate-100 flex flex-col overflow-hidden">
          <div className="p-4 bg-white sticky top-0 z-10 shrink-0">
            <div className="relative group">
              <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder={t.chats.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col gap-4 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                      <div className="h-2 bg-slate-50 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-12 text-center">
                <RiChat3Line className="text-4xl text-slate-100 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400">{t.chats.emptyState}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={cn(
                      "w-full p-4 flex gap-3 text-left transition-all hover:bg-slate-50/80",
                      selectedChat?.id === chat.id ? "bg-primary/5 ring-1 ring-inset ring-primary/10" : ""
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shadow-inner flex items-center justify-center">
                        {chat.avatar_url ? (
                          <img src={chat.avatar_url} alt={chat.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <RiUserLine className="text-xl text-slate-400" />
                        )}
                      </div>
                      <RiCircleFill className="absolute -bottom-1 -right-1 text-emerald-500 border-4 border-white text-xs" />
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className={cn(
                          "text-xs font-black uppercase tracking-tight truncate",
                          selectedChat?.id === chat.id ? "text-primary" : "text-slate-700"
                        )}>
                          {chat.full_name || "Sem Nome"}
                        </h4>
                        <span className="text-[9px] font-bold text-slate-400">12:45</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium truncate italic">
                        {chat.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <RiCheckDoubleLine className="text-xs text-blue-400" />
                        <p className="text-[10px] text-slate-500 truncate font-medium">Aguardando resposta da análise...</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Content / Welcome */}
        <div className="hidden md:flex flex-1 bg-slate-50/30 flex-col overflow-hidden relative">
          {selectedChat ? (
            <ChatInterface chat={selectedChat} onClose={() => setSelectedChat(null)} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 rounded-[32px] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center mb-8">
                <RiChat3Line className="text-5xl text-slate-200" />
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2">{t.chats.selectChat}</h2>
              <p className="text-sm text-slate-400 max-w-xs font-medium">
                {t.chats.selectChatSubtitle}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Modal */}
      <AnimatePresence>
        {selectedChat && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="md:hidden fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <ChatInterface chat={selectedChat} onClose={() => setSelectedChat(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChatInterface({ chat, onClose }: { chat: UserAccount; onClose: () => void }) {
  const t = useT("admin");
  const [message, setMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const handleFinalize = () => {
    if (window.confirm(t.chats.finalizeConfirm)) {
      toast.success(t.chats.processFinalized);
      setShowSettings(false);
    }
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white md:bg-transparent">
      {/* Header */}
      <div className="p-4 md:p-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600">
            <RiCloseLine size={24} />
          </button>
          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shadow-inner flex items-center justify-center shrink-0">
            {chat.avatar_url ? (
              <img src={chat.avatar_url} alt={chat.full_name} className="w-full h-full object-cover" />
            ) : (
              <RiUserLine className="text-lg text-slate-400" />
            )}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1">
              {chat.full_name || "Sem Nome"}
            </h3>
            <div className="flex items-center gap-1.5">
              <RiCircleFill className="text-[8px] text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.chats.online}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-2 rounded-xl transition-all",
              showSettings ? "bg-slate-100 text-primary" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            )}
          >
            <RiSettings3Line size={24} />
          </button>

          <AnimatePresence>
            {showSettings && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowSettings(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20"
                >
                  <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                    {t.chats.settings}
                  </p>
                  <button 
                    onClick={handleFinalize}
                    className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <RiFlagLine className="text-lg" />
                    {t.chats.finalizeProcess}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
        <div className="flex justify-center">
          <span className="px-3 py-1 rounded-full bg-white border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
            {t.chats.today}
          </span>
        </div>

        <Message 
          content="Olá, gostaria de saber como está o andamento do meu processo de visto F1. Já enviei todos os documentos." 
          time="12:40" 
          isMine={false} 
        />
        
        <Message 
          content="Olá! Recebemos seus documentos sim. Nossa equipe técnica está analisando o I-20 e o SEVIS agora mesmo. Te avisaremos assim que concluirmos essa etapa." 
          time="12:42" 
          isMine={true} 
        />

        <Message 
          content="Perfeito, muito obrigado pelo retorno rápido!" 
          time="12:45" 
          isMine={false} 
        />
      </div>

      {/* Input */}
      <div className="p-4 md:p-6 bg-white border-t border-slate-100 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); setMessage(""); }}
          className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-2 pl-4 focus-within:ring-4 focus-within:ring-primary/5 transition-all"
        >
          <input 
            type="text" 
            placeholder={t.chats.typeMessage}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={!message.trim()}
            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-all disabled:opacity-50 disabled:grayscale"
          >
            <RiSendPlane2Line className="text-xl" />
          </button>
        </form>
      </div>
    </div>
  );
}

function Message({ content, time, isMine }: { content: string; time: string; isMine: boolean }) {
  return (
    <div className={cn(
      "flex flex-col max-w-[80%]",
      isMine ? "ml-auto items-end" : "mr-auto items-start"
    )}>
      <div className={cn(
        "p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
        isMine 
          ? "bg-primary text-white rounded-tr-none" 
          : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
      )}>
        {content}
      </div>
      <div className={cn(
        "flex items-center gap-1.5 mt-2 px-1",
        isMine ? "flex-row-reverse" : "flex-row"
      )}>
        <span className="text-[10px] font-bold text-slate-300">{time}</span>
        {isMine && <RiCheckDoubleLine className="text-xs text-blue-400" />}
      </div>
    </div>
  );
}
