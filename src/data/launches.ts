import { slugify } from "@/src/lib/utils";

export type UserMode = "host" | "creator" | "fan";
export type LaunchStatus =
  | "draft"
  | "planning"
  | "recruiting"
  | "validating"
  | "live"
  | "completed";

export type LaunchFormat =
  | "social"
  | "showcase"
  | "workshop"
  | "scavenger hunt"
  | "pop-up"
  | "other";

export type OnboardingState = {
  completed: boolean;
  mode: UserMode | null;
  authMethod?: "google" | "discord" | "email";
  city: string;
  fandoms: string[];
  hostFormat?: LaunchFormat;
  budgetRange?: string;
  creatorRoles: string[];
  portfolioLink: string;
  availability: string;
  fanEventTypes: string[];
  travelDistance: string;
  budgetComfort: string;
  profileSetupCompleted: boolean;
  usedSampleProfile: boolean;
};

export type LaunchStep = {
  time: string;
  label: string;
  owner: string;
};

export type LaunchPriceTier = {
  label: string;
  price: number;
  description: string;
};

export type LaunchPlan = {
  summary: string;
  venueRecommendation: string;
  thresholdTarget: number;
  turnoutOutlook: string;
  ticketPlan: LaunchPriceTier[];
  launchCopy: {
    headline: string;
    socialBlurb: string;
    inviteLine: string;
  };
  keyRisks: string[];
  bestNextMove: string;
  reviewNotes: string[];
};

export type LaunchPayout = {
  roleName: string;
  amount: number;
  userId?: string;
};

export type LaunchPayoutSummary = {
  ticketSales: number;
  merchSales: number;
  costs: Array<{
    label: string;
    amount: number;
  }>;
  contributorPayouts: LaunchPayout[];
  hostNet: number;
  repeatNote: string;
};

export type DemoLaunch = {
  id: string;
  hostId: string;
  eventId?: string;
  title: string;
  format: LaunchFormat;
  city: string;
  venue: string;
  startsAt: string;
  description: string;
  fandomTags: string[];
  budgetRange: string;
  attendanceGoal: number;
  reserveCount: number;
  ticketCount: number;
  published: boolean;
  status: LaunchStatus;
  teamRoleNames: string[];
  acceptedTeam: Array<{
    roleName: string;
    userId: string;
  }>;
  plan: LaunchPlan;
  payouts: LaunchPayoutSummary;
  runOfShow: LaunchStep[];
};

export type InboxKind = "updates" | "team" | "tickets" | "payments";

export type DemoInboxItem = {
  id: string;
  kind: InboxKind;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  unread: boolean;
};

export type CreateLaunchPayload = {
  title: string;
  format: LaunchFormat;
  city: string;
  venue: string;
  startsAt: string;
  description: string;
  fandomTags: string[];
  budgetRange: string;
  attendanceGoal: number;
  teamRoleNames: string[];
};

export const hostFormatOptions: LaunchFormat[] = [
  "social",
  "showcase",
  "workshop",
  "scavenger hunt",
  "pop-up",
  "other"
];

export const creatorRoleOptions = [
  "photographer",
  "social promo",
  "guest experience",
  "merch table",
  "check-in",
  "host support",
  "other"
] as const;

export const fanEventTypeOptions = [
  "mixers",
  "workshops",
  "creator showcases",
  "scavenger hunts",
  "cosplay socials"
] as const;

export const onboardingDefaults: OnboardingState = {
  completed: false,
  mode: null,
  city: "",
  fandoms: [],
  creatorRoles: [],
  portfolioLink: "",
  availability: "",
  fanEventTypes: [],
  travelDistance: "",
  budgetComfort: "",
  profileSetupCompleted: false,
  usedSampleProfile: false
};

function inferVenue(format: LaunchFormat, city: string) {
  switch (format) {
    case "showcase":
      return city.includes("New York") ? "Williamsburg Loft" : "Arts District Stage";
    case "workshop":
      return city.includes("Pasadena") ? "Old Town Studio" : "Creator Commons";
    case "scavenger hunt":
      return city.includes("Los Angeles") ? "Little Tokyo Checkpoint" : "Downtown Meetup Hub";
    case "pop-up":
      return city.includes("New York") ? "Canal Market Annex" : "Melrose Corner Shop";
    default:
      return city.includes("Pasadena") ? "Civic Hall Loft" : "Warehouse Social Club";
  }
}

function inferTicketPlan(format: LaunchFormat) {
  if (format === "workshop") {
    return [
      { label: "Reserve spot", price: 18, description: "Early commit before materials lock." },
      { label: "Workshop seat", price: 34, description: "Includes guided session access." }
    ];
  }

  if (format === "showcase") {
    return [
      { label: "Reserve spot", price: 16, description: "Signals demand before lineup lock." },
      { label: "General ticket", price: 28, description: "Entry plus showcase floor access." }
    ];
  }

  if (format === "scavenger hunt") {
    return [
      { label: "Reserve spot", price: 12, description: "Hold a place in the launch group." },
      { label: "Team pass", price: 24, description: "Full clue pack and prize entry." }
    ];
  }

  return [
    { label: "Reserve spot", price: 14, description: "Early interest before the final drop." },
    { label: "General ticket", price: 26, description: "Main access once the launch opens." }
  ];
}

