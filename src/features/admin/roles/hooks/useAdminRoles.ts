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
import { useT } from "../../../../i18n";

export function useAdminRoles() {
  const t = useT("admin").roles;
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
  }, [roleOptions]);

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
          .select("id, office_id, offices!office_id(id, name, slug, address, phone, owner_id)")
          .in("id", userIds)
          .not("office_id", "is", null);

        (accountRows as Array<{ id: string; offices: OfficeRow | null }> | null)?.forEach((r) => {
          if (r.offices) byAccount[r.id] = r.offices;
        });
      }

      setOfficeByUserId({ ...byOwner, ...byAccount });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.messages.loadError;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [syncSelectedRoles, t.messages.loadError]);

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
      if (rows.length === 0) toast.error(t.messages.notFound);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.messages.searchError;
      toast.error(message);
    } finally {
      setIsSearching(false);
    }
  }, [loadStaffUsers, search, syncSelectedRoles, t.messages.notFound, t.messages.searchError]);

  const commitRoleChange = useCallback(async (user: UserAccountRow, nextRole: ManagedRole) => {
    setIsSavingId(user.id);
    try {
      await updateUserRole(user.id, nextRole);
      setSelectedByUserId((prev) => ({ ...prev, [user.id]: nextRole }));
      setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, role: nextRole } : item)));
      toast.success(t.messages.roleSuccess);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.messages.saveError;
      toast.error(message);
    } finally {
      setIsSavingId(null);
    }
  }, [t.messages.roleSuccess, t.messages.saveError]);

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
          toast.error(t.messages.officeNotFound);
          return;
        }
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
          : err instanceof Error
            ? err.message
            : t.messages.officeSaveError;
      toast.error(message);
    } finally {
      setIsSavingOffice(false);
    }
  }, [commitRoleChange, officeModalUser, pendingRole, t.messages.officeNotFound, t.messages.officeSuccess, t.messages.officeNameError, t.messages.officeSaveError]);

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
        setOfficeByUserId((prev) => {
          const next = { ...prev };
          delete next[user.id];
          return next;
        });
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
  }, [officeByUserId, currentUser?.id, t.messages.unassignConfirm, t.messages.unassignSuccess, t.messages.unassignError]);

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
      toast.success(nextActive ? t.messages.activated : t.messages.deactivated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.messages.statusError;
      toast.error(message);
    } finally {
      setIsSavingId(null);
    }
  }, [currentUser?.id, t.messages.activated, t.messages.deactivated, t.messages.statusError]);


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
