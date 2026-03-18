"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { ExpandableText } from "@/src/components/ExpandableText";
import { Nav } from "@/src/components/Nav";
import { RoleApplicationPanel } from "@/src/components/RoleApplicationPanel";
import { StatusChip } from "@/src/components/StatusChip";
import { ThresholdProgress } from "@/src/components/ThresholdProgress";
import { getEventById } from "@/src/data/demo";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";
import { formatDateRange, formatTimeLabel } from "@/src/lib/utils";

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const {
    bookEvent,
    currentUserId,
    launches,
    mode,
    resolveUser
  } = useAppState();
  const { events, joinedEventIds, roles, savedEventIds, toggleSavedEvent } = useDemoState();
  const [applyOpen, setApplyOpen] = useState(false);
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

  const launch = launches.find((item) => item.eventId === event.id);
  const host = resolveUser(event.hostId);
  const eventRoles = roles.filter((role) => role.eventId === event.id);
  const openRoles = eventRoles.filter((role) => role.status !== "filled");
  const filledRoles = eventRoles.filter((role) => role.status === "filled");
  const hasApplied = openRoles.some((role) =>
    role.applicants.some((entry) => entry.applicantUserId === currentUserId)
  );
  const roomUnlocked =
    joinedEventIds.includes(event.id) || hasApplied || event.hostId === currentUserId;
  const isSaved = savedEventIds.includes(event.id);
  const thresholdCurrent = (launch?.reserveCount ?? 0) + (launch?.ticketCount ?? 0);
  const thresholdTarget = launch?.plan.thresholdTarget ?? Math.max(24, Math.round(event.attendeesCount * 0.08));
  const thresholdMet = thresholdCurrent >= thresholdTarget;
  const isOwnEvent = mode === "host" && event.hostId === "user-zo";
  const primaryLabel = isOwnEvent
    ? "Open workspace"
    : mode === "creator"
      ? hasApplied
        ? "Application sent"
        : "Join team"
      : joinedEventIds.includes(event.id)
        ? "View ticket"
        : thresholdMet
          ? event.isFree
            ? "Reserve spot"
            : "Get ticket"
          : "Reserve spot";

  const metadata = [
    formatDateRange(event.startsAt, event.endsAt),
    formatTimeLabel(event.startsAt),
    `${event.venue}, ${event.city}`,
    ...event.fandomTags,
    openRoles.length > 0 ? `${openRoles.length} roles open` : null
  ].filter(Boolean) as string[];

  const ticketSection = (
    <section className="surface-card p-5 sm:p-6">
      <p className="text-sm font-semibold text-white">Ticket options</p>
      <div className="mt-4 grid gap-3">
        {(launch?.plan.ticketPlan ?? [
          { label: thresholdMet ? "General ticket" : "Reserve spot", price: event.isFree ? 0 : 24, description: "Hold a place in the launch." }
        ]).map((tier) => (
          <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={tier.label}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{tier.label}</p>
                <p className="mt-2 text-sm text-app-muted">{tier.description}</p>
              </div>
              <span className="text-lg font-semibold text-white">{tier.price > 0 ? `$${tier.price}` : "Free"}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const rolesSection = openRoles.length > 0 ? (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">Open roles</p>
          <p className="mt-2 text-sm text-app-muted">Fast applications, clear fit, direct to the host.</p>
        </div>
        <button
          className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
          onClick={() => setApplyOpen(true)}
          type="button"
        >
          {hasApplied ? "Application sent" : "Join team"}
        </button>
      </div>
      <div className="mt-4 grid gap-3">
        {openRoles.map((role) => (
          <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={role.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{role.roleName}</p>
                <p className="mt-2 text-sm text-app-muted">
                  ${role.payoutRange[0]} - ${role.payoutRange[1]}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {role.requiredSkills.slice(0, 3).map((skill) => (
                  <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-app-muted" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  ) : null;

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[980px] px-4 pb-40 pt-5 sm:px-6 sm:pb-16 sm:pt-8">
        <section className="overflow-hidden rounded-[30px] border border-white/8 bg-[#0f1320] shadow-soft">
          <div className="relative">
            <img alt={event.title} className="h-[320px] w-full object-cover sm:h-[440px]" src={event.posterUrl} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip
                  status={
                    launch?.status === "completed"
                      ? "completed"
                      : thresholdCurrent >= thresholdTarget * 0.85
                        ? "almost-there"
                        : launch?.status ?? "live"
                  }
                />
                {event.fandomTags.slice(0, 2).map((tag) => (
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/84" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-white sm:text-6xl">{event.title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/78 sm:text-base">{event.subtitle}</p>
              <div className="mt-4 flex items-center gap-3">
                <Avatar name={host?.name ?? "Host"} size="sm" src={host?.avatarUrl} />
                <div className="text-sm text-white/78">
                  Hosted by {host?.name ?? "Host"}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {metadata.map((item) => (
                  <span className="rounded-full border border-white/12 bg-[#0a0d14]/72 px-3 py-1 text-xs font-medium text-white backdrop-blur" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <button
            className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            onClick={() => {
              if (isOwnEvent && launch) {
                window.location.assign(`/studio/${launch.id}`);
                return;
              }
              if (mode === "creator") {
                if (hasApplied) {
                  window.location.assign("/my-events");
                  return;
                }
                setApplyOpen(true);
                return;
              }
              if (joinedEventIds.includes(event.id)) {
                window.location.assign("/my-events");
                return;
              }
              bookEvent(event.id, thresholdMet ? "ticket" : "reserve");
            }}
            type="button"
          >
            {primaryLabel}
          </button>
          <button
            className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
            onClick={() => toggleSavedEvent(event.id)}
            type="button"
          >
            {isSaved ? "Saved" : "Save"}
          </button>
          <button
            className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.share) {
                navigator.share({ title: event.title, url: window.location.href }).catch(() => undefined);
              }
            }}
            type="button"
          >
            Share
          </button>
        </div>

        <section className="mt-6 surface-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Event status</p>
              <p className="mt-2 text-sm text-app-muted">
                {launch?.plan.turnoutOutlook ?? "This launch is already moving."}
              </p>
            </div>
            <StatusChip
              status={
                launch?.status === "completed"
                  ? "payouts-ready"
                  : thresholdCurrent >= thresholdTarget * 0.85
                    ? "almost-there"
                    : launch?.status ?? "live"
              }
            />
          </div>
          <div className="mt-4">
            <ThresholdProgress current={thresholdCurrent} target={thresholdTarget} />
          </div>
        </section>

        <div className="mt-6 space-y-6">
          {mode === "creator" ? rolesSection : ticketSection}
          {mode === "creator" ? ticketSection : rolesSection}

          <section className="surface-card p-5 sm:p-6">
            <p className="text-sm font-semibold text-white">About this event</p>
            <ExpandableText className="mt-3" collapsedLines={3} text={event.description} />
          </section>

          <section className="surface-card p-5 sm:p-6">
            <p className="text-sm font-semibold text-white">Host + team</p>
            <div className="mt-4 flex items-center gap-3">
              <Avatar name={host?.name ?? "Host"} size="sm" src={host?.avatarUrl} />
              <div>
                <p className="font-semibold text-white">{host?.name ?? "Host"}</p>
                <p className="text-sm text-app-muted">{host?.city ?? event.city}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {filledRoles.length > 0 ? (
                filledRoles.map((role) => {
                  const contributor = resolveUser(role.filledByUserId);
                  return (
                    <Link className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/12" href={contributor ? `/creators/${contributor.id}` : "#"} key={role.id}>
                      <div className="flex items-center gap-3">
                        <Avatar name={contributor?.name ?? role.roleName} size="sm" src={contributor?.avatarUrl} />
                        <div>
                          <p className="font-semibold text-white">{contributor?.name ?? "Contributor"}</p>
                          <p className="text-sm text-app-muted">{role.roleName}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <p className="text-sm leading-6 text-app-muted">The team will show up here as roles get confirmed.</p>
              )}
            </div>
          </section>

          <section className="surface-card p-5 sm:p-6">
            <p className="text-sm font-semibold text-white">Venue, schedule, FAQ</p>
            <div className="mt-4 space-y-3 text-sm text-app-muted">
              <p>{event.venue}, {event.city}</p>
              <p>{formatDateRange(event.startsAt, event.endsAt)} · {formatTimeLabel(event.startsAt)}</p>
              <p>Plan to arrive 20 minutes early. The room opens after you reserve or join the team.</p>
            </div>
          </section>

          {roomUnlocked ? (
            <section className="surface-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Room unlocked</p>
                  <p className="mt-2 text-sm text-app-muted">Updates and chat are now available for this event.</p>
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
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-[#090b10]/94 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-[980px] gap-3">
          <button
            className="flex-1 rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            onClick={() => {
              if (isOwnEvent && launch) {
                window.location.assign(`/studio/${launch.id}`);
                return;
              }
              if (mode === "creator") {
                if (hasApplied) {
                  window.location.assign("/my-events");
                  return;
                }
                setApplyOpen(true);
                return;
              }
              bookEvent(event.id, thresholdMet ? "ticket" : "reserve");
            }}
            type="button"
          >
            {primaryLabel}
          </button>
          {mode === "creator" && openRoles.length > 0 ? (
            <button
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
              onClick={() => setApplyOpen(true)}
              type="button"
            >
              Roles
            </button>
          ) : null}
        </div>
      </div>

      {openRoles.length > 0 ? (
        <RoleApplicationPanel
          eventId={event.id}
          onClose={() => setApplyOpen(false)}
          open={applyOpen}
          roles={openRoles}
        />
      ) : null}
    </div>
  );
}
