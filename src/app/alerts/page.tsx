"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_ALERTS } from "@/lib/mock-data";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>(MOCK_ALERTS);
  const [filter, setFilter] = useState<"all"|"open"|"resolved">("all");

  const load = async () => {
    try { const r=await fetch("/api/alerts"); const j=await r.json(); if(j?.success && j.data.length) setAlerts(j.data);} catch{}
  };
  useEffect(()=>{ load(); },[]);

  const resolve = async (id:string) => {
    await fetch(`/api/alerts/${id}/resolve`, { method:"POST"});
    setAlerts((a)=>a.map(x=>x.id===id?{...x,status:"resolved",resolved_at:new Date().toISOString()}:x));
  };

  const shown = alerts.filter(a=> filter==="all" ? true : a.status===filter || (filter==="open" && a.status==="open") );

  return (
    <div className="mx-auto max-w-[1000px] p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-600"/> Alerts</h1>
        <div className="flex gap-2">
          {(["all","open","resolved"] as const).map(f=>(
            <Button key={f} size="sm" variant={filter===f?"default":"outline"} onClick={()=>setFilter(f)}>{f}</Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {shown.map((a)=>(
          <Card key={a.id} className={a.severity==="critical"?"border-red-200 bg-red-50/40":undefined}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm leading-tight">{a.title}</CardTitle>
                <Badge variant={a.severity==="critical"?"critical":a.severity==="high"?"destructive":"secondary"}>{a.severity}</Badge>
              </div>
              <div className="text-xs text-zinc-500 flex items-center gap-2"><Clock className="h-3 w-3"/>{new Date(a.created_at).toLocaleString()} • risk {a.risk_score} • {a.status}</div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-700">{a.description}</p>
              <div className="text-xs text-zinc-500">Plot: {a.plot_id?.slice(-6)} • {a.alert_type}</div>
              {a.status==="open" ? (
                <Button size="sm" variant="outline" onClick={()=>resolve(a.id)}><CheckCircle2 className="h-4 w-4"/> Mark resolved</Button>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5"/> Resolved {a.resolved_at? new Date(a.resolved_at).toLocaleDateString(): ""}</span>
              )}
            </CardContent>
          </Card>
        ))}
        {!shown.length && <Card><CardContent className="p-8 text-center text-sm text-zinc-500">No alerts in this filter.</CardContent></Card>}
      </div>
    </div>
  );
}
