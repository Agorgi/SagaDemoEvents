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
  const isSaved = currentPledge?.kind === "watching" || currentPledge?.kind === "pledged";
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
      <main className="mx-auto w-full max-w-[540px] px-4 pb-40 pt-5 sm:max-w-[620px] sm:px-6 sm:pb-16 sm:pt-8">
        <section className="space-y-5">
          <div className="mx-auto max-w-[340px] overflow-hidden rounded-[30px] border border-white/8 bg-[#0f1320] shadow-soft">
            <div className="relative">
              <img
                alt={launch.title}
                className="aspect-[4/5] w-full object-cover"
                src={launch.coverImageUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070c]/68 via-transparent to-transparent" />
              <div className="absolute left-4 top-4">
                <StatusChip status={launch.status} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-[32px] font-semibold leading-tight text-white sm:text-[42px]">
                {launch.title}
              </h1>
              <p className="text-sm leading-6 text-white/78">{launch.softLaunchSummary}</p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Link className="flex min-w-0 items-center gap-3" href={`/profiles/${host?.id ?? launch.hostId}`}>
                <Avatar name={host?.name ?? "Host"} size="sm" src={host?.avatarUrl} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{host?.name ?? "Host"}</p>
                  <p className="text-xs text-app-muted">{launch.guestLine || "Building momentum"}</p>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                {!isOwner && !isConfirmed ? (
                  <IconActionButton
                    ariaLabel={isSaved ? "Saved launch" : "Save launch"}
                    onClick={() => {
                      watchLaunch(launch.id, launch.dateOptions[0]?.id);
                    }}
                    selected={isSaved}
                  >
                    <BookmarkIcon />
                  </IconActionButton>
                ) : null}
                <IconActionButton
                  ariaLabel="Share launch"
                  onClick={() => {
                    if (typeof navigator !== "undefined") {
                      navigator.clipboard?.writeText(window.location.href);
                    }
                  }}
                >
                  <ShareIcon />
                </IconActionButton>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-[#0d1119] px-4 py-4">
              <div className="space-y-2 text-sm text-white/86">
                <p>{launch.city}</p>
                <p>{launch.dateOptions.length} date options</p>
                <p>${launch.ticketPrice} if the launch clears</p>
              </div>
            </div>

            <div>
              <button
                className="min-h-[48px] w-full rounded-[18px] bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
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
            </div>
          </div>
        </section>

        <div className="mt-8 space-y-8">
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

function IconActionButton({
  ariaLabel,
  children,
  onClick,
  selected = false
}: {
  ariaLabel: string;
  children: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
        selected
          ? "border-app-purple/60 bg-app-purple/12 text-white"
          : "border-white/10 bg-white/[0.03] text-white/82 hover:border-white/20"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function BookmarkIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
      <path
        d="M7 4.75C7 4.336 7.336 4 7.75 4h8.5c.414 0 .75.336.75.75v14.432c0 .617-.694.976-1.195.618L12 16.922 7.945 19.8c-.501.358-1.195-.001-1.195-.618V4.75Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 15V5m0 0 3.5 3.5M12 5 8.5 8.5M6.75 13.5v3.75c0 .414.336.75.75.75h9c.414 0 .75-.336.75-.75V13.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}
