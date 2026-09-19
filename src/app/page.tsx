import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { WorkflowStepper } from "@/components/layout/WorkflowStepper";
import { Separator } from "@/components/ui/separator";
import { MOCK_PROJECT, MOCK_PLOTS, MOCK_ALERTS, MOCK_FIELD_REPORTS } from "@/lib/mock-data";
import { getPlotStatus } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Trees, Map as MapIcon, AlertTriangle, FileText, Activity, TrendingDown, Sprout, ShieldCheck, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const healthy = MOCK_PLOTS.filter((p) => getPlotStatus(p.health_score) === "healthy").length;
  const critical = MOCK_PLOTS.filter((p) => getPlotStatus(p.health_score) === "critical").length;
  const atRisk = MOCK_PLOTS.filter((p) => getPlotStatus(p.health_score) === "at_risk").length;
  const openAlerts = MOCK_ALERTS.filter((a) => a.status === "open").length;

  return (
    <div className="mx-auto max-w-[1280px] p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white"><Trees className="h-4 w-4" /></span>
              {MOCK_PROJECT.name}
            </h1>
            <p className="text-sm text-zinc-600 mt-1 max-w-2xl">{MOCK_PROJECT.description}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
              <span>{MOCK_PROJECT.total_area_hectares} ha</span> <span>•</span> <span>{MOCK_PROJECT.expected_tree_count.toLocaleString()} trees expected</span> <span>•</span> <span>{MOCK_PLOTS.length} plots</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/monitoring" className={cn(buttonVariants({}))}><MapIcon className="h-4 w-4" /> Open monitoring map</Link>
            <Link href="/demo" className={cn(buttonVariants({ variant: "outline" }))}>Demo Center</Link>
          </div>
        </div>

        <WorkflowStepper active="monitor" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total plots</CardDescription><CardTitle className="text-2xl">{MOCK_PLOTS.length}</CardTitle></CardHeader>
          <CardContent className="text-xs text-zinc-500">{healthy} healthy • {atRisk} at risk • {critical} critical</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Area monitored</CardDescription><CardTitle className="text-2xl">{MOCK_PROJECT.total_area_hectares} ha</CardTitle></CardHeader>
          <CardContent className="text-xs text-zinc-500">Avg { (MOCK_PROJECT.total_area_hectares / MOCK_PLOTS.length).toFixed(1)} ha / plot</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Open alerts</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-600" />{openAlerts}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-zinc-500">1 critical • requires verification</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Field reports</CardDescription><CardTitle className="text-2xl">{MOCK_FIELD_REPORTS.length}</CardTitle></CardHeader>
          <CardContent className="text-xs text-zinc-500">Last 48h via USSD & SMS</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-700" /> Health overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Healthy", count: healthy, color: "bg-emerald-600" },
                { label: "Needs attention", count: MOCK_PLOTS.length - healthy - atRisk - critical, color: "bg-amber-500" },
                { label: "At risk", count: atRisk, color: "bg-orange-500" },
                { label: "Critical", count: critical, color: "bg-red-600" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border p-4 text-center">
                  <div className={`mx-auto h-2 w-12 rounded-full ${s.color} mb-2`} />
                  <div className="text-2xl font-bold">{s.count}</div>
                  <div className="text-xs text-zinc-500">{s.label}</div>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex flex-wrap gap-2">
              <Link href="/monitoring" className={cn(buttonVariants({ size: "sm" }))}>View map <ArrowRight className="h-3.5 w-3.5" /></Link>
              <Link href="/alerts" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>View alerts</Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /> Latest alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_ALERTS.slice(0, 3).map((a) => (
              <div key={a.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium leading-tight">{a.title}</div>
                  <Badge variant={a.severity === "critical" ? "critical" : a.severity === "high" ? "destructive" : "secondary"}>{a.severity}</Badge>
                </div>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{a.description}</p>
                <div className="text-[11px] text-zinc-400 mt-1">risk {a.risk_score} • {new Date(a.created_at).toLocaleDateString()}</div>
              </div>
            ))}
            <Link href="/alerts" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full")}>All alerts <ArrowRight className="h-3.5 w-3.5" /></Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-600" /> Priority: Plot C3</CardTitle><CardDescription>Critical vegetation decline — demo focal plot</CardDescription></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-red-50 border border-red-200 p-3"><div className="text-xs text-red-700">Health</div><div className="font-bold text-red-700">31 / 100</div></div>
              <div className="rounded-lg bg-zinc-50 border p-3"><div className="text-xs text-zinc-500">NDVI</div><div className="font-bold">0.42</div><div className="text-xs text-red-600">-38.2%</div></div>
              <div className="rounded-lg bg-zinc-50 border p-3"><div className="text-xs text-zinc-500">Trees</div><div className="font-bold">1,420</div><div className="text-xs text-zinc-500">/ 2,000</div></div>
            </div>
            <p className="text-xs text-zinc-600">Plot C3 (18.2 ha) is the canonical demo anomaly. Use <Link href="/demo" className="text-emerald-700 underline">Demo Center → Run Environmental Event</Link> to trigger the full detection pipeline live.</p>
            <Link href="/monitoring?plot=00000000-0000-0000-0000-000000000024" className={cn(buttonVariants({ size: "sm" }))}>Inspect Plot C3</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sprout className="h-4 w-4 text-emerald-700" /> How TreeTrack works</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex gap-3"><span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">1</span><span><strong>Monitor</strong> satellite imagery & field inputs across all plots on a Leaflet map.</span></div>
            <div className="flex gap-3"><span className="h-6 w-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">2</span><span><strong>Detect</strong> NDVI drops & canopy loss via vision analysis.</span></div>
            <div className="flex gap-3"><span className="h-6 w-6 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-xs font-bold shrink-0">3</span><span><strong>Analyze</strong> environmental trends (mock → Wolfram-ready).</span></div>
            <div className="flex gap-3"><span className="h-6 w-6 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-xs font-bold shrink-0">4</span><span><strong>Verify</strong> via USSD/SMS field reports.</span></div>
            <div className="flex gap-3"><span className="h-6 w-6 rounded-full bg-violet-100 text-violet-800 flex items-center justify-center text-xs font-bold shrink-0">5</span><span><strong>Act</strong> — alerts & Africa’s Talking SMS.</span></div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 pt-1"><ShieldCheck className="h-3.5 w-3.5" /> Mock providers used when external keys are not configured — architecture is swap-ready.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
