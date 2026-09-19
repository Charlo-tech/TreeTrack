import { NextRequest } from "next/server";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_PLOTS } from "@/lib/mock-data";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin.from("plots").select("*").eq("project_id", id).order("plot_code");
    if (!error && data && data.length) return jsonSuccess(data);
    if (error) return jsonError("DB_ERROR", error.message, 500);
  }
  // fallback — filter mock plots by project (all share same project id)
  const filtered = MOCK_PLOTS.filter((p) => p.project_id === id);
  if (filtered.length) return jsonSuccess(filtered);
  // if id is mock project, return all mock plots regardless
  if (id === "00000000-0000-0000-0000-000000000001") return jsonSuccess(MOCK_PLOTS);
  return jsonSuccess(filtered);
}
