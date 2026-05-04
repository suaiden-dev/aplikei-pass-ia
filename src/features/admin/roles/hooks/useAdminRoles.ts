import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  fetchStaffUsers,
  searchUsersByEmail,
  updateUserActive,
  updateUserRole,
  type ManagedRole,
  type UserAccountRow,
} from "../lib/rolesOps";

export function useAdminRoles() {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserAccountRow[]>([]);
  const [selectedByUserId, setSelectedByUserId] = useState<Record<string, ManagedRole>>({});

  const roleOptions: Array<{ label: string; value: ManagedRole }> = [
    { label: "Master", value: "master" },
    { label: "Admin Lawyer", value: "admin_lawyer" },
    { label: "Admin", value: "admin" },
    { label: "Manager", value: "manager" },
    { label: "Seller", value: "seller" },
    { label: "Customer", value: "customer" },
  ];

  const syncSelectedRoles = useCallback((rows: UserAccountRow[]) => {
    const nextSelected: Record<string, ManagedRole> = {};
    for (const row of rows) {
      if (row.role && roleOptions.some((opt) => opt.value === row.role)) {
        nextSelected[row.id] = row.role as ManagedRole;
      }
    }
    setSelectedByUserId(nextSelected);
  }, []);

  const loadStaffUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await fetchStaffUsers();
      setUsers(rows);
      syncSelectedRoles(rows);
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

  const handleRoleChange = useCallback(async (user: UserAccountRow, nextRole: ManagedRole) => {
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

  const handleToggleActive = useCallback(async (user: UserAccountRow) => {
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
    handleSearchByEmail,
    handleRoleChange,
    handleToggleActive,
  };
}
