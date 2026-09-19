import { NextResponse } from "next/server";
import { apiSuccess, apiError } from "@/lib/utils";

export function jsonSuccess(data: unknown, status = 200, meta?: Record<string, unknown>) {
  return NextResponse.json(apiSuccess(data, meta), { status });
}
export function jsonError(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json(apiError(code, message, details), { status });
}

export function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  return res;
}
