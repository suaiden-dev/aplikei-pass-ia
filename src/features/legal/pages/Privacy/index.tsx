import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useT } from "@app/app/i18n";
import { fetchPublishedLegalTerms } from "@features/legal/services/legalTermsService";
import type { LegalTerm, LegalTermCategory } from "@features/legal/types";
import { LegalLayout } from "../LegalLayout";

export default function Privacy() {
  const t = useT("legal");
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") ?? "customer";
  const category: LegalTermCategory = role === "lawyer" ? "lawyer_privacy" : "customer_privacy";

  const [dbTerms, setDbTerms] = useState<LegalTerm[]>([]);

  useEffect(() => {
    fetchPublishedLegalTerms(category).then(setDbTerms).catch(() => setDbTerms([]));
  }, [category]);

  return (
    <LegalLayout>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="max-w-4xl">
          <h1 className="font-display text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            {t.privacy.title}
          </h1>

          <p className="mt-5 max-w-2xl text-base italic leading-relaxed text-slate-500 sm:text-lg">
            {t.privacy.subtitle}
          </p>
        </div>

        <div className="mt-12 space-y-10">
          {dbTerms.map((term, i) => (
            <section key={term.id} className="group">
              <h2 className="mb-4 flex items-center gap-3 font-display text-xl font-bold text-slate-800 sm:text-2xl">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  {i + 1}
                </span>
                {term.title}
              </h2>
              <div
                className="prose prose-slate max-w-none pl-11 text-slate-600 prose-headings:text-slate-900 prose-a:text-primary prose-strong:text-slate-900 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: term.content }}
              />
            </section>
          ))}

          {dbTerms.length === 0 && (
            <p className="py-16 text-center text-sm text-slate-400">
              {t.privacy.empty}
            </p>
          )}
        </div>
      </div>
    </LegalLayout>
  );
}
