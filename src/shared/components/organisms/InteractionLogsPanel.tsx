import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RiSearchLine, 
  RiHistoryLine, 
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

interface ProcessLog {
  id: string;
  user_service_id: string;
  actor_name?: string;
  actor_role?: string;
  action?: string;
  message?: string;
  metadata?: any;
  created_at: string;
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

interface InteractionLogsPanelProps {
  userServiceId?: string;
  hideHeader?: boolean;
}

export function InteractionLogsPanel({ userServiceId, hideHeader = false }: InteractionLogsPanelProps) {
  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "error" | "warning">("all");
  const [selectedLog, setSelectedLog] = useState<ProcessLog | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [globalTotalCount, setGlobalTotalCount] = useState(0);
  const [globalErrorCount, setGlobalErrorCount] = useState(0);
  const pageSize = 12;

  const navigate = useNavigate();
  const t = useT("admin");

  const fetchGlobalStats = async () => {
    try {
      let totalQuery = supabase.from("process_logs").select("id", { count: "exact", head: true });
      if (userServiceId) {
        totalQuery = totalQuery.eq("user_service_id", userServiceId);
      }
      const { count: total } = await totalQuery;
      setGlobalTotalCount(total || 0);

      let errorQuery = supabase
        .from("process_logs")
        .select("id", { count: "exact", head: true })
        .or("message.ilike.%erro%,action.ilike.%erro%");
      if (userServiceId) {
        errorQuery = errorQuery.eq("user_service_id", userServiceId);
      }
      const { count: errors } = await errorQuery;
      setGlobalErrorCount(errors || 0);
    } catch (err) {
      console.error("Error fetching global stats:", err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      void fetchGlobalStats();

      let query = supabase
        .from("process_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (userServiceId) {
        query = query.eq("user_service_id", userServiceId);
      }

      if (filter === "error") {
        query = query.or("message.ilike.%erro%,action.ilike.%erro%");
      } else if (filter === "warning") {
        query = query.or("message.ilike.%aviso%,message.ilike.%warning%,message.ilike.%pendente%,message.ilike.%tentativa%,action.ilike.%aviso%,action.ilike.%warning%,action.ilike.%pendente%,action.ilike.%tentativa%");
      }

      if (search) {
        query = query.or(`message.ilike.%${search}%,actor_name.ilike.%${search}%`);
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
  }, [page, filter, search, userServiceId]);

  const formatDate = (dt: string) => {
    const date = new Date(dt);
    return {
      full: date.toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
      time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      relative: new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" }).format(
        Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60)), "minute"
      )
    };
  };

  const getStatusType = (log: ProcessLog): "success" | "error" | "warning" => {
    const msg = (log.message || log.action || "").toLowerCase();
    if (msg.includes("erro") || msg.includes("error") || msg.includes("falhou")) return "error";
    if (msg.includes("aviso") || msg.includes("warning") || msg.includes("pendente")) return "warning";
    return "success";
  };

