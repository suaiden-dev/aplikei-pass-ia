import { AlertTriangle, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@shared/components/atoms/card";

export function MobilePreviewNotice() {
  return (
    <Card className="mx-auto w-full max-w-xl border-amber-200/80 bg-amber-50/80 shadow-none">
      <CardHeader className="space-y-3 border-b border-amber-200/70 pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700">
          <Smartphone className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl text-amber-950">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
            Preview unavailable on mobile
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed text-amber-900/80">
            The page preview cannot be displayed on mobile screens. Open the Page Builder on a desktop or tablet to review the landing page.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm font-medium text-amber-950/80">
          You can still edit the page settings, templates and content from this device.
        </p>
      </CardContent>
    </Card>
  );
}
