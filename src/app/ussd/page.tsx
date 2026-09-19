"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Smartphone, Send, RotateCcw, Copy, CheckCircle2, AlertTriangle } from "lucide-react";

export default function UssdSimulatorPage() {
  const [phone, setPhone] = useState("+254700725236");
  const [text, setText] = useState("");
  const [history, setHistory] = useState<Array<{ sent: string; received: string; time: string }>>([]);
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [lastRaw, setLastRaw] = useState<string>("");

  const send = async (nextText: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ussd", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          sessionId: `sim-${Date.now()}`,
          phoneNumber: phone,
          serviceCode: "*384*74648#",
          text: nextText,
        }).toString(),
      });
      const body = await res.text();
      setResponse(body);
      setLastRaw(body);
      setHistory((h) => [...h, { sent: nextText || "(empty — dial *384*TREES#)", received: body, time: new Date().toLocaleTimeString() }]);
      // Auto-advance text state if CON, keep input for next step
      if (body.startsWith("CON") && nextText !== text) setText(nextText);
    } catch (e: any) {
      setResponse(`END Error: ${e?.message ?? "failed"}`);
    } finally {
      setLoading(false);
    }
  };

  const dial = () => send("");
  const reply = (choice: string) => {
    const newText = text ? `${text}*${choice}` : choice;
    setText(newText);
    send(newText);
  };
  const freeFormSend = () => send(text);

  const reset = () => {
    setText("");
    setResponse("");
    setHistory([]);
    setLastRaw("");
  };

  const isCon = response.startsWith("CON");
  const isEnd = response.startsWith("END");

  return (
    <div className="mx-auto max-w-[900px] p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-emerald-700" /> USSD Simulator — *384*TREES#
        </h1>
        <p className="text-sm text-zinc-500">
          Visual tester for <code className="bg-zinc-100 px-1 py-0.5 rounded">POST /api/ussd</code> (Africa&apos;s Talking
          compatible). Use this if your external simulator shows <span className="text-red-600">Service error</span> but
          sessions succeed — it proves the handler returns strict <code>CON</code>/<code>END</code> plain text.
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <Link href="/demo" className="text-emerald-700 underline">
            ← Back to Demo Center
          </Link>
          <span className="text-zinc-300">•</span>
          <span className="text-zinc-500">Handler: src/app/api/ussd/route.ts → lib/messaging/mock.ts</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Phone</CardTitle>
            <CardDescription className="text-xs">Africa&apos;s Talking sends URL-encoded + — we normalize +254…</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254700725236" />
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={dial} disabled={loading} className="gap-2">
                <Send className="h-4 w-4" /> Dial *384#
              </Button>
              <Button variant="outline" onClick={reset} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>

            {response && (
              <div
                className={`rounded-xl border-2 p-4 font-mono text-sm whitespace-pre-wrap leading-relaxed ${
                  isCon ? "bg-zinc-900 text-emerald-100 border-zinc-800" : isEnd ? "bg-emerald-50 text-emerald-900 border-emerald-200" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-2 font-sans">
                  {isCon && <Badge className="bg-emerald-600">CON</Badge>}
                  {isEnd && <Badge variant="healthy">END</Badge>}
                  <span className="text-xs opacity-60">{isCon ? "Session continues" : isEnd ? "Session ended" : ""}</span>
                </div>
                {response}
              </div>
            )}

            {/* Quick dial pad */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Button key={n} variant="outline" size="sm" onClick={() => reply(String(n))} disabled={loading || (!response && n !== 1)}>
                  {n}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => reply("0")} disabled={loading}>
                0 Back
              </Button>
              <Button variant="ghost" size="sm" onClick={() => send(text)} disabled={loading || !text}>
                Resend
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-600">Free-form text (what AT sends as &apos;text&apos;)</div>
              <div className="flex gap-2">
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder='e.g. 3 or 3*Kiambu C3' className="font-mono text-sm" />
                <Button size="sm" onClick={freeFormSend} disabled={loading} className="shrink-0">
                  Send
                </Button>
              </div>
              <p className="text-[11px] text-zinc-500">
                AT flow: <code></code> → menu, <code>3</code> → prompt, <code>3*description</code> → END. We handle %2B / # encoding.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                Why &quot;service error&quot; happens <AlertTriangle className="h-4 w-4 text-amber-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-zinc-600 space-y-2">
              <p>
                <strong>AT requires</strong> <code>200</code> + <code>Content-Type: text/plain</code> + body starting
                exactly with <code>CON</code> or <code>END</code> (no JSON, no leading spaces/BOM). If any middleware wraps
                it in <code>{`{success:true}`}</code> or adds whitespace, the handset shows <em>Service error</em> even though
                the session logs <em>success</em> server-side.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Fixed in <code>route.ts</code>: <code>text/plain; charset=utf-8</code>, <code>trimStart()</code>, <code>Cache-Control: no-store</code>, never returns JSON/500 — always <code>END Service temporarily…</code> on exception.</li>
                <li>
                  Normalized <code>+254</code> (form-encoded <code>+</code> → space) via <code>normalizePhone()</code>.
                </li>
                <li>
                  ASCII-only menu (no <code>—</code> / fancy dashes) to stay &lt;182 chars and avoid UTF-8 issues on feature phones.
                </li>
                <li>
                  Added <code>GET /api/ussd?phoneNumber=&amp;text=</code> for quick health checks.
                </li>
              </ul>
              <div className="rounded-lg bg-zinc-50 border p-2.5 font-mono text-[11px]">
                <div className="font-semibold">AT callback URL (production):</div>
                https://&lt;your-domain&gt;/api/ussd<br />
                <div className="text-zinc-500">Local ngrok: ngrok http 3000 → set AT dashboard to https://xxxx.ngrok.io/api/ussd</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">cURL / PowerShell tests</CardTitle>
              <CardDescription className="text-xs">Copy-paste for your simulator&apos;s expected payload</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-zinc-900 text-zinc-100 p-3 font-mono text-xs overflow-auto">
                <div className="text-zinc-400"># dial</div>
                curl -X POST http://localhost:3000/api/ussd -H &apos;Content-Type: application/x-www-form-urlencoded&apos; --data &apos;sessionId=s123&amp;phoneNumber=%2B254700725236&amp;serviceCode=*384*74648%23&amp;text=&apos;
                <div className="text-zinc-400 mt-2"># report illegal clearing</div>
                curl -X POST ... --data &apos;text=3&apos;
                <div className="text-zinc-400 mt-2"># submit</div>
                curl -X POST ... --data &apos;text=3*Kiambu%20Plot%20C3%20eastern%20edge&apos;
              </div>
              <div className="rounded-lg bg-zinc-900 text-zinc-100 p-3 font-mono text-xs overflow-auto">
                Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/ussd -ContentType &quot;application/x-www-form-urlencoded&quot; -Body &quot;sessionId=s123&amp;phoneNumber=%2B254700725236&amp;serviceCode=*384*74648%23&amp;text=3&quot;
              </div>
              {lastRaw && (
                <Button size="sm" variant="outline" className="gap-2" onClick={() => navigator.clipboard.writeText(lastRaw)}>
                  <Copy className="h-3.5 w-3.5" /> Copy last raw response
                </Button>
              )}
            </CardContent>
          </Card>

          {history.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Session history</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[260px] overflow-auto">
                {history.map((h, i) => (
                  <div key={i} className="rounded-lg border p-2.5 text-xs space-y-1 bg-white">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Badge variant="outline" className="text-[11px] font-mono">
                        → {h.sent}
                      </Badge>
                      <span className="ml-auto">{h.time}</span>
                    </div>
                    <div className="font-mono whitespace-pre-wrap bg-zinc-50 rounded p-2 border text-zinc-800">{h.received}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              Menu opens at <code>/api/ussd</code> means the handler is wired. If your external simulator still says
              Service error, open DevTools → Network → preview the <em>raw</em> response body: it must be exactly{" "}
              <code>CON ...</code> or <code>END ...</code> with no HTML/JSON wrapper. This page proves it does.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
