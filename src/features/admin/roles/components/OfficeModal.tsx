import { useEffect, useState } from "react";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import type { UserAccountRow } from "../lib/rolesOps";
import { fetchOfficeByOwner, listOffices, type OfficeRow } from "../lib/officeOps";

interface OfficeModalProps {
  user: UserAccountRow;
  onConfirm: (data: { mode: "existing"; officeId: string; forceReplace: boolean } | { mode: "create"; name: string }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  allowCreate?: boolean;
}

export function OfficeModal({ user, onConfirm, onCancel, isSaving, allowCreate = true }: OfficeModalProps) {
  const [mode, setMode] = useState<"existing" | "create">("existing");
  const [offices, setOffices] = useState<OfficeRow[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState("");
  const [newOfficeName, setNewOfficeName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const normalizeOfficeName = (value: string) =>
    value.trim().replace(/\s+/g, " ").toLowerCase();

  useEffect(() => {
    let mounted = true;
    const loadOffice = async () => {
      setIsLoading(true);
      try {
        const [office, officeList] = await Promise.all([fetchOfficeByOwner(user.id), listOffices()]);
        if (!mounted) return;
        setOffices(officeList);
        if (office) {
          setMode("existing");
          setSelectedOfficeId(office.id);
        } else {
          setMode("create");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error loading office.";
        toast.error(message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadOffice();
    return () => {
      mounted = false;
    };
  }, [user.id]);

  const handleSubmit = async () => {
    if (mode === "create") {
      const trimmedName = newOfficeName.trim();
      if (!trimmedName) {
        toast.error("Office name is required.");
        return;
      }
      const normalizedName = normalizeOfficeName(trimmedName);
      const duplicateOffice = offices.find(
        (office) => normalizeOfficeName(office.name) === normalizedName,
      );

      if (duplicateOffice) {
        toast.error(`An office with this name already exists: ${duplicateOffice.name}.`);
        return;
      }
      await onConfirm({ mode: "create", name: trimmedName });
      return;
    }

    if (!selectedOfficeId) {
      toast.error("Select an office.");
      return;
    }

    const selected = offices.find((office) => office.id === selectedOfficeId);
    const requiresReplace = !!selected?.owner_id && selected.owner_id !== user.id;
    let forceReplace = false;
    if (requiresReplace) {
      forceReplace = window.confirm("This office is already linked to another user. Replace it?");
      if (!forceReplace) return;
    }

    await onConfirm({ mode: "existing", officeId: selectedOfficeId, forceReplace });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-xl font-black text-text tracking-tight">Admin Lawyer Office</h2>
          <p className="text-sm text-text-muted mt-1">
            Set office data for {user.full_name || user.email}.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="py-8 text-center text-text-muted font-semibold inline-flex items-center justify-center gap-2 w-full">
              <RiLoader4Line className="animate-spin" />
              Loading office...
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-text">
                  <input type="radio" checked={mode === "existing"} onChange={() => setMode("existing")} />
                  Select existing office
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-text">
                  <input type="radio" checked={mode === "create"} onChange={() => setMode("create")} />
                  Create new office
                </label>
              </div>

              {mode === "existing" ? (
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-widest text-text-muted">Office</span>
                  <select
                    value={selectedOfficeId}
                    onChange={(e) => setSelectedOfficeId(e.target.value)}
                    className="mt-2 w-full h-11 px-3 bg-card border border-border rounded-xl text-sm text-text outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5"
                  >
                    <option value="">Select...</option>
                    {offices.map((office) => (
                      <option key={office.id} value={office.id}>
                        {office.name}
                        {office.owner_id && office.owner_id !== user.id
                          ? ` (linked: ${office.owner_name || office.owner_email || office.owner_id})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-widest text-text-muted">New office name *</span>
                  <input
                    value={newOfficeName}
                    onChange={(e) => setNewOfficeName(e.target.value)}
                    className="mt-2 w-full h-11 px-3 bg-card border border-border rounded-xl text-sm text-text outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5"
                  />
                </label>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="h-10 px-4 rounded-xl border border-border text-text text-xs font-black uppercase tracking-widest hover:bg-bg-subtle transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isLoading || isSaving}
            className="h-10 px-4 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isSaving ? <RiLoader4Line className="animate-spin" /> : null}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
