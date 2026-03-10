import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { statusLabels } from "./AdminStatusTimeline";

interface ProcessLog {
  id: string;
  user_service_id: string;
  actor_id: string | null;
  actor_name: string;
  action_type: string;
  previous_status: string | null;
  new_status: string | null;
  note: string | null;
  created_at: string;
}

interface AdminProcessLogsProps {
  userServiceId: string;
}

export function AdminProcessLogs({ userServiceId }: AdminProcessLogsProps) {
  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("process_logs")
        .select("*")
        .eq("user_service_id", userServiceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Error fetching process logs:", err);
      toast({ title: "Erro ao carregar histórico", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [userServiceId, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleAddNote = async () => {
    if (!noteText.trim() || !user) return;

    setIsSubmitting(true);
    try {
      let adminName = user.user_metadata?.full_name || "Admin";

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) adminName = profile.full_name;

      const { error } = await supabase.from("process_logs").insert({
        user_service_id: userServiceId,
        actor_id: user.id,
        actor_name: adminName,
        action_type: "manual_note",
        note: noteText.trim(),
      });

      if (error) throw error;

      toast({ title: "Observação adicionada com sucesso" });
      setNoteText("");
      fetchLogs();
    } catch (err) {
      console.error("Error adding note to logs:", err);
      toast({ title: "Erro ao adicionar observação", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusLabel = (status: string | null) => {
    if (!status) return "N/A";
    return statusLabels[status] || status;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold">Adicionar Observação</h3>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Textarea
              placeholder="Digite uma observação sobre este processo (ex: Cliente ligou solicitando urgência...)"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
          <Button
            onClick={handleAddNote}
            disabled={!noteText.trim() || isSubmitting}
            className="shrink-0"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b pb-2">
          Histórico do Processo
        </h3>

        {loading ? (
          <div className="flex items-center justify-center p-5">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center p-5 bg-muted/20 rounded-md border border-dashed">
            Nenhum histórico registrado para este processo.
          </p>
        ) : (
          <div className="relative border-l-2 border-muted ml-3 pl-4 space-y-5">
            {logs.map((log) => {
              const d = new Date(log.created_at);
              const dateStr = d.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
              const timeStr = d.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div key={log.id} className="relative">
                  <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-accent ring-2 ring-transparent ring-offset-2" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm">
                      <span className="font-semibold">
                        {dateStr} {timeStr}
                      </span>{" "}
                      —{" "}
                      <span className="font-bold text-accent">
                        {log.actor_name}
                      </span>{" "}
                      {log.action_type === "status_change" ? (
                        <span>
                          alterou o status de{" "}
                          <span className="font-medium bg-muted px-1.5 py-0.5 rounded text-xs">
                            {getStatusLabel(log.previous_status)}
                          </span>{" "}
                          para{" "}
                          <span className="font-medium bg-muted px-1.5 py-0.5 rounded text-xs">
                            {getStatusLabel(log.new_status)}
                          </span>
                        </span>
                      ) : (
                        <span>adicionou uma observação:</span>
                      )}
                    </p>
                    {log.action_type === "manual_note" && log.note && (
                      <div className="mt-2 text-sm text-foreground bg-muted/40 p-3 rounded-md border border-border">
                        {log.note}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
