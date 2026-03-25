import type {
  ContestEntry,
  Platform,
  PlatformMetricsLatest,
  VerificationState
} from "@prisma/client";

import {
  PLATFORM_KEYS,
  SCORE_WEIGHTS,
  basisSupportsUniqueComments,
  isSuccessStatus
} from "@/src/server/giveaway/constants";

type MetricsRecord = Pick<
  PlatformMetricsLatest,
  | "platform"
  | "likeCount"
  | "commentCount"
  | "uniqueCommenterCount"
  | "shareCount"
  | "fetchStatus"
  | "fetchedAt"
  | "sourceType"
  | "commentCountBasis"
>;

export interface PlatformScoreBreakdown {
  platform: Platform;
  hasUrl: boolean;
  scoreContribution: number | null;
  highIntentContribution: number;
  verified: boolean;
}

export interface EntryScoreComputation {
  score: number | null;
  verificationState: VerificationState;
  highIntentEngagement: number;
  lastVerifiedAt: Date | null;
  breakdown: PlatformScoreBreakdown[];
  issues: string[];
}

function platformUrl(
  entry: Pick<ContestEntry, "sagaPostUrl" | "instagramPostUrl" | "tiktokPostUrl">,
  platform: Platform
) {
  switch (platform) {
    case "saga":
      return entry.sagaPostUrl;
    case "instagram":
      return entry.instagramPostUrl;
    case "tiktok":
      return entry.tiktokPostUrl;
  }
}

function computePlatformContribution(platform: Platform, metrics: MetricsRecord) {
  const weights = SCORE_WEIGHTS[platform];

  if (metrics.likeCount === null) {
    return null;
  }

  if (!basisSupportsUniqueComments(metrics.commentCountBasis, metrics.uniqueCommenterCount)) {
    return null;
  }

  if (platform !== "saga" && metrics.shareCount === null) {
    return null;
  }

  return (
    weights.posts +
    metrics.likeCount * weights.likes +
    (metrics.uniqueCommenterCount ?? 0) * weights.uniqueComments +
    (metrics.shareCount ?? 0) * weights.shares
  );
}

function metricIsVerified(platform: Platform, metrics: MetricsRecord) {
  if (!isSuccessStatus(metrics.fetchStatus)) {
    return false;
  }

  if (metrics.likeCount === null) {
    return false;
  }

  if (!basisSupportsUniqueComments(metrics.commentCountBasis, metrics.uniqueCommenterCount)) {
    return false;
  }

  if (platform !== "saga" && metrics.shareCount === null) {
    return false;
  }

  return true;
}

function isHiddenEntry(
  entry: Pick<ContestEntry, "eligibilityStatus" | "hiddenReason">
) {
  return entry.eligibilityStatus !== "eligible" || Boolean(entry.hiddenReason);
}

function hasAnyDirectPostUrl(
  entry: Pick<ContestEntry, "sagaPostUrl" | "instagramPostUrl" | "tiktokPostUrl">
) {
  return Boolean(entry.sagaPostUrl || entry.instagramPostUrl || entry.tiktokPostUrl);
}

export function computeEntryScore(
  entry: Pick<
    ContestEntry,
    | "sagaPostUrl"
    | "instagramPostUrl"
    | "tiktokPostUrl"
    | "eligibilityStatus"
    | "hiddenReason"
  >,
  metrics: MetricsRecord[]
): EntryScoreComputation {
  if (isHiddenEntry(entry)) {
    return {
      score: null,
      verificationState: "hidden",
      highIntentEngagement: 0,
      lastVerifiedAt: null,
      breakdown: [],
      issues: []
    };
  }

  if (!hasAnyDirectPostUrl(entry)) {
    return {
      score: null,
      verificationState: "awaiting_verification",
      highIntentEngagement: 0,
      lastVerifiedAt: null,
      breakdown: PLATFORM_KEYS.map((platform) => ({
        platform,
        hasUrl: false,
        scoreContribution: 0,
        highIntentContribution: 0,
        verified: true
      })),
      issues: ["Direct post URLs are required before this entry can be scored."]
    };
  }

  let totalScore = 0;
  let highIntentEngagement = 0;
  let verifiedAtFloor: Date | null = null;
  let unresolved = false;
  const breakdown: PlatformScoreBreakdown[] = [];
  const issues: string[] = [];

  for (const platform of PLATFORM_KEYS) {
    const url = platformUrl(entry, platform);

    if (!url) {
      breakdown.push({
        platform,
        hasUrl: false,
        scoreContribution: 0,
        highIntentContribution: 0,
        verified: true
      });
      continue;
    }

    const metric = metrics.find((item) => item.platform === platform) ?? null;

    if (!metric) {
      unresolved = true;
      issues.push(`${platform} metrics have not been verified yet.`);
      breakdown.push({
        platform,
        hasUrl: true,
        scoreContribution: null,
        highIntentContribution: 0,
        verified: false
      });
      continue;
    }

    const contribution = computePlatformContribution(platform, metric);
    const highIntentContribution = (metric.uniqueCommenterCount ?? 0) + (metric.shareCount ?? 0);

    if (!metricIsVerified(platform, metric) || contribution === null) {
      unresolved = true;

      if (metric.fetchStatus === "success") {
        issues.push(`${platform} metrics are present but still need verified scoring fields.`);
      } else {
        issues.push(`${platform} metrics are awaiting review: ${metric.fetchStatus}.`);
      }

      breakdown.push({
        platform,
        hasUrl: true,
        scoreContribution: null,
        highIntentContribution,
        verified: false
      });
      continue;
    }

    totalScore += contribution;
    highIntentEngagement += highIntentContribution;

    if (!verifiedAtFloor || metric.fetchedAt < verifiedAtFloor) {
      verifiedAtFloor = metric.fetchedAt;
    }

    breakdown.push({
      platform,
      hasUrl: true,
      scoreContribution: contribution,
      highIntentContribution,
      verified: true
    });
  }

  if (unresolved) {
    return {
      score: null,
      verificationState: "awaiting_verification",
      highIntentEngagement,
      lastVerifiedAt: null,
      breakdown,
      issues
    };
  }

  return {
    score: totalScore,
    verificationState: "ranked",
    highIntentEngagement,
    lastVerifiedAt: verifiedAtFloor,
    breakdown,
    issues
  };
}
