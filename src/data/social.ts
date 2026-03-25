import {
  communityThreads,
  events,
  seedFeedPosts,
  users
} from "@/src/data/demo";
import { createPosterDataUri } from "@/src/lib/demo-media";
import { type UserMode } from "@/src/data/launches";

export type UserIntent =
  | "attend events"
  | "discover people"
  | "create"
  | "perform"
  | "vend"
  | "host";

export type Fandom = {
  id: string;
  name: string;
  description: string;
  vibe: string;
  coverImageUrl: string;
  tags: string[];
  eventIds: string[];
  memberIds: string[];
};

export type PortfolioItem = {
  id: string;
  userId: string;
  title: string;
  caption: string;
  imageUrl: string;
  kind: "photo" | "event" | "set" | "post";
  linkedEventId?: string;
};

export type InterestState = {
  savedEventIds: string[];
  interestedEventIds: string[];
  goingEventIds: string[];
  followingIds: string[];
};

export type Relationship = {
  id: string;
  sourceUserId: string;
  targetUserId: string;
  kind: "follow" | "friend";
};

export type SocialActivityItem = {
  id: string;
  kind: "friend" | "event" | "follow" | "creator" | "room";
  actorIds: string[];
  title: string;
  body: string;
  href: string;
  createdAt: string;
  eventId?: string;
  fandomId?: string;
  imageUrl?: string;
};

export type UserProfile = {
  userId: string;
  headline: string;
  coverImageUrl: string;
  roleBadges: string[];
  fandoms: string[];
  servicesPreview: string[];
  upcomingEventIds: string[];
  pastEventIds: string[];
  portfolioItemIds: string[];
};

export type DemoPersonaPreset = {
  id: string;
  label: string;
  description: string;
  userId: string;
  mode: UserMode;
  intent: UserIntent;
};

const heroFallback = createPosterDataUri({
  title: "Saga Scene",
  subtitle: "People, fandoms, and nights worth planning around",
  eyebrow: "for you",
  accent: "#1F1CB8",
  accent2: "#6D5EF3"
});

export const fandoms: Fandom[] = [
  {
    id: "fandom-cosplay-studio",
    name: "Cosplay Studio Nights",
    description: "Portraits, styling sessions, live drawing nights, and creators who make the room feel cinematic.",
    vibe: "visual + creator-led",
    coverImageUrl: events.find((event) => event.id === "court-of-stars")?.posterUrl ?? heroFallback,
    tags: ["Cosplay", "Portraits", "Live Drawing"],
    eventIds: ["court-of-stars", "cosplay-figure-drawing"],
    memberIds: ["user-zo", "user-rephos", "user-noa", "user-mika", "user-sera"]
  },
  {
    id: "fandom-romance-games",
    name: "Romance Game Evenings",
    description: "Dress-up mixers, soft-glam photo moments, and fandom nights that feel date-coded in the best way.",
    vibe: "soft-glam",
    coverImageUrl:
      events.find((event) => event.id === "love-and-deepspace-afterdark")?.posterUrl ?? heroFallback,
    tags: ["Love and Deepspace", "Fan Mixer", "Photo Moments"],
    eventIds: ["love-and-deepspace-afterdark"],
    memberIds: ["user-zo", "user-sera", "user-sia", "user-kai"]
  },
  {
    id: "fandom-shonen-city",
    name: "Shonen City",
    description: "Late-night socials, scavenger hunts, and throwback series that pull fandom energy into the street.",
    vibe: "city-night",
    coverImageUrl: events.find((event) => event.id === "jujutsu-night-out")?.posterUrl ?? heroFallback,
    tags: ["Jujutsu Kaisen", "Genshin Impact", "Digimon"],
    eventIds: ["jujutsu-night-out", "cosplay-figure-drawing", "digimon-night"],
    memberIds: ["user-kai", "user-iris", "user-yumi", "user-jules", "user-kenji"]
  },
  {
    id: "fandom-hero-watch",
    name: "Hero Watch Parties",
    description: "Competitive nights, rooftop screenings, and commentary-led events for people who want the room buzzing.",
    vibe: "hype + loud",
    coverImageUrl: events.find((event) => event.id === "marvel-rivals-night-shift")?.posterUrl ?? heroFallback,
    tags: ["Marvel Rivals", "Esports", "Watch Party"],
    eventIds: ["marvel-rivals-night-shift"],
    memberIds: ["user-iris", "user-luca", "user-rye", "user-pia"]
  }
];

