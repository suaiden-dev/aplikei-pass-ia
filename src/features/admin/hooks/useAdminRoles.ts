import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@shared/hooks/useAuth";
import { supabase } from "@shared/lib/supabase";
import { adminQueryKeys } from "@features/admin/lib/queryKeys";
import {
  fetchStaffUsers,
  searchUsersByEmail,
  updateUserActive,
  updateUserRole,
  type ManagedRole,
  type UserAccountRow,
} from "../services/rolesOps";
import { normalizeRole } from "@features/auth/lib/roles";
import { assignOfficeOwner, upsertOffice, unassignOfficeOwner, listOffices, setUserOffice, type OfficeRow } from "@features/offices/services/officeOps";
import { useT } from "@app/app/i18n";

async function loadUsersAndOffices(activeSearch: string): Promise<{
  users: UserAccountRow[];
  officeByUserId: Record<string, OfficeRow>;
}> {
  const rows = activeSearch ? await searchUsersByEmail(activeSearch) : await fetchStaffUsers();

  const offices = await listOffices();
  const byOwner = Object.fromEntries(offices.filter((o) => o.owner_id).map((o) => [o.owner_id, o]));

  const userIds = rows.map((r) => r.id).filter((id) => !byOwner[id]);
  let byAccount: Record<string, OfficeRow> = {};
  if (userIds.length > 0) {
    const { data: accountRows } = await supabase
      .from("user_accounts")
      .select("id, office_id, offices!office_id(id, name, slug, address, phone, owner_id)")
      .in("id", userIds)
      .not("office_id", "is", null);

    (accountRows as Array<{ id: string; offices: OfficeRow | null }> | null)?.forEach((r) => {
      if (r.offices) byAccount[r.id] = r.offices;
    });
  }

  return { users: rows, officeByUserId: { ...byOwner, ...byAccount } };
}

export function useAdminRoles() {
  const t = useT("admin").roles;
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
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
    if (currentUser?.role === "admin_lawyer") return all.filter((opt) => opt.value !== "admin_lawyer");
    return all;
  }, [currentUser?.role]);

  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.adminRolesUsers(activeSearch),
    queryFn: async () => {
      const result = await loadUsersAndOffices(activeSearch);
      if (activeSearch && result.users.length === 0) toast.error(t.messages.notFound);
      return result;
    },
    staleTime: 0,
  });

  const users = data?.users ?? [];

  useEffect(() => {
    if (!data) return;
    const nextSelected: Record<string, ManagedRole> = {};
    for (const row of data.users) {
      const normalized = normalizeRole(row.role) as ManagedRole;
      if (roleOptions.some((opt) => opt.value === normalized)) nextSelected[row.id] = normalized;
    }
    setSelectedByUserId(nextSelected);
    setOfficeByUserId(data.officeByUserId);
  }, [data, roleOptions]);

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminRolesUsers(activeSearch) });

  const handleSearchByEmail = useCallback(() => {
    const term = search.trim().toLowerCase();
    setActiveSearch(term);
  }, [search]);

  const commitRoleChange = useCallback(async (user: UserAccountRow, nextRole: ManagedRole) => {
    setIsSavingId(user.id);
    try {
      await updateUserRole(user.id, nextRole);
      setSelectedByUserId((prev) => ({ ...prev, [user.id]: nextRole }));
      invalidateUsers();
      toast.success(t.messages.roleSuccess);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.messages.saveError);
    } finally {
      setIsSavingId(null);
    }
  }, [t.messages.roleSuccess, t.messages.saveError, activeSearch]);

  const handleRoleChange = useCallback(async (user: UserAccountRow, nextRole: ManagedRole) => {
    if (currentUser?.role === "admin_lawyer" && nextRole === "admin_lawyer") {
      toast.error(t.messages.promoteError);
      return;
    }
    if (nextRole === "admin_lawyer") {
      setPendingRole(nextRole);
      setOfficeModalUser(user);
      return;
    }
    await commitRoleChange(user, nextRole);
  }, [commitRoleChange, currentUser?.role, t.messages.promoteError]);

  const handleOfficeConfirm = useCallback(async (
    officeData: { mode: "existing"; officeId: string; forceReplace: boolean } | { mode: "create"; name: string },
  ) => {
    if (!officeModalUser) return;
    setIsSavingOffice(true);
    try {
      if (pendingRole === "admin_lawyer") {
        let savedOffice: OfficeRow;
        if (officeData.mode === "create") {
          savedOffice = await upsertOffice({ name: officeData.name, owner_id: officeModalUser.id });
        } else {
          savedOffice = await assignOfficeOwner({ officeId: officeData.officeId, ownerId: officeModalUser.id, forceReplace: officeData.forceReplace });
        }
        await setUserOffice(officeModalUser.id, savedOffice.id);
        setOfficeByUserId((prev) => ({ ...prev, [officeModalUser.id]: savedOffice }));
        await commitRoleChange(officeModalUser, pendingRole);
      } else {
        if (officeData.mode !== "existing") return;
        const { data: officeRow } = await supabase
          .from("offices")
          .select("id, name, slug, address, phone, owner_id")
          .eq("id", officeData.officeId)
          .single();
        if (!officeRow) { toast.error(t.messages.officeNotFound); return; }
        await setUserOffice(officeModalUser.id, officeData.officeId);
        setOfficeByUserId((prev) => ({ ...prev, [officeModalUser.id]: officeRow as OfficeRow }));
        toast.success(t.messages.officeSuccess);
      }
      setOfficeModalUser(null);
      setPendingRole(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.name === "OFFICE_NAME_ALREADY_EXISTS"
          ? t.messages.officeNameError
          : err instanceof Error ? err.message : t.messages.officeSaveError;
      toast.error(message);
    } finally {
      setIsSavingOffice(false);
    }
  }, [commitRoleChange, officeModalUser, pendingRole, t.messages]);

  const handleToggleOffice = useCallback(async (user: UserAccountRow) => {
    if (user.id === currentUser?.id) return;
    const currentOffice = officeByUserId[user.id];
    if (currentOffice) {
      const confirmMsg = t.messages.unassignConfirm
        .replace("{{office}}", currentOffice.name)
        .replace("{{user}}", user.full_name || user.email);
      if (!window.confirm(confirmMsg)) return;
      setIsSavingId(user.id);
      try {
        await unassignOfficeOwner(currentOffice.id, user.id);
        setOfficeByUserId((prev) => { const next = { ...prev }; delete next[user.id]; return next; });
        toast.success(t.messages.unassignSuccess);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : t.messages.unassignError);
      } finally {
        setIsSavingId(null);
      }
    } else {
      setPendingRole(null);
      setOfficeModalUser(user);
    }
  }, [officeByUserId, currentUser?.id, t.messages]);

  const handleToggleActive = useCallback(async (user: UserAccountRow) => {
    if (user.id === currentUser?.id) return;
    const nextActive = user.is_active === false;
    setIsSavingId(user.id);
    try {
      await updateUserActive(user.id, nextActive);
      invalidateUsers();
      toast.success(nextActive ? t.messages.activated : t.messages.deactivated);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.messages.statusError);
    } finally {
      setIsSavingId(null);
    }
  }, [currentUser?.id, t.messages, activeSearch]);

  const activeUsersCount = useMemo(() => users.filter((u) => u.is_active !== false).length, [users]);

  return {
    search,
    setSearch,
    isLoading,
    isSearching: false,
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
    handleOfficeCancel: useCallback(() => { setOfficeModalUser(null); setPendingRole(null); }, []),
    handleToggleActive,
    handleToggleOffice,
  };
}
