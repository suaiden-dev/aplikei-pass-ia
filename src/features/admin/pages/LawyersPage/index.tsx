import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RiUserStarLine,
  RiSearchLine,
  RiLoader4Line,
  RiShieldUserLine,
  RiTimeLine,
  RiMoneyDollarBoxLine,
} from "react-icons/ri";
import { listLawyers } from "@features/admin/services/lawyersService";
import type { LawyerRow } from "@features/admin/types";
import { toast } from "sonner";
import { useT, useLocale } from "@app/app/i18n";

function getLawyerName(lawyer: LawyerRow, t: any) {
  return lawyer.full_name || lawyer.name || lawyer.email || t.cases.table.noName;
}

export default function LawyersPage() {
  const t = useT("admin");
  const { lang: language } = useLocale();
  const [lawyers, setLawyers] = useState<LawyerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setLawyers(await listLawyers());
    } catch (err: any) {
      console.error("Error loading lawyers:", err);
      toast.error(t.cases.messages.errorAction);
    } finally {
      setIsLoading(false);
    }
  }, [t.cases.messages.errorAction]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredLawyers = useMemo(() => {
    if (!searchTerm) return lawyers;
    const s = searchTerm.toLowerCase();
    return lawyers.filter(
      (l) =>
        l.full_name?.toLowerCase().includes(s) ||
        l.name?.toLowerCase().includes(s) ||
        l.email?.toLowerCase().includes(s)
    );
  }, [lawyers, searchTerm]);

  const statsCount = useMemo(() => {
    return {
      total: lawyers.length,
      active: lawyers.filter((l) => l.is_active !== false).length,
      inactive: lawyers.filter((l) => l.is_active === false).length,
      recent: lawyers.filter((l) => {
        const date = new Date(l.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }).length,
    };
  }, [lawyers]);

  const dateFormat = new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="text-left">
          <h1 className="font-display font-black text-3xl text-text tracking-tight">
            {t.lawyers.title}
          </h1>
          <p className="text-sm text-text-muted mt-1 uppercase font-bold tracking-wider">
            {t.lawyers.subtitle}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-text-muted text-xs font-black uppercase tracking-widest hover:bg-bg-subtle transition-all shadow-sm"
        >
          <RiLoader4Line className={isLoading ? "animate-spin" : ""} />
          {t.shared.loading}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label={t.lawyers.stats.total}
          value={statsCount.total}
          icon={<RiUserStarLine />}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          label={t.lawyers.stats.active}
          value={statsCount.active}
          icon={<RiShieldUserLine />}
          color="bg-success/10 text-success"
        />
        <StatCard
          label={t.lawyers.stats.pending}
          value={statsCount.inactive}
          icon={<RiTimeLine />}
          color="bg-warning/10 text-warning"
        />
        <StatCard
          label={t.lawyers.stats.recent}
          value={statsCount.recent}
          icon={<RiMoneyDollarBoxLine />}
          color="bg-info/10 text-info"
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
        <div className="flex-1 relative group w-full">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder={t.lawyers.table.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-6 bg-card border border-border rounded-2xl text-sm font-medium text-text outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-xl shadow-black/5 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-40">
            <RiLoader4Line className="text-4xl text-primary animate-spin" />
          </div>
        ) : filteredLawyers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-20 h-20 rounded-3xl bg-bg-subtle flex items-center justify-center mb-6">
              <RiUserStarLine className="text-3xl text-border" />
            </div>
            <p className="text-text-muted font-bold tracking-tight text-lg">
              {t.lawyers.table.noResults}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-subtle/50">
                  <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border">
                    {t.lawyers.table.lawyer}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border">
                    {t.lawyers.table.status}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border">
                    {t.lawyers.table.admission}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border text-right">
                    {t.lawyers.table.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLawyers.map((l, idx) => (
                  <motion.tr
                    key={l.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="group border-b border-border hover:bg-bg-subtle/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-bg-subtle flex items-center justify-center text-text-muted overflow-hidden shadow-inner">
                          {l.avatar_url ? (
                            <img src={l.avatar_url} alt={getLawyerName(l, t)} className="w-full h-full object-cover" />
                          ) : (
                            <RiUserStarLine className="text-xl" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-text leading-tight tracking-tight uppercase">
                            {getLawyerName(l, t)}
                          </p>
                          <p className="text-[11px] text-text-muted font-bold tracking-tight">
                            {l.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          l.is_active !== false
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-danger/10 text-danger border-danger/20"
                        }`}
                      >
                        {l.is_active !== false ? t.lawyers.table.active : t.lawyers.table.inactive}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-widest">
                        {dateFormat.format(new Date(l.created_at))}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <button className="text-xs font-black uppercase tracking-widest text-primary hover:underline transition-all">
                        {t.lawyers.table.details}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="p-6 rounded-[24px] bg-card border border-border shadow-sm transition-all hover:shadow-md h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-lg shadow-sm font-black`}
        >
          {icon}
        </div>
        <div className="text-2xl font-black text-text tracking-tight">
          {value}
        </div>
      </div>
      <div className="text-left">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">
          {label}
        </p>
      </div>
    </div>
  );
}
