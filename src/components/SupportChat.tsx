import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSendPlane2Line,
  RiAttachmentLine,
  RiImageLine,
  RiFilePdfLine,
  RiCheckDoubleLine,
  RiLoader4Line,
  RiCloseLine,
  RiFileTextLine,
  RiExternalLinkLine
} from "react-icons/ri";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { cn } from "../utils/cn";
import { useT } from "../i18n";

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
}

export function SupportChat({ processId, userId, role, userName }: SupportChatProps) {
  const t = useT("admin"); // Using admin translations for shared terms
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load messages
  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("process_id", processId)
        .order("created_at", { ascending: true });

      if (error) {
        // If table doesn't exist, we'll just use an empty array or mock data
        if (error.code === "PGRST116" || error.message.includes("does not exist")) {
          console.warn("Table chat_messages does not exist. Using mock data.");
          setMessages([
            {
              id: "1",
              process_id: processId,
              sender_id: "system",
              sender_role: "admin",
              content: "Olá! Chat iniciado. Como podemos ajudar com seu processo?",
              created_at: new Date(Date.now() - 3600000).toISOString()
            }
          ]);
        } else {
          throw error;
        }
      } else {
        setMessages(data || []);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${processId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `process_id=eq.${processId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [processId]);

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
      const { error } = await supabase.from("chat_messages").insert({
        process_id: processId,
        sender_id: userId,
        sender_role: role,
        content: content,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
    } catch (err: any) {
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
      const fileExt = file.name.split(".").pop();
      const fileName = `${processId}/${crypto.randomUUID()}.${fileExt}`;
      const filePath = `chat/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("profiles")
        .getPublicUrl(filePath);

      const { error: msgError } = await supabase.from("chat_messages").insert({
        process_id: processId,
        sender_id: userId,
        sender_role: role,
        content: `Arquivo enviado: ${file.name}`,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
        created_at: new Date().toISOString()
      });

      if (msgError) {
         // Fallback UI
         setMessages(prev => [...prev, {
            id: Math.random().toString(),
            process_id: processId,
            sender_id: userId,
            sender_role: role,
            content: `Arquivo enviado: ${file.name}`,
            file_url: publicUrl,
            file_name: file.name,
            file_type: file.type,
            created_at: new Date().toISOString()
         }]);
      }

      toast.success("Arquivo enviado com sucesso!");
    } catch (err: any) {
      console.error("Error uploading file:", err);
      toast.error("Erro ao enviar arquivo.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <RiChat3Line />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Chat Suporte</h4>
            <p className="text-[11px] font-bold text-slate-400 leading-none truncate max-w-[150px]">
              {userName || (role === "admin" ? "Cliente" : "Consultor Aplikei")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Ativo</span>
        </div>
      </div>

      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/20"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <RiLoader4Line className="text-2xl text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <RiChat3Line className="text-4xl text-slate-100 mb-2" />
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Sem mensagens ainda</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem key={msg.id} msg={msg} isMine={msg.sender_role === role} />
          ))
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-slate-50 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            {isUploading ? <RiLoader4Line className="animate-spin" /> : <RiAttachmentLine size={20} />}
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="w-full h-11 pl-4 pr-4 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all"
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
          : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
      )}>
        {msg.file_url ? (
          <div className="space-y-2">
            {isImage ? (
              <a href={msg.file_url} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-black/5">
                <img src={msg.file_url} alt="Uploaded" className="max-w-full h-auto max-h-48 object-cover" />
              </a>
            ) : (
              <div className="flex items-center gap-3 p-2 bg-slate-50/50 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
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
            <p className={cn("text-[11px]", isMine ? "text-white/80" : "text-slate-400 italic")}>{msg.content}</p>
          </div>
        ) : (
          msg.content
        )}
      </div>
      <div className={cn(
        "flex items-center gap-1.5 mt-1.5 px-1",
        isMine ? "flex-row-reverse" : "flex-row"
      )}>
        <span className="text-[9px] font-bold text-slate-300">
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {isMine && <RiCheckDoubleLine className="text-xs text-blue-400" />}
      </div>
    </div>
  );
}
