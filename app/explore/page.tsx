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

export default function ExplorePage() {
  const {
    creatorProfiles,
    currentUser,
    followingIds,
    homeCity,
    inbox,
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
  const unreadCount = inbox.filter((item) => item.unread).length;

  const visibleHappening =
    eventFilter === "nearby" ? eventsModeContent.nearby : eventsModeContent.happening;

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto w-full max-w-[720px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="space-y-4">
          <HomeHeader
            avatarUrl={currentUser.avatarUrl}
            firstName={getUserFirstName(currentUser)}
            fullName={currentUser.name}
            subline="What are you feeling today?"
            unreadCount={unreadCount}
          />

          <HomeSearchBar onChange={setQuery} value={query} />
          <TopModeChips activeMode={activeMode} onChange={setActiveMode} />
        </section>

        <section className="mt-8 space-y-8">
          {activeMode === "for_you" ? (
            <>
              {becauseYouLikeEvents.length > 0 ? (
                <section className="space-y-3">
                  <SectionHeader
                    icon="spark"
                    onSeeAll={() => setActiveMode("events")}
                    title={`Because you like ${topInterest}`}
                  />
                  <HorizontalRail>
                    {becauseYouLikeEvents.map((event) => (
                      <HomeEventRailCard
                        event={event}
                        key={event.id}
                        metadataLine={`${formatDateRange(event.startsAt, event.endsAt)} · ${event.city}`}
                        socialLine={
                          event.mutualsCount > 0
                            ? `${event.mutualsCount} friends interested`
                            : event.subtitle
                        }
                      />
                    ))}
                  </HorizontalRail>
                </section>
              ) : null}

              {friendEvents.length > 0 ? (
                <section className="space-y-3">
                  <SectionHeader
                    icon="social"
                    onSeeAll={() => setActiveMode("events")}
                    title="Friends are going"
                  />
                  <div className="space-y-3">
                    {friendEvents.map((item) => (
                      <FriendInterestCard
                        item={item}
                        key={item.event.id}
                        metadataLine={`${formatDateRange(item.event.startsAt, item.event.endsAt)} · ${item.event.city}`}
                        onToggleSaved={() => toggleSavedEvent(item.event.id)}
                        saved={savedEventIds.includes(item.event.id)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {softLaunchRails.map((rail) => (
                <section className="space-y-3" key={rail.title}>
                  <SectionHeader
                    icon="launch"
                    onSeeAll={() => {
                      setActiveMode("events");
                      setEventFilter("soft_launch");
                    }}
                    title={rail.title}
                  />
                  <HorizontalRail>
                    {rail.launches.map((launch) => (
                      <SoftLaunchRailCard
                        key={launch.id}
                        launch={launch}
                        metadataLine={`${launch.city} · ${launch.dateOptions.length} date options`}
                      />
                    ))}
                  </HorizontalRail>
                </section>
              ))}

              {creatorSpotlights.length > 0 ? (
                <section className="space-y-3">
                  <SectionHeader
                    icon="creator"
                    onSeeAll={() => setActiveMode("creators")}
                    title="Creators of the week"
                  />
                  <CreatorSectionRow creators={creatorSpotlights.slice(0, 8)} />
                </section>
              ) : null}

              {browseGenres.length > 0 ? (
                <section className="space-y-3">
                  <SectionHeader
                    icon="genres"
                    onSeeAll={() => setActiveMode("genres")}
                    title="Browse genres"
                  />
                  <HorizontalRail>
                    {browseGenres.map((genre) => (
                      <GenreBrowseButton
                        compact
                        genre={genre}
                        key={genre.id}
                        summary={genreSummaries.get(genre.id)}
                        onClick={() => {
                          setActiveGenreId(genre.id);
                          setActiveMode("genres");
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
                onChange={setEventFilter}
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
                    {visibleHappening.slice(0, 8).map((event) => (
                      <HomeEventRailCard
                        event={event}
                        key={event.id}
                        metadataLine={`${formatDateRange(event.startsAt, event.endsAt)} · ${event.city}`}
                        socialLine={event.subtitle}
                      />
                    ))}
                  </HorizontalRail>
                </section>
              ) : null}

              {(eventFilter === "all" || eventFilter === "soft_launch") &&
              eventsModeContent.softLaunches.length > 0 ? (
                <section className="space-y-3">
                  <SectionHeader icon="launch" title="Soft launches" />
                  <HorizontalRail>
                    {eventsModeContent.softLaunches.slice(0, 8).map((launch) => (
                      <SoftLaunchRailCard
                        key={launch.id}
                        launch={launch}
                        metadataLine={`${launch.city} · ${launch.dateOptions.length} date options`}
                      />
                    ))}
                  </HorizontalRail>
                </section>
              ) : null}

              {becauseYouLikeEvents.length > 0 && eventFilter === "all" ? (
                <section className="space-y-3">
                  <SectionHeader icon="genres" title={`${topInterest} picks`} />
                  <HorizontalRail>
                    {becauseYouLikeEvents.slice(0, 8).map((event) => (
                      <HomeEventRailCard
                        event={event}
                        key={event.id}
                        metadataLine={`${formatDateRange(event.startsAt, event.endsAt)} · ${event.city}`}
                        socialLine={event.subtitle}
                      />
                    ))}
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
                  onSelect={(genre) => setActiveGenreId(genre.id)}
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
                        {genreMatches.events.slice(0, 8).map((event) => (
                          <HomeEventRailCard
                            event={event}
                            key={event.id}
                            metadataLine={`${formatDateRange(event.startsAt, event.endsAt)} · ${event.city}`}
                            socialLine={event.subtitle}
                          />
                        ))}
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
                        {genreMatches.launches.slice(0, 8).map((launch) => (
                          <SoftLaunchRailCard
                            key={launch.id}
                            launch={launch}
                            metadataLine={`${launch.city} · ${launch.dateOptions.length} date options`}
                          />
                        ))}
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
