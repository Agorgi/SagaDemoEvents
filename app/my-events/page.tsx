"use client";

import { useMemo, useState } from "react";

import { CampaignCard } from "@/src/components/CampaignCard";
import { EventCard } from "@/src/components/EventCard";
import { Nav } from "@/src/components/Nav";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";

type PlansTab = "going" | "interested" | "saved" | "helping";

const tabs: Array<{ label: string; value: PlansTab }> = [
  { label: "Going", value: "going" },
  { label: "Interested", value: "interested" },
  { label: "Saved", value: "saved" },
  { label: "Helping", value: "helping" }
];

export default function MyEventsPage() {
  const {
    currentUserId,
    goingEventIds,
    interestedEventIds,
    launches,
    mode,
    savedEventIds,
    toggleSavedEvent
  } = useAppState();
  const { events, getEventCounts, roles } = useDemoState();
  const [activeTab, setActiveTab] = useState<PlansTab>(
    mode === "creator" ? "helping" : "going"
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

  const helpingIds = Array.from(
    new Set(
      roles
        .filter(
          (role) =>
            role.applicants.some((entry) => entry.applicantUserId === currentUserId) ||
            role.filledByUserId === currentUserId
        )
        .map((role) => role.eventId)
    )
  );

  const watchedLaunches = launches.filter((launch) =>
    launch.pledges.some(
      (pledge) => pledge.userId === currentUserId && pledge.kind === "watching"
    )
  );
  const pledgedLaunches = launches.filter((launch) =>
    launch.pledges.some(
      (pledge) => pledge.userId === currentUserId && pledge.kind === "pledged"
    )
  );
  const confirmedLaunches = pledgedLaunches.filter((launch) => launch.eventId);
  const pendingLaunches = pledgedLaunches.filter((launch) => !launch.eventId);

  const sections: Record<
    PlansTab,
    {
      title: string;
      items: typeof events;
      campaigns: typeof launches;
      reason: string;
    }
  > = {
    going: {
      title: "Going",
      items: events.filter((event) => goingEventIds.includes(event.id)),
      campaigns: confirmedLaunches,
      reason: "You are already committed to this one."
    },
    interested: {
      title: "Interested",
      items: events.filter((event) => interestedEventIds.includes(event.id)),
      campaigns: [...pendingLaunches, ...watchedLaunches.filter((launch) => !pendingLaunches.includes(launch))],
      reason: "Still deciding, but the signal is strong enough to keep it close."
    },
    saved: {
      title: "Saved",
      items: events.filter((event) => savedEventIds.includes(event.id)),
      campaigns: [],
      reason: "Pinned for later when you want to check details again."
    },
    helping: {
      title: "Helping",
      items: events.filter((event) => helpingIds.includes(event.id)),
      campaigns: [],
      reason: "You have a role in motion here."
    }
  };

  const currentSection = sections[activeTab];

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[960px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="space-y-2">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Plans</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Your plans</h1>
          <p className="text-sm text-app-muted">Everything you saved, circled, or committed to.</p>
        </section>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
          {tabs.map((tab) => (
            <button
              className={`pill ${activeTab === tab.value ? "pill-active" : "text-app-muted hover:border-white/15 hover:text-white"}`}
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="mt-6 space-y-4">
          {currentSection.campaigns.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.14em] text-app-muted">Soft launches</p>
              {currentSection.campaigns.map((launch) => (
                <CampaignCard
                  compact
                  href={launch.eventId ? `/events/${launch.eventId}` : `/campaigns/${launch.id}`}
                  key={launch.id}
                  launch={launch}
                  mode={mode}
                  onPrimaryAction={() =>
                    window.location.assign(launch.eventId ? `/events/${launch.eventId}` : `/campaigns/${launch.id}`)
                  }
                  primaryLabel={
                    launch.eventId
                      ? "Open event"
                      : launch.pledges.some(
                            (pledge) => pledge.userId === currentUserId && pledge.kind === "pledged"
                          )
                        ? "Track launch"
                        : "Watch launch"
                  }
                  reasonLine={
                    launch.eventId
                      ? "Confirmed from the soft launch you backed."
                      : launch.pledges.some(
                            (pledge) => pledge.userId === currentUserId && pledge.kind === "pledged"
                          )
                        ? "You pledged early and picked a date."
                        : "You are watching this launch."
                  }
                />
              ))}
            </div>
          ) : null}

          {currentSection.items.length > 0 ? (
            currentSection.items.map((event) => {
              const launch = launchByEventId.get(event.id);
              const thresholdCurrent = (launch?.reserveCount ?? 0) + (launch?.ticketCount ?? 0);
              const thresholdTarget =
                launch?.plan.thresholdTarget ?? Math.max(24, Math.round(event.attendeesCount * 0.07));

              return (
                <EventCard
                  event={event}
                  href={`/events/${event.id}`}
                  key={event.id}
                  mode={mode}
                  onPrimaryAction={() => window.location.assign(`/events/${event.id}`)}
                  onToggleSaved={() => toggleSavedEvent(event.id)}
                  openRoles={getEventCounts(event.id).open}
                  primaryLabel={activeTab === "going" ? "Open event" : activeTab === "helping" ? "Check status" : "See event"}
                  reasonLine={currentSection.reason}
                  saved={savedEventIds.includes(event.id)}
                  socialLine={activeTab === "helping" ? "Role flow attached" : undefined}
                  status={launch?.status ?? "live"}
                  thresholdCurrent={thresholdCurrent}
                  thresholdTarget={thresholdTarget}
                  variant="row"
                />
              );
            })
          ) : (
            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-white">Nothing here yet.</p>
              <p className="mt-2 text-sm text-app-muted">
                Start exploring events and people to build your list.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
