import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addManualOverrideAction,
  retryEntryAction,
  togglePublicVisibilityAction
} from "@/app/admin/actions";
import { requireAdminSession } from "@/src/server/admin/auth";
import { db } from "@/src/server/db";
import { computeEntryScore } from "@/src/server/giveaway/scoring";

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

function card(
  title: string,
  value: string,
  tone = "text-white"
) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
      <div className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">{title}</div>
      <div className={`mt-3 text-lg font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

export default async function AdminEntryDetailPage({
  params
}: {
  params: {
    id: string;
  };
}) {
  await requireAdminSession();

  const entry = await db.contestEntry.findUnique({
    where: {
      id: params.id
    },
    include: {
      latestMetrics: true,
      metricHistory: {
        orderBy: {
          fetchedAt: "desc"
        },
        take: 50
      },
      adminOverrides: {
        orderBy: {
          updatedAt: "desc"
        }
      }
    }
  });

  if (!entry) {
    notFound();
  }

  const score = computeEntryScore(entry, entry.latestMetrics);

  return (
    <main className="min-h-screen bg-[#05060b] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/admin" className="text-sm text-slate-400 hover:text-white">
              ← Back to admin
            </Link>
            <div className="mt-4 text-[0.68rem] uppercase tracking-[0.24em] text-[#f0d89f]">
              Entry detail
            </div>
            <h1 className="mt-2 text-3xl font-semibold">{entry.publicDisplayName}</h1>
            <p className="mt-2 text-sm text-slate-300">
              {entry.entryTitle ?? "Untitled entry"} · {entry.externalEntryId}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <form action={retryEntryAction}>
              <input type="hidden" name="entryId" value={entry.id} />
              <button
                type="submit"
                className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm"
              >
                Retry now
              </button>
            </form>
            <form action={togglePublicVisibilityAction}>
              <input type="hidden" name="contestEntryId" value={entry.id} />
              <input
                type="hidden"
                name="included"
                value={entry.hiddenReason ? "true" : "false"}
              />
              <button
                type="submit"
                className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm"
              >
                {entry.hiddenReason ? "Show publicly" : "Hide publicly"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {card("Eligibility", entry.eligibilityStatus.replace(/_/g, " "))}
          {card("Verification state", entry.verificationState.replace(/_/g, " "))}
          {card("Computed score", entry.latestScore?.toString() ?? "Pending")}
          {card("Public rank", entry.publicRank?.toString() ?? "—")}
          {card("Last verified", formatTimestamp(entry.lastVerifiedAt))}
          {card("Last attempted refresh", formatTimestamp(entry.lastAttemptedRefreshAt))}
          {card("Visible publicly", entry.hiddenReason ? "No" : "Yes")}
          {card("Created at", formatTimestamp(entry.createdAt))}
          {card("Top 25", entry.isTop25 ? "Yes" : "No")}
          {card("High-intent engagement", score.highIntentEngagement.toString())}
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-[rgba(8,11,20,0.88)] p-6">
            <div className="text-[0.68rem] uppercase tracking-[0.24em] text-[#f0d89f]">
              Normalized entry data
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Creator name", entry.creatorName],
                ["Public display name", entry.publicDisplayName],
                ["Entry title", entry.entryTitle ?? "—"],
                ["Content type", entry.contentType ?? "—"],
                ["Saga handle", entry.sagaHandle ?? "—"],
                ["Instagram handle", entry.instagramHandle ?? "—"],
                ["TikTok handle", entry.tiktokHandle ?? "—"],
                ["Sheet row", entry.sourceRowNumber?.toString() ?? "—"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</div>
                  <div className="mt-2 text-sm text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3">
              {[
                ["Saga post", entry.sagaPostUrl],
                ["Instagram post", entry.instagramPostUrl],
                ["TikTok post", entry.tiktokPostUrl]
              ].map(([label, href]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</div>
                  <div className="mt-2 text-sm text-white">
                    {href ? (
                      <a href={href} target="_blank" rel="noreferrer" className="text-[#f5ddad] hover:text-white">
                        {href}
                      </a>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-white/10 bg-[rgba(8,11,20,0.88)] p-6">
              <div className="text-[0.68rem] uppercase tracking-[0.24em] text-[#f0d89f]">
                Score breakdown
              </div>
              <div className="mt-4 space-y-3">
                {score.breakdown.map((item) => (
                  <div
                    key={item.platform}
                    className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="capitalize text-white">{item.platform}</div>
                      <div className="text-sm text-slate-300">
                        {item.scoreContribution ?? "Awaiting verification"}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      High-intent contribution: {item.highIntentContribution} ·{" "}
                      {item.verified ? "Verified" : "Awaiting verification"}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-[rgba(8,11,20,0.88)] p-6">
              <div className="text-[0.68rem] uppercase tracking-[0.24em] text-[#f0d89f]">
                Manual override
              </div>
              <form action={addManualOverrideAction} className="mt-4 space-y-3">
                <input type="hidden" name="contestEntryId" value={entry.id} />
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Platform</span>
                  <select
                    name="platform"
                    className="w-full rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3"
                    defaultValue="instagram"
                  >
                    <option value="saga">Saga</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["likeCount", "Likes"],
                    ["commentCount", "Comments"],
                    ["uniqueCommenterCount", "Unique commenters"],
                    ["shareCount", "Shares"]
                  ].map(([name, label]) => (
                    <label key={name} className="block">
                      <span className="mb-2 block text-sm text-slate-300">{label}</span>
                      <input
                        name={name}
                        type="number"
                        min="0"
                        className="w-full rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3"
                      />
                    </label>
                  ))}
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Reason / note</span>
                  <textarea
                    name="reason"
                    required
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-full bg-[linear-gradient(135deg,#f6d589,#c09040)] px-5 py-3 text-sm font-semibold text-[#1a1205]"
                >
                  Save manual override
                </button>
              </form>
            </section>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-[rgba(8,11,20,0.88)] p-6">
            <div className="text-[0.68rem] uppercase tracking-[0.24em] text-[#f0d89f]">
              Latest metrics
            </div>
            <div className="mt-4 space-y-3">
              {entry.latestMetrics.length === 0 ? (
                <div className="text-sm text-slate-400">No successful or saved metric snapshots yet.</div>
              ) : (
                entry.latestMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="capitalize font-medium text-white">{metric.platform}</div>
                      <div className="text-sm text-slate-300">{metric.fetchStatus}</div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                      <div>Likes: {metric.likeCount ?? "—"}</div>
                      <div>Comments: {metric.commentCount ?? "—"}</div>
                      <div>Unique commenters: {metric.uniqueCommenterCount ?? "—"}</div>
                      <div>Shares: {metric.shareCount ?? "—"}</div>
                      <div>Basis: {metric.commentCountBasis}</div>
                      <div>Source: {metric.sourceType}</div>
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                      {metric.fetchMessage ?? "No fetch message"} · {formatTimestamp(metric.fetchedAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[rgba(8,11,20,0.88)] p-6">
            <div className="text-[0.68rem] uppercase tracking-[0.24em] text-[#f0d89f]">
              History & overrides
            </div>

            <div className="mt-4 space-y-3">
              {entry.adminOverrides.length > 0 ? (
                entry.adminOverrides.map((override) => (
                  <div
                    key={override.id}
                    className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="capitalize text-white">{override.platform} override</div>
                      <div className="text-xs text-slate-400">{formatTimestamp(override.updatedAt)}</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">
                      By {override.createdBy} · {override.reason}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-400">No manual overrides yet.</div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {entry.metricHistory.map((historyItem) => (
                <div
                  key={historyItem.id}
                  className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="capitalize text-white">
                      {historyItem.platform} · {historyItem.fetchStatus}
                    </div>
                    <div className="text-xs text-slate-400">{formatTimestamp(historyItem.fetchedAt)}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    {historyItem.fetchMessage ?? "No fetch message"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
