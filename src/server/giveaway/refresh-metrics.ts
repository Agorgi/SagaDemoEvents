import { Prisma, type ContestEntry, type Platform, type PlatformMetricsLatest } from "@prisma/client";

import { db } from "@/src/server/db";
import { mapWithConcurrency, withRetry } from "@/src/server/async";
import { writeAuditLog } from "@/src/server/giveaway/audit";
import { adapterForPlatform } from "@/src/server/giveaway/metrics/adapters";
import { recomputeLeaderboard } from "@/src/server/giveaway/leaderboard";
import { computeEntryScore } from "@/src/server/giveaway/scoring";

type EntryWithMetrics = ContestEntry & {
  latestMetrics: PlatformMetricsLatest[];
};

function jsonValueOrDbNull(value: Prisma.InputJsonValue | null) {
  return value ?? Prisma.DbNull;
}

function entryPlatformUrl(
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

function shouldRetry(error: unknown) {
  if (!(error instanceof Error)) {
    return true;
  }

  return /timed? out|network|fetch|429|50\d/i.test(error.message);
}

function scoreContributionForHistory(
  platform: Platform,
  metric: Pick<
    PlatformMetricsLatest,
    "likeCount" | "uniqueCommenterCount" | "shareCount" | "commentCountBasis" | "fetchStatus"
  >
) {
  const computed = computeEntryScore(
    {
      sagaPostUrl: platform === "saga" ? "present" : null,
      instagramPostUrl: platform === "instagram" ? "present" : null,
      tiktokPostUrl: platform === "tiktok" ? "present" : null,
      eligibilityStatus: "eligible",
      hiddenReason: null
    },
    [
      {
        platform,
        likeCount: metric.likeCount,
        commentCount: null,
        uniqueCommenterCount: metric.uniqueCommenterCount,
        shareCount: metric.shareCount,
        fetchStatus: metric.fetchStatus,
        fetchedAt: new Date(),
        sourceType: "official_api",
        commentCountBasis: metric.commentCountBasis
      }
    ]
  );

  return computed.score;
}

function shouldReplaceAuthoritativeMetric(
  existing: PlatformMetricsLatest | null,
  result: Pick<PlatformMetricsLatest, "fetchStatus" | "sourceType">
) {
  if (!existing) {
    return true;
  }

  if (existing.sourceType === "manual_override" && result.sourceType !== "manual_override") {
    return false;
  }

  if (result.sourceType === "manual_override") {
    return true;
  }

  if (result.fetchStatus === "success") {
    return true;
  }

  return existing.fetchStatus !== "success";
}

async function persistMetricsResult(
  entry: EntryWithMetrics,
  platform: Platform,
  result: Omit<PlatformMetricsLatest, "rawPayloadJson"> & {
    rawPayloadJson: Prisma.InputJsonValue | null;
  }
) {
  const existing = entry.latestMetrics.find((metric) => metric.platform === platform) ?? null;
  const shouldReplace = shouldReplaceAuthoritativeMetric(existing, result);

  if (shouldReplace) {
    await db.platformMetricsLatest.upsert({
      where: {
        contestEntryId_platform: {
          contestEntryId: entry.id,
          platform
        }
      },
      create: {
        contestEntryId: entry.id,
        platform,
        canonicalPostId: result.canonicalPostId,
        canonicalPostUrl: result.canonicalPostUrl,
        likeCount: result.likeCount,
        commentCount: result.commentCount,
        uniqueCommenterCount: result.uniqueCommenterCount,
        shareCount: result.shareCount,
        fetchStatus: result.fetchStatus,
        fetchMessage: result.fetchMessage,
        fetchedAt: result.fetchedAt,
        sourceType: result.sourceType,
        commentCountBasis: result.commentCountBasis,
        rawPayloadJson: jsonValueOrDbNull(result.rawPayloadJson)
      },
      update: {
        canonicalPostId: result.canonicalPostId,
        canonicalPostUrl: result.canonicalPostUrl,
        likeCount: result.likeCount,
        commentCount: result.commentCount,
        uniqueCommenterCount: result.uniqueCommenterCount,
        shareCount: result.shareCount,
        fetchStatus: result.fetchStatus,
        fetchMessage: result.fetchMessage,
        fetchedAt: result.fetchedAt,
        sourceType: result.sourceType,
        commentCountBasis: result.commentCountBasis,
        rawPayloadJson: jsonValueOrDbNull(result.rawPayloadJson)
      }
    });
  }

  await db.metricSnapshotHistory.create({
    data: {
      contestEntryId: entry.id,
      platform,
      likeCount: result.likeCount,
      commentCount: result.commentCount,
      uniqueCommenterCount: result.uniqueCommenterCount,
      shareCount: result.shareCount,
      scoreContribution: scoreContributionForHistory(platform, result),
      fetchMessage: result.fetchMessage,
      fetchedAt: result.fetchedAt,
      sourceType: result.sourceType,
      commentCountBasis: result.commentCountBasis,
      fetchStatus: result.fetchStatus
    }
  });
}

function fallbackResult(platform: Platform, url: string, error: unknown) {
  return {
    platform,
    canonicalPostId: null,
    canonicalPostUrl: url,
    likeCount: null,
    commentCount: null,
    uniqueCommenterCount: null,
    shareCount: null,
    fetchStatus: "transient_error" as const,
    fetchMessage: error instanceof Error ? error.message : "Unknown adapter failure.",
    fetchedAt: new Date(),
    sourceType: "official_api" as const,
    commentCountBasis: "unknown" as const,
    rawPayloadJson: null
  };
}

export async function refreshSingleContestEntryMetrics(entryId: string) {
  const entry = await db.contestEntry.findUnique({
    where: { id: entryId },
    include: {
      latestMetrics: true
    }
  });

  if (!entry) {
    throw new Error(`Contest entry ${entryId} was not found.`);
  }

  let failureCount = 0;
  let reviewRequiredCount = 0;

  for (const platform of ["saga", "instagram", "tiktok"] as const) {
    const url = entryPlatformUrl(entry, platform);

    if (!url) {
      continue;
    }

    const adapter = adapterForPlatform(platform);
    const result = await withRetry(
      () => adapter.fetchMetrics({ url }),
      (error) => shouldRetry(error),
      3
    ).catch((error) => fallbackResult(platform, url, error));

    if (result.fetchStatus !== "success") {
      if (result.fetchStatus === "review_required") {
        reviewRequiredCount += 1;
      } else {
        failureCount += 1;
      }
    }

    await persistMetricsResult(entry, platform, {
      id: "transient",
      contestEntryId: entry.id,
      platform,
      canonicalPostId: result.canonicalPostId,
      canonicalPostUrl: result.canonicalPostUrl,
      likeCount: result.likeCount,
      commentCount: result.commentCount,
      uniqueCommenterCount: result.uniqueCommenterCount,
      shareCount: result.shareCount,
      fetchStatus: result.fetchStatus,
      fetchMessage: result.fetchMessage,
      fetchedAt: result.fetchedAt,
      sourceType: result.sourceType,
      commentCountBasis: result.commentCountBasis,
      rawPayloadJson: result.rawPayloadJson
    });
  }

  await db.contestEntry.update({
    where: { id: entry.id },
    data: {
      lastAttemptedRefreshAt: new Date()
    }
  });

  return {
    entryId: entry.id,
    failureCount,
    reviewRequiredCount
  };
}

export async function refreshContestEntryMetrics() {
  const run = await db.fetchRun.create({
    data: {
      jobName: "refresh_metrics",
      status: "running",
      summaryJson: {
        job: "refresh_metrics"
      }
    }
  });

  try {
    const entries = await db.contestEntry.findMany({
      where: {
        eligibilityStatus: "eligible"
      },
      include: {
        latestMetrics: true
      }
    });

    const results = await mapWithConcurrency(entries, 3, async (entry) =>
      refreshSingleContestEntryMetrics(entry.id)
    );
    const totalFailures = results.reduce((sum, result) => sum + result.failureCount, 0);
    const totalReviewRequired = results.reduce(
      (sum, result) => sum + result.reviewRequiredCount,
      0
    );

    await recomputeLeaderboard();

    await db.fetchRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        status: totalFailures > 0 || totalReviewRequired > 0 ? "partial_failure" : "success",
        totalRowsSeen: entries.length,
        totalEntriesProcessed: results.length,
        totalFailures: totalFailures + totalReviewRequired,
        summaryJson: {
          job: "refresh_metrics",
          refreshedEntries: results.length,
          totalFailures,
          totalReviewRequired
        }
      }
    });

    return {
      refreshedEntries: results.length,
      totalFailures,
      totalReviewRequired
    };
  } catch (error) {
    await db.fetchRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        status: "failed",
        totalFailures: 1,
        summaryJson: {
          job: "refresh_metrics",
          error: error instanceof Error ? error.message : "Unknown refresh failure"
        }
      }
    });

    throw error;
  }
}

