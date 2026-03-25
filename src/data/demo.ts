import {
  createAvatarDataUri,
  createPosterDataUri,
  createStoryCardDataUri
} from "@/src/lib/demo-media";

export type Persona = "host" | "creator" | "fan" | "business";
export type UserRoleType = "host" | "crew" | "creator" | "fan" | "business";
export type RoleStatus = "open" | "invited" | "filled";

export type DemoUser = {
  id: string;
  name: string;
  handle: string;
  roleType: UserRoleType;
  city: string;
  avatarUrl?: string;
  fandomTags: string[];
  skills: string[];
  pastEventsWorked: number;
  pricing: [number, number];
  mutuals: number;
  bio: string;
};

export type DemoEvent = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  fandomTags: string[];
  city: string;
  venue: string;
  startsAt: string;
  endsAt?: string;
  posterUrl: string;
  hostId: string;
  attendeesCount: number;
  mutualsCount: number;
  communityCount: number;
  featured?: boolean;
  recommended?: boolean;
  discoverFeatured?: boolean;
  priceLabel: string;
  isFree?: boolean;
};

export type RoleApplication = {
  applicantUserId: string;
  availability: string;
  quote: number;
  note: string;
  createdAt: string;
};

export type DemoRole = {
  id: string;
  eventId: string;
  roleName: string;
  status: RoleStatus;
  payoutRange: [number, number];
  requiredSkills: string[];
  filledByUserId?: string;
  invitedUserId?: string;
  applicants: RoleApplication[];
};

export type ThreadMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export type DemoThread = {
  id: string;
  eventId: string;
  roleId: string;
  participants: string[];
  draft: string;
  messages: ThreadMessage[];
};

export type CommunityThread = {
  id: string;
  title: string;
  description: string;
  fandomTags: string[];
  coverImageUrl: string;
  memberCount: number;
  activeNow: number;
  posts: Array<{
    id: string;
    authorId: string;
    text: string;
    likes: number;
    replies: number;
  }>;
};

export type FeedPostFormat = "image" | "story";

export type DemoFeedPost = {
  id: string;
  authorId: string;
  format: FeedPostFormat;
  title: string;
  caption: string;
  body?: string;
  imageUrl?: string;
  fandomTags: string[];
  createdAt: string;
  likes: number;
  comments: number;
};

const demoAssets = {
  universeMarvel: createPosterDataUri({
    title: "Rivals Lobby Chat",
    subtitle: "Hero draft debates, watch-party plans, and tournament calls",
    eyebrow: "community",
    accent: "#A23737",
    accent2: "#1F1CB8"
  }),
  universeGenshin: createPosterDataUri({
    title: "Digimon Night",
    subtitle: "Retro fandom mixer with projection battles and trading tables",
    eyebrow: "event",
    accent: "#4174FF",
    accent2: "#7CD9FF"
  }),
  eventCosplay: "/event-genshin-scavenger-hunt.png",
  eventCourt: "/cosplay-live-drawing-poster.png",
  eventDeepSpace: "/event-love-and-deepspace.jpg",
  eventUma: createPosterDataUri({
    title: "Uma Musume Dachi Meetup",
    subtitle: "Trackside social with merch tables and watch party energy",
    eyebrow: "recommended",
    accent: "#2B7CB7",
    accent2: "#7ED99C"
  }),
  eventGenshin: "/event-genshin-scavenger-hunt.png",
  eventCollab: createPosterDataUri({
    title: "Jujutsu Kaisen Night Out",
    subtitle: "Late-night fandom social with creator tables",
    eyebrow: "recommended",
    accent: "#6D5EF3",
    accent2: "#FF6B96"
  }),
  avatarZo: createAvatarDataUri("Zo Park", "#FF7A00", "#1F1CB8"),
  avatarRephos: createAvatarDataUri("Aphex", "#FF6B96", "#1F1CB8")
};

const generatedAvatar = (
  seed: string,
  accent = "#1F1CB8",
  secondary = "#5E8BFF"
) => createAvatarDataUri(seed, accent, secondary);

