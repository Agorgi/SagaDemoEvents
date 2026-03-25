"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Nav } from "@/src/components/Nav";
import { ExpandableText } from "@/src/components/ExpandableText";
import { getCommunityById, getEventById } from "@/src/data/demo";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";
import { formatDateRange, formatTimeLabel } from "@/src/lib/utils";

const tabs = ["Updates", "Chat"] as const;
type RoomTab = (typeof tabs)[number];

export default function CommunityDetailPage() {
  const params = useParams<{ communityId: string }>();
  const { currentUserId, goingEventIds } = useAppState();
  const { commissions, events, roles } = useDemoState();
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
        <main className="mx-auto max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pb-10 sm:pt-8">
          <section className="surface-card-strong p-6 sm:p-8">
            <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Series room</p>
            <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">{legacyRoom.title}</h1>
            <div className="mt-4 max-w-[54ch]">
              <ExpandableText collapsedLines={3} text={legacyRoom.description} />
            </div>
          </section>
        </main>
      </div>
    );
  }

  const roomEvent = event as NonNullable<typeof event>;
  const eventRoles = roles.filter((role) => role.eventId === roomEvent.id);
  const relatedCommission = commissions.find((commission) => commission.linkedEventId === roomEvent.id);
  const hasApplied = eventRoles.some((role) =>
    role.applicants.some((entry) => entry.applicantUserId === currentUserId)
  );
  const isUnlocked =
    goingEventIds.includes(roomEvent.id) || hasApplied || roomEvent.hostId === currentUserId;

  const updates = [
    `${roomEvent.title} is live.`,
    `${formatDateRange(roomEvent.startsAt, roomEvent.endsAt)} · ${formatTimeLabel(roomEvent.startsAt)}`,
    `${roomEvent.venue}, ${roomEvent.city}`,
    `${roomEvent.mutualsCount} mutuals are talking about this one.`,
    ...(relatedCommission ? [relatedCommission.activity[0]?.text].filter(Boolean) : [])
  ];

  const chat = [
    "Solo arrivals are welcome.",
    "Theme fits are welcome, casual works too.",
    "Hosts will post timing changes here first.",
    "If you are arriving late, this room is where the meetup point will update."
  ];

  if (!isUnlocked) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-[720px] px-4 pb-28 pt-5 sm:px-6 sm:pb-10 sm:pt-8">
          <section className="surface-card-strong p-6 sm:p-8">
            <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Room locked</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">{roomEvent.title}</h1>
            <p className="mt-3 text-sm text-app-muted">Reserve a spot or join the team to unlock updates and room chat.</p>
            <div className="mt-5">
              <Link
                className="inline-flex rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
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
      <main className="mx-auto max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pb-10 sm:pt-8">
        <section className="surface-card-strong p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Event room</p>
              <h1 className="mt-3 text-4xl font-semibold text-white">{roomEvent.title}</h1>
              <p className="mt-2 text-sm text-app-muted">Updates, meetup notes, and live room chatter.</p>
            </div>
            <Link
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
              href={`/events/${roomEvent.id}`}
            >
              Event
            </Link>
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

        <section className="mt-6 space-y-3">
          {(activeTab === "Updates" ? updates : chat).map((item, index) => (
            <div className="surface-card p-4" key={`${activeTab}-${index}`}>
              <p className="text-sm text-white/84">{item}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
