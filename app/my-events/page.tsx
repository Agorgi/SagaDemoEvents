"use client";

import { useMemo, useState } from "react";

import { EventCard } from "@/src/components/EventCard";
import { Nav } from "@/src/components/Nav";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";

type TabKey = "going" | "working" | "saved" | "tickets";

export default function MyEventsPage() {
  const { currentUserId, launches, mode } = useAppState();
  const { events, getEventCounts, joinedEventIds, roles, savedEventIds, toggleSavedEvent } =
    useDemoState();
  const [activeTab, setActiveTab] = useState<TabKey>(
    mode === "creator"
      ? roles.some(
          (role) =>
            role.applicants.some((entry) => entry.applicantUserId === currentUserId) ||
            role.filledByUserId === currentUserId
        )
        ? "working"
        : "going"
      : "going"
  );

  const launchByEventId = useMemo(
    () =>
      new Map(
        launches
          .filter((launch) => launch.eventId)
          .map((launch) => [launch.eventId as string, launch])
      ),
    [launches]
  );

  const going = events.filter((event) => joinedEventIds.includes(event.id));
  const working = Array.from(
    new Set(
      roles
        .filter(
          (role) =>
            role.applicants.some((entry) => entry.applicantUserId === currentUserId) ||
            role.filledByUserId === currentUserId
        )
        .map((role) => role.eventId)
    )
  )
    .map((eventId) => events.find((event) => event.id === eventId))
    .filter((event): event is NonNullable<typeof event> => Boolean(event));
  const saved = events.filter((event) => savedEventIds.includes(event.id));
  const tickets = going.filter((event) => !event.isFree);

  const sections: Record<TabKey, { title: string; items: typeof events }> = {
    going: { title: "Going", items: going },
    working: { title: "Working", items: working },
    saved: { title: "Saved", items: saved },
    tickets: { title: "Tickets", items: tickets }
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[900px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="space-y-2">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">My Events</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">
            Keep your plans and commitments in one place
          </h1>
        </section>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
          {Object.keys(sections).map((key) => (
            <button
              className={`pill ${activeTab === key ? "pill-active" : "text-app-muted hover:border-white/15 hover:text-white"}`}
              key={key}
              onClick={() => setActiveTab(key as TabKey)}
              type="button"
            >
              {sections[key as TabKey].title}
            </button>
          ))}
        </div>

        <section className="mt-6 space-y-4">
          {sections[activeTab].items.length > 0 ? (
            sections[activeTab].items.map((event) => {
              const launch = launchByEventId.get(event.id);
              const thresholdCurrent = (launch?.reserveCount ?? 0) + (launch?.ticketCount ?? 0);
              const thresholdTarget = launch?.plan.thresholdTarget ?? 24;

              return (
                <EventCard
                  event={event}
                  href={`/events/${event.id}`}
                  key={event.id}
                  mode={mode}
                  onPrimaryAction={() => {
                    window.location.assign(activeTab === "tickets" ? "/my-events" : `/events/${event.id}`);
                  }}
                  onToggleSaved={() => toggleSavedEvent(event.id)}
                  openRoles={getEventCounts(event.id).open}
                  primaryLabel={activeTab === "tickets" ? "View ticket" : "See details"}
                  reasonLine={
                    activeTab === "working"
                      ? "Open this launch to check your role status."
                      : activeTab === "saved"
                        ? "Saved so you can come back when you are ready."
                        : "You are already on the list for this launch."
                  }
                  saved={savedEventIds.includes(event.id)}
                  status={launch?.status ?? "live"}
                  thresholdCurrent={thresholdCurrent}
                  thresholdTarget={thresholdTarget}
                  variant="row"
                />
              );
            })
          ) : (
            <div className="surface-card p-5">
              <p className="text-sm leading-6 text-app-muted">Nothing here yet. Your next action will appear once you reserve, buy, apply, or save a launch.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

