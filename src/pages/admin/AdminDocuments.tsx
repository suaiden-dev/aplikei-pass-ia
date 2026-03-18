import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminDataTable } from "@/presentation/components/organisms/admin/AdminDataTable";
import { Badge } from "@/presentation/components/atoms/badge";
import { Button } from "@/presentation/components/atoms/button";
import {
  FileText,
  Download,
  User,
  ExternalLink,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DocumentItem {
  [key: string]: unknown;
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at: string;
  client_name?: string;
  client_id?: string;
  status?: string;
  bucket_id?: string;
}

export default function AdminDocuments() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data: files, error: filesError } = await supabase
        .from("documents")
        .select(
          "id, name, storage_path, status, created_at, user_service_id, user_id, bucket_id, profiles (full_name)",
        )
        .order("created_at", { ascending: false });

      if (filesError) throw filesError;

      const enrichedDocs = (files || []).map((f) => {
        const file = f as Record<string, unknown>;
        const profiles = file.profiles as Record<string, unknown> | null;
        return {
          id: file.id as string,
          file_name: file.name as string,
          file_path: file.storage_path as string,
          file_type: "documento",
          created_at: file.created_at as string,
          service_request_id: file.user_service_id as string,
          client_name: profiles?.full_name as string || "Desconhecido",
          client_id: file.user_id as string,
          status: (file.status as string) || "pending",
          bucket_id: (file.bucket_id as string) || "documents",
        };
      });

      setDocuments(enrichedDocs);
    } catch (error: unknown) {
      console.error("Erro ao carregar documentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(
    (doc) => statusFilter === "all" || doc.status === statusFilter,
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-title font-bold text-foreground">
          Central de Documentos
        </h2>
        <p className="text-muted-foreground">
          Fila de verificação de arquivos de identidade e formulários.
        </p>
      </div>

      <div className="flex items-center gap-4 border-b border-border pb-4 overflow-x-auto">
        <Button
          variant={statusFilter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          Todos
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "ghost"}
          size="sm"
          onClick={() => setStatusFilter("pending")}
          className="gap-2"
        >
          <Clock className="h-4 w-4" /> Pendentes
        </Button>
        <Button
          variant={statusFilter === "processing" ? "default" : "ghost"}
          size="sm"
          onClick={() => setStatusFilter("processing")}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" /> Em Processamento
        </Button>
        <Button
          variant={statusFilter === "completed" ? "default" : "ghost"}
          size="sm"
          onClick={() => setStatusFilter("completed")}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4 text-green-500" /> Concluídos
        </Button>
      </div>

      <div className="rounded-md bg-card">
        <AdminDataTable
          loading={loading}
          data={filteredDocuments}
          columns={[
            {
              key: "file_name",
              header: "Documento",
              render: (item) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="max-w-[200px]">
                    <p className="font-medium truncate text-sm">
                      {(item.file_name as string) || "Documento"}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      {(item.file_type as string).replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              key: "client_name",
              header: "Cliente",
              render: (item) => (
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{item.client_name as string}</span>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status Documento",
              render: (item) => {
                const status = (item.status as string) || "pending";
                let variant:
                  | "default"
                  | "secondary"
                  | "destructive"
                  | "outline" = "secondary";
                if (status === "approved") variant = "default";
                if (status === "received") variant = "secondary";
                if (status === "resubmit") variant = "destructive";
                if (status === "pending") variant = "outline";

                return (
                  <Badge variant={variant} className="capitalize text-[10px]">
                    {status}
                  </Badge>
                );
              },
            },
            {
              key: "created_at",
              header: "Enviado em",
              render: (item) => (
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.created_at as string)}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (item) => (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      const { data } = supabase.storage
                        .from((item.bucket_id as string) || "documents")
                        .getPublicUrl(item.file_path as string);
                      window.open(data.publicUrl, "_blank");
                    }}
                    title="Baixar arquivo"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      navigate(`/admin/clientes/${item.client_id as string}`)
                    }
                    title="Ver cliente"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
          searchKeys={["file_name", "client_name"]}
          searchPlaceholder="Buscar documento ou cliente..."
        />
      </div>
    </div>
  );
}
