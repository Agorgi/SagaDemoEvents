import type { Metadata } from "next";

import { GiveawayExperience } from "@/src/giveaway/ui";
import { getGiveawaySnapshot } from "@/src/giveaway/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Court of Stars Giveaway — Los Angeles | Official Leaderboard",
  description:
    "Create for Court of Stars and compete for tickets to Los Angeles, July 18–19, 2026. The top 25 eligible entries by points enter the raffle pool.",
  openGraph: {
    title: "Court of Stars Giveaway — Los Angeles | Official Leaderboard",
    description:
      "Create for Court of Stars and compete for tickets. The top 25 eligible entries by points enter the raffle pool in Los Angeles, July 18–19, 2026.",
    url: "https://saga-demo-playground.vercel.app/giveaway"
  },
  twitter: {
    card: "summary_large_image",
    title: "Court of Stars Giveaway — Los Angeles | Official Leaderboard",
    description:
      "Create for Court of Stars and compete for tickets. The top 25 eligible entries by points enter the raffle pool in Los Angeles, July 18–19, 2026."
  }
};

export default async function GiveawayPage() {
  const snapshot = await getGiveawaySnapshot();

  return <GiveawayExperience initialSnapshot={snapshot} />;
}
