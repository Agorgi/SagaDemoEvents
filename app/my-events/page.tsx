"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { CampaignCard } from "@/src/components/CampaignCard";
import { EventCard } from "@/src/components/EventCard";
import { FilterChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import { getOpportunityById } from "@/src/data/economy";
import { getUserById } from "@/src/data/demo";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";
import { formatDateRange, formatTimeLabel } from "@/src/lib/utils";

type PlansTab = "going" | "pledged" | "saved" | "applied";
type AppliedItem = {
  id: string;
  kind: "event" | "opportunity";
  title: string;
  subtitle: string;
  href: string;
};

const tabs: Array<{ label: string; value: PlansTab }> = [
  { label: "Going", value: "going" },
  { label: "Reserved", value: "pledged" },
  { label: "Saved", value: "saved" },
  { label: "Applied", value: "applied" }
];

export default function MyEventsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app-bg" />}>
      <PlansPageContent />
    </Suspense>
  );
}

function PlansPageContent() {
  const searchParams = useSearchParams();
  const {
    currentUserId,
    goingEventIds,
    interestedEventIds,
    launches,
    opportunityApplications,
    savedEventIds,
    toggleSavedEvent
  } = useAppState();
  const { events, roles } = useDemoState();

  const [activeTab, setActiveTab] = useState<PlansTab>(
    (searchParams.get("tab") as PlansTab | null) ?? "going"
  );

  const helpingEventIds = Array.from(
    new Set(
      roles
        .filter(
          (role) =>
            role.filledByUserId === currentUserId ||
            role.applicants.some((entry) => entry.applicantUserId === currentUserId)
        )
        .map((role) => role.eventId)
    )
  );

  const goingEvents = events.filter((event) => goingEventIds.includes(event.id));
  const savedEvents = events.filter((event) => savedEventIds.includes(event.id));
  const pledgedLaunches = launches.filter((launch) =>
    launch.pledges.some(
      (pledge) => pledge.userId === currentUserId && (pledge.kind === "pledged" || pledge.kind === "watching")
    )
  );
  const appliedEventItems: AppliedItem[] = events
    .filter((event) => helpingEventIds.includes(event.id))
    .map((event) => ({
      id: `event-${event.id}`,
      kind: "event",
      title: event.title,
      subtitle: "Role application in progress",
      href: `/events/${event.id}`
    }));

  const appliedOpportunityItems: AppliedItem[] = opportunityApplications
    .filter((application) => application.userId === currentUserId)
    .flatMap((application) => {
      const opportunity = getOpportunityById(application.opportunityId);
      return opportunity
        ? [
            {
              id: `opportunity-${application.id}`,
              kind: "opportunity" as const,
              title: opportunity.title,
              subtitle: application.status,
              href: `/opportunities/${opportunity.id}`
            }
          ]
        : [];
    });

  const appliedItems: AppliedItem[] = [...appliedEventItems, ...appliedOpportunityItems];

  const counts = useMemo(
    () => ({
      going: goingEvents.length,
      pledged: pledgedLaunches.length + interestedEventIds.length,
      saved: savedEvents.length,
      applied: appliedItems.length
    }),
    [appliedItems.length, goingEvents.length, interestedEventIds.length, pledgedLaunches.length, savedEvents.length]
  );

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="space-y-2">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Plans</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Plans</h1>
          <p className="text-sm text-app-muted">Saved, reserved, and going.</p>
        </section>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
          {tabs.map((tab) => (
            <FilterChip
              active={activeTab === tab.value}
              key={tab.value}
              label={`${tab.label}${counts[tab.value] ? ` · ${counts[tab.value]}` : ""}`}
              onClick={() => setActiveTab(tab.value)}
            />
          ))}
        </div>

        <section className="mt-6 space-y-4">
          {activeTab === "going"
            ? goingEvents.map((event) => {
                const host = getUserById(event.hostId);
                return (
                  <EventCard
                    event={event}
                    href={`/events/${event.id}`}
                    key={event.id}
                    metadataLine={`${formatDateRange(event.startsAt, event.endsAt)} · ${formatTimeLabel(event.startsAt)} · ${event.city}`}
                    onPrimaryAction={() => window.location.assign(`/events/${event.id}`)}
                    onToggleSaved={() => toggleSavedEvent(event.id)}
                    primaryLabel="View event"
                    reasonLine={event.subtitle}
                    saved={savedEventIds.includes(event.id)}
                    socialLine={`${host?.name ?? "Host"} · You’re going`}
                    status="confirmed"
                    variant="feed"
                  />
                );
              })
            : null}

          {activeTab === "pledged"
            ? pledgedLaunches.map((launch) => (
                <CampaignCard
                  compact
                  href={launch.eventId ? `/events/${launch.eventId}` : `/campaigns/${launch.id}`}
                  key={launch.id}
                  launch={launch}
                  metadataLine={launch.eventId ? `${launch.city} · confirmed` : `${launch.city} · ${launch.dateOptions.length} date options`}
                  onPrimaryAction={() =>
                    window.location.assign(launch.eventId ? `/events/${launch.eventId}` : `/campaigns/${launch.id}`)
                  }
                  primaryLabel={launch.eventId ? "View event" : "View launch"}
                  reasonLine={launch.eventId ? "You backed this before it confirmed." : "You’re tracking this launch."}
                  socialLine={`${launch.pledges.length} people in`}
                />
              ))
            : null}

          {activeTab === "saved"
            ? savedEvents.map((event) => {
                const host = getUserById(event.hostId);
                return (
                  <EventCard
                    event={event}
                    href={`/events/${event.id}`}
                    key={event.id}
                    metadataLine={`${formatDateRange(event.startsAt, event.endsAt)} · ${formatTimeLabel(event.startsAt)} · ${event.city}`}
                    onPrimaryAction={() => window.location.assign(`/events/${event.id}`)}
                    onToggleSaved={() => toggleSavedEvent(event.id)}
                    primaryLabel="View event"
                    reasonLine={event.subtitle}
                    saved={savedEventIds.includes(event.id)}
                    socialLine={`${host?.name ?? "Host"} · Saved for later`}
                    status="confirmed"
                    variant="feed"
                  />
                );
              })
            : null}

          {activeTab === "applied"
            ? appliedItems.map((item) => (
                <a
                  className="surface-card block p-4 transition hover:border-white/12"
                  href={item.href}
                  key={item.id}
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-app-muted">{item.subtitle}</p>
                </a>
              ))
            : null}

          {((activeTab === "going" && goingEvents.length === 0) ||
            (activeTab === "pledged" && pledgedLaunches.length === 0) ||
            (activeTab === "saved" && savedEvents.length === 0) ||
            (activeTab === "applied" && appliedItems.length === 0)) ? (
            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-white">Nothing here yet.</p>
              <p className="mt-2 text-sm text-app-muted">When you save, reserve, or apply, it lands here.</p>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
