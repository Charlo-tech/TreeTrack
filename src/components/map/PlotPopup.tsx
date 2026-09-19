"use client";
import { Popup } from "react-leaflet";

export function PlotPopup({ plot }: { plot: any }) {
  return (
    <Popup>
      <div className="text-sm">
        <div className="font-semibold">{plot.plot_code}</div>
        <div className="text-xs text-zinc-500">{plot.area_hectares} ha • {plot.health_score}/100</div>
      </div>
    </Popup>
  );
}
