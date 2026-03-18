import { unstable_cache } from "next/cache";

import { activeCampaign, scoringConfig } from "@/src/giveaway/config";
import { buildMockGiveawaySnapshot } from "@/src/giveaway/mock-data";
import type {
  GiveawayEntry,
  GiveawaySnapshot,
  PlatformKey,
  PlatformBreakdown
} from "@/src/giveaway/types";
import { db } from "@/src/server/db";
import { hasDatabaseUrl } from "@/src/server/env";
import { computeEntryScore } from "@/src/server/giveaway/scoring";

function emptyBreakdown(): Record<PlatformKey, PlatformBreakdown> {
  return {
    saga: {
      likes: null,
      uniqueComments: null,
      shares: null,
      score: null,
      lastUpdatedAt: null
    },
    instagram: {
      likes: null,
      uniqueComments: null,
      shares: null,
      score: null,
      lastUpdatedAt: null
    },
    tiktok: {
      likes: null,
      uniqueComments: null,
      shares: null,
      score: null,
      lastUpdatedAt: null
    }
  };
}

async function buildDatabaseSnapshot(): Promise<GiveawaySnapshot> {
  const [entries, latestRun] = await Promise.all([
    db.contestEntry.findMany({
      where: {
        verificationState: {
          in: ["ranked", "awaiting_verification"]
        }
      },
      include: {
        latestMetrics: true
      },
      orderBy: [
        {
          publicRank: "asc"
        },
        {
          createdAt: "asc"
        }
      ]
    }),
    db.fetchRun.findFirst({
      where: {
        jobName: "refresh_metrics",
        status: {
          in: ["success", "partial_failure"]
        }
      },
      orderBy: {
        startedAt: "desc"
      }
    })
  ]);

  const cutlineEntry = entries.find((entry) => entry.publicRank === activeCampaign.poolSize) ?? null;
  const cutlineScore = cutlineEntry?.latestScore ?? null;

  const mappedEntries = entries.map<GiveawayEntry>((entry) => {
    const score = computeEntryScore(entry, entry.latestMetrics);
    const platformBreakdown = emptyBreakdown();

    for (const item of score.breakdown) {
      const metric = entry.latestMetrics.find((candidate) => candidate.platform === item.platform) ?? null;
      platformBreakdown[item.platform] = {
        likes: metric?.likeCount ?? null,
        uniqueComments: metric?.uniqueCommenterCount ?? null,
        shares: metric?.shareCount ?? null,
        score: item.scoreContribution,
        lastUpdatedAt: metric?.fetchedAt.toISOString() ?? null
      };
    }

    const submissions = ([
      {
        platform: "saga" as const,
        url: entry.sagaPostUrl
      },
      {
        platform: "instagram" as const,
        url: entry.instagramPostUrl
      },
      {
        platform: "tiktok" as const,
        url: entry.tiktokPostUrl
      }
    ] as const)
      .filter((item) => Boolean(item.url))
      .map((item) => ({
        id: `${entry.id}-${item.platform}`,
        title: entry.entryTitle,
        url: item.url,
        platform: item.platform,
        contentType: entry.contentType,
        thumbnailUrl: entry.thumbnailUrl,
        submittedAt: entry.createdAt.toISOString(),
        engagementScore: platformBreakdown[item.platform].score
      }));

    return {
      id: entry.id,
      entryId: entry.externalEntryId,
      rank: entry.publicRank,
      raffleZone: entry.isTop25,
      displayName: entry.publicDisplayName,
      profileImageUrl: entry.profileImageUrl,
      entryTitle: entry.entryTitle,
      contentType: entry.contentType,
      contentTypes: entry.contentType ? [entry.contentType] : [],
      totalEngagementScore: entry.latestScore,
      highIntentEngagement: score.highIntentEngagement,
      eligibilityStatus: entry.eligibilityStatus,
      leaderboardState: entry.verificationState,
      cutlineDelta:
        entry.latestScore !== null && cutlineScore !== null ? entry.latestScore - cutlineScore : null,
      thumbnailUrl: entry.thumbnailUrl,
      submittedAt: entry.createdAt.toISOString(),
      lastVerifiedAt: entry.lastVerifiedAt?.toISOString() ?? null,
      platformBreakdown,
      submissions
    };
  });

  const rankedEntries = mappedEntries.filter((entry) => entry.leaderboardState === "ranked");
  const awaitingVerificationEntries = mappedEntries.filter(
    (entry) => entry.leaderboardState === "awaiting_verification"
  );
  const lastUpdatedAt =
    latestRun?.finishedAt?.toISOString() ??
    rankedEntries
      .map((entry) => entry.lastVerifiedAt)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ??
    new Date().toISOString();

  return {
    campaign: activeCampaign,
    scoring: scoringConfig,
    dataSource: "database",
    status: "live",
    generatedAt: new Date().toISOString(),
    lastUpdatedAt,
    liveRefreshSeconds: activeCampaign.refreshCadenceSeconds,
    totalEntries: mappedEntries.length,
    totalEligible: mappedEntries.length,
    rankedEntryCount: rankedEntries.length,
    awaitingVerificationCount: awaitingVerificationEntries.length,
    cutlineScore,
    cutlineRank: activeCampaign.poolSize,
    message: null,
    entries: mappedEntries,
    rankedEntries,
    awaitingVerificationEntries,
    topEntries: rankedEntries.slice(0, 3),
    closestToCutline:
      rankedEntries.find((entry) => entry.rank === activeCampaign.poolSize + 1) ??
      awaitingVerificationEntries[0] ??
      null
  };
}

const getCachedSnapshot = unstable_cache(
  async () => {
    if (!hasDatabaseUrl()) {
      return buildMockGiveawaySnapshot();
    }

    return buildDatabaseSnapshot();
  },
  ["giveaway-public-snapshot"],
  {
    revalidate: activeCampaign.revalidateSeconds
  }
);

export async function getGiveawaySnapshot() {
  return getCachedSnapshot();
}

export async function getFinalistPoolForRaffle() {
  const snapshot = await getGiveawaySnapshot();

  return snapshot.rankedEntries
    .filter((entry) => entry.raffleZone)
    .map((entry) => ({
      id: entry.entryId,
      displayName: entry.displayName,
      rank: entry.rank ?? 0,
      totalEngagementScore: entry.totalEngagementScore ?? 0
    }));
}
