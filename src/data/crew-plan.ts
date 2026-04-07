import { type CreatorProfile, formatServicePricing } from "@/src/data/creator-profiles";
import { type DemoUser } from "@/src/data/demo";
import { createPosterDataUri } from "@/src/lib/demo-media";
import { slugify } from "@/src/lib/utils";

export type BriefVisualStyle =
  | "Dark Editorial"
  | "Bright Pop"
  | "Neon Cyberpunk"
  | "Warm Vintage"
  | "Clean Minimal"
  | "Fantasy Ethereal"
  | "Street Raw"
  | "Pastel Soft";

export type CrewBudgetRange =
  | "Under $500"
  | "$500-$1,500"
  | "$1,500-$3,000"
  | "$3,000-$5,000"
  | "$5,000+";

export type CrewDeliverable =
  | "Photography"
  | "Videography"
  | "DJ / Music"
  | "Styling / Wardrobe"
  | "Decor / Set Design"
  | "Check-in / Ops"
  | "Host / MC"
  | "Live Art / Drawing"
  | "Photo Booth"
  | "Social Media Capture"
  | "Security"
  | "Catering Coordination";

export type CrewRoleKey =
  | "photographer"
  | "videographer"
  | "dj"
  | "stylist"
  | "decor_lead"
  | "checkin_ops"
  | "host_mc"
  | "live_artist"
  | "photo_booth"
  | "social_capture"
  | "security"
  | "catering";

export type CrewReviewMode = "visual" | "text";

export type CrewBriefInput = {
  id?: string;
  launchMode?: "soft" | "happening";
  format?: string;
  sizeBucket?: string;
  city?: string;
  neighborhood?: string;
  fandomTags?: string[];
  conceptVision?: string;
  visualDirectionSelections?: string[];
  crewBudgetRange?: string;
  deliverableSelections?: string[];
  briefStartDate?: string;
  briefEndDate?: string;
};

export type VisualStyleOption = {
  value: BriefVisualStyle;
  description: string;
  background: string;
};

export type CrewRoleSuggestion = {
  id: string;
  key: CrewRoleKey;
  title: string;
  rateRangeLabel: string;
  why: string;
};

export type CrewPlanCandidate = {
  id: string;
  userId: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  city: string;
  craft: string;
  rating: number;
  portfolioImages: string[];
  matchLabel: "Strong match" | "Good match" | "Style match";
  availabilityLabel: "Available" | "Check";
  rateLabel: string;
  matchReason: string;
  reviewMode: CrewReviewMode;
  styleTags: string[];
  pastWorkSummary: string;
  pastWorkHighlights: string[];
  isTopPick: boolean;
};

export type CrewPlanRole = {
  id: string;
  key: CrewRoleKey;
  reviewMode: CrewReviewMode;
  title: string;
  suggestedRateLabel: string;
  budgetFitLabel: string;
  whyThisRole: string;
  scopeSummary: string;
  matchCountLabel: string;
  statusLabel: "Ready to outreach" | "Needs review";
  matches: CrewPlanCandidate[];
};

type CrewRoleTemplate = {
  key: CrewRoleKey;
  title: string;
  deliverables: CrewDeliverable[];
  supplementalFor?: string[];
  minSizeToAutoInclude?: "51–100" | "101–250" | "250+";
  rateRange: [number, number];
  scopeSummary: string;
  craft: string;
  matchSkills: string[];
  poolUserIds: string[];
  why: string;
};

