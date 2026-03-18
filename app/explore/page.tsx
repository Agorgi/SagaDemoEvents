"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { EventCard } from "@/src/components/EventCard";
import { FilterChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import { RoleApplicationPanel } from "@/src/components/RoleApplicationPanel";
import { type UserMode } from "@/src/data/launches";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";

const filters = [
  "This week",
  "Nearby",
  "Anime",
  "Cosplay",
  "Gaming",
  "Mixers",
  "Workshops"
] as const;

type ExploreFilter = (typeof filters)[number] | "All";

function matchesFilter(filter: ExploreFilter, haystack: string, city: string, userCity?: string) {
  if (filter === "All") {
    return true;
  }
  if (filter === "This week") {
    return true;
  }
  if (filter === "Nearby") {
    return city === userCity || city.endsWith("CA");
  }
  return haystack.toLowerCase().includes(filter.toLowerCase().replace(/\s+/g, " "));
}

function pageCopy(mode: UserMode) {
  if (mode === "creator") {
    return {
      title: "Find your next role",
      subtitle: "Openings worth saying yes to."
    };
  }
  if (mode === "host") {
    return {
      title: "See what’s live",
      subtitle: "Benchmark what is working before you launch."
    };
  }
  return {
    title: "Find your next event",
    subtitle: "The best fandom launches near you."
  };
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app-bg" />}>
      <ExplorePageContent />
    </Suspense>
  );
}

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { bookEvent, currentUser, currentUserId, launches, mode } = useAppState();
  const { events, getEventCounts, joinedEventIds, roles, savedEventIds, toggleSavedEvent } =
    useDemoState();
  const [activeFilter, setActiveFilter] = useState<ExploreFilter>("All");
  const [query, setQuery] = useState("");
  const [applyEventId, setApplyEventId] = useState<string | null>(null);
  const initialView =
    (searchParams.get("view") as "events" | "openings" | null) ??
    (mode === "creator" ? "openings" : "events");
  const [view, setView] = useState<"events" | "openings">(initialView);

  const launchByEventId = useMemo(
    () =>
      new Map(
        launches
          .filter((launch) => launch.eventId)
          .map((launch) => [launch.eventId as string, launch])
      ),
    [launches]
  );

  const appliedEventIds = useMemo(
    () =>
      Array.from(
        new Set(
          roles
            .filter((role) =>
              role.applicants.some((entry) => entry.applicantUserId === currentUserId)
            )
            .map((role) => role.eventId)
        )
      ),
    [currentUserId, roles]
  );

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...events]
      .sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt))
      .filter((event) => {
        const haystack =
          `${event.title} ${event.subtitle} ${event.description} ${event.fandomTags.join(" ")} ${event.city} ${event.venue}`.toLowerCase();
        const hasOpenRoles = getEventCounts(event.id).open > 0;
        const matchesSearch =
          normalizedQuery.length === 0 ? true : haystack.includes(normalizedQuery);
        const matchesChip = matchesFilter(activeFilter, haystack, event.city, currentUser.city);
        const matchesView = view === "events" ? true : hasOpenRoles;
        return matchesSearch && matchesChip && matchesView;
      });
  }, [activeFilter, currentUser.city, events, getEventCounts, query, view]);

  const recommended = filteredEvents.slice(0, 4);
  const almostThere = filteredEvents.filter((event) => {
    const launch = launchByEventId.get(event.id);
    if (!launch) {
      return false;
    }
    const progress = (launch.reserveCount + launch.ticketCount) / Math.max(launch.plan.thresholdTarget, 1);
    return progress >= 0.75 && progress < 1;
  });
  const needsTeam = filteredEvents.filter((event) => getEventCounts(event.id).open > 0);
  const nearby = filteredEvents.filter((event) => event.city === currentUser.city);
  const basedOnFandoms = filteredEvents.filter((event) =>
    event.fandomTags.some((tag) => currentUser.fandomTags.includes(tag))
  );
  const selectedApplyEvent =
    applyEventId ? events.find((event) => event.id === applyEventId) ?? null : null;

  function getPrimaryLabel(eventId: string, isFree?: boolean) {
    const launch = launchByEventId.get(eventId);
    const thresholdCurrent = (launch?.reserveCount ?? 0) + (launch?.ticketCount ?? 0);
    const thresholdTarget = launch?.plan.thresholdTarget ?? 1;

    if (mode === "creator") {
      return appliedEventIds.includes(eventId) ? "View status" : "Join team";
    }
    if (mode === "host") {
      return launch?.hostId === "user-zo" ? "Open workspace" : "See details";
    }
    if (joinedEventIds.includes(eventId)) {
      return "View ticket";
    }
    if (thresholdCurrent < thresholdTarget) {
      return "Reserve spot";
    }
    return isFree ? "Reserve spot" : "Get ticket";
  }

  function reasonLineFor(eventId: string, title: string) {
    const launch = launchByEventId.get(eventId);
    const openRoles = getEventCounts(eventId).open;

    if (mode === "creator") {
      return openRoles > 0
        ? `${openRoles} openings still need a strong fit.`
        : `This launch already has its team locked.`;
    }
    if (mode === "host") {
      return launch
        ? `${launch.reserveCount + launch.ticketCount} demand actions logged so far.`
        : `A useful benchmark for ${title}.`;
    }
    return launch?.plan.turnoutOutlook ?? "This launch is building momentum.";
  }

  function statusFor(eventId: string) {
    const launch = launchByEventId.get(eventId);
    if (!launch) {
      return "live" as const;
    }
    const thresholdCurrent = launch.reserveCount + launch.ticketCount;
    if (launch.status !== "completed" && thresholdCurrent >= launch.plan.thresholdTarget * 0.85) {
      return "almost-there" as const;
    }
    return launch.status;
  }

  function renderEventCard(event: (typeof events)[number], featured = false) {
    const launch = launchByEventId.get(event.id);
    const thresholdCurrent = (launch?.reserveCount ?? 0) + (launch?.ticketCount ?? 0);
    const thresholdTarget = launch?.plan.thresholdTarget ?? Math.max(20, Math.round(event.attendeesCount * 0.07));
    const primaryLabel = getPrimaryLabel(event.id, event.isFree);
    const openRoles = getEventCounts(event.id).open;

    return (
      <EventCard
        className={featured ? "" : ""}
        event={event}
        href={`/events/${event.id}`}
        key={event.id}
        mode={mode}
        onPrimaryAction={() => {
          if (mode === "creator") {
            if (primaryLabel === "View status") {
              router.push("/my-events");
              return;
            }
            setApplyEventId(event.id);
            return;
          }
          if (mode === "host") {
            const launchMatch = launches.find((item) => item.eventId === event.id && item.hostId === "user-zo");
            router.push(launchMatch ? `/studio/${launchMatch.id}` : `/events/${event.id}`);
            return;
          }
          if (primaryLabel === "View ticket") {
            router.push("/my-events");
            return;
          }
          const launchItem = launchByEventId.get(event.id);
          const thresholdMet =
            (launchItem?.reserveCount ?? 0) + (launchItem?.ticketCount ?? 0) >=
            (launchItem?.plan.thresholdTarget ?? 1);
          bookEvent(event.id, thresholdMet ? "ticket" : "reserve");
        }}
        onSecondaryAction={() => router.push(`/events/${event.id}`)}
        onToggleSaved={() => toggleSavedEvent(event.id)}
        openRoles={openRoles}
        primaryLabel={primaryLabel}
        reasonLine={reasonLineFor(event.id, event.title)}
        saved={savedEventIds.includes(event.id)}
        secondaryLabel="See details"
        status={statusFor(event.id)}
        thresholdCurrent={thresholdCurrent}
        thresholdTarget={thresholdTarget}
        variant={featured ? "featured" : "stacked"}
      />
    );
  }

  const copy = pageCopy(mode);

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto w-full max-w-[960px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-app-muted">{currentUser.city}</p>
              <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">{copy.title}</h1>
              <p className="mt-2 text-sm text-app-muted">{copy.subtitle}</p>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-[#0d1119] px-4 py-3 text-app-muted transition focus-within:border-app-purple/45">
            <span aria-hidden="true">⌕</span>
            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-app-muted"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search events, fandoms, hosts"
              type="search"
              value={query}
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className={`pill ${view === "events" ? "pill-active" : "text-app-muted hover:border-white/15 hover:text-white"}`}
              onClick={() => setView("events")}
              type="button"
            >
              Events
            </button>
            <button
              className={`pill ${view === "openings" ? "pill-active" : "text-app-muted hover:border-white/15 hover:text-white"}`}
              onClick={() => setView("openings")}
              type="button"
            >
              Team openings
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
            <FilterChip active={activeFilter === "All"} label="All" onClick={() => setActiveFilter("All")} />
            {filters.map((filter) => (
              <FilterChip
                active={activeFilter === filter}
                key={filter}
                label={filter}
                onClick={() => setActiveFilter(filter)}
              />
            ))}
          </div>
        </section>

        <Section title="Recommended">
          {recommended.slice(0, 1).map((event) => renderEventCard(event, true))}
        </Section>

        <Section title="Almost there">
          {almostThere.length > 0 ? almostThere.slice(0, 2).map((event) => renderEventCard(event)) : <Empty text="Nothing is close to unlocking right now." />}
        </Section>

        <Section title="Needs team">
          {needsTeam.length > 0 ? needsTeam.slice(0, 3).map((event) => renderEventCard(event)) : <Empty text="Current launches already have the team they need." />}
        </Section>

        <Section title="This week nearby">
          {nearby.length > 0 ? nearby.slice(0, 3).map((event) => renderEventCard(event)) : <Empty text="No nearby launches matched your filters." />}
        </Section>

        <Section title="Based on your fandoms">
          {basedOnFandoms.length > 0 ? basedOnFandoms.slice(0, 3).map((event) => renderEventCard(event)) : <Empty text="Pick a few more fandoms in your profile and this will sharpen fast." />}
        </Section>
      </main>

      {selectedApplyEvent ? (
        <RoleApplicationPanel
          eventId={selectedApplyEvent.id}
          onClose={() => setApplyEventId(null)}
          open={Boolean(selectedApplyEvent)}
          roles={roles.filter((role) => role.eventId === selectedApplyEvent.id)}
        />
      ) : null}
    </div>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 space-y-4">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="surface-card p-5">
      <p className="text-sm leading-6 text-app-muted">{text}</p>
    </div>
  );
}
