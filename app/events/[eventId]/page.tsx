"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { ApplyHelpModal } from "@/src/components/ApplyHelpModal";
import { OpenRolesPill, TagChip } from "@/src/components/Chips";
import { ExpandableText } from "@/src/components/ExpandableText";
import { Nav } from "@/src/components/Nav";
import { ProfilePreviewModal } from "@/src/components/ProfilePreviewModal";
import { TicketModal } from "@/src/components/TicketModal";
import {
  getEventById,
  getRolesForEvent,
  getUserById
} from "@/src/data/demo";
import { useDemoState } from "@/src/lib/demo-state";
import { cn, formatCurrency, formatDateRange, formatTimeLabel } from "@/src/lib/utils";

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const {
    activeUserId,
    commissions,
    events,
    getEventCounts,
    joinedEventIds,
    roles,
    savedEventIds,
    toggleSavedEvent
  } = useDemoState();
  const [ticketOpen, setTicketOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [previewUserId, setPreviewUserId] = useState<string | null>(null);

  const event = getEventById(params.eventId, events);

  if (!event) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-20 text-center text-app-muted">
          Event not found.
        </main>
      </div>
    );
  }

  const host = getUserById(event.hostId);
  const eventRoles = getRolesForEvent(roles, event.id);
  const openRoles = eventRoles.filter((role) => role.status !== "filled");
  const filledRoles = eventRoles.filter((role) => role.status === "filled");
  const roleCounts = getEventCounts(event.id);
  const isJoined = joinedEventIds.includes(event.id);
  const isSaved = savedEventIds.includes(event.id);
  const appliedRoleIds = openRoles
    .filter((role) =>
      role.applicants.some((entry) => entry.applicantUserId === activeUserId)
    )
    .map((role) => role.id);
  const hasApplied = appliedRoleIds.length > 0;
  const roomUnlocked = isJoined || hasApplied || event.hostId === activeUserId;
  const relatedCommission = commissions.find((commission) => commission.linkedEventId === event.id);
  const previewUser = previewUserId ? getUserById(previewUserId) ?? null : null;

  const contributorUsers = Array.from(
    new Set(
      [
        event.hostId,
        ...filledRoles
          .map((role) => role.filledByUserId)
          .filter((userId): userId is string => Boolean(userId))
      ]
    )
  )
    .map((userId) => getUserById(userId))
    .filter((user): user is NonNullable<typeof user> => Boolean(user));

  const metadata = [
    formatDateRange(event.startsAt, event.endsAt),
    formatTimeLabel(event.startsAt),
    `${event.venue}, ${event.city}`,
    event.fandomTags[0],
    roleCounts.open > 0 ? `${roleCounts.open} role${roleCounts.open === 1 ? "" : "s"} open` : null
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto w-full max-w-[960px] px-4 pb-40 pt-5 sm:px-6 sm:pb-16 sm:pt-8">
        <section className="overflow-hidden rounded-[30px] border border-white/8 bg-[#0f1320] shadow-soft">
          <div className="relative">
            <img
              alt={event.title}
              className="h-[340px] w-full object-cover sm:h-[440px]"
              src={event.posterUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/25 to-transparent" />
            <button
              aria-label={isSaved ? "Remove from saved" : "Save event"}
              className={cn(
                "absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur transition",
                isSaved
                  ? "border-app-purple/30 bg-app-purple/12 text-white"
                  : "border-white/12 bg-[#0a0d14]/68 text-white hover:border-white/20"
              )}
              onClick={() => toggleSavedEvent(event.id)}
              type="button"
            >
              <svg
                className={isSaved ? "fill-white" : "fill-none"}
                height="18"
                viewBox="0 0 24 24"
                width="18"
              >
                <path
                  d="M7 4.75h10a1.25 1.25 0 0 1 1.25 1.25v13.5l-6.25-3.6-6.25 3.6V6A1.25 1.25 0 0 1 7 4.75Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
              <div className="flex flex-wrap gap-2">
                {event.fandomTags.slice(0, 2).map((tag) => (
                  <TagChip key={tag} label={tag} subdued />
                ))}
              </div>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-white sm:text-6xl">
                {event.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/78 sm:text-base">
                {event.subtitle}
              </p>
              <button
                className="mt-4 flex items-center gap-3 rounded-full bg-black/20 pr-4 text-left backdrop-blur transition hover:bg-black/30"
                onClick={() => host && setPreviewUserId(host.id)}
                type="button"
              >
                {host ? <Avatar name={host.name} size="sm" src={host.avatarUrl} /> : null}
                <span className="text-sm text-white/78">Hosted by {host?.name ?? "Host"}</span>
              </button>
              <div className="mt-4 flex flex-wrap gap-2">
                {metadata.map((item) => (
                  <MetaChip key={item}>{item}</MetaChip>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            onClick={() => setTicketOpen(true)}
            type="button"
          >
            {isJoined ? "View ticket" : event.isFree ? "RSVP" : "Get ticket"}
          </button>
          {roleCounts.open > 0 ? (
            <button
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                hasApplied
                  ? "border-app-success/25 bg-app-success/10 text-app-success"
                  : "border-white/10 bg-white/[0.02] text-white hover:border-white/20"
              )}
              disabled={hasApplied}
              onClick={() => setApplyOpen(true)}
              type="button"
            >
              {hasApplied ? "Applied" : "Apply to help"}
            </button>
          ) : null}
        </div>

        <section className="mt-6 space-y-4">
          <section className="surface-card p-5">
            <p className="text-sm font-semibold text-white">About this event</p>
            <ExpandableText className="mt-3" collapsedLines={3} text={event.description} />
          </section>

          {roomUnlocked ? (
            <section className="surface-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Room unlocked</p>
                  <p className="mt-1 text-sm text-app-muted">
                    Updates and chat are now available for this event.
                  </p>
                </div>
                <Link
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                  href={`/communities/${event.id}`}
                >
                  Join room
                </Link>
              </div>
            </section>
          ) : null}

          {openRoles.length > 0 ? (
            <section className="surface-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Open roles</p>
                  <p className="mt-1 text-sm text-app-muted">
                    Apply with one tap.
                  </p>
                </div>
                <OpenRolesPill count={roleCounts.open} emphasized />
              </div>

              <div className="mt-4 space-y-3">
                {openRoles.slice(0, 4).map((role) => {
                  const applied = role.applicants.some(
                    (entry) => entry.applicantUserId === activeUserId
                  );

                  return (
                    <div
                      className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4"
                      key={role.id}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-white">{role.roleName}</p>
                          <p className="mt-1 text-sm text-app-muted">
                            {formatCurrency(role.payoutRange[0])} - {formatCurrency(role.payoutRange[1])}
                          </p>
                        </div>
                        <button
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm font-semibold transition",
                            applied
                              ? "border border-app-success/25 bg-app-success/10 text-app-success"
                              : "bg-app-purple text-white hover:bg-app-purple-hover"
                          )}
                          disabled={applied}
                          onClick={() => setApplyOpen(true)}
                          type="button"
                        >
                          {applied ? "Applied" : "Apply"}
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {role.requiredSkills.slice(0, 3).map((skill) => (
                          <TagChip key={skill} label={skill} subdued />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="surface-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Host</p>
                <p className="mt-1 text-sm text-app-muted">Trust the person behind the event.</p>
              </div>
              <button
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                onClick={() => host && setPreviewUserId(host.id)}
                type="button"
              >
                View profile
              </button>
            </div>
            <div className="mt-4 flex items-start gap-4">
              {host ? <Avatar name={host.name} size="lg" src={host.avatarUrl} /> : null}
              <div className="min-w-0">
                <p className="text-lg font-semibold text-white">{host?.name}</p>
                <ExpandableText collapsedLines={2} text={host?.bio ?? ""} />
              </div>
            </div>
          </section>

          {contributorUsers.length > 0 ? (
            <section className="surface-card p-5">
              <p className="text-sm font-semibold text-white">Contributors</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {contributorUsers.map((user) => (
                  <button
                    className="flex items-center justify-between rounded-[22px] border border-white/8 bg-[#0d1119] p-4 text-left transition hover:border-white/15"
                    key={user.id}
                    onClick={() => setPreviewUserId(user.id)}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="md" src={user.avatarUrl} />
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-sm text-app-muted">{user.handle}</p>
                      </div>
                    </div>
                    <span className="text-sm text-app-muted">Profile</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {relatedCommission ? (
            <section className="surface-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Boost this event</p>
                  <p className="mt-1 text-sm text-app-muted">
                    Optional upgrades for a better night.
                  </p>
                </div>
                <Link
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                  href={`/commissions/${relatedCommission.id}`}
                >
                  View boost
                </Link>
              </div>
              <p className="mt-4 text-lg font-semibold text-white">{relatedCommission.title}</p>
              <ExpandableText className="mt-2" collapsedLines={2} text={relatedCommission.shortDescription} />
            </section>
          ) : null}

          <section className="surface-card p-5">
            <p className="text-sm font-semibold text-white">FAQ</p>
            <div className="mt-4 space-y-3">
              {getFaq(event).map((item) => (
                <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={item.question}>
                  <p className="font-semibold text-white">{item.question}</p>
                  <ExpandableText className="mt-2" collapsedLines={2} text={item.answer} />
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-[78px] z-30 px-4 md:hidden">
        <div className="pointer-events-auto mx-auto rounded-[24px] border border-white/8 bg-[#101421]/94 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <div className={cn("grid gap-3", roleCounts.open > 0 ? "grid-cols-2" : "grid-cols-1")}>
            <button
              className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
              onClick={() => setTicketOpen(true)}
              type="button"
            >
              {isJoined ? "View ticket" : event.isFree ? "RSVP" : "Get ticket"}
            </button>
            {roleCounts.open > 0 ? (
              <button
                className={cn(
                  "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  hasApplied
                    ? "border-app-success/25 bg-app-success/10 text-app-success"
                    : "border-white/10 bg-white/[0.02] text-white hover:border-white/20"
                )}
                disabled={hasApplied}
                onClick={() => setApplyOpen(true)}
                type="button"
              >
                {hasApplied ? "Applied" : "Apply to help"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <TicketModal event={event} onClose={() => setTicketOpen(false)} open={ticketOpen} />
      <ApplyHelpModal event={event} onClose={() => setApplyOpen(false)} open={applyOpen} roles={eventRoles} />
      <ProfilePreviewModal onClose={() => setPreviewUserId(null)} open={Boolean(previewUser)} user={previewUser} />
    </div>
  );
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/12 bg-[#0a0d14]/72 px-3 py-1 text-xs font-medium text-white backdrop-blur">
      {children}
    </span>
  );
}

function getFaq(event: NonNullable<ReturnType<typeof getEventById>>) {
  return [
    {
      question: "What happens after I RSVP?",
      answer: `You get your ticket state plus room access for ${event.title}.`
    },
    {
      question: "How does applying work?",
      answer: "Pick a role, tap Apply, and the host sees it immediately inside their review flow."
    },
    {
      question: "Can I just attend?",
      answer: "Yes. Applying to help is optional. The main path is still simply showing up."
    }
  ];
}
