export type InterviewTrainingMessageRole = 'user' | 'bot'

export interface InterviewTrainingMessage {
  id: string
  role: InterviewTrainingMessageRole
  text: string
}

export interface InterviewTrainingRequest {
  message: string
  userId?: string
  processId: string
  lang: string
  sessionId: string
  ds160: Record<string, unknown>
  visaType?: string
}

export interface InterviewTrainingResponse {
  text: string
  raw: unknown
}
