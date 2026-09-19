import { NextRequest } from "next/server";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_OBSERVATIONS, MOCK_PLOTS } from "@/lib/mock-data";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin
      .from("vegetation_observations")
      .select("*")
      .eq("plot_id", id)
      .order("observation_date", { ascending: false })
      .limit(24);
    if (!error && data && data.length) return jsonSuccess(data.reverse());
    if (error) return jsonError("DB_ERROR", error.message, 500);
  }
  // mock
  if (!MOCK_PLOTS.find((p) => p.id === id)) return jsonError("NOT_FOUND", "Plot not found", 404);
  // Special decline for C3 (index 14)
  const isC3 = id === MOCK_PLOTS[14]?.id;
  if (isC3) return jsonSuccess(MOCK_OBSERVATIONS);
  // healthier trajectory for others: slightly increasing
  const obs = MOCK_OBSERVATIONS.map((o, i) => ({
    ...o,
    ndvi: Number((0.62 + (i / 20) * 0.08 + (Math.sin(i) * 0.02)).toFixed(3)),
    health_score: 60 + (i % 8),
  }));
  return jsonSuccess(obs);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.observation_date || body?.ndvi == null) return jsonError("VALIDATION_ERROR", "observation_date and ndvi required", 422);
  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin.from("vegetation_observations").insert({ plot_id: id, ...body }).select().single();
    if (!error && data) return jsonSuccess(data, 201);
    return jsonError("DB_ERROR", error?.message ?? "Insert failed", 500);
  }
  return jsonSuccess({ id: crypto.randomUUID(), plot_id: id, ...body, created_at: new Date().toISOString() }, 201);
}
