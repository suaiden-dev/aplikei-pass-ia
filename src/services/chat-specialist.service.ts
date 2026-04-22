import { supabase } from '../lib/supabase'
import {
  getAnalysisChatTitle,
  isAnalysisServiceSlug,
  type UserService,
} from './process.service'

export interface ChatMessage {
  id: string
  process_id: string
  sender_id: string
  sender_role: 'admin' | 'customer'
  content: string
  file_url?: string
  file_name?: string
  file_type?: string
  created_at: string
}

export interface SpecialistChatThread {
  processId: string
  userId: string
  serviceSlug: string
  chatTitle: string
  fullName?: string
  email?: string
  avatarUrl?: string | null
  createdAt: string
  chatClosedAt?: string | null
  lastMessage?: string | null
}

function isMotionOrCOSProcess(proc: UserService): boolean {
  const stepData = (proc.step_data || {}) as Record<string, unknown>
  const history = Array.isArray(stepData.history) ? (stepData.history as any[]) : []

  return (
    proc.service_slug.startsWith('troca-status') ||
    proc.service_slug.startsWith('extensao-status') ||
    proc.service_slug.includes('motion') ||
    history.some((cycle) => cycle?.type === 'motion') ||
    Boolean(stepData.motion_payment_completed_at)
  )
}

const PROPOSAL_SLUGS = new Set([
  'proposta-rfe-motion',
  'apoio-rfe-motion-inicio',
  'analise-rfe-cos',
  'apoio-rfe-cos',
  'analise-especialista-cos',
  'analise-especialista-rfe',
])

function hasProposalPaid(stepData: Record<string, unknown>): boolean {
  const purchases = Array.isArray(stepData.purchases) ? (stepData.purchases as any[]) : []
  if (purchases.some((p) => PROPOSAL_SLUGS.has(p?.slug))) return true
  // fallback: check direct flags set by payment webhook
  return Boolean(
    stepData.motion_payment_completed_at ||
    stepData.motion_proposal_paid ||
    stepData.rfe_proposal_paid ||
    stepData.motion_initial_paid ||
    stepData.rfe_initial_paid ||
    stepData.motion_analysis_paid ||
    stepData.motion_chat_started_at,
  )
}

function isCustomerChatEligible(proc: UserService): boolean {
  // analysis services are paid-upfront products — always eligible
  if (isAnalysisServiceSlug(proc.service_slug)) return true
  // COS/EOS/motion workflows — only after proposal is paid
  if (isMotionOrCOSProcess(proc)) {
    return hasProposalPaid((proc.step_data || {}) as Record<string, unknown>)
  }
  return false
}

