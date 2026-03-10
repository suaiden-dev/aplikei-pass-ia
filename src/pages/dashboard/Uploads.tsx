import { Button } from "@/components/ui/button";
import {
  Upload as UploadIcon,
  File,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

export default function Uploads() {
  const { lang, t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const u = t.uploads;
  const [dbDocs, setDbDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocName, setSelectedDocName] = useState<string | null>(null);

  const expectedDocs = u.docs[lang];

  useEffect(() => {
    if (authLoading || !user) return;
    fetchDocs();
  }, [user, authLoading]);

  const fetchDocs = async () => {
    if (!user?.id) return;
    const { data: docs } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id);

    if (docs) setDbDocs(docs);
    setLoading(false);
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docName: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !docName || !user) return;

    setUploading(docName);
    try {
      // Buscar serviço relacionado
      const { data: service } = await supabase
        .from("user_services")
        .select("id, status")
        .eq("user_id", user.id)
        .in("status", [
          "active",
          "ds160InProgress",
          "ds160Processing",
          "ds160AwaitingReviewAndSignature",
          "review_pending",
          "review_assign",
        ])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!service) throw new Error("No active service");

      const isProcessSpecialDoc =
        docName === "ds160_assinada" || docName === "ds160_comprovante";
      const bucketName = isProcessSpecialDoc
        ? "process-documents"
        : "documents";
      const folderPath = isProcessSpecialDoc ? service.id : user.id;
      const fileExt = file.name.split(".").pop();
      const filePath = `${folderPath}/${docName.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Inserir ou atualizar metadados na tabela
      const { error: dbError } = await supabase.from("documents").upsert(
        {
          user_id: user.id,
          user_service_id: service.id,
          name: docName,
          storage_path: filePath,
          bucket_id: bucketName,
          status: "received",
          created_at: new Date().toISOString(),
        },
        { onConflict: "user_id,name" },
      ); // Ajuste: talvez precise de uma constraint unique em user_id, name

      if (dbError) throw dbError;

      toast.success(
        lang === "pt"
          ? "Documento enviado com sucesso!"
          : "Document uploaded successfully!",
      );
      fetchDocs();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(null);
    }
  };

  const statusConfig = {
    received: {
      label: u.received[lang],
      icon: <CheckCircle2 className="h-4 w-4 text-accent" />,
      color: "text-accent",
    },
    pending: {
      label: u.pending[lang],
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      color: "text-muted-foreground",
    },
    resubmit: {
      label: u.resubmit[lang],
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
      color: "text-amber-500",
    },
    approved: {
      label: lang === "pt" ? "Aprovado" : "Approved",
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      color: "text-green-500",
    },
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
        <div className="mt-4 rounded-md border border-border bg-card p-4">
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 shadow-card md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-title font-bold text-foreground">
        {u.title[lang]}
      </h1>
      <p className="mt-1 text-muted-foreground">{u.subtitle[lang]}</p>
      <div className="mt-4 rounded-md border border-border bg-card p-4 shadow-card">
        <p className="text-sm text-muted-foreground">
          💡{" "}
          <strong>
            {lang === "en" ? "Tip:" : lang === "pt" ? "Dica:" : "Consejo:"}
          </strong>{" "}
          {u.tip[lang]}
        </p>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => selectedDocName && handleUpload(e, selectedDocName)}
      />

      <div className="mt-4 space-y-3">
        {expectedDocs.map((name, i) => {
          const doc = dbDocs.find((d) => d.name === name);
          const status = doc?.status || "pending";
          const st = statusConfig[status as keyof typeof statusConfig];
          const isUploading = uploading === name;

          return (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 shadow-card md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-3 md:items-center">
                <File className="mt-1 h-5 w-5 shrink-0 text-muted-foreground md:mt-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 md:mt-0">
                    {isUploading ? (
                      <Loader2 className="h-3 w-3 animate-spin text-accent" />
                    ) : (
                      st.icon
                    )}
                    <span className={`text-xs font-medium ${st.color}`}>
                      {isUploading
                        ? lang === "pt"
                          ? "Enviando..."
                          : "Uploading..."
                        : st.label}
                    </span>
                    {doc?.storage_path && !isUploading && (
                      <span className="truncate text-xs text-muted-foreground">
                        — {doc.storage_path.split("/").pop()?.split("_")[0]}.
                        {doc.storage_path.split(".").pop()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant={status === "resubmit" ? "default" : "outline"}
                className={`w-full md:w-auto ${status === "resubmit" ? "bg-accent text-accent-foreground hover:bg-green-dark" : ""}`}
                disabled={isUploading || status === "approved"}
                onClick={() => {
                  setSelectedDocName(name);
                  fileInputRef.current?.click();
                }}
              >
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UploadIcon className="mr-1 h-3.5 w-3.5" />
                )}
                {status === "resubmit" ? u.resubmit[lang] : u.upload[lang]}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
