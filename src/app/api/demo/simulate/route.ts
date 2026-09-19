import { NextRequest } from "next/server";
import { jsonSuccess } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_PLOTS, MOCK_OBSERVATIONS } from "@/lib/mock-data";
import { MockVisionAnalyzer } from "@/lib/vision/mock";
import { MockEnvironmentalAnalyzer } from "@/lib/analytics/mock";
import { WolframEnvironmentalAnalyzer } from "@/lib/analytics/wolfram";
import { getMessagingProvider } from "@/lib/messaging/provider";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const scenario = body.scenario ?? "environmental_event";
  const c3 = MOCK_PLOTS[14]; // Plot C3

  const timeline: Array<{ step: string; status: string; detail?: string }> = [];

  // 1. Update imagery (mock)
  timeline.push({ step: "Update Plot C3 imagery", status: "done", detail: `New capture ${new Date().toISOString().slice(0, 10)} • Sentinel-2` });

  // 2. Vision
  const vision = new MockVisionAnalyzer();
  const visionResult = await vision.analyze({ plot_id: c3.id, imagery_id: crypto.randomUUID() });
  timeline.push({ step: "Run computer vision analysis", status: "done", detail: `veg ${visionResult.vegetation_coverage}% • canopy ${visionResult.canopy_density}% • mock provider` });

  // 3. NDVI
  const prev = MOCK_OBSERVATIONS[MOCK_OBSERVATIONS.length - 2]?.ndvi;
  const cur = 0.42;
  const change = prev ? Number((((cur - prev) / prev) * 100).toFixed(1)) : -38.2;
  timeline.push({ step: "Calculate NDVI + change", status: "done", detail: `NDVI ${prev} → ${cur} (${change}%)` });

  // 4. Analytics
  const analyzer = process.env.WOLFRAM_APP_ID ? new WolframEnvironmentalAnalyzer(process.env.WOLFRAM_APP_ID) : new MockEnvironmentalAnalyzer();
  const analytics = await analyzer.analyze({ plot_id: c3.id, observations: MOCK_OBSERVATIONS });
  timeline.push({ step: "Run environmental analytics", status: "done", detail: `${analytics.trend} • ${analytics.summary.slice(0, 80)}` });

  // 5. Risk
  timeline.push({ step: "Calculate risk score", status: "done", detail: `risk ${analytics.risk_score}/100 • health ${analytics.health_score ?? c3.health_score}` });

  // 6. Alert
  let alert: any = {
    id: crypto.randomUUID(),
    plot_id: c3.id,
    alert_type: "vegetation_decline",
    severity: "critical",
    title: `Critical vegetation decline — Plot ${c3.plot_code}`,
    description: analytics.summary,
    risk_score: analytics.risk_score,
    status: "open",
    created_at: new Date().toISOString(),
  };
  const admin = createAdminClient();
  if (admin) {
    const { data } = await admin.from("alerts").insert({ project_id: c3.project_id, plot_id: c3.id, alert_type: "vegetation_decline", severity: "critical", title: alert.title, description: alert.description, risk_score: alert.risk_score }).select().single();
    if (data) alert = data;
    // also create environmental_event
    await admin.from("environmental_events").insert({ project_id: c3.project_id, plot_id: c3.id, event_type: "vegetation_decline", severity: "critical", description: alert.description, source: "vision+analytics", status: "open" });
  }
  timeline.push({ step: "Create alert", status: "done", detail: alert.id });

  // 7. Field investigation
  timeline.push({ step: "Generate field investigation request", status: "done", detail: "Assigned to field officer — due 48h" });

  // 8. SMS
  const messaging = getMessagingProvider();
  const sms = await messaging.sendSMS({ recipient: "+254700725236", message: `TreeTrack ALERT: Plot ${c3.plot_code} — NDVI ${change}%, risk ${analytics.risk_score}. Verification required. ${alert.title}`, alert_id: alert.id });
  if (admin) {
    await admin.from("notifications").insert({ alert_id: alert.id, recipient: sms.recipient, channel: "sms", message: `Plot ${c3.plot_code} alert`, status: sms.status, provider_message_id: sms.provider_message_id });
  }
  timeline.push({ step: "Simulate SMS via Africa's Talking", status: sms.status === "failed" ? "error" : "done", detail: sms.status + (sms.status === "simulated" ? " • configure AT creds for real SMS" : "") });

  return jsonSuccess({
    scenario,
    plot: c3,
    vision: visionResult,
    analytics,
    ndvi: { previous: prev, current: cur, change_percent: change },
    alert,
    sms,
    timeline,
    mock_notice: "This is a simulated environmental event — no external credentials required.",
  });
}