export const chatService = {
  async getMessages(processId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('process_id', processId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return (data as ChatMessage[]) || []
  },

  async sendMessage(params: {
    processId: string
    content: string
    senderId: string
    senderRole: 'admin' | 'customer'
    file?: File
  }): Promise<void> {
    let fileUrl: string | null = null
    let fileName: string | null = null
    let fileType: string | null = null

    if (params.file) {
      const ext = params.file.name.split('.').pop()
      const path = `chat/${params.processId}/${Date.now()}_${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(path, params.file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('profiles').getPublicUrl(path)
      fileUrl = data.publicUrl
      fileName = params.file.name
      fileType = params.file.type
    }

    const { error } = await supabase.from('chat_messages').insert({
      process_id: params.processId,
      content: params.content,
      sender_id: params.senderId,
      sender_role: params.senderRole,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      created_at: new Date().toISOString(),
    })

    if (error) throw new Error(error.message)
  },

  subscribeToMessages(processId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`chat:${processId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `process_id=eq.${processId}`,
        },
        callback,
      )
      .subscribe()
  },

  subscribeToAllMessages(callback: (payload: any) => void) {
    return supabase
      .channel('chat:all')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        callback,
      )
      .subscribe()
  },

  async getUnreadCountsByProcess(processIds: string[]): Promise<Record<string, number>> {
    if (!processIds.length) return {}

    const { data, error } = await supabase
      .from('chat_messages')
      .select('process_id, sender_role, created_at')
      .in('process_id', processIds)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)

    const unreadByProcess: Record<string, number> = {}
    processIds.forEach((id) => {
      unreadByProcess[id] = 0
    })

    ;(data || []).forEach((row: any) => {
      if (row.sender_role === 'admin') {
        unreadByProcess[row.process_id] = 0
      } else if (row.sender_role === 'customer') {
        unreadByProcess[row.process_id] = (unreadByProcess[row.process_id] || 0) + 1
      }
    })

    return unreadByProcess
  },

  async getCustomerSpecialistThread(userId: string): Promise<SpecialistChatThread | null> {
    const { data, error } = await supabase
      .from('user_services')
      .select('id, user_id, service_slug, status, step_data, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    const services = (data || []) as UserService[]
    if (!services.length) return null

    const selected =
      services.find((s) => isAnalysisServiceSlug(s.service_slug)) ||
      services.find((s) => isMotionOrCOSProcess(s)) ||
      services.find((s) => ['active', 'awaiting_review'].includes(s.status)) ||
      services[0]

    if (!selected) return null

    return {
      processId: selected.id,
      userId: selected.user_id,
      serviceSlug: selected.service_slug,
      chatTitle: getAnalysisChatTitle(selected.service_slug),
      createdAt: selected.created_at,
    }
  },

  async listAdminSpecialistThreads(): Promise<SpecialistChatThread[]> {
    const { data, error } = await supabase
      .from('user_services')
      .select(`
        id,
        user_id,
        service_slug,
        status,
        step_data,
        created_at,
        user_accounts:user_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    const services = (data || []) as any[]
    const candidates = services.filter((row) =>
      isCustomerChatEligible({
        id: row.id,
        user_id: row.user_id,
        service_slug: row.service_slug,
        status: row.status,
        step_data: row.step_data || {},
        current_step: row.current_step ?? null,
        created_at: row.created_at,
        updated_at: row.created_at,
      }),
    )

    const processIds = candidates.map((row) => row.id)
    if (!processIds.length) return []

    const { data: chatRows, error: chatError } = await supabase
      .from('chat_messages')
      .select('process_id')
      .in('process_id', processIds)

    if (chatError) throw new Error(chatError.message)
    const activeProcessIds = new Set((chatRows || []).map((row: any) => row.process_id))

    const threads: SpecialistChatThread[] = []
    candidates.forEach((row) => {
      if (!activeProcessIds.has(row.id)) return
      const account = row.user_accounts
      if (!account) return

      threads.push({
        processId: row.id,
        userId: row.user_id,
        serviceSlug: row.service_slug,
        chatTitle: getAnalysisChatTitle(row.service_slug),
        fullName: account.full_name || 'Sem Nome',
        email: account.email || '',
        avatarUrl: account.avatar_url || null,
        createdAt: row.created_at,
      })
    })

    return threads
  },

  async listCustomerThreads(userId: string): Promise<SpecialistChatThread[]> {
    const { data, error } = await supabase
      .from('user_services')
      .select('id, user_id, service_slug, status, step_data, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    const services = (data || []) as any[]
    const eligible = services.filter((row) =>
      isCustomerChatEligible({
        id: row.id,
        user_id: row.user_id,
        service_slug: row.service_slug,
        status: row.status,
        step_data: row.step_data || {},
        current_step: row.current_step ?? null,
        created_at: row.created_at,
        updated_at: row.created_at,
      }),
    )

    if (!eligible.length) return []

    const processIds = eligible.map((r) => r.id)

    // get last message per process
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('process_id, content, created_at')
      .in('process_id', processIds)
      .order('created_at', { ascending: false })

    const lastMsgByProcess = new Map<string, string>()
    ;(msgs || []).forEach((m: any) => {
      if (!lastMsgByProcess.has(m.process_id)) {
        lastMsgByProcess.set(m.process_id, m.content)
      }
    })

    // fetch chat_closed_at separately — column may not exist yet if migration pending
    const closedMap = new Map<string, string | null>()
    try {
      const { data: closedRows } = await supabase
        .from('user_services')
        .select('id, chat_closed_at')
        .in('id', eligible.map((r) => r.id))
      ;(closedRows || []).forEach((r: any) => closedMap.set(r.id, r.chat_closed_at ?? null))
    } catch {
      // column not yet migrated — treat all as open
    }

    return eligible.map((row) => ({
      processId: row.id,
      userId: row.user_id,
      serviceSlug: row.service_slug,
      chatTitle: getAnalysisChatTitle(row.service_slug),
      createdAt: row.created_at,
      chatClosedAt: closedMap.get(row.id) ?? null,
      lastMessage: lastMsgByProcess.get(row.id) ?? null,
    }))
  },

  async getChatClosedAt(processId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('user_services')
      .select('chat_closed_at')
      .eq('id', processId)
      .single()

    if (error) return null
    return (data as any)?.chat_closed_at ?? null
  },

  async closeChat(processId: string): Promise<void> {
    const { error } = await supabase
      .from('user_services')
      .update({ chat_closed_at: new Date().toISOString() })
      .eq('id', processId)

    if (error) throw new Error(error.message)
  },

  async reopenChat(processId: string): Promise<void> {
    const { error } = await supabase
      .from('user_services')
      .update({ chat_closed_at: null })
      .eq('id', processId)

    if (error) throw new Error(error.message)
  },
}
