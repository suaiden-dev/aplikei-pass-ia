import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks simples para simular localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// Mock do supabase client
const mockSupabase = {
  from: vi.fn(),
};
vi.mock("@shared/lib/supabase", () => ({
  supabase: mockSupabase,
}));

// Função utilitária para simular o cálculo cronológico do unreadByProcess do useAdminChats
function calculateAdminUnread(
  messageRows: Array<{ id: string; conversation_id: string; sender_role: "admin" | "customer"; created_at: string; content: string }>,
  convId: string
) {
  const unread: Record<string, number> = {};
  unread[convId] = 0;

  // Ordena explicitamente por ordem cronológica (antiga -> nova)
  const sortedMessages = [...messageRows].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  sortedMessages.forEach((msg) => {
    if (msg.conversation_id !== convId) return;

    const lastReadMsgId = localStorage.getItem(`chat_last_read:${convId}`);

    if (msg.sender_role === "admin") {
      unread[convId] = 0;
      localStorage.setItem(`chat_last_read:${convId}`, msg.id);
    } else {
      if (lastReadMsgId) {
        const readMsgIndex = sortedMessages.findIndex((m) => m.id === lastReadMsgId);
        const currentMsgIndex = sortedMessages.findIndex((m) => m.id === msg.id);
        if (readMsgIndex !== -1 && currentMsgIndex <= readMsgIndex) {
          unread[convId] = 0;
          return;
        }
      }
      unread[convId] = (unread[convId] || 0) + 1;
    }
  });

  return unread[convId];
}

// Função utilitária para simular o cálculo do unreadCountByConv do useCustomerChats
function calculateCustomerUnread(
  messageRows: Array<{ id: string; conversation_id: string; sender_role: "admin" | "customer"; created_at: string; content: string }>,
  convId: string
) {
  // Ordena explicitamente por ordem cronológica (antiga -> nova)
  const sorted = [...messageRows].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const lastReadMsgId = localStorage.getItem(`chat_last_read:${convId}`);

  let unread = 0;
  sorted.forEach((m) => {
    if (m.conversation_id !== convId) return;

    if (m.sender_role === "customer") {
      unread = 0;
      localStorage.setItem(`chat_last_read:${convId}`, m.id);
    } else {
      if (lastReadMsgId) {
        const readIndex = sorted.findIndex((sm) => sm.id === lastReadMsgId);
        const currentIndex = sorted.findIndex((sm) => sm.id === m.id);
        if (readIndex !== -1 && currentIndex <= readIndex) {
          unread = 0;
          return;
        }
      }
      unread++;
    }
  });

  return unread;
}

describe("Chat Notification Badges Logic", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Admin Unread Badge Count", () => {
    it("should display 0 unread if there are no customer messages", () => {
      const messages: any[] = [];
      const count = calculateAdminUnread(messages, "conv1");
      expect(count).toBe(0);
    });

    it("should count customer messages sent after the last admin message", () => {
      const messages = [
        { id: "1", conversation_id: "conv1", sender_role: "customer", created_at: "2026-05-27T10:00:00Z", content: "Hi" },
        { id: "2", conversation_id: "conv1", sender_role: "admin", created_at: "2026-05-27T10:05:00Z", content: "Hello" },
        { id: "3", conversation_id: "conv1", sender_role: "customer", created_at: "2026-05-27T10:10:00Z", content: "Need help" },
        { id: "4", conversation_id: "conv1", sender_role: "customer", created_at: "2026-05-27T10:15:00Z", content: "Please reply" },
      ] as any[];

      const count = calculateAdminUnread(messages, "conv1");
      expect(count).toBe(2); // As mensagens 1 e 2 foram lidas/respondidas pelo admin. Sobram 3 e 4.
    });

    it("should respect localStorage and not count old messages as unread after a page refresh", () => {
      const messages = [
        { id: "1", conversation_id: "conv1", sender_role: "customer", created_at: "2026-05-27T10:00:00Z", content: "Hi" },
        { id: "2", conversation_id: "conv1", sender_role: "customer", created_at: "2026-05-27T10:05:00Z", content: "Still there?" },
      ] as any[];

      // Simulamos que o admin visualizou a conversa e leu a mensagem ID "2"
      localStorage.setItem("chat_last_read:conv1", "2");

      const count = calculateAdminUnread(messages, "conv1");
      expect(count).toBe(0); // Ambas foram lidas, o contador de não lidas deve ser 0!
    });

    it("should count new incoming messages even if localStorage has a previous read ID", () => {
      const messages = [
        { id: "1", conversation_id: "conv1", sender_role: "customer", created_at: "2026-05-27T10:00:00Z", content: "Hi" },
        { id: "2", conversation_id: "conv1", sender_role: "customer", created_at: "2026-05-27T10:05:00Z", content: "Still there?" },
        { id: "3", conversation_id: "conv1", sender_role: "customer", created_at: "2026-05-27T10:10:00Z", content: "New message here" },
      ] as any[];

      // O admin tinha lido até a "2"
      localStorage.setItem("chat_last_read:conv1", "2");

      const count = calculateAdminUnread(messages, "conv1");
      expect(count).toBe(1); // Apenas a mensagem ID "3" é nova e não lida!
    });
  });

  describe("Customer Unread Badge Count", () => {
    it("should display 0 unread if there are no admin messages", () => {
      const messages: any[] = [];
      const count = calculateCustomerUnread(messages, "conv1");
      expect(count).toBe(0);
    });

    it("should count admin messages sent after the last customer message", () => {
      const messages = [
        { id: "1", conversation_id: "conv1", sender_role: "admin", created_at: "2026-05-27T10:00:00Z", content: "Welcome" },
        { id: "2", conversation_id: "conv1", sender_role: "customer", created_at: "2026-05-27T10:05:00Z", content: "Thanks" },
        { id: "3", conversation_id: "conv1", sender_role: "admin", created_at: "2026-05-27T10:10:00Z", content: "How can I assist you today?" },
      ] as any[];

      const count = calculateCustomerUnread(messages, "conv1");
      expect(count).toBe(1); // Sobrou apenas a mensagem 3 que o cliente não respondeu
    });

    it("should respect localStorage and not count old admin messages on refresh", () => {
      const messages = [
        { id: "1", conversation_id: "conv1", sender_role: "admin", created_at: "2026-05-27T10:00:00Z", content: "Welcome" },
        { id: "2", conversation_id: "conv1", sender_role: "admin", created_at: "2026-05-27T10:05:00Z", content: "Are you still here?" },
      ] as any[];

      // O cliente já visualizou até a mensagem 2
      localStorage.setItem("chat_last_read:conv1", "2");

      const count = calculateCustomerUnread(messages, "conv1");
      expect(count).toBe(0); // Nenhuma mensagem nova
    });
  });
});
