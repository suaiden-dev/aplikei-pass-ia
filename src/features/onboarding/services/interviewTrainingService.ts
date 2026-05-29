import type {
  InterviewTrainingRequest,
  InterviewTrainingResponse,
} from '@shared/types'

const INTERVIEW_CHAT_DAILY_LIMIT = Number(import.meta.env.VITE_INTERVIEW_CHAT_DAILY_LIMIT || 20)
const CHAT_USAGE_KEY_PREFIX = 'aplikei.interview.chat.daily'

function getWebhookUrl() {
  const url = import.meta.env.VITE_N8N_BOT_INTERVIEW?.trim()

  if (!url) {
    throw new Error('Webhook do treino de entrevista com IA não configurado.')
  }

  return url
}

function extractResponseText(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload.trim()
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const text = extractResponseText(item)
      if (text) return text
    }
    return ''
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const directText = [record.output, record.response, record.text].find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    )

    if (directText) {
      return directText.trim()
    }
  }

  return ''
}

function getTodayLocalStamp(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getUsageKey(userId: string) {
  return `${CHAT_USAGE_KEY_PREFIX}:${userId}:${getTodayLocalStamp()}`
}

function getSafeLimit() {
  if (!Number.isFinite(INTERVIEW_CHAT_DAILY_LIMIT) || INTERVIEW_CHAT_DAILY_LIMIT <= 0) {
    return 20
  }
  return Math.floor(INTERVIEW_CHAT_DAILY_LIMIT)
}

function readDailyUsage(userId: string): number {
  if (typeof window === 'undefined') return 0
  const raw = window.localStorage.getItem(getUsageKey(userId))
  const parsed = Number(raw || 0)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function writeDailyUsage(userId: string, value: number) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getUsageKey(userId), String(value))
}

function resolveUsageUserId(userId?: string) {
  return userId?.trim() || 'anonymous-user'
}

function buildLimitExceededMessage(limit: number) {
  return `Você atingiu o limite diário de ${limit} mensagens no chat de entrevista. Aguarde até o próximo dia para continuar.`
}

export const interviewTrainingService = {
  getDailyLimit() {
    return getSafeLimit()
  },
  getDailyUsage(userId?: string) {
    return readDailyUsage(resolveUsageUserId(userId))
  },
  ensureDailyLimit(userId?: string) {
    const limit = getSafeLimit()
    const usage = readDailyUsage(resolveUsageUserId(userId))
    if (usage >= limit) {
      throw new Error(buildLimitExceededMessage(limit))
    }
  },
  registerDailyUsage(userId?: string) {
    const resolvedUserId = resolveUsageUserId(userId)
    const usage = readDailyUsage(resolvedUserId)
    writeDailyUsage(resolvedUserId, usage + 1)
  },
  async sendMessage(
    input: InterviewTrainingRequest,
  ): Promise<InterviewTrainingResponse> {
    const response = await fetch(getWebhookUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    const rawBody = await response.text()
    let payload: unknown = rawBody

    if (rawBody) {
      try {
        payload = JSON.parse(rawBody)
      } catch {
        payload = rawBody
      }
    }

    const text = extractResponseText(payload)

    if (!response.ok) {
      throw new Error(text || 'Falha ao conectar com o treino de entrevista.')
    }

    if (!text) {
      throw new Error('Resposta inválida do treino de entrevista.')
    }

    return {
      text,
      raw: payload,
    }
  },
}
