import { NextRequest } from "next/server";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin.from("alerts").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", id).select().single();
    if (!error && data) return jsonSuccess(data);
    if (error) return jsonError("DB_ERROR", error.message, 500);
  }
  // mock fallback
  return jsonSuccess({ id, status: "resolved", resolved_at: new Date().toISOString() });
}
