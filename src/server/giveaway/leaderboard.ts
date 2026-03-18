import type { ContestEntry, PlatformMetricsLatest } from "@prisma/client";

import { activeCampaign } from "@/src/giveaway/config";
import { db } from "@/src/server/db";
import { computeEntryScore } from "@/src/server/giveaway/scoring";

type EntryWithMetrics = ContestEntry & {
  latestMetrics: PlatformMetricsLatest[];
};

function compareEntries(left: EntryWithMetrics, right: EntryWithMetrics) {
  const leftScore = computeEntryScore(left, left.latestMetrics);
  const rightScore = computeEntryScore(right, right.latestMetrics);

  const leftValue = leftScore.score ?? -1;
  const rightValue = rightScore.score ?? -1;

  if (rightValue !== leftValue) {
    return rightValue - leftValue;
  }

  if (rightScore.highIntentEngagement !== leftScore.highIntentEngagement) {
    return rightScore.highIntentEngagement - leftScore.highIntentEngagement;
  }

  if (left.createdAt.getTime() !== right.createdAt.getTime()) {
    return left.createdAt.getTime() - right.createdAt.getTime();
  }

  return left.externalEntryId.localeCompare(right.externalEntryId);
}

export async function recomputeLeaderboard() {
  const entries = await db.contestEntry.findMany({
    include: {
      latestMetrics: true
    }
  });

  const rankableEntries = entries
    .filter((entry) => computeEntryScore(entry, entry.latestMetrics).verificationState === "ranked")
    .sort(compareEntries);

  const rankById = new Map<string, number>();

  for (const [index, entry] of rankableEntries.entries()) {
    rankById.set(entry.id, index + 1);
  }

  await db.$transaction(
    entries.map((entry) => {
      const score = computeEntryScore(entry, entry.latestMetrics);
      const publicRank = rankById.get(entry.id) ?? null;
      const isTop25 = publicRank !== null && publicRank <= activeCampaign.poolSize;

      return db.contestEntry.update({
        where: { id: entry.id },
        data: {
          latestScore: score.score,
          verificationState: score.verificationState,
          lastVerifiedAt: score.lastVerifiedAt,
          publicRank,
          isTop25
        }
      });
    })
  );

  return rankableEntries.length;
}
