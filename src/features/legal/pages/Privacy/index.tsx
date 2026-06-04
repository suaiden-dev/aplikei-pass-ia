import { useState, useEffect } from "react";
import { useT } from "@app/app/i18n";
import { supabase } from "@shared/lib/supabase";
import { LegalLayout } from "../LegalLayout";

interface LegalTerm {
  id: string;
  title: string;
  content: string;
  version: string;
}

export default function Privacy() {
    const t = useT("legal");
    const p = t.privacy;
    const [dbTerms, setDbTerms] = useState<LegalTerm[]>([]);

    useEffect(() => {
      supabase
        .from("legal_terms")
        .select("id, title, content, version")
        .eq("category", "customer")
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .then(({ data }) => setDbTerms(data ?? []));
    }, []);

    const staticSections = p.sections as { title: string; content: string }[];
    const totalSections = staticSections.length + dbTerms.length;

    return (
        <LegalLayout>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {p.title}
                </h1>
                <p className="mt-3 text-sm text-slate-500 font-medium">
                    {t.lastUpdated}
                </p>

                <div className="mt-10 space-y-10">
                    {staticSections.map((s, i) => (
                        <section key={i} className="group">
                            <h2 className="font-display text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                                    {i + 1}
                                </span>
                                {s.title}
                            </h2>
                            <div className="pl-11">
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                                    {s.content}
                                </p>
                            </div>
                        </section>
                    ))}

                    {dbTerms.map((term, i) => (
                        <section key={term.id} className="group">
                            <h2 className="font-display text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                                    {staticSections.length + i + 1}
                                </span>
                                {term.title}
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                    v{term.version}
                                </span>
                            </h2>
                            <div className="pl-11">
                                <pre className="text-slate-600 dark:text-slate-400 leading-relaxed text-base whitespace-pre-wrap font-sans">
                                    {term.content}
                                </pre>
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </LegalLayout>
    );
}