export const relationships: Relationship[] = [
  { id: "rel-1", sourceUserId: "user-kai", targetUserId: "user-rephos", kind: "follow" },
  { id: "rel-2", sourceUserId: "user-kai", targetUserId: "user-zo", kind: "follow" },
  { id: "rel-3", sourceUserId: "user-kai", targetUserId: "user-iris", kind: "friend" },
  { id: "rel-4", sourceUserId: "user-rephos", targetUserId: "user-noa", kind: "friend" },
  { id: "rel-5", sourceUserId: "user-rephos", targetUserId: "user-zo", kind: "follow" },
  { id: "rel-6", sourceUserId: "user-iris", targetUserId: "user-zo", kind: "follow" },
  { id: "rel-7", sourceUserId: "user-iris", targetUserId: "user-pia", kind: "friend" },
  { id: "rel-8", sourceUserId: "user-zo", targetUserId: "user-rephos", kind: "friend" },
  { id: "rel-9", sourceUserId: "user-zo", targetUserId: "user-sera", kind: "follow" },
  { id: "rel-10", sourceUserId: "user-luca", targetUserId: "user-rephos", kind: "follow" },
  { id: "rel-11", sourceUserId: "user-luca", targetUserId: "user-kai", kind: "friend" },
  { id: "rel-12", sourceUserId: "user-pia", targetUserId: "user-iris", kind: "follow" }
];

export const portfolioItems: PortfolioItem[] = [
  {
    id: "portfolio-aphex-1",
    userId: "user-rephos",
    title: "Harbor-night teaser shoot",
    caption: "Teaser portraits used to seed comments before the ticket drop.",
    imageUrl: seedFeedPosts.find((post) => post.id === "feed-post-image-1")?.imageUrl ?? heroFallback,
    kind: "photo",
    linkedEventId: "court-of-stars"
  },
  {
    id: "portfolio-aphex-2",
    userId: "user-rephos",
    title: "Creator styling board",
    caption: "Reference strip for fandom-fit styling and promo mood.",
    imageUrl: seedFeedPosts.find((post) => post.id === "feed-post-image-2")?.imageUrl ?? heroFallback,
    kind: "post"
  },
  {
    id: "portfolio-iris-1",
    userId: "user-iris",
    title: "Night Shift host deck",
    caption: "Community-led tournament night with commentary framing and cast timing.",
    imageUrl: events.find((event) => event.id === "marvel-rivals-night-shift")?.posterUrl ?? heroFallback,
    kind: "event",
    linkedEventId: "marvel-rivals-night-shift"
  },
  {
    id: "portfolio-noa-1",
    userId: "user-noa",
    title: "Aftermovie frames",
    caption: "Fast-turnaround photo and reel coverage for anime socials.",
    imageUrl: events.find((event) => event.id === "jujutsu-night-out")?.posterUrl ?? heroFallback,
    kind: "photo",
    linkedEventId: "jujutsu-night-out"
  },
  {
    id: "portfolio-mika-1",
    userId: "user-mika",
    title: "Soft-glam set build",
    caption: "Fabric, florals, and photo moments tuned for fandom portraits.",
    imageUrl: events.find((event) => event.id === "love-and-deepspace-afterdark")?.posterUrl ?? heroFallback,
    kind: "set",
    linkedEventId: "love-and-deepspace-afterdark"
  },
  {
    id: "portfolio-sera-1",
    userId: "user-sera",
    title: "Portrait gallery",
    caption: "Premium portrait coverage for romance-coded fandom nights.",
    imageUrl: events.find((event) => event.id === "love-and-deepspace-afterdark")?.posterUrl ?? heroFallback,
    kind: "photo",
    linkedEventId: "love-and-deepspace-afterdark"
  },
  {
    id: "portfolio-zo-1",
    userId: "user-zo",
    title: "Recurring city series",
    caption: "Showcase of repeatable fandom formats with trusted collaborators.",
    imageUrl: events.find((event) => event.id === "court-of-stars")?.posterUrl ?? heroFallback,
    kind: "event",
    linkedEventId: "court-of-stars"
  },
  {
    id: "portfolio-kai-1",
    userId: "user-kai",
    title: "Saved looks board",
    caption: "Moodboard of events, creators, and nights worth showing up for.",
    imageUrl: seedFeedPosts.find((post) => post.id === "feed-post-image-3")?.imageUrl ?? heroFallback,
    kind: "post"
  }
];