export const users: DemoUser[] = [
  {
    id: "user-zo",
    name: "Zo Park",
    handle: "@Zo",
    roleType: "host",
    city: "Pasadena, CA",
    avatarUrl: demoAssets.avatarZo,
    fandomTags: ["Love and Deepspace", "Cosplay", "Community Hosts"],
    skills: ["hosting", "community programming", "sponsors", "run of show"],
    pastEventsWorked: 14,
    pricing: [0, 0],
    mutuals: 48,
    bio: "Host who turns fandom dinners into repeatable city series."
  },
  {
    id: "user-rephos",
    name: "Aphex",
    handle: "@aphex",
    roleType: "creator",
    city: "Los Angeles, CA",
    avatarUrl: demoAssets.avatarRephos,
    fandomTags: ["Uma Musume", "Cosplay", "Creator Collabs"],
    skills: ["social promo", "creator coordination", "live content"],
    pastEventsWorked: 11,
    pricing: [300, 600],
    mutuals: 22,
    bio: "Creator-partner who helps events sell through fandom trust."
  },
  {
    id: "user-noa",
    name: "Noa Vega",
    handle: "@noavfx",
    roleType: "crew",
    city: "Pasadena, CA",
    avatarUrl: generatedAvatar("Noa Vega"),
    fandomTags: ["Love and Deepspace", "Cosplay", "Jujutsu Kaisen"],
    skills: ["photography", "reels", "aftermovie", "lighting"],
    pastEventsWorked: 7,
    pricing: [220, 420],
    mutuals: 14,
    bio: "Shoots polished aftermovies for anime nights and fandom salons."
  },
  {
    id: "user-aiko",
    name: "Aiko Navarro",
    handle: "@mixbyaiko",
    roleType: "crew",
    city: "Los Angeles, CA",
    avatarUrl: generatedAvatar("Aiko Navarro"),
    fandomTags: ["Love and Deepspace", "Cosplay", "K-Pop"],
    skills: ["dj", "audio", "playlist curation", "soundcheck"],
    pastEventsWorked: 12,
    pricing: [350, 700],
    mutuals: 9,
    bio: "Fandom club DJ with strong crossover pull."
  },
  {
    id: "user-mika",
    name: "Mika Santos",
    handle: "@mikamakes",
    roleType: "crew",
    city: "Pasadena, CA",
    avatarUrl: generatedAvatar("Mika Santos"),
    fandomTags: ["Love and Deepspace", "Cosplay", "Genshin Impact"],
    skills: ["decor", "set design", "install", "signage"],
    pastEventsWorked: 8,
    pricing: [250, 560],
    mutuals: 19,
    bio: "Known for transformable themed installs on tight turnarounds."
  },
  {
    id: "user-sera",
    name: "Sera Watanabe",
    handle: "@serashots",
    roleType: "crew",
    city: "Pasadena, CA",
    avatarUrl: generatedAvatar("Sera Watanabe"),
    fandomTags: ["Love and Deepspace", "Cosplay", "Romance Games"],
    skills: ["photography", "portrait lighting", "editing"],
    pastEventsWorked: 10,
    pricing: [300, 580],
    mutuals: 16,
    bio: "Portrait photographer who specializes in premium fandom imagery."
  },
  {
    id: "user-jules",
    name: "Jules Choi",
    handle: "@julesprints",
    roleType: "crew",
    city: "Los Angeles, CA",
    avatarUrl: generatedAvatar("Jules Choi"),
    fandomTags: ["Cosplay", "Jujutsu Kaisen", "Convention Life"],
    skills: ["photography", "merch ops", "check-in"],
    pastEventsWorked: 6,
    pricing: [180, 350],
    mutuals: 11,
    bio: "Flexible event utility player with strong con floor instincts."
  },
  {
    id: "user-iris",
    name: "Iris Chen",
    handle: "@irisafterdark",
    roleType: "creator",
    city: "New York, NY",
    avatarUrl: generatedAvatar("Iris Chen"),
    fandomTags: ["Marvel Rivals", "Chainsaw Man", "Anime NYC"],
    skills: ["social promo", "creator seeding", "guest lists"],
    pastEventsWorked: 13,
    pricing: [320, 540],
    mutuals: 29,
    bio: "Turns fandom hype into sold-out social nights."
  },
  {
    id: "user-kenji",
    name: "Kenji Flores",
    handle: "@kenjidoor",
    roleType: "crew",
    city: "Pasadena, CA",
    avatarUrl: generatedAvatar("Kenji Flores"),
    fandomTags: ["Love and Deepspace", "Cosplay", "J-Rock"],
    skills: ["check-in", "front of house", "guest lists", "security"],
    pastEventsWorked: 16,
    pricing: [160, 260],
    mutuals: 13,
    bio: "Fast, warm check-in lead who keeps premium lines moving."
  },
  {
    id: "user-tori",
    name: "Tori Hall",
    handle: "@toriguards",
    roleType: "crew",
    city: "Los Angeles, CA",
    avatarUrl: generatedAvatar("Tori Hall"),
    fandomTags: ["Cosplay", "Marvel Rivals", "Concert Nights"],
    skills: ["security", "load-in", "line management"],
    pastEventsWorked: 18,
    pricing: [220, 360],
    mutuals: 8,
    bio: "Trusted for fandom events that need calm crowd handling."
  },
  {
    id: "user-luca",
    name: "Luca Perez",
    handle: "@lucastages",
    roleType: "crew",
    city: "Los Angeles, CA",
    avatarUrl: generatedAvatar("Luca Perez"),
    fandomTags: ["Love and Deepspace", "Live Music", "Cosplay"],
    skills: ["run of show", "stage management", "audio"],
    pastEventsWorked: 15,
    pricing: [280, 520],
    mutuals: 10,
    bio: "Stage manager who can tighten a loose lineup in minutes."
  },
  {
    id: "user-rin",
    name: "Rin Takeda",
    handle: "@rinrooms",
    roleType: "crew",
    city: "Pasadena, CA",
    avatarUrl: generatedAvatar("Rin Takeda"),
    fandomTags: ["Love and Deepspace", "Romance Games", "Cosplay"],
    skills: ["decor", "florals", "wayfinding", "hospitality"],
    pastEventsWorked: 9,
    pricing: [240, 430],
    mutuals: 18,
    bio: "Builds intimate premium spaces fans photograph instantly."
  },
  {
    id: "user-dae",
    name: "Dae Moreno",
    handle: "@daecuts",
    roleType: "crew",
    city: "Los Angeles, CA",
    avatarUrl: generatedAvatar("Dae Moreno"),
    fandomTags: ["Love and Deepspace", "TikTok Fandom", "Cosplay"],
    skills: ["social promo", "reels", "copywriting", "creator outreach"],
    pastEventsWorked: 12,
    pricing: [190, 380],
    mutuals: 21,
    bio: "Ships fast social edits and creator outreach that converts."
  },
  {
    id: "user-mina",
    name: "Mina Ko",
    handle: "@minaruns",
    roleType: "crew",
    city: "Pasadena, CA",
    avatarUrl: generatedAvatar("Mina Ko"),
    fandomTags: ["Love and Deepspace", "Visual Novels", "Cosplay"],
    skills: ["check-in", "runner", "volunteer wrangling", "ops"],
    pastEventsWorked: 5,
    pricing: [120, 220],
    mutuals: 12,
    bio: "Reliable ops generalist with strong fan community ties."
  },
  {
    id: "user-zara",
    name: "Zara Bloom",
    handle: "@zaraframes",
    roleType: "crew",
    city: "New York, NY",
    avatarUrl: generatedAvatar("Zara Bloom"),
    fandomTags: ["Cosplay", "Uma Musume", "Fashion Events"],
    skills: ["photography", "fashion direction", "editing"],
    pastEventsWorked: 14,
    pricing: [320, 620],
    mutuals: 14,
    bio: "Elevates fandom events with editorial quality coverage."
  },
  {
    id: "user-kai",
    name: "Kai Mercer",
    handle: "@kaigoesout",
    roleType: "fan",
    city: "Los Angeles, CA",
    avatarUrl: generatedAvatar("Kai Mercer"),
    fandomTags: ["Jujutsu Kaisen", "Chainsaw Man", "Love and Deepspace"],
    skills: [],
    pastEventsWorked: 0,
    pricing: [0, 0],
    mutuals: 34,
    bio: "Collector of fandom nights, afterparties, and niche meetups."
  },
  {
    id: "user-lyra",
    name: "Lyra Sol",
    handle: "@lyralights",
    roleType: "crew",
    city: "Los Angeles, CA",
    avatarUrl: generatedAvatar("Lyra Sol"),
    fandomTags: ["Cosplay", "Photo Mode", "Genshin Impact"],
    skills: ["lighting", "photo booth", "portrait lighting"],
    pastEventsWorked: 8,
    pricing: [240, 460],
    mutuals: 9,
    bio: "Known for flattering lighting rigs in low-budget venues."
  },
  {
    id: "user-omar",
    name: "Omar Singh",
    handle: "@omarchecks",
    roleType: "crew",
    city: "New York, NY",
    avatarUrl: generatedAvatar("Omar Singh"),
    fandomTags: ["Marvel Rivals", "Anime NYC", "Esports"],
    skills: ["check-in", "ops", "vip desk"],
    pastEventsWorked: 10,
    pricing: [150, 280],
    mutuals: 7,
    bio: "Front-of-house lead for crowded fan activations."
  },
  {
    id: "user-pia",
    name: "Pia Laurent",
    handle: "@piaposters",
    roleType: "creator",
    city: "Los Angeles, CA",
    avatarUrl: generatedAvatar("Pia Laurent"),
    fandomTags: ["Uma Musume", "Cosplay", "Anime Art"],
    skills: ["poster design", "social promo", "brand kits"],
    pastEventsWorked: 9,
    pricing: [260, 480],
    mutuals: 13,
    bio: "Ships premium promo systems that make events feel bigger."
  },
  {
    id: "user-erin",
    name: "Erin Wolfe",
    handle: "@erinsound",
    roleType: "crew",
    city: "Los Angeles, CA",
    avatarUrl: generatedAvatar("Erin Wolfe"),
    fandomTags: ["Love and Deepspace", "Marvel Rivals", "Indie Pop"],
    skills: ["audio", "dj", "live mixing"],
    pastEventsWorked: 9,
    pricing: [300, 520],
    mutuals: 8,
    bio: "Audio operator who keeps fan performances from feeling amateur."
  },
  {
    id: "user-cass",
    name: "Cass Yoon",
    handle: "@cassfilms",
    roleType: "crew",
    city: "Pasadena, CA",
    avatarUrl: generatedAvatar("Cass Yoon"),
    fandomTags: ["Love and Deepspace", "Cosplay", "Film Clubs"],
    skills: ["aftermovie", "camera op", "editing"],
    pastEventsWorked: 11,
    pricing: [260, 500],
    mutuals: 17,
    bio: "Fast turnaround video editor with polished fandom instincts."
  },
  {
    id: "user-marlowe",
    name: "Marlowe Bell",
    handle: "@marlowegrid",
    roleType: "creator",
    city: "New York, NY",
    avatarUrl: generatedAvatar("Marlowe Bell"),
    fandomTags: ["Chainsaw Man", "Jujutsu Kaisen", "Creator Collabs"],
    skills: ["social promo", "creator seeding", "community moderation"],
    pastEventsWorked: 7,
    pricing: [230, 410],
    mutuals: 24,
    bio: "Community connector for fast-growing fandom pockets."
  },
  {
    id: "user-yuto",
    name: "Yuto Park",
    handle: "@yutolens",
    roleType: "crew",
    city: "Pasadena, CA",
    avatarUrl: generatedAvatar("Yuto Park"),
    fandomTags: ["Love and Deepspace", "Cosplay", "Visual Novels"],
    skills: ["photography", "portrait lighting", "guest experience"],
    pastEventsWorked: 9,
    pricing: [240, 440],
    mutuals: 15,
    bio: "Strong with intimate portrait setups and attendee coverage."
  },
  {
    id: "user-eva",
    name: "Eva Park",
    handle: "@evacollabs",
    roleType: "creator",
    city: "Pasadena, CA",
    avatarUrl: generatedAvatar("Eva Park"),
    fandomTags: ["Love and Deepspace", "Cosplay", "Romance Games"],
    skills: ["social promo", "creator outreach", "ticket pushes"],
    pastEventsWorked: 10,
    pricing: [210, 390],
    mutuals: 25,
    bio: "Moves fandom micro-communities from maybe to attending."
  },
  {
    id: "user-jasper",
    name: "Jasper Vale",
    handle: "@jasperline",
    roleType: "crew",
    city: "Los Angeles, CA",
    avatarUrl: generatedAvatar("Jasper Vale"),
    fandomTags: ["Cosplay", "Jujutsu Kaisen", "Horror Anime"],
    skills: ["security", "line management", "check-in"],
    pastEventsWorked: 13,
    pricing: [180, 300],
    mutuals: 6,
    bio: "Excellent at keeping character lines organized without killing vibe."
  },
  {
    id: "user-nami",
    name: "Nami Flores",
    handle: "@namirooms",
    roleType: "crew",
    city: "New York, NY",
    avatarUrl: generatedAvatar("Nami Flores"),
    fandomTags: ["Uma Musume", "Cosplay", "Cute Markets"],
    skills: ["decor", "merch tables", "hospitality"],
    pastEventsWorked: 8,
    pricing: [220, 400],
    mutuals: 12,
    bio: "Builds playful merch-forward rooms that sell well."
  },
  {
    id: "user-rye",
    name: "Rye Winters",
    handle: "@ryesocial",
    roleType: "creator",
    city: "Los Angeles, CA",
    avatarUrl: generatedAvatar("Rye Winters"),
    fandomTags: ["Marvel Rivals", "Esports", "Anime Nights"],
    skills: ["social promo", "content strategy", "copywriting"],
    pastEventsWorked: 9,
    pricing: [240, 420],
    mutuals: 18,
    bio: "Makes niche events feel internet-sized without losing specificity."
  },
  {
    id: "user-sel",
    name: "Sel Torres",
    handle: "@selsignals",
    roleType: "crew",
    city: "Los Angeles, CA",
    avatarUrl: generatedAvatar("Sel Torres"),
    fandomTags: ["Uma Musume", "Cosplay", "Creator Collabs"],
    skills: ["signage", "check-in", "wayfinding"],
    pastEventsWorked: 7,
    pricing: [150, 260],
    mutuals: 10,
    bio: "Keeps guest flow clear and premium in crowded layouts."
  },
  {
    id: "user-hana",
    name: "Hana Cruz",
    handle: "@hanahitrecord",
    roleType: "crew",
    city: "New York, NY",
    avatarUrl: generatedAvatar("Hana Cruz"),
    fandomTags: ["Marvel Rivals", "Chainsaw Man", "Cosplay"],
    skills: ["dj", "audio", "playlist curation"],
    pastEventsWorked: 12,
    pricing: [320, 600],
    mutuals: 11,
    bio: "Crowd-reading DJ tuned for fandom room energy."
  },
  {
    id: "user-ro",
    name: "Ro Kim",
    handle: "@roguestdesk",
    roleType: "crew",
    city: "Pasadena, CA",
    avatarUrl: generatedAvatar("Ro Kim"),
    fandomTags: ["Love and Deepspace", "Cosplay", "Community Hosts"],
    skills: ["check-in", "community moderation", "hospitality"],
    pastEventsWorked: 8,
    pricing: [150, 250],
    mutuals: 15,
    bio: "Blends ops discipline with fan-friendly hospitality."
  },
  {
    id: "user-sia",
    name: "Sia Morgan",
    handle: "@siabackdrop",
    roleType: "crew",
    city: "Los Angeles, CA",
    avatarUrl: generatedAvatar("Sia Morgan"),
    fandomTags: ["Cosplay", "Love and Deepspace", "Romance Games"],
    skills: ["decor", "photo booth", "fabrication"],
    pastEventsWorked: 6,
    pricing: [210, 370],
    mutuals: 9,
    bio: "Specializes in soft-glam photo moments fans share."
  },
  {
    id: "user-yumi",
    name: "Yumi Shah",
    handle: "@yumicrew",
    roleType: "crew",
    city: "New York, NY",
    avatarUrl: generatedAvatar("Yumi Shah"),
    fandomTags: ["Jujutsu Kaisen", "Anime NYC", "Cosplay"],
    skills: ["runner", "load-in", "ops", "guest lists"],
    pastEventsWorked: 9,
    pricing: [130, 220],
    mutuals: 8,
    bio: "Reliable floor utility for tight timelines and talent moves."
  },
  {
    id: "user-viv",
    name: "Viv Calder",
    handle: "@vivhosts",
    roleType: "business",
    city: "Los Angeles, CA",
    avatarUrl: generatedAvatar("Viv Calder", "#1F1CB8", "#7B57FF"),
    fandomTags: ["Venue Partners", "One Piece", "Marvel Rivals"],
    skills: ["venue programming", "brand support", "partnerships", "hospitality"],
    pastEventsWorked: 18,
    pricing: [0, 0],
    mutuals: 19,
    bio: "Business-side operator who likes fandom nights with repeat potential and strong creator pull."
  }
];

