import { getServiceBySlug } from "../data/services";
import {
  emitPortalEvent,
  onPortalEvent,
  readChatMessages,
  readMockUsers,
  readUserServices,
  writeChatMessages,
  type PortalChatMessage,
} from "../mocks/customer-portal";
import type { UserService } from "../models/process.model";

export interface ChatMessage extends PortalChatMessage {}

export interface SpecialistChatThread {
  processId: string;
  userId: string;
  serviceSlug: string;
  chatTitle: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
  createdAt: string;
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

function buildThreads(processes: UserService[]) {
  const messages = readChatMessages();
  const users = readMockUsers();

  return processes
    .map((process) => {
      const account = users.find((entry) => entry.id === process.user_id);
      const relatedMessages = messages.filter((message) => message.process_id === process.id);
      const last = relatedMessages.at(-1);

      return {
        processId: process.id,
        userId: process.user_id,
        serviceSlug: process.service_slug,
        chatTitle: getAnalysisChatTitle(process.service_slug),
        fullName: account?.name,
        email: account?.email ?? "",
        avatarUrl: account?.profileUrl ?? null,
        createdAt: process.created_at,
        chatClosedAt: typeof process.step_data.chat_closed_at === "string" ? process.step_data.chat_closed_at : null,
        lastMessage: last?.content ?? null,
      } satisfies SpecialistChatThread;
    })
    .filter((thread) => Boolean(thread.lastMessage) || thread.serviceSlug === "troca-status" || thread.serviceSlug === "extensao-status");
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
    emitPortalEvent("aplikei:chat:changed", { message: nextMessage });
  },

  subscribeToMessages(processId: string, callback: (payload: { new: ChatMessage }) => void) {
    return {
      unsubscribe: onPortalEvent("aplikei:chat:changed", (event) => {
        const detail = (event as CustomEvent<{ message?: ChatMessage }>).detail;
        if (detail?.message?.process_id === processId) {
          callback({ new: detail.message });
        }
      }),
    };
  },

  async getChatClosedAt(processId: string) {
    const process = readUserServices().find((entry) => entry.id === processId);
    return typeof process?.step_data.chat_closed_at === "string" ? process.step_data.chat_closed_at : null;
  },

  async getCustomerSpecialistThread(userId: string): Promise<SpecialistChatThread | null> {
    return buildThreads(readUserServices().filter((process) => process.user_id === userId))[0] ?? null;
  },

  async listCustomerThreads(userId: string): Promise<SpecialistChatThread[]> {
    return buildThreads(readUserServices().filter((process) => process.user_id === userId));
  },
};
