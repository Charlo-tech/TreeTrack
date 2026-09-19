import { DemoCenter } from "@/components/demo/DemoCenter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FlaskConical, Info } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-[1100px] p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2"><FlaskConical className="h-5 w-5 text-emerald-700"/> Demo Center</h1>
        <p className="text-sm text-zinc-500">Hackathon simulations Architecture is provider-swapped when keys are added.</p>
      </div>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Info className="h-4 w-4 text-amber-600"/> Mock transparency</CardTitle></CardHeader>
        <CardContent className="text-xs text-zinc-700 space-y-1">
          <p>Vision and analytics <strong>clearly labeled as mock</strong> when WOLFRAM_APP_ID / vision model not configured. Replace via lib/vision/analyzer.ts & lib/analytics/wolfram.ts — UI and DB unchanged.</p>
          <p>Africa&apos;s Talking SMS is <code>simulated</code> until AT_USERNAME + AT_API_KEY are set. Notifications still persisted with status=simulated.</p>
        </CardContent>
      </Card>

      <DemoCenter />

      <Card>
        <CardHeader><CardTitle className="text-sm">What Run Environmental Event proves</CardTitle><CardDescription className="text-xs">Single workflow: MONITOR → DETECT → ANALYZE → VERIFY → ACT</CardDescription></CardHeader>
        <CardContent className="text-xs text-zinc-600 space-y-1">
          <p>1. MonitoringMap (Leaflet) + plots colored by health (getPlotStatus/getPlotStyle).</p>
          <p>2. Vision mock on Plot C3 → veg 38%, canopy 34%, bare soil 52%.</p>
          <p>3. NDVI 0.68 → 0.42 = -38.2%.</p>
          <p>4. Risk 84 critical → alert created → field investigation.</p>
          <p>5. SMS via provider abstraction → notifications row.</p>
          <p>All via Next.js Route Handlers under app/api with Zod + consistent success/data/error.</p>
        </CardContent>
      </Card>
    </div>
  );
}
