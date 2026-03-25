"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { ExpandableText } from "@/src/components/ExpandableText";
import { Nav } from "@/src/components/Nav";
import { RoleApplicationPanel } from "@/src/components/RoleApplicationPanel";
import { StatusChip } from "@/src/components/StatusChip";
import { TagChip } from "@/src/components/Chips";
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
    goingEventIds,
    launches,
    mode,
    resolveUser,
    respondToBusinessMatch,
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
  const openRoles = roles.filter((role) => role.eventId === event.id && role.status !== "filled");
  const hasApplied = openRoles.some((role) =>
    role.applicants.some((entry) => entry.applicantUserId === currentUserId)
  );
  const roomUnlocked =
    goingEventIds.includes(event.id) || hasApplied || event.hostId === currentUserId;
  const isSaved = savedEventIds.includes(event.id);
  const isOwner = event.hostId === currentUserId;
  const businessSupportState = currentBusinessProfile
    ? supportIntents.find(
        (intent) =>
          intent.businessId === currentBusinessProfile.id &&
          intent.targetType === "event" &&
          intent.targetId === event.id
      )?.action
    : undefined;

  const primaryLabel = isOwner
    ? "Manage"
    : mode === "business"
      ? businessSupportState === "supporting"
        ? "Support"
        : "Host"
      : mode === "creator" && openRoles.length > 0
        ? hasApplied
          ? "Applied"
          : "Apply"
        : goingEventIds.includes(event.id)
          ? "View ticket"
          : event.isFree
            ? "Reserve spot"
            : "Get ticket";

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[760px] px-4 pb-40 pt-5 sm:px-6 sm:pb-16 sm:pt-8">
        <section className="overflow-hidden rounded-[34px] border border-white/8 bg-[#0f1320] shadow-soft">
          <div className="relative">
            <img alt={event.title} className="h-[320px] w-full object-cover sm:h-[440px]" src={event.posterUrl} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/18 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <StatusChip status={launch?.status ?? "confirmed"} />
              <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">{event.title}</h1>
              <p className="mt-2 text-sm text-white/78 sm:text-base">{event.subtitle}</p>
              <p className="mt-4 text-sm text-white/70">
                {formatDateRange(event.startsAt, event.endsAt)} · {formatTimeLabel(event.startsAt)} · {event.venue}, {event.city}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Avatar name={host?.name ?? "Host"} size="sm" src={host?.avatarUrl} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{host?.name ?? "Host"}</p>
                  <p className="text-xs text-white/60">{event.mutualsCount > 0 ? `${event.mutualsCount} friends interested` : "Hosted in your scene"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            className="min-h-[46px] rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            onClick={() => {
              if (isOwner && launch) {
                window.location.assign(`/studio/${launch.id}`);
                return;
              }
              if (mode === "business" && currentBusinessProfile) {
                respondToBusinessMatch(
                  currentBusinessProfile.id,
                  "event",
                  event.id,
                  businessSupportState === "hosting" ? "supporting" : "hosting"
                );
                return;
              }
              if (mode === "creator" && openRoles.length > 0) {
                if (!hasApplied) {
                  setApplyOpen(true);
                }
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
          <button
            className="min-h-[46px] rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
            onClick={() => toggleSavedEvent(event.id)}
            type="button"
          >
            {isSaved ? "Saved" : "Save"}
          </button>
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
          <SectionBlock title="About">
            <ExpandableText collapsedLines={4} text={event.description} />
          </SectionBlock>

          {openRoles.length > 0 ? (
            <SectionBlock title="Open roles">
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
                      {mode === "creator" ? (
                        <button
                          className="rounded-2xl bg-app-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                          onClick={() => setApplyOpen(true)}
                          type="button"
                        >
                          {hasApplied ? "Applied" : "Apply"}
                        </button>
                      ) : null}
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

          <SectionBlock title="Host">
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
          </SectionBlock>

          {roomUnlocked ? (
            <SectionBlock title="Room">
              <div className="flex items-center justify-between gap-3 rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
                <p className="text-sm text-app-muted">Updates and chat are unlocked.</p>
                <Link
                  className="inline-flex min-h-[44px] items-center rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/20"
                  href={`/communities/${event.id}`}
                >
                  Join room
                </Link>
              </div>
            </SectionBlock>
          ) : null}
        </div>
      </main>

      <RoleApplicationPanel
        eventId={event.id}
        onClose={() => setApplyOpen(false)}
        open={applyOpen}
        roles={openRoles}
      />
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
    <section className="surface-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
