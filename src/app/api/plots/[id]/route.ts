import { NextRequest } from "next/server";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_PLOTS, MOCK_OBSERVATIONS } from "@/lib/mock-data";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin.from("plots").select("*").eq("id", id).single();
    if (!error && data) {
      // enrich with latest observation if available
      const { data: obs } = await admin
        .from("vegetation_observations")
        .select("*")
        .eq("plot_id", id)
        .order("observation_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      return jsonSuccess({ ...data, latest_observation: obs ?? null });
    }
    if (error && !error.message.includes("No rows")) return jsonError("DB_ERROR", error.message, 500);
  }
  const plot = MOCK_PLOTS.find((p) => p.id === id);
  if (!plot) return jsonError("NOT_FOUND", "Plot not found", 404);
  const latest = MOCK_OBSERVATIONS[MOCK_OBSERVATIONS.length - 1];
  return jsonSuccess({
    ...plot,
    latest_observation: latest,
    vegetation_coverage: 38.4,
    canopy_density: 34.1,
  });
}
