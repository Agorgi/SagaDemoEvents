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
import { useAppState } from "@/src/lib/app-state";
import { getLaunchFundingProgress } from "@/src/data/launches";

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const {
    currentBusinessProfile,
    currentUserId,
    launches,
    mode,
    pledgeLaunch,
    resolveUser,
    respondToBusinessMatch,
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
          Launch not found.
        </main>
      </div>
    );
  }

  const host = resolveUser(launch.hostId);
  const progress = getLaunchFundingProgress(launch);
  const currentPledge = launch.pledges.find((pledge) => pledge.userId === currentUserId);
  const isOwner = launch.hostId === currentUserId;
  const isConfirmed = Boolean(launch.eventId);
  const businessSupportState = currentBusinessProfile
    ? supportIntents.find(
        (intent) =>
          intent.businessId === currentBusinessProfile.id &&
          intent.targetType === "launch" &&
          intent.targetId === launch.id
      )?.action
    : undefined;

  const primaryLabel = isOwner
    ? "Manage"
    : isConfirmed && launch.eventId
      ? "View event"
      : mode === "business"
        ? businessSupportState === "hosting"
          ? "Host"
          : "Support"
        : currentPledge?.kind === "pledged"
          ? "View launch"
          : "Pledge";

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[760px] px-4 pb-40 pt-5 sm:px-6 sm:pb-16 sm:pt-8">
        <section className="overflow-hidden rounded-[34px] border border-white/8 bg-[#0f1320] shadow-soft">
          <div className="relative">
            <img alt={launch.title} className="h-[320px] w-full object-cover sm:h-[440px]" src={launch.coverImageUrl} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/18 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <StatusChip status={launch.status} />
              <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">{launch.title}</h1>
              <p className="mt-2 text-sm text-white/78 sm:text-base">{launch.softLaunchSummary}</p>
              <p className="mt-4 text-sm text-white/70">
                {launch.city} · {launch.dateOptions.length} date options · ${launch.ticketPrice}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Avatar name={host?.name ?? "Host"} size="sm" src={host?.avatarUrl} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{host?.name ?? "Host"}</p>
                  <p className="text-xs text-white/60">{launch.guestLine || "Still building momentum"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            className="min-h-[46px] rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            onClick={() => {
              if (isOwner) {
                window.location.assign(`/studio/${launch.id}`);
                return;
              }
              if (isConfirmed && launch.eventId) {
                window.location.assign(`/events/${launch.eventId}`);
                return;
              }
              if (mode === "business" && currentBusinessProfile) {
                respondToBusinessMatch(
                  currentBusinessProfile.id,
                  "launch",
                  launch.id,
                  businessSupportState === "hosting" ? "supporting" : "hosting"
                );
                return;
              }
              setPledgeOpen(true);
            }}
            type="button"
          >
            {primaryLabel}
          </button>
          {!isOwner && !isConfirmed ? (
            <button
              className="min-h-[46px] rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
              onClick={() => {
                if (mode === "business" && currentBusinessProfile) {
                  respondToBusinessMatch(currentBusinessProfile.id, "launch", launch.id, "supporting");
                  return;
                }
                watchLaunch(launch.id, launch.dateOptions[0]?.id);
              }}
              type="button"
            >
              {mode === "business"
                ? businessSupportState === "supporting"
                  ? "Support"
                  : "Host"
                : currentPledge?.kind === "watching"
                  ? "Watching"
                  : "Save"}
            </button>
          ) : null}
          <button
            className="min-h-[46px] rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
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

        <div className="mt-6 space-y-6">
          <section className="surface-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-white">Progress</h2>
            <div className="mt-4">
              <ThresholdProgress
                current={progress.current}
                label="Pledges to unlock"
                target={progress.target}
              />
            </div>
          </section>

          <section className="surface-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-white">Date options</h2>
            <div className="mt-4 space-y-3">
              {launch.dateOptions.map((option) => (
                <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4" key={option.id}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-white">{option.label}</p>
                    <p className="text-sm text-app-muted">{option.votes} picks</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-white">About</h2>
            <div className="mt-4">
              <ExpandableText collapsedLines={4} text={launch.description} />
            </div>
          </section>

          <section className="surface-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-white">Updates</h2>
            <div className="mt-4 space-y-3">
              {launch.updates.slice(0, 4).map((update) => (
                <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4" key={update.id}>
                  <p className="font-semibold text-white">{update.title}</p>
                  <p className="mt-2 text-sm text-app-muted">{update.body}</p>
                </div>
              ))}
            </div>
          </section>

          {isConfirmed && launch.eventId ? (
            <section className="surface-card p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white">Confirmed</h2>
              <p className="mt-3 text-sm text-app-muted">This launch cleared its goal and is now a live event.</p>
              <Link
                className="mt-4 inline-flex min-h-[46px] items-center rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                href={`/events/${launch.eventId}`}
              >
                View event
              </Link>
            </section>
          ) : null}
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