export function forecastTurnout(input: {
  attendanceGoal: number;
  reserveCount?: number;
  ticketCount?: number;
  fandomTags: string[];
  city: string;
}) {
  const reserveCount = input.reserveCount ?? 0;
  const ticketCount = input.ticketCount ?? 0;
  const committed = reserveCount + ticketCount;
  const progress = committed / Math.max(input.attendanceGoal, 1);

  if (progress >= 1) {
    return `${input.city} is ready for this. Interest already covers the target.`;
  }
  if (progress >= 0.75) {
    return `${input.fandomTags[0]} fans in ${input.city} are close. One strong push should unlock it.`;
  }
  if (progress >= 0.45) {
    return `The concept is resonating, but it still needs one more creator or venue angle to tip people in.`;
  }
  return `Interest is early. Tighten the first drop, clarify the ticket hook, and push the format harder.`;
}

export function buildLaunchCopy(input: {
  title: string;
  city: string;
  fandomTags: string[];
  format: LaunchFormat;
}) {
  return {
    headline: `${input.title} is coming to ${input.city}`,
    socialBlurb: `${input.fandomTags[0]} fans asked for something that felt worth leaving the house for. This is the first drop.`,
    inviteLine:
      input.format === "scavenger hunt"
        ? "Bring your best group chat. The city becomes part of the event."
        : "Save your spot early so the full production can unlock."
  };
}

export function summarizePayouts(input: {
  title: string;
  teamRoleNames: string[];
  ticketSales: number;
  merchSales: number;
}) {
  const contributorPayouts = input.teamRoleNames.slice(0, 4).map((roleName, index) => ({
    roleName,
    amount: 180 + index * 55
  }));
  const costs = [
    { label: "Venue", amount: 640 },
    { label: "Decor", amount: 260 },
    { label: "Ops", amount: 180 }
  ];
  const totalContributorPayouts = contributorPayouts.reduce(
    (total, payout) => total + payout.amount,
    0
  );
  const totalCosts = costs.reduce((total, item) => total + item.amount, 0);
  const hostNet = input.ticketSales + input.merchSales - totalCosts - totalContributorPayouts;

  return {
    ticketSales: input.ticketSales,
    merchSales: input.merchSales,
    costs,
    contributorPayouts,
    hostNet,
    repeatNote: `Best repeat lever: keep ${input.title} tight, raise the early reserve goal, and reuse the same collaborator core.`
  };
}

export function buildLaunchPlan(payload: CreateLaunchPayload): LaunchPlan {
  const ticketPlan = inferTicketPlan(payload.format);
  const thresholdTarget = Math.max(24, Math.round(payload.attendanceGoal * 0.55));

  return {
    summary: `${payload.title} is positioned as a ${payload.format} built for ${payload.fandomTags[0] ?? "fandom"} fans in ${payload.city}.`,
    venueRecommendation:
      payload.venue.trim() || inferVenue(payload.format, payload.city),
    thresholdTarget,
    turnoutOutlook: forecastTurnout({
      attendanceGoal: payload.attendanceGoal,
      fandomTags: payload.fandomTags,
      city: payload.city
    }),
    ticketPlan,
    launchCopy: buildLaunchCopy({
      title: payload.title,
      city: payload.city,
      fandomTags: payload.fandomTags,
      format: payload.format
    }),
    keyRisks: [
      "The launch needs a clear first drop within 72 hours.",
      "Open roles need decisions before publish week.",
      "Venue confirmation should happen before reserve momentum peaks."
    ],
    bestNextMove: payload.teamRoleNames.length > 0 ? "Recruit team" : "Publish launch",
    reviewNotes: [
      "Built from your brief.",
      "Designed to validate demand before overcommitting spend.",
      "Ready to turn into a repeatable city series."
    ]
  };
}

export function createSeedLaunch(input: {
  id: string;
  eventId?: string;
  hostId: string;
  title: string;
  format: LaunchFormat;
  city: string;
  venue: string;
  startsAt: string;
  description: string;
  fandomTags: string[];
  budgetRange: string;
  attendanceGoal: number;
  reserveCount: number;
  ticketCount: number;
  status: LaunchStatus;
  teamRoleNames: string[];
  published: boolean;
}) {
  const plan = buildLaunchPlan({
    title: input.title,
    format: input.format,
    city: input.city,
    venue: input.venue,
    startsAt: input.startsAt,
    description: input.description,
    fandomTags: input.fandomTags,
    budgetRange: input.budgetRange,
    attendanceGoal: input.attendanceGoal,
    teamRoleNames: input.teamRoleNames
  });

  return {
    ...input,
    acceptedTeam: [],
    plan,
    payouts: summarizePayouts({
      title: input.title,
      teamRoleNames: input.teamRoleNames,
      ticketSales: input.ticketCount * (plan.ticketPlan[1]?.price ?? 24),
      merchSales: Math.round(input.ticketCount * 4.5)
    }),
    runOfShow: [
      { time: "4:00 PM", label: "Load-in and venue reset", owner: "Host" },
      { time: "5:30 PM", label: "Team check and briefing", owner: "Ops" },
      { time: "7:00 PM", label: "Doors open", owner: "Check-in" },
      { time: "9:30 PM", label: "Hero moment", owner: "Photo" }
    ]
  } satisfies DemoLaunch;
}

