import { useLocale, useT } from "../../../i18n";
import { LegalLayout } from "../LegalLayout";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function Disclaimers() {
    const { lang } = useLocale();
    const t = useT("legal");
    const p = t.disclaimersPage;

    if (!p) return null;

    return (
        <LegalLayout>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {p.title}
                </h1>
                <p className="mt-3 text-lg text-slate-500 font-medium leading-relaxed">
                    {p.readCarefully}
                </p>
                
                <div className="mt-12 space-y-16">
                    {/* Nature of Service */}
                    <section>
                        <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-3">
                            <Info className="w-6 h-6 text-primary" />
                            {p.natureTitle}
                        </h2>
                        <div className="grid gap-4">
                            {p.natureItems.map((item: string, i: number) => (
                                <div 
                                    key={i} 
                                    className="flex gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                                >
                                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* What we offer */}
                    <section>
                        <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                            {p.offersTitle}
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {p.offersItems.map((item: string, i: number) => (
                                <div 
                                    key={i} 
                                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
                                >
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="mt-20 p-8 rounded-3xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xl shadow-primary/20">
                    <h3 className="text-xl font-bold mb-4">
                        {lang === "pt" ? "Aviso Final" : lang === "es" ? "Aviso Final" : "Final Notice"}
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        {lang === "pt" 
                            ? "A utilização da nossa plataforma implica na aceitação plena e irrevogável de todos os termos e avisos aqui listados. Recomendamos que, em caso de dúvidas sobre a sua elegibilidade imigratória, você consulte um advogado devidamente licenciado nos Estados Unidos."
                            : lang === "es"
                            ? "El uso de nuestra plataforma implica la aceptación plena e irrevocable de todos los términos y avisos listados aquí. Recomendamos que, en caso de dudas sobre su elegibilidad migratoria, consulte a un abogado debidamente licenciado en los Estados Unidos."
                            : "Using our platform implies full and irrevocable acceptance of all terms and notices listed here. We recommend that, in case of questions about your immigration eligibility, you consult an attorney duly licensed in the United States."}
                    </p>
                </div>
            </div>
        </LegalLayout>
    );
}