export const events: DemoEvent[] = [
  {
    id: "court-of-stars",
    title: "Cosplay Live Drawing",
    subtitle: "Timed sketch sets, live model poses, and creator table moments",
    description:
      "A live-drawing social where cosplayers rotate through spotlight poses, fans sketch in real time, and creators turn one art night into a recurring city format.",
    fandomTags: ["Cosplay", "Live Drawing"],
    city: "Pasadena, CA",
    venue: "Old Town Civic Hall",
    startsAt: "2026-07-18T19:00:00",
    endsAt: "2026-07-19T01:00:00",
    posterUrl: demoAssets.eventCourt,
    hostId: "user-zo",
    attendeesCount: 1420,
    mutualsCount: 17,
    communityCount: 482,
    featured: true,
    discoverFeatured: true,
    priceLabel: "$38+"
  },
  {
    id: "love-and-deepspace-afterdark",
    title: "Love and Deepspace Event",
    subtitle: "Formal fan mixer with creator showcases",
    description:
      "Premium fandom mixer designed for romantic roleplay, photo moments, and sponsor-friendly creator activations.",
    fandomTags: ["Love and Deepspace", "Fan Mixer"],
    city: "Pasadena, CA",
    venue: "Pasadena Playhouse Loft",
    startsAt: "2026-05-26T18:30:00",
    endsAt: "2026-05-31T23:30:00",
    posterUrl: demoAssets.eventDeepSpace,
    hostId: "user-zo",
    attendeesCount: 1200,
    mutualsCount: 12,
    communityCount: 390,
    recommended: true,
    priceLabel: "$32+"
  },
  {
    id: "cosplay-figure-drawing",
    title: "Genshin Scavenger Hunt",
    subtitle: "City clue trail ending in a fandom meetup, prizes, and photo drops",
    description:
      "A creator-led scavenger hunt that sends teams across the neighborhood, then pulls everyone into one shared finale with rewards, social content, and community momentum.",
    fandomTags: ["Genshin Impact", "Scavenger Hunt"],
    city: "Los Angeles, CA",
    venue: "KTown Studio Annex",
    startsAt: "2026-05-26T19:30:00",
    endsAt: "2026-05-31T23:00:00",
    posterUrl: demoAssets.eventCosplay,
    hostId: "user-rephos",
    attendeesCount: 1200,
    mutualsCount: 9,
    communityCount: 310,
    featured: true,
    recommended: true,
    priceLabel: "$26+"
  },
  {
    id: "uma-musume-trackside-social",
    title: "Uma Musume Dachi Meetup",
    subtitle: "Trackside social with merch tables and watch party energy",
    description:
      "A creator-led community night built to turn one meetup into a recurring fandom circuit.",
    fandomTags: ["Uma Musume", "Meetup"],
    city: "New York, NY",
    venue: "Hudson Commons",
    startsAt: "2026-04-25T18:00:00",
    endsAt: "2026-04-25T23:00:00",
    posterUrl: demoAssets.eventUma,
    hostId: "user-rephos",
    attendeesCount: 980,
    mutualsCount: 11,
    communityCount: 270,
    recommended: true,
    priceLabel: "$20+"
  },
  {
    id: "genshin-lantern-social",
    title: "Lantern Harbor Social",
    subtitle: "Photo-friendly fandom social with live cover sets",
    description:
      "A city-scaled social night that packages creator collabs, décor, and ticketed experiences into a repeatable format.",
    fandomTags: ["Genshin Impact", "Live Music"],
    city: "Los Angeles, CA",
    venue: "Little Tokyo Terrace",
    startsAt: "2026-04-11T19:00:00",
    endsAt: "2026-04-11T23:30:00",
    posterUrl: demoAssets.eventGenshin,
    hostId: "user-zo",
    attendeesCount: 1870,
    mutualsCount: 15,
    communityCount: 540,
    recommended: true,
    priceLabel: "$24+"
  },
  {
    id: "marvel-rivals-night-shift",
    title: "Marvel Rivals Night Shift",
    subtitle: "PvP watch party + creators-on-cast showcase",
    description:
      "A fandom-native tournament night with creator casting, role staffing, and sponsor moments built in.",
    fandomTags: ["Marvel Rivals", "Esports"],
    city: "New York, NY",
    venue: "BK Pixel Hall",
    startsAt: "2026-08-03T18:00:00",
    endsAt: "2026-08-03T23:45:00",
    posterUrl: demoAssets.universeMarvel,
    hostId: "user-iris",
    attendeesCount: 760,
    mutualsCount: 7,
    communityCount: 210,
    priceLabel: "$18+"
  },
  {
    id: "jujutsu-night-out",
    title: "Jujutsu Kaisen Night Out",
    subtitle: "Late-night fandom social with creator tables",
    description:
      "A compact fandom social optimized for trusted distribution and easy staffing from inside the scene.",
    fandomTags: ["Jujutsu Kaisen", "Night Out"],
    city: "Los Angeles, CA",
    venue: "Arts District Loft",
    startsAt: "2026-04-18T20:00:00",
    endsAt: "2026-04-19T00:30:00",
    posterUrl: demoAssets.eventCollab,
    hostId: "user-rephos",
    attendeesCount: 243,
    mutualsCount: 6,
    communityCount: 88,
    recommended: true,
    priceLabel: "$16+"
  },
  {
    id: "digimon-night",
    title: "Digimon Night",
    subtitle: "Retro fandom mixer with projection battles and trading tables",
    description:
      "A low-friction recurring series format for fandom nostalgia crowds and collaborative hosts.",
    fandomTags: ["Digimon", "Retro Anime"],
    city: "Los Angeles, CA",
    venue: "Echo Park Clubhouse",
    startsAt: "2026-04-11T18:00:00",
    endsAt: "2026-04-11T22:00:00",
    posterUrl: demoAssets.universeGenshin,
    hostId: "user-zo",
    attendeesCount: 187,
    mutualsCount: 3,
    communityCount: 74,
    priceLabel: "Free",
    isFree: true
  }
];

