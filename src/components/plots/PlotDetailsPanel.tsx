"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getPlotStatus, getPlotStatusLabel, daysAgo, formatHectares, formatNumber, calculateNDVIChange, cn } from "@/lib/utils";
import { AlertTriangle, Eye, FileText, Send, X, Trees, Activity, Droplets } from "lucide-react";
import Link from "next/link";

export function PlotDetailsPanel({
  plot,
  onClose,
  onRequestInspection,
}: {
  plot: any;
  onClose?: () => void;
  onRequestInspection?: () => void;
}) {
  if (!plot) return null;
  const status = getPlotStatus(plot.health_score);
  const label = getPlotStatusLabel(status);
  const ndviChange = plot.ndvi_change ?? calculateNDVIChange(plot.previous_ndvi, plot.ndvi);

  return (
    <Card className="overflow-hidden border shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trees className="h-4 w-4 text-emerald-700" /> Plot {plot.plot_code}
            </CardTitle>
            <div className="text-xs text-zinc-500 mt-1">{formatHectares(plot.area_hectares)} • {plot.status}</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                status === "healthy" ? "healthy" : status === "needs_attention" ? "warning" : status === "at_risk" ? "at_risk" : "critical"
              }
            >
              {label}
            </Badge>
            {onClose && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Health score" value={`${plot.health_score ?? "—"} / 100`} tone={status === "critical" ? "danger" : status === "at_risk" ? "warn" : undefined} />
          <Metric label="Risk score" value={plot.risk_score != null ? `${Math.round(plot.risk_score)} / 100` : "—"} />
          <Metric label="NDVI" value={plot.ndvi != null ? plot.ndvi.toFixed(2) : "—"} sub={ndviChange != null ? `${ndviChange > 0 ? "+" : ""}${ndviChange}%` : undefined} tone={ndviChange != null && ndviChange < -15 ? "danger" : undefined} />
          <Metric label="Canopy" value={plot.canopy_density != null ? `${plot.canopy_density}%` : "—"} />
          <Metric label="Estimated trees" value={formatNumber(plot.estimated_tree_count)} />
          <Metric label="Expected" value={formatNumber(plot.expected_tree_count)} />
        </div>

        <div className="rounded-lg bg-zinc-50 p-3 text-xs space-y-1.5">
          <div className="flex justify-between"><span className="text-zinc-500">Last inspection</span><span className="font-medium">{daysAgo(plot.last_observation)}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">NDVI change</span><span className={`font-medium ${ndviChange != null && ndviChange < 0 ? "text-red-600" : "text-emerald-700"}`}>{ndviChange != null ? `${ndviChange}%` : "—"}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">Vegetation</span><span className="font-medium">{plot.vegetation_coverage ?? "—"}%</span></div>
        </div>

        {status === "critical" && (
          <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Critical decline — field verification recommended within 48h. Simulated analysis indicates possible clearing.</span>
          </div>
        )}

        <Separator />

        <div className="grid grid-cols-1 gap-2">
          <Link href={`/monitoring?plot=${plot.id}`} className={cn(buttonVariants({ size: "sm" }), "gap-2")}><Eye className="h-4 w-4" /> View full analysis</Link>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={onRequestInspection}><Send className="h-4 w-4" /> Request inspection</Button>
            <Link href="/reports" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}><FileText className="h-4 w-4" /> View field reports</Link>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <Activity className="h-3 w-3" /> NDVI • <Droplets className="h-3 w-3" /> Canopy • Mock vision when external APIs not configured
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "danger" | "warn" }) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`text-sm font-semibold ${tone === "danger" ? "text-red-600" : tone === "warn" ? "text-amber-600" : "text-zinc-900"}`}>{value}</div>
      {sub && <div className={`text-xs ${ tone==="danger" ? "text-red-600":"text-zinc-500"}`}>{sub}</div>}
    </div>
  );
}
