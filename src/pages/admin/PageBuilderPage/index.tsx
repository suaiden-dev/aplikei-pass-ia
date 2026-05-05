import { useEffect } from "react";
import { Download, Eye, Monitor, Save, Smartphone } from "lucide-react";
import { Button } from "../../../components/atoms/button";
import { usePageBuilder } from "./hooks/usePageBuilder";
import { InspectorPanel } from "./components/InspectorPanel";
import { PreviewModal } from "./components/PreviewModal";
import { LandingPagePreview } from "./components/LandingPagePreview";
import { useState } from "react";

type PreviewViewport = "desktop" | "mobile";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default function PageBuilderPage() {
  const { config, isPreviewOpen, updateConfig, openPreview, closePreview } =
    usePageBuilder();
  const [previewViewport, setPreviewViewport] =
    useState<PreviewViewport>("desktop");

  useEffect(() => {
    document.title = config.pageTitle;
    const link = document.querySelector(
      "link[rel='icon']",
    ) as HTMLLinkElement | null;
    if (link && config.faviconUrl) {
      link.href = config.faviconUrl;
    }
  }, [config.pageTitle, config.faviconUrl]);

  const handleDownload = () => {
    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(config.pageTitle)}</title>
  <link rel="icon" href="${escapeHtml(config.faviconUrl)}" />
  <style>
    *{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#020617;color:#e2e8f0}
    .container{max-width:1120px;margin:0 auto;padding:0 16px}
    .header{position:sticky;top:0;z-index:10;border-bottom:1px solid #1e293b;background:#020617e6;backdrop-filter:blur(8px)}
    .header-inner{height:68px;display:flex;align-items:center;justify-content:space-between}
    .logo{height:36px;width:auto;object-fit:contain}
    .btn{display:inline-flex;align-items:center;justify-content:center;height:44px;padding:0 20px;border-radius:999px;font-weight:700;text-decoration:none}
    .btn-outline{border:1px solid #334155;color:#e2e8f0}
    .hero{padding:64px 0;background:radial-gradient(circle at top left,rgba(59,130,246,.28),rgba(2,6,23,1) 42%)}
    .badge{display:inline-flex;border:1px solid rgba(103,232,249,.3);background:rgba(103,232,249,.1);padding:6px 10px;border-radius:999px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#a5f3fc;font-weight:700}
    .hero-grid{display:grid;gap:28px}
    .hero h1{font-size:36px;line-height:1.1;margin:14px 0 0;color:#fff}
    .hero p{margin:14px 0 0;color:#cbd5e1;line-height:1.6}
    .cta-row{margin-top:24px;display:flex;flex-direction:column;gap:10px}
    .btn-primary{background:#fff;color:#0f172a}
    .card{border:1px solid rgba(71,85,105,.65);background:rgba(15,23,42,.75);border-radius:20px;padding:20px}
    .section-light{background:#fff;color:#0f172a;padding:56px 0}
    .section-soft{background:#f1f5f9;color:#0f172a;padding:56px 0}
    h2{font-size:30px;line-height:1.2;margin:0;text-align:center}
    .sub{max-width:780px;margin:10px auto 0;color:#475569;text-align:center}
    .grid{display:grid;gap:14px;grid-template-columns:1fr}
    .item{border:1px solid #e2e8f0;background:#fff;border-radius:16px;padding:20px}
    .footer-cta{background:linear-gradient(90deg,#0891b2,#2563eb);padding:48px 0;text-align:center}
    .footer-cta h2{color:#fff;font-size:28px}
    .footer-cta p{color:#cffafe}
    @media(min-width:768px){
      .container{padding:0 24px}
      .hero{padding:96px 0}
      .hero-grid{grid-template-columns:1.1fr .9fr;gap:40px}
      .hero h1{font-size:58px}
      .cta-row{flex-direction:row}
      .grid.two{grid-template-columns:repeat(2,1fr)}
      .grid.three{grid-template-columns:repeat(3,1fr)}
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container header-inner">
      <img class="logo" src="${escapeHtml(config.logoUrl)}" alt="Logo" />
      <a class="btn btn-outline" href="${escapeHtml(config.loginUrl)}">${escapeHtml(config.loginButtonLabel)}</a>
    </div>
  </header>
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <span class="badge">Advocacia imigratória estratégica</span>
        <h1>${escapeHtml(config.heroTitle)}</h1>
        <p>${escapeHtml(config.heroSubtitle)}</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="${escapeHtml(config.primaryCtaUrl)}">${escapeHtml(config.primaryCtaLabel)}</a>
          <a class="btn btn-outline" href="${escapeHtml(config.secondaryCtaUrl)}">${escapeHtml(config.secondaryCtaLabel)}</a>
        </div>
      </div>
      <div class="card">
        <div style="color:#67e8f9;font-size:13px;font-weight:700">Atendimento com advogado responsável</div>
        <div style="margin-top:8px;color:#fff;font-size:28px;font-weight:800">${escapeHtml(config.lawyerName)}</div>
        <p style="margin-top:12px;color:#cbd5e1">${escapeHtml(config.lawyerCtaText)}</p>
      </div>
    </div>
  </section>
  <section class="section-light">
    <div class="container">
      <h2>Serviços de vistos com foco em resultado</h2>
      <p class="sub">Soluções jurídicas para B1/B2, F1, extensão de status e troca de status.</p>
      <div class="grid two" style="margin-top:28px">
        <article class="item"><h3>Visto B1/B2</h3><p>Preparação de perfil, DS-160 e orientação de entrevista.</p></article>
        <article class="item"><h3>Visto F1</h3><p>Estratégia completa para estudantes e documentação acadêmica.</p></article>
        <article class="item"><h3>Extensão de Status</h3><p>Solicitação técnica para manter permanência regular.</p></article>
        <article class="item"><h3>Troca de Status</h3><p>Mudança de categoria com mitigação de riscos.</p></article>
      </div>
    </div>
  </section>
  <section class="section-soft">
    <div class="container">
      <h2>Como funciona</h2>
      <div class="grid three" style="margin-top:24px">
        <article class="item"><h3>01. Diagnóstico</h3><p>Análise do seu histórico e objetivo migratório.</p></article>
        <article class="item"><h3>02. Plano Jurídico</h3><p>Estratégia e checklist documental personalizados.</p></article>
        <article class="item"><h3>03. Execução</h3><p>Revisão e acompanhamento até o protocolo.</p></article>
      </div>
    </div>
  </section>
  <section class="footer-cta">
    <div class="container">
      <h2>Pronto para estruturar seu pedido de visto com segurança?</h2>
      <p>Receba um plano inicial para o seu caso.</p>
      <div class="cta-row" style="justify-content:center">
        <a class="btn btn-primary" href="${escapeHtml(config.primaryCtaUrl)}">${escapeHtml(config.primaryCtaLabel)}</a>
      </div>
    </div>
  </section>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "index.html";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div>
          <h1 className="text-lg font-black text-text">Landing Builder</h1>
          <p className="text-sm text-text-muted">
            Template pronto com botão de login e configurações de branding,
            links e textos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={previewViewport === "desktop" ? "default" : "outline"}
            onClick={() => setPreviewViewport("desktop")}
          >
            <Monitor size={16} className="mr-2" />
            Desktop
          </Button>
          <Button
            variant={previewViewport === "mobile" ? "default" : "outline"}
            onClick={() => setPreviewViewport("mobile")}
          >
            <Smartphone size={16} className="mr-2" />
            Mobile
          </Button>
          <Button variant="outline" onClick={openPreview}>
            <Eye size={16} className="mr-2" />
            Visualizar
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download size={16} className="mr-2" />
            Download
          </Button>
          <Button disabled>
            <Save size={16} className="mr-2" />
            Salvar
          </Button>
        </div>
      </header>

      <section className="flex h-[calc(100vh-64px)] min-h-0">
        <main className="flex-1 overflow-hidden bg-slate-100 p-4">
          <div className="mx-auto h-full w-full max-w-[1280px] rounded-2xl border border-border bg-slate-200 p-3 shadow-sm">
            <div className="flex h-full items-start justify-center overflow-y-auto overflow-x-hidden rounded-xl bg-slate-300/70 p-3">
              <div style={{ zoom: previewViewport === "desktop" ? 0.63 : 1 }}>
                <div
                  className={`mx-auto overflow-hidden rounded-2xl border border-border bg-white shadow-2xl ${
                    previewViewport === "desktop" ? "w-[1280px]" : "w-[390px]"
                  }`}
                >
                  <LandingPagePreview config={config} />
                </div>
              </div>
            </div>
          </div>
        </main>
        <InspectorPanel config={config} onUpdateConfig={updateConfig} />
      </section>

      <PreviewModal
        open={isPreviewOpen}
        config={config}
        onOpenChange={(open) => (open ? openPreview() : closePreview())}
      />
    </div>
  );
}
