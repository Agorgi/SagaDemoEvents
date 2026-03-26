"use client";

import { useEffect, useMemo, useState } from "react";

import { Nav } from "@/src/components/Nav";
import { PledgeModal } from "@/src/components/PledgeModal";
import { EXPLORE_GENRES, type EventContentFilter, type HomeMode } from "@/src/features/explore/data";
import {
  CreatorSectionRow,
  EventContentFilters,
  FriendInterestCard,
  GenreBrowseButton,
  GenreBrowseStack,
  HomeEventRailCard,
  HomeHeader,
  HomeSearchBar,
  HorizontalRail,
  SectionHeader,
  SoftLaunchRailCard,
  TopModeChips
} from "@/src/features/explore/components";
import {
  buildBecauseYouLikeEvents,
  buildCreatorsModeContent,
  buildCreatorsOfWeek,
  buildEventsModeContent,
  buildFriendsGoingEvents,
  buildGenreRailSummaries,
  buildGenreMatches,
  buildSoftLaunchRails,
  getTopInterest,
  getUserFirstName
} from "@/src/features/explore/selectors";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";
import { formatDateRange } from "@/src/lib/utils";

function isHomeMode(value: string | null): value is HomeMode {
  return value === "for_you" || value === "events" || value === "creators" || value === "genres";
}

function isEventFilter(value: string | null): value is EventContentFilter {
  return value === "all" || value === "happening" || value === "soft_launch" || value === "nearby";
}

function readExploreRouteState() {
  if (typeof window === "undefined") {
    return {
      mode: "for_you" as HomeMode,
      filter: "all" as EventContentFilter,
      genreId: null as string | null
    };
  }

  const params = new URLSearchParams(window.location.search);
  const modeParam = params.get("mode");
  const filterParam = params.get("filter");
  const genreParam = params.get("genre");

  return {
    mode: isHomeMode(modeParam) ? modeParam : genreParam ? ("genres" as HomeMode) : ("for_you" as HomeMode),
    filter: isEventFilter(filterParam) ? filterParam : ("all" as EventContentFilter),
    genreId: genreParam
  };
}

function buildExploreHref({
  mode,
  filter,
  genreId
}: {
  mode: HomeMode;
  filter: EventContentFilter;
  genreId: string | null;
}) {
  const params = new URLSearchParams();

  if (mode !== "for_you") {
    params.set("mode", mode);
  }

  if (mode === "events" && filter !== "all") {
    params.set("filter", filter);
  }

  if (mode === "genres" && genreId) {
    params.set("genre", genreId);
  }

  const query = params.toString();
  return query ? `/explore?${query}` : "/explore";
}

