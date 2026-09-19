"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  FlaskConical,
  Zap,
  RotateCcw,
  Send,
  FileWarning,
  Eye,
  Activity,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  MapPin,
  Trees,
  Droplets,
  Leaf,
  Mountain,
  Copy,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  Satellite,
} from "lucide-react";

type Step = { label: string; status: "pending" | "running" | "done" | "error"; detail?: string };

const defaultSteps: Step[] = [
  { label: "Update Plot C3 imagery", status: "pending" },
  { label: "Run computer vision analysis", status: "pending" },
  { label: "Calculate NDVI + change", status: "pending" },
  { label: "Run environmental analytics", status: "pending" },
  { label: "Calculate risk score", status: "pending" },
  { label: "Create alert", status: "pending" },
  { label: "Generate field investigation request", status: "pending" },
  { label: "Simulate SMS via Africa's Talking", status: "pending" },
];

export function DemoCenter() {
  const [steps, setSteps] = useState<Step[]>(defaultSteps);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async (mode: "full" | "decline" | "report" | "sms") => {
    setRunning(true);
    setSteps(defaultSteps.map((s) => ({ ...s, status: "pending" as const })));
    setResult(null);

    for (let i = 0; i < defaultSteps.length; i++) {
      setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s)));
      await new Promise((r) => setTimeout(r, 280));
      setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "done", detail: "✓" } : s)));
      if (mode !== "full" && i >= 2) break;
    }

    try {
      if (mode === "full") {
        const res = await fetch("/api/demo/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario: "environmental_event", plot_code: "C3" }),
        });
        const json = await res.json();
        setResult(json);
      } else if (mode === "decline") {
        const res = await fetch("/api/demo/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario: "vegetation_decline" }),
        });
        setResult(await res.json());
      } else if (mode === "sms") {
        const res = await fetch("/api/notifications/sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: "+254700725236",
            message: "TreeTrack demo: Plot C3 requires inspection within 48h. -38.2% NDVI decline.",
          }),
        });
        setResult(await res.json());
      } else if (mode === "report") {
        const res = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plot_id: "00000000-0000-0000-0000-000000000024",
            reporter_name: "Demo User",
            reporter_phone: "+254700725236",
            event_type: "illegal_clearing",
            severity: "critical",
            description: "Demo: simulated field report for Plot C3 — eastern boundary clearing.",
          }),
        });
        setResult(await res.json());
      }
    } catch (e: any) {
      setResult({ success: false, error: { message: e?.message ?? "Failed" } });
    } finally {
      setRunning(false);
    }
  };

  const reset = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      const j = await res.json();
      setToast(j?.data?.message ?? j?.message ?? "Demo data reset");
      setTimeout(() => setToast(null), 2500);
      setSteps(defaultSteps.map((s) => ({ ...s, status: "pending" })));
      setResult(null);
    } finally {
      setRunning(false);
    }
  };

  const copyJson = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const data = result?.data ?? null;
  const isFull = !!data?.plot && !!data?.vision && !!data?.analytics;
  const isSms = !!data?.recipient && !!data?.channel;
  const isReport = !!data?.reporter_name || (data?.plot_id && data?.event_type && data?.severity && !isFull);

  return (
    <div className="space-y-6">
      {/* Controls + Timeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-emerald-700" /> Demo Center
            </CardTitle>
            <CardDescription>
              Simulate the full MONITOR → DETECT → ANALYZE → VERIFY → ACT workflow without external
              credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => run("full")} disabled={running} className="col-span-2 gap-2">
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} Run
                Environmental Event
              </Button>
              <Button variant="outline" size="sm" disabled={running} onClick={() => run("decline")}>
                <Activity className="h-4 w-4" /> Vegetation decline
              </Button>
              <Button variant="outline" size="sm" disabled={running} onClick={() => run("report")}>
                <FileWarning className="h-4 w-4" /> Field report
              </Button>
              <Button variant="outline" size="sm" disabled={running} onClick={() => run("sms")}>
                <Send className="h-4 w-4" /> Simulate SMS
              </Button>
              <Button variant="secondary" size="sm" disabled={running} onClick={reset}>
                <RotateCcw className="h-4 w-4" /> Reset demo
              </Button>
            </div>

            <div className="rounded-lg border bg-zinc-50 p-3 text-xs text-zinc-600">
              <span className="font-semibold">Most important:</span>{" "}
              <span className="text-emerald-700 font-medium">Run Environmental Event</span> executes the
              8-step chain: imagery → vision → NDVI → analytics → risk → alert → investigation → SMS — shown
              as a timeline on the right.
            </div>

            {toast && (
              <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
                {toast}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Execution timeline</CardTitle>
            <CardDescription className="text-xs">Visual trace of the demo pipeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded-md border bg-white px-3 py-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      s.status === "done"
                        ? "bg-emerald-100 text-emerald-700"
                        : s.status === "running"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {s.status === "done" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : s.status === "running" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm ${s.status === "done" ? "text-zinc-900" : "text-zinc-600"}`}>
                    {s.label}
                  </span>
                  <span className="ml-auto text-xs text-zinc-400">{s.status}</span>
                </div>
              ))}
            </div>

            {result?.success && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4" /> Workflow completed — scroll down for actionable output
                &amp; raw JSON.
              </div>
            )}
            {result?.success === false && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                <AlertTriangle className="h-4 w-4" /> {result?.error?.message ?? "Error"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actionable Results + JSON — judge-facing */}
      {result && (
        <Card className="overflow-hidden border-emerald-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                  Actionable Results
                  {result.success ? (
                    <Badge variant="healthy" className="ml-1">
                      success
                    </Badge>
                  ) : (
                    <Badge variant="critical">failed</Badge>
                  )}
                  {isFull && (
                    <Badge variant="outline" className="bg-white">
                      {data.scenario ?? "environmental_event"}
                    </Badge>
                  )}
                  {isSms && <Badge variant="secondary">SMS simulation</Badge>}
                  {isReport && <Badge variant="secondary">Field report</Badge>}
                </CardTitle>
                <CardDescription className="text-xs max-w-2xl">
                  What judges verify: detections, scores and notifications that would trigger a field team.
                  Raw JSON kept alongside for audit — copy once, paste into verification.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyJson} className="gap-2">
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied" : "Copy JSON"}
                </Button>
                {isFull && data?.plot?.id && (
                  <Link
                    href={`/monitoring?plot=${data.plot.id}`}
                    className={cn(buttonVariants({ size: "sm" }), "gap-2 hidden sm:inline-flex")}
                  >
                    <MapPin className="h-3.5 w-3.5" /> View on map <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-6 space-y-6">
            {/* Full environmental event */}
            {isFull ? (
              <>
                {/* Top KPI row */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Plot {data.plot.plot_code}
                      </div>
                      <Badge variant={data.plot.health_score < 40 ? "critical" : "at_risk"} className="text-[11px]">
                        {data.plot.health_score ?? data.analytics.health_score ?? 31} /100
                      </Badge>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{data.plot.area_hectares} ha</div>
                      <div className="text-xs text-zinc-500">
                        {data.plot.estimated_tree_count?.toLocaleString()} est. •{" "}
                        {data.plot.expected_tree_count?.toLocaleString()} expected
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-xs">
                        Risk {data.analytics.risk_score ?? data.alert.risk_score}/100
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Status {data.plot.status}
                      </Badge>
                    </div>
                    <Link
                      href={`/monitoring?plot=${data.plot.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
                    >
                      Open in Monitoring <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="rounded-xl border bg-white p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      <Activity className="h-3.5 w-3.5 text-sky-600" /> NDVI Change
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-zinc-500">{data.ndvi.previous?.toFixed?.(2) ?? data.ndvi.previous} →</span>
                      <span className="text-2xl font-bold">{data.ndvi.current?.toFixed?.(2) ?? data.ndvi.current}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          data.ndvi.change_percent < 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {data.ndvi.change_percent > 0 ? "+" : ""}
                        {data.ndvi.change_percent}%
                      </span>
                    </div>
                    <div className="text-xs text-zinc-600">
                      Trend:{" "}
                      <Badge variant={data.analytics.trend === "critical" ? "critical" : data.analytics.trend === "declining" ? "at_risk" : "healthy"} className="text-[11px]">
                        {data.analytics.trend}
                      </Badge>{" "}
                      <span className="ml-1">• {data.analytics.provider} analytics</span>
                    </div>
                    <div className="text-[11px] leading-relaxed text-zinc-600 bg-zinc-50 rounded-lg p-2 border">
                      {data.analytics.summary}
                    </div>
                  </div>

                  <div className="rounded-xl border bg-white p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-600" /> Risk &amp; Verification
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-red-600"
                          style={{ width: `${Math.min(100, data.analytics.risk_score)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{data.analytics.risk_score}/100</span>
                    </div>
                    <p className="text-xs text-zinc-600">Field investigation due within 48h. Verification via USSD/SMS.</p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.analytics.anomalies?.map((a: string, i: number) => (
                        <Badge key={i} variant="at_risk" className="text-[11px] font-normal">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vision + Alert/SMS row */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border bg-white p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Eye className="h-4 w-4 text-violet-600" /> Vision Analysis{" "}
                      <Badge variant="outline" className="text-[11px] capitalize">
                        {data.vision.provider}
                      </Badge>
                      <span className="ml-auto text-xs text-zinc-500">conf {(data.vision.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                        <Leaf className="h-4 w-4 mx-auto text-emerald-700 mb-1" />
                        <div className="text-[11px] text-zinc-500 uppercase">Vegetation</div>
                        <div className="text-sm font-bold">{data.vision.vegetation_coverage}%</div>
                      </div>
                      <div className="rounded-lg bg-green-50 border border-green-200 p-2.5">
                        <Trees className="h-4 w-4 mx-auto text-green-700 mb-1" />
                        <div className="text-[11px] text-zinc-500 uppercase">Canopy</div>
                        <div className="text-sm font-bold">{data.vision.canopy_density}%</div>
                      </div>
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                        <Mountain className="h-4 w-4 mx-auto text-amber-700 mb-1" />
                        <div className="text-[11px] text-zinc-500 uppercase">Bare soil</div>
                        <div className="text-sm font-bold">{data.vision.bare_soil_percentage}%</div>
                      </div>
                      <div className="rounded-lg bg-sky-50 border border-sky-200 p-2.5">
                        <Droplets className="h-4 w-4 mx-auto text-sky-700 mb-1" />
                        <div className="text-[11px] text-zinc-500 uppercase">Water</div>
                        <div className="text-sm font-bold">{data.vision.water_percentage}%</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="text-zinc-500">Est. trees:</span>
                      <span className="font-semibold">{data.vision.estimated_tree_count?.toLocaleString()}</span>
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-500">Changes:</span>
                    </div>
                    <ul className="space-y-1.5">
                      {data.vision.detected_changes?.map((c: string, i: number) => (
                        <li key={i} className="flex gap-2 text-xs text-zinc-700 bg-zinc-50 rounded-md px-2.5 py-1.5 border">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                          {c}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
                      Mock provider — deterministic for demo. Swap at <code>lib/vision/analyzer.ts</code> for real model.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl border bg-red-50/60 border-red-200 p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-red-900">
                          <AlertTriangle className="h-4 w-4 text-red-600" /> Alert Created
                        </div>
                        <Badge variant={data.alert.severity === "critical" ? "critical" : "destructive"}>{data.alert.severity}</Badge>
                      </div>
                      <div className="text-sm font-medium text-zinc-900">{data.alert.title}</div>
                      <p className="text-xs text-zinc-600">{data.alert.description}</p>
                      <div className="flex flex-wrap gap-1.5 text-[11px]">
                        <Badge variant="outline">risk {data.alert.risk_score}</Badge>
                        <Badge variant="outline" className="font-mono">
                          {data.alert.id.slice(0, 8)}…
                        </Badge>
                        <Badge variant="outline">{data.alert.status}</Badge>
                      </div>
                      <div className="flex gap-2 pt-1 items-center">
                        <Link href="/alerts" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-1 text-xs")}>
                          View alerts <ExternalLink className="h-3 w-3" />
                        </Link>
                        <span className="text-[11px] text-zinc-500">Persisted to Supabase when configured</span>
                      </div>
                    </div>

                    <div className="rounded-xl border bg-white p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <MessageSquare className="h-4 w-4 text-emerald-600" /> SMS Notification{" "}
                        <Badge variant={data.sms.status === "simulated" ? "secondary" : data.sms.status === "sent" ? "healthy" : "critical"} className="text-[11px]">
                          {data.sms.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-zinc-50 border p-2">
                          <div className="text-[11px] text-zinc-500 uppercase">Recipient</div>
                          <div className="font-mono font-medium">{data.sms.recipient}</div>
                        </div>
                        <div className="rounded-lg bg-zinc-50 border p-2">
                          <div className="text-[11px] text-zinc-500 uppercase">Provider ID</div>
                          <div className="font-mono text-[11px] truncate">{data.sms.provider_message_id}</div>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-600 italic">
                        &quot;TreeTrack ALERT: Plot {data.plot.plot_code} — NDVI {data.ndvi.change_percent}%, risk{" "}
                        {data.analytics.risk_score}. Verification required.&quot;
                      </p>
                      {data.sms.status === "simulated" && (
                        <p className="text-[11px] text-zinc-500 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                          Simulated — set <code>AT_USERNAME</code>/<code>AT_API_KEY</code> for real Africa&apos;s Talking
                          delivery.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-zinc-900 text-zinc-100 p-3 flex items-center gap-2 text-xs">
                  <Satellite className="h-4 w-4 text-emerald-400" />
                  <span className="text-zinc-300">Provenance:</span>
                  <span className="font-mono text-zinc-400">vision+analytics • {data.scenario} • {new Date(data.alert.created_at).toLocaleString()}</span>
                  <span className="ml-auto hidden sm:inline text-zinc-500">Demo Center • MONITOR→ACT</span>
                </div>
              </>
            ) : isSms ? (
              <div className="rounded-xl border bg-white p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MessageSquare className="h-5 w-5 text-emerald-600" /> SMS Simulation Result{" "}
                  <Badge variant={data.status === "simulated" ? "secondary" : data.status === "sent" ? "healthy" : "critical"}>{data.status}</Badge>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg bg-zinc-50 border p-3">
                    <div className="text-xs text-zinc-500">Recipient</div>
                    <div className="font-mono font-medium">{data.recipient}</div>
                  </div>
                  <div className="rounded-lg bg-zinc-50 border p-3">
                    <div className="text-xs text-zinc-500">Channel</div>
                    <div className="font-medium">{data.channel}</div>
                  </div>
                  <div className="rounded-lg bg-zinc-50 border p-3">
                    <div className="text-xs text-zinc-500">Provider Msg ID</div>
                    <div className="font-mono text-xs truncate">{data.provider_message_id ?? "—"}</div>
                  </div>
                </div>
                {data.notice && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">{data.notice}</p>}
                <Link href="/alerts" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  View notifications log
                </Link>
              </div>
            ) : isReport ? (
              <div className="rounded-xl border bg-white p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FileWarning className="h-5 w-5 text-amber-600" /> Field Report Created{" "}
                  <Badge variant={data.severity === "critical" ? "critical" : "secondary"}>{data.severity}</Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-zinc-50 border p-3">
                    <div className="text-zinc-500">Plot</div>
                    <div className="font-mono font-medium">{data.plot_id}</div>
                  </div>
                  <div className="rounded-lg bg-zinc-50 border p-3">
                    <div className="text-zinc-500">Reporter</div>
                    <div className="font-medium">
                      {data.reporter_name} • {data.reporter_phone}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-zinc-700 bg-zinc-50 border rounded-lg p-3">{data.description}</p>
                <div className="text-xs text-zinc-500">
                  Type: {data.event_type} • Status: {data.status ?? "pending"} • {data.created_at ? new Date(data.created_at).toLocaleString() : ""}
                </div>
                <Link href="/reports" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  View all reports
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border bg-white p-4">
                <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-emerald-600" /> Output
                </div>
                <dl className="grid sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(data ?? {}).map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-zinc-50 border p-2.5">
                      <dt className="text-zinc-500 font-medium">{k}</dt>
                      <dd className="font-mono text-zinc-800 break-all">{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Raw JSON alongside */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                  <Copy className="h-3.5 w-3.5" /> Raw JSON (auditable)
                </div>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={copyJson}>
                  <Copy className="h-3 w-3" /> {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <div className="rounded-lg bg-zinc-900 p-4 overflow-auto max-h-[420px] border border-zinc-800">
                <pre className="text-xs font-mono text-emerald-100 whitespace-pre-wrap break-words leading-relaxed">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">
                Tip for judges: use <span className="font-mono bg-zinc-100 px-1 py-0.5 rounded">Copy JSON</span> to verify
                against <code>/api/demo/simulate</code> or import into Postman. Mock fields are explicitly labeled in
                <code> vision.provider</code> and <code> analytics.provider</code>.
              </p>
            </div>

            {isFull && data?.mock_notice && (
              <p className="text-xs text-center text-zinc-500 bg-zinc-50 border rounded-md py-2">
                {data.mock_notice} — real providers drop in at <code>lib/vision</code> / <code>lib/analytics</code> /{" "}
                <code>lib/messaging</code>.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty state hint */}
      {!result && !running && (
        <div className="rounded-lg border border-dashed bg-white p-4 text-center text-sm text-zinc-500">
          Run <span className="font-semibold text-emerald-700">Environmental Event</span> above — actionable cards and
          auditable JSON will appear here for judges to verify without opening DevTools.
        </div>
      )}
    </div>
  );
}
