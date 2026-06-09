import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPublishedOfficeLandingBySlug } from "@features/offices/services/officeOps";
import { applyTemplateConfig } from "@features/page-builder/pages/PageBuilderPage/lib/templateHtml";
import { getLandingTemplateHtml } from "@features/page-builder/pages/PageBuilderPage/templates/LandingTemplate";
import { defaultLandingPageConfig } from "@features/page-builder/pages/PageBuilderPage/hooks/usePageBuilder";
import type { LandingPageConfig } from "@features/page-builder/pages/PageBuilderPage/types";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; config: LandingPageConfig }
  | { status: "not_found" }
  | { status: "error"; message: string };

export default function PublicLandingPage() {
  const { slug = "" } = useParams();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    const loadLanding = async () => {
      setState({ status: "loading" });

      try {
        const office = await fetchPublishedOfficeLandingBySlug(slug);
        if (!mounted) return;

        if (!office?.landing_page_config) {
          setState({ status: "not_found" });
          return;
        }

        setState({
          status: "ready",
          config: {
            ...defaultLandingPageConfig,
            ...(office.landing_page_config as Partial<LandingPageConfig>),
            officeSlug: office.slug,
            officeId: office.id,
          },
        });
      } catch (error) {
        if (!mounted) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Unable to load this landing page.",
        });
      }
    };

    void loadLanding();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const html = useMemo(() => {
    if (state.status !== "ready") return "";
    const templateHtml = applyTemplateConfig(getLandingTemplateHtml(), state.config);
    return templateHtml.replace("<head>", '<head><base target="_top">');
  }, [state]);

  useEffect(() => {
    if (state.status !== "ready") return;

    document.title = state.config.pageTitle || "Aplikei";
    const link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (link && state.config.faviconUrl) {
      link.href = state.config.faviconUrl;
    }
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (state.status === "not_found") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-text">
        <h1 className="text-5xl font-semibold text-primary">404</h1>
        <p className="max-w-md text-sm text-text-muted">
          Esta landing page nao esta publicada ou nao existe.
        </p>
        <Link to="/" className="text-sm font-semibold text-primary underline">
          Voltar para o inicio
        </Link>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-text">
        <h1 className="text-2xl font-semibold">Erro ao carregar landing</h1>
        <p className="max-w-md text-sm text-text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <iframe
      title={state.config.pageTitle || "Aplikei"}
      srcDoc={html}
      className="block h-screen w-screen border-0 bg-white"
      sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
    />
  );
}
