import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  RiFileTextLine, RiShieldUserLine, RiSaveLine, RiLoader4Line,
  RiUserLine, RiUserStarLine,
} from "react-icons/ri";
import { supabase } from "@shared/lib/supabase";
import { useAuth } from "@shared/hooks/useAuth";
import { RichEditor } from "./RichEditor";

type Role = "lawyer" | "customer";
type ContentType = "terms" | "privacy";
type TabKey = "lawyer_terms" | "lawyer_privacy" | "customer_terms" | "customer_privacy";

const ALL_KEYS: TabKey[] = ["lawyer_terms", "lawyer_privacy", "customer_terms", "customer_privacy"];

function makeKey(role: Role, ct: ContentType): TabKey {
  return `${role}_${ct}` as TabKey;
}

const ROLES: { id: Role; label: string; icon: React.ReactNode }[] = [
  { id: "lawyer", label: "Lawyer", icon: <RiUserStarLine /> },
  { id: "customer", label: "Customer", icon: <RiUserLine /> },
];

const CONTENT_TYPES: { id: ContentType; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "terms", label: "Terms of Service", icon: <RiShieldUserLine />, description: "Displayed at /legal/terms" },
  { id: "privacy", label: "Privacy Policy", icon: <RiFileTextLine />, description: "Displayed at /legal/privacy" },
];

const FIXED_TITLES: Record<ContentType, string> = {
  terms: "Terms of Service",
  privacy: "Privacy Policy",
};

interface TermRecord { id: string; title: string; content: string; }

type TabMap<T> = Record<TabKey, T>;

function emptyMap<T>(val: T): TabMap<T> {
  return Object.fromEntries(ALL_KEYS.map(k => [k, val])) as TabMap<T>;
}

export default function LegalTermsPage() {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState<Role>("lawyer");
  const [activeContent, setActiveContent] = useState<ContentType>("terms");

  const [records, setRecords] = useState<TabMap<TermRecord | null>>(emptyMap(null));
  const [contents, setContents] = useState<TabMap<string>>(emptyMap(""));
  const [saving, setSaving] = useState<TabMap<boolean>>(emptyMap(false));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("legal_terms")
        .select("id, title, content, category")
        .eq("is_active", true)
        .in("category", ALL_KEYS)
        .order("created_at", { ascending: false });

      const byCategory = emptyMap<TermRecord | null>(null);
      for (const row of data ?? []) {
        const cat = row.category as TabKey;
        if (ALL_KEYS.includes(cat) && !byCategory[cat]) byCategory[cat] = row as TermRecord;
      }

      setRecords(byCategory);
      setContents(Object.fromEntries(ALL_KEYS.map(k => [k, byCategory[k]?.content ?? ""])) as TabMap<string>);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleSave = async (key: TabKey) => {
    setSaving((p) => ({ ...p, [key]: true }));
    try {
      const ct = key.split("_")[1] as ContentType;
      const payload = {
        title: FIXED_TITLES[ct],
        content: contents[key],
        category: key,
        is_active: true,
      };
      const existing = records[key];
      if (existing) {
        const { error } = await supabase.from("legal_terms").update(payload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("legal_terms").insert({ ...payload, created_by: user?.id ?? null });
        if (error) throw error;
      }
      toast.success("Saved successfully!");
      void load();
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving((p) => ({ ...p, [key]: false }));
    }
  };

  const activeKey = makeKey(activeRole, activeContent);
  const activeMeta = CONTENT_TYPES.find(c => c.id === activeContent)!;

  return (
    <div className="min-h-screen bg-bg p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-text">Legal Pages</h1>
        <p className="text-sm text-text-muted mt-1">
          Edit the content displayed on the public Terms of Service and Privacy Policy pages.
        </p>
      </div>

      {/* Role tabs */}
      <div className="flex gap-2">
        {ROLES.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => setActiveRole(role.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-colors ${
              activeRole === role.id
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-card text-text-muted border border-border hover:text-text"
            }`}
          >
            {role.icon}
            {role.label}
          </button>
        ))}
      </div>

      {/* Content type sub-tabs */}
      <div className="flex gap-1 border-b border-border">
        {CONTENT_TYPES.map((ct) => (
          <button
            key={ct.id}
            type="button"
            onClick={() => setActiveContent(ct.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-px ${
              activeContent === ct.id
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {ct.icon}
            {ct.label}
          </button>
        ))}
      </div>

      {/* Editor panel */}
      {loading ? (
        <div className="flex items-center justify-center py-32 text-text-muted">
          <RiLoader4Line className="animate-spin text-3xl" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-[28px] overflow-hidden shadow-sm">
          {/* Panel header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-lg">
                {activeMeta.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-text">{activeMeta.label}</p>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-bg-subtle text-text-muted border border-border">
                    {activeKey}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">{activeMeta.description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSave(activeKey)}
              disabled={saving[activeKey]}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving[activeKey]
                ? <RiLoader4Line className="animate-spin text-base" />
                : <RiSaveLine className="text-base" />}
              Save
            </button>
          </div>

          {/* Fields */}
          <div className="p-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                Title
              </label>
              <div className="h-10 px-4 bg-bg-subtle border border-border rounded-xl text-sm text-text-muted flex items-center select-none">
                {FIXED_TITLES[activeContent]}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                Content
              </label>
              <RichEditor
                key={activeKey}
                value={contents[activeKey]}
                onChange={(html) => setContents((p) => ({ ...p, [activeKey]: html }))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
