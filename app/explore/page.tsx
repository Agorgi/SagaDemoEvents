"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BusinessMatchCard } from "@/src/components/BusinessMatchCard";
import { CampaignCard } from "@/src/components/CampaignCard";
import { EventCard } from "@/src/components/EventCard";
import { FeedPostCard } from "@/src/components/FeedPostCard";
import { FilterChip, TagChip } from "@/src/components/Chips";
import { FandomCard } from "@/src/components/FandomCard";
import { ListingCard } from "@/src/components/ListingCard";
import { Nav } from "@/src/components/Nav";
import { OpportunityCard } from "@/src/components/OpportunityCard";
import { PersonCard } from "@/src/components/PersonCard";
import { Avatar } from "@/src/components/Avatar";
import { communityThreads, getUserById } from "@/src/data/demo";
import { businessProfiles as seedBusinessProfiles, matchExplanations } from "@/src/data/economy";
import {
  fandoms,
  getSuggestedPeople,
} from "@/src/data/social";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";

type HomeFilter = "All" | "Nearby" | "Friends";

const filters: HomeFilter[] = ["All", "Nearby", "Friends"];

export default function ExplorePage() {
  const {
    currentUser,
    currentUserId,
    currentBusinessProfile,
    getApplicationForCurrentUser,
    homeCity,
    listings,
    listingInterests,
    preferredFandoms,
    followingIds,
    launches,
    mode,
    opportunities,
    respondToBusinessMatch,
    savedEventIds,
    socialActivity,
    supportIntents,
    toggleFollow,
    toggleListingInterest,
    toggleSavedEvent
  } = useAppState();
  const { events, getEventCounts, posts } = useDemoState();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<HomeFilter>("All");

  const launchByEventId = useMemo(
    () =>
      new Map(
        launches
          .filter((launch) => launch.eventId)
          .map((launch) => [launch.eventId as string, launch])
      ),
    [launches]
  );

  const rankedEvents = useMemo(() => {
    const search = query.trim().toLowerCase();

    return [...events]
      .sort((left, right) => {
        const leftLaunch = launchByEventId.get(left.id);
        const rightLaunch = launchByEventId.get(right.id);
        const leftScore =
          preferredFandoms.filter((tag) => left.fandomTags.includes(tag)).length +
          (left.city === homeCity ? 2 : 0) +
          (leftLaunch?.reserveCount ?? 0) +
          (leftLaunch?.ticketCount ?? 0);
        const rightScore =
          preferredFandoms.filter((tag) => right.fandomTags.includes(tag)).length +
          (right.city === homeCity ? 2 : 0) +
          (rightLaunch?.reserveCount ?? 0) +
          (rightLaunch?.ticketCount ?? 0);
        return rightScore - leftScore;
      })
      .filter((event) => {
        const haystack = `${event.title} ${event.subtitle} ${event.description} ${event.city} ${event.fandomTags.join(" ")}`.toLowerCase();
        if (search && !haystack.includes(search)) {
          return false;
        }
        if (activeFilter === "Nearby") {
          return event.city === homeCity;
        }
        if (activeFilter === "Friends") {
          return event.mutualsCount > 0;
        }
        return true;
      });
  }, [activeFilter, events, homeCity, launchByEventId, preferredFandoms, query]);

  const featuredEvent = rankedEvents[0] ?? null;
  const becauseYouLike = rankedEvents.filter((event) =>
    event.fandomTags.some((tag) => preferredFandoms.includes(tag))
  );
  const nearbyEvents = rankedEvents.filter((event) => event.city === homeCity);
  const friendEvents = rankedEvents.filter((event) => event.mutualsCount > 0);
  const followedHostEvents = rankedEvents.filter((event) => followingIds.includes(event.hostId));
  const softLaunches = launches
    .filter((launch) => !launch.eventId || launch.status === "funded" || launch.status === "paired")
    .filter((launch) => query.trim() ? `${launch.title} ${launch.description} ${launch.city} ${launch.fandomTags.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()) : true)
    .slice(0, 4);
  const suggestedPeople = getSuggestedPeople(currentUserId)
    .filter((user) => !followingIds.includes(user.id))
    .slice(0, 4);
  const creatorsInScene = suggestedPeople.filter((user) => user.roleType !== "fan").slice(0, 4);
  const feedPosts = posts.filter((post) => followingIds.includes(post.authorId)).slice(0, 3);
  const activeCommunity = communityThreads.find((room) =>
    room.fandomTags.some((tag) => preferredFandoms.includes(tag))
  );
  const workOpportunities = opportunities
    .filter(
      (item) =>
        item.city === homeCity ||
        item.fandomTags.some((tag) => preferredFandoms.includes(tag))
    )
    .slice(0, 4);
  const shopDrops = listings
    .filter(
      (item) =>
        item.city === homeCity ||
        item.fandomTags.some((tag) => preferredFandoms.includes(tag))
    )
    .slice(0, 4);
  const activeBusiness = currentBusinessProfile ?? seedBusinessProfiles[0];
  const businessMatches = matchExplanations
    .filter((item) => item.businessId === activeBusiness?.id)
    .slice(0, 3);

  function eventReason(eventId: string, defaultLine: string) {
    const launch = launchByEventId.get(eventId);
    if (mode === "creator") {
      const openRoles = getEventCounts(eventId).open;
      return openRoles > 0 ? `${openRoles} open roles in your scene.` : "Worth tracking for the team and the room.";
    }
    if (mode === "business") {
      return "Worth scanning for venue fit, creator pull, and repeat potential.";
    }
    if (mode === "host") {
      const demand = (launch?.reserveCount ?? 0) + (launch?.ticketCount ?? 0);
      return `${demand} people already leaning in.`;
    }
    return defaultLine;
  }

  function socialLine(eventId: string) {
    const event = events.find((item) => item.id === eventId);
    if (!event) {
      return undefined;
    }
    if (event.mutualsCount > 0) {
      return `${event.mutualsCount} mutuals are watching this`;
    }
    if (followingIds.includes(event.hostId)) {
      return "Hosted by someone you follow";
    }
    return undefined;
  }

  function renderRow(eventId: string) {
    const event = events.find((item) => item.id === eventId);
    if (!event) {
      return null;
    }
    const launch = launchByEventId.get(event.id);
    const thresholdCurrent = (launch?.reserveCount ?? 0) + (launch?.ticketCount ?? 0);
    const thresholdTarget =
      launch?.plan.thresholdTarget ?? Math.max(24, Math.round(event.attendeesCount * 0.07));

    return (
      <EventCard
        className="min-w-[290px] sm:min-w-[330px]"
        event={event}
        href={`/events/${event.id}`}
        key={event.id}
        mode={mode}
        onPrimaryAction={() => {
          window.location.assign(`/events/${event.id}`);
        }}
        onToggleSaved={() => toggleSavedEvent(event.id)}
        openRoles={getEventCounts(event.id).open}
        primaryLabel="See event"
        reasonLine={eventReason(event.id, event.subtitle)}
        saved={savedEventIds.includes(event.id)}
        showThreshold={false}
        socialLine={socialLine(event.id)}
        status={launch?.status ?? "live"}
        thresholdCurrent={thresholdCurrent}
        thresholdTarget={thresholdTarget}
        variant="row"
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto w-full max-w-[1120px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-app-muted">{homeCity}</p>
              <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">For you</h1>
              <p className="mt-2 max-w-[44ch] text-sm text-app-muted">
                {mode === "business"
                  ? "Matches, launches, and creators with enough signal to support."
                  : `Nights, people, and scene signals shaped around ${preferredFandoms[0] ?? "your fandoms"}.`}
              </p>
            </div>
            <Link
              className="inline-flex rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
              href="/discover"
            >
              Open discovery
            </Link>
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
            {filters.map((filter) => (
              <FilterChip
                active={activeFilter === filter}
                className="text-xs"
                key={filter}
                label={filter}
                onClick={() => setActiveFilter(filter)}
              />
            ))}
            {preferredFandoms.slice(0, 3).map((tag) => (
              <TagChip key={tag} label={tag} subdued />
            ))}
          </div>
        </section>

        {featuredEvent ? (
          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(300px,0.82fr)]">
            <EventCard
              event={featuredEvent}
              href={`/events/${featuredEvent.id}`}
              mode={mode}
              onPrimaryAction={() => window.location.assign(`/events/${featuredEvent.id}`)}
              onToggleSaved={() => toggleSavedEvent(featuredEvent.id)}
              openRoles={getEventCounts(featuredEvent.id).open}
              primaryLabel="See event"
              reasonLine={eventReason(featuredEvent.id, featuredEvent.subtitle)}
              saved={savedEventIds.includes(featuredEvent.id)}
              socialLine={socialLine(featuredEvent.id)}
              status={launchByEventId.get(featuredEvent.id)?.status ?? "live"}
              thresholdCurrent={
                (launchByEventId.get(featuredEvent.id)?.reserveCount ?? 0) +
                (launchByEventId.get(featuredEvent.id)?.ticketCount ?? 0)
              }
              thresholdTarget={
                launchByEventId.get(featuredEvent.id)?.plan.thresholdTarget ??
                Math.max(24, Math.round(featuredEvent.attendeesCount * 0.07))
              }
              variant="featured"
            />
            <aside className="space-y-6">
              <section className="surface-card p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-app-muted">Scene pulse</p>
                <div className="mt-4 space-y-3">
                  {socialActivity.slice(0, 4).map((item) => {
                    const actor = getUserById(item.actorIds[0]);
                    return (
                      <Link
                        className="flex items-start gap-3 rounded-[22px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/12"
                        href={item.href}
                        key={item.id}
                      >
                        <Avatar name={actor?.name ?? "Saga"} size="sm" src={actor?.avatarUrl} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-app-muted">{item.body}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {activeCommunity ? (
                <section className="surface-card p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-app-muted">Room picking up</p>
                  <Link className="mt-4 block overflow-hidden rounded-[24px]" href={`/communities/${activeCommunity.id}`}>
                    <img alt={activeCommunity.title} className="h-[170px] w-full object-cover" src={activeCommunity.coverImageUrl} />
                  </Link>
                  <p className="mt-4 text-lg font-semibold text-white">{activeCommunity.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-app-muted">{activeCommunity.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeCommunity.fandomTags.map((tag) => (
                      <TagChip key={tag} label={tag} subdued />
                    ))}
                  </div>
                </section>
              ) : null}
            </aside>
          </section>
        ) : null}

        <div className="mt-8 space-y-8">
          <HomeRail
            title={`Because you like ${preferredFandoms[0] ?? "this scene"}`}
            subtitle="Closer to your taste than a flat list."
          >
            {becauseYouLike.slice(0, 4).map((event) => renderRow(event.id))}
          </HomeRail>

          {softLaunches.length > 0 ? (
            <HomeRail
              title="Soft launches gaining traction"
              subtitle="Early concepts fans are helping turn into real nights."
            >
              {softLaunches.map((launch) => (
                <div className="min-w-[290px] sm:min-w-[340px]" key={launch.id}>
                  <CampaignCard
                    compact
                    href={`/campaigns/${launch.id}`}
                    launch={launch}
                    mode={mode}
                    onPrimaryAction={() => {
                      if (mode === "host" && launch.hostId === currentUserId) {
                        window.location.assign(`/studio/${launch.id}`);
                        return;
                      }
                      window.location.assign(`/campaigns/${launch.id}`);
                    }}
                    primaryLabel={
                      mode === "host" && launch.hostId === currentUserId
                        ? "Open dashboard"
                        : mode === "business"
                          ? "See fit"
                        : mode === "creator"
                          ? "Back launch"
                          : "Pledge spot"
                    }
                    reasonLine={launch.softLaunchSummary}
                    secondaryLabel="See launch"
                    onSecondaryAction={() => window.location.assign(`/campaigns/${launch.id}`)}
                  />
                </div>
              ))}
            </HomeRail>
          ) : null}

          <HomeRail
            title="Friends are interested"
            subtitle="What people around you are already passing around."
          >
            {friendEvents.slice(0, 4).map((event) => renderRow(event.id))}
          </HomeRail>

          {followedHostEvents.length > 0 ? (
            <HomeRail
              title="From hosts you follow"
              subtitle="New nights from people already shaping your calendar."
            >
              {followedHostEvents.slice(0, 4).map((event) => renderRow(event.id))}
            </HomeRail>
          ) : null}

          <HomeRail
            title="Creators in your scene"
            subtitle="People worth following before their next event lands."
          >
            {creatorsInScene.map((user) => (
              <div className="min-w-[250px] sm:min-w-[280px]" key={user.id}>
                <PersonCard
                  href={`/creators/${user.id}`}
                  isFollowing={followingIds.includes(user.id)}
                  onFollow={() => toggleFollow(user.id)}
                  subtitle={`${user.city} · ${user.handle}`}
                  tags={user.fandomTags}
                  user={user}
                />
              </div>
            ))}
          </HomeRail>

          <HomeRail
            title="Open calls in your orbit"
            subtitle="Roles, guest spots, and creator support openings linked to real nights."
          >
            {workOpportunities.map((opportunity) => (
              <div className="min-w-[300px] sm:min-w-[340px]" key={opportunity.id}>
                <OpportunityCard
                  applicationStatus={getApplicationForCurrentUser(opportunity.id)?.status}
                  compact
                  href={`/opportunities/${opportunity.id}`}
                  onPrimaryAction={() => window.location.assign(`/opportunities/${opportunity.id}`)}
                  opportunity={opportunity}
                  primaryLabel="Open call"
                />
              </div>
            ))}
          </HomeRail>

          <HomeRail
            title="Shop drops and services"
            subtitle="Merch, commissions, and creator services traveling through your network."
          >
            {shopDrops.map((listing) => {
              const interest = listingInterests.find(
                (item) => item.listingId === listing.id && item.userId === currentUserId
              );

              return (
                <div className="min-w-[250px] sm:min-w-[300px]" key={listing.id}>
                  <ListingCard
                    compact
                    href={`/listings/${listing.id}`}
                    interestKind={interest?.kind}
                    listing={listing}
                    onPrimaryAction={() =>
                      toggleListingInterest(
                        listing.id,
                        listing.type === "merch" || listing.type === "resale" ? "mock_purchased" : "requested"
                      )
                    }
                  />
                </div>
              );
            })}
          </HomeRail>

          {businessMatches.length > 0 ? (
            <HomeRail
              title="Spaces ready to host"
              subtitle="Business-side fits and support angles connected to the same fandom graph."
            >
              {businessMatches.map((match) => {
                const actionState = supportIntents.find(
                  (intent) =>
                    intent.businessId === match.businessId &&
                    intent.targetId === match.targetId &&
                    intent.targetType === match.targetType
                )?.action;

                return (
                  <div className="min-w-[300px] sm:min-w-[360px]" key={match.id}>
                    <BusinessMatchCard
                      actionState={actionState}
                      href={
                        match.targetType === "launch"
                          ? `/campaigns/${match.targetId}`
                          : match.targetType === "event"
                            ? `/events/${match.targetId}`
                            : match.targetType === "creator"
                              ? `/profiles/${match.targetId}`
                              : `/opportunities/${match.targetId}`
                      }
                      match={match}
                      onRespond={(action) =>
                        respondToBusinessMatch(match.businessId, match.targetType, match.targetId, action)
                      }
                    />
                  </div>
                );
              })}
            </HomeRail>
          ) : null}

          <HomeRail
            title="From people you follow"
            subtitle="Posts and references shaping what gets shared next."
          >
            {feedPosts.map((post) => (
              <div className="min-w-[250px] sm:min-w-[300px]" key={post.id}>
                <FeedPostCard post={post} />
              </div>
            ))}
          </HomeRail>

          <HomeRail
            title="Trending fandom clusters"
            subtitle="Where plans, people, and inside jokes cluster together."
          >
            {fandoms.map((fandom) => (
              <div className="min-w-[260px] sm:min-w-[300px]" key={fandom.id}>
                <FandomCard fandom={fandom} href={`/discover?tab=fandoms`} />
              </div>
            ))}
          </HomeRail>
        </div>

        <section className="mt-8 surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold text-white">Nearby this week</p>
              <p className="mt-1 text-sm text-app-muted">Quick local plans with strong social pull.</p>
            </div>
            <Link className="text-sm font-semibold text-app-muted transition hover:text-white" href="/discover">
              See all
            </Link>
          </div>
          <div className="mt-4 space-y-4">{nearbyEvents.slice(0, 3).map((event) => renderRow(event.id))}</div>
        </section>
      </main>
    </div>
  );
}

function HomeRail({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <p className="text-2xl font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm text-app-muted">{subtitle}</p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-1 subtle-scrollbar">{children}</div>
    </section>
  );
}