const VISUAL_STYLE_OPTIONS: VisualStyleOption[] = [
  {
    value: "Dark Editorial",
    description: "Shadowy, luxe, and image-led.",
    background:
      "radial-gradient(circle at top left, rgba(124,110,255,0.34), transparent 38%), linear-gradient(180deg, rgba(19,23,40,0.98), rgba(8,11,20,1))"
  },
  {
    value: "Bright Pop",
    description: "Glossy, colorful, and high-energy.",
    background:
      "radial-gradient(circle at 22% 18%, rgba(255,134,134,0.28), transparent 36%), radial-gradient(circle at 80% 25%, rgba(255,213,86,0.22), transparent 34%), linear-gradient(180deg, rgba(26,20,45,0.98), rgba(11,14,26,1))"
  },
  {
    value: "Neon Cyberpunk",
    description: "Electric, moody, and nightlife-first.",
    background:
      "radial-gradient(circle at top right, rgba(95,119,255,0.36), transparent 34%), radial-gradient(circle at bottom left, rgba(0,219,255,0.22), transparent 32%), linear-gradient(180deg, rgba(10,15,28,1), rgba(8,10,20,1))"
  },
  {
    value: "Warm Vintage",
    description: "Textured, romantic, and soft-lit.",
    background:
      "radial-gradient(circle at 18% 18%, rgba(255,190,124,0.26), transparent 36%), linear-gradient(180deg, rgba(38,26,28,0.98), rgba(14,12,18,1))"
  },
  {
    value: "Clean Minimal",
    description: "Controlled, modern, and polished.",
    background:
      "radial-gradient(circle at top, rgba(255,255,255,0.12), transparent 34%), linear-gradient(180deg, rgba(17,20,30,0.98), rgba(10,13,22,1))"
  },
  {
    value: "Fantasy Ethereal",
    description: "Glowy, dreamy, and immersive.",
    background:
      "radial-gradient(circle at top left, rgba(170,142,255,0.28), transparent 34%), radial-gradient(circle at bottom right, rgba(120,219,255,0.18), transparent 34%), linear-gradient(180deg, rgba(23,20,39,0.98), rgba(10,12,22,1))"
  },
  {
    value: "Street Raw",
    description: "Gritty, live, and documentary.",
    background:
      "radial-gradient(circle at 70% 20%, rgba(255,110,110,0.2), transparent 32%), linear-gradient(180deg, rgba(22,22,28,1), rgba(8,9,14,1))"
  },
  {
    value: "Pastel Soft",
    description: "Airy, playful, and fan-forward.",
    background:
      "radial-gradient(circle at top left, rgba(255,178,221,0.28), transparent 32%), radial-gradient(circle at top right, rgba(168,212,255,0.24), transparent 32%), linear-gradient(180deg, rgba(26,24,42,0.98), rgba(12,13,24,1))"
  }
];

export const BRIEF_VISUAL_STYLE_OPTIONS = VISUAL_STYLE_OPTIONS;

export const CREW_BUDGET_OPTIONS: CrewBudgetRange[] = [
  "Under $500",
  "$500-$1,500",
  "$1,500-$3,000",
  "$3,000-$5,000",
  "$5,000+"
];

export const CREW_PROCESSING_MESSAGES = [
  "Analyzing your brief...",
  "Identifying roles...",
  "Matching portfolios...",
  "Estimating rates..."
] as const;

export const ALL_CREW_DELIVERABLES: CrewDeliverable[] = [
  "Photography",
  "Videography",
  "DJ / Music",
  "Styling / Wardrobe",
  "Decor / Set Design",
  "Check-in / Ops",
  "Host / MC",
  "Live Art / Drawing",
  "Photo Booth",
  "Social Media Capture",
  "Security",
  "Catering Coordination"
];

const DELIVERABLE_PRIORITIES: Record<string, CrewDeliverable[]> = {
  "Cupsleeve / café meetup": [
    "Photography",
    "Host / MC",
    "Check-in / Ops",
    "Live Art / Drawing",
    "Social Media Capture",
    "Photo Booth"
  ],
  "Meetup / hangout": [
    "Photography",
    "Host / MC",
    "Check-in / Ops",
    "Social Media Capture",
    "Photo Booth",
    "Catering Coordination"
  ],
  "Watch party": [
    "Photography",
    "Host / MC",
    "Check-in / Ops",
    "Social Media Capture",
    "Catering Coordination",
    "Decor / Set Design"
  ],
  "Party / rave": [
    "Photography",
    "Videography",
    "DJ / Music",
    "Decor / Set Design",
    "Check-in / Ops",
    "Security",
    "Social Media Capture"
  ],
  "Live show / performance": [
    "Photography",
    "Videography",
    "DJ / Music",
    "Host / MC",
    "Styling / Wardrobe",
    "Check-in / Ops",
    "Security"
  ],
  "Market / vendor night": [
    "Photography",
    "Videography",
    "Decor / Set Design",
    "Check-in / Ops",
    "Host / MC",
    "Social Media Capture",
    "Catering Coordination"
  ],
  "Tournament / competition": [
    "Photography",
    "Videography",
    "Host / MC",
    "Check-in / Ops",
    "Decor / Set Design",
    "Social Media Capture",
    "Security"
  ],
  "Themed experience / ball": [
    "Photography",
    "Videography",
    "Host / MC",
    "Styling / Wardrobe",
    "Decor / Set Design",
    "Check-in / Ops",
    "DJ / Music"
  ]
};