export const roles: DemoRole[] = [
  {
    id: "role-dj-court",
    eventId: "court-of-stars",
    roleName: "DJ",
    status: "filled",
    payoutRange: [350, 700],
    requiredSkills: ["dj", "audio", "playlist curation"],
    filledByUserId: "user-aiko",
    applicants: []
  },
  {
    id: "role-photo-court",
    eventId: "court-of-stars",
    roleName: "Photographer",
    status: "open",
    payoutRange: [260, 520],
    requiredSkills: ["photography", "portrait lighting", "editing"],
    applicants: [
      {
        applicantUserId: "user-yuto",
        availability: "Event day + portrait hour",
        quote: 420,
        note: "Already shooting Love and Deepspace portraits and can bring a compact lighting kit.",
        createdAt: "2026-03-09T11:22:00"
      }
    ]
  },
  {
    id: "role-door-court",
    eventId: "court-of-stars",
    roleName: "Door / Check-in",
    status: "filled",
    payoutRange: [150, 260],
    requiredSkills: ["check-in", "guest lists", "front of house"],
    filledByUserId: "user-kenji",
    applicants: []
  },
  {
    id: "role-decor-court",
    eventId: "court-of-stars",
    roleName: "Decor Lead",
    status: "invited",
    payoutRange: [240, 520],
    requiredSkills: ["decor", "set design", "install"],
    invitedUserId: "user-mika",
    applicants: []
  },
  {
    id: "role-promo-court",
    eventId: "court-of-stars",
    roleName: "Social Promo",
    status: "open",
    payoutRange: [200, 380],
    requiredSkills: ["social promo", "creator outreach", "copywriting"],
    applicants: [
      {
        applicantUserId: "user-eva",
        availability: "This week for teaser rollout",
        quote: 320,
        note: "Can handle creator outreach, ticket pushes, and same-day reminder edits.",
        createdAt: "2026-03-09T14:48:00"
      }
    ]
  },
  {
    id: "role-security-court",
    eventId: "court-of-stars",
    roleName: "Security",
    status: "filled",
    payoutRange: [200, 340],
    requiredSkills: ["security", "line management", "load-in"],
    filledByUserId: "user-tori",
    applicants: []
  },
  {
    id: "role-ops-cosplay",
    eventId: "cosplay-figure-drawing",
    roleName: "Session Ops",
    status: "open",
    payoutRange: [160, 240],
    requiredSkills: ["check-in", "ops", "hospitality"],
    applicants: [
      {
        applicantUserId: "user-mina",
        availability: "Load-in through close",
        quote: 210,
        note: "Comfortable with guest check-in, timed sessions, and floor resets.",
        createdAt: "2026-03-08T12:10:00"
      }
    ]
  },
  {
    id: "role-assist-cosplay",
    eventId: "cosplay-figure-drawing",
    roleName: "Photo Assistant",
    status: "open",
    payoutRange: [180, 300],
    requiredSkills: ["photography", "lighting", "runner"],
    applicants: [
      {
        applicantUserId: "user-jules",
        availability: "Event day",
        quote: 260,
        note: "Can float between lighting, crowd wrangling, and booth support.",
        createdAt: "2026-03-08T13:42:00"
      }
    ]
  },
  {
    id: "role-moderator-cosplay",
    eventId: "cosplay-figure-drawing",
    roleName: "Host / Moderator",
    status: "filled",
    payoutRange: [240, 420],
    requiredSkills: ["hosting", "run of show", "community programming"],
    filledByUserId: "user-rephos",
    applicants: []
  },
  {
    id: "role-capture-cosplay",
    eventId: "cosplay-figure-drawing",
    roleName: "Social Capture",
    status: "filled",
    payoutRange: [220, 360],
    requiredSkills: ["reels", "camera op", "editing"],
    filledByUserId: "user-noa",
    applicants: []
  },
  {
    id: "role-merch-uma",
    eventId: "uma-musume-trackside-social",
    roleName: "Merch Ops",
    status: "open",
    payoutRange: [150, 260],
    requiredSkills: ["merch tables", "check-in", "hospitality"],
    applicants: [
      {
        applicantUserId: "user-nami",
        availability: "Doors through merch close",
        quote: 240,
        note: "Strong on merch flow, hospitality, and keeping the room cute under pressure.",
        createdAt: "2026-03-07T15:14:00"
      }
    ]
  },
  {
    id: "role-dj-uma",
    eventId: "uma-musume-trackside-social",
    roleName: "Ambient DJ",
    status: "filled",
    payoutRange: [250, 420],
    requiredSkills: ["dj", "audio", "playlist curation"],
    filledByUserId: "user-hana",
    applicants: []
  },
  {
    id: "role-cam-uma",
    eventId: "uma-musume-trackside-social",
    roleName: "Fan Cam Editor",
    status: "invited",
    payoutRange: [220, 360],
    requiredSkills: ["aftermovie", "editing", "reels"],
    invitedUserId: "user-cass",
    applicants: []
  },
  {
    id: "role-decor-uma",
    eventId: "uma-musume-trackside-social",
    roleName: "Decor Lead",
    status: "filled",
    payoutRange: [220, 400],
    requiredSkills: ["decor", "merch tables", "hospitality"],
    filledByUserId: "user-nami",
    applicants: []
  },
  {
    id: "role-portrait-afterdark",
    eventId: "love-and-deepspace-afterdark",
    roleName: "Portrait Lead",
    status: "filled",
    payoutRange: [280, 520],
    requiredSkills: ["photography", "portrait lighting", "editing"],
    filledByUserId: "user-sera",
    applicants: []
  },
  {
    id: "role-guest-afterdark",
    eventId: "love-and-deepspace-afterdark",
    roleName: "Guest Experience",
    status: "open",
    payoutRange: [150, 250],
    requiredSkills: ["check-in", "hospitality", "community moderation"],
    applicants: [
      {
        applicantUserId: "user-ro",
        availability: "Doors to close",
        quote: 220,
        note: "Can keep check-in premium and handle fan questions without slowing the line.",
        createdAt: "2026-03-08T09:40:00"
      }
    ]
  },
  {
    id: "role-lighting-genshin",
    eventId: "genshin-lantern-social",
    roleName: "Lighting Lead",
    status: "filled",
    payoutRange: [240, 420],
    requiredSkills: ["lighting", "photo booth", "portrait lighting"],
    filledByUserId: "user-lyra",
    applicants: []
  },
  {
    id: "role-checkin-genshin",
    eventId: "genshin-lantern-social",
    roleName: "Community Check-in",
    status: "open",
    payoutRange: [140, 230],
    requiredSkills: ["check-in", "ops", "hospitality"],
    applicants: [
      {
        applicantUserId: "user-mina",
        availability: "Load-in + guest arrival block",
        quote: 200,
        note: "Fast at guest lists and moving fandom lines without losing warmth.",
        createdAt: "2026-03-08T10:12:00"
      }
    ]
  },
  {
    id: "role-comms-marvel",
    eventId: "marvel-rivals-night-shift",
    roleName: "Creator Comms",
    status: "filled",
    payoutRange: [220, 420],
    requiredSkills: ["social promo", "content strategy", "copywriting"],
    filledByUserId: "user-rye",
    applicants: []
  },
  {
    id: "role-ops-marvel",
    eventId: "marvel-rivals-night-shift",
    roleName: "Tournament Ops",
    status: "open",
    payoutRange: [160, 280],
    requiredSkills: ["check-in", "ops", "vip desk"],
    applicants: [
      {
        applicantUserId: "user-omar",
        availability: "Check-in through finals",
        quote: 250,
        note: "Can handle bracket arrivals, VIP desk, and creator guest flow.",
        createdAt: "2026-03-08T18:06:00"
      }
    ]
  },
  {
    id: "role-line-jujutsu",
    eventId: "jujutsu-night-out",
    roleName: "Line Ops",
    status: "filled",
    payoutRange: [170, 300],
    requiredSkills: ["security", "line management", "check-in"],
    filledByUserId: "user-jasper",
    applicants: []
  },
  {
    id: "role-capture-jujutsu",
    eventId: "jujutsu-night-out",
    roleName: "Social Capture",
    status: "open",
    payoutRange: [190, 340],
    requiredSkills: ["reels", "social promo", "camera op"],
    applicants: [
      {
        applicantUserId: "user-dae",
        availability: "Event night + teaser cut next morning",
        quote: 320,
        note: "Can shoot creator tables, punchy crowd clips, and next-day recap posts.",
        createdAt: "2026-03-08T20:18:00"
      }
    ]
  },
  {
    id: "role-guest-digimon",
    eventId: "digimon-night",
    roleName: "Guest Check-in",
    status: "filled",
    payoutRange: [130, 220],
    requiredSkills: ["check-in", "guest lists", "hospitality"],
    filledByUserId: "user-jules",
    applicants: []
  },
  {
    id: "role-merch-digimon",
    eventId: "digimon-night",
    roleName: "Merch Table",
    status: "open",
    payoutRange: [140, 240],
    requiredSkills: ["merch tables", "signage", "hospitality"],
    applicants: [
      {
        applicantUserId: "user-sel",
        availability: "Doors through merch teardown",
        quote: 210,
        note: "Strong on signage, cash handling, and keeping trading tables organized.",
        createdAt: "2026-03-07T11:36:00"
      }
    ]
  }
];

