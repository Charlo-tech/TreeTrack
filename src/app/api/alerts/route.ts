import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_ALERTS } from "@/lib/mock-data";

export async function GET() {
  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin.from("alerts").select("*").order("created_at", { ascending: false }).limit(50);
    if (!error && data && data.length) return jsonSuccess(data);
    if (error) return jsonError("DB_ERROR", error.message, 500);
  }
  return jsonSuccess(MOCK_ALERTS);
}
