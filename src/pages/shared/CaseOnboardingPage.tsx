import { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, CircleDashed, Clock3, FolderKanban, UserRound } from "lucide-react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/Accordion";
import { Button } from "../../components/Button";
import { DashboardPageHeader, DashboardSection, InlineMetric, StatusBadge } from "../../components/master/DashboardUI";
import { useAuth } from "../../hooks/useAuth";
import type { CaseOnboardingStep } from "../../models/case.model";
import { caseService } from "../../services/case.service";
import { processService } from "../../services/process.service";
import { getSupabaseClient } from "../../lib/supabase/client";
import { workflowService, type StepReview } from "../../services/workflow.service";
import { formatDate } from "../../utils/format";

// ─── DS-160 field labels & sections ──────────────────────────────────────────

const DS160_LABELS: Record<string, string> = {
  // Entrevista
  interviewLocation: "Consulado da Entrevista",
  isBrazilian: "É Brasileiro(a)?",
  // Dados Pessoais
  fullName: "Nome Completo",
  surname: "Sobrenome",
  givenName: "Nome",
  fullNameNativeAlphabet: "Nome em Alfabeto Nativo",
  hasTelecodeForName: "Tem Telecode para o Nome?",
  maternalGrandmotherName: "Nome da Avó Materna",
  hasOtherNames: "Possui Outros Nomes?",
  otherNames: "Outros Nomes",
  gender: "Sexo",
  maritalStatus: "Estado Civil",
  birthDate: "Data de Nascimento",
  birthCity: "Cidade de Nascimento",
  birthState: "Estado de Nascimento",
  birthCountry: "País de Nascimento",
  // Nacionalidade
  hasOtherNationality: "Tem Outra Nacionalidade?",
  otherNationalityDetails: "Detalhes da Outra Nacionalidade",
  hasOtherResidence: "Tem Outra Residência?",
  otherResidenceCountry: "País de Outra Residência",
  cpf: "CPF",
  // Passaporte
  passportNumber: "Número do Passaporte",
  passportIssueDate: "Data de Emissão",
  passportExpDate: "Data de Vencimento",
  lostPassport: "Perdeu Passaporte?",
  lostPassportNumber: "Número do Passaporte Perdido",
  lostPassportExpanation: "Explicação da Perda",
  // Viagem
  travelPurpose: "Finalidade da Viagem",
  specificTravelPlan: "Tem Plano de Viagem Definido?",
  arrivalDate: "Data de Chegada",
  arrivalFlight: "Voo de Chegada",
  arrivalCity: "Cidade de Chegada",
  placesToVisit: "Locais a Visitar",
  departureDate: "Data de Partida",
  departureFlight: "Voo de Partida",
  departureCity: "Cidade de Partida",
  estArrivalDate: "Data Estimada de Chegada",
  estStayLength: "Tempo Estimado de Estadia",
  usStayName: "Nome do Local de Hospedagem",
  usStayStreet: "Rua do Local de Hospedagem",
  usStayCity: "Cidade da Hospedagem",
  usStayState: "Estado da Hospedagem",
  usStayZip: "CEP da Hospedagem",
  payingTrip: "Quem Paga a Viagem?",
  payerName: "Nome de Quem Paga",
  payerRelation: "Relação com Quem Paga",
  payerPhone: "Telefone de Quem Paga",
  payerEmail: "E-mail de Quem Paga",
  // Acompanhantes
  travelingWithOthers: "Viaja com Acompanhantes?",
  travelGroup: "É Parte de um Grupo?",
  companionsDetails: "Detalhes dos Acompanhantes",
  // Viagens Anteriores
  beenToUS: "Já Esteve nos EUA?",
  previousVisitsDetails: "Detalhes de Visitas Anteriores",
  hadUSDriverLicense: "Teve Carteira de Motorista dos EUA?",
  hadUSVisa: "Já Teve Visto Americano?",
  lastVisaDate: "Data do Último Visto",
  lastVisaNumber: "Número do Último Visto",
  sameVisaType: "Mesmo Tipo de Visto?",
  sameVisaCountry: "Mesmo País de Emissão?",
  tenPrinted: "Dez Digitais Coletadas?",
  visaLost: "Perdeu o Visto?",
  visaCancelled: "Visto Cancelado?",
  refusedUSVisa: "Teve Visto Negado?",
  refusedExpanation: "Explicação da Negativa",
  immigrationPetition: "Tem Petição de Imigração?",
  petitionExpanation: "Detalhes da Petição",
  // Contato
  homeStreet: "Endereço Residencial",
  homeCity: "Cidade",
  homeState: "Estado/Província",
  homeZip: "CEP",
  homeCountry: "País",
  differentMailingAddress: "Endereço de Correspondência Diferente?",
  mailingAddressFull: "Endereço de Correspondência",
  primaryPhone: "Telefone Principal",
  secondaryPhone: "Telefone Secundário",
  cellPhone: "Celular",
  otherPhones5Y: "Outros Telefones (5 Anos)?",
  otherPhonesList: "Lista de Outros Telefones",
  primaryEmail: "E-mail Principal",
  otherEmails5Y: "Outros E-mails (5 Anos)?",
  otherEmailList: "Lista de Outros E-mails",
  socialMediaAccounts: "Redes Sociais",
  // Família
  fatherName: "Nome do Pai",
  fatherBirth: "Data de Nascimento do Pai",
  fatherInUS: "Pai Está nos EUA?",
  fatherUSStatus: "Status do Pai nos EUA",
  motherName: "Nome da Mãe",
  motherBirth: "Data de Nascimento da Mãe",
  motherInUS: "Mãe Está nos EUA?",
  motherUSStatus: "Status da Mãe nos EUA",
  otherRelInUS: "Outros Parentes nos EUA?",
  spouseName: "Nome do Cônjuge",
  spouseBirth: "Data de Nascimento do Cônjuge",
  spouseCity: "Cidade de Nascimento do Cônjuge",
  spouseCountry: "País de Nascimento do Cônjuge",
  spouseSameAddress: "Cônjuge no Mesmo Endereço?",
  // Trabalho e Educação
  primaryJobSector: "Setor de Atuação",
  primaryJobEntity: "Empresa/Organização",
  primaryJobAddress: "Endereço da Empresa",
  primaryJobPhone: "Telefone da Empresa",
  primaryJobSalary: "Salário Mensal",
  primaryJobDuties: "Funções/Atribuições",
  employedLast5Y: "Empregado nos Últimos 5 Anos?",
  prevEmployerName: "Nome do Empregador Anterior",
  prevEmployerTitle: "Cargo Anterior",
  prevEmployerStart: "Início do Emprego Anterior",
  prevEmployerEnd: "Fim do Emprego Anterior",
  prevEmployerDuties: "Funções Anteriores",
  higherEducation: "Cursou Ensino Superior?",
  eduName: "Nome da Instituição",
  eduCourse: "Curso",
  eduStart: "Início do Curso",
  eduEnd: "Fim do Curso",
  belongsToTribe: "Pertence a Tribo/Clã?",
  fluentLanguages: "Idiomas Fluentes",
  countriesVisited5Y: "Países Visitados (5 Anos)",
  servedMilitary: "Serviu às Forças Armadas?",
  militaryBranch: "Ramo Militar",
  militarySpecialty: "Especialidade Militar",
  // Segurança
  securityExceptions: "Exceções de Segurança",
  securityExceptionsDetails: "Detalhes das Exceções",
};

