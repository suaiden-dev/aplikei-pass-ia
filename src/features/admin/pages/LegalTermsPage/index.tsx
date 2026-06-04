import { useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiFileTextLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiCloseLine,
  RiRefreshLine,
  RiSearchLine,
  RiShieldUserLine,
  RiUserLine,
  RiCheckLine,
  RiAlertLine,
} from "react-icons/ri";
import { supabase } from "@shared/lib/supabase";
import { useAuth } from "@shared/hooks/useAuth";
import { useT } from "@app/app/i18n";
import { Input } from "@shared/components/atoms/input";
import { Label } from "@shared/components/atoms/label";
import { zodValidate } from "@shared/utils/zodValidate";

type TermCategory = "lawyer" | "customer";

interface LegalTerm {
  id: string;
  title: string;
  content: string;
  category: TermCategory;
  version: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

type FilterTab = "all" | TermCategory;

const CATEGORY_STYLES: Record<TermCategory, string> = {
  lawyer: "bg-primary/10 text-primary border-primary/20",
  customer: "bg-success/10 text-success border-success/20",
};

export default function LegalTermsPage() {
  const t = useT("admin").legalTerms;
  const { user } = useAuth();

  const [terms, setTerms] = useState<LegalTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  // Modal state
  const [formModal, setFormModal] = useState<{ open: boolean; term: LegalTerm | null }>({
    open: false,
    term: null,
  });
  const [viewTerm, setViewTerm] = useState<LegalTerm | null>(null);
  const [deleteTerm, setDeleteTerm] = useState<LegalTerm | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("legal_terms")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setTerms(data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formModal.term
      ? {
          title: formModal.term.title,
          content: formModal.term.content,
          category: formModal.term.category,
          version: formModal.term.version,
          is_active: formModal.term.is_active,
        }
      : {
          title: "",
          content: "",
          category: "customer" as TermCategory,
          version: "1.0",
          is_active: true,
        },
    validate: zodValidate(
      z.object({
        title: z.string().min(1, t.messages.missingTitle),
        content: z.string().min(1, t.messages.missingContent),
        version: z.string().min(1),
        category: z.enum(["lawyer", "customer"]),
        is_active: z.boolean(),
      }),
    ),
    onSubmit: async (values) => {
      const isEdit = !!formModal.term?.id;
      const payload = {
        title: values.title.trim(),
        content: values.content.trim(),
        category: values.category,
        version: values.version.trim(),
        is_active: values.is_active,
      };

      if (isEdit) {
        const { error } = await supabase
          .from("legal_terms")
          .update(payload)
          .eq("id", formModal.term!.id);
        if (error) { toast.error(t.messages.updateError.replace("{{error}}", error.message)); return; }
        toast.success(t.messages.updateSuccess);
      } else {
        const { error } = await supabase
          .from("legal_terms")
          .insert({ ...payload, created_by: user?.id ?? null });
        if (error) { toast.error(t.messages.createError.replace("{{error}}", error.message)); return; }
        toast.success(t.messages.createSuccess);
      }

      setFormModal({ open: false, term: null });
      formik.resetForm();
      void load();
    },
  });

  const handleDelete = async () => {
    if (!deleteTerm) return;
    setIsDeleting(true);
    const { error } = await supabase.from("legal_terms").delete().eq("id", deleteTerm.id);
    if (error) toast.error(t.messages.deleteError.replace("{{error}}", error.message));
    else toast.success(t.messages.deleteSuccess);
    setIsDeleting(false);
    setDeleteTerm(null);
    void load();
  };

