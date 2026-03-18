"use client";

import Link from "next/link";
import { type ReactNode } from "react";

import { EventCard } from "@/src/components/EventCard";
import { Nav } from "@/src/components/Nav";
import { getEventById } from "@/src/data/demo";
import { useDemoState } from "@/src/lib/demo-state";

export default function MyEventsPage() {
  const { activeUserId, events, getEventCounts, joinedEventIds, roles, savedEventIds } =
    useDemoState();

  const goingEvents = events.filter((event) => joinedEventIds.includes(event.id));
  const appliedEvents = Array.from(
    new Set(
      roles
        .filter((role) =>
          role.applicants.some((entry) => entry.applicantUserId === activeUserId)
        )
        .map((role) => role.eventId)
    )
  )
    .map((eventId) => getEventById(eventId, events))
    .filter((event): event is NonNullable<typeof event> => Boolean(event));
  const savedEvents = events.filter((event) => savedEventIds.includes(event.id));

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto w-full max-w-[860px] px-4 pb-28 pt-5 sm:px-6 sm:pb-10 sm:pt-8">
        <section className="space-y-2">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">My Events</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">
            Going, applied, saved
          </h1>
        </section>

        <div className="mt-6 space-y-6">
          <SectionBlock
            emptyDescription="RSVP to an event and it will show up here."
            eyebrow="Going"
            items={goingEvents}
            renderItem={(event) => (
              <EventCard
                event={event}
                href={`/events/${event.id}`}
                joined
                key={event.id}
                openRoles={getEventCounts(event.id).open}
                primaryLabel="View ticket"
                variant="row"
              />
            )}
            title="Events you're going to"
          />

          <SectionBlock
            emptyDescription="Apply to help on an event and your status will show up here."
            eyebrow="Applied to help"
            items={appliedEvents}
            renderItem={(event) => (
              <EventCard
                applied
                event={event}
                href={`/events/${event.id}`}
                key={event.id}
                openRoles={getEventCounts(event.id).open}
                primaryLabel="Open event"
                secondaryLabel="Join room"
                variant="row"
              />
            )}
            title="Application status"
          />

          <SectionBlock
            emptyDescription="Tap the save icon on Discover to keep an event here."
            eyebrow="Saved"
            items={savedEvents}
            renderItem={(event) => (
              <EventCard
                event={event}
                href={`/events/${event.id}`}
                key={event.id}
                openRoles={getEventCounts(event.id).open}
                primaryLabel="Open event"
                variant="row"
              />
            )}
            title="Come back later"
          />

          <div className="surface-card p-5">
            <p className="text-sm font-semibold text-white">Need something new?</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                href="/explore"
              >
                Discover events
              </Link>
              <Link
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                href="/profile"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionBlock<T>({
  eyebrow,
  title,
  items,
  emptyDescription,
  renderItem
}: {
  eyebrow: string;
  title: string;
  items: T[];
  emptyDescription: string;
  renderItem: (item: T) => ReactNode;
}) {
  return (
    <section className="surface-card p-5 sm:p-6">
      <p className="text-sm uppercase tracking-[0.16em] text-app-muted">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>

      <div className="mt-5 space-y-3">
        {items.length > 0 ? (
          items.map((item) => renderItem(item))
        ) : (
          <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] p-5">
            <p className="text-sm leading-6 text-app-muted">{emptyDescription}</p>
          </div>
        )}
      </div>
    </section>
  );
}
