"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { ExpandableText } from "@/src/components/ExpandableText";
import { Nav } from "@/src/components/Nav";
import { PledgeModal } from "@/src/components/PledgeModal";
import { StatusChip } from "@/src/components/StatusChip";
import { ThresholdProgress } from "@/src/components/ThresholdProgress";
import { TagChip } from "@/src/components/Chips";
import { useAppState } from "@/src/lib/app-state";
import { getLaunchFundingProgress } from "@/src/data/launches";

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const {
    currentBusinessProfile,
    launches,
    mode,
    currentUserId,
    respondToBusinessMatch,
    resolveUser,
    pledgeLaunch,
    supportIntents,
    watchLaunch
  } = useAppState();
  const [pledgeOpen, setPledgeOpen] = useState(false);

  const launch = launches.find((item) => item.id === params.id);
  if (!launch) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-20 text-center text-app-muted">
          Soft launch not found.
        </main>
      </div>
    );
  }

  const host = resolveUser(launch.hostId);
  const progress = getLaunchFundingProgress(launch);
  const currentPledge = launch.pledges.find((pledge) => pledge.userId === currentUserId);
  const isHostView = mode === "host" && launch.hostId === currentUserId;
  const isConfirmed = Boolean(launch.eventId);
  const businessSupportState = currentBusinessProfile
    ? supportIntents.find(
        (intent) =>
          intent.businessId === currentBusinessProfile.id &&
          intent.targetType === "launch" &&
          intent.targetId === launch.id
      )?.action
    : undefined;
  const milestoneItems = [
    {
      label: "Soft launch live",
      description: "Fans can watch, share, and lock early spots.",
      active: true
    },
    {
      label: "Threshold clears",
      description: "Enough momentum to justify a real room.",
      active: progress.current >= progress.target
    },
    {
      label: "Venue paired",
      description: "A room is matched to the turnout and vibe.",
      active: Boolean(launch.selectedVenueId)
    },
    {
      label: "Event confirmed",
      description: "The public event page opens and plans update.",
      active: Boolean(launch.eventId)
    }
  ];

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[1040px] px-4 pb-40 pt-5 sm:px-6 sm:pb-16 sm:pt-8">
        <section className="overflow-hidden rounded-[34px] border border-white/8 bg-[#0f1320] shadow-soft">
          <div className="relative">
            <img alt={launch.title} className="h-[340px] w-full object-cover sm:h-[460px]" src={launch.coverImageUrl} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/22 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#1F1CB8]/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip status={launch.status} />
                <span className="rounded-full border border-[#a7b0ff]/18 bg-[#12192f]/84 px-3 py-1 text-xs font-semibold text-white">
                  {isConfirmed ? "Confirmed" : "Interest check"}
                </span>
                {launch.fandomTags.map((tag) => (
                  <span className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-xs font-semibold text-white" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-white sm:text-6xl">{launch.title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/78 sm:text-base">{launch.softLaunchSummary}</p>
              <div className="mt-5 max-w-[360px] rounded-[24px] border border-white/10 bg-[#0b1020]/72 p-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/58">Locked ticket</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-3xl font-semibold text-white">${launch.ticketPrice}</p>
                  <p className="text-right text-xs leading-5 text-white/62">
                    Pending until threshold clears and the room confirms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {isHostView ? (
            <Link
              className="rounded-2xl bg-app-purple px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-app-purple-hover"
              href={`/studio/${launch.id}`}
            >
              Open dashboard
            </Link>
          ) : isConfirmed && launch.eventId ? (
            <Link
              className="rounded-2xl bg-app-purple px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-app-purple-hover"
              href={`/events/${launch.eventId}`}
            >
              Open event
            </Link>
          ) : mode === "business" && currentBusinessProfile ? (
            <button
              className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
              onClick={() =>
                respondToBusinessMatch(
                  currentBusinessProfile.id,
                  "launch",
                  launch.id,
                  businessSupportState === "hosting" ? "supporting" : "hosting"
                )
              }
              type="button"
            >
              {businessSupportState === "hosting" ? "Hosting noted" : "Host this launch"}
            </button>
          ) : (
            <button
              className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
              onClick={() => setPledgeOpen(true)}
              type="button"
            >
              {currentPledge?.kind === "pledged" ? "Pledged" : "Pledge spot"}
            </button>
          )}

          {!isHostView && !isConfirmed ? (
            <button
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
              onClick={() => {
                if (mode === "business" && currentBusinessProfile) {
                  respondToBusinessMatch(currentBusinessProfile.id, "launch", launch.id, "supporting");
                  return;
                }
                watchLaunch(launch.id);
              }}
              type="button"
            >
              {mode === "business"
                ? businessSupportState === "supporting"
                  ? "Support noted"
                  : "Support this launch"
                : currentPledge?.kind === "watching"
                  ? "Watching"
                  : "Watch launch"}
            </button>
          ) : null}

          <button
            className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
            onClick={() => {
              if (typeof navigator !== "undefined") {
                navigator.clipboard?.writeText(window.location.href);
              }
            }}
            type="button"
          >
            Share
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(310px,0.92fr)]">
          <section className="space-y-6">
            <div className="surface-card p-5 sm:p-6">
              <p className="text-lg font-semibold text-white">Momentum</p>
              <div className="mt-4">
                <ThresholdProgress
                  current={progress.current}
                  label="Pledges to unlock"
                  target={progress.target}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <TagChip label={`${progress.watchers} watching`} subdued />
                <TagChip label={`${progress.pledges} pledged`} subdued />
                <TagChip label={`$${launch.ticketPrice} locked price`} subdued />
              </div>
            </div>

            <div className="surface-card p-5 sm:p-6">
              <p className="text-lg font-semibold text-white">What happens next</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {milestoneItems.map((item) => (
                  <div
                    className={`rounded-[22px] border p-4 ${
                      item.active
                        ? "border-app-purple/24 bg-app-purple/10"
                        : "border-white/8 bg-[#0d1119]"
                    }`}
                    key={item.label}
                  >
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-app-muted">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card p-5 sm:p-6">
              <p className="text-lg font-semibold text-white">Concept</p>
              <div className="mt-4">
                <ExpandableText collapsedLines={4} text={launch.description} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {launch.inspiration.map((item) => (
                  <TagChip key={item} label={item} subdued />
                ))}
              </div>
            </div>

            <div className="surface-card p-5 sm:p-6">
              <p className="text-lg font-semibold text-white">Date options</p>
              <div className="mt-4 space-y-3">
                {launch.dateOptions.map((option) => (
                  <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={option.id}>
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-white">{option.label}</p>
                      <p className="text-sm text-app-muted">{option.votes} picks</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-app-purple to-[#5d7dff]"
                        style={{ width: `${Math.min(100, (option.votes / Math.max(progress.current, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card p-5 sm:p-6">
              <p className="text-lg font-semibold text-white">Updates</p>
              <div className="mt-4 space-y-3">
                {launch.updates.slice(0, 4).map((update) => (
                  <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={update.id}>
                    <p className="font-semibold text-white">{update.title}</p>
                    <p className="mt-2 text-sm leading-6 text-app-muted">{update.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="surface-card p-5">
              <p className="text-lg font-semibold text-white">Hosted by</p>
              <Link
                className="mt-4 flex items-center gap-4 rounded-[24px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/15"
                href={`/profiles/${host?.id ?? launch.hostId}`}
              >
                <Avatar name={host?.name ?? "Host"} size="md" src={host?.avatarUrl} />
                <div className="min-w-0">
                  <p className="font-semibold text-white">{host?.name ?? "Host"}</p>
                  <p className="text-sm text-app-muted">{host?.bio ?? "Building fandom nights worth repeating."}</p>
                </div>
              </Link>
            </div>

            <div className="surface-card p-5">
              <p className="text-lg font-semibold text-white">Why people are backing it</p>
              <p className="mt-4 text-sm leading-6 text-app-muted">{launch.vibeNote}</p>
              <p className="mt-3 text-sm text-app-muted">{launch.guestLine}</p>
            </div>

            {!isConfirmed ? (
              <div className="surface-card p-5">
                <p className="text-lg font-semibold text-white">How the pending spot works</p>
                <p className="mt-3 text-sm leading-6 text-app-muted">
                  Fans are backing the idea first. The launch confirms after the threshold clears and a venue gets paired. That is when the pending spot turns into a real ticket.
                </p>
              </div>
            ) : null}

            {isConfirmed && launch.eventId ? (
              <div className="surface-card p-5">
                <p className="text-lg font-semibold text-white">Confirmed</p>
                <p className="mt-3 text-sm leading-6 text-app-muted">
                  The launch cleared threshold, a venue was paired, and the public event page is now live.
                </p>
                <Link
                  className="mt-4 inline-flex rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                  href={`/events/${launch.eventId}`}
                >
                  Open event
                </Link>
              </div>
            ) : null}
          </aside>
        </div>
      </main>

      <PledgeModal
        launch={launch}
        onClose={() => setPledgeOpen(false)}
        onPledge={(dateOptionId) => pledgeLaunch(launch.id, dateOptionId)}
        onWatch={(dateOptionId) => watchLaunch(launch.id, dateOptionId)}
        open={pledgeOpen}
      />
    </div>
  );
}
