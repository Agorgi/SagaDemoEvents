import type { NextRequest } from "next/server";

export function verifyCronRequest(request: NextRequest) {
  const expected = process.env.CRON_SECRET?.trim();

  if (!expected) {
    throw new Error("CRON_SECRET is not configured.");
  }

  const authorization = request.headers.get("authorization");
  const bearer = authorization?.replace(/^Bearer\s+/i, "").trim();
  const querySecret = request.nextUrl.searchParams.get("secret")?.trim();
  const candidate = bearer || querySecret;

  if (candidate !== expected) {
    throw new Error("Unauthorized cron request.");
  }
}