export default function ExplorePage() {
  const {
    creatorProfiles,
    currentUser,
    followingIds,
    homeCity,
    launches,
    pledgeLaunch,
    preferredFandoms,
    savedEventIds,
    setMode,
    socialActivity,
    toggleSavedEvent,
    watchLaunch,
    users
  } = useAppState();
  const { events } = useDemoState();
  const [activeMode, setActiveMode] = useState<HomeMode>("for_you");
  const [eventFilter, setEventFilter] = useState<EventContentFilter>("all");
  const [query, setQuery] = useState("");
  const [activeGenreId, setActiveGenreId] = useState<string | null>(null);
  const [reserveLaunchId, setReserveLaunchId] = useState<string | null>(null);

  useEffect(() => {
    setMode("fan");
  }, [setMode]);

  useEffect(() => {
    const applyRouteState = () => {
      const routeState = readExploreRouteState();
      setActiveMode(routeState.mode);
      setEventFilter(routeState.filter);
      setActiveGenreId(routeState.genreId);
    };

    applyRouteState();
    window.addEventListener("popstate", applyRouteState);

    return () => window.removeEventListener("popstate", applyRouteState);
  }, []);

  function setExploreRoute({
    mode,
    filter,
    genreId
  }: {
    mode?: HomeMode;
    filter?: EventContentFilter;
    genreId?: string | null;
  }) {
    const nextMode = mode ?? activeMode;
    const nextFilter = nextMode === "events" ? filter ?? eventFilter : "all";
    const nextGenreId =
      nextMode === "genres" ? (genreId === undefined ? activeGenreId : genreId) : null;

    setActiveMode(nextMode);
    setEventFilter(nextFilter);
    setActiveGenreId(nextGenreId);

    if (typeof window !== "undefined") {
      window.history.pushState(
        {},
        "",
        buildExploreHref({
          mode: nextMode,
          filter: nextFilter,
          genreId: nextGenreId
        })
      );
    }
  }

  const topInterest = useMemo(() => getTopInterest(preferredFandoms), [preferredFandoms]);
  const browseGenres = useMemo(() => {
    const search = query.trim().toLowerCase();

    return EXPLORE_GENRES.filter((genre) => {
      const haystack = `${genre.label} ${genre.description} ${genre.matchTags.join(" ")}`.toLowerCase();
      return search ? haystack.includes(search) : true;
    });
  }, [query]);
  const selectedGenre =
    browseGenres.find((genre) => genre.id === activeGenreId) ??
    EXPLORE_GENRES.find((genre) => genre.id === activeGenreId) ??
    null;
  const genreSummaries = useMemo(
    () =>
      buildGenreRailSummaries({
        genres: EXPLORE_GENRES,
        events,
        launches
      }),
    [events, launches]
  );
  const becauseYouLikeEvents = useMemo(
    () =>
      buildBecauseYouLikeEvents({
        events,
        homeCity,
        preferredFandoms,
        topInterest,
        query
      }).slice(0, 8),
    [events, homeCity, preferredFandoms, query, topInterest]
  );
  const friendEvents = useMemo(
    () =>
      buildFriendsGoingEvents({
        events,
        socialActivity,
        users,
        followingIds,
        query
      }),
    [events, followingIds, query, socialActivity, users]
  );
  const softLaunchRails = useMemo(
    () =>
      buildSoftLaunchRails({
        launches,
        homeCity,
        preferredFandoms,
        topInterest,
        query,
        genres: EXPLORE_GENRES
      }),
    [homeCity, launches, preferredFandoms, query, topInterest]
  );
  const creatorSpotlights = useMemo(
    () =>
      buildCreatorsOfWeek({
        creatorProfiles,
        users,
        homeCity,
        preferredFandoms,
        query
      }),
    [creatorProfiles, homeCity, preferredFandoms, query, users]
  );
  const creatorsModeContent = useMemo(
    () =>
      buildCreatorsModeContent({
        creators: creatorSpotlights,
        homeCity
      }),
    [creatorSpotlights, homeCity]
  );
  const eventsModeContent = useMemo(
    () =>
      buildEventsModeContent({
        events,
        launches,
        homeCity,
        preferredFandoms,
        query
      }),
    [events, launches, homeCity, preferredFandoms, query]
  );
  const genreMatches = useMemo(
    () =>
      buildGenreMatches({
        genre: selectedGenre,
        events,
        launches,
        query
      }),
    [events, launches, query, selectedGenre]
  );
  const reserveLaunch = reserveLaunchId
    ? launches.find((launch) => launch.id === reserveLaunchId)
    : null;
  const resolveRailUser = (userId?: string) =>
    users.find((user) => user.id === userId);

  const visibleHappening =
    eventFilter === "nearby" ? eventsModeContent.nearby : eventsModeContent.happening;

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto w-full max-w-[720px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="space-y-4">
          <HomeHeader
            city={homeCity}
            firstName={getUserFirstName(currentUser)}
            subline="What's up next?"
          />

          <HomeSearchBar onChange={setQuery} value={query} />
          <TopModeChips
            activeMode={activeMode}
            onChange={(mode) =>
              setExploreRoute({
                mode,
                filter: mode === "events" ? eventFilter : undefined,
                genreId: mode === "genres" ? activeGenreId : null
              })
            }
          />
        </section>

        <section className="mt-8 space-y-8">
          {activeMode === "for_you" ? (
            <>
              {becauseYouLikeEvents.length > 0 ? (
                <section className="space-y-3">
                  <SectionHeader
                    icon="spark"
                    onSeeAll={() => setExploreRoute({ mode: "events", filter: "all", genreId: null })}
                    title={`Because you like ${topInterest}`}
                  />
                  <HorizontalRail>
                    {becauseYouLikeEvents.map((event) => {
                      const host = resolveRailUser(event.hostId);

                      return (
                        <HomeEventRailCard
                          event={event}
                          hostAvatarUrl={host?.avatarUrl}
                          hostName={host?.name}
                          key={event.id}
                          metadataLine={`${formatDateRange(event.startsAt, event.endsAt)} · ${event.city}`}
                          socialLine={
                            event.mutualsCount > 0
                              ? `${event.mutualsCount} friends interested`
                              : event.subtitle
                          }
                        />
                      );
                    })}
                  </HorizontalRail>
                </section>
              ) : null}

              {friendEvents.length > 0 ? (
                <section className="space-y-3">
                  <SectionHeader
                    icon="social"
                    onSeeAll={() => setExploreRoute({ mode: "events", filter: "all", genreId: null })}
                    title="Friends are going"
                  />
                  <div className="space-y-3">
                    {friendEvents.map((item) => {
                      const host = resolveRailUser(item.event.hostId);

                      return (
                        <FriendInterestCard
                          hostAvatarUrl={host?.avatarUrl}
                          hostName={host?.name}
                          item={item}
                          key={item.event.id}
                          metadataLine={`${formatDateRange(item.event.startsAt, item.event.endsAt)} · ${item.event.city}`}
                          onToggleSaved={() => toggleSavedEvent(item.event.id)}
                          saved={savedEventIds.includes(item.event.id)}
                        />
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {softLaunchRails.map((rail) => (
                <section className="space-y-3" key={rail.title}>
                  <SectionHeader
                    icon="launch"
                    onSeeAll={() => {
                      setExploreRoute({ mode: "events", filter: "soft_launch", genreId: null });
                    }}
                    title={rail.title}
                  />
                  <HorizontalRail>
                    {rail.launches.map((launch) => {
                      const host = resolveRailUser(launch.hostId);

                      return (
                        <SoftLaunchRailCard
                          hostAvatarUrl={host?.avatarUrl}
                          hostName={host?.name}
                          key={launch.id}
                          launch={launch}
                          metadataLine={`${launch.city} · ${launch.dateOptions.length} date options`}
                        />
                      );
                    })}
                  </HorizontalRail>
                </section>
              ))}

              {creatorSpotlights.length > 0 ? (
                <section className="space-y-3">
                  <SectionHeader
                    icon="creator"
                    onSeeAll={() => setExploreRoute({ mode: "creators", genreId: null })}
                    title="Creators of the week"
                  />
                  <CreatorSectionRow creators={creatorSpotlights.slice(0, 8)} />
                </section>
              ) : null}

              {browseGenres.length > 0 ? (
                <section className="space-y-3">
                  <SectionHeader
                    icon="genres"
                    onSeeAll={() => setExploreRoute({ mode: "genres" })}
                    title="Browse genres"
                  />
                  <HorizontalRail>
                    {browseGenres.map((genre) => (
                      <GenreBrowseButton
                        compact
                        genre={genre}
                        href={`/explore?mode=genres&genre=${genre.id}`}
                        key={genre.id}
                        summary={genreSummaries.get(genre.id)}
                        onClick={() => {
                          setExploreRoute({ mode: "genres", genreId: genre.id });
                        }}
                      />
                    ))}
                  </HorizontalRail>
                </section>
              ) : null}
            </>
          ) : null}

          {activeMode === "events" ? (
            <>
              <EventContentFilters
                activeFilter={eventFilter}
                onChange={(filter) => setExploreRoute({ mode: "events", filter, genreId: null })}
              />

              {(eventFilter === "all" ||
                eventFilter === "happening" ||
                eventFilter === "nearby") &&
              visibleHappening.length > 0 ? (
                <section className="space-y-3">
                  <SectionHeader
                    icon="spark"
                    title={eventFilter === "nearby" ? `Near ${homeCity}` : "Happening"}
                  />
                  <HorizontalRail>
                    {visibleHappening.slice(0, 8).map((event) => {
                      const host = resolveRailUser(event.hostId);

                      return (
                        <HomeEventRailCard
                          event={event}
                          hostAvatarUrl={host?.avatarUrl}
                          hostName={host?.name}
                          key={event.id}
                          metadataLine={`${formatDateRange(event.startsAt, event.endsAt)} · ${event.city}`}
                          socialLine={event.subtitle}
                        />
                      );
                    })}
                  </HorizontalRail>
                </section>
              ) : null}

              {(eventFilter === "all" || eventFilter === "soft_launch") &&
              eventsModeContent.softLaunches.length > 0 ? (
                <section className="space-y-3">
                  <SectionHeader icon="launch" title="Soft launches" />
                  <HorizontalRail>
                    {eventsModeContent.softLaunches.slice(0, 8).map((launch) => {
                      const host = resolveRailUser(launch.hostId);

                      return (
                        <SoftLaunchRailCard
                          hostAvatarUrl={host?.avatarUrl}
                          hostName={host?.name}
                          key={launch.id}
                          launch={launch}
                          metadataLine={`${launch.city} · ${launch.dateOptions.length} date options`}
                        />
                      );
                    })}
                  </HorizontalRail>
                </section>
              ) : null}

              {becauseYouLikeEvents.length > 0 && eventFilter === "all" ? (
                <section className="space-y-3">
                  <SectionHeader icon="genres" title={`${topInterest} picks`} />
                  <HorizontalRail>
                    {becauseYouLikeEvents.slice(0, 8).map((event) => {
                      const host = resolveRailUser(event.hostId);

                      return (
                        <HomeEventRailCard
                          event={event}
                          hostAvatarUrl={host?.avatarUrl}
                          hostName={host?.name}
                          key={event.id}
                          metadataLine={`${formatDateRange(event.startsAt, event.endsAt)} · ${event.city}`}
                          socialLine={event.subtitle}
                        />
                      );
                    })}
                  </HorizontalRail>
                </section>
              ) : null}
            </>
          ) : null}

          {activeMode === "creators" ? (
            <>
              {creatorsModeContent.creatorsOfWeek.length > 0 ? (
                <section className="space-y-3">
                  <SectionHeader icon="creator" title="Creators of the week" />
                  <CreatorSectionRow creators={creatorsModeContent.creatorsOfWeek} />
                </section>
              ) : null}

              {creatorsModeContent.openToWork.length > 0 ? (
                <section className="space-y-3">
                  <SectionHeader icon="spark" title="Open to work" />
                  <CreatorSectionRow creators={creatorsModeContent.openToWork} />
                </section>
              ) : null}

              {creatorsModeContent.inYourScene.length > 0 ? (
                <section className="space-y-3">
                  <SectionHeader icon="social" title="Creators in your scene" />
                  <CreatorSectionRow creators={creatorsModeContent.inYourScene} />
                </section>
              ) : null}
            </>
          ) : null}

          {activeMode === "genres" ? (
            <>
              <section className="space-y-3">
                <SectionHeader icon="genres" title="Browse genres" />
                <GenreBrowseStack
                  activeGenreId={activeGenreId}
                  genres={browseGenres}
                  genreSummaries={genreSummaries}
                  onSelect={(genre) => setExploreRoute({ mode: "genres", genreId: genre.id })}
                />
              </section>

              {selectedGenre ? (
                <>
                  {genreMatches.events.length > 0 ? (
                    <section className="space-y-3">
                      <SectionHeader
                        icon="spark"
                        title={`${selectedGenre.label} happening`}
                      />
                      <HorizontalRail>
                        {genreMatches.events.slice(0, 8).map((event) => {
                          const host = resolveRailUser(event.hostId);

                          return (
                            <HomeEventRailCard
                              event={event}
                              hostAvatarUrl={host?.avatarUrl}
                              hostName={host?.name}
                              key={event.id}
                              metadataLine={`${formatDateRange(event.startsAt, event.endsAt)} · ${event.city}`}
                              socialLine={event.subtitle}
                            />
                          );
                        })}
                      </HorizontalRail>
                    </section>
                  ) : null}

                  {genreMatches.launches.length > 0 ? (
                    <section className="space-y-3">
                      <SectionHeader
                        icon="launch"
                        title={`${selectedGenre.label} soft launches`}
                      />
                      <HorizontalRail>
                        {genreMatches.launches.slice(0, 8).map((launch) => {
                          const host = resolveRailUser(launch.hostId);

                          return (
                            <SoftLaunchRailCard
                              hostAvatarUrl={host?.avatarUrl}
                              hostName={host?.name}
                              key={launch.id}
                              launch={launch}
                              metadataLine={`${launch.city} · ${launch.dateOptions.length} date options`}
                            />
                          );
                        })}
                      </HorizontalRail>
                    </section>
                  ) : null}
                </>
              ) : null}
            </>
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
