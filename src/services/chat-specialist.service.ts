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

function createRealtimeChannelName(scope: string) {
  return `${scope}:${crypto.randomUUID()}`
}

function isMotionOrCOSProcess(proc: UserService): boolean {
  const stepData = (proc.step_data || {}) as Record<string, unknown>
  const history = Array.isArray(stepData.history) ? (stepData.history as Array<Record<string, unknown>>) : []

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
  const purchases = Array.isArray(stepData.purchases) ? (stepData.purchases as Array<Record<string, unknown>>) : []
  if (purchases.some((p) => PROPOSAL_SLUGS.has(p?.slug as string))) return true
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

  subscribeToMessages(processId: string, callback: (payload: Record<string, unknown>) => void) {
    return supabase
      .channel(createRealtimeChannelName(`chat:${processId}`))
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

  subscribeToAllMessages(callback: (payload: Record<string, unknown>) => void) {
    return supabase
      .channel(createRealtimeChannelName('chat:all'))
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

    ;(data || []).forEach((row: Record<string, unknown>) => {
      if (row.sender_role === 'admin') {
        unreadByProcess[row.process_id as string] = 0
      } else if (row.sender_role === 'customer') {
        unreadByProcess[row.process_id as string] = (unreadByProcess[row.process_id as string] || 0) + 1
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

    const services = (data || []) as Array<Record<string, unknown>>
    const candidates = services.filter((row) =>
      isCustomerChatEligible({
        id: row.id as string,
        user_id: row.user_id as string,
        service_slug: row.service_slug as string,
        status: row.status as string,
        step_data: (row.step_data as Record<string, unknown>) || {},
        current_step: (row.current_step as number | null) ?? null,
        created_at: row.created_at as string,
        updated_at: row.created_at as string,
      }),
    )

    const processIds = candidates.map((row) => row.id as string)
    if (!processIds.length) return []

    const { data: chatRows, error: chatError } = await supabase
      .from('chat_messages')
      .select('process_id')
      .in('process_id', processIds)

    if (chatError) throw new Error(chatError.message)
    const activeProcessIds = new Set((chatRows || []).map((row: Record<string, unknown>) => row.process_id as string))

    const threads: SpecialistChatThread[] = []
    candidates.forEach((row) => {
      if (!activeProcessIds.has(row.id as string)) return
      const account = row.user_accounts as Record<string, unknown> | undefined
      if (!account) return

      threads.push({
        processId: row.id as string,
        userId: row.user_id as string,
        serviceSlug: row.service_slug as string,
        chatTitle: getAnalysisChatTitle(row.service_slug as string),
        fullName: (account.full_name as string | undefined) || 'Sem Nome',
        email: (account.email as string | undefined) || '',
        avatarUrl: (account.avatar_url as string | null | undefined) ?? null,
        createdAt: row.created_at as string,
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

    const services = (data || []) as Array<Record<string, unknown>>
    const eligible = services.filter((row) =>
      isCustomerChatEligible({
        id: row.id as string,
        user_id: row.user_id as string,
        service_slug: row.service_slug as string,
        status: row.status as string,
        step_data: (row.step_data as Record<string, unknown>) || {},
        current_step: (row.current_step as number | null) ?? null,
        created_at: row.created_at as string,
        updated_at: row.created_at as string,
      }),
    )

    if (!eligible.length) return []

    const processIds = eligible.map((r) => r.id as string)

    // get last message per process
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('process_id, content, created_at')
      .in('process_id', processIds)
      .order('created_at', { ascending: false })

    const lastMsgByProcess = new Map<string, string>()
    ;(msgs || []).forEach((m: Record<string, unknown>) => {
      if (!lastMsgByProcess.has(m.process_id as string)) {
        lastMsgByProcess.set(m.process_id as string, m.content as string)
      }
    })

    // fetch chat_closed_at separately — column may not exist yet if migration pending
    const closedMap = new Map<string, string | null>()
    try {
      const { data: closedRows } = await supabase
        .from('user_services')
        .select('id, chat_closed_at')
        .in('id', eligible.map((r) => r.id as string))
      ;(closedRows || []).forEach((r: Record<string, unknown>) => closedMap.set(r.id as string, (r.chat_closed_at as string | null) ?? null))
    } catch {
      // column not yet migrated — treat all as open
    }

    return eligible.map((row) => ({
      processId: row.id as string,
      userId: row.user_id as string,
      serviceSlug: row.service_slug as string,
      chatTitle: getAnalysisChatTitle(row.service_slug as string),
      createdAt: row.created_at as string,
      chatClosedAt: closedMap.get(row.id as string) ?? null,
      lastMessage: lastMsgByProcess.get(row.id as string) ?? null,
    }))
  },

  async getChatClosedAt(processId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('user_services')
      .select('chat_closed_at')
      .eq('id', processId)
      .single()

    if (error) return null
    return (data as Record<string, unknown> | null)?.chat_closed_at as string | null ?? null
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