export const userProfiles: UserProfile[] = [
  {
    userId: "user-kai",
    headline: "Fan who plans nights around the people going, not just the poster.",
    coverImageUrl: events.find((event) => event.id === "love-and-deepspace-afterdark")?.posterUrl ?? heroFallback,
    roleBadges: ["Fan", "Scene regular"],
    fandoms: ["Love and Deepspace", "Jujutsu Kaisen", "Cosplay"],
    servicesPreview: ["Community hype", "plus-one wrangler"],
    upcomingEventIds: ["jujutsu-night-out", "love-and-deepspace-afterdark"],
    pastEventIds: ["digimon-night"],
    portfolioItemIds: ["portfolio-kai-1"]
  },
  {
    userId: "user-iris",
    headline: "Community host and creator who turns fandom energy into nights people remember.",
    coverImageUrl: events.find((event) => event.id === "marvel-rivals-night-shift")?.posterUrl ?? heroFallback,
    roleBadges: ["Creator", "Host"],
    fandoms: ["Marvel Rivals", "Jujutsu Kaisen", "Esports"],
    servicesPreview: ["Host", "On-camera", "Launch copy"],
    upcomingEventIds: ["marvel-rivals-night-shift", "jujutsu-night-out"],
    pastEventIds: ["digimon-night"],
    portfolioItemIds: ["portfolio-iris-1", "portfolio-aphex-2"]
  },
  {
    userId: "user-rephos",
    headline: "Hybrid fan-creator building scenes that feel shareable before doors open.",
    coverImageUrl: events.find((event) => event.id === "court-of-stars")?.posterUrl ?? heroFallback,
    roleBadges: ["Creator", "Fan"],
    fandoms: ["Cosplay", "Genshin Impact", "Creator Collabs"],
    servicesPreview: ["Social promo", "Creator coordination", "Live content"],
    upcomingEventIds: ["cosplay-figure-drawing", "court-of-stars"],
    pastEventIds: ["jujutsu-night-out"],
    portfolioItemIds: ["portfolio-aphex-1", "portfolio-aphex-2"]
  },
  {
    userId: "user-zo",
    headline: "Host building repeatable fandom formats with people fans already trust.",
    coverImageUrl: events.find((event) => event.id === "court-of-stars")?.posterUrl ?? heroFallback,
    roleBadges: ["Host", "Series builder"],
    fandoms: ["Cosplay", "Love and Deepspace", "Community Hosts"],
    servicesPreview: ["Hosting", "Venue programming", "Run of show"],
    upcomingEventIds: ["court-of-stars", "love-and-deepspace-afterdark"],
    pastEventIds: ["digimon-night"],
    portfolioItemIds: ["portfolio-zo-1"]
  },
  {
    userId: "user-noa",
    headline: "Visual storyteller trusted for aftermovies and room-defining highlight shots.",
    coverImageUrl: events.find((event) => event.id === "jujutsu-night-out")?.posterUrl ?? heroFallback,
    roleBadges: ["Photographer"],
    fandoms: ["Jujutsu Kaisen", "Cosplay", "Love and Deepspace"],
    servicesPreview: ["Photography", "Reels", "Aftermovie"],
    upcomingEventIds: ["court-of-stars"],
    pastEventIds: ["jujutsu-night-out", "love-and-deepspace-afterdark"],
    portfolioItemIds: ["portfolio-noa-1"]
  },
  {
    userId: "user-mika",
    headline: "Set and decor specialist who gives fandom nights a photo-first identity.",
    coverImageUrl: events.find((event) => event.id === "love-and-deepspace-afterdark")?.posterUrl ?? heroFallback,
    roleBadges: ["Contributor"],
    fandoms: ["Cosplay", "Genshin Impact", "Romance Games"],
    servicesPreview: ["Decor", "Set design", "Install"],
    upcomingEventIds: ["court-of-stars"],
    pastEventIds: ["love-and-deepspace-afterdark"],
    portfolioItemIds: ["portfolio-mika-1"]
  },
  {
    userId: "user-sera",
    headline: "Portrait photographer with a soft-glam look that fans instantly repost.",
    coverImageUrl: events.find((event) => event.id === "love-and-deepspace-afterdark")?.posterUrl ?? heroFallback,
    roleBadges: ["Contributor"],
    fandoms: ["Love and Deepspace", "Cosplay", "Romance Games"],
    servicesPreview: ["Portraits", "Photography", "Editing"],
    upcomingEventIds: ["court-of-stars"],
    pastEventIds: ["love-and-deepspace-afterdark"],
    portfolioItemIds: ["portfolio-sera-1"]
  },
  {
    userId: "user-viv",
    headline: "Venue-side partner helping fandom nights find the right room, support, and repeat cadence.",
    coverImageUrl: events.find((event) => event.id === "marvel-rivals-night-shift")?.posterUrl ?? heroFallback,
    roleBadges: ["Business", "Venue partner"],
    fandoms: ["One Piece", "Marvel Rivals", "Creator Events"],
    servicesPreview: ["Venue pairing", "Launch support", "Hospitality"],
    upcomingEventIds: ["court-of-stars", "marvel-rivals-night-shift"],
    pastEventIds: ["digimon-night"],
    portfolioItemIds: []
  }
];

