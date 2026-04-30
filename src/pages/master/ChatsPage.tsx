import { Clock3, MessageSquare, PhoneCall, Send, Siren } from "lucide-react";
import {
  DashboardPageHeader,
  DashboardSection,
  DashboardToolbar,
  InlineMetric,
  KpiCard,
  StatusBadge,
  ToolbarPill,
} from "../../components/master/DashboardUI";
import { chatRecords } from "../../mocks/master-dashboard";

export default function ChatsPage() {
  const openChats = chatRecords.filter((chat) => chat.status === "open").length;
  const unresolvedChats = chatRecords.filter((chat) => chat.status !== "resolved").length;
  const unreadMessages = chatRecords.reduce((sum, chat) => sum + chat.unreadCount, 0);
  const focusedChat = chatRecords[0];

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Atendimento"
        title="Chats"
        description="Experiência de inbox mais próxima de um hub comercial, com fila, foco da conversa e prioridades do time."
      />

      <DashboardToolbar>
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarPill label="Inbox" active />
          <ToolbarPill label="WhatsApp" />
          <ToolbarPill label="Alta prioridade" />
          <ToolbarPill label="SLA crítico" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <InlineMetric label="Primeira resposta" value="4 min" helper="Média mockada" />
          <InlineMetric label="SLA aberto" value="9 chats" helper="Exigem olhar agora" />
          <InlineMetric label="NPS live" value="92" helper="Canal mais estável" />
        </div>
      </DashboardToolbar>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Conversas abertas" value={String(openChats)} delta="Atendimento ativo" icon={MessageSquare} />
        <KpiCard label="Nao resolvidas" value={String(unresolvedChats)} delta="Fila total" icon={Clock3} />
        <KpiCard label="Mensagens nao lidas" value={String(unreadMessages)} delta="Precisa resposta" icon={Siren} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr_0.8fr]">
        <DashboardSection title="Inbox" description="Fila compacta semelhante a um painel de atendimento.">
          <div className="space-y-3">
            {chatRecords.map((chat, index) => (
              <div
                key={chat.id}
                className={`rounded-2xl border p-4 ${index === 0 ? "border-primary/25 bg-primary/8" : "border-border bg-bg-subtle"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text">{chat.customer}</p>
                    <p className="text-sm text-text-muted">{chat.channel} • {chat.assignedTo}</p>
                  </div>
                  <StatusBadge
                    label={chat.priority}
                    tone={chat.priority === "high" ? "red" : chat.priority === "medium" ? "amber" : "blue"}
                  />
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-text">{chat.lastMessage}</p>
                <div className="mt-4 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-text-muted">
                  <span>{chat.waitingMinutes} min</span>
                  <span>{chat.unreadCount} unread</span>
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title={focusedChat.customer} description={`${focusedChat.channel} • owner ${focusedChat.assignedTo}`}>
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-border bg-bg-subtle p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-2xl font-black tracking-[-0.03em] text-text">{focusedChat.customer}</p>
                  <p className="text-sm text-text-muted">Conversa em destaque do painel master</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-text-muted">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-text-muted">
                    <Send className="h-4 w-4" />
                  </div>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="ml-auto max-w-[85%] rounded-[1.5rem] bg-primary px-4 py-3 text-sm font-medium text-white">
                  Perfeito, já alinhei o fluxo e vou revisar sua documentação agora.
                </div>
                <div className="max-w-[85%] rounded-[1.5rem] border border-border bg-card px-4 py-3 text-sm font-medium text-text">
                  {focusedChat.lastMessage}
                </div>
                <div className="ml-auto max-w-[85%] rounded-[1.5rem] bg-primary/12 px-4 py-3 text-sm font-medium text-text">
                  Assim que concluir, te aviso por aqui e atualizo o case.
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <InlineMetric label="Espera" value={`${focusedChat.waitingMinutes} min`} />
              <InlineMetric label="Unread" value={String(focusedChat.unreadCount)} />
              <InlineMetric label="Status" value={focusedChat.status} />
            </div>
          </div>
        </DashboardSection>

        <DashboardSection title="Team queue" description="Visão lateral para operação e escala.">
          <div className="space-y-3">
            {["Marco", "Sarah", "Lia"].map((owner) => {
              const ownerChats = chatRecords.filter((chat) => chat.assignedTo === owner);
              const ownerUnread = ownerChats.reduce((sum, chat) => sum + chat.unreadCount, 0);

              return (
                <div key={owner} className="rounded-2xl border border-border bg-bg-subtle p-4">
                  <p className="font-semibold text-text">{owner}</p>
                  <p className="mt-1 text-sm text-text-muted">{ownerChats.length} conversas ativas</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <InlineMetric label="Unread" value={String(ownerUnread)} />
                    <InlineMetric label="High" value={String(ownerChats.filter((chat) => chat.priority === "high").length)} />
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
