import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, File, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Uploads() {
  const { lang, t } = useLanguage();
  const u = t.uploads;

  const documents = [
    { name: u.docs[lang][0], status: "received", file: "passport.pdf" },
    { name: u.docs[lang][1], status: "pending", file: null },
    { name: u.docs[lang][2], status: "received", file: "bank_statement.pdf" },
    { name: u.docs[lang][3], status: "resubmit", file: "ties_v1.jpg" },
  ];

  const statusConfig = {
    received: { label: u.received[lang], icon: <CheckCircle2 className="h-4 w-4 text-accent" />, color: "text-accent" },
    pending: { label: u.pending[lang], icon: <Clock className="h-4 w-4 text-muted-foreground" />, color: "text-muted-foreground" },
    resubmit: { label: u.resubmit[lang], icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, color: "text-amber-500" },
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">{u.title[lang]}</h1>
      <p className="mt-1 text-muted-foreground">{u.subtitle[lang]}</p>
      <div className="mt-4 rounded-lg border border-border bg-card p-4 shadow-card">
        <p className="text-sm text-muted-foreground">💡 <strong>{lang === "en" ? "Tip:" : lang === "pt" ? "Dica:" : "Consejo:"}</strong> {u.tip[lang]}</p>
      </div>
      <div className="mt-6 space-y-3">
        {documents.map((doc, i) => {
          const st = statusConfig[doc.status as keyof typeof statusConfig];
          return (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{doc.name}</p>
                  <div className="flex items-center gap-1.5">
                    {st.icon}
                    <span className={`text-xs font-medium ${st.color}`}>{st.label}</span>
                    {doc.file && <span className="text-xs text-muted-foreground">— {doc.file}</span>}
                  </div>
                </div>
              </div>
              <Button size="sm" variant={doc.status === "resubmit" ? "default" : "outline"} className={doc.status === "resubmit" ? "bg-accent text-accent-foreground hover:bg-green-dark" : ""}>
                <UploadIcon className="mr-1 h-3.5 w-3.5" />
                {doc.status === "resubmit" ? u.resubmit[lang] : u.upload[lang]}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
