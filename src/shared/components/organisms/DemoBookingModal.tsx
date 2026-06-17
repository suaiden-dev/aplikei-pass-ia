import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { CalendarDays, BriefcaseBusiness, LayoutDashboard, ShieldCheck, Sparkles, Users, FileText, DollarSign, MessageSquareText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@shared/components/atoms/dialog";
import { Button } from "@shared/components/atoms/button";
import { Input } from "@shared/components/atoms/input";
import { Textarea } from "@shared/components/atoms/textarea";
import { useLocale } from "@app/app/i18n";
import { supabase } from "@shared/lib/supabase";
import { cn } from "@shared/utils/cn";
import { toast } from "sonner";
import wernerLogo from "@assets/logos/Logotipo-Werner-Advocacia.png";
import marquesLogo from "@assets/logos/MARQUES-ADVOGADOS-.png";
import msgLogo from "@assets/logos/cropped-logo-MSG-azul.png";
import legalLogo from "@assets/logos/logo-horizontal-CyOfyqfY.png";

type DemoBookingContextValue = {
  openDemoBooking: () => void;
  closeDemoBooking: () => void;
};

const DemoBookingContext = createContext<DemoBookingContextValue | null>(null);

const formCopy = {
  pt: {
    title: "Agendar demo",
    description:
      "Veja a plataforma ao vivo com dashboard, processos, financeiro e equipe em um fluxo guiado. Preencha os dados e retornamos com a demonstração.",
    badge: "Demo guiada",
    formTitle: "Solicite a demonstração",
    formSubtitle: "Conte rapidamente quem é você e o que quer ver no encontro.",
    fields: {
      workEmail: "Email corporativo",
      firstName: "Nome",
      lastName: "Sobrenome",
      phone: "Telefone",
      company: "Escritório / Empresa",
      employees: "Número de colaboradores",
      source: "Como nos conheceu?",
      subject: "Assunto",
      message: "O que deseja ver na demo?",
      workEmailPlaceholder: "seu@escritorio.com",
      firstNamePlaceholder: "Seu nome",
      lastNamePlaceholder: "Seu sobrenome",
      phonePlaceholder: "(11) 99999-9999",
      companyPlaceholder: "Nome do escritório",
      employeesPlaceholder: "Selecione",
      sourcePlaceholder: "Selecione",
      subjectPlaceholder: "Agendar demonstração",
      messagePlaceholder: "Conte o volume da operação, as dores atuais e o que gostaria de ver.",
    },
    submit: "Quero agendar a demo",
    sending: "Enviando...",
    success: "Recebemos seu pedido de demo.",
    error: "Não foi possível enviar agora.",
    required: "Preencha os campos obrigatórios.",
    stats: [
      { label: "Tempo de resposta", value: "1 dia útil" },
      { label: "Formato", value: "Demonstração guiada" },
      { label: "Foco", value: "Operação digital" },
    ],
  },
  en: {
    title: "Book a demo",
    description:
      "See the platform live with dashboard, processes, finance and team in a guided flow. Fill in your details and we will return with the demo.",
    badge: "Guided demo",
    formTitle: "Request the demo",
    formSubtitle: "Tell us who you are and what you want to see in the meeting.",
    fields: {
      workEmail: "Work email",
      firstName: "First name",
      lastName: "Last name",
      phone: "Phone",
      company: "Firm / Company",
      employees: "Number of employees",
      source: "How did you hear about us?",
      subject: "Subject",
      message: "What would you like to see in the demo?",
      workEmailPlaceholder: "you@firm.com",
      firstNamePlaceholder: "Your first name",
      lastNamePlaceholder: "Your last name",
      phonePlaceholder: "+1 (555) 000-0000",
      companyPlaceholder: "Firm name",
      employeesPlaceholder: "Select",
      sourcePlaceholder: "Select",
      subjectPlaceholder: "Schedule a demo",
      messagePlaceholder: "Tell us about your operation, bottlenecks and what you want to see.",
    },
    submit: "Book the demo",
    sending: "Sending...",
    success: "We received your demo request.",
    error: "We could not send it right now.",
    required: "Fill in the required fields.",
    stats: [
      { label: "Response time", value: "1 business day" },
      { label: "Format", value: "Guided demo" },
      { label: "Focus", value: "Digital operation" },
    ],
  },
  es: {
    title: "Agendar demo",
    description:
      "Vea la plataforma en vivo con dashboard, procesos, finanzas y equipo en un flujo guiado. Complete sus datos y le responderemos con la demo.",
    badge: "Demo guiada",
    formTitle: "Solicite la demo",
    formSubtitle: "Cuéntenos quién es y qué quiere ver en la reunión.",
    fields: {
      workEmail: "Email corporativo",
      firstName: "Nombre",
      lastName: "Apellido",
      phone: "Teléfono",
      company: "Firma / Empresa",
      employees: "Número de colaboradores",
      source: "¿Cómo nos conoció?",
      subject: "Asunto",
      message: "¿Qué desea ver en la demo?",
      workEmailPlaceholder: "usted@firma.com",
      firstNamePlaceholder: "Su nombre",
      lastNamePlaceholder: "Su apellido",
      phonePlaceholder: "+1 (555) 000-0000",
      companyPlaceholder: "Nombre de la firma",
      employeesPlaceholder: "Seleccione",
      sourcePlaceholder: "Seleccione",
      subjectPlaceholder: "Agendar demo",
      messagePlaceholder: "Cuéntenos sobre su operación, cuellos de botella y qué quiere ver.",
    },
    submit: "Quiero agendar la demo",
    sending: "Enviando...",
    success: "Recibimos su solicitud de demo.",
    error: "No fue posible enviar ahora.",
    required: "Complete los campos obligatorios.",
    stats: [
      { label: "Tiempo de respuesta", value: "1 día hábil" },
      { label: "Formato", value: "Demo guiada" },
      { label: "Foco", value: "Operación digital" },
    ],
  },
} as const;

const companySizes = ["1-5", "6-15", "16-30", "31-50", "50+"] as const;
const discoverySources = ["Google", "Indicação", "Instagram", "Evento", "Outros"] as const;

const trustLogos = [
  { src: wernerLogo, alt: "Werner Advocacia" },
  { src: marquesLogo, alt: "Marques Advogados" },
  { src: msgLogo, alt: "MSG Advocacia" },
  { src: legalLogo, alt: "Aplikei Legal" },
] as const;

function DemoFormBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden opacity-80"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(249,168,37,0.25),transparent_18%),radial-gradient(circle_at_52%_8%,rgba(236,72,153,0.22),transparent_16%),radial-gradient(circle_at_82%_12%,rgba(56,189,248,0.28),transparent_18%),linear-gradient(180deg,rgba(15,23,42,0.12),rgba(15,23,42,0.02))]" />
      <div className="absolute -left-24 top-16 h-[34rem] w-[26rem] rounded-[36px] border border-white/20 bg-white/60 blur-[1px] shadow-[0_24px_80px_rgba(15,23,42,0.16)]" />
      <div className="absolute left-[17%] top-[9%] h-20 w-20 rounded-full bg-primary/20 blur-2xl" />
      <div className="absolute right-[11%] top-[20%] h-24 w-24 rounded-full bg-success/20 blur-2xl" />
      <div className="absolute inset-x-10 bottom-12 h-24 rounded-full bg-slate-950/10 blur-3xl" />
    </div>
  );
}

function AdminBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(45,99,255,0.18),transparent_20%),radial-gradient(circle_at_82%_12%,rgba(236,72,153,0.14),transparent_18%),radial-gradient(circle_at_56%_84%,rgba(52,211,153,0.12),transparent_18%),linear-gradient(180deg,rgba(245,247,255,0.98),rgba(239,244,255,0.94))]" />
      <div className="absolute inset-x-0 top-0 h-24 border-b border-white/50 bg-white/68 backdrop-blur-xl" />
      <div className="absolute left-0 top-24 h-[calc(100%-6rem)] w-80 border-r border-white/50 bg-slate-950/92 backdrop-blur-2xl">
        <div className="h-full p-6 text-white/80">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-primary">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">admin_lawyer</p>
              <strong className="block text-sm text-white">Aplikei Dashboard</strong>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            {[
              ["Dashboard", LayoutDashboard],
              ["Clientes", Users],
              ["Processos", FileText],
              ["Financeiro", DollarSign],
              ["Mensagens", MessageSquareText],
            ].map(([label, Icon]) => (
              <div key={label as string} className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3 text-sm font-semibold text-white/82">
                <Icon className="h-4 w-4 text-primary" />
                {label as string}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute left-80 top-24 right-0 bottom-0 p-8">
        <div className="grid h-full grid-rows-[auto_auto_1fr] gap-5">
            <div className="flex items-center justify-between rounded-[28px] border border-white/50 bg-white/80 px-6 py-4 shadow-[0_14px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">Operação ativa</p>
              <h4 className="mt-1 text-2xl font-black tracking-tight text-text">admin_lawyer session</h4>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Online
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              ["Casos ativos", "128", "+18%"],
              ["Receita", "R$ 236k", "+24%"],
              ["Equipe", "14", "+3"],
              ["Mensagens", "42", "+8"],
            ].map(([label, value, delta]) => (
              <div key={label as string} className="rounded-[26px] border border-white/50 bg-white/84 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">{label as string}</p>
                <div className="mt-3 flex items-end justify-between">
                  <strong className="font-display text-3xl tracking-tight text-text">{value as string}</strong>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-primary">
                    {delta as string}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[1.15fr_0.85fr] gap-5">
            <div className="rounded-[28px] border border-white/50 bg-white/80 p-6 shadow-[0_14px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">Processos</p>
                  <h4 className="mt-1 text-xl font-black text-text">Fila operacional</h4>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-primary">Ao vivo</span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["B1/B2", "Revisão técnica", "Em andamento"],
                  ["F1", "Documentos", "Pendente"],
                  ["Extensão de status", "Pagamento", "Concluído"],
                ].map(([caseType, step, state]) => (
                  <div key={`${caseType}-${step}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-border bg-bg-subtle px-4 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
                      {caseType.slice(0, 1)}
                    </div>
                    <div>
                      <strong className="block text-sm text-text">{caseType} · {step}</strong>
                      <span className="text-xs text-text-muted">Etapa do processo</span>
                    </div>
                    <span className={cn("rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]", state === "Concluído" ? "bg-emerald-500/10 text-emerald-700" : state === "Pendente" ? "bg-amber-500/10 text-amber-700" : "bg-sky-500/10 text-sky-700")}>
                      {state}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/50 bg-white/80 p-6 shadow-[0_14px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">Atividade</p>
              <h4 className="mt-1 text-xl font-black text-text">Mensagens recentes</h4>
              <div className="mt-5 space-y-3">
                {[
                  ["Cliente pediu atualização do F1", "agora"],
                  ["Documento pendente enviado", "2 min"],
                  ["Pagamento confirmado", "12 min"],
                ].map(([title, time]) => (
                  <div key={title as string} className="rounded-2xl border border-border bg-card p-4">
                    <strong className="block text-sm text-text">{title as string}</strong>
                    <span className="mt-1 block text-xs text-text-muted">{time as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoBookingModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { lang } = useLocale();
  const copy = formCopy[lang as keyof typeof formCopy] ?? formCopy.pt;
  const [workEmail, setWorkEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [employees, setEmployees] = useState("");
  const [source, setSource] = useState("");
  const [subject, setSubject] = useState(copy.fields.subjectPlaceholder);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!open) {
      setWorkEmail("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setCompany("");
      setEmployees("");
      setSource("");
      setSubject(copy.fields.subjectPlaceholder);
      setMessage("");
    }
  }, [copy.fields.subjectPlaceholder, open]);

  useEffect(() => {
    const original = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !workEmail.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !phone.trim() ||
      !company.trim() ||
      !employees.trim() ||
      !source.trim() ||
      !subject.trim() ||
      !message.trim()
    ) {
      toast.error(copy.required);
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke("contact-form", {
        body: {
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: workEmail.trim(),
          subject: subject.trim(),
          message: [
            `Telefone: ${phone.trim()}`,
            `Empresa: ${company.trim()}`,
            `Colaboradores: ${employees.trim()}`,
            `Origem: ${source.trim()}`,
            "",
            message.trim(),
          ].join("\n"),
        },
      });

      if (error) throw error;

      toast.success(copy.success);
      onOpenChange(false);
    } catch {
      toast.error(copy.error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="z-[220] max-w-none h-[100dvh] w-screen overflow-hidden border-0 bg-transparent p-0 shadow-none sm:rounded-none"
      >
        <div className="relative isolate flex min-h-[100dvh] w-full items-start justify-center overflow-y-auto px-3 py-3 sm:items-center sm:px-4 sm:py-4">
          <div className="hidden sm:block">
            <AdminBackdrop />
          </div>
          <div className="absolute inset-0 bg-white/7 backdrop-blur-[10px]" />
          <div className="relative z-10 w-full max-w-[min(980px,calc(100vw-1.5rem))] px-0 py-0 sm:px-2 sm:py-2 lg:px-3 lg:py-3">
            <div className="flex max-h-[calc(100dvh-1rem)] flex-col overflow-hidden rounded-[30px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,249,255,0.98))] shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <section className="relative z-10 bg-white/92 p-3 backdrop-blur-xl sm:p-5 lg:p-6">
                  <div className="rounded-[26px] border border-border/70 bg-card/90 p-3 shadow-[0_20px_44px_rgba(15,23,42,0.08)] sm:p-5 lg:p-6">
                    <DialogHeader className="sr-only">
                      <DialogTitle>{copy.title}</DialogTitle>
                      <DialogDescription>{copy.description}</DialogDescription>
                    </DialogHeader>

                    <form className="grid gap-3 sm:gap-4" onSubmit={handleSubmit}>
                      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                        <label className="grid gap-2">
                          <span className="text-xs font-black uppercase tracking-[0.14em] text-text-muted">{copy.fields.firstName}</span>
                          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={copy.fields.firstNamePlaceholder} />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-xs font-black uppercase tracking-[0.14em] text-text-muted">{copy.fields.lastName}</span>
                          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={copy.fields.lastNamePlaceholder} />
                        </label>
                      </div>

                      <label className="grid gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.14em] text-text-muted">{copy.fields.workEmail}</span>
                        <Input type="email" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} placeholder={copy.fields.workEmailPlaceholder} />
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                        <label className="grid gap-2">
                          <span className="text-xs font-black uppercase tracking-[0.14em] text-text-muted">{copy.fields.phone}</span>
                          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={copy.fields.phonePlaceholder} />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-xs font-black uppercase tracking-[0.14em] text-text-muted">{copy.fields.company}</span>
                          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={copy.fields.companyPlaceholder} />
                        </label>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                        <label className="grid gap-2">
                          <span className="text-xs font-black uppercase tracking-[0.14em] text-text-muted">{copy.fields.employees}</span>
                          <select
                            value={employees}
                            onChange={(e) => setEmployees(e.target.value)}
                          className="flex h-10 w-full rounded-lg border border-border bg-surface-container-low px-3.5 text-sm text-text shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
                          >
                            <option value="" disabled>
                              {copy.fields.employeesPlaceholder}
                            </option>
                            {companySizes.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="grid gap-2">
                          <span className="text-xs font-black uppercase tracking-[0.14em] text-text-muted">{copy.fields.source}</span>
                          <select
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="flex h-10 w-full rounded-lg border border-border bg-surface-container-low px-3.5 text-sm text-text shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
                          >
                            <option value="" disabled>
                              {copy.fields.sourcePlaceholder}
                            </option>
                            {discoverySources.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <label className="grid gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.14em] text-text-muted">{copy.fields.subject}</span>
                        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={copy.fields.subjectPlaceholder} />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.14em] text-text-muted">{copy.fields.message}</span>
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={copy.fields.messagePlaceholder}
                          className="min-h-[96px] rounded-2xl"
                        />
                      </label>

                      <Button type="submit" size="lg" className="mt-1 w-full rounded-full py-3.5 text-sm sm:text-base" disabled={isSending}>
                        {isSending ? copy.sending : copy.submit}
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DemoBookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openDemoBooking = useCallback(() => setOpen(true), []);
  const closeDemoBooking = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({
      openDemoBooking,
      closeDemoBooking,
    }),
    [closeDemoBooking, openDemoBooking],
  );

  return (
    <DemoBookingContext.Provider value={value}>
      {children}
      <DemoBookingModal open={open} onOpenChange={setOpen} />
    </DemoBookingContext.Provider>
  );
}

export function useDemoBooking() {
  const context = useContext(DemoBookingContext);
  if (!context) {
    throw new Error("useDemoBooking must be used within DemoBookingProvider");
  }
  return context;
}
