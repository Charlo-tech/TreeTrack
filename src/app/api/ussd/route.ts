import { NextRequest, NextResponse } from "next/server";
import { MockMessagingProvider } from "@/lib/messaging/mock";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function normalizePhone(raw: string): string {
  let p = (raw ?? "").trim();
  // AT x-www-form-urlencoded turns + into space if not encoded as %2B
  if (p.startsWith(" 254")) p = "+" + p.trim();
  // remove spaces
  p = p.replace(/\s+/g, "");
  return p;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let phoneNumber = "";
    let text = "";
    let sessionId = "";
    let serviceCode = "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      phoneNumber = normalizePhone(String(form.get("phoneNumber") ?? form.get("phone_number") ?? ""));
      text = String(form.get("text") ?? "").trim();
      sessionId = String(form.get("sessionId") ?? form.get("sessionID") ?? "");
      serviceCode = String(form.get("serviceCode") ?? "");
      // Some simulators send networkCode / operatorCode
    } else {
      const body = await req.json().catch(() => ({} as any));
      phoneNumber = normalizePhone(body.phoneNumber ?? body.phone_number ?? body.phone ?? "");
      text = String(body.text ?? "").trim();
      sessionId = String(body.sessionId ?? body.sessionID ?? "");
      serviceCode = String(body.serviceCode ?? body.service_code ?? "");
    }

    // Strip URL-encoded hash if simulator sends *384*...%23
    text = text.replace(/%23/g, "").replace(/#/g, "");

    const provider = new MockMessagingProvider();
    const response = await provider.handleUSSD(phoneNumber || "+254700725236", text);

    // AT STRICT: must be text/plain, start with CON or END, no JSON wrapper, no extra whitespace before token
    const clean = response.trimStart();

    return new NextResponse(clean, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Session-Id": sessionId,
        "X-Service-Code": serviceCode,
      },
    });
  } catch (err: any) {
    // Never return 500 - AT shows "service error". Return END with message
    return new NextResponse(`END Service temporarily unavailable. Please try again.`, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

// GET for quick browser / simulator health check
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phoneNumber = normalizePhone(searchParams.get("phoneNumber") ?? searchParams.get("phone_number") ?? "+254700725236");
  const text = (searchParams.get("text") ?? "").trim().replace(/%23/g, "").replace(/#/g, "");
  const provider = new MockMessagingProvider();
  const resp = await provider.handleUSSD(phoneNumber, text);
  return new NextResponse(resp.trimStart(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
