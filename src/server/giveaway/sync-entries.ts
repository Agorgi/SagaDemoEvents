import { db } from "@/src/server/db";
import { writeAuditLog } from "@/src/server/giveaway/audit";
import {
  fetchSheetEntries,
  hasGoogleSheetConfig
} from "@/src/server/giveaway/google-sheets";
import { recomputeLeaderboard } from "@/src/server/giveaway/leaderboard";

function hasAnyPostUrl(row: {
  sagaPostUrl: string | null;
  instagramPostUrl: string | null;
  tiktokPostUrl: string | null;
}) {
  return Boolean(row.sagaPostUrl || row.instagramPostUrl || row.tiktokPostUrl);
}

export async function syncContestEntriesFromSheet() {
  const run = await db.fetchRun.create({
    data: {
      jobName: "sync_entries",
      status: "running",
      summaryJson: {
        job: "sync_entries"
      }
    }
  });

  try {
    if (!hasGoogleSheetConfig()) {
      await db.fetchRun.update({
        where: { id: run.id },
        data: {
          finishedAt: new Date(),
          status: "success",
          totalRowsSeen: 0,
          totalEntriesProcessed: 0,
          totalFailures: 0,
          summaryJson: {
            job: "sync_entries",
            skipped: true,
            reason:
              "Google Sheets credentials are not configured yet, so the sync run was skipped."
          }
        }
      });

      return {
        syncedEntries: 0,
        needsReviewCount: 0,
        skipped: true
      };
    }

    const { rows, totalRows, range } = await fetchSheetEntries();
    let needsReviewCount = 0;

    for (const row of rows) {
      const missingDirectUrl = !hasAnyPostUrl(row);
      const existing = await db.contestEntry.findUnique({
        where: {
          externalEntryId: row.externalEntryId
        },
        select: {
          hiddenReason: true
        }
      });
      const nextHiddenReason =
        row.eligibilityStatus === "eligible"
          ? existing?.hiddenReason?.startsWith("admin:")
            ? existing.hiddenReason
            : null
          : `eligibility:${row.eligibilityStatus}`;

      if (missingDirectUrl) {
        needsReviewCount += 1;
      }

      await db.contestEntry.upsert({
        where: {
          externalEntryId: row.externalEntryId
        },
        create: {
          externalEntryId: row.externalEntryId,
          creatorName: row.creatorName,
          publicDisplayName: row.publicDisplayName,
          profileImageUrl: row.profileImageUrl,
          thumbnailUrl: row.thumbnailUrl,
          sagaHandle: row.sagaHandle,
          instagramHandle: row.instagramHandle,
          tiktokHandle: row.tiktokHandle,
          sagaPostUrl: row.sagaPostUrl,
          instagramPostUrl: row.instagramPostUrl,
          tiktokPostUrl: row.tiktokPostUrl,
          entryTitle: row.entryTitle,
          contentType: row.contentType,
          eligibilityStatus: row.eligibilityStatus,
          createdAt: row.createdAt,
          sourceRowNumber: row.sourceRowNumber,
          verificationState:
            row.eligibilityStatus === "eligible"
              ? "awaiting_verification"
              : "hidden",
          hiddenReason: nextHiddenReason
        },
        update: {
          creatorName: row.creatorName,
          publicDisplayName: row.publicDisplayName,
          profileImageUrl: row.profileImageUrl,
          thumbnailUrl: row.thumbnailUrl,
          sagaHandle: row.sagaHandle,
          instagramHandle: row.instagramHandle,
          tiktokHandle: row.tiktokHandle,
          sagaPostUrl: row.sagaPostUrl,
          instagramPostUrl: row.instagramPostUrl,
          tiktokPostUrl: row.tiktokPostUrl,
          entryTitle: row.entryTitle,
          contentType: row.contentType,
          eligibilityStatus: row.eligibilityStatus,
          createdAt: row.createdAt,
          sourceRowNumber: row.sourceRowNumber,
          hiddenReason: nextHiddenReason
        }
      });

      if (missingDirectUrl) {
        await writeAuditLog({
          actor: "system:sync",
          action: "entry_needs_review_missing_direct_post_url",
          targetType: "contest_entry",
          targetId: row.externalEntryId,
          metadataJson: {
            sourceRowNumber: row.sourceRowNumber
          }
        });
      }
    }

    await recomputeLeaderboard();

    await db.fetchRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        status: "success",
        totalRowsSeen: totalRows,
        totalEntriesProcessed: rows.length,
        totalFailures: 0,
        summaryJson: {
          job: "sync_entries",
          range,
          syncedEntries: rows.length,
          needsReviewCount
        }
      }
    });

    return {
      syncedEntries: rows.length,
      needsReviewCount
    };
  } catch (error) {
    await db.fetchRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        status: "failed",
        totalFailures: 1,
        summaryJson: {
          job: "sync_entries",
          error: error instanceof Error ? error.message : "Unknown sync failure"
        }
      }
    });

    throw error;
  }
}
