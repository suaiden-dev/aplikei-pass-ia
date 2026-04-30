import { useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, ClipboardList, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/Button";
import {
  DashboardPageHeader,
  DashboardSection,
  DashboardToolbar,
  KpiCard,
  StatusBadge,
  ToolbarPill,
} from "../../components/master/DashboardUI";
import { caseService } from "../../services/case.service";
import type { CaseStatus } from "../../models/case.model";
import { formatDate } from "../../utils/format";

type CaseStatusFilter = "all" | CaseStatus;

const statusFilters: Array<{ value: CaseStatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "in_review", label: "Em revisão" },
  { value: "docs_pending", label: "Docs pendentes" },
  { value: "attention", label: "Atenção" },
  { value: "approved", label: "Aprovados" },
];

const statusToneMap = {
  in_review: "purple",
  docs_pending: "amber",
  attention: "red",
  approved: "green",
} as const;

const statusLabelMap = {
  in_review: "Em revisão",
  docs_pending: "Docs pendentes",
  attention: "Atenção",
  approved: "Aprovado",
} as const;

export default function CasesPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<CaseStatusFilter>("all");
  const { data: cases = [] } = useQuery({
    queryKey: ["cases"],
    queryFn: () => caseService.listCases(),
  });

  const approvedCount = cases.filter((item) => item.status === "approved").length;
  const pendingDocsCount = cases.filter((item) => item.status === "docs_pending").length;
  const attentionCount = cases.filter((item) => item.status === "attention").length;

  const filteredCases = useMemo(() => {
    if (activeFilter === "all") {
      return cases;
    }

    return cases.filter((item) => item.status === activeFilter);
  }, [activeFilter, cases]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Operação"
        title="Cases"
        description="Tabela operacional para acompanhar processos e filtrar rapidamente por status."
        actions={(
          <Button className="h-11 rounded-2xl px-4 font-semibold">
            <PlusCircle className="h-4 w-4" />
            Novo case
          </Button>
        )}
      />

      <DashboardToolbar>
        <div className="flex flex-wrap items-center gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className="cursor-pointer"
            >
              <ToolbarPill label={filter.label} active={activeFilter === filter.value} />
            </button>
          ))}
        </div>
      </DashboardToolbar>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Cases ativos" value={String(cases.length)} delta="Carteira atual" icon={ClipboardList} />
        <KpiCard label="Aprovados" value={String(approvedCount)} delta="Fluxo concluído" icon={BadgeCheck} />
        <KpiCard label="Em atenção" value={String(attentionCount + pendingDocsCount)} delta="Prioridade alta" icon={AlertTriangle} />
      </div>

      <DashboardSection
        title="Cases list"
        description={`${filteredCases.length} ${filteredCases.length === 1 ? "registro encontrado" : "registros encontrados"} no filtro atual.`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-text-muted">
              <tr>
                <th className="pb-3 pr-4 font-semibold">Cliente</th>
                <th className="pb-3 pr-4 font-semibold">Tipo</th>
                <th className="pb-3 pr-4 font-semibold">Owner</th>
                <th className="pb-3 pr-4 font-semibold">Etapa atual</th>
                <th className="pb-3 pr-4 font-semibold">Prioridade</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-text-muted">
                    Nenhum case encontrado para o filtro atual.
                  </td>
                </tr>
              ) : (
                filteredCases.map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer border-t border-border align-top transition-colors hover:bg-bg-subtle/70"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(item.id);
                      }
                    }}
                  >
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-text">{item.customer}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-text-muted">{item.id}</p>
                    </td>
                    <td className="py-4 pr-4 text-text-muted">{item.visaType}</td>
                    <td className="py-4 pr-4 text-text-muted">{item.owner}</td>
                    <td className="py-4 pr-4 text-text-muted">{item.currentStep ?? "—"}</td>
                    <td className="py-4 pr-4">
                      <StatusBadge
                        label={item.priority}
                        tone={item.priority === "high" ? "red" : item.priority === "medium" ? "amber" : "blue"}
                      />
                    </td>
                    <td className="py-4 pr-4">
                      <StatusBadge label={statusLabelMap[item.status]} tone={statusToneMap[item.status]} />
                    </td>
                    <td className="py-4 text-text-muted">{formatDate(item.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardSection>
    </div>
  );
}
