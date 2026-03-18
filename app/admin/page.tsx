import Link from "next/link";

import { logoutAction, retryEntryAction } from "@/app/admin/actions";
import { activeCampaign } from "@/src/giveaway/config";
import { requireAdminSession } from "@/src/server/admin/auth";
import { db } from "@/src/server/db";
import { STALE_VERIFIED_HOURS } from "@/src/server/giveaway/constants";

function formatTimestamp(value: Date | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(value);
}

function statusTone(status: string) {
  if (status === "success") {
    return "text-emerald-200";
  }

  if (status === "review_required" || status === "partial_failure") {
    return "text-amber-200";
  }

  return "text-rose-200";
}

type ReviewQueueItem = {
  key: string;
  contestEntryId: string;
  externalEntryId: string;
  creatorName: string;
  entryTitle: string;
  platform: string;
  fetchStatus: string;
  fetchMessage: string;
  fetchedAt: Date | null;
  postUrl: string | null;
};

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const [entries, lastSyncRun, lastRefreshRun] = await Promise.all([
    db.contestEntry.findMany({
      include: {
        latestMetrics: true
      },
      orderBy: {
        createdAt: "desc"
      }
    }),
    db.fetchRun.findFirst({
      where: {
        jobName: "sync_entries",
        status: "success"
      },
      orderBy: {
        startedAt: "desc"
      }
    }),
    db.fetchRun.findFirst({
      where: {
        jobName: "refresh_metrics"
      },
      orderBy: {
        startedAt: "desc"
      }
    })
  ]);

  const now = Date.now();
  const staleThresholdMs = STALE_VERIFIED_HOURS * 60 * 60 * 1000;
  const reviewQueue = new Map<string, ReviewQueueItem>();

  for (const entry of entries) {
    for (const metric of entry.latestMetrics) {
      if (metric.fetchStatus === "success") {
        continue;
      }

      reviewQueue.set(`${entry.id}:${metric.platform}`, {
        key: `${entry.id}:${metric.platform}`,
        contestEntryId: entry.id,
        externalEntryId: entry.externalEntryId,
        creatorName: entry.publicDisplayName,
        entryTitle: entry.entryTitle ?? "Untitled entry",
        platform: metric.platform,
        fetchStatus: metric.fetchStatus,
        fetchMessage: metric.fetchMessage ?? "No fetch message",
        fetchedAt: metric.fetchedAt,
        postUrl: metric.canonicalPostUrl
      });
    }

    for (const platform of ["saga", "instagram", "tiktok"] as const) {
      const postUrl =
        platform === "saga"
          ? entry.sagaPostUrl
          : platform === "instagram"
            ? entry.instagramPostUrl
            : entry.tiktokPostUrl;
      const hasHandle =
        platform === "saga"
          ? Boolean(entry.sagaHandle)
          : platform === "instagram"
            ? Boolean(entry.instagramHandle)
            : Boolean(entry.tiktokHandle);
      const metric = entry.latestMetrics.find((item) => item.platform === platform) ?? null;

      if (postUrl || !hasHandle || metric) {
        continue;
      }

      reviewQueue.set(`${entry.id}:${platform}:missing-url`, {
        key: `${entry.id}:${platform}:missing-url`,
        contestEntryId: entry.id,
        externalEntryId: entry.externalEntryId,
        creatorName: entry.publicDisplayName,
        entryTitle: entry.entryTitle ?? "Untitled entry",
        platform,
        fetchStatus: "review_required",
        fetchMessage: "A direct post URL is required before this platform can be scored.",
        fetchedAt: null,
        postUrl: null
      });
    }
  }

  const reviewItems = Array.from(reviewQueue.values()).sort((left, right) => {
    const leftTime = left.fetchedAt?.getTime() ?? 0;
    const rightTime = right.fetchedAt?.getTime() ?? 0;
    return rightTime - leftTime;
  });

  const totalEntries = entries.length;
  const eligibleEntries = entries.filter((entry) => entry.eligibilityStatus === "eligible").length;
  const rankedEntries = entries.filter((entry) => entry.verificationState === "ranked").length;
  const awaitingVerificationEntries = entries.filter(
    (entry) => entry.verificationState === "awaiting_verification"
  ).length;
  const entriesWithFetchFailures = new Set(
    reviewItems
      .filter((item) => item.fetchStatus !== "review_required")
      .map((item) => item.contestEntryId)
  ).size;
  const staleVerifiedEntries = entries.filter((entry) => {
    if (entry.verificationState !== "ranked" || !entry.lastVerifiedAt) {
      return false;
    }

    return now - entry.lastVerifiedAt.getTime() > staleThresholdMs;
  }).length;
  const top25Count = entries.filter((entry) => entry.isTop25).length;

  return (
    <main className="min-h-screen bg-[#05060b] px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[0.68rem] uppercase tracking-[0.28em] text-[#f0d89f]">
              Court of Stars admin
            </div>
            <h1 className="mt-3 text-3xl font-semibold">Contest operations</h1>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Total entries", String(totalEntries)],
            ["Eligible entries", String(eligibleEntries)],
            ["Ranked entries", String(rankedEntries)],
            ["Awaiting verification", String(awaitingVerificationEntries)],
            ["Entries with fetch failures", String(entriesWithFetchFailures)],
            ["Stale verified entries", String(staleVerifiedEntries)],
            [`Top ${activeCampaign.poolSize}`, String(top25Count)],
            ["Review queue items", String(reviewItems.length)],
            ["Last successful sync", formatTimestamp(lastSyncRun?.finishedAt ?? lastSyncRun?.startedAt)],
            ["Last cron run", formatTimestamp(lastRefreshRun?.finishedAt ?? lastRefreshRun?.startedAt)]
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4"
            >
              <div className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">{label}</div>
              <div className="mt-3 text-xl font-semibold text-white">{value}</div>
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-[28px] border border-white/10 bg-[rgba(8,11,20,0.88)] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.24em] text-[#f0d89f]">
                Review queue
              </div>
              <h2 className="mt-2 text-2xl font-semibold">Entries needing attention</h2>
            </div>
            <div className="text-sm text-slate-300">
              Review unsupported fetches, auth issues, and entries that still need direct post URLs.
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="px-3 py-3">Entry</th>
                  <th className="px-3 py-3">Creator</th>
                  <th className="px-3 py-3">Title</th>
                  <th className="px-3 py-3">Platform</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Last message</th>
                  <th className="px-3 py-3">Last attempted</th>
                  <th className="px-3 py-3">Post URL</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviewItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-slate-400">
                      No review items right now.
                    </td>
                  </tr>
                ) : (
                  reviewItems.map((item) => (
                    <tr key={item.key} className="border-b border-white/6 align-top">
                      <td className="px-3 py-4 font-mono text-xs text-slate-300">
                        {item.externalEntryId}
                      </td>
                      <td className="px-3 py-4">{item.creatorName}</td>
                      <td className="px-3 py-4">{item.entryTitle}</td>
                      <td className="px-3 py-4 capitalize">{item.platform}</td>
                      <td className={`px-3 py-4 ${statusTone(item.fetchStatus)}`}>{item.fetchStatus}</td>
                      <td className="px-3 py-4 text-slate-300">{item.fetchMessage}</td>
                      <td className="px-3 py-4 text-slate-300">{formatTimestamp(item.fetchedAt)}</td>
                      <td className="px-3 py-4">
                        {item.postUrl ? (
                          <a
                            href={item.postUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#f5ddad] hover:text-white"
                          >
                            Open post
                          </a>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <form action={retryEntryAction}>
                            <input type="hidden" name="entryId" value={item.contestEntryId} />
                            <button
                              type="submit"
                              className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-xs"
                            >
                              Retry fetch
                            </button>
                          </form>
                          <Link
                            href={`/admin/entries/${item.contestEntryId}`}
                            className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-xs"
                          >
                            Open entry
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 rounded-[28px] border border-white/10 bg-[rgba(8,11,20,0.88)] p-6">
          <div className="text-[0.68rem] uppercase tracking-[0.24em] text-[#f0d89f]">Entries</div>
          <h2 className="mt-2 text-2xl font-semibold">All contest entries</h2>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="px-3 py-3">Entry</th>
                  <th className="px-3 py-3">Creator</th>
                  <th className="px-3 py-3">Eligibility</th>
                  <th className="px-3 py-3">Verification state</th>
                  <th className="px-3 py-3">Public rank</th>
                  <th className="px-3 py-3">Top 25</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-white/6">
                    <td className="px-3 py-4">
                      <Link href={`/admin/entries/${entry.id}`} className="text-[#f5ddad] hover:text-white">
                        {entry.externalEntryId}
                      </Link>
                    </td>
                    <td className="px-3 py-4">{entry.publicDisplayName}</td>
                    <td className="px-3 py-4 capitalize">{entry.eligibilityStatus.replace(/_/g, " ")}</td>
                    <td className="px-3 py-4 capitalize">{entry.verificationState.replace(/_/g, " ")}</td>
                    <td className="px-3 py-4">{entry.publicRank ?? "—"}</td>
                    <td className="px-3 py-4">{entry.isTop25 ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
