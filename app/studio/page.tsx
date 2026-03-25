"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LaunchChoiceCard } from "@/src/components/LaunchChoiceCard";
import { LaunchSummaryCard } from "@/src/components/LaunchSummaryCard";
import { Nav } from "@/src/components/Nav";
import { useAppState } from "@/src/lib/app-state";
import { HOST_DEMO_USER_ID } from "@/src/lib/host-mode";
import { formatDateLabel } from "@/src/lib/utils";

export default function StudioPage() {
  const router = useRouter();
  const { launchDrafts, launches, mode, setMode } = useAppState();

  useEffect(() => {
    if (mode !== "host") {
      setMode("host");
    }
  }, [mode, setMode]);

  const hostLaunches = launches
    .filter((launch) => launch.hostId === HOST_DEMO_USER_ID)
    .sort((left, right) => Number(left.status === "completed") - Number(right.status === "completed"));

  const continueDrafts = launchDrafts
    .filter((draft) => draft.hostId === HOST_DEMO_USER_ID && draft.draftStatus !== "published")
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));

  function beginDraft(mode: "soft" | "happening") {
    router.push(`/studio/new?mode=${mode}`);
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Launch</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">New Event</h1>
            <p className="text-sm text-app-muted">
              Start with the basics. We’ll turn it into a draft you can review.
            </p>
          </div>

          <div className="space-y-4">
            <LaunchChoiceCard
              accentClassName="bg-[radial-gradient(circle_at_top,rgba(31,28,184,0.3),transparent_58%),linear-gradient(180deg,rgba(18,23,40,0.96),rgba(11,14,24,0.98))]"
              onClick={() => beginDraft("soft")}
              subtitle="Gauge interest before it’s locked in"
              title="Soft launch"
            />
            <LaunchChoiceCard
              accentClassName="bg-[radial-gradient(circle_at_top,rgba(102,84,255,0.24),transparent_56%),linear-gradient(180deg,rgba(18,23,40,0.96),rgba(11,14,24,0.98))]"
              onClick={() => beginDraft("happening")}
              subtitle="Publish something that’s already on"
              title="Happening"
            />
          </div>
        </section>

        {continueDrafts.length > 0 ? (
          <section className="mt-10 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Continue draft</h2>
              <Link
                className="text-sm font-semibold text-app-muted transition hover:text-white"
                href={`/studio/review/${continueDrafts[0].id}`}
              >
                Review latest
              </Link>
            </div>
            <div className="space-y-3">
              {continueDrafts.slice(0, 3).map((draft) => (
                <button
                  className="surface-card w-full p-4 text-left transition hover:border-white/12"
                  key={draft.id}
                  onClick={() => router.push(`/studio/new?draft=${draft.id}`)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-white">{draft.generatedDraft.title}</p>
                      <p className="mt-1 text-sm text-app-muted">{draft.generatedDraft.metadataLine}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-app-muted">
                      {draft.draftStatus === "saved" ? "Saved" : "In progress"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-white/76">{draft.generatedDraft.summary}</p>
                  <p className="mt-3 text-xs text-app-muted">
                    Updated {formatDateLabel(draft.updatedAt)}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {hostLaunches.length > 0 ? (
          <section className="mt-10 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">My launches</h2>
              <Link
                className="text-sm font-semibold text-app-muted transition hover:text-white"
                href={hostLaunches[0]?.id ? `/studio/${hostLaunches[0].id}` : "/studio"}
              >
                Open latest
              </Link>
            </div>
            <div className="grid gap-4">
              {hostLaunches.map((launch) => (
                <LaunchSummaryCard
                  actionLabel="Manage"
                  key={launch.id}
                  launch={launch}
                  onAction={() => router.push(`/studio/${launch.id}`)}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
