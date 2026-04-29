import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiChat3Line,
  RiSendPlane2Line,
  RiAttachmentLine,
  RiFilePdfLine,
  RiCheckDoubleLine,
  RiLoader4Line,
  RiFileTextLine,
  RiExternalLinkLine
} from "react-icons/ri";
import { supabase } from "../lib/supabase";
import { chatService } from "../services/chat-specialist.service";
import { toast } from "sonner";
import { cn } from "../utils/cn";

interface Message {
  id: string;
  process_id: string;
  sender_id: string;
  sender_role: "admin" | "customer";
  content: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  created_at: string;
}

interface SupportChatProps {
  processId: string;
  userId: string;
  role: "admin" | "customer";
  userName?: string;
  title?: string;
  isClosed?: boolean;
  serviceSlug?: string;
}

export function SupportChat({ processId, userId, role, userName, title, isClosed = false, serviceSlug }: SupportChatProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<ReturnType<typeof chatService.subscribeToMessages> | null>(null);

  // Load messages
  const loadMessages = useCallback(async (): Promise<boolean> => {
    try {
      const data = await chatService.getMessages(processId);
      setMessages(data || []);
      return true;
    } catch (err) {
      console.error("Error loading messages:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [processId]);

  useEffect(() => {
    let active = true;

    const start = async () => {
      const canSubscribe = await loadMessages();
      if (!active || !canSubscribe) return;

      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
      }

      const channel = chatService.subscribeToMessages(processId, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      });

      channelRef.current = channel;
    };

    void start();

    return () => {
      active = false;
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [processId, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !isUploading) return;

    setIsSending(true);
    const content = newMessage;
    setNewMessage("");

    try {
      await chatService.sendMessage({
        processId,
        senderId: userId,
        senderRole: role,
        content,
      });
    } catch (err) {
      console.error("Error sending message:", err);
      // Fallback for UI if table doesn't exist
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        process_id: processId,
        sender_id: userId,
        sender_role: role,
        content: content,
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await chatService.sendMessage({
        processId,
        senderId: userId,
        senderRole: role,
        content: `Arquivo enviado: ${file.name}`,
        file,
      });

      toast.success("Arquivo enviado com sucesso!");
    } catch (err) {
      console.error("Error uploading file:", err);
      toast.error("Erro ao enviar arquivo.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-card rounded-3xl border border-border shadow-sm overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-bg-subtle/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <RiChat3Line />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">
              {title || "Chat Especialista"}
            </h4>
            <p className="text-[11px] font-bold text-text leading-none truncate max-w-[150px]">
              {userName || (role === "admin" ? "Cliente" : "Especialista")}
            </p>
          </div>
        </div>
        {isClosed ? (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-bg-subtle rounded-lg border border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-text-muted" />
            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Chat encerrado</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Chat ativo</span>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-bg/20"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <RiLoader4Line className="text-2xl text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <RiChat3Line className="text-4xl text-bg-subtle mb-2" />
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Sem mensagens ainda</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem key={msg.id} msg={msg} isMine={msg.sender_role === role} />
          ))
        )}
      </div>

      {/* Input area */}
      {isClosed ? (
        <div className="p-4 border-t border-border bg-bg-subtle flex items-center justify-center gap-2">
          <RiChat3Line className="text-text-muted/50 text-lg" />
          <span className="text-xs font-bold text-text-muted text-center">
            {role === "admin"
              ? "Conversa encerrada. Reabra para continuar."
              : (
                <div className="flex flex-col items-center gap-3">
                  <p>Este chat foi encerrado pelo especialista. Registre o resultado da sua Motion no painel.</p>
                  <button
                    onClick={() => navigate(`/dashboard/processes/${serviceSlug}?id=${processId}`)}
                    className="px-6 py-2 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-primary-hover transition-all flex items-center gap-2"
                  >
                    Ver resultado e registrar
                    <RiExternalLinkLine size={14} />
                  </button>
                </div>
              )}
          </span>
        </div>
      ) : (
        <div className="p-4 border-t border-border bg-card">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-10 h-10 rounded-xl bg-bg-subtle text-text-muted flex items-center justify-center hover:bg-bg/50 hover:text-text transition-all"
            >
              {isUploading ? <RiLoader4Line className="animate-spin" /> : <RiAttachmentLine size={20} />}
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="w-full h-11 pl-4 pr-4 bg-bg-subtle border-none rounded-xl text-sm font-medium outline-none text-text focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={(!newMessage.trim() && !isUploading) || isSending}
              className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {isSending ? <RiLoader4Line className="animate-spin" /> : <RiSendPlane2Line size={20} />}
            </button>
          </form>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
        </div>
      )}
    </div>
  );
}

function MessageItem({ msg, isMine }: { msg: Message; isMine: boolean }) {
  const isImage = msg.file_type?.startsWith("image/");
  const isPdf = msg.file_type === "application/pdf" || msg.file_name?.endsWith(".pdf");

  return (
    <div className={cn(
      "flex flex-col max-w-[85%] animate-in slide-in-from-bottom-1 duration-300",
      isMine ? "ml-auto items-end" : "mr-auto items-start"
    )}>
      <div className={cn(
        "p-3 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm",
        isMine 
          ? "bg-primary text-white rounded-tr-none" 
          : "bg-bg-subtle text-text border border-border rounded-tl-none"
      )}>
        {msg.file_url ? (
          <div className="space-y-2">
            {isImage ? (
              <a href={msg.file_url} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-black/5">
                <img src={msg.file_url} alt="Uploaded" className="max-w-full h-auto max-h-48 object-cover" />
              </a>
            ) : (
              <div className="flex items-center gap-3 p-2 bg-black/10 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center">
                  {isPdf ? <RiFilePdfLine className="text-xl" /> : <RiFileTextLine className="text-xl" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold truncate opacity-90">{msg.file_name}</p>
                </div>
                <a href={msg.file_url} target="_blank" rel="noreferrer" className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-all">
                  <RiExternalLinkLine size={14} />
                </a>
              </div>
            )}
            <p className={cn("text-[11px]", isMine ? "text-white/80" : "text-text-muted/70 italic")}>{msg.content}</p>
          </div>
        ) : (
          msg.content
        )}
      </div>
      <div className={cn(
        "flex items-center gap-1.5 mt-1.5 px-1",
        isMine ? "flex-row-reverse" : "flex-row"
      )}>
        <span className="text-[9px] font-bold text-text-muted">
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {isMine && <RiCheckDoubleLine className="text-xs text-blue-400" />}
      </div>
    </div>
  );
}
