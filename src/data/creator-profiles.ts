import { events, seedFeedPosts, users } from "@/src/data/demo";
import { type MediaVerticalPosition } from "@/src/lib/media-position";
import { createPosterDataUri } from "@/src/lib/demo-media";

export type ServiceCoverStyle = "violet" | "gold" | "emerald" | "midnight";
export type ServicePricingMode = "hourly" | "flat";

export type ProfileService = {
  id: string;
  title: string;
  category?: string;
  pricingLabel: string;
  pricingMode?: ServicePricingMode;
  priceAmount?: number;
  openToVolunteering?: boolean;
  reviewScore?: number;
  reviewCount?: number;
  shortDescription?: string;
  coverStyle?: ServiceCoverStyle;
  coverImage?: string;
  coverImagePosition?: MediaVerticalPosition;
  visibleOnPublicProfile: boolean;
};

export type CreatorPortfolioItem = {
  id: string;
  image: string;
  title?: string;
  kind?: "photo" | "event" | "look" | "work";
};

export type ProfileStats = {
  publicPosts?: string | number;
  publicFollowers?: string | number;
  publicFollowing?: string | number;
  privateProjects?: string | number;
  privateRating?: number;
  privateServices?: string | number;
};

export type EarningsSummary = {
  total: string;
  available: string;
  pending: string;
  monthlyChangeLabel?: string;
};

export type CreatorProfile = {
  id: string;
  displayName: string;
  handle: string;
  location: string;
  bio: string;
  tags: string[];
  avatarImage: string;
  coverImage?: string;
  portfolio: CreatorPortfolioItem[];
  savedItems?: CreatorPortfolioItem[];
  services: ProfileService[];
  stats: ProfileStats;
  earnings?: EarningsSummary;
  isOwnProfile?: boolean;
};

function formatServicePriceAmount(value: number) {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2
  }).format(value);

  return `$${formatted}`;
}

export function formatServicePricing(service: Pick<ProfileService, "pricingLabel" | "pricingMode" | "priceAmount">) {
  if (typeof service.priceAmount === "number" && Number.isFinite(service.priceAmount)) {
    if (service.pricingMode === "hourly") {
      return `${formatServicePriceAmount(service.priceAmount)}/hr`;
    }

    if (service.pricingMode === "flat") {
      return `${formatServicePriceAmount(service.priceAmount)} rate`;
    }
  }

  return service.pricingLabel;
}

function getUser(userId: string) {
  return users.find((user) => user.id === userId);
}

function getEventImage(eventId: string) {
  return events.find((event) => event.id === eventId)?.posterUrl;
}

function getFeedImage(postId: string) {
  return seedFeedPosts.find((post) => post.id === postId)?.imageUrl;
}

function fallbackImage(title: string, subtitle: string) {
  return createPosterDataUri({
    title,
    subtitle,
    eyebrow: "profile",
    accent: "#1F1CB8",
    accent2: "#6D5EF3"
  });
}

function makePortfolio(items: Array<{ id: string; image?: string; title?: string; kind?: CreatorPortfolioItem["kind"] }>) {
  return items.map((item) => ({
    id: item.id,
    image: item.image ?? fallbackImage(item.title ?? "Saga", "Creator portfolio"),
    title: item.title,
    kind: item.kind
  }));
}

const aphexUser = getUser("user-rephos");
const kaiUser = getUser("user-kai");
const zoUser = getUser("user-zo");
const irisUser = getUser("user-iris");
const noaUser = getUser("user-noa");
const seraUser = getUser("user-sera");
const vivUser = getUser("user-viv");