const CREW_ROLE_TEMPLATES: CrewRoleTemplate[] = [
  {
    key: "photographer",
    title: "Photographer",
    deliverables: ["Photography"],
    supplementalFor: ["Cupsleeve / café meetup", "Themed experience / ball", "Party / rave"],
    rateRange: [200, 400],
    scopeSummary: "4 hours / hero selects / 48hr delivery",
    craft: "Photographer",
    matchSkills: ["photography", "portrait lighting", "editing", "reels"],
    poolUserIds: ["user-sera", "user-noa", "user-viv", "user-kai", "user-iris", "user-rephos"],
    why: "Captures the best shots for social content and post-event recaps."
  },
  {
    key: "videographer",
    title: "Videographer",
    deliverables: ["Videography"],
    supplementalFor: ["Party / rave", "Live show / performance"],
    rateRange: [250, 500],
    scopeSummary: "4 hours / recap cut / vertical teasers",
    craft: "Videographer",
    matchSkills: ["videography", "reels", "aftermovie", "editing", "lighting"],
    poolUserIds: ["user-noa", "user-viv", "user-rephos", "user-kai", "user-iris"],
    why: "Owns motion coverage, quick edits, and the hero recap package."
  },
  {
    key: "dj",
    title: "DJ",
    deliverables: ["DJ / Music"],
    supplementalFor: ["Party / rave", "Live show / performance"],
    rateRange: [250, 600],
    scopeSummary: "2 sets / sound check / custom playlist",
    craft: "DJ",
    matchSkills: ["dj", "audio", "soundcheck", "playlist curation"],
    poolUserIds: ["user-aiko", "user-zo", "user-viv", "user-noa"],
    why: "Sets the sonic tone and keeps energy moving all night."
  },
  {
    key: "stylist",
    title: "Stylist",
    deliverables: ["Styling / Wardrobe"],
    supplementalFor: ["Themed experience / ball", "Live show / performance"],
    rateRange: [180, 320],
    scopeSummary: "2 looks / touch-ups / quick fixes",
    craft: "Stylist",
    matchSkills: ["styling", "wardrobe", "mua", "costume"],
    poolUserIds: ["user-iris", "user-kai", "user-sera", "user-viv"],
    why: "Keeps wardrobe, silhouettes, and on-camera looks cohesive."
  },
  {
    key: "decor_lead",
    title: "Decor Lead",
    deliverables: ["Decor / Set Design"],
    supplementalFor: ["Themed experience / ball", "Market / vendor night"],
    rateRange: [250, 550],
    scopeSummary: "Install window / hero set / breakdown",
    craft: "Set designer",
    matchSkills: ["decor", "set design", "install", "signage"],
    poolUserIds: ["user-mika", "user-iris", "user-kai", "user-rephos"],
    why: "Builds the room, the photo moments, and the visible atmosphere."
  },
  {
    key: "checkin_ops",
    title: "Check-in Ops",
    deliverables: ["Check-in / Ops"],
    supplementalFor: ["Meetup / hangout", "Watch party", "Party / rave"],
    rateRange: [100, 200],
    scopeSummary: "Doors / guest list / wristbands / flow",
    craft: "Event ops",
    matchSkills: ["check-in", "front of house", "guest lists", "ops", "hospitality"],
    poolUserIds: ["user-zo", "user-kai", "user-rephos", "user-noa", "user-viv"],
    why: "Handles guest list, wristbands, and front-of-house flow."
  },
  {
    key: "host_mc",
    title: "Host / MC",
    deliverables: ["Host / MC"],
    supplementalFor: ["Meetup / hangout", "Watch party", "Themed experience / ball"],
    rateRange: [150, 300],
    scopeSummary: "Run of show / intros / room energy",
    craft: "Host",
    matchSkills: ["hosting", "community programming", "run of show", "guest hosting"],
    poolUserIds: ["user-zo", "user-kai", "user-rephos", "user-iris"],
    why: "Runs the room, manages the crowd energy, and keeps the night on schedule."
  },
  {
    key: "live_artist",
    title: "Live Artist",
    deliverables: ["Live Art / Drawing"],
    supplementalFor: ["Cupsleeve / café meetup", "Market / vendor night"],
    rateRange: [180, 360],
    scopeSummary: "Live table / 2 hero pieces / guest interaction",
    craft: "Illustrator",
    matchSkills: ["illustration", "live art", "fan artist", "creator coordination"],
    poolUserIds: ["user-rephos", "user-kai", "user-viv", "user-iris"],
    why: "Adds a live focal point that people photograph, share, and remember."
  },
  {
    key: "photo_booth",
    title: "Photo Moment",
    deliverables: ["Photo Booth"],
    supplementalFor: ["Cupsleeve / café meetup", "Themed experience / ball"],
    rateRange: [200, 400],
    scopeSummary: "Backdrop / line flow / same-night selects",
    craft: "Photo moment lead",
    matchSkills: ["photography", "portrait lighting", "set design", "social promo"],
    poolUserIds: ["user-sera", "user-noa", "user-mika", "user-viv"],
    why: "Captures the best shots for social content and post-event recaps."
  },
  {
    key: "social_capture",
    title: "Social Media Capture",
    deliverables: ["Social Media Capture"],
    supplementalFor: ["Meetup / hangout", "Watch party", "Party / rave"],
    rateRange: [180, 320],
    scopeSummary: "Vertical coverage / selects / same-night post",
    craft: "Content capture",
    matchSkills: ["social promo", "live content", "reels", "creator outreach"],
    poolUserIds: ["user-rephos", "user-noa", "user-viv", "user-kai", "user-sera"],
    why: "Keeps the project moving online while the event is happening."
  },
  {
    key: "security",
    title: "Security",
    deliverables: ["Security"],
    supplementalFor: ["Party / rave", "Live show / performance"],
    minSizeToAutoInclude: "101–250",
    rateRange: [200, 450],
    scopeSummary: "Door coverage / room checks / closeout",
    craft: "Guest safety lead",
    matchSkills: ["security", "guest lists", "front of house", "ops"],
    poolUserIds: ["user-zo", "user-kai", "user-viv", "user-noa"],
    why: "Protects guest flow and keeps the room calm once volume ramps up."
  },
  {
    key: "catering",
    title: "Catering Coordinator",
    deliverables: ["Catering Coordination"],
    supplementalFor: ["Watch party", "Market / vendor night"],
    rateRange: [150, 280],
    scopeSummary: "Vendor timing / service resets / guest support",
    craft: "Hospitality coordinator",
    matchSkills: ["hospitality", "ops", "community moderation", "guest lists"],
    poolUserIds: ["user-zo", "user-kai", "user-rephos", "user-viv"],
    why: "Keeps food, drink, and service timing from slowing the room down."
  }
];