export const socialActivityItems: SocialActivityItem[] = [
  {
    id: "activity-1",
    kind: "friend",
    actorIds: ["user-kai", "user-iris"],
    title: "Friends are leaning toward Jujutsu Kaisen Night Out",
    body: "Kai saved it first, then Iris dropped it into group chat with a fit board.",
    href: "/events/jujutsu-night-out",
    createdAt: "2026-03-10T19:44:00",
    eventId: "jujutsu-night-out",
    imageUrl: events.find((event) => event.id === "jujutsu-night-out")?.posterUrl
  },
  {
    id: "activity-2",
    kind: "creator",
    actorIds: ["user-rephos"],
    title: "Aphex posted a new look test",
    body: "A creator portrait draft is pulling comments from three local cosplay crews.",
    href: "/profile",
    createdAt: "2026-03-10T18:44:00",
    imageUrl: seedFeedPosts.find((post) => post.id === "feed-post-image-1")?.imageUrl
  },
  {
    id: "activity-3",
    kind: "event",
    actorIds: ["user-zo"],
    title: "Cosplay Live Drawing opened more slots",
    body: "The latest update added a creator table moment and a late sketch set.",
    href: "/events/court-of-stars",
    createdAt: "2026-03-10T17:28:00",
    eventId: "court-of-stars",
    imageUrl: events.find((event) => event.id === "court-of-stars")?.posterUrl
  },
  {
    id: "activity-4",
    kind: "room",
    actorIds: ["user-mika"],
    title: "One Piece room is picking a harbor theme",
    body: "Decor concepts are splitting between dockside market and full pirate tavern.",
    href: "/communities/court-of-stars-builders",
    createdAt: "2026-03-10T15:14:00",
    fandomId: "fandom-cosplay-studio",
    imageUrl: communityThreads[0]?.coverImageUrl
  },
  {
    id: "activity-5",
    kind: "friend",
    actorIds: ["user-luca", "user-pia"],
    title: "Two people you know saved Marvel Rivals Night Shift",
    body: "It is starting to feel like the obvious after-hours plan next month.",
    href: "/events/marvel-rivals-night-shift",
    createdAt: "2026-03-10T14:12:00",
    eventId: "marvel-rivals-night-shift",
    imageUrl: events.find((event) => event.id === "marvel-rivals-night-shift")?.posterUrl
  },
  {
    id: "activity-6",
    kind: "creator",
    actorIds: ["user-noa"],
    title: "Noa added new aftermovie frames",
    body: "Hosts keep reusing this edit stack for social nights and post-event recaps.",
    href: "/creators/user-noa",
    createdAt: "2026-03-10T13:32:00",
    imageUrl: events.find((event) => event.id === "jujutsu-night-out")?.posterUrl
  },
  {
    id: "activity-7",
    kind: "event",
    actorIds: ["user-rephos"],
    title: "Genshin Scavenger Hunt is almost full on early interest",
    body: "Teams are already plotting photo stops before the clue pack drops.",
    href: "/events/cosplay-figure-drawing",
    createdAt: "2026-03-10T11:18:00",
    eventId: "cosplay-figure-drawing",
    imageUrl: events.find((event) => event.id === "cosplay-figure-drawing")?.posterUrl
  },
  {
    id: "activity-8",
    kind: "follow",
    actorIds: ["user-kai"],
    title: "Kai followed Zo Park",
    body: "That means future host drops and repeat series will land higher in feed.",
    href: "/profiles/user-zo",
    createdAt: "2026-03-10T10:04:00"
  },
  {
    id: "activity-9",
    kind: "creator",
    actorIds: ["user-sera"],
    title: "Sera is available for portrait coverage this month",
    body: "Best fit: romance game nights, creator salons, and glossy cosplay socials.",
    href: "/creators/user-sera",
    createdAt: "2026-03-09T19:20:00",
    imageUrl: events.find((event) => event.id === "love-and-deepspace-afterdark")?.posterUrl
  },
  {
    id: "activity-10",
    kind: "room",
    actorIds: ["user-rephos"],
    title: "Avengers room wants a rooftop cutover moment",
    body: "The strongest ideas are blending hero briefing energy with creator tables.",
    href: "/communities/uma-musume-paddock",
    createdAt: "2026-03-09T17:52:00",
    imageUrl: communityThreads[1]?.coverImageUrl
  },
  {
    id: "activity-11",
    kind: "event",
    actorIds: ["user-zo"],
    title: "Love and Deepspace Event has a new photo set preview",
    body: "Soft lighting and formal fits are already doing the social proof work.",
    href: "/events/love-and-deepspace-afterdark",
    createdAt: "2026-03-09T16:41:00",
    eventId: "love-and-deepspace-afterdark",
    imageUrl: events.find((event) => event.id === "love-and-deepspace-afterdark")?.posterUrl
  },
  {
    id: "activity-12",
    kind: "friend",
    actorIds: ["user-kai", "user-rephos"],
    title: "Your scene keeps saving Digimon Night",
    body: "It is low-pressure, free, and quietly becoming the default end-of-week meetup.",
    href: "/events/digimon-night",
    createdAt: "2026-03-09T12:20:00",
    eventId: "digimon-night",
    imageUrl: events.find((event) => event.id === "digimon-night")?.posterUrl
  }
];

