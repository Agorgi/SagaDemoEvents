import { activeCampaign, scoringConfig } from "@/src/giveaway/config";
import type { GiveawayEntry, GiveawaySnapshot, PlatformKey } from "@/src/giveaway/types";

function computeMockPlatformScore(
  platform: PlatformKey,
  values: { likes: number; uniqueComments: number; shares: number } | undefined
) {
  if (!values) {
    return null;
  }

  const weights = scoringConfig.weights[platform];

  return (
    weights.posts +
    values.likes * weights.likes +
    values.uniqueComments * weights.comments +
    values.shares * weights.shares
  );
}

function platformBreakdown(
  values: Partial<Record<PlatformKey, { likes: number; uniqueComments: number; shares: number; score: number }>>
) {
  return {
    saga: {
      likes: values.saga?.likes ?? null,
      uniqueComments: values.saga?.uniqueComments ?? null,
      shares: values.saga?.shares ?? null,
      score: computeMockPlatformScore("saga", values.saga),
      lastUpdatedAt: new Date().toISOString()
    },
    instagram: {
      likes: values.instagram?.likes ?? null,
      uniqueComments: values.instagram?.uniqueComments ?? null,
      shares: values.instagram?.shares ?? null,
      score: computeMockPlatformScore("instagram", values.instagram),
      lastUpdatedAt: new Date().toISOString()
    },
    tiktok: {
      likes: values.tiktok?.likes ?? null,
      uniqueComments: values.tiktok?.uniqueComments ?? null,
      shares: values.tiktok?.shares ?? null,
      score: computeMockPlatformScore("tiktok", values.tiktok),
      lastUpdatedAt: new Date().toISOString()
    }
  };
}

function rankedEntry(input: {
  id: string;
  rank: number;
  displayName: string;
  entryTitle: string;
  contentType: string;
  thumbnailUrl: string;
  totalPoints: number;
  breakdown: Partial<Record<PlatformKey, { likes: number; uniqueComments: number; shares: number; score: number }>>;
}) {
  const breakdown = platformBreakdown(input.breakdown);
  const totalPoints = Object.values(breakdown).reduce(
    (sum, platform) => sum + (platform.score ?? 0),
    0
  );
  const submissions = ([
    {
      platform: "saga",
      url: `https://app.try-saga.com/post/${input.id}`,
      score: breakdown.saga.score
    },
    {
      platform: "instagram",
      url: `https://instagram.com/p/${input.id}`,
      score: breakdown.instagram.score
    },
    {
      platform: "tiktok",
      url: `https://www.tiktok.com/@demo/video/${input.id.replace(/[^0-9]/g, "").padEnd(8, "7")}`,
      score: breakdown.tiktok.score
    }
  ] as const).map((submission) => ({
    id: `${input.id}-${submission.platform}`,
    title: input.entryTitle,
    url: submission.url,
    platform: submission.platform,
    contentType: input.contentType,
    thumbnailUrl: input.thumbnailUrl,
    submittedAt: new Date().toISOString(),
    engagementScore: submission.score
  }));

  return {
    id: input.id,
    entryId: input.id.toUpperCase(),
    rank: input.rank,
    raffleZone: input.rank <= activeCampaign.poolSize,
    displayName: input.displayName,
    profileImageUrl: null,
    entryTitle: input.entryTitle,
    contentType: input.contentType,
    contentTypes: [input.contentType],
    totalEngagementScore: totalPoints,
    highIntentEngagement:
      (input.breakdown.saga?.uniqueComments ?? 0) +
      (input.breakdown.instagram?.uniqueComments ?? 0) +
      (input.breakdown.instagram?.shares ?? 0) +
      (input.breakdown.tiktok?.uniqueComments ?? 0) +
      (input.breakdown.tiktok?.shares ?? 0),
    eligibilityStatus: "eligible",
    leaderboardState: "ranked",
    cutlineDelta: null,
    thumbnailUrl: input.thumbnailUrl,
    submittedAt: new Date().toISOString(),
    lastVerifiedAt: new Date().toISOString(),
    platformBreakdown: breakdown,
    submissions
  } satisfies GiveawayEntry;
}

