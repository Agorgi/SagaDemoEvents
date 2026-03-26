import { type CreatorProfile } from "@/src/data/creator-profiles";
import { type DemoEvent, type DemoUser } from "@/src/data/demo";
import { type DemoLaunch } from "@/src/data/launches";
import { type SocialActivityItem } from "@/src/data/social";
import { type ExploreGenre } from "@/src/features/explore/data";

export type FriendEventSpotlight = {
  event: DemoEvent;
  actorUsers: DemoUser[];
  socialLine: string;
};

export type CreatorSpotlight = {
  profile: CreatorProfile;
  user: DemoUser;
  craft: string;
  locationLabel: string;
  publicServices: number;
};

export type SoftLaunchRail = {
  genre: string;
  title: string;
  launches: DemoLaunch[];
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function includesText(haystack: string, query: string) {
  if (!query) {
    return true;
  }

  return normalize(haystack).includes(normalize(query));
}

function tagsMatch(tags: string[], target: string) {
  const normalizedTarget = normalize(target);
  return tags.some((tag) => {
    const normalizedTag = normalize(tag);
    return normalizedTag.includes(normalizedTarget) || normalizedTarget.includes(normalizedTag);
  });
}

function matchesGenre(tags: string[], label: string, matchTags: string[]) {
  return [label, ...matchTags].some((term) => tagsMatch(tags, term));
}

function scoreSoftLaunch({
  launch,
  homeCity,
  preferredFandoms,
  topInterest
}: {
  launch: DemoLaunch;
  homeCity: string;
  preferredFandoms: string[];
  topInterest: string;
}) {
  const momentum = launch.ticketCount + launch.reserveCount + launch.pledges.length;
  return (
    (tagsMatch(launch.fandomTags, topInterest) ? 4 : 0) +
    launch.fandomTags.filter((tag) =>
      preferredFandoms.some((interest) => tagsMatch([tag], interest))
    ).length *
      2 +
    (launch.city === homeCity ? 2 : 0) +
    momentum
  );
}

export function getTopInterest(preferredFandoms: string[]) {
  return preferredFandoms[0] ?? "Anime";
}

export function getUserFirstName(user: DemoUser) {
  return user.name.split(" ")[0] ?? user.name;
}

export function buildBecauseYouLikeEvents({
  events,
  homeCity,
  preferredFandoms,
  topInterest,
  query
}: {
  events: DemoEvent[];
  homeCity: string;
  preferredFandoms: string[];
  topInterest: string;
  query: string;
}) {
  const normalizedQuery = normalize(query);

  return [...events]
    .filter((event) => {
      const haystack = `${event.title} ${event.subtitle} ${event.city} ${event.fandomTags.join(" ")}`;
      return includesText(haystack, normalizedQuery);
    })
    .sort((left, right) => {
      const leftScore =
        (tagsMatch(left.fandomTags, topInterest) ? 5 : 0) +
        left.fandomTags.filter((tag) =>
          preferredFandoms.some((interest) => tagsMatch([tag], interest))
        ).length *
          2 +
        (left.city === homeCity ? 2 : 0) +
        (left.featured ? 1 : 0) +
        Math.min(left.mutualsCount, 4);
      const rightScore =
        (tagsMatch(right.fandomTags, topInterest) ? 5 : 0) +
        right.fandomTags.filter((tag) =>
          preferredFandoms.some((interest) => tagsMatch([tag], interest))
        ).length *
          2 +
        (right.city === homeCity ? 2 : 0) +
        (right.featured ? 1 : 0) +
        Math.min(right.mutualsCount, 4);

      if (rightScore === leftScore) {
        return right.attendeesCount - left.attendeesCount;
      }

      return rightScore - leftScore;
    });
}

export function buildFriendsGoingEvents({
  events,
  socialActivity,
  users,
  followingIds,
  query
}: {
  events: DemoEvent[];
  socialActivity: SocialActivityItem[];
  users: DemoUser[];
  followingIds: string[];
  query: string;
}): FriendEventSpotlight[] {
  const normalizedQuery = normalize(query);
  const seenEventIds = new Set<string>();

  return socialActivity
    .filter((item) => item.eventId)
    .filter((item) => item.actorIds.some((actorId) => followingIds.includes(actorId)))
    .map((item) => {
      const event = events.find((candidate) => candidate.id === item.eventId);
      if (!event || seenEventIds.has(event.id)) {
        return null;
      }

      const haystack = `${event.title} ${event.subtitle} ${event.city} ${event.fandomTags.join(" ")}`;
      if (!includesText(haystack, normalizedQuery)) {
        return null;
      }

      seenEventIds.add(event.id);

      const actorUsers = item.actorIds
        .map((actorId) => users.find((user) => user.id === actorId))
        .filter((user): user is DemoUser => Boolean(user))
        .slice(0, 3);

      const socialLine =
        actorUsers.length >= 2
          ? `${actorUsers[0].handle} and ${actorUsers.length - 1} others are going`
          : actorUsers.length === 1
            ? `${actorUsers[0].handle} is going`
            : `${Math.max(event.mutualsCount, 2)} friends interested`;

      return {
        event,
        actorUsers,
        socialLine
      };
    })
    .filter((item): item is FriendEventSpotlight => Boolean(item))
    .slice(0, 3);
}

export function buildSoftLaunchRails({
  launches,
  homeCity,
  preferredFandoms,
  topInterest,
  query,
  genres
}: {
  launches: DemoLaunch[];
  homeCity: string;
  preferredFandoms: string[];
  topInterest: string;
  query: string;
  genres: ExploreGenre[];
}): SoftLaunchRail[] {
  const normalizedQuery = normalize(query);
  const rankedLaunches = launches
    .filter((launch) => !launch.eventId)
    .filter((launch) => {
      const haystack = `${launch.title} ${launch.description} ${launch.city} ${launch.fandomTags.join(" ")}`;
      return includesText(haystack, normalizedQuery);
    })
    .sort(
      (left, right) =>
        scoreSoftLaunch({ launch: right, homeCity, preferredFandoms, topInterest }) -
        scoreSoftLaunch({ launch: left, homeCity, preferredFandoms, topInterest })
    );

  const rails: SoftLaunchRail[] = [];
  const usedLaunchIds = new Set<string>();

  const topInterestMatches = rankedLaunches
    .filter((launch) => tagsMatch(launch.fandomTags, topInterest))
    .slice(0, 6);

  if (topInterestMatches.length > 0) {
    topInterestMatches.forEach((launch) => usedLaunchIds.add(launch.id));
    rails.push({
      genre: topInterest,
      title: `${topInterest} soft launches`,
      launches: topInterestMatches
    });
  }

  const popularGenre = genres
    .map((genre) => ({
      genre,
      launches: rankedLaunches.filter(
        (launch) =>
          !usedLaunchIds.has(launch.id) &&
          matchesGenre(launch.fandomTags, genre.label, genre.matchTags)
      )
    }))
    .find((entry) => entry.launches.length >= 2);

  if (popularGenre) {
    rails.push({
      genre: popularGenre.genre.label,
      title: `${popularGenre.genre.label} soft launches`,
      launches: popularGenre.launches.slice(0, 6)
    });
  }

  if (rails.length === 0 && rankedLaunches.length > 0) {
    rails.push({
      genre: "Trending",
      title: "Trending soft launches",
      launches: rankedLaunches.slice(0, 6)
    });
  }

  return rails;
}

function inferCreatorCraft(profile: CreatorProfile, user: DemoUser) {
  const service = profile.services.find((item) => item.visibleOnPublicProfile);
  const category = service?.category?.toLowerCase() ?? "";

  if (category.includes("portrait") || user.skills.includes("photography")) {
    return "Photographer";
  }
  if (category.includes("promo") || user.skills.includes("graphic designer")) {
    return "Creative promo";
  }
  if (category.includes("hosting") || user.skills.includes("hosting")) {
    return "Community host";
  }
  if (user.skills.includes("dj")) {
    return "DJ";
  }
  if (user.skills.includes("decor")) {
    return "Set designer";
  }
  if (user.skills.includes("videography") || user.skills.includes("reels")) {
    return "Videographer";
  }

  return service?.title ?? user.skills[0] ?? "Creator";
}

export function buildCreatorsOfWeek({
  creatorProfiles,
  users,
  homeCity,
  preferredFandoms,
  query
}: {
  creatorProfiles: CreatorProfile[];
  users: DemoUser[];
  homeCity: string;
  preferredFandoms: string[];
  query: string;
}): CreatorSpotlight[] {
  const normalizedQuery = normalize(query);

  return creatorProfiles
    .map((profile) => {
      const user = users.find((candidate) => candidate.id === profile.id);
      if (!user || profile.portfolio.length === 0) {
        return null;
      }

      const haystack = `${profile.displayName} ${profile.handle} ${profile.bio} ${profile.tags.join(" ")} ${user.skills.join(" ")}`;
      if (!includesText(haystack, normalizedQuery)) {
        return null;
      }

      const publicServices = profile.services.filter(
        (service) => service.visibleOnPublicProfile
      ).length;
      const score =
        profile.portfolio.length * 3 +
        publicServices * 4 +
        (profile.location.includes(homeCity.split(",")[0] ?? homeCity) ? 2 : 0) +
        profile.tags.filter((tag) =>
          preferredFandoms.some((interest) => tagsMatch([tag], interest))
        ).length *
          2;

      return {
        profile,
        user,
        craft: inferCreatorCraft(profile, user),
        locationLabel: profile.location,
        publicServices,
        score
      };
    })
    .filter(
      (
        entry
      ): entry is CreatorSpotlight & {
        score: number;
      } => Boolean(entry)
    )
    .sort((left, right) => right.score - left.score)
    .map(({ score: _score, ...entry }) => entry);
}

export function buildGenreMatches({
  genre,
  events,
  launches,
  query
}: {
  genre?: ExploreGenre | null;
  events: DemoEvent[];
  launches: DemoLaunch[];
  query: string;
}) {
  if (!genre) {
    return {
      events: [] as DemoEvent[],
      launches: [] as DemoLaunch[]
    };
  }

  const normalizedQuery = normalize(query);

  return {
    events: events.filter((event) => {
      const haystack = `${event.title} ${event.subtitle} ${event.city} ${event.fandomTags.join(" ")}`;
      return (
        matchesGenre(event.fandomTags, genre.label, genre.matchTags) &&
        includesText(haystack, normalizedQuery)
      );
    }),
    launches: launches.filter((launch) => {
      const haystack = `${launch.title} ${launch.description} ${launch.city} ${launch.fandomTags.join(" ")}`;
      return (
        !launch.eventId &&
        matchesGenre(launch.fandomTags, genre.label, genre.matchTags) &&
        includesText(haystack, normalizedQuery)
      );
    })
  };
}

export function buildEventsModeContent({
  events,
  launches,
  homeCity,
  preferredFandoms,
  query
}: {
  events: DemoEvent[];
  launches: DemoLaunch[];
  homeCity: string;
  preferredFandoms: string[];
  query: string;
}) {
  const topInterest = getTopInterest(preferredFandoms);
  const happening = buildBecauseYouLikeEvents({
    events,
    homeCity,
    preferredFandoms,
    topInterest,
    query
  });

  const nearbyCity = homeCity.split(",")[0]?.toLowerCase() ?? homeCity.toLowerCase();
  const nearby = happening.filter((event) =>
    event.city.toLowerCase().includes(nearbyCity)
  );

  const softLaunches = launches
    .filter((launch) => !launch.eventId)
    .filter((launch) => {
      const haystack = `${launch.title} ${launch.description} ${launch.city} ${launch.fandomTags.join(" ")}`;
      return includesText(haystack, query);
    })
    .sort(
      (left, right) =>
        scoreSoftLaunch({ launch: right, homeCity, preferredFandoms, topInterest }) -
        scoreSoftLaunch({ launch: left, homeCity, preferredFandoms, topInterest })
    );

  return {
    happening,
    nearby,
    softLaunches
  };
}

export function buildCreatorsModeContent({
  creators,
  homeCity
}: {
  creators: CreatorSpotlight[];
  homeCity: string;
}) {
  const nearbyCity = homeCity.split(",")[0]?.toLowerCase() ?? homeCity.toLowerCase();

  return {
    creatorsOfWeek: creators.slice(0, 8),
    openToWork: creators.filter((creator) => creator.publicServices > 0).slice(0, 8),
    inYourScene: creators.filter((creator) =>
      creator.locationLabel.toLowerCase().includes(nearbyCity)
    )
  };
}
