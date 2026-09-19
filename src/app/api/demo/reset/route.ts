import { jsonSuccess } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const admin = createAdminClient();
  if (admin) {
    // best-effort cleanup of demo alerts/notifications created in last 24h
    const since = new Date(Date.now() - 86400000).toISOString();
    await admin.from("notifications").delete().gte("created_at", since);
    await admin.from("alerts").delete().gte("created_at", since);
    await admin.from("environmental_events").delete().gte("created_at", since);
  }
  return jsonSuccess({ message: "Demo data reset (mock + recent alerts cleaned up if Supabase configured)." });
}
