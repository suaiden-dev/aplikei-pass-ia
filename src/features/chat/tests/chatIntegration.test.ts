import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock do módulo do supabase para isolar testes de serviços e hooks
// Vitest faz o hoisting de vi.mock() para o topo do arquivo.
// Por isso, precisamos definir variáveis ou funções de fábrica autocontidas no escopo do mock.
vi.mock("@shared/lib/supabase", () => {
  return {
    supabase: {
      from: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        in: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      })),
      channel: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      })),
      removeChannel: vi.fn(),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "http://example.com/file.jpg" } }),
        })),
      },
    }
  };
});

// Importamos depois do mock e de forma dinâmica para que usem o mock resolvido
import { chatService } from "../services/chatService";
import { useChat } from "../hooks/useChat";
import { supabase } from "@shared/lib/supabase";

describe("Comprehensive Chat Module Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("chatService unit tests", () => {
    it("getOrCreateConversation should return active conversation if it exists", async () => {
      const activeConv = { id: "conv_123", process_id: "proc_1", is_closed: false };
      
      // Sobrescreve implementação do query chain para este caso de teste específico
      vi.spyOn(supabase, "from").mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: activeConv, error: null }),
      } as any);

      const res = await chatService.getOrCreateConversation("proc_1", "cust_1", null);
      expect(res).toEqual(activeConv);
      expect(supabase.from).toHaveBeenCalledWith("conversations");
    });

    it("getOrCreateConversation should create a new conversation if none exists", async () => {
      vi.spyOn(supabase, "from").mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as any);

      const newConv = { id: "conv_new", process_id: "proc_1", customer_id: "cust_1", office_id: "off_1", is_closed: false };
      vi.spyOn(supabase, "from").mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newConv, error: null }),
      } as any);

      const res = await chatService.getOrCreateConversation("proc_1", "cust_1", "off_1");
      expect(res).toEqual(newConv);
    });

    it("getMessages should fetch conversation messages in ascending chronological order", async () => {
      const list = [{ id: "m1", content: "Hey" }, { id: "m2", content: "Ho" }];
      vi.spyOn(supabase, "from").mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: list, error: null }),
      } as any);

      const res = await chatService.getMessages("conv_123");
      expect(res).toEqual(list);
    });

    it("sendMessage should insert message details successfully", async () => {
      vi.spyOn(supabase, "from").mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      await chatService.sendMessage({
        conversationId: "conv_123",
        senderId: "user_1",
        senderRole: "customer",
        content: "Hello team",
      });

      expect(supabase.from).toHaveBeenCalledWith("conversation_messages");
    });
  });

  describe("useChat custom React hook tests", () => {
    it("should resolve the active conversation and load messages on mount", async () => {
      const activeConv = { id: "conv_123", process_id: "proc_1", is_closed: false };
      
      vi.spyOn(supabase, "from").mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: activeConv, error: null }),
      } as any);
      
      const messagesList = [{ id: "msg_1", content: "Hi", sender_role: "customer" }];
      vi.spyOn(supabase, "from").mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: messagesList, error: null }),
      } as any);

      const { result } = renderHook(() =>
        useChat("proc_1", "off_1", "cust_1", "customer", "conv_123")
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.messages).toBeDefined();
    });

    it("should allow sending message inside useChat", async () => {
      const activeConv = { id: "conv_123", process_id: "proc_1", is_closed: false };
      
      vi.spyOn(supabase, "from").mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: activeConv, error: null }),
      } as any);
      
      const messagesList = [{ id: "msg_1", content: "Hi", sender_role: "customer" }];
      vi.spyOn(supabase, "from").mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: messagesList, error: null }),
      } as any);

      vi.spyOn(supabase, "from").mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      const { result } = renderHook(() =>
        useChat("proc_1", "off_1", "cust_1", "customer", "conv_123")
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      await act(async () => {
        await result.current.sendMessage({
          content: "new message",
          senderId: "cust_1",
          senderRole: "customer",
        });
      });

      expect(supabase.from).toHaveBeenCalledWith("conversation_messages");
    });
  });
});
