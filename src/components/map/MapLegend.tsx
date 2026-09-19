import { getPlotStatusColor } from "@/lib/utils";

export function MapLegend() {
  const items: Array<{ label: string; color: string }> = [
    { label: "Healthy (≥75)", color: getPlotStatusColor("healthy") },
    { label: "Needs attention (50–74)", color: getPlotStatusColor("needs_attention") },
    { label: "At risk (30–49)", color: getPlotStatusColor("at_risk") },
    { label: "Critical (<30)", color: getPlotStatusColor("critical") },
  ];
  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm text-xs">
      <div className="font-semibold mb-2">Plot health</div>
      <div className="space-y-1.5">
        {items.map((i) => (
          <div key={i.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border" style={{ background: i.color }} />
            {i.label}
          </div>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-zinc-500">Click a plot for details</div>
    </div>
  );
}