function pendingEntry(input: {
  id: string;
  displayName: string;
  entryTitle: string;
  contentType: string;
  thumbnailUrl: string;
  eligibilityStatus?: "eligible" | "pending_review";
}) {
  return {
    id: input.id,
    entryId: input.id.toUpperCase(),
    rank: null,
    raffleZone: false,
    displayName: input.displayName,
    profileImageUrl: null,
    entryTitle: input.entryTitle,
    contentType: input.contentType,
    contentTypes: [input.contentType],
    totalEngagementScore: null,
    highIntentEngagement: 0,
    eligibilityStatus: input.eligibilityStatus ?? "eligible",
    leaderboardState: "awaiting_verification",
    cutlineDelta: null,
    thumbnailUrl: input.thumbnailUrl,
    submittedAt: new Date().toISOString(),
    lastVerifiedAt: null,
    platformBreakdown: platformBreakdown({}),
    submissions: [
      {
        id: `${input.id}-saga`,
        title: input.entryTitle,
        url: `https://app.try-saga.com/post/${input.id}`,
        platform: "saga",
        contentType: input.contentType,
        thumbnailUrl: input.thumbnailUrl,
        submittedAt: new Date().toISOString(),
        engagementScore: null
      }
    ]
  } satisfies GiveawayEntry;
}

