import { useEffect, useMemo, useState } from "react";
import type { LandingPageConfig } from "../types";
import { applyTemplateConfig } from "../lib/templateHtml";

interface LandingPagePreviewProps {
  config: LandingPageConfig;
}

export function LandingPagePreview({ config }: LandingPagePreviewProps) {
  const [baseTemplate, setBaseTemplate] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    fetch("/temp/index.html")
      .then((r) => r.text())
      .then((html) => {
        if (mounted) setBaseTemplate(html);
      })
      .catch(() => {
        if (mounted) setBaseTemplate("<!doctype html><html><body><h1>Template não encontrado</h1></body></html>");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const renderedHtml = useMemo(
    () => (baseTemplate ? applyTemplateConfig(baseTemplate, config) : ""),
    [baseTemplate, config],
  );

  return (
    <iframe
      title="Landing preview"
      className="h-full min-h-[700px] w-full border-0"
      srcDoc={renderedHtml}
    />
  );
}
