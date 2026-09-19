"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MonitoringMap } from "@/components/map/MonitoringMap";
import { PlotDetailsPanel } from "@/components/plots/PlotDetailsPanel";
import { NDVIChart } from "@/components/charts/NDVIChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WorkflowStepper } from "@/components/layout/WorkflowStepper";
import { MOCK_PLOTS, MOCK_OBSERVATIONS } from "@/lib/mock-data";
import { getPlotStatus, getPlotStatusLabel } from "@/lib/utils";
import { Activity, Eye, FlaskConical } from "lucide-react";

function MonitoringInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPlot = searchParams.get("plot");
  const [plots, setPlots] = useState<any[]>(MOCK_PLOTS);
  const [selectedId, setSelectedId] = useState<string | null>(initialPlot ?? MOCK_PLOTS[14].id);
  const [analysis, setAnalysis] = useState<any>(null);
  const [vision, setVision] = useState<any>(null);
  const [observations, setObservations] = useState<any[]>(MOCK_OBSERVATIONS);

  const selected = plots.find((p) => p.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("plot", id);
    router.replace(`/monitoring?plot=${id}`, { scroll: false });
  };

  useEffect(() => {
    // fetch plots from API (fallback to mock if API not ready)
    fetch("/api/projects/00000000-0000-0000-0000-000000000001/plots")
      .then((r) => r.json())
      .then((j) => { if (j?.success && Array.isArray(j.data) && j.data.length) setPlots(j.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetch(`/api/plots/${selectedId}/observations`).then((r)=>r.json()).then((j)=>{ if(j?.success) setObservations(j.data); }).catch(()=>{});
    fetch(`/api/plots/${selectedId}/analysis`).then((r)=>r.json()).then((j)=>{ if(j?.success) setAnalysis(j.data); }).catch(()=>{});
    fetch(`/api/vision/analyze`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ plot_id: selectedId }) }).then((r)=>r.json()).then((j)=>{ if(j?.success) setVision(j.data); }).catch(()=>{});
  }, [selectedId]);

  return (
    <div className="mx-auto max-w-[1400px] p-4 md:p-6 space-y-4">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Monitoring</h1>
          <p className="text-sm text-zinc-500">Click any plot to inspect — Leaflet + OpenStreetMap</p>
        </div>
        <WorkflowStepper active={selected ? "analyze" : "monitor"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4 min-w-0">
          <MonitoringMap plots={plots} onPlotClick={handleSelect} selectedId={selectedId} height={560} />
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> NDVI trend — {selected?.plot_code ?? "Select a plot"}</CardTitle></CardHeader>
            <CardContent>
              <NDVIChart data={observations} />
              {analysis && (
                <div className="mt-3 rounded-lg border bg-zinc-50 p-3 text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-zinc-500">Trend</span><Badge variant={analysis.trend==="critical"?"critical": analysis.trend==="declining"?"at_risk":"secondary"}>{analysis.trend}</Badge></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Risk</span><span className="font-medium">{analysis.risk_score}/100</span></div>
                  <p className="text-zinc-600 pt-1">{analysis.summary}</p>
                  <p className="text-[11px] text-zinc-400">Provider: {analysis.provider} {analysis.provider==="mock" && "• deterministic demo — plug Wolfram via WOLFRAM_APP_ID"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selected ? (
            <PlotDetailsPanel plot={selected} onClose={() => setSelectedId(null)} onRequestInspection={() => alert(`Inspection requested for Plot ${selected.plot_code} — notification queued (demo).`)} />
          ) : (
            <Card><CardContent className="p-6 text-sm text-zinc-500">Select a plot on the map to view details.</CardContent></Card>
          )}

          {vision && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4 text-emerald-700" /> Vision analysis</CardTitle><CardDescription className="text-xs">Coverage & canopy from imagery — {vision.provider} {vision.provider==="mock" && "(deterministic)"}</CardDescription></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border p-3 text-center"><div className="text-xs text-zinc-500">Vegetation</div><div className="font-bold">{vision.vegetation_coverage}%</div></div>
                  <div className="rounded-lg border p-3 text-center"><div className="text-xs text-zinc-500">Canopy</div><div className="font-bold">{vision.canopy_density}%</div></div>
                  <div className="rounded-lg border p-3 text-center"><div className="text-xs text-zinc-500">Bare soil</div><div className="font-bold">{vision.bare_soil_percentage}%</div></div>
                  <div className="rounded-lg border p-3 text-center"><div className="text-xs text-zinc-500">Water</div><div className="font-bold">{vision.water_percentage}%</div></div>
                </div>
                <div className="text-xs">Est. trees: <strong>{vision.estimated_tree_count?.toLocaleString()}</strong> • confidence {(vision.confidence*100).toFixed(0)}%</div>
                <ul className="text-xs text-zinc-600 list-disc pl-4 space-y-1">{vision.detected_changes?.map((c:string,i:number)=>(<li key={i}>{c}</li>))}</ul>
                <Separator />
                <Button variant="outline" size="sm" className="w-full" onClick={async()=>{ const r=await fetch("/api/vision/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plot_id:selectedId})}); const j=await r.json(); setVision(j.data); }}><FlaskConical className="h-4 w-4"/> Re-run analysis</Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">All plots</CardTitle></CardHeader>
            <CardContent className="space-y-1 max-h-[320px] overflow-auto pr-1">
              {plots.map((p)=>{
                const st=getPlotStatus(p.health_score);
                return (
                  <button key={p.id} onClick={()=>handleSelect(p.id)} className={`w-full text-left flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 ${selectedId===p.id?"bg-emerald-50 border-emerald-200":"bg-white"}`}>
                    <span className="font-medium">{p.plot_code}</span>
                    <span className="flex items-center gap-2"><span className="text-xs text-zinc-500">{p.health_score}/100</span><Badge variant={st==="healthy"?"healthy":st==="needs_attention"?"warning":st==="at_risk"?"at_risk":"critical"}>{getPlotStatusLabel(st)}</Badge></span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function MonitoringPage(){
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-500">Loading monitoring...</div>}>
      <MonitoringInner />
    </Suspense>
  );
}
