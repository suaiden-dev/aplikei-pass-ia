import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiUserLine,
  RiSearchLine,
  RiChat3Line,
  RiCheckDoubleLine,
  RiCircleFill,
  RiCloseLine,
  RiSettings3Line,
  RiLockLine,
  RiLockUnlockLine,
} from "react-icons/ri";
import { toast } from "sonner";
import { useT } from "../../../i18n";
import { useAuth } from "../../../hooks/useAuth";
import { cn } from "../../../utils/cn";
import { SupportChat } from "../../../components/SupportChat";
import { chatService } from "../../../services/chat-specialist.service";

interface AnalysisChatItem {
  id: string;
  userId: string;
  processId: string;
  serviceSlug: string;
  chatTitle: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  unreadCount: number;
}

export default function ChatsPage() {
  const t = useT("admin");
  const { user } = useAuth();
  const [chats, setChats] = useState<AnalysisChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState<AnalysisChatItem | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const threads = await chatService.listAdminSpecialistThreads();
      const unreadByProcess = await chatService.getUnreadCountsByProcess(
        threads.map((thread) => thread.processId),
      );

      setChats(
        threads.map((row) => ({
          id: row.processId,
          userId: row.userId,
          processId: row.processId,
          serviceSlug: row.serviceSlug,
          chatTitle: row.chatTitle,
          fullName: row.fullName || "Sem Nome",
          email: row.email || "",
          avatarUrl: row.avatarUrl || null,
          createdAt: row.createdAt,
          unreadCount: unreadByProcess[row.processId] || 0,
        })),
      );
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

  useEffect(() => {
    const channel = chatService.subscribeToAllMessages((payload) => {
      const msg = payload?.new;
      if (!msg?.process_id) return;

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.processId !== msg.process_id) return chat;

          if (msg.sender_role === "admin") {
            return { ...chat, unreadCount: 0 };
          }

          if (selectedChat?.processId === chat.processId) {
            return { ...chat, unreadCount: 0 };
          }

          return { ...chat, unreadCount: (chat.unreadCount || 0) + 1 };
        }),
      );
    });

    return () => {
      channel.unsubscribe();
    };
  }, [selectedChat?.processId]);

  const filteredChats = useMemo(() => {
    if (!searchTerm) return chats;
    const s = searchTerm.toLowerCase();
    return chats.filter(
      (c) =>
        c.fullName.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.chatTitle.toLowerCase().includes(s)
    );
  }, [chats, searchTerm]);

  const unreadTotal = useMemo(
    () => chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0),
    [chats],
  );

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
        <div className="text-left">
          <h1 className="font-display font-black text-2xl text-slate-800 tracking-tight flex items-center gap-3">
            <RiChat3Line className="text-primary" />
            {t.chats.title}
            {unreadTotal > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-2 rounded-full bg-red-500 text-white text-[11px] font-black">
                {unreadTotal}
              </span>
            )}
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
                    onClick={() => {
                      setSelectedChat(chat);
                      setChats((prev) =>
                        prev.map((item) =>
                          item.processId === chat.processId
                            ? { ...item, unreadCount: 0 }
                            : item,
                        ),
                      );
                    }}
                    className={cn(
                      "w-full p-4 flex gap-3 text-left transition-all hover:bg-slate-50/80",
                      selectedChat?.id === chat.id ? "bg-primary/5 ring-1 ring-inset ring-primary/10" : ""
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shadow-inner flex items-center justify-center">
                        {chat.avatarUrl ? (
                          <img src={chat.avatarUrl} alt={chat.fullName} className="w-full h-full object-cover" />
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
                          {chat.fullName}
                        </h4>
                        <div className="flex items-center gap-2">
                          {chat.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-black">
                              {chat.unreadCount}
                            </span>
                          )}
                          <span className="text-[9px] font-bold text-slate-400">
                            {new Date(chat.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium truncate italic">
                        {chat.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <RiCheckDoubleLine className="text-xs text-blue-400" />
                        <p className="text-[10px] text-slate-500 truncate font-medium">{chat.chatTitle}</p>
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
            <ChatInterface adminId={user?.id || ""} chat={selectedChat} onClose={() => setSelectedChat(null)} />
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
            <ChatInterface adminId={user?.id || ""} chat={selectedChat} onClose={() => setSelectedChat(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChatInterface({ adminId, chat, onClose }: { adminId: string; chat: AnalysisChatItem; onClose: () => void }) {
  const [showSettings, setShowSettings] = useState(false);
  const [isClosed, setIsClosed] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    chatService.getChatClosedAt(chat.processId)
      .then((val) => setIsClosed(val !== null))
      .catch(() => setIsClosed(false));
  }, [chat.processId]);

  const handleToggleClose = async () => {
    setIsUpdating(true);
    try {
      if (isClosed) {
        await chatService.reopenChat(chat.processId);
        setIsClosed(false);
        toast.success("Chat reaberto.");
      } else {
        await chatService.closeChat(chat.processId);
        setIsClosed(true);
        toast.success("Chat encerrado.");
      }
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    } finally {
      setIsUpdating(false);
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
            {chat.avatarUrl ? (
              <img src={chat.avatarUrl} alt={chat.fullName} className="w-full h-full object-cover" />
            ) : (
              <RiUserLine className="text-lg text-slate-400" />
            )}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1">
              {chat.fullName}
            </h3>
            <div className="flex items-center gap-1.5">
              <RiCircleFill className={cn("text-[8px]", isClosed ? "text-slate-400" : "text-emerald-500")} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {chat.chatTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Settings button */}
        <div className="relative">
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <RiSettings3Line size={18} />
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-11 z-50 w-52 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden"
              >
                <div className="p-2">
                  <p className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Configurações do Chat
                  </p>
                  <button
                    onClick={handleToggleClose}
                    disabled={isUpdating || isClosed === null}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                      isClosed
                        ? "text-emerald-700 hover:bg-emerald-50"
                        : "text-red-600 hover:bg-red-50"
                    )}
                  >
                    {isClosed ? (
                      <>
                        <RiLockUnlockLine size={16} />
                        Reabrir conversa
                      </>
                    ) : (
                      <>
                        <RiLockLine size={16} />
                        Encerrar conversa
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isClosed !== null && (
        <SupportChat
          processId={chat.processId}
          userId={adminId}
          role="admin"
          userName={chat.fullName}
          title={chat.chatTitle}
          isClosed={isClosed}
        />
      )}
    </div>
  );
}
