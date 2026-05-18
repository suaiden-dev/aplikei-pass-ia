import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@shared/hooks/useAuth";
import {
  activateTeamMember,
  createInviteLink,
  fetchInviteLinks,
  fetchPendingRequests,
  fetchTeamMembers,
  rejectTeamMember,
  updateTeamMemberRole,
  type InviteLink,
  type TeamMember,
  type TeamRole,
} from "../services/teamsOps";
import { listOffices, fetchOfficeForUser, type OfficeRow } from "@features/offices/services/officeOps";

export function useTeams() {
  const { user } = useAuth();
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [offices, setOffices] = useState<OfficeRow[]>([]);
  const [currentOffice, setCurrentOffice] = useState<OfficeRow | null>(null);
  
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pending, setPending] = useState<TeamMember[]>([]);
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // Initial office setup
  useEffect(() => {
    async function setup() {
      if (!user) return;
      
      const isMaster = user.role === "master";
      
      if (isMaster) {
        try {
          const allOffices = await listOffices();
          setOffices(allOffices);
          if (allOffices.length > 0) {
            setSelectedOfficeId(allOffices[0].id);
            setCurrentOffice(allOffices[0]);
          }
        } catch (err) {
          console.error("Error loading offices:", err);
        }
      } else if (user.officeId) {
        setSelectedOfficeId(user.officeId);
        try {
          const office = await fetchOfficeForUser(user.id);
          setCurrentOffice(office);
        } catch (err) {
          console.error("Error loading office details:", err);
        }
      }
    }
    void setup();
  }, [user]);

  const load = useCallback(async () => {
    if (!selectedOfficeId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const [m, p, links] = await Promise.all([
        fetchTeamMembers(selectedOfficeId),
        fetchPendingRequests(selectedOfficeId),
        fetchInviteLinks(selectedOfficeId),
      ]);
      setMembers(m);
      setPending(p);
      setInviteLinks(links);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error loading team.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedOfficeId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Update current office when selection changes
  useEffect(() => {
    if (selectedOfficeId && offices.length > 0) {
      const office = offices.find(o => o.id === selectedOfficeId);
      if (office) setCurrentOffice(office);
    }
  }, [selectedOfficeId, offices]);

  const generateLink = useCallback(async (role: TeamRole): Promise<string | null> => {
    if (!selectedOfficeId || !user?.id) return null;
    setIsGeneratingLink(true);
    try {
      const link = await createInviteLink(selectedOfficeId, role, user.id);
      setInviteLinks((prev) => [link, ...prev]);
      return link.token;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error generating link.");
      return null;
    } finally {
      setIsGeneratingLink(false);
    }
  }, [selectedOfficeId, user?.id]);

  const handleActivate = useCallback(async (userId: string) => {
    setSavingId(userId);
    try {
      await activateTeamMember(userId);
      const activated = pending.find((u) => u.id === userId);
      if (activated) {
        setPending((prev) => prev.filter((u) => u.id !== userId));
        setMembers((prev) => [{ ...activated, is_active: true }, ...prev]);
      }
      toast.success("Member activated successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error activating member.");
    } finally {
      setSavingId(null);
    }
  }, [pending]);

  const handleReject = useCallback(async (userId: string) => {
    setSavingId(userId);
    try {
      await rejectTeamMember(userId);
      setPending((prev) => prev.filter((u) => u.id !== userId));
      toast.success("Request rejected.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error rejecting request.");
    } finally {
      setSavingId(null);
    }
  }, []);

  const handleUpdateRole = useCallback(async (userId: string, role: TeamRole) => {
    setSavingId(userId);
    try {
      await updateTeamMemberRole(userId, role);
      setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, role } : m)));
      toast.success("Role updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error updating role.");
    } finally {
      setSavingId(null);
    }
  }, []);

  const handleRemoveMember = useCallback(async (userId: string) => {
    if (!window.confirm("Remove this team member?")) return;
    setSavingId(userId);
    try {
      await rejectTeamMember(userId);
      setMembers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("Member removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error removing member.");
    } finally {
      setSavingId(null);
    }
  }, []);

  return {
    officeId: selectedOfficeId,
    setOfficeId: setSelectedOfficeId,
    offices,
    currentOffice,
    members,
    pending,
    inviteLinks,
    isLoading,
    savingId,
    isGeneratingLink,
    isMaster: user?.role === "master",
    reload: load,
    generateLink,
    handleActivate,
    handleReject,
    handleUpdateRole,
    handleRemoveMember,
  };
}
