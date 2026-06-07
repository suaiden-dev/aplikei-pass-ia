import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@shared/lib/supabase";
import { LegalLayout } from "../LegalLayout";

interface LegalTerm {
    id: string;
    title: string;
    content: string;
}

export default function Terms() {
    const [searchParams] = useSearchParams();
    const role = searchParams.get("role") ?? "customer";
    const category = role === "lawyer" ? "lawyer_terms" : "customer_terms";

    const [dbTerms, setDbTerms] = useState<LegalTerm[]>([]);

    useEffect(() => {
        supabase
            .from("legal_terms")
            .select("id, title, content")
            .eq("category", category)
            .eq("is_active", true)
            .order("created_at", { ascending: true })
            .then(({ data }) => setDbTerms(data ?? []));
    }, [category]);

    return (
        <LegalLayout>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Termos de Uso
                </h1>

                <div className="mt-10 space-y-10">
                    {dbTerms.map((term, i) => (
                        <section key={term.id} className="group">
                            <h2 className="font-display text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                                    {i + 1}
                                </span>
                                {term.title}
                            </h2>
                            <div
                                className="pl-11 prose prose-sm max-w-none text-slate-600 dark:text-slate-400 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                                dangerouslySetInnerHTML={{ __html: term.content }}
                            />
                        </section>
                    ))}

                    {dbTerms.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-16">
                            Nenhum termo publicado no momento.
                        </p>
                    )}
                </div>
            </div>
        </LegalLayout>
    );
}