  const filtered = terms.filter((term) => {
    const matchCategory = filter === "all" || term.category === filter;
    const matchSearch = !search || term.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const stats = {
    total: terms.length,
    active: terms.filter((t) => t.is_active).length,
    lawyer: terms.filter((t) => t.category === "lawyer").length,
    customer: terms.filter((t) => t.category === "customer").length,
  };

  return (
    <div className="min-h-screen bg-bg p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text">{t.title}</h1>
          <p className="text-sm text-text-muted mt-1">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setFormModal({ open: true, term: null })}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          <RiAddLine className="text-base" />
          {t.createNew}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.stats.total} value={stats.total} icon={<RiFileTextLine />} color="text-primary" />
        <StatCard label={t.stats.active} value={stats.active} icon={<RiCheckLine />} color="text-success" />
        <StatCard label={t.stats.lawyer} value={stats.lawyer} icon={<RiShieldUserLine />} color="text-warning" />
        <StatCard label={t.stats.customer} value={stats.customer} icon={<RiUserLine />} color="text-blue-500" />
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {(["all", "lawyer", "customer"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                filter === tab
                  ? "bg-primary text-white"
                  : "bg-card text-text-muted border border-border hover:text-text"
              }`}
            >
              {t.filter[tab]}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm ml-auto">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.table.title + "..."}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
          />
        </div>
        <button onClick={() => void load()} className="p-2 rounded-xl bg-card border border-border text-text-muted hover:text-text transition-colors">
          <RiRefreshLine className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-[24px] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-text-muted text-sm">{useT("admin").shared.loading}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-text-muted">
            <RiFileTextLine className="text-4xl opacity-30" />
            <span className="text-sm">{t.table.noResults}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-subtle/50 border-b border-border">
                  {[t.table.title, t.table.category, t.table.version, t.table.status, t.table.updated, t.table.actions].map((h) => (
                    <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-text-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((term) => (
                    <motion.tr
                      key={term.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-border last:border-0 hover:bg-bg-subtle/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-text text-sm">{term.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${CATEGORY_STYLES[term.category]}`}>
                          {term.category === "lawyer" ? <RiShieldUserLine /> : <RiUserLine />}
                          {t.categories[term.category]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-muted font-mono">v{term.version}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          term.is_active
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-bg-subtle text-text-muted border-border"
                        }`}>
                          {term.is_active ? <RiCheckLine /> : <RiCloseLine />}
                          {term.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-muted whitespace-nowrap">
                        {new Date(term.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <ActionBtn icon={<RiEyeLine />} label="View" onClick={() => setViewTerm(term)} />
                          <ActionBtn icon={<RiEditLine />} label="Edit" onClick={() => setFormModal({ open: true, term })} />
                          <ActionBtn icon={<RiDeleteBinLine />} label="Delete" onClick={() => setDeleteTerm(term)} danger />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {formModal.open && (
          <Modal onClose={() => { setFormModal({ open: false, term: null }); formik.resetForm(); }}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-black text-text">
                {formModal.term ? t.modal.editTitle : t.modal.createTitle}
              </h2>
              <button onClick={() => { setFormModal({ open: false, term: null }); formik.resetForm(); }}
                className="w-9 h-9 flex items-center justify-center hover:bg-bg-subtle rounded-xl transition-colors text-text-muted">
                <RiCloseLine />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title">{t.form.titleLabel}</Label>
                <Input
                  id="title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  placeholder={t.form.titlePlaceholder}
                  className={formik.errors.title ? "border-danger" : ""}
                />
                {formik.errors.title && <p className="text-xs text-danger">{formik.errors.title}</p>}
              </div>

              {/* Category + Version row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category">{t.form.categoryLabel}</Label>
                  <select
                    id="category"
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    className="w-full h-10 px-3 bg-bg-subtle border border-border rounded-xl text-sm text-text focus:outline-none focus:border-primary"
                  >
                    <option value="customer">{t.categories.customer}</option>
                    <option value="lawyer">{t.categories.lawyer}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="version">{t.form.versionLabel}</Label>
                  <Input
                    id="version"
                    name="version"
                    value={formik.values.version}
                    onChange={formik.handleChange}
                    placeholder={t.form.versionPlaceholder}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <Label htmlFor="content">{t.form.contentLabel}</Label>
                <textarea
                  id="content"
                  name="content"
                  rows={10}
                  value={formik.values.content}
                  onChange={formik.handleChange}
                  placeholder={t.form.contentPlaceholder}
                  className={`w-full px-3 py-2.5 bg-bg-subtle border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary resize-y font-mono leading-relaxed ${
                    formik.errors.content ? "border-danger" : "border-border"
                  }`}
                />
                {formik.errors.content && <p className="text-xs text-danger">{formik.errors.content}</p>}
              </div>

              {/* Active toggle */}
              <div className="flex items-start gap-3 p-4 bg-bg-subtle rounded-2xl border border-border">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formik.values.is_active}
                  onChange={formik.handleChange}
                  className="mt-0.5 w-4 h-4 rounded accent-primary"
                />
                <div>
                  <label htmlFor="is_active" className="text-sm font-semibold text-text cursor-pointer">
                    {t.form.activeLabel}
                  </label>
                  <p className="text-xs text-text-muted mt-0.5">{t.form.activeDescription}</p>
                </div>
              </div>
            </form>

            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button
                type="button"
                onClick={() => { setFormModal({ open: false, term: null }); formik.resetForm(); }}
                className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-text-muted border border-border hover:bg-bg-subtle transition-colors"
              >
                {t.modal.cancel}
              </button>
              <button
                type="button"
                onClick={() => formik.handleSubmit()}
                disabled={formik.isSubmitting}
                className="px-5 py-2.5 rounded-2xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {formik.isSubmitting ? "..." : t.modal.save}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {viewTerm && (
          <Modal onClose={() => setViewTerm(null)} wide>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-text">{viewTerm.title}</h2>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${CATEGORY_STYLES[viewTerm.category]}`}>
                  {t.categories[viewTerm.category]}
                </span>
                <span className="text-xs text-text-muted font-mono">v{viewTerm.version}</span>
              </div>
              <button onClick={() => setViewTerm(null)}
                className="w-9 h-9 flex items-center justify-center hover:bg-bg-subtle rounded-xl transition-colors text-text-muted">
                <RiCloseLine />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[65vh]">
              <pre className="whitespace-pre-wrap font-sans text-sm text-text leading-relaxed">{viewTerm.content}</pre>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-bg-subtle/50">
              <span className="text-xs text-text-muted">
                {t.table.updated}: {new Date(viewTerm.updated_at).toLocaleString()}
              </span>
              <button
                onClick={() => { setViewTerm(null); setFormModal({ open: true, term: viewTerm }); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                <RiEditLine /> {t.modal.editTitle}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteTerm && (
          <Modal onClose={() => setDeleteTerm(null)}>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-danger/10 flex items-center justify-center text-danger text-xl">
                  <RiAlertLine />
                </div>
                <h2 className="text-lg font-black text-text">{t.modal.deleteTitle}</h2>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                {t.modal.deleteMessage.replace("{{title}}", deleteTerm.title)}
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteTerm(null)}
                  className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-text-muted border border-border hover:bg-bg-subtle transition-colors"
                >
                  {t.modal.cancel}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-2xl text-sm font-bold bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "..." : t.modal.delete}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-card border border-border rounded-[20px] p-5 flex items-center gap-4 shadow-sm">
      <div className={`text-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-black text-text">{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick, danger = false }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors text-sm ${
        danger
          ? "text-text-muted hover:bg-danger/10 hover:text-danger"
          : "text-text-muted hover:bg-bg-subtle hover:text-text"
      }`}
    >
      {icon}
    </button>
  );
}

function Modal({ children, onClose, wide = false }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`relative w-full bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden ${wide ? "max-w-3xl" : "max-w-xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </div>
  );
}