export const seedCreatorProfiles: CreatorProfile[] = [
  {
    id: "user-rephos",
    displayName: "Aphex",
    handle: "@aphex",
    location: "Los Angeles, CA",
    bio: "Cosplayer and fan artist building anime nights, portrait sets, and polished creator drops.",
    tags: ["Cosplay", "Anime", "Fan artist", "Creator nights"],
    avatarImage: aphexUser?.avatarUrl ?? "",
    coverImage: getEventImage("court-of-stars") ?? fallbackImage("Aphex", "Creator page"),
    portfolio: makePortfolio([
      {
        id: "aphex-portfolio-1",
        image: getFeedImage("feed-post-image-1"),
        title: "Harbor portrait test",
        kind: "photo"
      },
      {
        id: "aphex-portfolio-2",
        image: getFeedImage("feed-post-image-2"),
        title: "Styling board",
        kind: "look"
      },
      {
        id: "aphex-portfolio-3",
        image: getEventImage("court-of-stars"),
        title: "Cosplay Live Drawing",
        kind: "event"
      },
      {
        id: "aphex-portfolio-4",
        image: getEventImage("love-and-deepspace-afterdark"),
        title: "After Dark portrait setup",
        kind: "work"
      },
      {
        id: "aphex-portfolio-5",
        image: getEventImage("jujutsu-night-out"),
        title: "Night-out promo set",
        kind: "work"
      },
      {
        id: "aphex-portfolio-6",
        image: getFeedImage("feed-post-image-3"),
        title: "Moodboard drop",
        kind: "look"
      }
    ]),
    savedItems: makePortfolio([
      {
        id: "aphex-saved-1",
        image: getEventImage("love-and-deepspace-afterdark"),
        title: "Love and Deepspace Event",
        kind: "event"
      },
      {
        id: "aphex-saved-2",
        image: getEventImage("marvel-rivals-night-shift"),
        title: "Marvel Rivals Night Shift",
        kind: "event"
      },
      {
        id: "aphex-saved-3",
        image: getEventImage("cosplay-figure-drawing"),
        title: "Genshin Scavenger Hunt",
        kind: "event"
      }
    ]),
    services: [
      {
        id: "service-aphex-1",
        category: "portraits",
        title: "Cosplay portrait sessions",
        pricingLabel: "$30/hr",
        pricingMode: "hourly",
        priceAmount: 30,
        reviewScore: 4.9,
        reviewCount: 28,
        shortDescription: "Portrait coverage and quick selects for fan meets, reveals, and launch nights.",
        coverImage: getFeedImage("feed-post-image-1"),
        visibleOnPublicProfile: true
      },
      {
        id: "service-aphex-2",
        category: "promo",
        title: "Creator promo kits",
        pricingLabel: "$240 rate",
        pricingMode: "flat",
        priceAmount: 240,
        reviewScore: 4.8,
        reviewCount: 14,
        shortDescription: "Teaser visuals, social crop sets, and light launch copy for fandom drops.",
        coverStyle: "violet",
        visibleOnPublicProfile: true
      },
      {
        id: "service-aphex-3",
        category: "hosting",
        title: "Backstage creator support",
        pricingLabel: "$120 rate",
        pricingMode: "flat",
        priceAmount: 120,
        shortDescription: "Run-of-night creator wrangling and check-ins for small artist-led events.",
        coverStyle: "midnight",
        visibleOnPublicProfile: false
      }
    ],
    stats: {
      publicPosts: 42,
      publicFollowers: "12.4K",
      publicFollowing: 384,
      privateProjects: 24,
      privateRating: 4.9,
      privateServices: 2
    },
    earnings: {
      total: "$2,847.50",
      available: "$1,240",
      pending: "$607",
      monthlyChangeLabel: "+18% this month"
    },
    isOwnProfile: true
  },
  {
    id: "user-sera",
    displayName: "Sera Watanabe",
    handle: "@serashots",
    location: "Los Angeles, CA",
    bio: "Soft-glam portrait photographer for romance-coded fandom nights and polished photo corners.",
    tags: ["Portraits", "Cosplay", "Love and Deepspace"],
    avatarImage: seraUser?.avatarUrl ?? "",
    coverImage: getEventImage("love-and-deepspace-afterdark") ?? fallbackImage("Sera", "Portrait profile"),
    portfolio: makePortfolio([
      { id: "sera-portfolio-1", image: getEventImage("love-and-deepspace-afterdark"), title: "Rafayel portrait booth", kind: "photo" },
      { id: "sera-portfolio-2", image: getFeedImage("feed-post-image-1"), title: "Soft-glam portrait test", kind: "photo" },
      { id: "sera-portfolio-3", image: getFeedImage("feed-post-image-2"), title: "Creator lounge portraits", kind: "work" },
      { id: "sera-portfolio-4", image: getEventImage("court-of-stars"), title: "Cosplay creator shoot", kind: "work" }
    ]),
    services: [
      {
        id: "service-sera-1",
        category: "portraits",
        title: "Portrait booth coverage",
        pricingLabel: "$35/hr",
        pricingMode: "hourly",
        priceAmount: 35,
        reviewScore: 4.9,
        reviewCount: 19,
        shortDescription: "Premium portraits for fan nights, romance game socials, and photo-first events.",
        coverImage: getEventImage("love-and-deepspace-afterdark"),
        visibleOnPublicProfile: true
      },
      {
        id: "service-sera-2",
        category: "portraits",
        title: "Polaroid keepsake packs",
        pricingLabel: "$80 rate",
        pricingMode: "flat",
        priceAmount: 80,
        shortDescription: "Fast-turnaround keepsakes for fan tables, guest moments, and meetups.",
        coverStyle: "gold",
        visibleOnPublicProfile: true
      }
    ],
    stats: {
      publicPosts: 28,
      publicFollowers: "8.9K",
      publicFollowing: 216,
      privateProjects: 16,
      privateRating: 4.8,
      privateServices: 2
    }
  },
  {
    id: "user-noa",
    displayName: "Noa Vega",
    handle: "@noavfx",
    location: "Pasadena, CA",
    bio: "Photo and aftermovie coverage for anime nights, creator salons, and loud little fandom rooms.",
    tags: ["Photography", "Reels", "Anime nights"],
    avatarImage: noaUser?.avatarUrl ?? "",
    coverImage: getEventImage("jujutsu-night-out") ?? fallbackImage("Noa", "Coverage profile"),
    portfolio: makePortfolio([
      { id: "noa-portfolio-1", image: getEventImage("jujutsu-night-out"), title: "Aftermovie frames", kind: "photo" },
      { id: "noa-portfolio-2", image: getEventImage("marvel-rivals-night-shift"), title: "Gameplay recap set", kind: "work" },
      { id: "noa-portfolio-3", image: getFeedImage("feed-post-image-3"), title: "Late-night fan portraits", kind: "photo" }
    ]),
    services: [
      {
        id: "service-noa-1",
        category: "coverage",
        title: "Event photo coverage",
        pricingLabel: "$260 starting",
        reviewScore: 4.8,
        reviewCount: 22,
        shortDescription: "Event coverage, quick selects, and recap edits for fandom nights.",
        coverImage: getEventImage("jujutsu-night-out"),
        visibleOnPublicProfile: true
      },
      {
        id: "service-noa-2",
        category: "coverage",
        title: "Aftermovie edit",
        pricingLabel: "$340 package",
        shortDescription: "Fast recap cuts for hosts who want next-day momentum.",
        coverStyle: "midnight",
        visibleOnPublicProfile: true
      }
    ],
    stats: {
      publicPosts: 18,
      publicFollowers: "6.2K",
      publicFollowing: 182,
      privateProjects: 12,
      privateRating: 4.7,
      privateServices: 2
    }
  },
  {
    id: "user-iris",
    displayName: "Iris Chen",
    handle: "@irisafterdark",
    location: "New York, NY",
    bio: "Host and commentator building game-night rooms with loud crowd energy and clean programming.",
    tags: ["Hosting", "Commentary", "Esports"],
    avatarImage: irisUser?.avatarUrl ?? "",
    coverImage: getEventImage("marvel-rivals-night-shift") ?? fallbackImage("Iris", "Host profile"),
    portfolio: makePortfolio([
      { id: "iris-portfolio-1", image: getEventImage("marvel-rivals-night-shift"), title: "Night Shift", kind: "event" },
      { id: "iris-portfolio-2", image: getEventImage("digimon-night"), title: "Retro watch room", kind: "event" },
      { id: "iris-portfolio-3", image: getFeedImage("feed-post-image-1"), title: "Commentary deck", kind: "work" }
    ]),
    services: [
      {
        id: "service-iris-1",
        category: "hosting",
        title: "Host and MC set",
        pricingLabel: "$300 starting",
        reviewScore: 4.9,
        reviewCount: 17,
        shortDescription: "On-stage hosting, commentary, and room energy for game nights and showcases.",
        coverImage: getEventImage("marvel-rivals-night-shift"),
        visibleOnPublicProfile: true
      },
      {
        id: "service-iris-2",
        category: "hosting",
        title: "Watch-party programming",
        pricingLabel: "$200 planning",
        shortDescription: "Format planning and crowd pacing for nights built around screens and commentary.",
        coverStyle: "violet",
        visibleOnPublicProfile: true
      }
    ],
    stats: {
      publicPosts: 24,
      publicFollowers: "9.1K",
      publicFollowing: 244,
      privateProjects: 19,
      privateRating: 4.8,
      privateServices: 2
    }
  },
  {
    id: "user-zo",
    displayName: "Zo Park",
    handle: "@zo",
    location: "Pasadena, CA",
    bio: "Series-minded host turning fandom dinners and drawing nights into repeatable city formats.",
    tags: ["Host", "Series builder", "Community nights"],
    avatarImage: zoUser?.avatarUrl ?? "",
    coverImage: getEventImage("court-of-stars") ?? fallbackImage("Zo", "Host profile"),
    portfolio: makePortfolio([
      { id: "zo-portfolio-1", image: getEventImage("court-of-stars"), title: "Cosplay Live Drawing", kind: "event" },
      { id: "zo-portfolio-2", image: getEventImage("love-and-deepspace-afterdark"), title: "After Dark dinner", kind: "event" },
      { id: "zo-portfolio-3", image: getFeedImage("feed-post-image-2"), title: "Series lookbook", kind: "look" }
    ]),
    services: [
      {
        id: "service-zo-1",
        category: "hosting",
        title: "Host consulting",
        pricingLabel: "$180 session",
        shortDescription: "Format framing and host-side polish for repeatable fandom nights.",
        coverStyle: "gold",
        visibleOnPublicProfile: true
      },
      {
        id: "service-zo-2",
        category: "hosting",
        title: "Run-of-show review",
        pricingLabel: "$120 review",
        shortDescription: "Guest flow, programming notes, and room pacing for community-led events.",
        coverStyle: "midnight",
        visibleOnPublicProfile: true
      }
    ],
    stats: {
      publicPosts: 31,
      publicFollowers: "15.8K",
      publicFollowing: 305,
      privateProjects: 21,
      privateRating: 5,
      privateServices: 2
    }
  },
  {
    id: "user-kai",
    displayName: "Kai Mercer",
    handle: "@kaigoesout",
    location: "Los Angeles, CA",
    bio: "Always collecting good plans, good people, and the fandom rooms worth showing up for.",
    tags: ["Scene regular", "Anime", "Night plans"],
    avatarImage: kaiUser?.avatarUrl ?? "",
    coverImage: getEventImage("love-and-deepspace-afterdark") ?? fallbackImage("Kai", "Scene profile"),
    portfolio: makePortfolio([
      { id: "kai-portfolio-1", image: getFeedImage("feed-post-image-3"), title: "Saved looks board", kind: "look" },
      { id: "kai-portfolio-2", image: getEventImage("jujutsu-night-out"), title: "Going out board", kind: "event" },
      { id: "kai-portfolio-3", image: getEventImage("digimon-night"), title: "Retro weeknight pick", kind: "event" }
    ]),
    savedItems: makePortfolio([
      { id: "kai-saved-1", image: getEventImage("court-of-stars"), title: "Cosplay Live Drawing", kind: "event" },
      { id: "kai-saved-2", image: getEventImage("marvel-rivals-night-shift"), title: "Night Shift", kind: "event" },
      { id: "kai-saved-3", image: getEventImage("digimon-night"), title: "Digimon Night", kind: "event" }
    ]),
    services: [
      {
        id: "service-kai-1",
        category: "hosting",
        title: "Community guest host",
        pricingLabel: "Invite case by case",
        shortDescription: "Great for welcoming first-timers, group arrivals, and soft social nights.",
        coverStyle: "emerald",
        visibleOnPublicProfile: false
      }
    ],
    stats: {
      publicPosts: 12,
      publicFollowers: 824,
      publicFollowing: 196,
      privateProjects: 8,
      privateRating: 4.5,
      privateServices: 1
    },
    earnings: {
      total: "$684.00",
      available: "$220",
      pending: "$94",
      monthlyChangeLabel: "+6% this month"
    }
  },
  {
    id: "user-viv",
    displayName: "Viv Calder",
    handle: "@vivhosts",
    location: "Los Angeles, CA",
    bio: "Venue-side partner helping launches find the right room, support, and repeat rhythm.",
    tags: ["Venue partner", "Launch support", "Hospitality"],
    avatarImage: vivUser?.avatarUrl ?? "",
    coverImage: getEventImage("marvel-rivals-night-shift") ?? fallbackImage("Viv", "Venue profile"),
    portfolio: makePortfolio([
      { id: "viv-portfolio-1", image: getEventImage("marvel-rivals-night-shift"), title: "Late-night room match", kind: "work" },
      { id: "viv-portfolio-2", image: getEventImage("court-of-stars"), title: "Gallery dinner fit", kind: "work" },
      { id: "viv-portfolio-3", image: getFeedImage("feed-post-image-2"), title: "Venue moodboard", kind: "look" }
    ]),
    services: [
      {
        id: "service-viv-1",
        category: "other",
        title: "Venue pairing",
        pricingLabel: "By fit",
        shortDescription: "Shortlist of rooms based on fandom, format, and guest flow needs.",
        coverImage: getEventImage("court-of-stars"),
        visibleOnPublicProfile: true
      },
      {
        id: "service-viv-2",
        category: "hosting",
        title: "Hospitality support",
        pricingLabel: "Support brief",
        shortDescription: "Lightweight support for business-side hosts joining creator-led launches.",
        coverStyle: "emerald",
        visibleOnPublicProfile: true
      }
    ],
    stats: {
      publicPosts: 15,
      publicFollowers: "4.3K",
      publicFollowing: 142,
      privateProjects: 14,
      privateRating: 4.7,
      privateServices: 2
    }
  }
];

export function getSeedCreatorProfileById(userId: string) {
  return seedCreatorProfiles.find((profile) => profile.id === userId);
}