  return (
    <div className="relative z-10 w-full space-y-10">
      {!hideHeader && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Total de Eventos", value: globalTotalCount, icon: RiHistoryLine, color: "text-primary" },
            { label: "Falhas Identificadas", value: globalErrorCount, icon: RiErrorWarningLine, color: "text-danger" }
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
                <p className="text-xl font-black text-text">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <section className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex p-1 bg-card border border-border rounded-xl backdrop-blur-md">
          {[
            { id: "all", label: "All", color: "primary" },
            { id: "error", label: "Errors", color: "danger" },
            { id: "warning", label: "Warnings", color: "warning" }
          ].map((btn) => (
            <button 
              key={btn.id}
              onClick={() => {
                setFilter(btn.id as any);
                setPage(0);
              }}
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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search logs..."
            className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3 text-sm text-text focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-muted"
          />
        </div>
      </section>

      <div className="bg-card border border-border rounded-[32px] overflow-hidden backdrop-blur-sm">
        <div className="grid grid-cols-12 gap-6 px-8 py-5 border-b border-border text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
          <div className="col-span-5 md:col-span-4 text-left">Evento Principal</div>
          <div className="hidden md:block col-span-3 text-left">Origem e Contexto</div>
          <div className="hidden md:block col-span-3 text-left">Temporalidade</div>
          <div className="col-span-7 md:col-span-2 text-right">Action</div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <RiLoader4Line className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-primary animate-pulse" />
            </div>
            <p className="text-sm text-text-muted font-bold uppercase tracking-widest animate-pulse">Syncing records...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-60">
            <RiInformationLine className="text-5xl text-text-muted" />
            <p className="text-sm text-text-muted font-medium italic">No intercepted data for this query.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-border"
          >
            {logs.map((log) => {
              const status = getStatusType(log);
              const dates = formatDate(log.created_at);
              
              return (
                <motion.div 
                  key={log.id} 
                  variants={itemVariants}
                  onClick={() => setSelectedLog(log)}
                  className="grid grid-cols-12 gap-6 items-center px-8 py-6 hover:bg-bg-subtle/30 transition-all group cursor-pointer border-l-4 border-transparent hover:border-primary"
                >
                  <div className="col-span-5 md:col-span-4 flex items-center gap-5">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all duration-500 group-hover:scale-110 ${
                      status === "success" 
                        ? "bg-success/10 text-success border-success/20 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                        : status === "error"
                          ? "bg-danger/10 text-danger border-danger/20 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                          : "bg-warning/10 text-warning border-warning/20 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                    }`}>
                      {status === "error" ? <RiErrorWarningLine className="text-2xl" /> : <RiTerminalBoxLine className="text-2xl" />}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-sm font-black text-text group-hover:text-primary transition-colors truncate mb-1">
                        {log.message || log.action || "Undefined Event"}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${
                          status === "success" ? "bg-success/10 text-success border-success/20" :
                          status === "error" ? "bg-danger/10 text-danger border-danger/20" :
                          "bg-warning/10 text-warning border-warning/20"
                        }`}>
                          {status.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-text-muted font-bold truncate">
                          {log.actor_name || "System Core"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block col-span-3 space-y-2 text-left">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <RiGlobalLine className="text-primary/70" />
                      <span className="font-mono">{log.metadata?.ip || "0.0.0.0"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted font-medium">
                      <RiMapPinLine className="text-danger/70" />
                      {log.metadata?.location || "Hidden Location"}
                    </div>
                  </div>

                  <div className="hidden md:block col-span-3 space-y-1.5 text-left">
                    <p className="text-xs text-text font-bold tracking-tight">{dates.full}</p>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold">
                      <RiDeviceLine className="text-primary/70 text-sm" />
                      <span className="truncate max-w-[150px] uppercase">{log.metadata?.device || "Unrecognized"}</span>
                    </div>
                  </div>

                  <div className="col-span-7 md:col-span-2 flex justify-end">
                    <motion.button 
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-[10px] font-black text-primary group-hover:text-text transition-all uppercase tracking-[0.2em]"
                    >
                      Details
                      <RiArrowRightSLine className="text-xl" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
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
            Previous
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
              className="fixed top-0 right-0 h-full w-full max-w-xl z-[101] bg-card border-l border-border shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-border flex items-center justify-between bg-bg-subtle/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <RiTerminalBoxLine className="text-2xl" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-black text-text uppercase tracking-tight">Payload Analysis</h3>
                    <p className="text-[10px] text-text-muted font-mono">{selectedLog.id}</p>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-bg-subtle border border-border rounded-2xl text-left">
                    <p className="text-[10px] font-black text-text-muted uppercase mb-2 tracking-widest">Actor / Owner</p>
                    <p className="text-sm font-black text-text leading-tight">{selectedLog.actor_name || "System"}</p>
                    <span className="text-[10px] text-primary font-black uppercase">{selectedLog.actor_role}</span>
                  </div>
                  <div className="p-5 bg-bg-subtle border border-border rounded-2xl text-left">
                    <p className="text-[10px] font-black text-text-muted uppercase mb-2 tracking-widest">Event</p>
                    <p className="text-sm font-black text-text truncate leading-tight">{formatDate(selectedLog.created_at).full}</p>
                    <span className="text-[10px] text-success font-black uppercase">Validado</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                    <RiInformationLine className="text-primary" /> 
                    Raw Data (JSON)
                  </h4>
                  <div className="bg-bg rounded-2xl p-6 border border-border font-mono text-[11px] leading-relaxed text-text-muted overflow-x-auto shadow-inner text-left">
                    <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
                  </div>
                </div>

                {selectedLog.metadata && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                      <RiGlobalLine className="text-primary" /> 
                      Fingerprint Metadata
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(selectedLog.metadata).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-bg-subtle border border-border rounded-xl">
                          <span className="text-[10px] text-text-muted font-black uppercase tracking-tighter">{key}</span>
                          <span className="text-[11px] text-text font-mono">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-bg-subtle/50 border-t border-border flex gap-4">
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="flex-1 py-4 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-bg-subtle transition-all"
                >
                  Close Panel
                </button>
                {selectedLog.user_service_id && (
                  <button 
                    onClick={() => navigate(`/admin/processes/${selectedLog.user_service_id}`)}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                  >
                    Investigate Process
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
