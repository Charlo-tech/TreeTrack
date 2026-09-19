"use client";
import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import { MapLegend } from "./MapLegend";
import { MapControls } from "./MapControls";
import { MOCK_PROJECT } from "@/lib/mock-data";

const ClientMap = dynamic(() => import("./ClientMap").then((m) => m.ClientMap), { ssr: false });

export function MonitoringMap({
  plots,
  onPlotClick,
  selectedId,
  height = 520,
}: {
  plots: any[];
  onPlotClick?: (id: string) => void;
  selectedId?: string | null;
  height?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [mapRef, setMapRef] = useState<any>(null);

  useEffect(() => setMounted(true), []);

  const projectGeoJson: any = useMemo(
    () => ({
      type: "Feature",
      properties: { name: MOCK_PROJECT.name },
      geometry: MOCK_PROJECT.boundary as any,
    }),
    []
  );

  const handleFit = () => {
    if (!mapRef) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const L = require("leaflet");
      const bounds = L.latLngBounds([]);
      plots.forEach((p: any) => {
        const coords = p.geometry?.coordinates?.[0] ?? [];
        coords.forEach(([lng, lat]: number[]) => bounds.extend([lat, lng]));
      });
      const b = MOCK_PROJECT.boundary.coordinates[0] as number[][];
      b.forEach(([lng, lat]) => bounds.extend([lat, lng]));
      if (bounds.isValid()) mapRef.fitBounds(bounds.pad(0.12));
    } catch {}
  };

  if (!mounted) {
    return <div style={{ height }} className="animate-pulse rounded-xl bg-zinc-100 border" />;
  }

  return (
    <div className="relative overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="absolute left-3 top-3 z-[400] flex gap-2">
        <MapControls onFit={handleFit} onToggleLegend={() => setShowLegend((v) => !v)} />
      </div>
      {showLegend && (
        <div className="absolute bottom-3 left-3 z-[400]">
          <MapLegend />
        </div>
      )}
      <ClientMap
        plots={plots}
        onPlotClick={onPlotClick}
        selectedId={selectedId}
        projectGeoJson={projectGeoJson}
        height={height}
        onMapReady={setMapRef}
      />
    </div>
  );
}
