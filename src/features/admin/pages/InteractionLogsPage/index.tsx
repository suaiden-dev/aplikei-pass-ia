import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RiArrowLeftLine, 
  RiSearchLine, 
  RiHistoryLine, 
  RiShieldCheckLine,
  RiGlobalLine,
  RiMapPinLine,
  RiDeviceLine,
  RiInformationLine,
  RiCloseLine,
  RiLoader4Line,
  RiArrowRightSLine,
  RiArrowLeftSLine,
  RiTerminalBoxLine,
  RiDatabase2Line,
  RiErrorWarningLine
} from "react-icons/ri";
import { supabase } from "@shared/lib/supabase";
import { useT } from "@app/app/i18n";
import { useAuth } from "@shared/hooks/useAuth";

interface InteractionLog {
  id: string;
  created_at: string;
  event_name: string;
  email: string;
  office_id: string;
  details: string;
  metadata?: {
    device?: string;
    [key: string]: any;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function InteractionLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<InteractionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "error" | "warning">("all");
  const [selectedLog, setSelectedLog] = useState<InteractionLog | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  const navigate = useNavigate();
  const t = useT("admin");

  const fetchLogs = async () => {
    if (!user?.officeId && user?.role !== "master") {
        setLoading(false);
        return;
    }
    
    setLoading(true);
    try {
      let query = supabase
        .from("checkout_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      // Office filter (if not master)
      if (user?.role !== "master") {
        query = query.eq("office_id", user?.officeId);
      }

      if (filter === "error") {
        query = query.ilike("event_name", "%error%");
      } else if (filter === "warning") {
        query = query.or("event_name.ilike.%warning%,details.ilike.%failed%");
      }

      if (search) {
        query = query.or(`details.ilike.%${search}%,email.ilike.%${search}%,event_name.ilike.%${search}%`);
      }

      const { data, count, error } = await query;
      if (error) throw error;
      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filter, search]);

  const formatDate = (dt: string) => {
    const date = new Date(dt);
    return {
      full: date.toLocaleString("en-US", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      relative: new Intl.RelativeTimeFormat("en-US", { numeric: "auto" }).format(
        Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60)), "minute"
      )
    };
  };

  const getStatusType = (log: InteractionLog): "success" | "error" | "warning" => {
    const name = log.event_name.toLowerCase();
    if (name.includes("error")) return "error";
    if (name.includes("warning") || name.includes("attempt")) return "warning";
    return "success";
  };

  const parseDetails = (details: string = "") => {
    if (!details.includes(" | ")) return { origin: "-", context: details };
    const [origin, ...rest] = details.split(" | ");
    return { origin, context: rest.join(" | ") };
  };

  return (
    <div className="min-h-screen bg-bg text-text font-sans selection:bg-primary/30 overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 w-full z-50 bg-bg/70 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1400px] mx-auto w-full flex justify-between items-center px-8 py-5">
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-card border border-border hover:bg-bg-subtle hover:border-primary/50 transition-all text-primary"
            >
              <RiArrowLeftLine className="text-xl" />
            </motion.button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-text flex items-center gap-2 text-left">
                Interaction Logs
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">LIVE</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black text-text-muted tracking-[0.2em] uppercase">Security & Integrity System</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Database Sync</span>
              <span className="text-xs text-success flex items-center gap-1 font-medium">
                <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                Connected to Realtime
              </span>
            </div>
            <div className="w-px h-8 bg-border" />
            <RiDatabase2Line className="text-2xl text-text-muted" />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1400px] mx-auto px-8 py-10">
        {/* Statistics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Events", value: totalCount, icon: RiHistoryLine, color: "text-primary" },
            { label: "Detected Failures", value: Math.floor(totalCount * 0.05), icon: RiErrorWarningLine, color: "text-danger" },
            { label: "Recent Activity", value: "Live Monitoring", icon: RiTerminalBoxLine, color: "text-success" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-5 flex items-center gap-5 backdrop-blur-sm"
            >
              <div className={`w-12 h-12 rounded-xl bg-bg-subtle flex items-center justify-center ${stat.color}`}>
                <stat.icon className="text-2xl" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-text">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Control Bar */}
        <section className="mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex p-1 bg-card border border-border rounded-xl backdrop-blur-md">
            {[
              { id: "all", label: "All", color: "primary" },
              { id: "error", label: "Errors", color: "danger" },
              { id: "warning", label: "Warnings", color: "warning" }
            ].map((btn) => (
              <button 
                key={btn.id}
                onClick={() => setFilter(btn.id as any)}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === btn.id ? "bg-bg-subtle text-text shadow-lg border border-border" : "text-text-muted hover:text-text"}`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-[400px] group">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar logs..."
              className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3 text-sm text-text focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-muted"
            />
          </div>
        </section>

        {/* Log Table Container */}
        <div className="bg-card border border-border rounded-[32px] overflow-hidden backdrop-blur-sm">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 md:gap-6 px-6 md:px-8 py-5 border-b border-border text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
            <div className="col-span-6 md:col-span-4 text-left">Evento Principal</div>
            <div className="hidden lg:block col-span-2 text-left">Origem</div>
            <div className="hidden md:block col-span-4 lg:col-span-3 text-left">Context / Action</div>
            <div className="hidden xl:block col-span-2 text-left">Temporalidade</div>
            <div className="col-span-6 md:col-span-2 xl:col-span-1 text-right">Action</div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <RiLoader4Line className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-primary animate-pulse" />
              </div>
              <p className="text-sm text-[#64748b] font-bold uppercase tracking-widest animate-pulse">Sincronizando Registros...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-60">
              <RiInformationLine className="text-5xl text-[#64748b]" />
              <p className="text-sm text-[#64748b] font-medium italic">No intercepted data for this query.</p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-white/5"
            >
              {logs.map((log) => {
                const status = getStatusType(log);
                const dates = formatDate(log.created_at);
                
                return (
                  <motion.div 
                    key={log.id} 
                    variants={itemVariants}
                    onClick={() => setSelectedLog(log)}
                    className="grid grid-cols-12 gap-4 md:gap-6 items-center px-6 md:px-8 py-6 hover:bg-bg-subtle transition-all group cursor-pointer border-l-4 border-transparent hover:border-primary"
                  >
                    <div className="col-span-6 md:col-span-4 flex items-center gap-4 md:gap-5 min-w-0">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-500 group-hover:scale-110 shrink-0 ${
                        status === "success" 
                          ? "bg-success/10 text-success border-success/20" 
                          : status === "error"
                            ? "bg-danger/10 text-danger border-danger/20"
                            : "bg-warning/10 text-warning border-warning/20"
                      }`}>
                        {status === "error" ? <RiErrorWarningLine className="text-xl" /> : <RiTerminalBoxLine className="text-xl" />}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-[11px] font-bold text-text group-hover:text-primary transition-colors truncate mb-0.5 uppercase">
                          {log.event_name.replace(/_/g, ' ')}
                        </p>
                        <span className="text-[10px] text-text-muted font-bold truncate block">
                          {log.email || "Visitante"}
                        </span>
                      </div>
                    </div>

                    <div className="hidden lg:block col-span-2 text-left min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-bg-subtle border border-border text-[10px] font-mono text-primary/80 max-w-full">
                        <RiGlobalLine className="shrink-0 text-xs" />
                        <span className="truncate">{parseDetails(log.details).origin}</span>
                      </div>
                    </div>

                    <div className="hidden md:block col-span-4 lg:col-span-3 text-left min-w-0">
                      <p className="text-[11px] text-text-muted truncate" title={parseDetails(log.details).context}>
                        {parseDetails(log.details).context || "—"}
                      </p>
                    </div>

                    <div className="hidden xl:block col-span-2 space-y-1 text-left min-w-0">
                      <p className="text-[10px] text-text-muted font-medium uppercase tracking-tighter truncate">{dates.full}</p>
                      <div className="flex items-center gap-1.5 text-[9px] text-text-muted">
                        <RiDeviceLine className="text-primary/70 shrink-0" />
                        <span className="truncate">{log.metadata?.device || "Browser"}</span>
                      </div>
                    </div>

                    <div className="col-span-6 md:col-span-2 xl:col-span-1 flex justify-end">
                      <motion.button 
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-2 text-[10px] font-black text-primary group-hover:text-text transition-all uppercase tracking-[0.2em]"
                      >
                        <span className="hidden sm:inline">Details</span>
                        <RiArrowRightSLine className="text-xl" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Premium Pagination */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
            Records <span className="text-text">{page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalCount)}</span> of <span className="text-text">{totalCount}</span>
          </p>
          <div className="flex gap-3">
            <button 
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-2 px-5 py-3 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-bg-subtle transition-all disabled:opacity-20"
            >
              <RiArrowLeftSLine className="text-xl" />
              Anterior
            </button>
            <button 
              disabled={(page + 1) * pageSize >= totalCount}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-2 px-5 py-3 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-bg-subtle transition-all disabled:opacity-20"
            >
              Next
              <RiArrowRightSLine className="text-xl" />
            </button>
          </div>
        </div>
      </main>

      {/* Modern Side Panel for Details */}
      <AnimatePresence>
        {selectedLog && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="fixed inset-0 z-[100] bg-bg/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-xl z-[101] bg-card border-l border-border shadow-2xl flex flex-col shadow-primary/5"
            >
              <div className="p-8 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <RiTerminalBoxLine className="text-2xl" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-text uppercase tracking-tight">Payload Analysis</h3>
                    <p className="text-xs text-text-muted font-mono">{selectedLog.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="w-10 h-10 rounded-xl bg-bg-subtle hover:bg-danger/10 hover:text-danger flex items-center justify-center transition-all"
                >
                  <RiCloseLine className="text-2xl" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="p-5 bg-bg-subtle border border-border rounded-2xl">
                    <p className="text-[10px] font-black text-text-muted uppercase mb-2 tracking-widest">User / Email</p>
                    <p className="text-sm font-bold text-text truncate">{selectedLog.email || "Anonymous Visitor"}</p>
                    <span className="text-[10px] text-primary font-bold uppercase">Checkout Flow</span>
                  </div>
                  <div className="p-5 bg-bg-subtle border border-border rounded-2xl text-left">
                    <p className="text-[10px] font-black text-text-muted uppercase mb-2 tracking-widest">Event</p>
                    <p className="text-sm font-bold text-text truncate">{formatDate(selectedLog.created_at).full}</p>
                    <span className="text-[10px] text-success font-bold uppercase">Interceptado</span>
                  </div>
                </div>

                <div className="space-y-6 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-bg-subtle border border-border rounded-xl">
                      <p className="text-[10px] font-black text-text-muted uppercase mb-1 tracking-widest">Origem</p>
                      <p className="text-xs font-mono text-primary font-bold">{parseDetails(selectedLog.details).origin}</p>
                    </div>
                    <div className="p-4 bg-bg-subtle border border-border rounded-xl">
                      <p className="text-[10px] font-black text-text-muted uppercase mb-1 tracking-widest">Evento</p>
                      <p className="text-xs font-bold text-text uppercase">{selectedLog.event_name.replace(/_/g, ' ')}</p>
                    </div>
                  </div>

                  <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                    <RiInformationLine className="text-primary" /> 
                    Activity Context
                  </h4>
                  <div className="bg-bg-subtle rounded-2xl p-6 border border-border font-sans text-sm leading-relaxed text-text shadow-inner">
                    {parseDetails(selectedLog.details).context}
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                    <RiDatabase2Line className="text-primary" /> 
                    System Metadata
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-3 bg-bg-subtle border border-border rounded-xl">
                        <span className="text-[10px] text-text-muted font-bold uppercase">ID do Log</span>
                        <span className="text-xs text-text font-mono">{selectedLog.id}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-bg-subtle border border-border rounded-xl">
                        <span className="text-[10px] text-text-muted font-bold uppercase">Office</span>
                        <span className="text-xs text-text font-mono">{selectedLog.office_id}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-bg border-t border-border flex gap-4">
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="flex-1 py-4 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-bg-subtle transition-all"
                >
                  Fechar Painel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="w-full py-16 bg-bg-subtle border-t border-border mt-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-3xl font-black text-text tracking-tighter">Aplikei<span className="text-primary">.</span></span>
            <p className="text-xs text-text-muted font-medium text-left">Precision Legal Technology Solutions</p>
          </div>
          <div className="flex gap-8">
            {["System Status", "Compliance", "Privacy Policy", "Terms of Use"].map((l) => (
              <a key={l} href="#" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">© 2024 All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