export const messages: DemoThread[] = [
  {
    id: "thread-court-decor",
    eventId: "court-of-stars",
    roleId: "role-decor-court",
    participants: ["user-zo", "user-mika"],
    draft:
      "Hey Mika, Saga thinks you are the strongest Decor Lead fit for Cosplay Live Drawing because you are local, you have staged premium cosplay rooms before, and Zo has 19 mutuals with you. Want me to lock you in at $460?",
    messages: [
      {
        id: "msg-court-decor-1",
        senderId: "user-zo",
        text:
          "Hey Mika, Saga put you at the top of our Decor Lead shortlist for Cosplay Live Drawing. Load-in starts at 4 PM and budget is $460. Interested?",
        createdAt: "2026-03-08T14:30:00"
      },
      {
        id: "msg-court-decor-2",
        senderId: "user-mika",
        text:
          "Yes. If we can get access to the room by 4, I can take decor lead and bring one assistant.",
        createdAt: "2026-03-08T15:04:00"
      }
    ]
  },
  {
    id: "thread-court-photo",
    eventId: "court-of-stars",
    roleId: "role-photo-court",
    participants: ["user-zo", "user-sera"],
    draft:
      "Hey Sera, you are local, already shoot premium cosplay portraits, and have 16 mutuals in this orbit. Could you cover Cosplay Live Drawing for $420?",
    messages: [
      {
        id: "msg-court-photo-1",
        senderId: "user-sera",
        text:
          "I can do the portrait set plus room candids if there is a dedicated lighting corner.",
        createdAt: "2026-03-09T11:22:00"
      }
    ]
  },
  {
    id: "thread-uma-cam",
    eventId: "uma-musume-trackside-social",
    roleId: "role-cam-uma",
    participants: ["user-rephos", "user-cass"],
    draft:
      "Cass already knows the pacing of creator-heavy fandom nights. Confirm them for a quick-cut fan cam package?",
    messages: [
      {
        id: "msg-uma-cam-1",
        senderId: "user-rephos",
        text: "Can you handle a same-night fan cam cut for the meetup reel?",
        createdAt: "2026-03-07T16:20:00"
      },
      {
        id: "msg-uma-cam-2",
        senderId: "user-cass",
        text: "Yes, if we keep pickups simple. I can turn the edit by brunch the next day.",
        createdAt: "2026-03-07T17:08:00"
      }
    ]
  }
];