const DS160_SECTIONS: Array<{ title: string; keys: string[] }> = [
  { title: "Entrevista",         keys: ["interviewLocation", "isBrazilian"] },
  { title: "Dados Pessoais",     keys: ["fullName", "surname", "givenName", "fullNameNativeAlphabet", "hasTelecodeForName", "maternalGrandmotherName", "hasOtherNames", "otherNames", "gender", "maritalStatus", "birthDate", "birthCity", "birthState", "birthCountry"] },
  { title: "Nacionalidade",      keys: ["hasOtherNationality", "otherNationalityDetails", "hasOtherResidence", "otherResidenceCountry", "cpf"] },
  { title: "Passaporte",         keys: ["passportNumber", "passportIssueDate", "passportExpDate", "lostPassport", "lostPassportNumber", "lostPassportExpanation"] },
  { title: "Viagem",             keys: ["travelPurpose", "specificTravelPlan", "arrivalDate", "arrivalFlight", "arrivalCity", "placesToVisit", "departureDate", "departureFlight", "departureCity", "estArrivalDate", "estStayLength", "usStayName", "usStayStreet", "usStayCity", "usStayState", "usStayZip", "payingTrip", "payerName", "payerRelation", "payerPhone", "payerEmail"] },
  { title: "Acompanhantes",      keys: ["travelingWithOthers", "travelGroup", "companionsDetails"] },
  { title: "Viagens Anteriores", keys: ["beenToUS", "previousVisitsDetails", "hadUSDriverLicense", "hadUSVisa", "lastVisaDate", "lastVisaNumber", "sameVisaType", "sameVisaCountry", "tenPrinted", "visaLost", "visaCancelled", "refusedUSVisa", "refusedExpanation", "immigrationPetition", "petitionExpanation"] },
  { title: "Contato",            keys: ["homeStreet", "homeCity", "homeState", "homeZip", "homeCountry", "differentMailingAddress", "mailingAddressFull", "primaryPhone", "secondaryPhone", "cellPhone", "otherPhones5Y", "otherPhonesList", "primaryEmail", "otherEmails5Y", "otherEmailList", "socialMediaAccounts"] },
  { title: "Família",            keys: ["fatherName", "fatherBirth", "fatherInUS", "fatherUSStatus", "motherName", "motherBirth", "motherInUS", "motherUSStatus", "otherRelInUS", "spouseName", "spouseBirth", "spouseCity", "spouseCountry", "spouseSameAddress"] },
  { title: "Trabalho e Educação",keys: ["primaryJobSector", "primaryJobEntity", "primaryJobAddress", "primaryJobPhone", "primaryJobSalary", "primaryJobDuties", "employedLast5Y", "prevEmployerName", "prevEmployerTitle", "prevEmployerStart", "prevEmployerEnd", "prevEmployerDuties", "higherEducation", "eduName", "eduCourse", "eduStart", "eduEnd", "belongsToTribe", "fluentLanguages", "countriesVisited5Y", "servedMilitary", "militaryBranch", "militarySpecialty"] },
  { title: "Segurança",          keys: ["securityExceptions", "securityExceptionsDetails"] },
];

const SYSTEM_KEYS = new Set(["docs", "admin_feedback", "rejected_items", "casv_preferred_date", "mrv_login", "mrv_password", "mrv_boleto_path", "mrv_payment_method", "mrv_payment_confirmed_at", "ds160_application_id", "ds160_security_answer", "ds160_birth_date"]);

function formatFieldValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (value === "sim") return "Sim";
  if (value === "nao") return "Não";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return JSON.stringify(value);
}

