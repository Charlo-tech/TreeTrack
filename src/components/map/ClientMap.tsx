"use client";
import { MapContainer, TileLayer, Polygon, Tooltip, GeoJSON, useMap } from "react-leaflet";
import { useEffect } from "react";
import { getPlotStatus, getPlotStyle } from "@/lib/utils";
import { MOCK_PROJECT } from "@/lib/mock-data";
import type { LatLngExpression } from "leaflet";

function FitButton({ plots }: { plots: any[] }) {
  const map = useMap();
  // expose via window for parent button – not needed, we use direct method
  return null;
}

export function ClientMap({
  plots,
  onPlotClick,
  selectedId,
  projectGeoJson,
  height,
  onMapReady,
}: {
  plots: any[];
  onPlotClick?: (id: string) => void;
  selectedId?: string | null;
  projectGeoJson: any;
  height: number;
  onMapReady?: (map: any) => void;
}) {
  const center: [number, number] = [-1.20, 36.865];

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height, width: "100%" }}
      scrollWheelZoom
      ref={(m: any) => {
        if (m && onMapReady) onMapReady(m);
      }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON
        data={projectGeoJson}
        style={{ color: "#065f46", weight: 2, fillColor: "#10b981", fillOpacity: 0.08, dashArray: "6 6" }}
      />
      {plots.map((plot) => {
        const status = getPlotStatus(plot.health_score);
        const style = getPlotStyle(status);
        const geom = plot.geometry;
        let positions: LatLngExpression[][] = [];
        if (geom?.coordinates) {
          positions = geom.coordinates.map((ring: number[][]) =>
            ring.map(([lng, lat]: number[]) => [lat, lng] as LatLngExpression)
          );
        }
        return (
          <Polygon
            key={plot.id}
            positions={positions}
            pathOptions={{
              ...style,
              weight: plot.id === selectedId ? 3 : 2,
              fillOpacity: plot.id === selectedId ? 0.75 : 0.55,
            }}
            eventHandlers={{ click: () => onPlotClick?.(plot.id) }}
          >
            <Tooltip sticky>
              <div className="text-xs">
                <div className="font-semibold">{plot.plot_code}</div>
                <div>{plot.health_score ?? "—"} / 100 • {status}</div>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
    </MapContainer>
  );
}