function overrideStatusForPlatform(input: {
  platform: Platform;
  likeCount: number | null;
  uniqueCommenterCount: number | null;
  shareCount: number | null;
}) {
  const hasLikes = input.likeCount !== null;
  const hasUniqueCommenters = input.uniqueCommenterCount !== null;
  const hasShares = input.platform === "saga" || input.shareCount !== null;

  return hasLikes && hasUniqueCommenters && hasShares ? "success" : "review_required";
}

export async function applyManualOverride(input: {
  contestEntryId: string;
  platform: Platform;
  likeCount: number | null;
  commentCount: number | null;
  uniqueCommenterCount: number | null;
  shareCount: number | null;
  reason: string;
  createdBy: string;
}) {
  const entry = await db.contestEntry.findUniqueOrThrow({
    where: { id: input.contestEntryId },
    select: {
      id: true,
      sagaPostUrl: true,
      instagramPostUrl: true,
      tiktokPostUrl: true
    }
  });
  const fetchedAt = new Date();
  const fetchStatus = overrideStatusForPlatform(input);
  const commentCountBasis =
    input.uniqueCommenterCount !== null
      ? "unique"
      : input.commentCount !== null
        ? "total"
        : "unknown";

  const override = await db.adminOverride.create({
    data: {
      contestEntryId: input.contestEntryId,
      platform: input.platform,
      likeCount: input.likeCount,
      commentCount: input.commentCount,
      uniqueCommenterCount: input.uniqueCommenterCount,
      shareCount: input.shareCount,
      reason: input.reason,
      createdBy: input.createdBy
    }
  });

  const canonicalPostUrl = entryPlatformUrl(entry, input.platform) ?? "";

  await db.platformMetricsLatest.upsert({
    where: {
      contestEntryId_platform: {
        contestEntryId: input.contestEntryId,
        platform: input.platform
      }
    },
    create: {
      contestEntryId: input.contestEntryId,
      platform: input.platform,
      canonicalPostId: null,
      canonicalPostUrl,
      likeCount: input.likeCount,
      commentCount: input.commentCount,
      uniqueCommenterCount: input.uniqueCommenterCount,
      shareCount: input.shareCount,
      fetchStatus,
      fetchMessage: input.reason,
      fetchedAt,
      sourceType: "manual_override",
      commentCountBasis,
      rawPayloadJson: Prisma.DbNull
    },
    update: {
      likeCount: input.likeCount,
      commentCount: input.commentCount,
      uniqueCommenterCount: input.uniqueCommenterCount,
      shareCount: input.shareCount,
      fetchStatus,
      fetchMessage: input.reason,
      fetchedAt,
      sourceType: "manual_override",
      commentCountBasis,
      rawPayloadJson: Prisma.DbNull
    }
  });

  await db.metricSnapshotHistory.create({
    data: {
      contestEntryId: input.contestEntryId,
      platform: input.platform,
      likeCount: input.likeCount,
      commentCount: input.commentCount,
      uniqueCommenterCount: input.uniqueCommenterCount,
      shareCount: input.shareCount,
      scoreContribution: scoreContributionForHistory(input.platform, {
        likeCount: input.likeCount,
        uniqueCommenterCount: input.uniqueCommenterCount,
        shareCount: input.shareCount,
        commentCountBasis,
        fetchStatus
      }),
      fetchMessage: input.reason,
      fetchedAt,
      sourceType: "manual_override",
      commentCountBasis,
      fetchStatus
    }
  });

  await db.contestEntry.update({
    where: { id: input.contestEntryId },
    data: {
      lastAttemptedRefreshAt: fetchedAt
    }
  });

  await writeAuditLog({
    actor: input.createdBy,
    action: "manual_override_created",
    targetType: "contest_entry",
    targetId: input.contestEntryId,
    metadataJson: {
      platform: input.platform,
      overrideId: override.id
    }
  });

  await recomputeLeaderboard();

  return override;
}
