"use client";
import { Polygon, Tooltip } from "react-leaflet";
import { getPlotStatus, getPlotStyle } from "@/lib/utils";
import type { LatLngExpression } from "leaflet";

export function PlotPolygon({
  plot,
  onClick,
  selected,
}: {
  plot: any;
  onClick?: (id: string) => void;
  selected?: boolean;
}) {
  const status = getPlotStatus(plot.health_score);
  const style = getPlotStyle(status);
  // geometry may be GeoJSON Polygon
  const geom = plot.geometry;
  let positions: LatLngExpression[][] = [];
  if (geom?.coordinates) {
    // GeoJSON is [lng, lat], Leaflet expects [lat,lng]
    positions = geom.coordinates.map((ring: number[][]) => ring.map(([lng, lat]: number[]) => [lat, lng] as LatLngExpression));
  }

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        ...style,
        weight: selected ? 3 : 2,
        fillOpacity: selected ? 0.75 : 0.55,
        dashArray: selected ? undefined : undefined,
      }}
      eventHandlers={{
        click: () => onClick?.(plot.id),
      }}
    >
      <Tooltip sticky>
        <div className="text-xs">
          <div className="font-semibold">{plot.plot_code}</div>
          <div>{plot.health_score ?? "—"} / 100 • {status}</div>
        </div>
      </Tooltip>
    </Polygon>
  );
}
