"use client";
import { Button } from "@/components/ui/button";
import { Maximize2, Layers } from "lucide-react";

export function MapControls({ onFit, onToggleLegend }: { onFit?: () => void; onToggleLegend?: () => void }) {
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="secondary" onClick={onFit} className="shadow-sm">
        <Maximize2 className="h-4 w-4" /> Fit to project
      </Button>
      <Button size="sm" variant="outline" onClick={onToggleLegend} className="shadow-sm">
        <Layers className="h-4 w-4" /> Legend
      </Button>
    </div>
  );
}
