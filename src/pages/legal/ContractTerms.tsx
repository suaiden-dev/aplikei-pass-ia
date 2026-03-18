import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/presentation/components/atoms/button";

const ContractTerms = () => {
    const { lang } = useLanguage();

    return (
        <div className="container max-w-4xl py-12 px-4 sm:px-4 lg:px-5 bg-background min-h-screen">
            <div className="mb-5">
                <Button variant="ghost" asChild className="mb-4">
                    <Link to="/" className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        {lang === "pt" ? "Voltar ao Início" : "Back to Home"}
                    </Link>
                </Button>
                <h1 className="text-title-xl font-bold tracking-tight text-foreground">
                    {lang === "pt" ? "Termos de Serviço e Contrato de Prestação" : "Terms of Service and Contract"}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {lang === "pt" ? "Última atualização: " : "Last updated: "} {new Date().toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US")}
                </p>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
                <section>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere. Praesent id metus massa, ut blandit odio.</p>
                </section>

                <section>
                    <h2 className="text-subtitle font-semibold">1. Condições Gerais</h2>
                    <p>Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet. Nunc eu ullamcorper orci. Quisque eget odio ac lectus vestibulum faucibus eget in metus. In pellentesque faucibus vestibulum. Nulla at nulla justo, eget luctus tortor.</p>
                    <p>Praesent ornare risus velit, et elementum odio iaculis eget. Vestibulum suscipit mi neque, id imperdiet tellus sodales non. Vivamus feugiat pulvinar diam, nec eleifend tortor cursus in.</p>
                </section>

                <section>
                    <h2 className="text-subtitle font-semibold">2. Responsabilidades do Solicitante</h2>
                    <p>Maecenas eget est ipsum. Aliquam sodales turpis justo, in iaculis orci convallis non. Donec id neque magna. Nunc pellentesque dui eget purus consequat elementum. Nunc venenatis purus eget massa fermentum congue.</p>
                    <ul className="list-disc pl-4 space-y-2 mt-2">
                        <li>Cras sit amet justo efficitur, dapibus nibh eget, convallis sem.</li>
                        <li>Nulla facilisi. Integer vel nisl nec dui posuere blandit id sed sem.</li>
                        <li>Suspendisse potenti. Mauris interdum tellus vel vehicula viverra.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-subtitle font-semibold">3. Aceite Eletrônico e Veracidade das Imagens</h2>
                    <p>O cliente declara que as imagens enviadas (documento e selfie) são autênticas e atestam a veracidade desta assinatura eletrônica. O contrato em PDF final será gerado automaticamente contendo estas informações, os carimbos de data/hora (Timestamp) e o endereço IP do requisitante como prova legal de aceite irrevogável.</p>
                </section>

                <section>
                    <h2 className="text-subtitle font-semibold">4. Foro</h2>
                    <p>Curabitur venenatis tellus nec mi porta, at malesuada lorem interdum. Quisque finibus justo sit amet ex posuere vulputate.</p>
                </section>
            </div>
        </div>
    );
};

export default ContractTerms;
