import { RiBuildingLine, RiLoader4Line, RiSearchLine, RiShieldUserLine, RiUserLine } from "react-icons/ri";
import { STAFF_ROLES, type ManagedRole } from "../../../features/admin/roles/lib/rolesOps";
import { useAdminRoles } from "../../../features/admin/roles/hooks/useAdminRoles";
import { normalizeRole } from "../../../shared/auth/roles";
import { useT } from "../../../i18n";
import { OfficeModal } from "../../../features/admin/roles/components/OfficeModal";

export default function RolesPage() {
  const t = useT("admin");
  const {
    search,
    setSearch,
    isLoading,
    isSearching,
    isSavingId,
    users,
    selectedByUserId,
    roleOptions,
    activeUsersCount,
    officeByUserId,
    officeModalUser,
    isSavingOffice,
    currentUserId,
    handleSearchByEmail,
    handleRoleChange,
    handleOfficeConfirm,
    handleOfficeCancel,
    handleToggleActive,
    handleToggleOffice,
  } = useAdminRoles();

  return (
    <div className="p-8 pb-20 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8 text-left">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-text">{t.roles.title}</h1>
          <p className="text-sm text-text-muted mt-1 font-semibold">
            {t.roles.subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StatCard label={t.roles.stats.totalRoles} value={String(STAFF_ROLES.length)} />
        <StatCard label={t.roles.stats.activeUsers} value={String(activeUsersCount)} highlight />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-lg shadow-black/5 overflow-hidden">
        <div className="p-5 border-b border-border bg-bg-subtle/40">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative max-w-xl flex-1">
              <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSearchByEmail();
                }}
                placeholder={t.roles.searchPlaceholder}
                className="w-full h-12 pl-11 pr-4 bg-card border border-border rounded-xl text-sm font-medium text-text outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-left"
              />
            </div>
            <button
              onClick={() => void handleSearchByEmail()}
              disabled={isSearching}
              className="h-12 px-5 rounded-xl border border-border bg-card text-text text-xs font-black uppercase tracking-widest hover:bg-bg-subtle transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {isSearching ? <RiLoader4Line className="animate-spin text-base" /> : <RiSearchLine className="text-base" />}
              {t.roles.searchBtn}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-subtle/30">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-border">{t.roles.table.user}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-border">{t.roles.table.currentRole}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-border">{t.roles.table.status}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-border">{t.roles.table.role}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-border">{t.roles.table.office}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-border text-right">{t.roles.table.actions}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-text-muted font-bold">
                    <span className="inline-flex items-center gap-2">
                      <RiLoader4Line className="animate-spin" />
                      {t.roles.table.loading}
                    </span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-text-muted font-bold">
                    {t.roles.table.noResults}
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const selectedRole =
                    selectedByUserId[user.id] ||
                    (roleOptions.some((opt) => opt.value === user.role) ? user.role : "customer");
                  const isSelf = user.id === currentUserId;

                  return (
                    <tr key={user.id} className={`border-b border-border ${isSelf ? "opacity-50" : ""}`}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl border border-border bg-bg-subtle flex items-center justify-center text-text-muted shrink-0">
                            <RiUserLine className="text-lg" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-text uppercase tracking-tight truncate">{user.full_name || t.roles.table.noName}</p>
                            <p className="text-xs text-text-muted font-semibold truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-bg-subtle border border-border text-[11px] font-black text-text-muted uppercase tracking-wider">
                          {(t.shared.roleLabels as any)[normalizeRole(user.role)] || user.role}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider ${
                            user.is_active === false
                              ? "bg-danger/10 text-danger border-danger/20"
                              : "bg-success/10 text-success border-success/20"
                          }`}
                        >
                          {user.is_active === false ? t.roles.table.inactive : t.roles.table.active}
                        </span>
                      </td>

                      <td className="px-6 py-5 min-w-[200px]">
                        <div className="relative">
                          <RiShieldUserLine className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                          <select
                            value={selectedRole}
                            onChange={(e) => void handleRoleChange(user, e.target.value as ManagedRole)}
                            className="w-full h-11 pl-10 pr-10 bg-card border border-border rounded-xl text-xs font-black uppercase tracking-widest text-text outline-none focus:border-primary/30"
                            disabled={isSavingId === user.id || isSelf}
                          >
                            {roleOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {(t.shared.roleLabels as any)[opt.value] || opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        {(() => {
                          const office = officeByUserId[user.id];
                          const hasOffice = Boolean(office);
                          return (
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                role="switch"
                                aria-checked={hasOffice}
                                onClick={() => void handleToggleOffice(user)}
                                disabled={isSavingId === user.id || isSelf}
                                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                                  hasOffice ? "bg-primary" : "bg-border"
                                }`}
                              >
                                <span
                                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                    hasOffice ? "left-6" : "left-1"
                                  }`}
                                />
                              </button>
                              {hasOffice ? (
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <RiBuildingLine className="text-primary shrink-0 text-sm" />
                                  <span className="text-xs font-black text-text truncate max-w-[120px]">{office.name}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-text-muted font-medium">{t.roles.table.noOffice}</span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={user.is_active !== false}
                          onClick={() => void handleToggleActive(user)}
                          disabled={isSavingId === user.id || isSelf}
                          className={`relative h-7 w-12 rounded-full transition-colors disabled:opacity-50 ${
                            user.is_active === false ? "bg-border" : "bg-success"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                              user.is_active === false ? "left-1" : "left-6"
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {officeModalUser && (
        <OfficeModal
          user={officeModalUser}
          onConfirm={handleOfficeConfirm}
          onCancel={handleOfficeCancel}
          isSaving={isSavingOffice}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-left">
      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</p>
      <p className={`text-2xl font-black mt-1 tracking-tight ${highlight ? "text-primary" : "text-text"}`}>{value}</p>
    </div>
  );
}
