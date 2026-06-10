import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@shared/hooks/useAuth";
import { useT } from "@app/app/i18n";
import { adminQueryKeys } from "@features/admin/lib/queryKeys";
import {
  activateTeamMember,
  createInviteLink,
  fetchInviteLinks,
  fetchPendingRequests,
  fetchTeamMembers,
  rejectTeamMember,
  updateTeamMemberRole,
  type TeamRole,
} from "../services/teamsOps";
import { listOffices, fetchOfficeForUser, type OfficeRow } from "@features/offices/services/officeOps";

export function useTeams() {
  const t = useT("admin");
  const { user } = useAuth();
  const isMaster = user?.role === "master";
  const queryClient = useQueryClient();

  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(user?.officeId ?? null);

  const { data: offices = [] } = useQuery({
    queryKey: adminQueryKeys.teamOffices(),
    queryFn: listOffices,
    enabled: isMaster,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!selectedOfficeId && offices.length > 0) setSelectedOfficeId(offices[0].id);
  }, [offices, selectedOfficeId]);

  const { data: currentOffice = null } = useQuery<OfficeRow | null>({
    queryKey: adminQueryKeys.teamCurrentOffice(user?.id),
    queryFn: () => fetchOfficeForUser(user!.id),
    enabled: !isMaster && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const effectiveCurrentOffice = isMaster
    ? (offices.find((o) => o.id === selectedOfficeId) ?? null)
    : currentOffice;

  const { data: teamData, isLoading } = useQuery({
    queryKey: adminQueryKeys.teamData(selectedOfficeId ?? undefined),
    queryFn: async () => {
      const [members, pending, inviteLinks] = await Promise.all([
        fetchTeamMembers(selectedOfficeId!),
        fetchPendingRequests(selectedOfficeId!),
        fetchInviteLinks(selectedOfficeId!),
      ]);
      return { members, pending, inviteLinks };
    },
    enabled: !!selectedOfficeId,
  });

  const invalidateTeam = () =>
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.teamData(selectedOfficeId ?? undefined) });

  const generateLinkMutation = useMutation({
    mutationFn: (role: TeamRole) => createInviteLink(selectedOfficeId!, role, user!.id),
    onSuccess: () => invalidateTeam(),
    onError: (err: Error) => toast.error(err.message || t.teams.messages.linkError),
  });

  const activateMutation = useMutation({
    mutationFn: (userId: string) => activateTeamMember(userId),
    onSuccess: () => { invalidateTeam(); toast.success(t.teams.messages.activated); },
    onError: (err: Error) => toast.error(err.message || t.teams.messages.linkError),
  });

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => rejectTeamMember(userId),
    onSuccess: () => { invalidateTeam(); toast.success(t.teams.messages.rejected); },
    onError: (err: Error) => toast.error(err.message || t.teams.messages.linkError),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: TeamRole }) =>
      updateTeamMemberRole(userId, role),
    onSuccess: () => { invalidateTeam(); toast.success(t.teams.messages.roleUpdated); },
    onError: (err: Error) => toast.error(err.message || t.teams.messages.linkError),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => rejectTeamMember(userId),
    onSuccess: () => { invalidateTeam(); toast.success(t.teams.messages.removed); },
    onError: (err: Error) => toast.error(err.message || t.teams.messages.linkError),
  });

  const savingIds = new Set([
    activateMutation.isPending ? activateMutation.variables : null,
    rejectMutation.isPending ? rejectMutation.variables : null,
    updateRoleMutation.isPending ? updateRoleMutation.variables?.userId : null,
    removeMutation.isPending ? removeMutation.variables : null,
  ].filter(Boolean) as string[]);

  const generateLink = async (role: TeamRole): Promise<string | null> => {
    try {
      const link = await generateLinkMutation.mutateAsync(role);
      return link.token;
    } catch {
      return null;
    }
  };

  return {
    officeId: selectedOfficeId,
    setOfficeId: setSelectedOfficeId,
    offices,
    currentOffice: effectiveCurrentOffice,
    members: teamData?.members ?? [],
    pending: teamData?.pending ?? [],
    inviteLinks: teamData?.inviteLinks ?? [],
    isLoading,
    savingId: savingIds.size > 0 ? Array.from(savingIds)[0] : null,
    isGeneratingLink: generateLinkMutation.isPending,
    isMaster,
    reload: invalidateTeam,
    generateLink,
    handleActivate: (userId: string) => activateMutation.mutate(userId),
    handleReject: (userId: string) => rejectMutation.mutate(userId),
    handleUpdateRole: (userId: string, role: TeamRole) => updateRoleMutation.mutate({ userId, role }),
    handleRemoveMember: (userId: string) => {
      if (!window.confirm("Remove this team member?")) return;
      removeMutation.mutate(userId);
    },
  };
}
