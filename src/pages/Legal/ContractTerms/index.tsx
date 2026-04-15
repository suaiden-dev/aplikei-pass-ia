import { useLocale, useT } from "../../../i18n";
import { LegalLayout } from "../LegalLayout";

export default function ContractTerms() {
    const { lang } = useLocale();
    const t = useT("legal");
    const p = t.contract;

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
                    <section className="p-8 rounded-3xl bg-primary/[0.03] border border-primary/10">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base font-medium">
                            {lang === "pt" 
                                ? "Este contrato estabelece as diretrizes para a prestação de serviços da Aplikei. Ao utilizar nossa plataforma, você concorda com todos os termos descritos abaixo."
                                : lang === "es"
                                ? "Este contrato establece las directrices para la prestación de servicios de Aplikei. Al usar nuestra plataforma, aceptas todos los términos descritos a continuación."
                                : "This contract establishes the guidelines for Aplikei's service provision. By using our platform, you agree to all the terms described below."}
                        </p>
                    </section>

                    {p.sections.map((s: any, i: number) => (
                        <section key={i} className="group">
                            <h2 className="font-display text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                                    {i + 1}
                                </span>
                                {s.title}
                            </h2>
                            <div className="pl-11 border-l-2 border-slate-100 dark:border-slate-800 ml-4 lg:ml-4 group-hover:border-primary/30 transition-colors">
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base pt-1 pb-4">
                                    {s.content}
                                </p>
                            </div>
                        </section>
                    ))}
                </div>

                <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Aplikei Signature</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">APLIKEI TECHNOLOGIES LLC</p>
                        </div>
                        <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                        <div className="text-center sm:text-right">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">User Verification</p>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Digitally Accepted via Platform</p>
                        </div>
                    </div>
                </div>
            </div>
        </LegalLayout>
    );
}