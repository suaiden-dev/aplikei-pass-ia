import { useState } from "react";
import {
  RiCheckLine,
  RiCloseLine,
  RiLink,
  RiLoader4Line,
  RiTeamLine,
  RiTimeLine,
  RiUserLine,
} from "react-icons/ri";
import { toast } from "sonner";
import { useTeams } from "@features/admin/hooks/useTeams";
import type { TeamRole } from "@features/admin/services/teamsOps";
import { normalizeRole } from "@features/auth/lib/roles";
import { useT } from "@app/app/i18n";

type TeamMemberRole = TeamRole | "admin";
type TeamMemberRow = {
  id: string;
  full_name?: string;
  email: string;
  role: TeamMemberRole;
  created_at: string;
};

export default function TeamsPage() {
  const t = useT("admin");
  const {
    members,
    pending,
    officeId,
    setOfficeId,
    offices,
    currentOffice,
    isLoading,
    savingId,
    isMaster,
    handleActivate,
    handleReject,
    handleUpdateRole,
    handleRemoveMember,
  } = useTeams();
  const teamMembers = members as TeamMemberRow[];

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<TeamRole>("seller");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const managers = teamMembers.filter((m) => normalizeRole(m.role) === "manager");
  const sellers = teamMembers.filter((m) => normalizeRole(m.role) === "seller");

  const handleGenerateLink = () => {
    if (!officeId) return;
    const url = `${window.location.origin}/cadastro?role=${selectedRole}&officeId=${officeId}`;
    setGeneratedLink(url);
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    void navigator.clipboard.writeText(generatedLink);
    toast.success(t.teams.copySuccess);
  };

  const handleCloseModal = () => {
    setShowLinkModal(false);
    setGeneratedLink(null);
    setSelectedRole("seller");
  };

  const roleLabel = (role: string) => {
    const norm = normalizeRole(role);
    return t.teams.roles[norm as keyof typeof t.teams.roles] || role;
  };

  return (
    <div className="p-8 pb-20 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black tracking-tight text-text uppercase">{t.teams.title}</h1>
            {currentOffice && (
              <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                {currentOffice.name}
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted font-semibold">
            {t.teams.subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {isMaster && offices.length > 0 && (
            <div className="relative min-w-[200px]">
              <label className="absolute -top-2 left-3 bg-bg px-2 text-[9px] font-black text-primary uppercase tracking-widest z-10">
                {t.teams.selectOffice}
              </label>
              <select
                value={officeId || ""}
                onChange={(e) => setOfficeId(e.target.value)}
                className="w-full h-12 pl-4 pr-10 bg-card border border-border rounded-2xl text-sm font-bold text-text outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all appearance-none cursor-pointer"
              >
                {offices.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                <RiUserLine className="rotate-90 text-xs" />
              </div>
            </div>
          )}

          <button
            onClick={() => setShowLinkModal(true)}
            disabled={!officeId}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
          >
            <RiLink className="text-lg" />
            {t.teams.generateLinkBtn}
          </button>
        </div>
      </div>

      {/* Main Sections */}
      <div className="space-y-16">
        {/* Pending Requests Section - Now as a Table */}
        {pending.length > 0 && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning shadow-inner">
                  <RiTimeLine className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-text">{t.teams.pending.title}</h2>
                  <p className="text-xs text-text-muted font-bold uppercase tracking-widest opacity-70">{t.teams.pending.subtitle}</p>
                </div>
              </div>
              <span className="bg-warning text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-warning/20 animate-pulse">
                {t.teams.pending.newBadge.replace("{{count}}", pending.length.toString())}
              </span>
            </div>
            
            <div className="rounded-3xl border-2 border-warning/20 bg-card shadow-2xl shadow-warning/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-warning/5">
                      <Th>{t.teams.pending.table.candidate}</Th>
                      <Th>{t.teams.pending.table.requestedRole}</Th>
                      <Th>{t.teams.pending.table.requestDate}</Th>
                      <Th right>{t.teams.pending.table.actions}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((p) => (
                      <tr key={p.id} className="border-b border-border hover:bg-warning/[0.02] transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl border border-warning/20 bg-warning/5 flex items-center justify-center text-warning">
                              <RiUserLine className="text-xl" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-text uppercase tracking-tight">{p.full_name || t.teams.table.noName}</p>
                              <p className="text-xs text-text-muted font-semibold">{p.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <RoleBadge role={p.role} />
                        </td>
                        <td className="px-8 py-6 text-xs text-text-muted font-bold">
                          {new Date(p.created_at).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => void handleActivate(p.id)}
                              disabled={savingId === p.id}
                              className="h-10 px-5 rounded-xl bg-success text-white text-[10px] font-black uppercase tracking-widest hover:bg-success/90 transition-all shadow-lg shadow-success/20 flex items-center gap-2 disabled:opacity-50"
                            >
                              {savingId === p.id ? <RiLoader4Line className="animate-spin" /> : <RiCheckLine className="text-base" />}
                              {t.teams.pending.approveBtn}
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(t.teams.pending.rejectConfirm)) {
                                  void handleReject(p.id);
                                }
                              }}
                              disabled={savingId === p.id}
                              className="h-10 px-5 rounded-xl border border-border bg-card text-text-muted text-[10px] font-black uppercase tracking-widest hover:bg-danger hover:text-white hover:border-danger transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                              {savingId === p.id ? <RiLoader4Line className="animate-spin" /> : <RiCloseLine className="text-base" />}
                              {t.teams.pending.rejectBtn}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Managers Table */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <RiUserLine className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-text">{t.teams.managers.title}</h2>
              <p className="text-xs text-text-muted font-bold uppercase tracking-widest opacity-70">{t.teams.managers.subtitle}</p>
            </div>
          </div>
          <MemberTable 
            members={managers} 
            isLoading={isLoading} 
            savingId={savingId} 
            onUpdateRole={handleUpdateRole} 
            onRemove={handleRemoveMember} 
            t={t}
          />
        </section>

        {/* Sellers Table */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
              <RiTeamLine className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-text">{t.teams.sellers.title}</h2>
              <p className="text-xs text-text-muted font-bold uppercase tracking-widest opacity-70">{t.teams.sellers.subtitle}</p>
            </div>
          </div>
          <MemberTable 
            members={sellers} 
            isLoading={isLoading} 
            savingId={savingId} 
            onUpdateRole={handleUpdateRole} 
            onRemove={handleRemoveMember} 
            t={t}
          />
        </section>
      </div>

      {/* Registration Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl p-8 animate-in fade-in zoom-in duration-300 text-left">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-text uppercase">{t.teams.modal.title}</h2>
                <p className="text-sm text-text-muted mt-2 font-medium" dangerouslySetInnerHTML={{ __html: t.teams.modal.description }} />
              </div>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-text-muted hover:text-text hover:bg-bg-subtle transition-all"
              >
                <RiCloseLine className="text-xl" />
              </button>
            </div>

            {!generatedLink ? (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">
                    {t.teams.modal.defineRole}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {(["seller", "manager"] as TeamRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => setSelectedRole(r)}
                        className={`group relative overflow-hidden h-20 rounded-2xl border-2 transition-all ${
                          selectedRole === r
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-bg-subtle text-text-muted hover:border-border-strong"
                        }`}
                      >
                        <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                          {r === 'manager' ? <RiUserLine className="text-lg" /> : <RiTeamLine className="text-lg" />}
                          <span className="text-sm font-black uppercase tracking-tight">{roleLabel(r)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleGenerateLink}
                  className="w-full h-14 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                >
                  <RiLink className="text-xl" />
                  {t.teams.modal.generateBtn}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl border border-success/30 bg-success/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-success mb-3">
                    {t.teams.modal.linkTitle.replace("{{role}}", roleLabel(selectedRole))}
                  </p>
                  <div className="bg-card border border-success/10 p-3 rounded-xl break-all">
                    <p className="text-xs font-mono text-text-muted leading-relaxed">{generatedLink}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleCopyLink}
                    className="w-full h-14 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    {t.teams.modal.copyBtn}
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="w-full h-12 rounded-xl text-sm font-black text-text-muted hover:text-text transition-all"
                  >
                    {t.teams.modal.backBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MemberTable({ 
  members, 
  isLoading, 
  savingId, 
  onUpdateRole,
  onRemove,
  t
}: { 
  members: TeamMemberRow[]; 
  isLoading: boolean; 
  savingId: string | null;
  onUpdateRole: (id: string, role: TeamRole) => void;
  onRemove: (id: string) => void;
  t: ReturnType<typeof useT>;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card shadow-xl shadow-black/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-subtle/40">
              <Th>{t.teams.table.member}</Th>
              <Th>{t.teams.table.changeRole}</Th>
              <Th>{t.teams.table.joinDate}</Th>
              <Th right>{t.teams.table.actions}</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <LoadingRow cols={4} t={t} />
            ) : members.length === 0 ? (
              <EmptyRow cols={4} message={t.teams.table.noMembers} />
            ) : (
              members.map((m) => (
                <tr key={m.id} className="border-b border-border hover:bg-bg-subtle/20 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-2xl border border-border bg-bg-subtle flex items-center justify-center text-text-muted shadow-sm">
                        <RiUserLine className="text-xl" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-text uppercase tracking-tight">
                          {m.full_name || t.teams.table.noName}
                        </p>
                        <p className="text-xs text-text-muted font-semibold">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-left">
                    <select
                      value={m.role}
                      onChange={(e) => onUpdateRole(m.id, e.target.value as TeamRole)}
                      disabled={savingId === m.id}
                      className="h-10 px-3 rounded-xl border border-border bg-bg-subtle text-[10px] font-black uppercase tracking-widest text-text-muted outline-none focus:border-primary/30 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <option value="seller">{t.teams.roles.seller}</option>
                      <option value="manager">{t.teams.roles.manager}</option>
                      {m.role === 'admin' && <option value="admin">Legacy Admin</option>}
                    </select>
                  </td>
                  <td className="px-8 py-6 text-xs text-text-muted font-bold">
                    {new Date(m.created_at).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => void onRemove(m.id)}
                      disabled={savingId === m.id}
                      className="group inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-xs font-black text-text-muted hover:text-danger hover:border-danger/30 transition-all disabled:opacity-50"
                    >
                      {savingId === m.id ? (
                        <RiLoader4Line className="animate-spin" />
                      ) : (
                        <RiCloseLine className="text-sm group-hover:scale-110 transition-transform" />
                      )}
                      {t.teams.table.removeBtn}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoleBadge({ role, size = "default" }: { role: string; size?: "small" | "default" }) {
  const t = useT("admin");
  const norm = normalizeRole(role);
  const isSeller = norm === "seller";
  const label = t.teams.roles[norm as keyof typeof t.teams.roles] || role;
  
  return (
    <span
      className={`inline-flex items-center rounded-full border font-black uppercase tracking-wider ${
        size === "small" ? "px-2 py-0.5 text-[9px]" : "px-4 py-1.5 text-[10px]"
      } ${
        isSeller
          ? "bg-secondary/10 text-secondary border-secondary/20"
          : "bg-primary/10 text-primary border-primary/20"
      }`}
    >
      {label}
    </span>
  );
}

function Th({ children, right = false }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-border ${right ? "text-right" : ""}`}
    >
      {children}
    </th>
  );
}

function LoadingRow({ cols, t }: { cols: number; t: ReturnType<typeof useT> }) {
  return (
    <tr>
      <td colSpan={cols} className="px-6 py-14 text-center text-text-muted font-bold">
        <span className="inline-flex items-center gap-2">
          <RiLoader4Line className="animate-spin" />
          {t.teams.table.loading}
        </span>
      </td>
    </tr>
  );
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-6 py-14 text-center text-text-muted font-bold">
        {message}
      </td>
    </tr>
  );
}
