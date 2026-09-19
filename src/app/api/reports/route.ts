import { NextRequest } from "next/server";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { fieldReportSchema } from "@/lib/validators";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_FIELD_REPORTS } from "@/lib/mock-data";

export async function GET() {
  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin.from("field_reports").select("*").order("created_at", { ascending: false }).limit(50);
    if (!error && data && data.length) return jsonSuccess(data);
    if (error) return jsonError("DB_ERROR", error.message, 500);
  }
  return jsonSuccess(MOCK_FIELD_REPORTS);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = fieldReportSchema.safeParse(body);
  if (!parsed.success) return jsonError("VALIDATION_ERROR", "Invalid field report", 422, parsed.error.flatten());
  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin.from("field_reports").insert(parsed.data).select().single();
    if (!error && data) return jsonSuccess(data, 201);
    return jsonError("DB_ERROR", error?.message ?? "Insert failed", 500);
  }
  return jsonSuccess({ id: crypto.randomUUID(), ...parsed.data, status: "pending", created_at: new Date().toISOString() }, 201);
}
