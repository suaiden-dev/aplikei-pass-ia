import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../../hooks/useAuth";
import { supabase } from "../../../../shared/lib/supabase";
import {
  fetchStaffUsers,
  searchUsersByEmail,
  updateUserActive,
  updateUserRole,
  type ManagedRole,
  type UserAccountRow,
} from "../lib/rolesOps";
import { normalizeRole } from "../../../../shared/auth/roles";
import { assignOfficeOwner, upsertOffice, unassignOfficeOwner, listOffices, setUserOffice, type OfficeRow } from "../lib/officeOps";

export function useAdminRoles() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserAccountRow[]>([]);
  const [selectedByUserId, setSelectedByUserId] = useState<Record<string, ManagedRole>>({});
  const [officeModalUser, setOfficeModalUser] = useState<UserAccountRow | null>(null);
  const [pendingRole, setPendingRole] = useState<ManagedRole | null>(null);
  const [isSavingOffice, setIsSavingOffice] = useState(false);
  const [officeByUserId, setOfficeByUserId] = useState<Record<string, OfficeRow>>({});

  const roleOptions = useMemo<Array<{ label: string; value: ManagedRole }>>(() => {
    const all: Array<{ label: string; value: ManagedRole }> = [
      { label: "Master", value: "master" },
      { label: "Admin Lawyer", value: "admin_lawyer" },
      { label: "Manager", value: "manager" },
      { label: "Seller", value: "seller" },
      { label: "Customer", value: "customer" },
    ];

    if (currentUser?.role === "admin_lawyer") {
      return all.filter((opt) => opt.value !== "admin_lawyer");
    }

    return all;
  }, [currentUser?.role]);

  const syncSelectedRoles = useCallback((rows: UserAccountRow[]) => {
    const nextSelected: Record<string, ManagedRole> = {};
    for (const row of rows) {
      const normalized = normalizeRole(row.role) as ManagedRole;
      if (roleOptions.some((opt) => opt.value === normalized)) {
        nextSelected[row.id] = normalized;
      }
    }
    setSelectedByUserId(nextSelected);
  }, []);

  const loadStaffUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rows, offices] = await Promise.all([fetchStaffUsers(), listOffices()]);
      setUsers(rows);
      syncSelectedRoles(rows);

      // Build officeByUserId from offices (owner_id) as the base
      const byOwner = Object.fromEntries(
        offices.filter((o) => o.owner_id).map((o) => [o.owner_id, o]),
      );

      // Also fetch office_id from user_accounts for managers/sellers not covered above
      const userIds = rows.map((r) => r.id).filter((id) => !byOwner[id]);
      let byAccount: Record<string, OfficeRow> = {};
      if (userIds.length > 0) {
        const { data: accountRows } = await supabase
          .from("user_accounts")
          .select("id, office_id, offices(id, name, slug, address, phone, owner_id)")
          .in("id", userIds)
          .not("office_id", "is", null);

        (accountRows as Array<{ id: string; offices: OfficeRow | null }> | null)?.forEach((r) => {
          if (r.offices) byAccount[r.id] = r.offices;
        });
      }

      setOfficeByUserId({ ...byOwner, ...byAccount });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar usuários staff.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [syncSelectedRoles]);

  useEffect(() => {
    void loadStaffUsers();
  }, [loadStaffUsers]);

  const activeUsersCount = useMemo(
    () => users.filter((u) => u.is_active !== false).length,
    [users],
  );

  const handleSearchByEmail = useCallback(async () => {
    const term = search.trim().toLowerCase();
    if (!term) {
      await loadStaffUsers();
      return;
    }

    setIsSearching(true);
    try {
      const rows = await searchUsersByEmail(term);
      setUsers(rows);
      syncSelectedRoles(rows);
      if (rows.length === 0) toast.error("Nenhum usuário encontrado para este e-mail.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao buscar usuário por e-mail.";
      toast.error(message);
    } finally {
      setIsSearching(false);
    }
  }, [loadStaffUsers, search, syncSelectedRoles]);

  const commitRoleChange = useCallback(async (user: UserAccountRow, nextRole: ManagedRole) => {
    setIsSavingId(user.id);
    try {
      await updateUserRole(user.id, nextRole);
      setSelectedByUserId((prev) => ({ ...prev, [user.id]: nextRole }));
      setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, role: nextRole } : item)));
      toast.success("Role atualizada com sucesso.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar alteração.";
      toast.error(message);
    } finally {
      setIsSavingId(null);
    }
  }, []);

  const handleRoleChange = useCallback(async (user: UserAccountRow, nextRole: ManagedRole) => {
    if (currentUser?.role === "admin_lawyer" && nextRole === "admin_lawyer") {
      toast.error("Admin Lawyer não pode promover usuários para Admin Lawyer.");
      return;
    }

    if (nextRole === "admin_lawyer") {
      setPendingRole(nextRole);
      setOfficeModalUser(user);
      return;
    }

    await commitRoleChange(user, nextRole);
  }, [commitRoleChange, currentUser?.role]);

  const handleOfficeConfirm = useCallback(async (
    officeData: { mode: "existing"; officeId: string; forceReplace: boolean } | { mode: "create"; name: string },
  ) => {
    if (!officeModalUser) return;

    setIsSavingOffice(true);
    try {
      // pendingRole set → role-change flow (admin_lawyer): creates/transfers office ownership
      // pendingRole null → toggle flow: only links user_accounts.office_id, no ownership change
      if (pendingRole === "admin_lawyer") {
        let savedOffice: OfficeRow;
        if (officeData.mode === "create") {
          savedOffice = await upsertOffice({ name: officeData.name, owner_id: officeModalUser.id });
        } else {
          savedOffice = await assignOfficeOwner({
            officeId: officeData.officeId,
            ownerId: officeModalUser.id,
            forceReplace: officeData.forceReplace,
          });
        }
        await setUserOffice(officeModalUser.id, savedOffice.id);
        setOfficeByUserId((prev) => ({ ...prev, [officeModalUser.id]: savedOffice }));
        await commitRoleChange(officeModalUser, pendingRole);
      } else {
        // Toggle mode: just link the user to an existing office
        if (officeData.mode !== "existing") return;
        const { data: officeRow } = await supabase
          .from("offices")
          .select("id, name, slug, address, phone, owner_id")
          .eq("id", officeData.officeId)
          .single();
        if (!officeRow) {
          toast.error("Office não encontrado.");
          return;
        }
        await setUserOffice(officeModalUser.id, officeData.officeId);
        setOfficeByUserId((prev) => ({ ...prev, [officeModalUser.id]: officeRow as OfficeRow }));
        toast.success("Office atribuído com sucesso.");
      }

      setOfficeModalUser(null);
      setPendingRole(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.name === "OFFICE_NAME_ALREADY_EXISTS"
          ? "Já existe um office com esse nome."
          : err instanceof Error
            ? err.message
            : "Erro ao salvar escritório.";
      toast.error(message);
    } finally {
      setIsSavingOffice(false);
    }
  }, [commitRoleChange, officeModalUser, pendingRole]);

  const handleToggleOffice = useCallback(async (user: UserAccountRow) => {
    if (user.id === currentUser?.id) return;
    const currentOffice = officeByUserId[user.id];
    if (currentOffice) {
      if (!window.confirm(`Remover atribuição de "${currentOffice.name}" para ${user.full_name || user.email}?`)) return;
      setIsSavingId(user.id);
      try {
        await unassignOfficeOwner(currentOffice.id, user.id);
        setOfficeByUserId((prev) => {
          const next = { ...prev };
          delete next[user.id];
          return next;
        });
        toast.success("Atribuição de office removida.");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Erro ao remover office.");
      } finally {
        setIsSavingId(null);
      }
    } else {
      setPendingRole(null);
      setOfficeModalUser(user);
    }
  }, [officeByUserId]);

  const handleOfficeCancel = useCallback(() => {
    setOfficeModalUser(null);
    setPendingRole(null);
  }, []);

  const handleToggleActive = useCallback(async (user: UserAccountRow) => {
    if (user.id === currentUser?.id) return;
    const nextActive = user.is_active === false;
    setIsSavingId(user.id);
    try {
      await updateUserActive(user.id, nextActive);
      setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, is_active: nextActive } : item)));
      toast.success(nextActive ? "Usuário ativado." : "Usuário desativado.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao alterar status do usuário.";
      toast.error(message);
    } finally {
      setIsSavingId(null);
    }
  }, []);


  return {
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
    currentUserId: currentUser?.id,
    handleSearchByEmail,
    handleRoleChange,
    handleOfficeConfirm,
    handleOfficeCancel,
    handleToggleActive,
    handleToggleOffice,
  };
}
