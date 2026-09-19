import { NextRequest } from "next/server";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { visionAnalyzeSchema } from "@/lib/validators";
import { getVisionAnalyzer } from "@/lib/vision/analyzer";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = visionAnalyzeSchema.safeParse(body);
  if (!parsed.success) return jsonError("VALIDATION_ERROR", "Invalid vision input", 422, parsed.error.flatten());
  const { imagery_id, plot_id, image_url } = parsed.data;
  const analyzer = getVisionAnalyzer();
  const result = await analyzer.analyze({ imagery_id, plot_id, image_url });

  // Optionally persist to vision_analyses if imagery_id + supabase configured
  const admin = createAdminClient();
  if (admin && imagery_id) {
    await admin.from("vision_analyses").insert({
      imagery_id,
      vegetation_coverage: result.vegetation_coverage,
      canopy_density: result.canopy_density,
      bare_soil_percentage: result.bare_soil_percentage,
      water_percentage: result.water_percentage,
      estimated_tree_count: result.estimated_tree_count,
      confidence: result.confidence,
      detected_changes: result.detected_changes,
    });
    await admin.from("imagery").update({ analysis_status: "completed" }).eq("id", imagery_id);
  }

  // Label mock clearly
  const withNotice = {
    ...result,
    notice: result.provider === "mock" ? "Mock vision analysis — deterministic demo. Replace with real model via lib/vision/analyzer.ts" : undefined,
  };
  return jsonSuccess(withNotice);
}
