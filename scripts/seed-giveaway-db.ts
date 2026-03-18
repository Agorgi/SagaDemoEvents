import { Prisma } from "@prisma/client";

import { db } from "@/src/server/db";
import { buildMockGiveawaySnapshot } from "@/src/giveaway/mock-data";

async function main() {
  const snapshot = buildMockGiveawaySnapshot();

  await db.$transaction([
    db.metricSnapshotHistory.deleteMany(),
    db.platformMetricsLatest.deleteMany(),
    db.adminOverride.deleteMany(),
    db.adminAuditLog.deleteMany(),
    db.fetchRun.deleteMany(),
    db.contestEntry.deleteMany()
  ]);

  for (const entry of snapshot.entries) {
    const sagaSubmission = entry.submissions.find((submission) => submission.platform === "saga");
    const instagramSubmission = entry.submissions.find(
      (submission) => submission.platform === "instagram"
    );
    const tiktokSubmission = entry.submissions.find((submission) => submission.platform === "tiktok");

    const createdEntry = await db.contestEntry.create({
      data: {
        externalEntryId: entry.entryId,
        creatorName: entry.displayName,
        publicDisplayName: entry.displayName,
        profileImageUrl: entry.profileImageUrl,
        thumbnailUrl: entry.thumbnailUrl,
        sagaPostUrl: sagaSubmission?.url ?? null,
        instagramPostUrl: instagramSubmission?.url ?? null,
        tiktokPostUrl: tiktokSubmission?.url ?? null,
        entryTitle: entry.entryTitle,
        contentType: entry.contentType,
        eligibilityStatus: entry.eligibilityStatus,
        createdAt: entry.submittedAt ? new Date(entry.submittedAt) : new Date(),
        latestScore: entry.totalEngagementScore,
        verificationState:
          entry.leaderboardState === "ranked" ? "ranked" : "awaiting_verification",
        lastVerifiedAt: entry.lastVerifiedAt ? new Date(entry.lastVerifiedAt) : null,
        lastAttemptedRefreshAt: new Date(),
        publicRank: entry.rank,
        isTop25: entry.raffleZone
      }
    });

    for (const platform of ["saga", "instagram", "tiktok"] as const) {
      const breakdown = entry.platformBreakdown[platform];
      const submission = entry.submissions.find((candidate) => candidate.platform === platform);

      if (!submission?.url || breakdown.score === null) {
        continue;
      }

      const fetchedAt = entry.lastVerifiedAt ? new Date(entry.lastVerifiedAt) : new Date();

      await db.platformMetricsLatest.create({
        data: {
          contestEntryId: createdEntry.id,
          platform,
          canonicalPostId: null,
          canonicalPostUrl: submission.url,
          likeCount: breakdown.likes,
          commentCount: breakdown.uniqueComments,
          uniqueCommenterCount: breakdown.uniqueComments,
          shareCount: breakdown.shares,
          fetchStatus: "success",
          fetchMessage: "Seeded from the launch preview leaderboard snapshot.",
          fetchedAt,
          sourceType: platform === "saga" ? "internal_api" : "official_api",
          commentCountBasis: "unique",
          rawPayloadJson: Prisma.DbNull
        }
      });

      await db.metricSnapshotHistory.create({
        data: {
          contestEntryId: createdEntry.id,
          platform,
          likeCount: breakdown.likes,
          commentCount: breakdown.uniqueComments,
          uniqueCommenterCount: breakdown.uniqueComments,
          shareCount: breakdown.shares,
          scoreContribution: breakdown.score,
          fetchMessage: "Seeded from the launch preview leaderboard snapshot.",
          fetchedAt,
          sourceType: platform === "saga" ? "internal_api" : "official_api",
          commentCountBasis: "unique",
          fetchStatus: "success"
        }
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        seededEntries: snapshot.entries.length,
        rankedEntries: snapshot.rankedEntries.length,
        awaitingVerificationEntries: snapshot.awaitingVerificationEntries.length
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
