import { NextResponse, type NextRequest } from "next/server";

import { verifyCronRequest } from "@/src/server/cron";
import { refreshContestEntryMetrics } from "@/src/server/giveaway/refresh-metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    verifyCronRequest(request);
    const result = await refreshContestEntryMetrics();
    return NextResponse.json({
      ok: true,
      ...result
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Metrics refresh failed."
      },
      {
        status: error instanceof Error && /Unauthorized/.test(error.message) ? 401 : 500
      }
    );
  }
}
