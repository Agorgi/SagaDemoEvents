"use client";

import { useMemo, useState } from "react";

import { ApplyHelpModal } from "@/src/components/ApplyHelpModal";
import { FilterChip } from "@/src/components/Chips";
import { EventCard } from "@/src/components/EventCard";
import { Nav } from "@/src/components/Nav";
import { CardSkeleton } from "@/src/components/Skeletons";
import { TicketModal } from "@/src/components/TicketModal";
import { getEventById, getUserById } from "@/src/data/demo";
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

type DiscoverFilter = (typeof filters)[number] | "All";

function matchesFilter(filter: DiscoverFilter, eventText: string, city: string, userCity?: string) {
  if (filter === "All" || filter === "This week") {
    return true;
  }
  if (filter === "Nearby") {
    return city === userCity || city.endsWith("CA");
  }
  if (filter === "Anime") {
    return /anime|jujutsu|digimon|one piece|genshin|love and deepspace/i.test(eventText);
  }
  if (filter === "Cosplay") {
    return /cosplay|drawing|guest|wig|portrait/i.test(eventText);
  }
  if (filter === "Gaming") {
    return /gaming|genshin|digimon|rivals/i.test(eventText);
  }
  if (filter === "Mixers") {
    return /mixer|social|night out|meetup/i.test(eventText);
  }
  return /workshop|drawing|creator|hunt/i.test(eventText);
}

export default function ExplorePage() {
  const {
    activeUserId,
    events,
    getEventCounts,
    joinedEventIds,
    roles,
    savedEventIds,
    toggleSavedEvent
  } = useDemoState();
  const activeUser = getUserById(activeUserId);
  const [activeFilter, setActiveFilter] = useState<DiscoverFilter>("All");
  const [query, setQuery] = useState("");
  const [ticketEventId, setTicketEventId] = useState<string | null>(null);
  const [applyEventId, setApplyEventId] = useState<string | null>(null);

  const sortedEvents = useMemo(
    () => [...events].sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt)),
    [events]
  );

  const appliedEventIds = useMemo(
    () =>
      Array.from(
        new Set(
          roles
            .filter((role) =>
              role.applicants.some((entry) => entry.applicantUserId === activeUserId)
            )
            .map((role) => role.eventId)
        )
      ),
    [activeUserId, roles]
  );

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sortedEvents.filter((event) => {
      const haystack =
        `${event.title} ${event.subtitle} ${event.description} ${event.fandomTags.join(" ")} ${event.city} ${event.venue} ${getUserById(event.hostId)?.name ?? ""}`.toLowerCase();

      const matchesSearch =
        normalizedQuery.length === 0 ? true : haystack.includes(normalizedQuery);
      const matchesChip = matchesFilter(activeFilter, haystack, event.city, activeUser?.city);
      return matchesSearch && matchesChip;
    });
  }, [activeFilter, activeUser?.city, query, sortedEvents]);

  const featuredEvent =
    filteredEvents.find((event) => event.featured || event.discoverFeatured) ?? filteredEvents[0];
  const remainingEvents = featuredEvent
    ? filteredEvents.filter((event) => event.id !== featuredEvent.id)
    : filteredEvents;
  const selectedTicketEvent = ticketEventId ? getEventById(ticketEventId, events) ?? null : null;
  const selectedApplyEvent = applyEventId ? getEventById(applyEventId, events) ?? null : null;

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto w-full max-w-[860px] px-4 pb-28 pt-5 sm:px-6 sm:pb-10 sm:pt-8">
        <section className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-app-muted">
              {activeUser?.city ?? "Los Angeles, CA"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
              Fandom events worth showing up for
            </h1>
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

          <div className="flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
            <FilterChip
              active={activeFilter === "All"}
              label="All"
              onClick={() => setActiveFilter("All")}
            />
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

        <section className="mt-6 space-y-5">
          {!featuredEvent ? (
            <div className="grid gap-4">
              <CardSkeleton className="min-h-[360px]" />
              <CardSkeleton className="min-h-[240px]" />
            </div>
          ) : (
            <>
              <EventCard
                applied={appliedEventIds.includes(featuredEvent.id)}
                event={featuredEvent}
                href={`/events/${featuredEvent.id}`}
                joined={joinedEventIds.includes(featuredEvent.id)}
                onPrimaryAction={(event) => setTicketEventId(event.id)}
                onSecondaryAction={
                  getEventCounts(featuredEvent.id).open > 0
                    ? (event) => setApplyEventId(event.id)
                    : undefined
                }
                onToggleSaved={(event) => toggleSavedEvent(event.id)}
                openRoles={getEventCounts(featuredEvent.id).open}
                primaryLabel={
                  joinedEventIds.includes(featuredEvent.id)
                    ? "View ticket"
                    : featuredEvent.isFree
                      ? "RSVP"
                      : "Get ticket"
                }
                saved={savedEventIds.includes(featuredEvent.id)}
                variant="hero"
              />

              <div className="grid gap-4">
                {remainingEvents.map((event) => (
                  <EventCard
                    applied={appliedEventIds.includes(event.id)}
                    event={event}
                    href={`/events/${event.id}`}
                    joined={joinedEventIds.includes(event.id)}
                    key={event.id}
                    onPrimaryAction={() => setTicketEventId(event.id)}
                    onSecondaryAction={
                      getEventCounts(event.id).open > 0
                        ? () => setApplyEventId(event.id)
                        : undefined
                    }
                    onToggleSaved={() => toggleSavedEvent(event.id)}
                    openRoles={getEventCounts(event.id).open}
                    primaryLabel={
                      joinedEventIds.includes(event.id)
                        ? "View ticket"
                        : event.isFree
                          ? "RSVP"
                          : "Get ticket"
                    }
                    saved={savedEventIds.includes(event.id)}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <TicketModal
        event={selectedTicketEvent}
        onClose={() => setTicketEventId(null)}
        open={Boolean(selectedTicketEvent)}
      />

      {selectedApplyEvent ? (
        <ApplyHelpModal
          event={selectedApplyEvent}
          onClose={() => setApplyEventId(null)}
          open={Boolean(selectedApplyEvent)}
          roles={roles.filter((role) => role.eventId === selectedApplyEvent.id)}
        />
      ) : null}
    </div>
  );
}
