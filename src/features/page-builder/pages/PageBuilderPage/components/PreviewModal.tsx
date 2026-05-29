import * as React from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@shared/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@shared/components/atoms/dialog";
import { LandingPagePreview } from "./LandingPagePreview";
import type { LandingPageConfig } from "../types";

type ViewportMode = "mobile" | "tablet" | "desktop";

interface PreviewModalProps {
  open: boolean;
  config: LandingPageConfig;
  onOpenChange: (open: boolean) => void;
}

const viewportClass: Record<ViewportMode, string> = {
  mobile: "w-[375px]",
  tablet: "w-[768px]",
  desktop: "w-full",
};

export function PreviewModal({
  open,
  config,
  onOpenChange,
}: PreviewModalProps) {
  const [viewport, setViewport] = React.useState<ViewportMode>("desktop");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-screen w-screen max-w-none gap-0 rounded-none border-none p-0"
        showClose={false}
      >
        <DialogHeader className="flex-row items-center justify-between border-b border-border bg-card px-4 py-3">
          <DialogTitle className="text-base font-black">
            Landing Preview
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewport === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewport("mobile")}
            >
              <Smartphone size={14} className="mr-1" /> Mobile
            </Button>
            <Button
              variant={viewport === "tablet" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewport("tablet")}
            >
              <Tablet size={14} className="mr-1" /> Tablet
            </Button>
            <Button
              variant={viewport === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewport("desktop")}
            >
              <Monitor size={14} className="mr-1" /> Desktop
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogHeader>

        <div className="flex h-[calc(100vh-64px)] overflow-auto bg-slate-200 p-6">
          <div
            className={`mx-auto min-h-full overflow-hidden rounded-2xl bg-white shadow-2xl ${viewportClass[viewport]}`}
          >
            <LandingPagePreview config={config} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