export const demoPersonaPresets: DemoPersonaPreset[] = [
  {
    id: "persona-fan",
    label: "Fan",
    description: "Kai is planning what to go to next.",
    userId: "user-kai",
    mode: "fan",
    intent: "attend events"
  },
  {
    id: "persona-creator",
    label: "Creator",
    description: "Iris is browsing openings and people in the scene.",
    userId: "user-iris",
    mode: "creator",
    intent: "perform"
  },
  {
    id: "persona-hybrid",
    label: "Hybrid",
    description: "Aphex moves between showing up as a fan and showing work as a creator.",
    userId: "user-rephos",
    mode: "creator",
    intent: "discover people"
  },
  {
    id: "persona-host",
    label: "Host",
    description: "Zo is balancing public discovery with host context.",
    userId: "user-zo",
    mode: "host",
    intent: "host"
  },
  {
    id: "persona-business",
    label: "Business",
    description: "Viv is looking for launches, creators, and rooms worth supporting.",
    userId: "user-viv",
    mode: "business",
    intent: "discover people"
  }
];

export const seedInterestStateByPersona: Record<string, InterestState> = {
  "persona-fan": {
    savedEventIds: ["court-of-stars", "love-and-deepspace-afterdark", "digimon-night"],
    interestedEventIds: ["cosplay-figure-drawing", "marvel-rivals-night-shift"],
    goingEventIds: ["jujutsu-night-out"],
    followingIds: ["user-zo", "user-rephos", "user-iris", "user-sera"]
  },
  "persona-creator": {
    savedEventIds: ["court-of-stars", "marvel-rivals-night-shift"],
    interestedEventIds: ["love-and-deepspace-afterdark", "uma-musume-trackside-social"],
    goingEventIds: ["cosplay-figure-drawing"],
    followingIds: ["user-zo", "user-pia", "user-noa", "user-kai"]
  },
  "persona-hybrid": {
    savedEventIds: ["jujutsu-night-out", "love-and-deepspace-afterdark"],
    interestedEventIds: ["court-of-stars", "digimon-night"],
    goingEventIds: ["cosplay-figure-drawing"],
    followingIds: ["user-zo", "user-kai", "user-noa", "user-mika"]
  },
  "persona-host": {
    savedEventIds: ["marvel-rivals-night-shift", "jujutsu-night-out"],
    interestedEventIds: ["love-and-deepspace-afterdark"],
    goingEventIds: ["court-of-stars"],
    followingIds: ["user-rephos", "user-sera", "user-iris", "user-noa"]
  },
  "persona-business": {
    savedEventIds: ["court-of-stars", "digimon-night"],
    interestedEventIds: ["marvel-rivals-night-shift"],
    goingEventIds: [],
    followingIds: ["user-zo", "user-rephos", "user-iris", "user-noa"]
  }
};

