"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { ExpandableText } from "@/src/components/ExpandableText";
import { Nav } from "@/src/components/Nav";
import { RoleApplicationPanel } from "@/src/components/RoleApplicationPanel";
import { TagChip } from "@/src/components/Chips";
import { EventCard } from "@/src/components/EventCard";
import { getEventById } from "@/src/data/demo";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";
import { formatDateRange, formatTimeLabel } from "@/src/lib/utils";

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const {
    bookEvent,
    currentBusinessProfile,
    currentUserId,
    homeCity,
    launches,
    mode,
    preferredFandoms,
    respondToBusinessMatch,
    resolveUser,
    goingEventIds,
    savedEventIds,
    supportIntents,
    toggleSavedEvent
  } = useAppState();
  const { events, roles } = useDemoState();
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
    goingEventIds.includes(event.id) || hasApplied || event.hostId === currentUserId;
  const isSaved = savedEventIds.includes(event.id);
  const thresholdCurrent = (launch?.reserveCount ?? 0) + (launch?.ticketCount ?? 0);
  const thresholdTarget =
    launch?.plan.thresholdTarget ?? Math.max(24, Math.round(event.attendeesCount * 0.08));
  const isOwnEvent = mode === "host" && event.hostId === currentUserId;
  const businessSupportState = currentBusinessProfile
    ? supportIntents.find(
        (intent) =>
          intent.businessId === currentBusinessProfile.id &&
          intent.targetType === "event" &&
          intent.targetId === event.id
      )?.action
    : undefined;
  const relatedEvents = events
    .filter(
      (candidate) =>
        candidate.id !== event.id &&
        candidate.fandomTags.some((tag) => event.fandomTags.includes(tag))
    )
    .slice(0, 3);
  const whyForYou = [
    event.city === homeCity ? `Close to ${homeCity.split(",")[0]}` : null,
    event.fandomTags.some((tag) => preferredFandoms.includes(tag))
      ? `Matches ${event.fandomTags.find((tag) => preferredFandoms.includes(tag))}`
      : null,
    event.mutualsCount > 0 ? `${event.mutualsCount} mutuals are circling it` : null
  ].filter(Boolean) as string[];

  const primaryLabel = isOwnEvent
    ? "Open workspace"
    : mode === "business"
      ? businessSupportState === "supporting"
        ? "Support noted"
        : "Support event"
    : mode === "creator"
      ? hasApplied
        ? "Application sent"
        : openRoles.length > 0
          ? "Join team"
          : goingEventIds.includes(event.id)
            ? "View plans"
            : event.isFree
              ? "Reserve spot"
              : "Get ticket"
      : goingEventIds.includes(event.id)
        ? "View plans"
        : event.isFree
          ? "Reserve spot"
          : "Get ticket";

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[1040px] px-4 pb-40 pt-5 sm:px-6 sm:pb-16 sm:pt-8">
        <section className="overflow-hidden rounded-[34px] border border-white/8 bg-[#0f1320] shadow-soft">
          <div className="relative">
            <img alt={event.title} className="h-[340px] w-full object-cover sm:h-[470px]" src={event.posterUrl} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/22 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <div className="flex flex-wrap gap-2">
                {event.fandomTags.map((tag) => (
                  <span className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-xs font-semibold text-white" key={tag}>
                    {tag}
                  </span>
                ))}
                {openRoles.length > 0 ? (
                  <span className="rounded-full border border-app-purple/30 bg-app-purple/15 px-3 py-1 text-xs font-semibold text-white">
                    {openRoles.length} roles open
                  </span>
                ) : null}
              </div>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-white sm:text-6xl">{event.title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/78 sm:text-base">{event.subtitle}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <MetaPill label={formatDateRange(event.startsAt, event.endsAt)} />
                <MetaPill label={formatTimeLabel(event.startsAt)} />
                <MetaPill label={`${event.venue}, ${event.city}`} />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Avatar name={host?.name ?? "Host"} size="sm" src={host?.avatarUrl} />
                <div>
                  <p className="text-sm font-semibold text-white">Hosted by {host?.name ?? "Host"}</p>
                  <p className="text-xs text-white/62">{host?.city ?? event.city}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            onClick={() => {
              if (isOwnEvent && launch) {
                window.location.assign(`/studio/${launch.id}`);
                return;
              }
              if (mode === "business" && currentBusinessProfile) {
                respondToBusinessMatch(currentBusinessProfile.id, "event", event.id, "supporting");
                return;
              }
              if (mode === "creator" && openRoles.length > 0) {
                if (hasApplied) {
                  window.location.assign("/my-events");
                  return;
                }
                setApplyOpen(true);
                return;
              }
              if (goingEventIds.includes(event.id)) {
                window.location.assign("/my-events");
                return;
              }
              bookEvent(event.id, event.isFree ? "reserve" : "ticket");
            }}
            type="button"
          >
            {primaryLabel}
          </button>
          {mode !== "host" && openRoles.length > 0 ? (
            <button
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
              onClick={() => {
                if (mode === "business" && currentBusinessProfile) {
                  respondToBusinessMatch(currentBusinessProfile.id, "event", event.id, "hosting");
                  return;
                }
                setApplyOpen(true);
              }}
              type="button"
            >
              {mode === "business" ? "Host this event" : "Join team"}
            </button>
          ) : null}
          <button
            className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
            onClick={() => toggleSavedEvent(event.id)}
            type="button"
          >
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(310px,0.92fr)]">
          <section className="space-y-6">
            <div className="surface-card p-5">
              <p className="text-lg font-semibold text-white">Why this could be your scene</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {whyForYou.length > 0 ? (
                  whyForYou.map((item) => <TagChip key={item} label={item} subdued />)
                ) : (
                  <TagChip label="Fresh for your feed" subdued />
                )}
              </div>
            </div>

            <div className="surface-card p-5">
              <p className="text-lg font-semibold text-white">About</p>
              <div className="mt-4">
                <ExpandableText collapsedLines={4} text={event.description} />
              </div>
            </div>

            {mode === "creator" && openRoles.length > 0 ? (
              <SectionBlock title="Join the team">
                <div className="space-y-3">
                  {openRoles.map((role) => (
                    <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4" key={role.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">{role.roleName}</p>
                          <p className="mt-1 text-sm text-app-muted">
                            ${role.payoutRange[0]} - ${role.payoutRange[1]}
                          </p>
                        </div>
                        <button
                          className="rounded-2xl bg-app-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                          onClick={() => setApplyOpen(true)}
                          type="button"
                        >
                          Apply
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {role.requiredSkills.slice(0, 3).map((skill) => (
                          <TagChip key={skill} label={skill} subdued />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionBlock>
            ) : null}

            <SectionBlock title="People behind it">
              <div className="space-y-3">
                <Link
                  className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/15"
                  href={`/profiles/${host?.id ?? event.hostId}`}
                >
                  <Avatar name={host?.name ?? "Host"} size="md" src={host?.avatarUrl} />
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{host?.name ?? "Host"}</p>
                    <p className="text-sm text-app-muted">{host?.bio ?? "Building nights worth leaving the house for."}</p>
                  </div>
                </Link>
                {filledRoles.slice(0, 3).map((role) => {
                  const contributor = resolveUser(role.filledByUserId);
                  return contributor ? (
                    <Link
                      className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/15"
                      href={`/profiles/${contributor.id}`}
                      key={role.id}
                    >
                      <Avatar name={contributor.name} size="md" src={contributor.avatarUrl} />
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{contributor.name}</p>
                        <p className="text-sm text-app-muted">{role.roleName}</p>
                      </div>
                    </Link>
                  ) : null;
                })}
              </div>
            </SectionBlock>
          </section>

          <aside className="space-y-6">
            <SectionBlock title="Scene signal">
              <div className="space-y-3 text-sm text-app-muted">
                <p>{event.attendeesCount.toLocaleString()} people have this on their radar.</p>
                <p>{event.mutualsCount} mutuals already talking about it.</p>
                <p>{event.communityCount.toLocaleString()} community members in the wider scene.</p>
              </div>
            </SectionBlock>

            {mode !== "creator" && openRoles.length > 0 ? (
              <SectionBlock title="Open roles">
                <div className="space-y-3">
                  {openRoles.slice(0, 3).map((role) => (
                    <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4" key={role.id}>
                      <p className="font-semibold text-white">{role.roleName}</p>
                      <p className="mt-1 text-sm text-app-muted">
                        ${role.payoutRange[0]} - ${role.payoutRange[1]}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionBlock>
            ) : null}

            {roomUnlocked ? (
              <SectionBlock title="Room unlocked">
                <p className="text-sm text-app-muted">Updates, reactions, and room chatter are ready.</p>
                <Link
                  className="mt-4 inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                  href={`/communities/${event.id}`}
                >
                  Open room
                </Link>
              </SectionBlock>
            ) : null}

            <SectionBlock title="Related events">
              <div className="space-y-4">
                {relatedEvents.map((related) => {
                  const relatedLaunch = launches.find((item) => item.eventId === related.id);
                  return (
                    <EventCard
                      event={related}
                      href={`/events/${related.id}`}
                      key={related.id}
                      mode={mode}
                      onPrimaryAction={() => window.location.assign(`/events/${related.id}`)}
                      openRoles={roles.filter((role) => role.eventId === related.id && role.status !== "filled").length}
                      primaryLabel="See event"
                      reasonLine={related.subtitle}
                      showThreshold={false}
                      socialLine={`${related.mutualsCount} mutuals`}
                      status={relatedLaunch?.status ?? "live"}
                      thresholdCurrent={(relatedLaunch?.reserveCount ?? 0) + (relatedLaunch?.ticketCount ?? 0)}
                      thresholdTarget={relatedLaunch?.plan.thresholdTarget ?? Math.max(24, Math.round(related.attendeesCount * 0.07))}
                      variant="row"
                    />
                  );
                })}
              </div>
            </SectionBlock>
          </aside>
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
              if (mode === "creator" && openRoles.length > 0) {
                setApplyOpen(true);
                return;
              }
              bookEvent(event.id, event.isFree ? "reserve" : "ticket");
            }}
            type="button"
          >
            {primaryLabel}
          </button>
          {openRoles.length > 0 ? (
            <button
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
              onClick={() => setApplyOpen(true)}
              type="button"
            >
              Team
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

function SectionBlock({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card p-5">
      <p className="text-lg font-semibold text-white">{title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MetaPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/12 bg-[#0a0d14]/72 px-3 py-1 text-xs font-medium text-white backdrop-blur">
      {label}
    </span>
  );
}
