import { NextRequest } from "next/server";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_OBSERVATIONS } from "@/lib/mock-data";
import { MockEnvironmentalAnalyzer } from "@/lib/analytics/mock";
import { WolframEnvironmentalAnalyzer } from "@/lib/analytics/wolfram";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  let observations: any[] = MOCK_OBSERVATIONS;
  if (admin) {
    const { data } = await admin.from("vegetation_observations").select("*").eq("plot_id", id).order("observation_date", { ascending: true }).limit(24);
    if (data && data.length) observations = data;
  }
  const analyzer = process.env.WOLFRAM_APP_ID
    ? new WolframEnvironmentalAnalyzer(process.env.WOLFRAM_APP_ID)
    : new MockEnvironmentalAnalyzer();
  const result = await analyzer.analyze({ plot_id: id, observations });
  return jsonSuccess(result);
}
