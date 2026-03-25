"use client";

import { useEffect, useMemo, useState } from "react";

import { CampaignCard } from "@/src/components/CampaignCard";
import { EventCard } from "@/src/components/EventCard";
import { FilterChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import { PledgeModal } from "@/src/components/PledgeModal";
import { getUserById } from "@/src/data/demo";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";
import { formatDateRange, formatTimeLabel } from "@/src/lib/utils";

type HomeFilter = "All" | "Happening" | "Soft launch";

const filters: HomeFilter[] = ["All", "Happening", "Soft launch"];

export default function ExplorePage() {
  const {
    currentUserId,
    homeCity,
    launches,
    onboarding,
    pledgeLaunch,
    preferredFandoms,
    resolveUser,
    savedEventIds,
    setMode,
    toggleSavedEvent,
    watchLaunch
  } = useAppState();
  const { events } = useDemoState();
  const [activeFilter, setActiveFilter] = useState<HomeFilter>("All");
  const [query, setQuery] = useState("");
  const [reserveLaunchId, setReserveLaunchId] = useState<string | null>(null);

  useEffect(() => {
    setMode("fan");
  }, [setMode]);

  const confirmedEvents = useMemo(() => {
    const search = query.trim().toLowerCase();
    const preferredNightTypes = onboarding.eventTypePreferences;

    return [...events]
      .sort((left, right) => {
        const leftHaystack =
          `${left.title} ${left.subtitle} ${left.fandomTags.join(" ")}`.toLowerCase();
        const rightHaystack =
          `${right.title} ${right.subtitle} ${right.fandomTags.join(" ")}`.toLowerCase();
        const leftScore =
          (left.city === homeCity ? 3 : 0) +
          left.fandomTags.filter((tag) => preferredFandoms.includes(tag)).length * 2 +
          preferredNightTypes.filter((tag) => leftHaystack.includes(tag.toLowerCase())).length;
        const rightScore =
          (right.city === homeCity ? 3 : 0) +
          right.fandomTags.filter((tag) => preferredFandoms.includes(tag)).length * 2 +
          preferredNightTypes.filter((tag) => rightHaystack.includes(tag.toLowerCase())).length;

        if (rightScore === leftScore) {
          return right.attendeesCount - left.attendeesCount;
        }

        return rightScore - leftScore;
      })
      .filter((event) => {
        const haystack =
          `${event.title} ${event.subtitle} ${event.city} ${event.fandomTags.join(" ")}`.toLowerCase();
        return search ? haystack.includes(search) : true;
      });
  }, [events, homeCity, onboarding.eventTypePreferences, preferredFandoms, query]);

  const softLaunches = useMemo(() => {
    const search = query.trim().toLowerCase();
    const preferredNightTypes = onboarding.eventTypePreferences;

    return launches
      .filter((launch) => !launch.eventId)
      .filter((launch) => {
        const haystack =
          `${launch.title} ${launch.description} ${launch.city} ${launch.fandomTags.join(" ")}`.toLowerCase();
        return search ? haystack.includes(search) : true;
      })
      .sort((left, right) => {
        const leftMomentum = left.ticketCount + left.reserveCount + left.pledges.length;
        const rightMomentum = right.ticketCount + right.reserveCount + right.pledges.length;
        const leftScore =
          (left.city === homeCity ? 3 : 0) +
          left.fandomTags.filter((tag) => preferredFandoms.includes(tag)).length * 2 +
          preferredNightTypes.filter((tag) =>
            `${left.title} ${left.description}`.toLowerCase().includes(tag.toLowerCase())
          ).length;
        const rightScore =
          (right.city === homeCity ? 3 : 0) +
          right.fandomTags.filter((tag) => preferredFandoms.includes(tag)).length * 2 +
          preferredNightTypes.filter((tag) =>
            `${right.title} ${right.description}`.toLowerCase().includes(tag.toLowerCase())
          ).length;

        if (rightScore === leftScore) {
          return rightMomentum - leftMomentum;
        }

        return rightScore - leftScore;
      });
  }, [homeCity, launches, onboarding.eventTypePreferences, preferredFandoms, query]);

  const visibleEvents =
    activeFilter === "Soft launch" ? [] : confirmedEvents;
  const visibleLaunches =
    activeFilter === "Happening" ? [] : softLaunches;
  const reserveLaunch = reserveLaunchId
    ? launches.find((launch) => launch.id === reserveLaunchId)
    : null;

  async function handleShare(path: string, title: string, text: string) {
    if (typeof window === "undefined") {
      return;
    }

    const shareUrl = `${window.location.origin}${path}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
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

      <main className="mx-auto w-full max-w-[720px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.16em] text-app-muted">{homeCity}</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">Home</h1>
            <p className="text-sm text-app-muted">Find your next night.</p>
          </div>

          <label className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-[#0d1119] px-4 py-3 text-app-muted transition focus-within:border-app-purple/45">
            <span aria-hidden="true">⌕</span>
            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-app-muted"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search nights, cities, fandoms"
              type="search"
              value={query}
            />
          </label>

          <div className="flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
            {filters.map((filter) => (
              <FilterChip
                active={activeFilter === filter}
                className="text-xs"
                key={filter}
                label={filter}
                onClick={() => setActiveFilter(filter)}
              />
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-5">
          {visibleEvents.length > 0 ? (
            <div className="space-y-4">
              {activeFilter === "All" ? (
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">
                  Happening
                </p>
              ) : null}
              {visibleEvents.map((event) => (
                (() => {
                  const host = getUserById(event.hostId);

                  return (
                    <EventCard
                      event={event}
                      hostAvatarUrl={host?.avatarUrl}
                      hostName={host?.name ?? "Host"}
                      hostSubline={
                        event.mutualsCount > 0 ? `${event.mutualsCount} friends interested` : "Hosted in your scene"
                      }
                      href={`/events/${event.id}`}
                      key={event.id}
                      metadataLine={`${formatDateRange(event.startsAt, event.endsAt)} · ${formatTimeLabel(event.startsAt)} · ${event.city}`}
                      onPrimaryAction={() => {
                        window.location.assign(`/events/${event.id}`);
                      }}
                      onShareAction={() =>
                        handleShare(`/events/${event.id}`, event.title, event.subtitle)
                      }
                      onToggleSaved={() => toggleSavedEvent(event.id)}
                      primaryLabel="View event"
                      reasonLine={event.subtitle}
                      saved={savedEventIds.includes(event.id)}
                      socialLine={`${host?.name ?? "Host"} · ${
                        event.mutualsCount > 0 ? `${event.mutualsCount} friends interested` : "Hosted in your scene"
                      }`}
                      status="confirmed"
                      variant="feed"
                    />
                  );
                })()
              ))}
            </div>
          ) : null}

          {visibleLaunches.length > 0 ? (
            <div className="space-y-4">
              {activeFilter === "All" ? (
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">
                  Soft launch
                </p>
              ) : null}
              {visibleLaunches.map((launch) => (
                (() => {
                  const host = resolveUser(launch.hostId);
                  const currentPledge = launch.pledges.find((pledge) => pledge.userId === currentUserId);

                  return (
                    <CampaignCard
                      compact
                      hostAvatarUrl={host?.avatarUrl}
                      hostName={host?.name ?? "Host"}
                      hostSubline={`${launch.pledges.length} backers`}
                      href={`/campaigns/${launch.id}`}
                      key={launch.id}
                      launch={launch}
                      metadataLine={`${launch.city} · ${launch.dateOptions.length} date options`}
                      onPrimaryAction={() => {
                        setReserveLaunchId(launch.id);
                      }}
                      onShareAction={() =>
                        handleShare(`/campaigns/${launch.id}`, launch.title, launch.softLaunchSummary)
                      }
                      onToggleSaved={() => {
                        if (!currentPledge) {
                          const firstDate = launch.dateOptions[0]?.id;
                          if (firstDate) {
                            watchLaunch(launch.id, firstDate);
                          }
                        }
                      }}
                      primaryLabel={currentPledge?.kind === "pledged" ? "Reserved" : "Reserve"}
                      reasonLine={launch.softLaunchSummary}
                      saved={Boolean(currentPledge)}
                      socialLine={`${
                        preferredFandoms.find((tag) => launch.fandomTags.includes(tag)) ?? launch.fandomTags[0]
                      } · ${launch.pledges.length} backers`}
                    />
                  );
                })()
              ))}
            </div>
          ) : null}

          {visibleEvents.length === 0 && visibleLaunches.length === 0 ? (
            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-white">No nights match that filter.</p>
              <p className="mt-2 text-sm text-app-muted">Try a broader search or switch launch state.</p>
            </div>
          ) : null}
        </section>

        {reserveLaunch ? (
          <PledgeModal
            launch={reserveLaunch}
            onClose={() => setReserveLaunchId(null)}
            onPledge={(dateOptionId) => pledgeLaunch(reserveLaunch.id, dateOptionId)}
            onWatch={(dateOptionId) => watchLaunch(reserveLaunch.id, dateOptionId)}
            open={Boolean(reserveLaunch)}
          />
        ) : null}
      </main>
    </div>
  );
}
