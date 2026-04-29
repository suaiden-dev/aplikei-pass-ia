import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  RiChat3Line,
  RiLoader4Line,
  RiCloseLine,
  RiLockLine,
  RiArrowRightLine,
} from 'react-icons/ri'
import { useT } from '../../../i18n'
import { useAuth } from '../../../hooks/useAuth'
import { chatService, type SpecialistChatThread } from '../../../services/chat-specialist.service'
import { SupportChat } from '../../../components/SupportChat'
import { cn } from '../../../utils/cn'

export default function AIChatPage() {
  const t = useT('dashboard')
  const { user } = useAuth()
  const [threads, setThreads] = useState<SpecialistChatThread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<SpecialistChatThread | null>(null)

  useEffect(() => {
    if (!user) return
    chatService
      .listCustomerThreads(user.id)
      .then((data) => {
        setThreads(data)
        if (data.length === 1) setSelected(data[0])
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [user])

  // sync closed state when admin closes a thread in realtime
  useEffect(() => {
    if (!selected) return
    const interval = setInterval(async () => {
      const val = await chatService.getChatClosedAt(selected.processId).catch(() => null)
      const nowClosed = val !== null
      if (nowClosed !== (selected.chatClosedAt !== null)) {
        setSelected((prev) => prev ? { ...prev, chatClosedAt: val } : prev)
        setThreads((prev) =>
          prev.map((t) =>
            t.processId === selected.processId ? { ...t, chatClosedAt: val } : t,
          ),
        )
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [selected])

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden">
      {/* Page header */}
      <div className="p-8 border-b border-border flex items-center justify-between bg-bg-subtle/50 shrink-0">
        <div>
          <h1 className="font-display font-black text-2xl text-text tracking-tight flex items-center gap-3">
            <RiChat3Line className="text-primary" />
            {t?.chat?.title || 'Mensagens'}
          </h1>
          <p className="text-[10px] text-text-muted mt-1 uppercase font-black tracking-widest leading-none">
            {t?.chat?.subtitle || 'Conversas com especialistas'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Thread list */}
        <div className="w-full md:w-80 border-r border-border flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RiLoader4Line className="text-2xl text-primary animate-spin" />
              </div>
            ) : threads.length === 0 ? (
              <div className="p-12 text-center">
                <RiChat3Line className="text-4xl text-bg-subtle mx-auto mb-4" />
                <p className="text-sm font-bold text-text-muted">
                  {t?.chat?.emptyTitle || 'Nenhuma conversa ainda'}
                </p>
                <p className="text-xs text-text-muted/70 mt-1">
                  {t?.chat?.emptySubtitle || 'As conversas com especialistas aparecerão aqui'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {threads.map((thread) => {
                  const isClosed = thread.chatClosedAt !== null
                  const isActive = selected?.processId === thread.processId
                  return (
                    <button
                      key={thread.processId}
                      onClick={() => setSelected(thread)}
                      className={cn(
                        'w-full p-4 flex gap-3 text-left transition-all hover:bg-bg-subtle/80',
                        isActive ? 'bg-primary/10 ring-1 ring-inset ring-primary/20' : '',
                      )}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <RiChat3Line className={cn('text-lg', isClosed ? 'text-text-muted' : 'text-primary')} />
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className={cn(
                            'text-xs font-black uppercase tracking-tight truncate',
                            isActive ? 'text-primary' : 'text-text',
                          )}>
                            {thread.chatTitle}
                          </h4>
                          {isClosed && (
                            <span className="flex items-center gap-1 text-[9px] font-black text-text-muted uppercase tracking-widest shrink-0 ml-2">
                              <RiLockLine size={10} />
                              Chat encerrado
                            </span>
                          )}
                        </div>
                        {thread.lastMessage ? (
                          <p className="text-[11px] text-text-muted font-medium truncate">
                            {thread.lastMessage}
                          </p>
                        ) : (
                          <p className="text-[11px] text-text-muted/60 font-medium italic truncate">
                            Sem mensagens ainda
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat area — desktop */}
        <div className="hidden md:flex flex-1 bg-bg-subtle/30 flex-col overflow-hidden">
          {selected ? (
            <ThreadView thread={selected} userId={user?.id || ''} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 rounded-[32px] bg-card shadow-xl shadow-primary/5 flex items-center justify-center mb-8 border border-border">
                <RiChat3Line className="text-5xl text-bg-subtle" />
              </div>
              <h2 className="text-xl font-black text-text tracking-tight mb-2">
                Selecione uma conversa
              </h2>
              <p className="text-sm text-text-muted max-w-xs font-medium">
                Escolha uma das suas conversas à esquerda para continuar.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Thread view — mobile modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="md:hidden fixed inset-0 z-[100] bg-bg flex flex-col"
          >
            <ThreadView
              thread={selected}
              userId={user?.id || ''}
              onClose={() => setSelected(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ThreadView({
  thread,
  userId,
  onClose,
}: {
  thread: SpecialistChatThread
  userId: string
  onClose?: () => void
}) {
  const isClosed = thread.chatClosedAt !== null

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Thread header */}
      <div className="p-4 md:p-6 bg-card border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {onClose && (
            <button onClick={onClose} className="p-2 -ml-2 text-text-muted hover:text-text">
              <RiCloseLine size={24} />
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <RiChat3Line className={cn('text-lg', isClosed ? 'text-slate-400' : 'text-primary')} />
          </div>
          <div>
            <h3 className="text-sm font-black text-text uppercase tracking-tight leading-none mb-1">
              {thread.chatTitle}
            </h3>
            <div className="flex items-center gap-1.5">
              {isClosed ? (
                <>
                  <RiLockLine className="text-[10px] text-text-muted" />
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Chat encerrado</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Chat ativo</span>
                </>
              )}
            </div>
          </div>
        </div>

        <a
          href={`/dashboard/processes/${thread.serviceSlug}?id=${thread.processId}`}
          className="flex items-center gap-1.5 text-[10px] font-black text-text-muted hover:text-primary uppercase tracking-widest transition-colors"
        >
          Ver processo
          <RiArrowRightLine size={12} />
        </a>
      </div>

      <SupportChat
        processId={thread.processId}
        userId={userId}
        role="customer"
        title={thread.chatTitle}
        isClosed={isClosed}
        serviceSlug={thread.serviceSlug}
      />
    </div>
  )
}
