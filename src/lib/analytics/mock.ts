import type { EnvironmentalAnalyzer, EnvironmentalAnalysisInput, EnvironmentalAnalysisResult } from "./types";
import { analyzeLocally } from "./environmental";

export class MockEnvironmentalAnalyzer implements EnvironmentalAnalyzer {
  async analyze(input: EnvironmentalAnalysisInput): Promise<EnvironmentalAnalysisResult> {
    const base = analyzeLocally(input);
    // deterministic jitter based on plot_id so demo is stable
    const jitter = (input.plot_id.charCodeAt(0) % 7) - 3;
    return {
      ...base,
      provider: "mock",
      risk_score: Math.max(0, Math.min(100, base.risk_score + jitter)),
      summary: base.summary + " [Mock analysis — configure WOLFRAM_APP_ID for enhanced analytics]",
    };
  }
}
