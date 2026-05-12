import { useMemo } from "react";
import type { LandingPageConfig } from "../types";
import { applyTemplateConfig } from "../lib/templateHtml";
import { getLandingTemplateHtml } from "../templates/LandingTemplate";

interface LandingPagePreviewProps {
  config: LandingPageConfig;
}

export function LandingPagePreview({ config }: LandingPagePreviewProps) {
  const baseTemplate = getLandingTemplateHtml();

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
