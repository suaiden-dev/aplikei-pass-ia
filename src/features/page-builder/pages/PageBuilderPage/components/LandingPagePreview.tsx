import { useMemo } from "react";
import type { LandingPageConfig } from "../types";
import { applyTemplateConfig } from "../lib/templateHtml";
import { getLandingTemplateHtml } from "../templates/LandingTemplate";

interface LandingPagePreviewProps {
  config: LandingPageConfig;
}

export function LandingPagePreview({ config }: LandingPagePreviewProps) {
  const baseTemplate = getLandingTemplateHtml();

  const renderedHtml = useMemo(() => {
    if (!baseTemplate) return "";
    const html = applyTemplateConfig(baseTemplate, config);
    const blockScript = `<script>document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('[data-theme-toggle]'))return;e.preventDefault();e.stopPropagation();},true);document.addEventListener('submit',function(e){e.preventDefault();e.stopPropagation();},true);</script>`;
    return html.includes("</body>")
      ? html.replace("</body>", blockScript + "</body>")
      : html + blockScript;
  }, [baseTemplate, config]);

  return (
    <iframe
      title="Landing preview"
      className="block h-full min-h-full w-full border-0"
      srcDoc={renderedHtml}
      sandbox="allow-same-origin allow-scripts"
    />
  );
}