export function getPersonaPresetById(personaId: string) {
  return demoPersonaPresets.find((persona) => persona.id === personaId);
}

export function getDefaultPersonaIdForMode(mode: UserMode) {
  if (mode === "host") {
    return "persona-host";
  }
  if (mode === "business") {
    return "persona-business";
  }
  if (mode === "creator") {
    return "persona-creator";
  }
  return "persona-fan";
}

export function getModeForIntent(intent: UserIntent): UserMode {
  if (intent === "host") {
    return "host";
  }
  if (intent === "create" || intent === "perform" || intent === "vend") {
    return "creator";
  }
  return "fan";
}

export function getProfileByUserId(userId: string) {
  return userProfiles.find((profile) => profile.userId === userId);
}

export function getPortfolioForUser(userId: string) {
  return portfolioItems.filter((item) => item.userId === userId);
}

export function getRelationshipsForUser(userId: string) {
  return relationships.filter(
    (relationship) =>
      relationship.sourceUserId === userId || relationship.targetUserId === userId
  );
}

export function getFollowersForUser(userId: string) {
  return relationships.filter((relationship) => relationship.targetUserId === userId);
}

export function getFollowingForUser(userId: string) {
  return relationships.filter((relationship) => relationship.sourceUserId === userId);
}

export function getFriendsForUser(userId: string) {
  return relationships.filter(
    (relationship) =>
      relationship.kind === "friend" &&
      (relationship.sourceUserId === userId || relationship.targetUserId === userId)
  );
}

export function getSuggestedPeople(userId: string) {
  const following = new Set(getFollowingForUser(userId).map((relationship) => relationship.targetUserId));
  return users.filter(
    (user) => user.id !== userId && !following.has(user.id) && user.roleType !== "fan"
  );
}

export function getFandomById(fandomId: string) {
  return fandoms.find((fandom) => fandom.id === fandomId);
}
