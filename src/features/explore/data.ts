import { events } from "@/src/data/demo";
import { seedLaunches } from "@/src/data/launches";
import { createPosterDataUri } from "@/src/lib/demo-media";

export type HomeMode = "for_you" | "events" | "creators" | "genres";
export type EventContentFilter = "all" | "happening" | "soft_launch" | "nearby";

export type ExploreGenre = {
  id: string;
  label: string;
  description: string;
  matchTags: string[];
  imageUrl: string;
};

const fallbackGenreCover = createPosterDataUri({
  title: "Saga",
  subtitle: "Find your next night",
  eyebrow: "genres",
  accent: "#1F1CB8",
  accent2: "#6D5EF3"
});

const eventImage = (eventId: string) =>
  events.find((event) => event.id === eventId)?.posterUrl ?? fallbackGenreCover;

const launchImage = (launchId: string) =>
  seedLaunches.find((launch) => launch.id === launchId)?.coverImageUrl ?? fallbackGenreCover;

export const HOME_MODES: Array<{ id: HomeMode; label: string }> = [
  { id: "for_you", label: "For You" },
  { id: "events", label: "Events" },
  { id: "creators", label: "Creators" },
  { id: "genres", label: "Genres" }
];

export const EVENT_CONTENT_FILTERS: Array<{ id: EventContentFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "happening", label: "Happening" },
  { id: "soft_launch", label: "Soft launch" },
  { id: "nearby", label: "Nearby" }
];

export const EXPLORE_GENRES: ExploreGenre[] = [
  {
    id: "cupsleeves",
    label: "Cupsleeves",
    description: "Photo moments, freebies, and soft fandom meetups.",
    matchTags: ["cupsleeve", "fan mixer", "love and deepspace", "romance games"],
    imageUrl: eventImage("love-and-deepspace-afterdark")
  },
  {
    id: "raves",
    label: "Raves",
    description: "Late-night energy and louder fandom rooms.",
    matchTags: ["night out", "rave", "esports", "marvel rivals", "chainsaw man"],
    imageUrl: launchImage("marvel-rivals-night-shift")
  },
  {
    id: "girls-night",
    label: "Girls' night / LGBTQ+",
    description: "Dress-up hangs, glossy portraits, and group plans.",
    matchTags: ["fan mixer", "romance games", "queer nightlife", "creator nights"],
    imageUrl: eventImage("love-and-deepspace-afterdark")
  },
  {
    id: "watch-parties",
    label: "Watch parties",
    description: "Commentary, reactions, and fandom rooms that stay loud.",
    matchTags: ["watch party", "screening", "marvel rivals", "retro anime", "digimon"],
    imageUrl: eventImage("marvel-rivals-night-shift")
  },
  {
    id: "live-performance",
    label: "Live performance",
    description: "Hosts, showcases, and crowd-led moments.",
    matchTags: ["live drawing", "live music", "showcase", "idol nights"],
    imageUrl: eventImage("court-of-stars")
  },
  {
    id: "food-drink",
    label: "Food & drink",
    description: "Cafe hangs, dinner-coded plans, and low-pressure nights.",
    matchTags: ["meetup", "fan mixer", "social", "harbor", "food"],
    imageUrl: eventImage("digimon-night")
  },
  {
    id: "cosplay-meetups",
    label: "Cosplay meetups",
    description: "Photo-first hangs, creator tables, and fandom fit checks.",
    matchTags: ["cosplay", "genshin impact", "live drawing", "creator shoot"],
    imageUrl: eventImage("court-of-stars")
  },
  {
    id: "markets",
    label: "Markets",
    description: "Creator tables, merch runs, and weekend traffic.",
    matchTags: ["market", "vendors", "merch", "trackside social"],
    imageUrl: eventImage("uma-musume-trackside-social")
  },
  {
    id: "tournaments",
    label: "Tournaments",
    description: "Competitive rooms, commentary, and team energy.",
    matchTags: ["tournament", "esports", "competition", "marvel rivals"],
    imageUrl: eventImage("marvel-rivals-night-shift")
  }
];
