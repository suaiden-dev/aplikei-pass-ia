import { getServiceBySlug } from "@shared/data/services";
import type { UserService } from "@shared/types/process.model";

// ── In-memory chat store (Hardcoded/Local storage for now) ────────────────────

export interface ChatMessage {
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

const CHAT_STORAGE_KEY = "aplikei.chat.messages";

function readChatMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(CHAT_STORAGE_KEY) ?? "[]") as ChatMessage[];
  } catch {
    return [];
  }
}

function writeChatMessages(messages: ChatMessage[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }
  window.dispatchEvent(new CustomEvent("aplikei:chat:changed"));
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SpecialistChatThread {
  processId: string;
  userId: string;
  serviceSlug: string;
  chatTitle: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
  createdAt: string | null;
  chatClosedAt?: string | null;
  lastMessage?: string | null;
}

export function getAnalysisChatTitle(serviceSlug?: string): string {
  return getServiceBySlug(serviceSlug ?? "")?.title ?? "Especialista Aplikei";
}

export function isAnalysisServiceSlug(serviceSlug?: string): boolean {
  if (!serviceSlug) return false;
  const slug = serviceSlug.toLowerCase();
  return slug.startsWith("analise-") || slug.startsWith("mentoria-") || slug.startsWith("consultoria-");
}

export const chatService = {
  async getMessages(processId: string): Promise<ChatMessage[]> {
    return readChatMessages().filter((message) => message.process_id === processId);
  },

  async sendMessage(params: {
    processId: string;
    content: string;
    senderId: string;
    senderRole: "admin" | "customer";
    file?: File;
  }): Promise<void> {
    const fileUrl = params.file ? URL.createObjectURL(params.file) : undefined;
    const nextMessage: ChatMessage = {
      id: crypto.randomUUID(),
      process_id: params.processId,
      sender_id: params.senderId,
      sender_role: params.senderRole,
      content: params.content,
      file_url: fileUrl,
      file_name: params.file?.name,
      file_type: params.file?.type,
      created_at: new Date().toISOString(),
    };

    writeChatMessages([...readChatMessages(), nextMessage]);
    window.dispatchEvent(new CustomEvent("aplikei:chat:changed", { detail: { message: nextMessage } }));
  },

  subscribeToMessages(processId: string, callback: (payload: { new: ChatMessage }) => void) {
    function handler(event: Event) {
      const detail = (event as CustomEvent<{ message?: ChatMessage }>).detail;
      if (detail?.message?.process_id === processId) {
        callback({ new: detail.message });
      }
    }
    window.addEventListener("aplikei:chat:changed", handler);
    return { unsubscribe: () => window.removeEventListener("aplikei:chat:changed", handler) };
  },

  async getChatClosedAt(processId: string) {
    return null as string | null;
  },

  async getCustomerSpecialistThread(userId: string): Promise<SpecialistChatThread | null> {
    return null;
  },

  async listCustomerThreads(userId: string): Promise<SpecialistChatThread[]> {
    return [];
  },
};
