"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { BusinessMatchCard } from "@/src/components/BusinessMatchCard";
import { CampaignCard } from "@/src/components/CampaignCard";
import { EventCard } from "@/src/components/EventCard";
import { FilterChip, TagChip } from "@/src/components/Chips";
import { FandomCard } from "@/src/components/FandomCard";
import { ListingCard } from "@/src/components/ListingCard";
import { Nav } from "@/src/components/Nav";
import { OpportunityCard } from "@/src/components/OpportunityCard";
import { PersonCard } from "@/src/components/PersonCard";
import { QuickInterestDeck } from "@/src/components/QuickInterestDeck";
import { businessProfiles as seedBusinessProfiles, matchExplanations } from "@/src/data/economy";
import { fandoms, getSuggestedPeople } from "@/src/data/social";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";

type DiscoverTab = "events" | "people" | "fandoms";
type DiscoverFilter = "All" | "Nearby" | "This week";

const filters: DiscoverFilter[] = ["All", "Nearby", "This week"];

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app-bg" />}>
      <DiscoverPageContent />
    </Suspense>
  );
}

function DiscoverPageContent() {
  const searchParams = useSearchParams();
  const {
    currentUser,
    currentUserId,
    currentBusinessProfile,
    getApplicationForCurrentUser,
    homeCity,
    followingIds,
    goingEventIds,
    interestedEventIds,
    listings,
    launches,
    listingInterests,
    mode,
    opportunities,
    respondToBusinessMatch,
    savedEventIds,
    supportIntents,
    toggleFollow,
    toggleListingInterest,
    toggleInterestedEvent,
    toggleSavedEvent,
    markGoing
  } = useAppState();
  const { events, getEventCounts } = useDemoState();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<DiscoverTab>(
    (searchParams.get("tab") as DiscoverTab | null) ?? "events"
  );
  const [activeFilter, setActiveFilter] = useState<DiscoverFilter>("All");

  const launchByEventId = useMemo(
    () =>
      new Map(
        launches
          .filter((launch) => launch.eventId)
          .map((launch) => [launch.eventId as string, launch])
      ),
    [launches]
  );

  const filteredEvents = useMemo(() => {
    const search = query.trim().toLowerCase();
    return [...events].filter((event) => {
      const haystack = `${event.title} ${event.subtitle} ${event.description} ${event.city} ${event.fandomTags.join(" ")}`.toLowerCase();
      if (search && !haystack.includes(search)) {
        return false;
      }
      if (activeFilter === "Nearby") {
        return event.city === homeCity;
      }
      return true;
    });
  }, [activeFilter, events, homeCity, query]);

  const filteredPeople = useMemo(() => {
    const search = query.trim().toLowerCase();
    return getSuggestedPeople(currentUserId)
      .filter((user) => {
        const haystack = `${user.name} ${user.handle} ${user.city} ${user.fandomTags.join(" ")} ${user.skills.join(" ")}`.toLowerCase();
        return (search ? haystack.includes(search) : true) && !followingIds.includes(user.id);
      })
      .slice(0, 8);
  }, [currentUserId, followingIds, query]);

  const filteredFandoms = useMemo(() => {
    const search = query.trim().toLowerCase();
    return fandoms.filter((fandom) => {
      const haystack = `${fandom.name} ${fandom.description} ${fandom.tags.join(" ")}`.toLowerCase();
      return search ? haystack.includes(search) : true;
    });
  }, [query]);

  const filteredLaunches = useMemo(() => {
    const search = query.trim().toLowerCase();
    return launches
      .filter((launch) => !launch.eventId || launch.status === "funded" || launch.status === "paired")
      .filter((launch) => {
        const haystack = `${launch.title} ${launch.description} ${launch.city} ${launch.fandomTags.join(" ")}`.toLowerCase();
        if (search && !haystack.includes(search)) {
          return false;
        }
        if (activeFilter === "Nearby") {
          return launch.city === homeCity;
        }
        return true;
      })
      .slice(0, 4);
  }, [activeFilter, homeCity, launches, query]);

  const filteredOpportunities = useMemo(() => {
    const search = query.trim().toLowerCase();
    return opportunities
      .filter((opportunity) => {
        const haystack = `${opportunity.title} ${opportunity.summary} ${opportunity.city} ${opportunity.fandomTags.join(" ")}`.toLowerCase();
        if (search && !haystack.includes(search)) {
          return false;
        }
        if (activeFilter === "Nearby") {
          return opportunity.city === homeCity;
        }
        return true;
      })
      .slice(0, 6);
  }, [activeFilter, homeCity, opportunities, query]);

  const filteredListings = useMemo(() => {
    const search = query.trim().toLowerCase();
    return listings
      .filter((listing) => {
        const haystack = `${listing.title} ${listing.summary} ${listing.city} ${listing.fandomTags.join(" ")}`.toLowerCase();
        if (search && !haystack.includes(search)) {
          return false;
        }
        if (activeFilter === "Nearby") {
          return listing.city === homeCity;
        }
        return true;
      })
      .slice(0, 6);
  }, [activeFilter, homeCity, listings, query]);

  const activeBusiness = currentBusinessProfile ?? seedBusinessProfiles[0];
  const businessMatches = useMemo(
    () => matchExplanations.filter((item) => item.businessId === activeBusiness?.id).slice(0, 4),
    [activeBusiness]
  );

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto w-full max-w-[1120px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-app-muted">{homeCity}</p>
            <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Discover</h1>
            <p className="mt-2 max-w-[44ch] text-sm text-app-muted">
              Browse events, people, and fandom pockets around {currentUser.name.split(" ")[0]}&apos;s
              scene.
            </p>
          </div>

          <label className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-[#0d1119] px-4 py-3 text-app-muted transition focus-within:border-app-purple/45">
            <span aria-hidden="true">⌕</span>
            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-app-muted"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search events, people, fandoms"
              type="search"
              value={query}
            />
          </label>

          <div className="flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
            {[
              { label: "Events", value: "events" },
              { label: "People", value: "people" },
              { label: "Fandoms", value: "fandoms" }
            ].map((tab) => (
              <FilterChip
                active={activeTab === tab.value}
                className="text-xs"
                key={tab.value}
                label={tab.label}
                onClick={() => setActiveTab(tab.value as DiscoverTab)}
              />
            ))}
          </div>

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
            {currentUser.fandomTags.slice(0, 3).map((tag) => (
              <TagChip key={tag} label={tag} subdued />
            ))}
          </div>
        </section>

        {activeTab === "events" ? (
          <div className="mt-8 space-y-8">
            <section className="grid gap-6 lg:grid-cols-[minmax(0,0.98fr)_minmax(320px,0.82fr)]">
              <QuickInterestDeck
                events={filteredEvents}
                goingEventIds={goingEventIds}
                interestedEventIds={interestedEventIds}
                onGoing={markGoing}
                onInterested={toggleInterestedEvent}
                onSaved={toggleSavedEvent}
                savedEventIds={savedEventIds}
              />
              <div className="surface-card p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-app-muted">Matched to your scene</p>
                <div className="mt-4 space-y-5">
                  <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
                    <p className="text-sm font-semibold text-white">Closest signals</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <TagChip label={`Near ${homeCity.split(",")[0]}`} subdued />
                      {currentUser.fandomTags.slice(0, 2).map((tag) => (
                        <TagChip key={tag} label={tag} subdued />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
                    <p className="text-sm font-semibold text-white">Social pull</p>
                    <p className="mt-2 text-sm text-app-muted">
                      We’re surfacing nights your follows, mutuals, and adjacent fandom circles are already touching.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              {filteredLaunches.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-semibold text-white">Interest checks</p>
                    <p className="mt-1 text-sm text-app-muted">Early drops still building toward confirmation.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredLaunches.map((launch) => (
                      <CampaignCard
                        compact
                        href={`/campaigns/${launch.id}`}
                        key={launch.id}
                        launch={launch}
                        mode={mode}
                        onPrimaryAction={() => window.location.assign(`/campaigns/${launch.id}`)}
                        primaryLabel={mode === "creator" ? "Back launch" : "Pledge spot"}
                        reasonLine={launch.softLaunchSummary}
                        secondaryLabel="See launch"
                        onSecondaryAction={() => window.location.assign(`/campaigns/${launch.id}`)}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <p className="text-2xl font-semibold text-white">Events</p>
                <p className="mt-1 text-sm text-app-muted">Scan the room fast, then open the ones with real pull.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredEvents.map((event) => {
                  const launch = launchByEventId.get(event.id);
                  const thresholdCurrent =
                    (launch?.reserveCount ?? 0) + (launch?.ticketCount ?? 0);
                  const thresholdTarget =
                    launch?.plan.thresholdTarget ??
                    Math.max(24, Math.round(event.attendeesCount * 0.07));
                  const openRoles = getEventCounts(event.id).open;
                  const primaryLabel =
                    mode === "creator"
                      ? openRoles > 0
                        ? "Join team"
                        : "See event"
                      : mode === "business"
                        ? "See fit"
                      : goingEventIds.includes(event.id)
                        ? "In plans"
                        : "Going";

                  return (
                    <EventCard
                      event={event}
                      href={`/events/${event.id}`}
                      key={event.id}
                      mode={mode}
                      onPrimaryAction={() => {
                        if (mode === "business") {
                          window.location.assign(`/events/${event.id}`);
                          return;
                        }
                        if (mode === "creator" && openRoles > 0) {
                          window.location.assign(`/events/${event.id}`);
                          return;
                        }
                        if (primaryLabel === "In plans") {
                          window.location.assign("/my-events");
                          return;
                        }
                        markGoing(event.id);
                      }}
                      onSecondaryAction={() => window.location.assign(`/events/${event.id}`)}
                      onToggleSaved={() => toggleSavedEvent(event.id)}
                      openRoles={openRoles}
                      primaryLabel={primaryLabel}
                      reasonLine={event.subtitle}
                      saved={savedEventIds.includes(event.id)}
                      secondaryLabel="See details"
                      socialLine={event.mutualsCount > 0 ? `${event.mutualsCount} mutuals are watching` : undefined}
                      status={launch?.status ?? "live"}
                      thresholdCurrent={thresholdCurrent}
                      thresholdTarget={thresholdTarget}
                      variant="row"
                    />
                  );
                })}
              </div>

              {filteredOpportunities.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-semibold text-white">Open calls</p>
                    <p className="mt-1 text-sm text-app-muted">Guest slots, vendors, performers, and creator support roles.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredOpportunities.map((opportunity) => (
                      <OpportunityCard
                        applicationStatus={getApplicationForCurrentUser(opportunity.id)?.status}
                        compact
                        href={`/opportunities/${opportunity.id}`}
                        key={opportunity.id}
                        onPrimaryAction={() => window.location.assign(`/opportunities/${opportunity.id}`)}
                        opportunity={opportunity}
                        primaryLabel="Open call"
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        ) : null}

        {activeTab === "people" ? (
          <section className="mt-8 space-y-4">
            <div>
              <p className="text-2xl font-semibold text-white">People</p>
              <p className="mt-1 text-sm text-app-muted">Creators, hosts, and scene regulars shaping what gets shared.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPeople.map((user) => (
                <PersonCard
                  href={`/creators/${user.id}`}
                  isFollowing={followingIds.includes(user.id)}
                  key={user.id}
                  onFollow={() => toggleFollow(user.id)}
                  subtitle={`${user.city} · ${user.handle}`}
                  tags={user.fandomTags}
                  user={user}
                />
              ))}
            </div>

            {filteredListings.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-semibold text-white">Shop drops</p>
                  <p className="mt-1 text-sm text-app-muted">Services, merch, commissions, and resale tied to real creator identities.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredListings.slice(0, 4).map((listing) => (
                    <ListingCard
                      compact
                      href={`/listings/${listing.id}`}
                      interestKind={
                        listingInterests.find(
                          (item) => item.listingId === listing.id && item.userId === currentUserId
                        )?.kind
                      }
                      key={listing.id}
                      listing={listing}
                      onPrimaryAction={() =>
                        toggleListingInterest(
                          listing.id,
                          listing.type === "merch" || listing.type === "resale" ? "mock_purchased" : "requested"
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {activeTab === "fandoms" ? (
          <section className="mt-8 space-y-4">
            <div>
              <p className="text-2xl font-semibold text-white">Fandoms</p>
              <p className="mt-1 text-sm text-app-muted">Browse by scene, not just by date.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredFandoms.map((fandom) => (
                <FandomCard fandom={fandom} href={`/communities/${fandom.eventIds[0] ?? "court-of-stars"}`} key={fandom.id} />
              ))}
            </div>

            {businessMatches.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-semibold text-white">Business matches</p>
                  <p className="mt-1 text-sm text-app-muted">Venue-side fits explained through location, fandom, and format.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {businessMatches.map((match) => (
                    <BusinessMatchCard
                      actionState={
                        supportIntents.find(
                          (intent) =>
                            intent.businessId === match.businessId &&
                            intent.targetId === match.targetId &&
                            intent.targetType === match.targetType
                        )?.action
                      }
                      href={
                        match.targetType === "launch"
                          ? `/campaigns/${match.targetId}`
                          : match.targetType === "event"
                            ? `/events/${match.targetId}`
                            : match.targetType === "creator"
                              ? `/profiles/${match.targetId}`
                              : `/opportunities/${match.targetId}`
                      }
                      key={match.id}
                      match={match}
                      onRespond={(action) =>
                        respondToBusinessMatch(match.businessId, match.targetType, match.targetId, action)
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}
