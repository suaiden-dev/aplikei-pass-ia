import { supabase } from '../lib/supabase';
import type { ChatMessage, ChatMessageCreateInput } from '../models';

export const chatRepository = {
  async findByProcess(processId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('process_id', processId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[chatRepository.findByProcess]', error);
      return [];
    }

    return (data as ChatMessage[]) ?? [];
  },

  async create(message: ChatMessageCreateInput): Promise<ChatMessage | null> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        ...message,
        created_at: message.created_at ?? new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[chatRepository.create]', error);
      return null;
    }

    return data as ChatMessage;
  },

  async getUnreadCount(processId: string, excludeSenderId?: string): Promise<number> {
    let query = supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('process_id', processId)
      .neq('sender_role', 'customer');

    if (excludeSenderId) {
      query = query.neq('sender_id', excludeSenderId);
    }

    const { count, error } = await query;

    if (error) {
      console.error('[chatRepository.getUnreadCount]', error);
      return 0;
    }

    return count ?? 0;
  },

  async getLastMessage(processId: string): Promise<ChatMessage | null> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('process_id', processId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[chatRepository.getLastMessage]', error);
      return null;
    }

    return data as ChatMessage;
  },
};
