import { NextResponse } from "next/server";

import { getGiveawaySnapshot } from "@/src/giveaway/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getGiveawaySnapshot();

  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=180, stale-while-revalidate=300"
    }
  });
}
