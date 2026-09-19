"use client";
import { PlotPolygon } from "./PlotPolygon";

export function PlotLayer({
  plots,
  onPlotClick,
  selectedId,
}: {
  plots: any[];
  onPlotClick?: (id: string) => void;
  selectedId?: string | null;
}) {
  return (
    <>
      {plots.map((p) => (
        <PlotPolygon key={p.id} plot={p} onClick={onPlotClick} selected={p.id === selectedId} />
      ))}
    </>
  );
}
