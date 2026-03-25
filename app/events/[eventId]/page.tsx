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

  const eventData = event;
  const launch = launches.find((item) => item.eventId === eventData.id);
  const host = resolveUser(eventData.hostId);
  const openRoles = roles.filter((role) => role.eventId === eventData.id && role.status !== "filled");
  const filledRoles = roles.filter(
    (role) => role.eventId === eventData.id && role.status === "filled" && role.filledByUserId
  );
  const contributorEntries = filledRoles
    .map((role) => {
      const user = resolveUser(role.filledByUserId);
      return user
        ? {
            id: role.id,
            roleName: role.roleName,
            user
          }
        : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const hasApplied = openRoles.some((role) =>
    role.applicants.some((entry) => entry.applicantUserId === currentUserId)
  );
  const roomUnlocked =
    goingEventIds.includes(eventData.id) || hasApplied || eventData.hostId === currentUserId;
  const isSaved = savedEventIds.includes(eventData.id);
  const isOwner = eventData.hostId === currentUserId;
  const businessSupportState = currentBusinessProfile
    ? supportIntents.find(
        (intent) =>
          intent.businessId === currentBusinessProfile.id &&
          intent.targetType === "event" &&
          intent.targetId === eventData.id
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
        : goingEventIds.includes(eventData.id)
          ? "View ticket"
          : eventData.isFree
            ? "Reserve spot"
            : "Get ticket";

  const expectationPoints = [
    eventData.subtitle,
    `${eventData.priceLabel}${eventData.isFree ? "" : " entry"} · ${eventData.venue}`,
    openRoles.length > 0
      ? `${openRoles.length} open role${openRoles.length > 1 ? "s" : ""} if you want to help build the night.`
      : `${eventData.mutualsCount} friends interested in this one.`,
    host ? `${host.name} is hosting this run.` : "Hosted by a trusted scene host."
  ].filter(Boolean);

  function handlePrimaryAction() {
    if (isOwner && launch) {
      window.location.assign(`/studio/${launch.id}`);
      return;
    }

    if (mode === "business" && currentBusinessProfile) {
      respondToBusinessMatch(
        currentBusinessProfile.id,
        "event",
        eventData.id,
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

    if (goingEventIds.includes(eventData.id)) {
      window.location.assign("/my-events");
      return;
    }

    bookEvent(eventData.id, eventData.isFree ? "reserve" : "ticket");
  }

  async function handleShare() {
    if (typeof window === "undefined") {
      return;
    }

    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: eventData.title,
          text: eventData.subtitle,
          url: shareUrl
        });
        return;
      } catch {
        // fall through to clipboard copy
      }
    }

    await navigator.clipboard?.writeText(shareUrl);
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[540px] px-4 pb-36 pt-5 sm:max-w-[620px] sm:px-6 sm:pb-16 sm:pt-8">
        <section className="space-y-5">
          <div className="mx-auto max-w-[340px] overflow-hidden rounded-[30px] border border-white/8 bg-[#0f1320] shadow-soft">
            <div className="relative">
              <img
                alt={eventData.title}
                className="aspect-[4/5] w-full object-cover"
                src={eventData.posterUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070c]/68 via-transparent to-transparent" />
              <div className="absolute left-4 top-4">
                <StatusChip status={launch?.status ?? "confirmed"} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-[32px] font-semibold leading-tight text-white sm:text-[42px]">
                {eventData.title}
              </h1>
              <p className="text-sm leading-6 text-white/78">{eventData.subtitle}</p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Link
                className="flex min-w-0 items-center gap-3"
                href={`/profiles/${host?.id ?? eventData.hostId}`}
              >
                <Avatar name={host?.name ?? "Host"} size="sm" src={host?.avatarUrl} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{host?.name ?? "Host"}</p>
                  <p className="text-xs text-app-muted">
                    {eventData.mutualsCount > 0
                      ? `${eventData.mutualsCount} friends interested`
                      : "Hosted in your scene"}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <IconActionButton
                  ariaLabel={isSaved ? "Unsave event" : "Save event"}
                  onClick={() => toggleSavedEvent(eventData.id)}
                  selected={isSaved}
                >
                  <BookmarkIcon />
                </IconActionButton>
                <IconActionButton ariaLabel="Share event" onClick={handleShare}>
                  <ShareIcon />
                </IconActionButton>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-[#0d1119] px-4 py-4">
              <div className="space-y-2 text-sm text-white/86">
                <p>{formatDateRange(eventData.startsAt, eventData.endsAt)}</p>
                <p>{formatTimeLabel(eventData.startsAt)}</p>
                <p>
                  {eventData.venue}, {eventData.city}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {eventData.fandomTags.slice(0, 3).map((tag) => (
                  <TagChip key={tag} label={tag} subdued />
                ))}
              </div>
            </div>

            <div>
              <button
                className="min-h-[48px] w-full rounded-[18px] bg-[#bc8b43] px-4 py-3 text-sm font-semibold text-[#140d04] transition hover:bg-[#d59a47]"
                onClick={handlePrimaryAction}
                type="button"
              >
                {primaryLabel}
              </button>
            </div>
          </div>
        </section>

        <div className="mt-8 space-y-8">
          <DetailSection title="About this event">
            <ExpandableText collapsedLines={5} text={eventData.description} />
          </DetailSection>

          <DetailSection title="What to expect">
            <ul className="space-y-3">
              {expectationPoints.map((item) => (
                <li className="flex gap-3 text-sm leading-6 text-app-muted" key={item}>
                  <span className="mt-[9px] h-1.5 w-1.5 rounded-full bg-app-purple" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </DetailSection>

          {contributorEntries.length > 0 ? (
            <DetailSection title="Contributors">
              <div className="grid grid-cols-2 gap-3">
                {contributorEntries.map((entry) => (
                  <Link
                    className="rounded-[22px] border border-white/8 bg-[#0d1119] p-3 transition hover:border-white/15"
                    href={`/profiles/${entry.user.id}`}
                    key={entry.id}
                  >
                    <Avatar name={entry.user.name} size="sm" src={entry.user.avatarUrl} />
                    <p className="mt-3 text-sm font-semibold text-white">{entry.user.name}</p>
                    <p className="mt-1 text-xs text-app-muted">{entry.roleName}</p>
                  </Link>
                ))}
              </div>
            </DetailSection>
          ) : null}

          {openRoles.length > 0 ? (
            <DetailSection title="Open roles">
              <div className="space-y-3">
                {openRoles.map((role) => (
                  <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4" key={role.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-white">{role.roleName}</p>
                        <p className="mt-1 text-sm text-app-muted">
                          ${role.payoutRange[0]} - ${role.payoutRange[1]}
                        </p>
                      </div>
                      <button
                        className="rounded-[18px] bg-app-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                        onClick={() => setApplyOpen(true)}
                        type="button"
                      >
                        {hasApplied ? "Applied" : "Apply"}
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
            </DetailSection>
          ) : null}

          {roomUnlocked ? (
            <DetailSection title="Room">
              <div className="flex items-center justify-between gap-4 rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
                <p className="text-sm text-app-muted">Updates and chat are unlocked.</p>
                <Link
                  className="inline-flex min-h-[44px] items-center rounded-[18px] border border-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/20"
                  href={`/communities/${eventData.id}`}
                >
                  Join room
                </Link>
              </div>
            </DetailSection>
          ) : null}
        </div>
      </main>

      <RoleApplicationPanel
        eventId={eventData.id}
        onClose={() => setApplyOpen(false)}
        open={applyOpen}
        roles={openRoles}
      />
    </div>
  );
}

function DetailSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">{title}</h2>
      {children}
    </section>
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
          ? "border-[#bc8b43]/60 bg-[#bc8b43]/12 text-[#f3c070]"
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