const SIZE_ORDER = ["Up to 20", "21–50", "51–100", "101–250", "250+"] as const;
const TEXT_REVIEW_ROLE_KEYS = new Set<CrewRoleKey>(["checkin_ops", "host_mc", "security", "catering"]);
const VISUAL_STYLE_KEYWORDS: Array<{ keywords: string[]; styles: BriefVisualStyle[] }> = [
  { keywords: ["neon", "cyber", "late night", "club", "rave"], styles: ["Neon Cyberpunk", "Dark Editorial"] },
  { keywords: ["pastel", "soft", "cute", "cupsleeve", "k-pop"], styles: ["Pastel Soft", "Bright Pop"] },
  { keywords: ["fantasy", "ethereal", "ball", "cosplay"], styles: ["Fantasy Ethereal", "Dark Editorial"] },
  { keywords: ["minimal", "clean", "brand", "slick"], styles: ["Clean Minimal", "Bright Pop"] },
  { keywords: ["vintage", "romantic", "warm"], styles: ["Warm Vintage", "Fantasy Ethereal"] },
  { keywords: ["street", "raw", "documentary"], styles: ["Street Raw", "Dark Editorial"] }
];
const DELIVERABLE_KEYWORDS: Array<{ keywords: string[]; deliverables: CrewDeliverable[] }> = [
  { keywords: ["photo", "photography", "portrait"], deliverables: ["Photography"] },
  { keywords: ["video", "videography", "recap", "aftermovie"], deliverables: ["Videography"] },
  { keywords: ["dj", "music", "playlist", "sound"], deliverables: ["DJ / Music"] },
  { keywords: ["style", "wardrobe", "costume", "glam"], deliverables: ["Styling / Wardrobe"] },
  { keywords: ["decor", "set", "install", "backdrop"], deliverables: ["Decor / Set Design", "Photo Booth"] },
  { keywords: ["ops", "check-in", "guest list", "door"], deliverables: ["Check-in / Ops"] },
  { keywords: ["host", "mc", "programming"], deliverables: ["Host / MC"] },
  { keywords: ["drawing", "live art", "artist alley"], deliverables: ["Live Art / Drawing"] },
  { keywords: ["social", "reels", "content"], deliverables: ["Social Media Capture"] },
  { keywords: ["security", "safety"], deliverables: ["Security"] },
  { keywords: ["food", "drink", "catering"], deliverables: ["Catering Coordination"] }
];
const FANDOM_KEYWORDS: Array<{ keywords: string[]; tags: string[] }> = [
  { keywords: ["anime", "cosplay", "ball"], tags: ["Anime", "Cosplay"] },
  { keywords: ["genshin", "hoyoverse"], tags: ["Genshin Impact"] },
  { keywords: ["jjk", "jujutsu"], tags: ["Jujutsu Kaisen"] },
  { keywords: ["marvel"], tags: ["Marvel"] },
  { keywords: ["k-pop", "kpop"], tags: ["K-pop"] },
  { keywords: ["gaming", "tournament", "esports"], tags: ["Gaming"] },
  { keywords: ["creator", "meetup"], tags: ["Creator meetup"] }
];

