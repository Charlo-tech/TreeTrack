import { NextRequest } from "next/server";
import { jsonSuccess, jsonError } from "@/lib/api-helpers";
import { smsSchema } from "@/lib/validators";
import { getMessagingProvider } from "@/lib/messaging/provider";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = smsSchema.safeParse(body);
  if (!parsed.success) return jsonError("VALIDATION_ERROR", "Invalid SMS payload", 422, parsed.error.flatten());
  const provider = getMessagingProvider();
  const result = await provider.sendSMS(parsed.data);

  const admin = createAdminClient();
  if (admin) {
    await admin.from("notifications").insert({
      alert_id: parsed.data.alert_id ?? null,
      recipient: parsed.data.recipient,
      channel: "sms",
      message: parsed.data.message,
      status: result.status,
      provider_message_id: result.provider_message_id ?? null,
    });
  }

  return jsonSuccess(result, result.status === "failed" ? 502 : 200);
}