export const featuredTags = [
  "#loveanddeepspace 4.5k",
  "#gojo",
  "#gojosatoru 200k",
  "#xavier",
  "#zayne",
  "#sylus",
  "#leo"
];

export const communityThreads: CommunityThread[] = [
  {
    id: "court-of-stars-builders",
    title: "One Piece",
    description:
      "A fandom thread for One Piece fans trading meetup concepts, cosplay roll calls, scavenger hunt ideas, and pirate-crew event plans.",
    fandomTags: ["One Piece", "Pirate Crews"],
    coverImageUrl: "/community-onepiece.jpg",
    memberCount: 8300,
    activeNow: 264,
    posts: [
      {
        id: "community-post-1",
        authorId: "user-zo",
        text:
          "Would you pull up for a One Piece harbor night with bounty posters, arc-themed teams, and a checkpoint hunt across the venue?",
        likes: 241,
        replies: 48
      },
      {
        id: "community-post-2",
        authorId: "user-mika",
        text:
          "Yes, but make each checkpoint feel like a different island. Fans should move through the room like they are joining a crew, not just standing in line for merch.",
        likes: 318,
        replies: 57
      },
      {
        id: "community-post-3",
        authorId: "user-eva",
        text:
          "Please add a Straw Hat photo dock and a trading table for manga pins. That turns it from a meetup into an actual One Piece night.",
        likes: 207,
        replies: 28
      }
    ]
  },
  {
    id: "uma-musume-paddock",
    title: "Avengers",
    description:
      "A Marvel fandom community for Avengers watch parties, cosplay briefings, creator collabs, and city-scale meetup ideas.",
    fandomTags: ["Avengers", "Marvel"],
    coverImageUrl: "/community-avengers.png",
    memberCount: 6900,
    activeNow: 152,
    posts: [
      {
        id: "community-post-4",
        authorId: "user-rephos",
        text:
          "If we stage an Avengers community night, should it feel more like a rooftop screening or a hero briefing with creator booths and fan activations?",
        likes: 167,
        replies: 39
      },
      {
        id: "community-post-5",
        authorId: "user-nami",
        text:
          "Hero briefing. Give every table a different team theme and one big assemble moment before the ticket push goes live.",
        likes: 284,
        replies: 46
      }
    ]
  },
  {
    id: "rivals-lobby-chat",
    title: "Rivals Lobby Chat",
    description:
      "Part thread, part signal feed. Fans post hot takes, local watch-party plans, and crews they trust for Marvel Rivals nights.",
    fandomTags: ["Marvel Rivals", "Esports"],
    coverImageUrl: demoAssets.universeMarvel,
    memberCount: 5300,
    activeNow: 142,
    posts: [
      {
        id: "community-post-6",
        authorId: "user-iris",
        text:
          "If your event has casters but no warm-up thread, you lose half the live energy before doors even open.",
        likes: 167,
        replies: 24
      },
      {
        id: "community-post-7",
        authorId: "user-rye",
        text:
          "The best events make the online banter feel continuous with the room. That means posting the matchups before the ticket link.",
        likes: 198,
        replies: 29
      }
    ]
  }
];

