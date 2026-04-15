import { useT } from "../../../i18n";
import { LegalLayout } from "../LegalLayout";

export default function Privacy() {
    const t = useT("legal");
    const p = t.privacy;

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
                    {p.sections.map((s: any, i: number) => (
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
                </div>
            </div>
        </LegalLayout>
    );
}