function DS160DataView({ data }: { data: Record<string, unknown> }) {
  const known = new Set(DS160_SECTIONS.flatMap((s) => s.keys));
  const extra = Object.keys(data).filter((k) => !known.has(k) && !SYSTEM_KEYS.has(k));

  return (
    <div className="space-y-6">
      {DS160_SECTIONS.map((section) => {
        const fields = section.keys
          .filter((k) => k in data && !SYSTEM_KEYS.has(k))
          .map((k) => ({ key: k, label: DS160_LABELS[k] ?? formatReviewItemLabel(k), value: data[k] }));

        if (fields.length === 0) return null;

        return (
          <div key={section.title}>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-primary border-b border-border pb-2">
              {section.title}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map(({ key, label, value }) => (
                <div key={key} className="rounded-xl border border-border bg-bg-subtle px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">{label}</p>
                  <p className={`mt-1 text-sm font-semibold break-words ${
                    value === "sim" ? "text-emerald-600" :
                    value === "nao" ? "text-slate-500" :
                    "text-text"
                  }`}>
                    {formatFieldValue(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {extra.length > 0 && (
        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted border-b border-border pb-2">
            Outros campos
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {extra.map((key) => (
              <div key={key} className="rounded-xl border border-border bg-bg-subtle px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
                  {DS160_LABELS[key] ?? formatReviewItemLabel(key)}
                </p>
                <p className="mt-1 text-sm font-semibold text-text break-words">
                  {formatFieldValue(data[key])}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── B1B2 Admin Panels ────────────────────────────────────────────────────────

function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">{label}</label>
      {children}
    </div>
  );
}

const fieldCls = "w-full px-4 py-3 rounded-2xl border border-border bg-bg-subtle text-sm font-semibold text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed";

function B1B2CredentialsPanel({
  procId, stepData, currentDBStep, isActive, onDone,
}: {
  procId: string;
  stepData: Record<string, unknown>;
  currentDBStep: number;
  isActive: boolean;
  onDone: () => Promise<void>;
}) {
  const [appId, setAppId] = useState((stepData.ds160_application_id as string) || "");
  const [motherName, setMotherName] = useState((stepData.ds160_security_answer as string) || (stepData.motherName as string) || "");
  const [birthDate, setBirthDate] = useState((stepData.ds160_birth_date as string) || (stepData.birthDate as string) || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAppId((stepData.ds160_application_id as string) || "");
    setMotherName((stepData.ds160_security_answer as string) || (stepData.motherName as string) || "");
    setBirthDate((stepData.ds160_birth_date as string) || (stepData.birthDate as string) || "");
  }, [stepData]);

  const handleSave = async () => {
    if (!appId || !motherName || !birthDate) {
      toast.error("Preencha todos os campos antes de continuar.");
      return;
    }
    setLoading(true);
    try {
      await processService.updateStepData(procId, {
        ds160_application_id: appId.trim().toUpperCase(),
        ds160_security_answer: motherName.trim().toUpperCase(),
        ds160_birth_date: birthDate.trim(),
      });
      await processService.approveStep(procId, currentDBStep + 1, false);
      toast.success("Credenciais salvas. Cliente avançou para revisão e assinatura.");
      await onDone();
    } catch {
      toast.error("Erro ao salvar credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-1">Emissão de Credenciais DS-160</p>
        <p className="text-sm text-text-muted">
          Preencha os dados de acesso que serão exibidos ao cliente para assinar e enviar a DS-160.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminField label="Application ID (CEAC)">
          <input
            type="text"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            disabled={!isActive}
            placeholder="Ex: AA00XXXXXX"
            className={fieldCls + " uppercase"}
          />
        </AdminField>
        <AdminField label="Resposta de Segurança (Nome da Mãe)">
          <input
            type="text"
            value={motherName}
            onChange={(e) => setMotherName(e.target.value)}
            disabled={!isActive}
            placeholder="Ex: SILVA"
            className={fieldCls + " uppercase"}
          />
        </AdminField>
        <AdminField label="Ano de Nascimento">
          <input
            type="text"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            disabled={!isActive}
            placeholder="Ex: 1990"
            className={fieldCls}
          />
        </AdminField>
      </div>

      {(appId || motherName || birthDate) && !isActive && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold text-emerald-700">Credenciais emitidas e enviadas ao cliente.</p>
        </div>
      )}

      {isActive && (
        <Button
          onClick={() => void handleSave()}
          disabled={loading}
          className="h-11 w-full rounded-2xl font-semibold"
        >
          {loading ? "Salvando…" : "✓ Salvar e Liberar para o Cliente"}
        </Button>
      )}
    </div>
  );
}

function B1B2AccountCreationPanel({
  procId, stepData, currentDBStep, isActive, onDone,
}: {
  procId: string;
  stepData: Record<string, unknown>;
  currentDBStep: number;
  isActive: boolean;
  onDone: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const email = (stepData.primaryEmail as string) || "Não informado";
  const name = (stepData.fullName as string) || "Não informado";
  const phone = (stepData.primaryPhone as string) || "Não informado";

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await processService.approveStep(procId, currentDBStep + 1, false);
      toast.success("Conta criada. Cliente notificado para confirmar e-mail.");
      await onDone();
    } catch {
      toast.error("Erro ao confirmar criação de conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-1">Criação de Conta no Portal Consular</p>
        <p className="text-sm text-text-muted">
          Crie a conta no site do Consulado usando os dados abaixo. Confirme quando concluído.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Nome Completo", value: name },
          { label: "E-mail", value: email },
          { label: "Telefone", value: phone },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-bg-subtle px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{label}</p>
            <p className="text-sm font-semibold text-text break-all">{value}</p>
          </div>
        ))}
      </div>

      {!isActive && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold text-emerald-700">Conta criada. Aguardando confirmação do cliente.</p>
        </div>
      )}

      {isActive && (
        <Button
          onClick={() => void handleConfirm()}
          disabled={loading}
          className="h-11 w-full rounded-2xl font-semibold"
        >
          {loading ? "Processando…" : "✓ Confirmar Criação de Conta"}
        </Button>
      )}
    </div>
  );
}

function B1B2MRVSetupPanel({
  procId, stepData, currentDBStep, isActive, onDone,
}: {
  procId: string;
  stepData: Record<string, unknown>;
  currentDBStep: number;
  isActive: boolean;
  onDone: () => Promise<void>;
}) {
  const [login, setLogin] = useState((stepData.mrv_login as string) || "");
  const [password, setPassword] = useState((stepData.mrv_password as string) || "");
  const [boletoPath, setBoletoPath] = useState((stepData.mrv_boleto_path as string) || "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLogin((stepData.mrv_login as string) || "");
    setPassword((stepData.mrv_password as string) || "");
    setBoletoPath((stepData.mrv_boleto_path as string) || "");
  }, [stepData]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${procId}/mrv/boleto_${crypto.randomUUID()}.${ext}`;
      const { error } = await getSupabaseClient()!.storage.from("aplikei-profiles").upload(path, file);
      if (error) throw new Error(error.message);
      setBoletoPath(path);
      toast.success("Boleto enviado com sucesso.");
    } catch {
      toast.error("Erro ao enviar boleto.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!login || !password || !boletoPath) {
      toast.error("Preencha login, senha e envie o boleto antes de continuar.");
      return;
    }
    setLoading(true);
    try {
      await processService.updateStepData(procId, {
        mrv_login: login.trim(),
        mrv_password: password.trim(),
        mrv_boleto_path: boletoPath,
        mrv_generated_at: new Date().toISOString(),
      });
      await processService.approveStep(procId, currentDBStep + 1, false);
      toast.success("Taxa MRV configurada. Cliente notificado para pagamento.");
      await onDone();
    } catch {
      toast.error("Erro ao salvar dados MRV.");
    } finally {
      setLoading(false);
    }
  };

  const boletoUrl = boletoPath
    ? getSupabaseClient()!.storage.from("aplikei-profiles").getPublicUrl(boletoPath).data.publicUrl
    : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-1">Configuração Taxa MRV</p>
        <p className="text-sm text-text-muted">
          Insira as credenciais de acesso ao portal MRV e faça upload do boleto da taxa consular.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Login MRV">
          <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} disabled={!isActive} placeholder="Login do portal MRV" className={fieldCls} />
        </AdminField>
        <AdminField label="Senha MRV">
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} disabled={!isActive} placeholder="Senha do portal MRV" className={fieldCls} />
        </AdminField>
      </div>

      <AdminField label="Boleto / Comprovante MRV (PDF)">
        {boletoPath ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-bg-subtle px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-text uppercase truncate">{boletoPath.split("/").pop()}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {boletoUrl && (
                <a href={boletoUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg border border-border bg-white text-[10px] font-black uppercase text-text-muted hover:text-primary transition-colors">
                  Ver
                </a>
              )}
              {isActive && (
                <button onClick={() => setBoletoPath("")} className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-[10px] font-black uppercase text-red-500">
                  Remover
                </button>
              )}
            </div>
          </div>
        ) : (
          <label className={`flex items-center justify-center gap-2 h-11 rounded-2xl border-2 border-dashed border-border text-xs font-black uppercase tracking-widest text-text-muted cursor-pointer hover:border-primary hover:text-primary transition-all ${!isActive ? "opacity-50 cursor-not-allowed" : ""}`}>
            {uploading ? "Enviando…" : "Selecionar PDF"}
            <input type="file" accept=".pdf" className="hidden" disabled={!isActive} onChange={(e) => e.target.files?.[0] && void handleUpload(e.target.files[0])} />
          </label>
        )}
      </AdminField>

      {!isActive && login && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold text-emerald-700">Taxa MRV configurada. Aguardando pagamento do cliente.</p>
        </div>
      )}

      {isActive && (
        <Button onClick={() => void handleSave()} disabled={loading || uploading} className="h-11 w-full rounded-2xl font-semibold">
          {loading ? "Salvando…" : "✓ Salvar e Notificar Cliente"}
        </Button>
      )}
    </div>
  );
}

function B1B2FinalAnalysisPanel({
  procId, stepData, currentDBStep, isActive, onDone,
}: {
  procId: string;
  stepData: Record<string, unknown>;
  currentDBStep: number;
  isActive: boolean;
  onDone: () => Promise<void>;
}) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const rawDocs = stepData.docs;
  const docs: Record<string, string> = (() => {
    if (!rawDocs) return {};
    if (typeof rawDocs === "string") {
      try { return JSON.parse(rawDocs) as Record<string, string>; } catch { return {}; }
    }
    if (typeof rawDocs === "object") return rawDocs as Record<string, string>;
    return {};
  })();

  const docEntries: Array<{ key: string; label: string; path: string }> = [
    { key: "ds160_assinada",    label: "DS-160 Assinada",         path: docs.ds160_assinada    ?? "" },
    { key: "ds160_comprovante", label: "Comprovante de Submissão", path: docs.ds160_comprovante ?? "" },
  ].filter((d) => d.path);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await processService.approveStep(procId, currentDBStep + 1, false);
      toast.success("Documentos aprovados. Cliente avançou para o agendamento CASV.");
      await onDone();
    } catch {
      toast.error("Erro ao aprovar etapa.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevision = async () => {
    if (!feedback.trim()) {
      toast.error("Descreva o que precisa ser corrigido.");
      return;
    }
    setLoading(true);
    try {
      await processService.updateStepData(procId, { admin_feedback: feedback.trim() });
      await processService.approveStep(procId, 3, false);
      await processService.updateProcessStatus(procId, "active");
      toast.success("Correção solicitada. DS-160 devolvida ao cliente.");
      setFeedback("");
      await onDone();
    } catch {
      toast.error("Erro ao solicitar correção.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-1">
            Documentos enviados pelo cliente
          </p>
          <p className="text-sm text-text-muted">
            Revise a DS-160 assinada e o comprovante de submissão do CEAC antes de aprovar.
          </p>
        </div>

        {docEntries.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {docEntries.map(({ key, label, path }) => {
              const url = getSupabaseClient()!.storage.from("aplikei-profiles").getPublicUrl(path).data.publicUrl;
              return (
                <div key={key} className="flex items-center gap-4 rounded-2xl border border-border bg-bg-subtle p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{label}</p>
                    <p className="text-xs font-semibold text-text truncate">{path.split("/").pop()}</p>
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 px-4 py-2 rounded-xl border border-border bg-white text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors"
                  >
                    Ver
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <p className="text-sm font-semibold text-amber-700">
              O cliente ainda não enviou os documentos desta etapa.
            </p>
          </div>
        )}

        {!isActive && docEntries.length > 0 && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-xs font-semibold text-emerald-700">Documentos aprovados pela equipe.</p>
          </div>
        )}
      </div>

      {isActive && docEntries.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-1">Ação do Admin</p>
            <p className="text-sm text-text-muted">
              Aprove para liberar o agendamento CASV, ou solicite correção dos documentos ao cliente.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
              Feedback para correção (obrigatório ao reprovar)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              disabled={loading}
              className="w-full rounded-2xl border border-border bg-bg-subtle px-4 py-3 text-sm text-text outline-none transition focus:border-primary disabled:opacity-50"
              placeholder="Ex: O comprovante de submissão está ilegível, por favor reenvie."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => void handleApprove()}
              disabled={loading}
              className="h-11 rounded-2xl px-6 font-semibold"
            >
              {loading ? "Processando…" : "✓ Aprovar Documentos"}
            </Button>
            <Button
              variant="outline"
              onClick={() => void handleRevision()}
              disabled={loading}
              className="h-11 rounded-2xl px-6 font-semibold"
            >
              Solicitar Correção
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function B1B2FinalSchedulingPanel({
  procId, stepData, currentDBStep, isActive, onDone,
}: {
  procId: string;
  stepData: Record<string, unknown>;
  currentDBStep: number;
  isActive: boolean;
  onDone: () => Promise<void>;
}) {
  const [casvDate, setCasvDate] = useState((stepData.final_casv_date as string) || "");
  const [casvTime, setCasvTime] = useState((stepData.final_casv_time as string) || "");
  const [casvLocation, setCasvLocation] = useState((stepData.final_casv_location as string) || (stepData.interviewLocation as string) || "");
  const [consuladoDate, setConsuladoDate] = useState((stepData.final_consulado_date as string) || "");
  const [consuladoTime, setConsuladoTime] = useState((stepData.final_consulado_time as string) || "");
  const [consuladoLocation, setConsuladoLocation] = useState((stepData.final_consulado_location as string) || (stepData.interviewLocation as string) || "");
  const [sameLocation, setSameLocation] = useState(stepData.final_same_location === undefined ? true : !!stepData.final_same_location);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSameLocation(stepData.final_same_location === undefined ? true : !!stepData.final_same_location);
  }, [stepData]);

  const handleUpdate = async () => {
    if (!casvDate || !casvTime || !casvLocation) {
      toast.error("Preencha data, horário e local do CASV.");
      return;
    }
    if (!sameLocation && (!consuladoDate || !consuladoTime || !consuladoLocation)) {
      toast.error("Preencha os dados do Consulado ou marque como mesmo local.");
      return;
    }
    try {
      await processService.updateStepData(procId, {
        final_same_location: sameLocation,
        final_casv_date: casvDate,
        final_casv_time: casvTime,
        final_casv_location: casvLocation,
        final_consulado_date: sameLocation ? casvDate : consuladoDate,
        final_consulado_time: sameLocation ? casvTime : consuladoTime,
        final_consulado_location: sameLocation ? casvLocation : consuladoLocation,
        final_scheduling_notified_at: new Date().toISOString(),
      });
      if (isActive) {
        await processService.approveStep(procId, currentDBStep + 1, false);
      }
      toast.success(isActive ? "Agendamento confirmado. Cliente notificado!" : "Agendamento atualizado com sucesso.");
      await onDone();
    } catch {
      toast.error("Erro ao salvar agendamento.");
    } finally {
      setLoading(false);
    }
  };

  const canEdit = isActive;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-1">Agendamento Final — CASV e Consulado</p>
        <p className="text-sm text-text-muted">Informe as datas e locais de convocação para notificar o cliente.</p>
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">CASV (Biometria)</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminField label="Data"><input type="date" value={casvDate} onChange={(e) => setCasvDate(e.target.value)} disabled={!canEdit} className={fieldCls} /></AdminField>
          <AdminField label="Horário"><input type="time" value={casvTime} onChange={(e) => setCasvTime(e.target.value)} disabled={!canEdit} className={fieldCls} /></AdminField>
          <AdminField label="Local / Endereço"><input type="text" value={casvLocation} onChange={(e) => setCasvLocation(e.target.value)} disabled={!canEdit} placeholder="Ex: Av. Paulista, 1000" className={fieldCls} /></AdminField>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="same-loc" checked={sameLocation} onChange={(e) => setSameLocation(e.target.checked)} disabled={!canEdit} className="h-4 w-4 rounded border-border text-primary" />
        <label htmlFor="same-loc" className="text-sm font-semibold text-text cursor-pointer">Consulado no mesmo local e data do CASV</label>
      </div>

      {!sameLocation && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Consulado (Entrevista)</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminField label="Data"><input type="date" value={consuladoDate} onChange={(e) => setConsuladoDate(e.target.value)} disabled={!canEdit} className={fieldCls} /></AdminField>
            <AdminField label="Horário"><input type="time" value={consuladoTime} onChange={(e) => setConsuladoTime(e.target.value)} disabled={!canEdit} className={fieldCls} /></AdminField>
            <AdminField label="Local / Endereço"><input type="text" value={consuladoLocation} onChange={(e) => setConsuladoLocation(e.target.value)} disabled={!canEdit} placeholder="Ex: Av. Paulista, 1000" className={fieldCls} /></AdminField>
          </div>
        </div>
      )}

    </div>
  );
}

function COSProposalPanel({
  procId, stepData, currentDBStep, isActive, onDone, type
}: {
  procId: string;
  stepData: Record<string, unknown>;
  currentDBStep: number;
  isActive: boolean;
  onDone: () => Promise<void>;
  type: 'rfe' | 'motion';
}) {
  const [text, setText] = useState((stepData[`${type}_proposal_text`] as string) || "");
  const [amount, setAmount] = useState((stepData[`${type}_proposal_amount`] as string) || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pText = (stepData[`${type}_proposal_text`] as string) || "";
    const pAmount = (stepData[`${type}_proposal_amount`] as string) || "";
    if (pText !== text) setText(pText);
    if (pAmount !== amount) setAmount(pAmount);
  }, [stepData, type, text, amount]);

  const handleSend = async () => {
    if (!text.trim() || !amount) {
      toast.error("Preencha o texto e o valor da proposta.");
      return;
    }
    setLoading(true);
    try {
      await processService.updateStepData(procId, {
        [`${type}_proposal_text`]: text.trim(),
        [`${type}_proposal_amount`]: Number(amount),
        [`${type}_proposal_sent_at`]: new Date().toISOString(),
      });
      await processService.approveStep(procId, currentDBStep + 1, false);
      toast.success("Proposta enviada ao cliente.");
      await onDone();
    } catch {
      toast.error("Erro ao enviar proposta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-1">
          Proposta de Execução ({type.toUpperCase()})
        </p>
        <p className="text-sm text-text-muted">
          Descreva o que será feito e o valor adicional para este serviço.
        </p>
      </div>

      <div className="space-y-4">
        <AdminField label="Texto da Proposta">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!isActive}
            rows={4}
            className="w-full px-4 py-3 rounded-2xl border border-border bg-bg-subtle text-sm font-semibold text-text outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Ex: Iremos preparar a resposta focando nos vínculos financeiros..."
          />
        </AdminField>
        <AdminField label="Valor da Proposta (USD)">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!isActive}
            className={fieldCls}
            placeholder="Ex: 150"
          />
        </AdminField>
      </div>

      {!isActive && text && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold text-emerald-700">Proposta enviada e aguardando aceite do cliente.</p>
        </div>
      )}

      {isActive && (
        <Button
          onClick={() => void handleSend()}
          disabled={loading}
          className="h-11 w-full rounded-2xl font-semibold"
        >
          {loading ? "Enviando…" : "✓ Enviar Proposta ao Cliente"}
        </Button>
      )}
    </div>
  );
}

function COSChatFinalizationPanel({
  procId, currentDBStep, isActive, onDone, type
}: {
  procId: string;
  stepData: Record<string, unknown>;
  currentDBStep: number;
  isActive: boolean;
  onDone: () => Promise<void>;
  type: 'rfe' | 'motion' | 'package';
}) {
  const [loading, setLoading] = useState(false);

  const handleFinalize = async () => {
    setLoading(true);
    try {
      await processService.approveStep(procId, currentDBStep + 1, false);
      toast.success("Etapa finalizada. O cliente agora pode informar o resultado final.");
      await onDone();
    } catch {
      toast.error("Erro ao finalizar etapa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-1">
          Finalização e Chat ({type.toUpperCase()})
        </p>
        <p className="text-sm text-text-muted">
          Após concluir o trabalho interno e alinhar via chat, finalize esta etapa para liberar o report de resultado ao cliente.
        </p>
      </div>

      {!isActive && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold text-emerald-700">Trabalho concluído. Aguardando report do cliente.</p>
        </div>
      )}

      {isActive && (
        <Button
          onClick={() => void handleFinalize()}
          disabled={loading}
          className="h-11 w-full rounded-2xl font-semibold"
        >
          {loading ? "Processando…" : "✓ Finalizar e Liberar para Report"}
        </Button>
      )}
    </div>
  );
}

const stepToneMap = {
  done: "green",
  in_progress: "amber",
  pending: "slate",
} as const;

const logToneMap = {
  info: "blue",
  warning: "amber",
  success: "green",
} as const;

const actorLabelMap = {
  customer: "Cliente",
  admin: "Admin",
  master: "Master",
  operator: "Operação",
  system: "Sistema",
} as const;

const stepIconMap = {
  done: CheckCircle2,
  in_progress: Clock3,
  pending: CircleDashed,
} as const;


function formatReviewItemLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function formatFriendlyValue(value: unknown): string | string[] {
  if (value == null || value === "") {
    return "Não informado";
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.map((item) => String(item)) : ["Não informado"];
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(
      ([key, entryValue]) => `${formatReviewItemLabel(key)}: ${formatFriendlyValue(entryValue)}`,
    );
  }

  return String(value);
}

function buildRevisionComment(feedback: string, items: string[]) {
  const parts: string[] = [];
  const normalizedFeedback = feedback.trim();

  if (normalizedFeedback) {
    parts.push(normalizedFeedback);
  }

  if (items.length > 0) {
    parts.push(`campos: ${items.join(", ")}`);
  }

  return parts.join(" | ");
}

export default function CaseOnboardingPage() {
  const { caseId } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const scope = location.pathname.startsWith("/admin") ? "admin" : "master";
  const backPath = `/${scope}/cases`;
  const [selectedRevisionItems, setSelectedRevisionItems] = useState<string[]>([]);
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [directFeedback, setDirectFeedback] = useState("");
  const [isDirectSubmitting, setIsDirectSubmitting] = useState(false);

  const { data: caseDetail, isLoading } = useQuery({
    queryKey: ["case-detail", caseId],
    queryFn: () => caseId ? caseService.getCaseDetail(caseId) : Promise.resolve(null),
    enabled: Boolean(caseId),
  });

  const { data: workflowReviewData } = useQuery({
    queryKey: ["case-workflow-review", caseId, user?.id],
    queryFn: async () => {
      if (!caseId || !user || caseId.startsWith("CASE-")) {
        return null;
      }

      // Query directly — bypasses the preferMockWorkflow flag in workflowService
      // so the admin always sees real submitted data from the customer.
      const { data: stepsData, error: stepsError } = await getSupabaseClient()!
        .schema("aplikei")
        .from("user_steps")
        .select("*, product_step:product_steps(*)")
        .eq("user_product_id", caseId)
        .order("product_step(order)", { ascending: true });

      if (stepsError || !stepsData || stepsData.length < 3) {
        return null;
      }

      // Fetch reviews for the first two steps (form + docs)
      const firstTwoIds = (stepsData as {id: string}[]).slice(0, 2).map((s) => s.id);
      const { data: reviewsData } = await getSupabaseClient()!
        .schema("aplikei")
        .from("step_reviews")
        .select("*")
        .in("user_step_id", firstTwoIds)
        .order("created_at", { ascending: false });

      return {
        steps: stepsData,
        reviews: reviewsData ?? [],
      };
    },
    enabled: Boolean(caseId && user && !caseId.startsWith("CASE-")),
  });

  const workflowSteps = workflowReviewData?.steps ?? [];
  const workflowReviews = workflowReviewData?.reviews ?? [];
  const formStep = workflowSteps[0];
  const docsStep = workflowSteps[1];
  const reviewStep = workflowSteps[2];

  const reviewableItems = useMemo(() => {
    const items: Array<{ id: string; label: string; scope: "form" | "docs"; meta?: string; url?: string }> = [];

    Object.keys(formStep?.data ?? {}).forEach((key) => {
      items.push({
        id: `form:${key}`,
        label: formatReviewItemLabel(key),
        scope: "form",
      });
    });

    (docsStep?.files ?? []).forEach((file) => {
      items.push({
        id: `docs:${file.name}`,
        label: formatReviewItemLabel(file.name),
        scope: "docs",
        meta: file.path,
        url: file.url,
      });
    });

    return items;
  }, [docsStep?.files, formStep?.data]);

  const lastRevisionReviews = useMemo(
    () => workflowReviews.filter((review) => review.action === "revision_requested"),
    [workflowReviews],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Link to={backPath}>
            <Button variant="outline" className="h-10 rounded-2xl px-4 font-semibold">
              <ArrowLeft className="h-4 w-4" />
              Voltar para cases
            </Button>
          </Link>
        </div>

        <DashboardSection title="Carregando case" description="Buscando detalhes do onboarding integrado.">
          <div className="rounded-2xl border border-border bg-bg-subtle p-4 text-sm text-text-muted">
            Preparando os dados do case...
          </div>
        </DashboardSection>
      </div>
    );
  }

  if (!caseId || !caseDetail?.record) {
    return <Navigate to={backPath} replace />;
  }

  const baseCase = caseDetail.record;
  const onboarding = caseDetail.onboarding;
  const isReviewResolved = reviewStep?.status === "completed" || (formStep?.status === "approved" && docsStep?.status === "approved");

  const toggleRevisionItem = (itemId: string) => {
    setSelectedRevisionItems((current) => (
      current.includes(itemId)
        ? current.filter((entry) => entry !== itemId)
        : [...current, itemId]
    ));
  };

  const handleApproveReview = async () => {
    if (!user || !formStep || !docsStep || !reviewStep) {
      return;
    }

    setIsReviewSubmitting(true);
    try {
      await ensureWorkflowBackend(user.id);

      if (formStep.status !== "approved") {
        await workflowService.approveStep(formStep.id, user.id, "Formulário inicial validado.");
      }

      if (docsStep.status !== "approved") {
        await workflowService.approveStep(docsStep.id, user.id, "Documentos validados.");
      }

      if (reviewStep.status !== "completed") {
        await workflowService.completeStep(reviewStep.id);
      }

      toast.success("Case aprovado e liberado para a próxima etapa.");
      setSelectedRevisionItems([]);
      setRevisionFeedback("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["case-detail", caseId] }),
        queryClient.invalidateQueries({ queryKey: ["case-workflow-review", caseId, user.id] }),
        queryClient.invalidateQueries({ queryKey: ["cases"] }),
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível aprovar o case.");
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!user || !formStep || !docsStep) {
      return;
    }

    const formItems = selectedRevisionItems
      .filter((item) => item.startsWith("form:"))
      .map((item) => item.replace("form:", ""));
    const docItems = selectedRevisionItems
      .filter((item) => item.startsWith("docs:"))
      .map((item) => item.replace("docs:", ""));

    if (formItems.length === 0 && docItems.length === 0) {
      toast.error("Selecione ao menos um item para solicitar reajuste.");
      return;
    }

    setIsReviewSubmitting(true);
    try {
      await ensureWorkflowBackend(user.id);

      if (formItems.length > 0) {
        await workflowService.requestRevision(
          formStep.id,
          user.id,
          buildRevisionComment(revisionFeedback, formItems),
        );
      }

      if (docItems.length > 0) {
        await workflowService.requestRevision(
          docsStep.id,
          user.id,
          buildRevisionComment(revisionFeedback, docItems),
        );
      }

      toast.success("Itens enviados para correção e reenvio do cliente.");
      setSelectedRevisionItems([]);
      setRevisionFeedback("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["case-detail", caseId] }),
        queryClient.invalidateQueries({ queryKey: ["case-workflow-review", caseId, user.id] }),
        queryClient.invalidateQueries({ queryKey: ["cases"] }),
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível reprovar o case.");
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const isDirectProcess = !!caseId && !caseId.startsWith("CASE-") && !workflowReviewData;

  const handleDirectApprove = async (procId: string, currentDBStep: number) => {
    setIsDirectSubmitting(true);
    try {
      await processService.approveStep(procId, currentDBStep + 1, false);
      toast.success("Etapa aprovada. Cliente avançou para a próxima fase.");
      setDirectFeedback("");
      await queryClient.invalidateQueries({ queryKey: ["case-detail", caseId] });
    } catch {
      toast.error("Não foi possível aprovar a etapa.");
    } finally {
      setIsDirectSubmitting(false);
    }
  };

  const handleDirectRevision = async (procId: string, feedback: string) => {
    if (!feedback.trim()) {
      toast.error("Descreva o que precisa ser corrigido antes de solicitar.");
      return;
    }
    setIsDirectSubmitting(true);
    try {
      await processService.updateStepData(procId, { admin_feedback: feedback.trim() });
      await processService.approveStep(procId, 0, false);
      await processService.updateProcessStatus(procId, "active");
      toast.success("Correção solicitada. DS-160 devolvida ao cliente.");
      setDirectFeedback("");
      await queryClient.invalidateQueries({ queryKey: ["case-detail", caseId] });
    } catch {
      toast.error("Não foi possível solicitar correção.");
    } finally {
      setIsDirectSubmitting(false);
    }
  };

  const renderStepContent = (step: CaseOnboardingStep, index: number) => {
    // Detect step type by title (real DB steps have UUID IDs, not pattern-based IDs)
    const titleLower = step.title.toLowerCase();
    const isFormStep = titleLower.includes("formulário") || titleLower.includes("formulario") || step.id.includes("_application_form");
    const isDocsStep = titleLower.includes("documento") || titleLower.includes("upload") || step.id.includes("_documents");
    const hasWorkflowReviewPanel = Boolean(formStep && docsStep && reviewStep);
    const isReviewStep = index === 2 && hasWorkflowReviewPanel;

    // ── COS workflow: documents step ─────────────────────────────────────────
    if (isDocsStep && !isReviewStep) {
      const workflowFiles = docsStep?.files ?? [];
      const legacyDocs = (step.receivedData as Record<string, unknown>)?.docs;
      const fallbackFiles =
        workflowFiles.length === 0 && legacyDocs && typeof legacyDocs === "object"
          ? Object.entries(legacyDocs as Record<string, string>).map(([name, path]) => ({
              name,
              path,
              url: path,
            }))
          : [];
      const files = workflowFiles.length > 0 ? workflowFiles : fallbackFiles;
      return (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Documentos enviados pelo cliente
          </p>
          {files.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {files.map((file) => (
                <div key={file.path} className="flex items-center gap-3 rounded-xl border border-border bg-bg-subtle p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-0.5">
                      {formatReviewItemLabel(file.name)}
                    </p>
                    <p className="text-xs font-semibold text-text truncate">{file.path.split("/").pop()}</p>
                  </div>
                  {file.url && (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 px-3 py-1.5 rounded-lg border border-border bg-white text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors"
                    >
                      Ver
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-bg-subtle p-3 text-sm text-text-muted">
              O cliente ainda não enviou os documentos desta etapa.
            </p>
          )}
        </div>
      );
    }

    // ── COS workflow: form step ───────────────────────────────────────────────
    if (isFormStep && !isReviewStep) {
      const fallbackFormData = Object.fromEntries(
        Object.entries(step.receivedData).filter(([k]) => !SYSTEM_KEYS.has(k) && k !== "docs"),
      );
      const formData = (formStep?.data && Object.keys(formStep.data).length > 0)
        ? formStep.data
        : fallbackFormData;
      return (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Dados preenchidos pelo cliente
          </p>
          {Object.keys(formData).length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(formData).map(([key, value]) => {
                const friendly = formatFriendlyValue(value);
                return (
                  <div key={key} className="rounded-xl border border-border bg-bg-subtle px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                      {formatReviewItemLabel(key)}
                    </p>
                    {Array.isArray(friendly) ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {friendly.map((v) => (
                          <span key={v} className="text-xs font-medium text-text bg-white rounded-full px-2 py-0.5 border border-border">
                            {v}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-text break-words">{friendly}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-xl bg-bg-subtle p-3 text-sm text-text-muted">
              Nenhum dado preenchido ainda.
            </p>
          )}
        </div>
      );
    }

    if (!isReviewStep) {
      const hasReceivedData = Object.keys(step.receivedData).filter((k) => !SYSTEM_KEYS.has(k)).length > 0;

      return (
        <div className="space-y-4">
          {Object.keys(step.sentData).length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted mb-3">Metadados da etapa</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(step.sentData).map(([k, v]) => (
                  <span key={k} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-subtle px-3 py-1 text-xs font-medium text-text">
                    <span className="font-bold text-text-muted">{formatReviewItemLabel(k)}:</span>
                    <span>{String(v ?? "—")}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {step.id.includes("admin_credentials") ? (
            <B1B2CredentialsPanel
              procId={caseId!}
              stepData={step.receivedData as Record<string, unknown>}
              currentDBStep={Number(step.sentData.current_step ?? 2)}
              isActive={step.status === "in_progress"}
              onDone={() => queryClient.invalidateQueries({ queryKey: ["case-detail", caseId] })}
            />
          ) : step.id.includes("admin_account_creation") ? (
            <B1B2AccountCreationPanel
              procId={caseId!}
              stepData={step.receivedData as Record<string, unknown>}
              currentDBStep={Number(step.sentData.current_step ?? 6)}
              isActive={step.status === "in_progress"}
              onDone={() => queryClient.invalidateQueries({ queryKey: ["case-detail", caseId] })}
            />
          ) : step.id.includes("admin_mrv_setup") ? (
            <B1B2MRVSetupPanel
              procId={caseId!}
              stepData={step.receivedData as Record<string, unknown>}
              currentDBStep={Number(step.sentData.current_step ?? 8)}
              isActive={step.status === "in_progress"}
              onDone={() => queryClient.invalidateQueries({ queryKey: ["case-detail", caseId] })}
            />
          ) : step.id.includes("admin_final_analysis") ? (
            <B1B2FinalAnalysisPanel
              procId={caseId!}
              stepData={step.receivedData as Record<string, unknown>}
              currentDBStep={Number(step.sentData.current_step ?? 4)}
              isActive={step.status === "in_progress"}
              onDone={() => queryClient.invalidateQueries({ queryKey: ["case-detail", caseId] })}
            />
          ) : step.id.includes("final_scheduling") ? (
            <B1B2FinalSchedulingPanel
              procId={caseId!}
              stepData={step.receivedData as Record<string, unknown>}
              currentDBStep={Number(step.sentData.current_step ?? 10)}
              isActive={step.status === "in_progress"}
              onDone={() => queryClient.invalidateQueries({ queryKey: ["case-detail", caseId] })}
            />
          ) : step.id.includes("cos_rfe_proposal") || step.id.includes("cos_motion_proposal") ? (
            <COSProposalPanel
              procId={caseId!}
              stepData={step.receivedData as Record<string, unknown>}
              currentDBStep={index}
              isActive={step.status === "in_progress"}
              type={step.id.includes("rfe") ? "rfe" : "motion"}
              onDone={() => queryClient.invalidateQueries({ queryKey: ["case-detail", caseId] })}
            />
          ) : step.id.includes("_chat_finalization") ? (
            <COSChatFinalizationPanel
              procId={caseId!}
              stepData={step.receivedData as Record<string, unknown>}
              currentDBStep={index}
              isActive={step.status === "in_progress"}
              type={step.id.includes("rfe") ? "rfe" : step.id.includes("motion") ? "motion" : "package"}
              onDone={() => queryClient.invalidateQueries({ queryKey: ["case-detail", caseId] })}
            />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-4">Dados preenchidos pelo cliente</p>
              {hasReceivedData ? (
                <DS160DataView data={step.receivedData as Record<string, unknown>} />
              ) : (
                <p className="rounded-xl bg-bg-subtle p-3 text-sm text-text-muted">Nenhum dado preenchido ainda.</p>
              )}
            </div>
          )}

          {isDirectProcess && step.status === "in_progress" && hasReceivedData && !step.id.includes("admin_credentials") && !step.id.includes("admin_account_creation") && !step.id.includes("admin_mrv_setup") && !step.id.includes("final_scheduling") && !step.id.includes("admin_final_analysis") && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-1">Ação do Admin</p>
                <p className="text-sm text-text-muted">
                  Aprove o formulário para avançar o cliente ou solicite correções com um feedback.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
                  Feedback para correção (obrigatório ao reprovar)
                </label>
                <textarea
                  value={directFeedback}
                  onChange={(e) => setDirectFeedback(e.target.value)}
                  rows={3}
                  disabled={isDirectSubmitting}
                  className="w-full rounded-2xl border border-border bg-bg-subtle px-4 py-3 text-sm text-text outline-none transition focus:border-primary disabled:opacity-50"
                  placeholder="Ex: O campo de passaporte está ilegível, por favor reenvie com dados corretos."
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    const procId = caseId!;
                    const currentDBStep = Number(step.sentData.current_step ?? 1);
                    void handleDirectApprove(procId, currentDBStep);
                  }}
                  disabled={isDirectSubmitting}
                  className="h-11 rounded-2xl px-6 font-semibold"
                >
                  {isDirectSubmitting ? "Processando…" : "✓ Aprovar DS-160"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void handleDirectRevision(caseId!, directFeedback)}
                  disabled={isDirectSubmitting}
                  className="h-11 rounded-2xl px-6 font-semibold"
                >
                  Solicitar Correção
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* ── Formulário do cliente (Step 1) ── */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Step 1 · Formulário preenchido pelo cliente
            </p>
            {formStep.status && (
              <StatusBadge label={formStep.status.replace("_", " ")} tone={formStep.status === "approved" ? "green" : "amber"} />
            )}
          </div>
          {Object.entries(formStep.data ?? {}).length === 0 ? (
            <p className="rounded-xl bg-bg-subtle p-3 text-sm text-text-muted">Cliente ainda não preencheu o formulário.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(formStep.data ?? {}).map(([key, value]) => {
                const friendly = formatFriendlyValue(value);
                return (
                  <div key={key} className="rounded-xl border border-border bg-bg-subtle px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-text-muted">
                      {formatReviewItemLabel(key)}
                    </p>
                    {Array.isArray(friendly) ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {friendly.map((v) => (
                          <span key={v} className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-text border border-border shadow-sm">
                            {v}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-text break-words">{friendly}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Documentos enviados (Step 2) ── */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Step 2 · Documentos enviados pelo cliente
            </p>
            {docsStep.status && (
              <StatusBadge label={docsStep.status.replace("_", " ")} tone={docsStep.status === "approved" ? "green" : "amber"} />
            )}
          </div>
          {(docsStep.files ?? []).length === 0 ? (
            <p className="rounded-xl bg-bg-subtle p-3 text-sm text-text-muted">Cliente ainda não enviou documentos.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {(docsStep.files ?? []).map((file) => (
                <div key={file.path} className="flex items-center gap-3 rounded-xl border border-border bg-bg-subtle px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-text-muted">
                      {formatReviewItemLabel(file.name)}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-text truncate">{file.path.split("/").pop()}</p>
                  </div>
                  {file.url && (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 px-3 py-1.5 rounded-lg border border-border bg-white text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors"
                    >
                      Ver
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Step 3 · Revisão</p>
              <p className="mt-1 text-sm text-text-muted">
                {isReviewResolved
                  ? "Revisão concluída. Os itens já foram aprovados e seguiram para a próxima etapa."
                  : "Selecione os itens que precisam de reajuste ou aprove o material para seguir o fluxo."}
              </p>
            </div>
            <StatusBadge label={reviewStep.status.replace("_", " ")} tone="amber" />
          </div>

          {!isReviewResolved ? (
            <>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {reviewableItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-bg-subtle p-4"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      checked={selectedRevisionItems.includes(item.id)}
                      onChange={() => toggleRevisionItem(item.id)}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text">{item.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-text-muted">
                        {item.scope === "form" ? "Formulário" : "Upload"}
                      </p>
                      {item.meta ? (
                        <p className="mt-1 break-all text-xs text-text-muted">{item.meta}</p>
                      ) : null}
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
                  Feedback do reajuste
                </label>
                <textarea
                  value={revisionFeedback}
                  onChange={(event) => setRevisionFeedback(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-border bg-bg-subtle px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                  placeholder="Descreva o que precisa ser corrigido antes do reenvio."
                />
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
              Revisão aprovada. Não há mais ações pendentes nesta etapa.
            </div>
          )}

          {lastRevisionReviews.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-border bg-bg-subtle p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted">Últimas revisões solicitadas</p>
              <div className="mt-3 space-y-3">
                {lastRevisionReviews.map((review: StepReview) => (
                  <div key={review.id} className="rounded-xl border border-border bg-card p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">
                      {formatDate(review.created_at)}
                    </p>
                    <p className="mt-2 text-sm text-text">{review.comment ?? "Sem comentário"}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {!isReviewResolved ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={() => void handleApproveReview()}
                disabled={isReviewSubmitting}
                className="h-11 rounded-2xl px-5 font-semibold"
              >
                Aprovar
              </Button>
              <Button
                variant="outline"
                onClick={() => void handleRequestRevision()}
                disabled={isReviewSubmitting}
                className="h-11 rounded-2xl px-5 font-semibold"
              >
                Reprovar e solicitar reajuste
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to={backPath}>
          <Button variant="outline" className="h-10 rounded-2xl px-4 font-semibold">
            <ArrowLeft className="h-4 w-4" />
            Voltar para cases
          </Button>
        </Link>
      </div>

      <DashboardPageHeader
        eyebrow="Case onboarding"
        title={`${baseCase.customer} • ${baseCase.id}`}
        description={`Fluxo de onboarding do case — ${baseCase.visaType}`}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <DashboardSection title="Resumo do onboarding" description="Leitura principal do case selecionado.">
          <div className="grid gap-4 md:grid-cols-2">
            <InlineMetric label="Tipo" value={baseCase.visaType} helper={`Owner ${baseCase.owner}`} />
            <InlineMetric label="Etapa atual" value={onboarding?.currentStage ?? "Em preparação"} helper={`Escopo ${scope}`} />
            <InlineMetric
              label="Checklist"
              value={onboarding ? `${onboarding.checklistCompletion}%` : "0%"}
              helper="Conclusão do onboarding"
            />
            <InlineMetric label="Prioridade" value={baseCase.priority} helper={`Atualizado em ${formatDate(baseCase.updatedAt)}`} />
          </div>

          <div className="mt-6">
            <Accordion type="single" collapsible className="space-y-4">
              {(onboarding?.steps ?? []).map((step, index) => {
                const Icon = stepIconMap[step.status];
                return (
                  <AccordionItem
                    key={step.id}
                    value={step.id}
                    className="overflow-hidden rounded-[1.5rem] border border-border bg-bg-subtle px-4"
                  >
                    <AccordionTrigger className="w-full py-4 hover:no-underline">
                      <div className="flex w-full items-center justify-between gap-4 pr-4 text-left">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card text-text-muted">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-text">{step.title}</p>
                            <p className="text-sm text-text-muted">Responsável: {step.owner}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusBadge label={step.status.replace("_", " ")} tone={stepToneMap[step.status]} />
                          <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-text-muted">{step.dueLabel}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      {renderStepContent(step, index)}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </DashboardSection>

        <div className="space-y-6">
          <DashboardSection title="Contexto" description="Informações rápidas para seguir o onboarding.">
            <div className="space-y-3">
              <div className="rounded-2xl border border-border bg-bg-subtle p-4">
                <div className="flex items-center gap-3">
                  <UserRound className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-text">Intake owner: {onboarding?.intakeOwner ?? baseCase.owner}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-bg-subtle p-4">
                <div className="flex items-center gap-3">
                  <FolderKanban className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-text">Status atual: {baseCase.status.replace("_", " ")}</p>
                </div>
              </div>
            </div>
          </DashboardSection>

          <DashboardSection title="Logs" description="Histórico operacional do onboarding.">
            <div className="space-y-3">
              {(onboarding?.logs ?? []).map((log) => (
                <div key={log.id} className="rounded-2xl border border-border bg-bg-subtle p-4">
                  <div className="flex items-center justify-between gap-3">
                    <StatusBadge label={log.level} tone={logToneMap[log.level]} />
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">{formatDate(log.createdAt)}</p>
                  </div>
                  <p className="mt-3 text-sm font-medium text-text">
                    <span className="font-bold">{log.actorName}</span> ({actorLabelMap[log.actorType]}) {log.action}.
                  </p>
                  {log.details ? (
                    <p className="mt-2 text-sm text-text-muted">{log.details}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </DashboardSection>

          <DashboardSection title="Timeline" description="Últimos eventos mockados do onboarding.">
            <div className="space-y-4">
              {(onboarding?.timeline ?? []).map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-bg-subtle p-4">
                  <p className="font-semibold text-text">{item.title}</p>
                  <p className="mt-1 text-sm text-text-muted">{item.description}</p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-text-muted">{formatDate(item.createdAt)}</p>
                </div>
              ))}
            </div>
          </DashboardSection>

          <DashboardSection title="Notas" description="Anotações rápidas do case.">
            <div className="space-y-3">
              {(onboarding?.notes ?? []).map((note) => (
                <div key={note} className="rounded-2xl border border-border bg-bg-subtle p-4 text-sm text-text-muted">
                  {note}
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
