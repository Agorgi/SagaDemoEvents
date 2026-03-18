"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { ExpandableText } from "@/src/components/ExpandableText";
import { Nav } from "@/src/components/Nav";
import { getCommunityById, getEventById, getRolesForEvent, getUserById } from "@/src/data/demo";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";
import { formatDateRange, formatTimeLabel } from "@/src/lib/utils";

const baseTabs = ["Updates", "Chat"] as const;
type RoomTab = (typeof baseTabs)[number] | "Crew";

export default function CommunityDetailPage() {
  const params = useParams<{ communityId: string }>();
  const { currentUserId, resolveUser } = useAppState();
  const { commissions, events, joinedEventIds, roles } = useDemoState();
  const [activeTab, setActiveTab] = useState<RoomTab>("Updates");

  const event = getEventById(params.communityId, events);
  const legacyRoom = getCommunityById(params.communityId);

  if (!event && !legacyRoom) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-20 text-center text-app-muted">
          Event room not found.
        </main>
      </div>
    );
  }

  if (!event && legacyRoom) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-[900px] px-4 pb-28 pt-5 sm:px-6 sm:pb-10 sm:pt-8">
          <section className="surface-card-strong p-5 sm:p-7">
            <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Series room</p>
            <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
              {legacyRoom.title}
            </h1>
            <ExpandableText className="mt-3" collapsedLines={3} text={legacyRoom.description} />
          </section>
        </main>
      </div>
    );
  }

  const roomEvent = event as NonNullable<typeof event>;
  const host = resolveUser(roomEvent.hostId) ?? getUserById(roomEvent.hostId);
  const eventRoles = getRolesForEvent(roles, roomEvent.id);
  const relatedCommission = commissions.find((commission) => commission.linkedEventId === roomEvent.id);
  const hasApplied = eventRoles.some((role) =>
    role.applicants.some((entry) => entry.applicantUserId === currentUserId)
  );
  const isContributor =
    roomEvent.hostId === currentUserId ||
    eventRoles.some(
      (role) =>
        role.filledByUserId === currentUserId ||
        role.applicants.some((entry) => entry.applicantUserId === currentUserId)
    );
  const isUnlocked = joinedEventIds.includes(roomEvent.id) || hasApplied || roomEvent.hostId === currentUserId;
  const tabs: RoomTab[] = isContributor ? [...baseTabs, "Crew"] : [...baseTabs];

  const boostUpdates =
    relatedCommission?.activity.slice(0, 2).map((item) => item.text) ?? [];
  const updates = [
    `${roomEvent.title} is live. Doors are at ${formatTimeLabel(roomEvent.startsAt)}.`,
    `Meetup point: ${roomEvent.venue}. Keep an eye here for timing changes.`,
    ...boostUpdates
  ].slice(0, 4);

  const chat = [
    "Anyone else arriving solo?",
    "Theme fits are welcome, but casual is fine too.",
    "If you applied to help, the host may drop timing updates here first."
  ];

  const crewNotes = eventRoles.slice(0, 3).map((role) =>
    role.status === "filled"
      ? `${role.roleName} is locked.`
      : `${role.roleName} is still open for the right fit.`
  );

  if (!isUnlocked) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pb-10 sm:pt-8">
          <section className="surface-card-strong overflow-hidden p-5 sm:p-7">
            <img
              alt={roomEvent.title}
              className="h-[220px] w-full rounded-[24px] object-cover sm:h-[300px]"
              src={roomEvent.posterUrl}
            />
            <p className="mt-5 text-sm uppercase tracking-[0.16em] text-app-muted">Room locked</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">{roomEvent.title}</h1>
            <p className="mt-3 text-sm text-app-muted">
              RSVP or apply to help to unlock updates and chat.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                href={`/events/${roomEvent.id}`}
              >
                Back to event
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto max-w-[860px] px-4 pb-28 pt-5 sm:px-6 sm:pb-10 sm:pt-8">
        <section className="surface-card-strong p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Event room</p>
              <h1 className="mt-3 text-4xl font-semibold text-white">{roomEvent.title}</h1>
              <p className="mt-2 text-sm text-app-muted">
                {formatDateRange(roomEvent.startsAt, roomEvent.endsAt)} · {roomEvent.venue}
              </p>
            </div>
            <Link
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
              href={`/events/${roomEvent.id}`}
            >
              Event
            </Link>
          </div>

          <div className="mt-5 flex items-center gap-3">
            {host ? <Avatar name={host.name} size="sm" src={host.avatarUrl} /> : null}
            <p className="text-sm text-white">Hosted by {host?.name ?? "Host"}</p>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
            {tabs.map((tab) => (
              <button
                className={`pill ${activeTab === tab ? "pill-active" : "text-app-muted hover:border-white/15 hover:text-white"}`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {activeTab === "Updates"
            ? updates.map((item, index) => (
                <RoomCard key={`update-${index}`} title="Update">
                  {item}
                </RoomCard>
              ))
            : null}

          {activeTab === "Chat"
            ? chat.map((item, index) => (
                <RoomCard key={`chat-${index}`} title="Chat">
                  {item}
                </RoomCard>
              ))
            : null}

          {activeTab === "Crew"
            ? crewNotes.map((item, index) => (
                <RoomCard key={`crew-${index}`} title="Crew">
                  {item}
                </RoomCard>
              ))
            : null}
        </section>
      </main>
    </div>
  );
}

function RoomCard({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">{title}</p>
      <p className="mt-3 text-sm leading-6 text-white/84">{children}</p>
    </div>
  );
}
