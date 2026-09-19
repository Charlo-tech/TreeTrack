import { NextRequest } from "next/server";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { analyticsAnalyzeSchema } from "@/lib/validators";
import { MockEnvironmentalAnalyzer } from "@/lib/analytics/mock";
import { WolframEnvironmentalAnalyzer } from "@/lib/analytics/wolfram";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = analyticsAnalyzeSchema.safeParse(body);
  if (!parsed.success) return jsonError("VALIDATION_ERROR", "Invalid analytics payload", 422, parsed.error.flatten());

  const analyzer = process.env.WOLFRAM_APP_ID
    ? new WolframEnvironmentalAnalyzer(process.env.WOLFRAM_APP_ID)
    : new MockEnvironmentalAnalyzer();

  const result = await analyzer.analyze(parsed.data);

  // Persist risk to alerts if critical and Supabase available
  const admin = createAdminClient();
  if (admin && result.risk_score >= 70) {
    const existing = await admin
      .from("alerts")
      .select("id")
      .eq("plot_id", result.plot_id)
      .eq("status", "open")
      .maybeSingle();
    if (!existing.data) {
      await admin.from("alerts").insert({
        project_id: null,
        plot_id: result.plot_id,
        alert_type: result.trend === "critical" ? "vegetation_decline" : "health_drop",
        severity: result.risk_score >= 80 ? "critical" : result.risk_score >= 60 ? "high" : "medium",
        title: result.trend === "critical" ? `Critical decline — Plot ${result.plot_id.slice(-2)}` : `Vegetation anomaly — Plot ${result.plot_id.slice(-2)}`,
        description: result.summary,
        risk_score: result.risk_score,
        status: "open",
      });
    }
  }

  return jsonSuccess(result);
}