export const trendingCreatorIds = [
  "user-iris",
  "user-rephos",
  "user-pia",
  "user-marlowe",
  "user-rye",
  "user-eva"
];

export const seedFeedPosts: DemoFeedPost[] = [
  {
    id: "feed-post-story-1",
    authorId: "user-zo",
    format: "story",
    title: "The room changed when she stepped into the light.",
    caption:
      "Drafting a longer One Piece harbor-night scene for the community thread. Thinking about how story posts can sell the atmosphere before the ticket link ever drops.",
    body:
      "The room changed when she stepped into the light. Not because anyone announced her, and not because the music swelled, but because every conversation found the same pause at once. Glasses stopped halfway to lips. Dice stopped rolling across the bar top. Even the projector haze seemed to hold still long enough for the velvet blue in her coat to catch the lantern glow. If Saga works, this is the feeling I want to keep bottling: the second a fandom realizes the thing they only joked about online is suddenly happening around them in real space.",
    imageUrl: createStoryCardDataUri({
      title: "Draft Scene",
      excerpt:
        "The room changed when she stepped into the light. Every conversation paused just long enough for the lantern glow to turn the crowd into a story again."
    }),
    fandomTags: ["Fan Fiction", "One Piece", "Writing WIP"],
    createdAt: "2026-03-10T21:10:00",
    likes: 318,
    comments: 42
  },
  {
    id: "feed-post-image-1",
    authorId: "user-rephos",
    format: "image",
    title: "Look test from tonight's creator shoot",
    caption:
      "Pulling references for a late-night character editorial. This kind of portrait post is exactly what sells the mood before a fandom night opens doors.",
    imageUrl: "/feed/post-3.png",
    fandomTags: ["Cosplay", "Portrait Test", "Creator Shoot"],
    createdAt: "2026-03-10T18:44:00",
    likes: 509,
    comments: 61
  },
  {
    id: "feed-post-image-2",
    authorId: "user-iris",
    format: "image",
    title: "Soft launch fit check",
    caption:
      "When the styling is this clean, the post does half the distribution work for the event. Saving this as the reference for the next creator teaser drop.",
    imageUrl: "/feed/post-bbno.jpg",
    fandomTags: ["Fit Check", "Creator Drop", "Moodboard"],
    createdAt: "2026-03-10T16:08:00",
    likes: 684,
    comments: 87
  },
  {
    id: "feed-post-image-3",
    authorId: "user-rye",
    format: "image",
    title: "Meme post with real traction",
    caption:
      "The best fandom feeds mix polished promos with native internet energy. This one pulled comments from three local crews in under an hour.",
    imageUrl: "/feed/post-2.png",
    fandomTags: ["Meme", "Community Signal", "Reply Bait"],
    createdAt: "2026-03-10T12:26:00",
    likes: 921,
    comments: 119
  }
];

export const personaProfiles: Record<
  Persona,
  { label: string; userId: string; accent: string }
> = {
  host: { label: "Host", userId: "user-zo", accent: "Create event" },
  creator: { label: "Creator", userId: "user-iris", accent: "Find openings" },
  fan: { label: "Fan", userId: "user-kai", accent: "Get tickets" },
  business: { label: "Business", userId: "user-viv", accent: "Open matches" }
};

export function getEventById(eventId: string, eventList: DemoEvent[] = events) {
  return eventList.find((event) => event.id === eventId);
}

export function getUserById(userId?: string, userList: DemoUser[] = users) {
  if (!userId) {
    return undefined;
  }

  return userList.find((user) => user.id === userId);
}

export function getRolesForEvent(roleList: DemoRole[], eventId: string) {
  return roleList.filter((role) => role.eventId === eventId);
}

export function getThreadsForRole(
  threadList: DemoThread[],
  eventId: string,
  roleId: string
) {
  return threadList.filter(
    (thread) => thread.eventId === eventId && thread.roleId === roleId
  );
}

export function getCommunityById(communityId: string) {
  return communityThreads.find((community) => community.id === communityId);
}
