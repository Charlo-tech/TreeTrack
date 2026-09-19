import { calculateNDVIChange } from "@/lib/utils";
import type { EnvironmentalAnalyzer, EnvironmentalAnalysisInput, EnvironmentalAnalysisResult } from "./types";

export function analyzeLocally(input: EnvironmentalAnalysisInput): Omit<EnvironmentalAnalysisResult, "provider"> {
  const obs = input.observations
    .filter((o) => o.ndvi != null)
    .sort((a, b) => new Date(a.observation_date).getTime() - new Date(b.observation_date).getTime());

  const current = obs[obs.length - 1]?.ndvi ?? null;
  const previous = obs.length >= 2 ? obs[obs.length - 2]?.ndvi ?? null : null;
  const change = calculateNDVIChange(previous, current);

  let trend: EnvironmentalAnalysisResult["trend"] = "stable";
  let risk_score = 18;
  const anomalies: string[] = [];

  if (change != null) {
    if (change <= -30) {
      trend = "critical";
      risk_score = 85;
      anomalies.push(`NDVI declined ${change}% — critical threshold`);
    } else if (change <= -15) {
      trend = "declining";
      risk_score = 62;
      anomalies.push(`NDVI declined ${change}% — significant loss`);
    } else if (change <= -5) {
      trend = "declining";
      risk_score = 38;
    } else if (change >= 5) {
      trend = "improving";
      risk_score = 12;
    }
  }

  if (current != null && current < 0.35) {
    anomalies.push("Current NDVI below healthy threshold (0.35)");
    risk_score = Math.max(risk_score, 72);
    if (trend !== "critical") trend = "declining";
  }
  if (current != null && current < 0.2) {
    risk_score = Math.max(risk_score, 88);
    trend = "critical";
    anomalies.push("Severe vegetation loss detected");
  }

  const health_score =
    current != null ? Math.max(0, Math.min(100, Math.round(current * 100 + 5))) : null;

  const summary =
    trend === "critical"
      ? `Critical vegetation decline detected. NDVI ${previous ?? "—"} → ${current ?? "—"} (${change ?? "—"}%). Immediate field verification recommended.`
      : trend === "declining"
      ? `Vegetation decline observed (${change ?? 0}%). Monitor closely and schedule field check.`
      : trend === "improving"
      ? `Vegetation improving (+${change ?? 0}%). Growth on track.`
      : `Vegetation stable. No significant change detected.`;

  return {
    plot_id: input.plot_id,
    previous_ndvi: previous,
    current_ndvi: current,
    ndvi_change_percent: change,
    trend,
    risk_score: Math.min(100, Math.max(0, Math.round(risk_score))),
    health_score,
    summary,
    confidence: 0.82,
    anomalies,
    generated_at: new Date().toISOString(),
  };
}