function getSizeIndex(sizeBucket?: string) {
  const index = SIZE_ORDER.findIndex((item) => item === sizeBucket);
  return index >= 0 ? index : 0;
}

function resolveReviewMode(key: CrewRoleKey): CrewReviewMode {
  return TEXT_REVIEW_ROLE_KEYS.has(key) ? "text" : "visual";
}

function buildBriefHaystack(input: CrewBriefInput) {
  return [
    input.format,
    input.conceptVision,
    input.city,
    input.fandomTags?.join(" "),
    input.visualDirectionSelections?.join(" ")
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

function midpoint(low: number, high: number) {
  return Math.round((low + high) / 2);
}

function fallbackPortfolioImage(name: string, title: string, accent: string, accent2: string) {
  return createPosterDataUri({
    title,
    subtitle: name,
    eyebrow: "portfolio",
    accent,
    accent2
  });
}

function resolveCreatorRating(profile?: CreatorProfile, user?: DemoUser) {
  if (typeof profile?.stats.privateRating === "number") {
    return profile.stats.privateRating;
  }

  const serviceRating = profile?.services.find((service) => typeof service.reviewScore === "number")?.reviewScore;
  if (typeof serviceRating === "number") {
    return serviceRating;
  }

  if (user) {
    return Math.max(4.2, Math.min(5, 4.2 + user.pastEventsWorked * 0.05));
  }

  return 4.6;
}

function resolvePortfolioImages(profile: CreatorProfile | undefined, user: DemoUser | undefined, roleTitle: string) {
  if (profile?.portfolio.length) {
    return profile.portfolio.slice(0, 3).map((item) => item.image);
  }

  const name = user?.name ?? "Saga Creator";
  return [
    fallbackPortfolioImage(name, roleTitle, "#1F1CB8", "#6D5EF3"),
    fallbackPortfolioImage(name, "Event still", "#0E7E74", "#58D9B2"),
    fallbackPortfolioImage(name, "Mood frame", "#A86C11", "#F0C453")
  ];
}

function inferCraft(template: CrewRoleTemplate, profile?: CreatorProfile, user?: DemoUser) {
  if (profile?.services[0]?.category) {
    return profile.services[0].category;
  }

  if (user?.skills[0]) {
    return user.skills[0];
  }

  return template.craft;
}

function inferRateLabel(template: CrewRoleTemplate, profile?: CreatorProfile, user?: DemoUser) {
  const matchingService = profile?.services.find((service) => {
    const haystack = `${service.category ?? ""} ${service.title}`.toLowerCase();
    return template.matchSkills.some((skill) => haystack.includes(skill.toLowerCase()));
  });

  if (matchingService) {
    return formatServicePricing(matchingService);
  }

  if (user?.pricing) {
    return `${formatCurrency(user.pricing[0])}-${formatCurrency(user.pricing[1])}`;
  }

  return `${formatCurrency(template.rateRange[0])}-${formatCurrency(template.rateRange[1])}`;
}

function inferMatchReason(input: CrewBriefInput, template: CrewRoleTemplate, user?: DemoUser, profile?: CreatorProfile) {
  const scene = input.visualDirectionSelections?.[0] ?? profile?.tags[0] ?? user?.fandomTags[0] ?? "Scene fit";
  const city = input.city || user?.city || "local";
  const eventCount = user?.pastEventsWorked ?? 4;
  return `${scene} / ${Math.max(2, Math.min(6, eventCount))} similar ${city.split(",")[0]} events`;
}

function inferAvailability(user?: DemoUser) {
  if (!user) {
    return "Available" as const;
  }

  return user.mutuals > 20 ? "Available" : "Check";
}

function inferStyleTags(
  input: CrewBriefInput,
  template: CrewRoleTemplate,
  profile?: CreatorProfile,
  user?: DemoUser
) {
  return [
    ...(input.visualDirectionSelections ?? []).slice(0, 2),
    profile?.tags?.[0],
    user?.fandomTags?.[0],
    template.craft
  ]
    .filter(Boolean)
    .slice(0, 3) as string[];
}

function inferPastWorkSummary(
  input: CrewBriefInput,
  template: CrewRoleTemplate,
  user?: DemoUser
) {
  const city = input.city || user?.city || "your city";
  const eventCount = user?.pastEventsWorked ?? 5;
  const scene = input.format?.toLowerCase() ?? "fan-led productions";
  return `${user?.name ?? "This creator"} has supported ${eventCount}+ ${scene} projects around ${city.split(",")[0]} and aligns well with ${template.title.toLowerCase()} needs.`;
}

function inferPastWorkHighlights(
  input: CrewBriefInput,
  template: CrewRoleTemplate,
  user?: DemoUser
) {
  const city = input.city || user?.city || "local";
  return [
    `${Math.max(3, user?.pastEventsWorked ?? 5)} similar projects completed`,
    `Best fit for ${city.split(",")[0]} crews and ${template.scopeSummary.toLowerCase()}`,
    `Strengths: ${(user?.skills ?? template.matchSkills).slice(0, 3).join(", ")}`
  ];
}

function pickTemplateCandidates(
  template: CrewRoleTemplate,
  input: CrewBriefInput,
  creatorProfiles: CreatorProfile[],
  users: DemoUser[]
) {
  const profileMap = new Map(creatorProfiles.map((profile) => [profile.id, profile]));
  const userMap = new Map(users.map((user) => [user.id, user]));
  const pools = template.poolUserIds
    .map((userId) => ({ profile: profileMap.get(userId), user: userMap.get(userId) }))
    .filter((entry) => entry.profile || entry.user);

  return pools.slice(0, 6).map((entry, index) => {
    const user = entry.user ?? (entry.profile ? userMap.get(entry.profile.id) : undefined);
    const profile = entry.profile;
    const matchLabel = index === 0 ? "Strong match" : index < 3 ? "Good match" : "Style match";

    return {
      id: `${template.key}-${profile?.id ?? user?.id ?? index}`,
      userId: profile?.id ?? user?.id ?? `${template.key}-${index}`,
      name: profile?.displayName ?? user?.name ?? "Saga Creator",
      handle: profile?.handle ?? user?.handle ?? "@sagacreator",
      avatarUrl: profile?.avatarImage ?? user?.avatarUrl,
      city: profile?.location ?? user?.city ?? input.city ?? "Los Angeles, CA",
      craft: inferCraft(template, profile, user),
      rating: resolveCreatorRating(profile, user),
      portfolioImages: resolvePortfolioImages(profile, user, template.title),
      matchLabel,
      availabilityLabel: inferAvailability(user),
      rateLabel: inferRateLabel(template, profile, user),
      matchReason: inferMatchReason(input, template, user, profile),
      reviewMode: resolveReviewMode(template.key),
      styleTags: inferStyleTags(input, template, profile, user),
      pastWorkSummary: inferPastWorkSummary(input, template, user),
      pastWorkHighlights: inferPastWorkHighlights(input, template, user),
      isTopPick: index === 0
    } satisfies CrewPlanCandidate;
  });
}

function shouldAutoIncludeTemplate(template: CrewRoleTemplate, input: CrewBriefInput) {
  if (template.minSizeToAutoInclude) {
    return getSizeIndex(input.sizeBucket) >= getSizeIndex(template.minSizeToAutoInclude);
  }

  return false;
}

function resolveSelectedDeliverables(input: CrewBriefInput) {
  if (input.deliverableSelections?.length) {
    return input.deliverableSelections as CrewDeliverable[];
  }

  const haystack = buildBriefHaystack(input);
  const keywordMatches = DELIVERABLE_KEYWORDS.flatMap((entry) =>
    entry.keywords.some((keyword) => haystack.includes(keyword)) ? entry.deliverables : []
  );
  const formatDefaults = input.format ? DELIVERABLE_PRIORITIES[input.format] : undefined;
  return [...new Set([...(keywordMatches as CrewDeliverable[]), ...((formatDefaults ?? ALL_CREW_DELIVERABLES.slice(0, 4)) as CrewDeliverable[])])].slice(0, 6);
}

export function getDeliverableOptionsForFormat(format?: string) {
  const prioritized = format ? DELIVERABLE_PRIORITIES[format] ?? [] : [];
  const remainder = ALL_CREW_DELIVERABLES.filter((item) => !prioritized.includes(item));
  return [...prioritized, ...remainder];
}

export function inferDeliverablesFromBrief(input: CrewBriefInput) {
  return resolveSelectedDeliverables(input);
}

export function inferFandomTagsFromBrief(input: CrewBriefInput) {
  if (input.fandomTags?.length) {
    return input.fandomTags.slice(0, 3);
  }

  const haystack = buildBriefHaystack(input);
  const matched = FANDOM_KEYWORDS.flatMap((entry) =>
    entry.keywords.some((keyword) => haystack.includes(keyword)) ? entry.tags : []
  );

  if (matched.length > 0) {
    return [...new Set(matched)].slice(0, 3);
  }

  if (haystack.includes("fan")) {
    return ["Fandom"];
  }

  return input.format === "Tournament / competition" ? ["Gaming"] : ["Anime"];
}

export function inferVisualDirectionSelections(input: CrewBriefInput): BriefVisualStyle[] {
  if (input.visualDirectionSelections?.length) {
    return input.visualDirectionSelections.slice(0, 3) as BriefVisualStyle[];
  }

  const haystack = buildBriefHaystack(input);
  const matched = VISUAL_STYLE_KEYWORDS.flatMap((entry) =>
    entry.keywords.some((keyword) => haystack.includes(keyword)) ? entry.styles : []
  );

  const fallbackByFormat: Record<string, BriefVisualStyle[]> = {
    "Party / rave": ["Neon Cyberpunk", "Dark Editorial"],
    "Live show / performance": ["Dark Editorial", "Street Raw"],
    "Themed experience / ball": ["Fantasy Ethereal", "Dark Editorial"],
    "Cupsleeve / café meetup": ["Pastel Soft", "Bright Pop"],
    "Watch party": ["Bright Pop", "Clean Minimal"],
    "Market / vendor night": ["Warm Vintage", "Street Raw"],
    "Tournament / competition": ["Clean Minimal", "Street Raw"]
  };

  const fallback = fallbackByFormat[input.format ?? ""] ?? ["Dark Editorial", "Clean Minimal"];
  return [...new Set([...(matched as BriefVisualStyle[]), ...fallback])].slice(0, 3) as BriefVisualStyle[];
}

export function buildCrewRoleSuggestions(input: CrewBriefInput): CrewRoleSuggestion[] {
  const selectedDeliverables = resolveSelectedDeliverables(input);
  const matched = CREW_ROLE_TEMPLATES.filter((template) =>
    template.deliverables.some((deliverable) => selectedDeliverables.includes(deliverable))
  );

  const supplemented = CREW_ROLE_TEMPLATES.filter((template) => {
    if (!template.supplementalFor?.includes(input.format ?? "")) {
      return false;
    }

    return shouldAutoIncludeTemplate(template, input);
  });

  const roles = [...matched, ...supplemented]
    .filter((template, index, list) => list.findIndex((item) => item.key === template.key) === index)
    .slice(0, 6);

  const fallback = CREW_ROLE_TEMPLATES.filter((template) =>
    template.supplementalFor?.includes(input.format ?? "")
  ).slice(0, Math.max(0, 4 - roles.length));

  return [...roles, ...fallback]
    .filter((template, index, list) => list.findIndex((item) => item.key === template.key) === index)
    .slice(0, 6)
    .map((template) => ({
      id: `${template.key}-${slugify(template.title)}`,
      key: template.key,
      title: template.title,
      rateRangeLabel: `${formatCurrency(template.rateRange[0])}-${formatCurrency(template.rateRange[1])}`,
      why: template.why
    }));
}

function describeBudgetFit(template: CrewRoleTemplate, budgetRange?: string) {
  const ceiling = resolveBudgetCeiling(budgetRange);
  const roleMidpoint = midpoint(template.rateRange[0], template.rateRange[1]);

  if (roleMidpoint <= ceiling * 0.12) {
    return "Comfortable fit";
  }
  if (roleMidpoint <= ceiling * 0.2) {
    return "Balanced fit";
  }
  return "Stretch fit";
}

export function buildCrewPlanRoles(
  input: CrewBriefInput,
  creatorProfiles: CreatorProfile[],
  users: DemoUser[],
  shortlistedByRole: Record<string, string> = {}
) {
  return buildCrewRoleSuggestions(input).map((suggestion) => {
    const template = CREW_ROLE_TEMPLATES.find((item) => item.key === suggestion.key);
    if (!template) {
      return null;
    }

    const matches = pickTemplateCandidates(template, input, creatorProfiles, users);
    const shortlistId = shortlistedByRole[suggestion.key];
    const rankedMatches = shortlistId
      ? [
          ...matches.filter((item) => item.userId === shortlistId).map((item) => ({ ...item, isTopPick: true })),
          ...matches.filter((item) => item.userId !== shortlistId).map((item) => ({ ...item, isTopPick: false }))
        ]
      : matches;

    return {
      id: suggestion.id,
      key: suggestion.key,
      reviewMode: resolveReviewMode(suggestion.key),
      title: suggestion.title,
      suggestedRateLabel: suggestion.rateRangeLabel,
      budgetFitLabel: describeBudgetFit(template, input.crewBudgetRange),
      whyThisRole: template.why,
      scopeSummary: template.scopeSummary,
      matchCountLabel: `${rankedMatches.length} creators matched`,
      statusLabel: shortlistId ? "Ready to outreach" : "Needs review",
      matches: rankedMatches
    } satisfies CrewPlanRole;
  }).filter(Boolean) as CrewPlanRole[];
}

export function estimateCrewCost(roles: CrewPlanRole[], shortlistedByRole: Record<string, string> = {}) {
  return roles.reduce((total, role) => {
    const match = shortlistedByRole[role.key]
      ? role.matches.find((candidate) => candidate.userId === shortlistedByRole[role.key]) ?? role.matches[0]
      : role.matches[0];
    if (!match) {
      return total;
    }

    const numeric = match.rateLabel.match(/\$([\d,]+)/);
    if (!numeric) {
      return total + midpoint(180, 320);
    }

    return total + Number.parseInt(numeric[1].replace(/,/g, ""), 10);
  }, 0);
}

export function resolveBudgetCeiling(budgetRange?: string) {
  switch (budgetRange) {
    case "Under $500":
      return 500;
    case "$500-$1,500":
      return 1500;
    case "$1,500-$3,000":
      return 3000;
    case "$3,000-$5,000":
      return 5000;
    case "$5,000+":
      return 7500;
    default:
      return 3000;
  }
}

export function buildUploadSeed({
  text,
  city,
  launchMode
}: {
  text: string;
  city: string;
  launchMode: "soft" | "happening";
}) {
  const lower = text.toLowerCase();
  const format = lower.includes("ball")
    ? "Themed experience / ball"
    : lower.includes("rave")
      ? "Party / rave"
      : lower.includes("watch")
        ? "Watch party"
        : lower.includes("market")
          ? "Market / vendor night"
          : "Live show / performance";

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 28);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  const fandomTags = inferFandomTagsFromBrief({
    format,
    city,
    conceptVision: text
  });
  const visualDirectionSelections = inferVisualDirectionSelections({
    format,
    city,
    conceptVision: text
  });
  const deliverableSelections = inferDeliverablesFromBrief({
    format,
    sizeBucket: "101–250",
    city,
    fandomTags,
    conceptVision: text
  });

  return {
    launchMode,
    format,
    sizeBucket: "101–250",
    conceptVision: text.trim() || "A fandom-led production built around a strong visual identity and a polished guest experience.",
    visualDirectionSelections,
    briefStartDate: startDate.toISOString().slice(0, 10),
    briefEndDate: endDate.toISOString().slice(0, 10),
    city,
    crewBudgetRange: "$1,500-$3,000",
    fandomTags,
    deliverableSelections
  };
}

export function formatBriefDateRange(startDate?: string, endDate?: string) {
  if (!startDate) {
    return "Dates taking shape";
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  });
  const start = formatter.format(new Date(`${startDate}T12:00:00`));

  if (!endDate || endDate === startDate) {
    return start;
  }

  const end = formatter.format(new Date(`${endDate}T12:00:00`));
  return `${start} - ${end}`;
}
