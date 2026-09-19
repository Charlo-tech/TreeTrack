import { NextRequest } from "next/server";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const plot_id = searchParams.get("plot_id");
  if (!plot_id) return jsonError("VALIDATION_ERROR", "plot_id required", 422);
  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin.from("imagery").select("*").eq("plot_id", plot_id).order("captured_at", { ascending: false });
    if (!error && data) return jsonSuccess(data);
    return jsonError("DB_ERROR", error.message, 500);
  }
  const { MOCK_IMAGERY } = await import("@/lib/mock-data");
  return jsonSuccess(MOCK_IMAGERY.filter((i) => i.plot_id === plot_id));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.plot_id || !body?.image_url) return jsonError("VALIDATION_ERROR", "plot_id and image_url required", 422);
  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin.from("imagery").insert({ ...body, captured_at: body.captured_at ?? new Date().toISOString(), source: body.source ?? "upload" }).select().single();
    if (!error && data) return jsonSuccess(data, 201);
    return jsonError("DB_ERROR", error?.message ?? "Insert failed", 500);
  }
  return jsonSuccess({ id: crypto.randomUUID(), ...body, captured_at: new Date().toISOString() }, 201);
}