export function buildMockGiveawaySnapshot(): GiveawaySnapshot {
  const rankedEntries = [
    rankedEntry({
      id: "entry-001",
      rank: 1,
      displayName: "Aurelia Vale",
      entryTitle: "Moonlit Ball Lookbook",
      contentType: "Cosplay",
      thumbnailUrl: "/cosplay-live-drawing-poster.png",
      totalPoints: 1020,
      breakdown: {
        saga: { likes: 20, uniqueComments: 8, shares: 0, score: 560 },
        instagram: { likes: 120, uniqueComments: 34, shares: 18, score: 208 },
        tiktok: { likes: 142, uniqueComments: 22, shares: 29, score: 252 }
      }
    }),
    rankedEntry({
      id: "entry-002",
      rank: 2,
      displayName: "Cassian Bloom",
      entryTitle: "Court Poster Series",
      contentType: "Art & Illustration",
      thumbnailUrl: "/feed/post-2.png",
      totalPoints: 954,
      breakdown: {
        saga: { likes: 16, uniqueComments: 7, shares: 0, score: 460 },
        instagram: { likes: 134, uniqueComments: 20, shares: 14, score: 196 },
        tiktok: { likes: 115, uniqueComments: 25, shares: 26, score: 298 }
      }
    }),
    rankedEntry({
      id: "entry-003",
      rank: 3,
      displayName: "Selene Hart",
      entryTitle: "A Courtier's Backstory",
      contentType: "Fanfiction & Lore",
      thumbnailUrl: "/feed/post-3.png",
      totalPoints: 918,
      breakdown: {
        saga: { likes: 18, uniqueComments: 6, shares: 0, score: 480 },
        instagram: { likes: 88, uniqueComments: 31, shares: 16, score: 167 },
        tiktok: { likes: 103, uniqueComments: 21, shares: 21, score: 271 }
      }
    }),
    rankedEntry({
      id: "entry-004",
      rank: 4,
      displayName: "Mira Noctis",
      entryTitle: "Velvet Moon Makeup Reel",
      contentType: "Video",
      thumbnailUrl: "/event-love-and-deepspace.jpg",
      totalPoints: 864,
      breakdown: {
        saga: { likes: 13, uniqueComments: 7, shares: 0, score: 400 },
        instagram: { likes: 95, uniqueComments: 18, shares: 18, score: 167 },
        tiktok: { likes: 110, uniqueComments: 17, shares: 20, score: 297 }
      }
    }),
    rankedEntry({
      id: "entry-005",
      rank: 5,
      displayName: "Juniper Wren",
      entryTitle: "Rose Court Gown Build",
      contentType: "Cosplay",
      thumbnailUrl: "/community-avengers.png",
      totalPoints: 822,
      breakdown: {
        saga: { likes: 14, uniqueComments: 5, shares: 0, score: 380 },
        instagram: { likes: 96, uniqueComments: 16, shares: 17, score: 163 },
        tiktok: { likes: 101, uniqueComments: 19, shares: 19, score: 279 }
      }
    }),
    rankedEntry({
      id: "entry-006",
      rank: 6,
      displayName: "Lyra Daye",
      entryTitle: "Tea Party Character Journal",
      contentType: "Lore",
      thumbnailUrl: "/event-genshin-scavenger-hunt.png",
      totalPoints: 780,
      breakdown: {
        saga: { likes: 12, uniqueComments: 5, shares: 0, score: 340 },
        instagram: { likes: 82, uniqueComments: 17, shares: 12, score: 135 },
        tiktok: { likes: 110, uniqueComments: 18, shares: 23, score: 305 }
      }
    }),
    rankedEntry({
      id: "entry-007",
      rank: 7,
      displayName: "Orion Crest",
      entryTitle: "Ballroom Invitation Trailer",
      contentType: "Video",
      thumbnailUrl: "/feed/post-bbno.jpg",
      totalPoints: 748,
      breakdown: {
        saga: { likes: 11, uniqueComments: 5, shares: 0, score: 320 },
        instagram: { likes: 77, uniqueComments: 15, shares: 11, score: 125 },
        tiktok: { likes: 102, uniqueComments: 16, shares: 21, score: 303 }
      }
    }),
    rankedEntry({
      id: "entry-008",
      rank: 8,
      displayName: "Freya Sol",
      entryTitle: "Starlit Poster Print",
      contentType: "Art & Illustration",
      thumbnailUrl: "/community-onepiece.jpg",
      totalPoints: 711,
      breakdown: {
        saga: { likes: 9, uniqueComments: 5, shares: 0, score: 280 },
        instagram: { likes: 92, uniqueComments: 12, shares: 13, score: 143 },
        tiktok: { likes: 96, uniqueComments: 15, shares: 17, score: 288 }
      }
    }),
    rankedEntry({
      id: "entry-009",
      rank: 9,
      displayName: "Nadia Vale",
      entryTitle: "Moon Court Moodboard",
      contentType: "Moodboard",
      thumbnailUrl: "/feed/post-2.png",
      totalPoints: 676,
      breakdown: {
        saga: { likes: 8, uniqueComments: 5, shares: 0, score: 260 },
        instagram: { likes: 90, uniqueComments: 11, shares: 10, score: 131 },
        tiktok: { likes: 88, uniqueComments: 14, shares: 17, score: 285 }
      }
    }),
    rankedEntry({
      id: "entry-010",
      rank: 10,
      displayName: "Theo Arden",
      entryTitle: "Court Correspondence",
      contentType: "Fanfiction",
      thumbnailUrl: "/feed/post-3.png",
      totalPoints: 644,
      breakdown: {
        saga: { likes: 7, uniqueComments: 5, shares: 0, score: 240 },
        instagram: { likes: 75, uniqueComments: 12, shares: 12, score: 123 },
        tiktok: { likes: 82, uniqueComments: 13, shares: 18, score: 281 }
      }
    })
  ];

  const awaitingVerificationEntries = [
    pendingEntry({
      id: "entry-011",
      displayName: "Vesper Lane",
      entryTitle: "Royal Arrival Carousel",
      contentType: "Cosplay",
      thumbnailUrl: "/cosplay-live-drawing-poster.png"
    }),
    pendingEntry({
      id: "entry-012",
      displayName: "Elio March",
      entryTitle: "Court Seating Sketchbook",
      contentType: "Art & Illustration",
      thumbnailUrl: "/event-love-and-deepspace.jpg",
      eligibilityStatus: "pending_review"
    })
  ];

  const cutlineScore = rankedEntries[Math.min(activeCampaign.poolSize, rankedEntries.length) - 1]?.totalEngagementScore ?? null;
  const entries = [...rankedEntries, ...awaitingVerificationEntries].map((entry) => ({
    ...entry,
    cutlineDelta:
      entry.totalEngagementScore !== null && cutlineScore !== null
        ? entry.totalEngagementScore - cutlineScore
        : null
  }));

  return {
    campaign: activeCampaign,
    scoring: scoringConfig,
    dataSource: "mock",
    status: "preview",
    generatedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    liveRefreshSeconds: activeCampaign.refreshCadenceSeconds,
    totalEntries: entries.length,
    totalEligible:
      rankedEntries.length +
      awaitingVerificationEntries.filter((entry) => entry.eligibilityStatus === "eligible").length,
    rankedEntryCount: rankedEntries.length,
    awaitingVerificationCount: awaitingVerificationEntries.length,
    cutlineScore,
    cutlineRank: activeCampaign.poolSize,
    message: null,
    entries,
    rankedEntries: entries.filter((entry) => entry.leaderboardState === "ranked"),
    awaitingVerificationEntries: entries.filter(
      (entry) => entry.leaderboardState === "awaiting_verification"
    ),
    topEntries: entries.filter((entry) => entry.rank !== null).slice(0, 3),
    closestToCutline:
      entries.find((entry) => entry.rank === activeCampaign.poolSize + 1) ??
      entries.find((entry) => entry.leaderboardState === "awaiting_verification") ??
      null
  };
}