export const seedLaunches: DemoLaunch[] = [
  createSeedLaunch({
    id: "court-of-stars",
    eventId: "court-of-stars",
    hostId: "user-zo",
    title: "Cosplay Live Drawing",
    format: "showcase",
    city: "Pasadena, CA",
    venue: "Old Town Civic Hall",
    startsAt: "2026-07-18T19:00:00",
    description:
      "Timed sketch sets, rotating guest poses, creator tables, and a strong visual hook for repeat drops.",
    fandomTags: ["Cosplay", "Live Drawing"],
    budgetRange: "$2k - $5k",
    attendanceGoal: 180,
    reserveCount: 62,
    ticketCount: 74,
    status: "live",
    teamRoleNames: ["Guest Cosplayer", "Photographer", "Check-in", "Social Promo"],
    published: true
  }),
  createSeedLaunch({
    id: "love-and-deepspace-afterdark",
    eventId: "love-and-deepspace-afterdark",
    hostId: "user-zo",
    title: "Love and Deepspace Event",
    format: "social",
    city: "Pasadena, CA",
    venue: "Pasadena Playhouse Loft",
    startsAt: "2026-05-26T18:30:00",
    description:
      "A premium fandom mixer with better decor, stronger guest flow, and a smoother talent plan.",
    fandomTags: ["Love and Deepspace", "Fan Mixer"],
    budgetRange: "$3k - $6k",
    attendanceGoal: 220,
    reserveCount: 103,
    ticketCount: 46,
    status: "validating",
    teamRoleNames: ["Photographer", "Host Support", "Guest Experience"],
    published: true
  }),
  createSeedLaunch({
    id: "lantern-harbor-copy",
    hostId: "user-zo",
    title: "Lantern Harbor Social: San Diego",
    format: "social",
    city: "San Diego, CA",
    venue: "Gaslamp Rooftop",
    startsAt: "2026-06-14T19:30:00",
    description:
      "A next-city version of the lantern social, drafted before the first public drop.",
    fandomTags: ["Genshin Impact", "Live Music"],
    budgetRange: "$2k - $4k",
    attendanceGoal: 140,
    reserveCount: 0,
    ticketCount: 0,
    status: "draft",
    teamRoleNames: ["Photographer", "Moderator", "Social Promo"],
    published: false
  }),
  createSeedLaunch({
    id: "marvel-rivals-night-shift",
    eventId: "marvel-rivals-night-shift",
    hostId: "user-zo",
    title: "Marvel Rivals Night Shift",
    format: "showcase",
    city: "New York, NY",
    venue: "BK Pixel Hall",
    startsAt: "2026-08-03T18:00:00",
    description:
      "A creator-cast showcase with clearer stage timing, commentator staffing, and better threshold management.",
    fandomTags: ["Marvel Rivals", "Esports"],
    budgetRange: "$4k - $8k",
    attendanceGoal: 260,
    reserveCount: 71,
    ticketCount: 56,
    status: "recruiting",
    teamRoleNames: ["Host Support", "Social Promo", "Photographer", "Event Ops"],
    published: true
  })
];

export const seedInboxItems: DemoInboxItem[] = [
  {
    id: "inbox-team-court",
    kind: "team",
    title: "Photographer needs review",
    body: "Cosplay Live Drawing has two new applicants waiting.",
    href: "/studio/court-of-stars?tab=team",
    createdAt: "2026-03-18T12:40:00.000Z",
    unread: true
  },
  {
    id: "inbox-ticket-deepspace",
    kind: "tickets",
    title: "Reserve push is almost there",
    body: "Love and Deepspace Event is close to its reserve target.",
    href: "/studio/love-and-deepspace-afterdark?tab=demand",
    createdAt: "2026-03-17T18:10:00.000Z",
    unread: true
  },
  {
    id: "inbox-update-court",
    kind: "updates",
    title: "Room unlocked",
    body: "Your RSVP unlocked event updates for Cosplay Live Drawing.",
    href: "/communities/court-of-stars",
    createdAt: "2026-03-16T09:30:00.000Z",
    unread: false
  },
  {
    id: "inbox-payments-complete",
    kind: "payments",
    title: "Payouts ready",
    body: "A completed launch is ready for payout review.",
    href: "/studio/marvel-rivals-night-shift?tab=payouts",
    createdAt: "2026-03-15T14:15:00.000Z",
    unread: false
  }
];

export function createLaunchId(title: string) {
  return `${slugify(title) || "launch"}-${Math.random().toString(36).slice(2, 6)}`;
}
