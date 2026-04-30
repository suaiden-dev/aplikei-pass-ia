import type {
  InterviewTrainingRequest,
  InterviewTrainingResponse,
} from '../models'

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

export const interviewTrainingService = {
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
