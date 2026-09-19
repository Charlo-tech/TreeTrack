"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_FIELD_REPORTS, MOCK_PLOTS } from "@/lib/mock-data";
import { FileText, Send, Phone } from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>(MOCK_FIELD_REPORTS);
  const [form, setForm] = useState({ plot_id: MOCK_PLOTS[14].id, reporter_name:"", reporter_phone:"", event_type:"illegal_clearing", severity:"critical", description:"" });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);

  const load = async()=>{ try{ const r=await fetch("/api/reports"); const j=await r.json(); if(j?.success) setReports(j.data);}catch{} };
  useEffect(()=>{ load(); },[]);

  const submit = async (e:React.FormEvent)=>{
    e.preventDefault();
    setSending(true); setMsg(null);
    try{
      const r=await fetch("/api/reports",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const j=await r.json();
      if(j?.success){ setMsg("Report submitted — queued for verification."); setReports((prev)=>[j.data, ...prev]); setForm(f=>({...f, description:"", reporter_name:"", reporter_phone:""})); }
      else setMsg(j?.error?.message ?? "Failed");
    } finally{ setSending(false); }
  };

  return (
    <div className="mx-auto max-w-[1100px] p-4 md:p-6 grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <h1 className="text-xl font-semibold flex items-center gap-2"><FileText className="h-5 w-5"/> Field Reports</h1>
        <p className="text-sm text-zinc-500">Reports via USSD <code className="px-1 py-0.5 bg-zinc-100 rounded">*384*TREES#</code> and web form. Stored in Supabase <code>field_reports</code>.</p>

        <div className="space-y-3">
          {reports.map((r)=>(
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm">{r.event_type?.replace("_"," ")} • Plot {r.plot_id?.slice(-4)}</CardTitle>
                  <Badge variant={r.severity==="critical"?"critical": r.severity==="high"?"destructive":"secondary"}>{r.severity}</Badge>
                </div>
                <CardDescription className="text-xs flex items-center gap-2"><Phone className="h-3 w-3"/>{r.reporter_name} • {r.reporter_phone} • {new Date(r.created_at).toLocaleString()} • {r.status}</CardDescription>
              </CardHeader>
              <CardContent><p className="text-sm text-zinc-700">{r.description}</p></CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="h-fit">
        <CardHeader><CardTitle className="text-sm">Submit field report</CardTitle><CardDescription className="text-xs">Web fallback for USSD. Validated with Zod; POST /api/reports.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs font-medium">Plot</label>
              <select value={form.plot_id} onChange={e=>setForm({...form, plot_id:e.target.value})} className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm">
                {MOCK_PLOTS.slice(0,12).map(p=> <option key={p.id} value={p.id}>{p.plot_code} • {p.area_hectares} ha</option>)}
              </select>
            </div>
            <Input placeholder="Your name" value={form.reporter_name} onChange={e=>setForm({...form, reporter_name:e.target.value})} required />
            <Input placeholder="Phone +254..." value={form.reporter_phone} onChange={e=>setForm({...form, reporter_phone:e.target.value})} required />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.event_type} onChange={e=>setForm({...form, event_type:e.target.value})} className="rounded-md border bg-white px-3 py-2 text-sm">
                <option value="tree_loss">Tree loss</option><option value="fire">Fire</option><option value="illegal_clearing">Illegal clearing</option><option value="disease">Disease</option><option value="pest">Pest</option><option value="other">Other</option>
              </select>
              <select value={form.severity} onChange={e=>setForm({...form, severity:e.target.value})} className="rounded-md border bg-white px-3 py-2 text-sm">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
              </select>
            </div>
            <Textarea placeholder="Describe what you observed (min 10 chars)" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} required rows={4}/>
            <Button type="submit" disabled={sending} className="w-full gap-2"><Send className="h-4 w-4"/>{sending?"Submitting...":"Submit report"}</Button>
            {msg && <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">{msg}</div>}
            <div className="text-[11px] text-zinc-500">USSD: dial <code>*384*TREES#</code> → 1-5; server at POST /api/ussd (mock when AT not configured).</div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
