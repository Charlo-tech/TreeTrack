import type { VisionAnalyzer, VisionInput, VisionAnalysis } from "./types";

// Deterministic hash for stable demo values
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export class MockVisionAnalyzer implements VisionAnalyzer {
  async analyze(input: VisionInput): Promise<VisionAnalysis> {
    const seed = input.imagery_id ?? input.plot_id ?? input.image_url ?? "default";
    const h = hashStr(seed);
    // Use plot_id hint to make C3 critical
    const isC3 = (seed.includes("000000000024") || seed.includes("C3") || h % 24 === 14);
    // Simulate latency ~400ms but not blocking test
    await new Promise((r) => setTimeout(r, 120));

    if (isC3) {
      return {
        vegetation_coverage: 38.4,
        canopy_density: 34.1,
        bare_soil_percentage: 52.3,
        water_percentage: 2.1,
        estimated_tree_count: 1420,
        confidence: 0.87,
        detected_changes: [
          "Canopy loss — 28% vs previous capture",
          "Bare soil +18.4%",
          "Possible clearing on eastern boundary",
        ],
        provider: "mock",
        analyzed_at: new Date().toISOString(),
      };
    }

    const veg = 62 + (h % 22);
    const canopy = veg - 4 - (h % 6);
    const bare = 100 - veg - (h % 5) - 2;
    return {
      vegetation_coverage: Number(veg.toFixed(1)),
      canopy_density: Number(canopy.toFixed(1)),
      bare_soil_percentage: Number(Math.max(4, bare).toFixed(1)),
      water_percentage: Number((h % 4).toFixed(1)),
      estimated_tree_count: 1200 + (h % 800),
      confidence: 0.78 + (h % 10) / 100,
      detected_changes: h % 3 === 0 ? ["No significant change"] : ["Minor canopy variation"],
      provider: "mock",
      analyzed_at: new Date().toISOString(),
    };
  }
}
