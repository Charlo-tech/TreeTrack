import { NextRequest } from "next/server";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_PROJECT } from "@/lib/mock-data";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin.from("projects").select("*").eq("id", id).single();
    if (!error && data) return jsonSuccess(data);
    if (error && !error.message.includes("No rows")) return jsonError("DB_ERROR", error.message, 500);
  }
  if (id === MOCK_PROJECT.id) return jsonSuccess(MOCK_PROJECT);
  return jsonError("NOT_FOUND", "Project not found", 404);
}
