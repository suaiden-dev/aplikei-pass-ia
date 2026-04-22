import { supabase } from '../lib/supabase';
import type { UserService, ProcessStatus, StepData } from '../models';

export interface UserServiceWithUser extends UserService {
  user_accounts?: {
    full_name?: string;
  };
}

export const processRepository = {
  async findById(id: string): Promise<UserService | null> {
    const { data, error } = await supabase
      .from('user_services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[processRepository.findById]', error);
      return null;
    }

    return data as UserService;
  },

  async findByIdWithUser(id: string): Promise<UserServiceWithUser | null> {
    const { data, error } = await supabase
      .from('user_services')
      .select('*, user_accounts:user_id(full_name)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[processRepository.findByIdWithUser]', error);
      return null;
    }

    return data as UserServiceWithUser;
  },

  async findByUserAndSlug(userId: string, slug: string): Promise<UserService | null> {
    const { data, error } = await supabase
      .from('user_services')
      .select('*')
      .eq('user_id', userId)
      .eq('service_slug', slug)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[processRepository.findByUserAndSlug]', error);
      return null;
    }

    return data as UserService;
  },

  async findByUser(userId: string): Promise<UserService[]> {
    const { data, error } = await supabase
      .from('user_services')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[processRepository.findByUser]', error);
      return [];
    }

    return (data as UserService[]) ?? [];
  },

  async create(data: {
    user_id: string;
    service_slug: string;
    status?: string;
    current_step?: number;
    step_data?: StepData;
  }): Promise<UserService | null> {
    const { data: result, error } = await supabase
      .from('user_services')
      .insert({
        user_id: data.user_id,
        service_slug: data.service_slug,
        status: data.status ?? 'pending',
        current_step: data.current_step ?? 0,
        step_data: data.step_data ?? {},
      })
      .select()
      .single();

    if (error) {
      console.error('[processRepository.create]', error);
      return null;
    }

    return result as UserService;
  },

  async updateStatus(id: string, status: ProcessStatus): Promise<boolean> {
    const { error } = await supabase
      .from('user_services')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('[processRepository.updateStatus]', error);
      return false;
    }

    return true;
  },

  async updateStepData(id: string, stepData: Record<string, unknown>): Promise<boolean> {
    const { data: current } = await supabase
      .from('user_services')
      .select('step_data')
      .eq('id', id)
      .single();

    if (!current) return false;

    const newData = {
      ...(current.step_data as Record<string, unknown> || {}),
      ...stepData,
    };

    const { error } = await supabase
      .from('user_services')
      .update({ step_data: newData })
      .eq('id', id);

    if (error) {
      console.error('[processRepository.updateStepData]', error);
      return false;
    }

    return true;
  },

  async updateStep(id: string, step: number, status?: ProcessStatus): Promise<boolean> {
    const update: Partial<UserService> = { current_step: step };
    if (status) update.status = status;

    const { error } = await supabase
      .from('user_services')
      .update(update)
      .eq('id', id);

    if (error) {
      console.error('[processRepository.updateStep]', error);
      return false;
    }

    return true;
  },

  async findActiveByUser(userId: string, slugs?: string[]): Promise<UserService[]> {
    let query = supabase
      .from('user_services')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'awaiting_review']);

    if (slugs && slugs.length > 0) {
      query = query.in('service_slug', slugs);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[processRepository.findActiveByUser]', error);
      return [];
    }

    return (data as UserService[]) ?? [];
  },

  async hasChatMessages(processId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('process_id', processId);

    if (error) {
      if (error.code === 'PGRST205') return false;
      console.error('[processRepository.hasChatMessages]', error);
      return false;
    }

    return (count ?? 0) > 0;
  },

  async createChatMessage(params: {
    process_id: string;
    sender_id: string;
    sender_role: string;
    content: string;
  }): Promise<boolean> {
    const { error } = await supabase.from('chat_messages').insert({
      process_id: params.process_id,
      sender_id: params.sender_id,
      sender_role: params.sender_role,
      content: params.content,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[processRepository.createChatMessage]', error);
      return false;
    }

    return true;
  },
};
