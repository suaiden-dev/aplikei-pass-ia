import { useEffect, useRef, useState, type RefObject } from 'react'
import { toast } from 'sonner'
import type { InterviewTrainingMessage } from '../../models'
import { interviewTrainingService } from '../../services/interview-training.service'

interface UseInterviewTrainingControllerOptions {
  initialMessage: string
  processId: string
  userId?: string
  lang: string
  ds160: Record<string, unknown>
  visaType?: string
  errorMessage: string
}

interface UseInterviewTrainingControllerResult {
  messages: InterviewTrainingMessage[]
  input: string
  setInput: (value: string) => void
  isSending: boolean
  scrollRef: RefObject<HTMLDivElement | null>
  sendMessage: () => Promise<void>
}

export function useInterviewTrainingController({
  initialMessage,
  processId,
  userId,
  lang,
  ds160,
  visaType,
  errorMessage,
}: UseInterviewTrainingControllerOptions): UseInterviewTrainingControllerResult {
  const [messages, setMessages] = useState<InterviewTrainingMessage[]>([
    { id: crypto.randomUUID(), role: 'bot', text: initialMessage },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const sessionIdRef = useRef(crypto.randomUUID())
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isSending])

  const sendMessage = async () => {
    if (!input.trim() || isSending) return

    const userMessage = input.trim()

    setInput('')
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text: userMessage },
    ])
    setIsSending(true)

    try {
      const response = await interviewTrainingService.sendMessage({
        message: userMessage,
        userId,
        processId,
        lang,
        sessionId: sessionIdRef.current,
        ds160,
        visaType,
      })

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'bot', text: response.text },
      ])
    } catch (error) {
      console.error('[useInterviewTrainingController] Error sending message:', error)
      toast.error(
        error instanceof Error && error.message ? error.message : errorMessage,
      )
    } finally {
      setIsSending(false)
    }
  }

  return {
    messages,
    input,
    setInput,
    isSending,
    scrollRef,
    sendMessage,
  }
}
