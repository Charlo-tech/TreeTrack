import { NextRequest, NextResponse } from "next/server";
import { MockMessagingProvider } from "@/lib/messaging/mock";

export async function POST(req: NextRequest) {
  // Africa's Talking sends x-www-form-urlencoded
  const contentType = req.headers.get("content-type") ?? "";
  let phoneNumber = "";
  let text = "";
  let sessionId = "";
  let serviceCode = "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    phoneNumber = String(form.get("phoneNumber") ?? "");
    text = String(form.get("text") ?? "");
    sessionId = String(form.get("sessionId") ?? "");
    serviceCode = String(form.get("serviceCode") ?? "");
  } else {
    const body = await req.json().catch(() => ({}));
    phoneNumber = body.phoneNumber ?? body.phone_number ?? "";
    text = body.text ?? "";
    sessionId = body.sessionId ?? "";
    serviceCode = body.serviceCode ?? "";
  }

  const provider = new MockMessagingProvider();
  const response = await provider.handleUSSD(phoneNumber, text);

  // AT expects text/plain
  return new NextResponse(response, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

// Africa's Talking will POST; also allow GET for testing
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = new MockMessagingProvider();
  const text = searchParams.get("text") ?? "";
  const phoneNumber = searchParams.get("phoneNumber") ?? "+254700000000";
  const resp = await provider.handleUSSD(phoneNumber, text);
  return new NextResponse(resp, { headers: { "Content-Type": "text/plain" } });
}
