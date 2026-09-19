import { NextRequest } from "next/server";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_PROJECT } from "@/lib/mock-data";
import { createProjectSchema } from "@/lib/validators";

export async function GET() {
  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin.from("projects").select("*").order("created_at", { ascending: false }).limit(20);
    if (!error && data && data.length) return jsonSuccess(data);
  }
  return jsonSuccess([MOCK_PROJECT]);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) return jsonError("VALIDATION_ERROR", "Invalid project payload", 422, parsed.error.flatten());
  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin.from("projects").insert(parsed.data).select().single();
    if (!error && data) return jsonSuccess(data, 201);
    return jsonError("DB_ERROR", error?.message ?? "Insert failed", 500);
  }
  return jsonSuccess({ id: crypto.randomUUID(), ...parsed.data, created_at: new Date().toISOString() }, 201);
}
