import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  RiUserLine,
  RiSearchLine,
  RiLoader4Line,
  RiTeamLine,
  RiVipCrown2Line,
  RiTimeLine,
} from "react-icons/ri";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";
import type { UserAccount } from "../../../services/auth.service";
import { useT, useLocale } from "../../../i18n/LanguageContext";

export interface CustomerWithStats extends UserAccount {
  productsCount: number;
  totalSpent: number;
}

export default function CustomersPage() {
  const t = useT("admin");
  const { lang: language } = useLocale();
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setIsLoading(true);
    try {
      const [
        { data: accountsData, error: accountsErr },
        { data: zelleData },
        { data: stripeData }
      ] = await Promise.all([
        supabase.from("user_accounts").select("*").order("created_at", { ascending: false }),
        supabase.from("zelle_payments").select("amount, user_id, guest_email").eq("status", "approved"),
        supabase.from("visa_orders").select("total_price_usd, client_email").in("payment_status", ["paid", "complete", "succeeded", "completed"])
      ]);

      if (accountsErr) throw accountsErr;

      const enhancedCustomers = (accountsData as UserAccount[]).map(c => {
        let productsCount = 0;
        let totalSpent = 0;

        zelleData?.forEach(z => {
          if (z.user_id === c.id || z.guest_email?.toLowerCase() === c.email?.toLowerCase()) {
            productsCount++;
            totalSpent += Number(z.amount) || 0;
          }
        });

        stripeData?.forEach(s => {
          if (s.client_email?.toLowerCase() === c.email?.toLowerCase()) {
            productsCount++;
            let val = s.total_price_usd;
            if (typeof val === "string") val = parseFloat(val);
            totalSpent += Number(val) || 0;
          }
        });

        return {
          ...c,
          productsCount,
          totalSpent
        };
      });

      setCustomers(enhancedCustomers);
    } catch (err: unknown) {
      console.error("Error loading customers:", err);
      toast.error(t.cases.messages.errorAction);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    const s = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.phone_number?.toLowerCase().includes(s)
    );
  }, [customers, searchTerm]);

  const statsCount = useMemo(() => {
    return {
      total: customers.length,
      customers: customers.filter((c) => c.role === "customer").length,
      admins: customers.filter((c) => c.role === "admin").length,
      recent: customers.filter((c) => {
        const date = new Date(c.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays <= 7;
      }).length,
    };
  }, [customers]);

  const dateFormat = new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US', {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="text-left">
          <h1 className="font-display font-black text-3xl text-slate-800 tracking-tight">
            {t.customers.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1 uppercase font-bold tracking-wider">
            {t.customers.subtitle}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
        >
          <RiLoader4Line className={isLoading ? "animate-spin" : ""} />
          {t.shared.table.refresh}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label={t.customers.stats.totalUsers}
          value={statsCount.total}
          icon={<RiTeamLine />}
          color="bg-slate-100 text-slate-600"
        />
        <StatCard
          label={t.customers.stats.customers}
          value={statsCount.customers}
          icon={<RiUserLine />}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          label={t.customers.stats.admins}
          value={statsCount.admins}
          icon={<RiVipCrown2Line />}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          label={t.customers.stats.newUsers}
          value={statsCount.recent}
          icon={<RiTimeLine />}
          color="bg-emerald-100 text-emerald-600"
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
        <div className="flex-1 relative group w-full">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder={t.customers.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-6 bg-white border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-sm shadow-slate-100"
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-40">
            <RiLoader4Line className="text-4xl text-primary animate-spin" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
              <RiTeamLine className="text-3xl text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold tracking-tight text-lg">
              {t.customers.emptyState}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    {t.customers.table.customerContact}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    {t.customers.table.role}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    {t.customers.table.purchasesSpent}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    {t.customers.table.admissionDate}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">
                    {t.customers.table.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c, idx) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="group border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden shadow-inner">
                          {c.avatar_url ? (
                            <img src={c.avatar_url} alt={c.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <RiUserLine className="text-xl" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-slate-800 leading-tight tracking-tight uppercase">
                            {c.full_name || t.customers.table.noName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[11px] text-slate-400 font-bold tracking-tight">
                              {c.email}
                            </p>
                            {c.phone_number && (
                              <>
                                <span className="text-slate-300">•</span>
                                <p className="text-[11px] text-slate-400 font-bold tracking-tight">
                                  {c.phone_number}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          c.role === "admin"
                            ? "bg-purple-50 text-purple-600 border-purple-100"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                      >
                        {c.role === "admin" ? "Admin" : language === 'pt' ? 'Cliente' : language === 'es' ? 'Cliente' : 'Customer'}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="text-sm font-black text-slate-800 tracking-tight">
                          {c.productsCount === 1 
                            ? t.customers.table.productCount.replace('{{count}}', '1') 
                            : t.customers.table.productsCount.replace('{{count}}', String(c.productsCount))}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-500 tracking-tight">
                          ${c.totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {dateFormat.format(new Date(c.created_at))}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right">
                       {/* You can add actions like edit or view details here */}
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
    <div className="p-6 rounded-[24px] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-lg shadow-sm font-black`}
        >
          {icon}
        </div>
        <div className="text-2xl font-black text-slate-800 tracking-tight">
          {value}
        </div>
      </div>
      <div className="text-left">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
          {label}
        </p>
        <div className="w-full h-1.5 bg-slate-50 rounded-full mt-3 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full ${color.split(" ")[1]} opacity-30`}
            style={{ width: "60%" }}
          />
        </div>
      </div>
    </div>
  );
}
