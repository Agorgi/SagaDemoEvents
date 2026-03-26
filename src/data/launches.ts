import { type MediaVerticalPosition } from "@/src/lib/media-position";
import { createPosterDataUri } from "@/src/lib/demo-media";
import { slugify } from "@/src/lib/utils";

export type UserMode = "host" | "creator" | "fan" | "business";

export type CampaignStatus =
  | "draft"
  | "planning"
  | "recruiting"
  | "validating"
  | "live"
  | "live_soft_launch"
  | "near_goal"
  | "funded"
  | "paired"
  | "confirmed"
  | "expired"
  | "completed";

export type LaunchStatus = CampaignStatus;

export type LaunchFormat =
  | "social"
  | "showcase"
  | "workshop"
  | "scavenger hunt"
  | "pop-up"
  | "other";

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

export type DateOption = {
  id: string;
  label: string;
  iso: string;
  votes: number;
};

export type Pledge = {
  userId: string;
  kind: "watching" | "pledged";
  dateOptionId?: string;
  amount: number;
  createdAt: string;
};

export type VenueCandidate = {
  id: string;
  name: string;
  area: string;
  capacity: number;
  vibe: string;
  note: string;
};

export type CampaignUpdate = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export type FundingProgress = {
  current: number;
  target: number;
  percent: number;
  watchers: number;
  pledges: number;
  statusLine: string;
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
  coverImageUrl: string;
  softLaunchSummary: string;
  vibeNote: string;
  inspiration: string[];
  guestLine: string;
  ticketPrice: number;
  dateOptions: DateOption[];
  pledges: Pledge[];
  updates: CampaignUpdate[];
  venueCandidates: VenueCandidate[];
  selectedVenueId?: string;
  coverImagePosition?: MediaVerticalPosition;
};

export type Campaign = DemoLaunch;

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
  thresholdTarget: number;
  teamRoleNames: string[];
  coverImageUrl?: string;
  coverImagePosition?: MediaVerticalPosition;
  vibeNote: string;
  inspiration: string[];
  guestLine: string;
  ticketPrice: number;
  dateOptions: Array<{
    label: string;
    iso: string;
  }>;
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

function inferTicketPlan(format: LaunchFormat, ticketPrice: number) {
  const reservePrice = Math.max(8, Math.round(ticketPrice * 0.5));

  if (format === "workshop") {
    return [
      { label: "Interest check", price: reservePrice, description: "Locks your place while materials and timing settle." },
      { label: "Workshop seat", price: ticketPrice, description: "Full seat once the drop clears threshold." }
    ];
  }

  if (format === "showcase") {
    return [
      { label: "Interest check", price: reservePrice, description: "Signals demand before lineup and venue lock." },
      { label: "General ticket", price: ticketPrice, description: "Main access once the night gets confirmed." }
    ];
  }

  if (format === "scavenger hunt") {
    return [
      { label: "Interest check", price: reservePrice, description: "Hold a place in the first city run." },
      { label: "Team pass", price: ticketPrice, description: "Locks the full clue path and prize entry." }
    ];
  }

  return [
    { label: "Interest check", price: reservePrice, description: "Keeps the soft launch moving without overcommitting." },
    { label: "General ticket", price: ticketPrice, description: "Turns into a live ticket when the event clears." }
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
    return `${input.city} is ready for this. Enough fans have already raised their hand to move into confirmation.`;
  }
  if (progress >= 0.75) {
    return `${input.fandomTags[0]} fans in ${input.city} are close. One strong share push should tip it over.`;
  }
  if (progress >= 0.45) {
    return "The concept is resonating. A sharper date story or creator co-sign should accelerate it.";
  }
  return "Early signal is there, but the hook still needs a sharper first drop and better social proof.";
}

export function buildLaunchCopy(input: {
  title: string;
  city: string;
  fandomTags: string[];
  format: LaunchFormat;
}) {
  return {
    headline: `${input.title} could land in ${input.city}`,
    socialBlurb: `${input.fandomTags[0]} fans asked for something worth leaving the house for. This soft launch is the first signal check.`,
    inviteLine:
      input.format === "scavenger hunt"
        ? "Pick the best date, rally a crew, and help unlock the city run."
        : "Back the first drop now so the full production can actually happen."
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
    repeatNote: `Best repeat lever: keep ${input.title} tight, reopen the same first-drop promise, and reuse the strongest collaborators.`
  };
}

function buildDefaultDateOptions(startsAt: string) {
  const base = new Date(startsAt);
  if (Number.isNaN(base.getTime())) {
    base.setMonth(base.getMonth() + 1);
    base.setDate(base.getDate() + 14);
    base.setHours(19, 0, 0, 0);
  }

  return [0, 7, 14].map((offset, index) => {
    const optionDate = new Date(base);
    optionDate.setDate(optionDate.getDate() + offset);
    return {
      id: `date-option-${index + 1}`,
      iso: optionDate.toISOString(),
      label: optionDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        weekday: "short"
      }),
      votes: 0
    } satisfies DateOption;
  });
}

function buildVenueCandidates(input: {
  title: string;
  city: string;
  format: LaunchFormat;
  attendanceGoal: number;
  fandomTags: string[];
}) {
  const area = input.city.split(",")[0];
  return [
    {
      id: `${slugify(input.title)}-venue-1`,
      name: input.format === "showcase" ? `${area} Art Hall` : `${area} Loft Club`,
      area,
      capacity: Math.max(80, Math.round(input.attendanceGoal * 1.1)),
      vibe: input.fandomTags[0] ?? "Fandom night",
      note: `Fits the ${input.fandomTags[0] ?? "scene"} crowd and can hold a clean first run.`
    },
    {
      id: `${slugify(input.title)}-venue-2`,
      name: input.format === "workshop" ? `${area} Studio Annex` : `${area} Social House`,
      area,
      capacity: Math.max(60, Math.round(input.attendanceGoal * 0.9)),
      vibe: input.format === "scavenger hunt" ? "Checkpoint flow" : "Warm, social, easy to dress",
      note: "A safer capacity match if the launch confirms on the lower end of turnout."
    },
    {
      id: `${slugify(input.title)}-venue-3`,
      name: `${area} Community Room`,
      area,
      capacity: Math.max(50, Math.round(input.attendanceGoal * 0.75)),
      vibe: "Budget-friendly first run",
      note: "Good fallback if you want to confirm quickly and keep the first city lean."
    }
  ] satisfies VenueCandidate[];
}

export function getLaunchFundingProgress(launch: DemoLaunch): FundingProgress {
  const current = launch.reserveCount + launch.ticketCount;
  const target = Math.max(launch.plan.thresholdTarget, 1);
  const percent = Math.max(0, Math.min(100, Math.round((current / target) * 100)));
  return {
    current,
    target,
    percent,
    watchers: launch.reserveCount,
    pledges: launch.ticketCount,
    statusLine:
      current >= target
        ? "Threshold reached. Ready for venue pairing."
        : `${target - current} more actions needed to unlock the event.`
  };
}

function inferSoftLaunchSummary(input: {
  title: string;
  city: string;
  fandomTags: string[];
  format: LaunchFormat;
}) {
  return `${input.title} is testing demand in ${input.city} before venue spend locks. Fans can back the idea, choose a date, and help turn it into a confirmed ${input.format}.`;
}

function inferDefaultCoverImage(input: {
  title: string;
  city: string;
  fandomTags: string[];
  format: LaunchFormat;
}) {
  return createPosterDataUri({
    title: input.title,
    subtitle: `${input.fandomTags[0] ?? input.format} · ${input.city}`,
    eyebrow: "soft launch",
    accent: "#1F1CB8",
    accent2: "#6D5EF3"
  });
}

export function buildLaunchPlan(payload: CreateLaunchPayload): LaunchPlan {
  const ticketPlan = inferTicketPlan(payload.format, payload.ticketPrice);
  const thresholdTarget = Math.max(12, payload.thresholdTarget);

  return {
    summary: `${payload.title} is positioned as a ${payload.format} for ${payload.fandomTags[0] ?? "fandom"} fans in ${payload.city}.`,
    venueRecommendation: payload.venue.trim() || inferVenue(payload.format, payload.city),
    thresholdTarget,
    turnoutOutlook: forecastTurnout({
      attendanceGoal: thresholdTarget,
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
      "The first share wave needs a clear promise and a clear date story.",
      "Venue pairing should happen fast once the threshold clears.",
      "Open roles need quick accepts once the event confirms."
    ],
    bestNextMove: "Share soft launch",
    reviewNotes: [
      "Built from your brief.",
      "Designed to validate demand before venue spend.",
      "Ready to become a repeatable city format if the first drop lands."
    ]
  };
}

function buildSeedPledges(input: {
  reserveCount: number;
  ticketCount: number;
  dateOptions: DateOption[];
}) {
  const reservePledges = Array.from({ length: input.reserveCount }, (_, index) => ({
    userId: `watcher-${index + 1}`,
    kind: "watching" as const,
    dateOptionId: input.dateOptions[index % input.dateOptions.length]?.id,
    amount: 0,
    createdAt: "2026-03-10T10:00:00.000Z"
  }));
  const ticketPledges = Array.from({ length: input.ticketCount }, (_, index) => ({
    userId: `pledger-${index + 1}`,
    kind: "pledged" as const,
    dateOptionId: input.dateOptions[index % input.dateOptions.length]?.id,
    amount: 24,
    createdAt: "2026-03-11T12:00:00.000Z"
  }));
  return [...reservePledges, ...ticketPledges];
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
  thresholdTarget: number;
  reserveCount: number;
  ticketCount: number;
  status: LaunchStatus;
  teamRoleNames: string[];
  published: boolean;
  coverImageUrl?: string;
  coverImagePosition?: MediaVerticalPosition;
  softLaunchSummary?: string;
  vibeNote?: string;
  inspiration?: string[];
  guestLine?: string;
  ticketPrice?: number;
  dateOptions?: Array<{
    label: string;
    iso: string;
    votes?: number;
  }>;
  updates?: Array<{
    title: string;
    body: string;
    createdAt: string;
  }>;
  venueCandidates?: VenueCandidate[];
  selectedVenueId?: string;
}) {
  const ticketPrice = input.ticketPrice ?? 28;
  const dateOptions = (input.dateOptions ?? buildDefaultDateOptions(input.startsAt)).map(
    (option, index) => ({
      id: `${input.id}-date-${index + 1}`,
      label: option.label,
      iso: option.iso,
      votes: option.votes ?? 0
    })
  );
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
    thresholdTarget: input.thresholdTarget,
    teamRoleNames: input.teamRoleNames,
    ticketPrice,
    vibeNote: input.vibeNote ?? "",
    inspiration: input.inspiration ?? [],
    guestLine: input.guestLine ?? "",
    dateOptions: dateOptions.map((option) => ({
      label: option.label,
      iso: option.iso
    }))
  });

  const pledges = buildSeedPledges({
    reserveCount: input.reserveCount,
    ticketCount: input.ticketCount,
    dateOptions
  });
  const enrichedDateOptions = dateOptions.map((option) => ({
    ...option,
    votes: pledges.filter((pledge) => pledge.dateOptionId === option.id).length
  }));
  const venueCandidates =
    input.venueCandidates ??
    buildVenueCandidates({
      title: input.title,
      city: input.city,
      format: input.format,
      attendanceGoal: input.attendanceGoal,
      fandomTags: input.fandomTags
    });

  return {
    ...input,
    ticketPrice,
    acceptedTeam: [],
    plan: {
      ...plan,
      turnoutOutlook: forecastTurnout({
        attendanceGoal: input.thresholdTarget,
        reserveCount: input.reserveCount,
        ticketCount: input.ticketCount,
        fandomTags: input.fandomTags,
        city: input.city
      }),
      bestNextMove:
        input.status === "draft"
          ? "Finish soft launch"
          : input.status === "live_soft_launch" || input.status === "near_goal"
            ? "Share soft launch"
            : input.status === "funded"
              ? "Choose venue"
              : input.status === "paired"
                ? "Confirm event"
                : input.status === "confirmed"
                  ? "Open event page"
                  : "Review payouts"
    },
    payouts: summarizePayouts({
      title: input.title,
      teamRoleNames: input.teamRoleNames,
      ticketSales: input.ticketCount * (plan.ticketPlan[1]?.price ?? ticketPrice),
      merchSales: Math.round(input.ticketCount * 4.5)
    }),
    runOfShow: [
      { time: "4:00 PM", label: "Load-in and venue reset", owner: "Host" },
      { time: "5:30 PM", label: "Team check and briefing", owner: "Ops" },
      { time: "7:00 PM", label: "Doors open", owner: "Check-in" },
      { time: "9:30 PM", label: "Hero moment", owner: "Photo" }
    ],
    coverImageUrl:
      input.coverImageUrl ??
      inferDefaultCoverImage({
        title: input.title,
        city: input.city,
        fandomTags: input.fandomTags,
        format: input.format
      }),
    coverImagePosition: input.coverImagePosition,
    softLaunchSummary:
      input.softLaunchSummary ??
      inferSoftLaunchSummary({
        title: input.title,
        city: input.city,
        fandomTags: input.fandomTags,
        format: input.format
      }),
    vibeNote:
      input.vibeNote ??
      "A premium first drop with enough detail to feel real without overcommitting the host.",
    inspiration: input.inspiration ?? [
      "Warm lighting",
      "Fandom-forward decor",
      "Photo moments",
      "Room for repeat runs"
    ],
    guestLine: input.guestLine ?? "Host-led with room for a guest reveal once the threshold clears.",
    dateOptions: enrichedDateOptions,
    pledges,
    updates:
      input.updates?.map((update, index) => ({
        id: `${input.id}-update-${index + 1}`,
        title: update.title,
        body: update.body,
        createdAt: update.createdAt
      })) ?? [
        {
          id: `${input.id}-update-1`,
          title: "Soft launch is live",
          body: "Early supporters can lock a price, pick a date, and help move this into venue pairing.",
          createdAt: "2026-03-12T09:00:00.000Z"
        }
      ],
    venueCandidates,
    selectedVenueId: input.selectedVenueId
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
    description: "Timed sketch sets, rotating guest poses, creator tables, and a strong visual hook for repeat drops.",
    fandomTags: ["Cosplay", "Live Drawing"],
    budgetRange: "$2k - $5k",
    attendanceGoal: 180,
    thresholdTarget: 120,
    reserveCount: 62,
    ticketCount: 74,
    status: "confirmed",
    teamRoleNames: ["Guest Cosplayer", "Photographer", "Check-in", "Social Promo"],
    published: true,
    coverImageUrl: "/cosplay-live-drawing-poster.png",
    softLaunchSummary: "The original sketch-night idea cleared its threshold and turned into a confirmed Pasadena run.",
    vibeNote: "High-contrast poster energy, strong guest posing, and a room that feels part salon, part fandom release night.",
    guestLine: "Guest cosplay lead and live sketch host already attached.",
    updates: [
      {
        title: "Threshold cleared",
        body: "Enough early backers came in to lock the room and confirm the full run.",
        createdAt: "2026-03-13T10:00:00.000Z"
      }
    ]
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
    description: "A premium fandom mixer with better decor, stronger guest flow, and a smoother talent plan.",
    fandomTags: ["Love and Deepspace", "Fan Mixer"],
    budgetRange: "$3k - $6k",
    attendanceGoal: 220,
    thresholdTarget: 140,
    reserveCount: 104,
    ticketCount: 52,
    status: "confirmed",
    teamRoleNames: ["Photographer", "Host Support", "Guest Experience"],
    published: true,
    coverImageUrl: "/event-love-and-deepspace-rafayel.png",
    softLaunchSummary: "This fandom mixer already graduated from soft launch into a confirmed room with a locked date.",
    vibeNote: "Romance-game mood lighting, premium check-in, and a social flow built for photo moments.",
    guestLine: "Guest hosts and photo capture already slotted."
  }),
  createSeedLaunch({
    id: "moonlit-genshin-hunt",
    hostId: "user-zo",
    title: "Moonlit Genshin Hunt",
    format: "scavenger hunt",
    city: "Los Angeles, CA",
    venue: "Little Tokyo Checkpoint",
    startsAt: "2026-06-21T18:00:00",
    description: "A city clue crawl with fan teams, unlockable checkpoints, and a finale meetup if enough players commit.",
    fandomTags: ["Genshin Impact", "Scavenger Hunt"],
    budgetRange: "$1k - $3k",
    attendanceGoal: 90,
    thresholdTarget: 64,
    reserveCount: 21,
    ticketCount: 17,
    status: "live_soft_launch",
    teamRoleNames: ["Moderator", "Photographer", "Event Ops"],
    published: true,
    coverImageUrl: "/event-genshin-scavenger-hunt.png",
    softLaunchSummary: "A first-city interest check for a fandom clue run. Fans pick the best date before the route locks.",
    vibeNote: "Lantern checkpoints, clue reveals, and a final photo moment built for group chats.",
    inspiration: ["Lantern trail", "Team badges", "Checkpoint posters"],
    guestLine: "Looking for one guest creator to design the final checkpoint.",
    dateOptions: [
      { label: "Fri Jun 19", iso: "2026-06-19T18:00:00.000Z", votes: 12 },
      { label: "Sat Jun 20", iso: "2026-06-20T18:00:00.000Z", votes: 16 },
      { label: "Sun Jun 21", iso: "2026-06-21T18:00:00.000Z", votes: 10 }
    ]
  }),
  createSeedLaunch({
    id: "jujutsu-rooftop-screening",
    hostId: "user-zo",
    title: "Jujutsu Rooftop Screening",
    format: "showcase",
    city: "Los Angeles, CA",
    venue: "Arts District Rooftop",
    startsAt: "2026-06-28T20:00:00",
    description: "A rooftop screening with themed cocktails, crowd chants, and a guest content drop if the city shows up.",
    fandomTags: ["Jujutsu Kaisen", "Screening Night"],
    budgetRange: "$2k - $5k",
    attendanceGoal: 120,
    thresholdTarget: 82,
    reserveCount: 29,
    ticketCount: 21,
    status: "live_soft_launch",
    teamRoleNames: ["Social Promo", "Photographer"],
    published: true,
    coverImageUrl: "/launch-jujutsu-rooftop-screening.png",
    softLaunchSummary: "This one is still proving demand. Fans are locking early spots and voting on the best rooftop date.",
    vibeNote: "Big-screen energy, night skyline, and a crowd loud enough to justify the full build.",
    inspiration: ["Skyline terrace", "Projection wall", "Character cocktails"],
    guestLine: "Open to one creator host and one photo recap partner."
  }),
  createSeedLaunch({
    id: "starlit-idol-social",
    hostId: "user-zo",
    title: "Starlit Idol Social",
    format: "social",
    city: "Pasadena, CA",
    venue: "Old Town Loft",
    startsAt: "2026-07-12T19:30:00",
    description: "A dressed-up idol and rhythm-game mixer with photo sets, themed drinks, and a first-night guest drop.",
    fandomTags: ["Idol Nights", "Rhythm Games"],
    budgetRange: "$2k - $4k",
    attendanceGoal: 130,
    thresholdTarget: 88,
    reserveCount: 34,
    ticketCount: 46,
    status: "near_goal",
    teamRoleNames: ["Guest Experience", "Social Promo", "Photographer"],
    published: true,
    coverImageUrl: "/launch-starlit-idol-social.png",
    softLaunchSummary: "Almost there. One last wave of reserves should be enough to push this into venue pairing.",
    vibeNote: "Glossy, friendly, and set up to feel like a fandom afterparty with better photos."
  }),
  createSeedLaunch({
    id: "marvel-rivals-night-shift",
    hostId: "user-zo",
    title: "Marvel Rivals Night Shift",
    format: "showcase",
    city: "New York, NY",
    venue: "BK Pixel Hall",
    startsAt: "2026-08-03T18:00:00",
    description: "A creator-cast showcase with a live matchup floor, commentator desk, and enough early backing to lock a venue fast.",
    fandomTags: ["Marvel Rivals", "Esports"],
    budgetRange: "$4k - $8k",
    attendanceGoal: 260,
    thresholdTarget: 120,
    reserveCount: 48,
    ticketCount: 76,
    status: "funded",
    teamRoleNames: ["Host Support", "Social Promo", "Photographer", "Event Ops"],
    published: true,
    coverImageUrl: "/event-marvel-rivals-night-shift.png",
    softLaunchSummary: "The threshold is already cleared. The next move is choosing the best room and confirming the first run.",
    vibeNote: "A sharper, more spectator-friendly take on a fandom tournament night.",
    guestLine: "Commentator pair and creator host available once venue is paired."
  }),
  createSeedLaunch({
    id: "lantern-harbor-copy",
    hostId: "user-zo",
    title: "Lantern Harbor Social: San Diego",
    format: "social",
    city: "San Diego, CA",
    venue: "Gaslamp Rooftop",
    startsAt: "2026-06-14T19:30:00",
    description: "A next-city version of the lantern social, drafted before the first public drop.",
    fandomTags: ["Genshin Impact", "Live Music"],
    budgetRange: "$2k - $4k",
    attendanceGoal: 140,
    thresholdTarget: 80,
    reserveCount: 0,
    ticketCount: 0,
    status: "draft",
    teamRoleNames: ["Photographer", "Moderator", "Social Promo"],
    published: false,
    softLaunchSummary: "Draft only. Tighten the concept, set date options, then open it to the fandom."
  })
];

export const seedInboxItems: DemoInboxItem[] = [
  {
    id: "inbox-campaign-near-goal",
    kind: "updates",
    title: "Soft launch is almost there",
    body: "Starlit Idol Social needs a final push before venue pairing can start.",
    href: "/studio/starlit-idol-social?tab=demand",
    createdAt: "2026-03-18T12:40:00.000Z",
    unread: true
  },
  {
    id: "inbox-funding-marvel",
    kind: "tickets",
    title: "Threshold reached",
    body: "Marvel Rivals Night Shift is ready for venue suggestions.",
    href: "/studio/marvel-rivals-night-shift?tab=venue",
    createdAt: "2026-03-17T18:10:00.000Z",
    unread: true
  },
  {
    id: "inbox-update-court",
    kind: "updates",
    title: "Confirmed event is live",
    body: "Cosplay Live Drawing moved from soft launch into a confirmed public event.",
    href: "/events/court-of-stars",
    createdAt: "2026-03-16T09:30:00.000Z",
    unread: false
  },
  {
    id: "inbox-payments-complete",
    kind: "payments",
    title: "Payouts ready",
    body: "A completed launch is ready for payout review.",
    href: "/studio/court-of-stars?tab=payouts",
    createdAt: "2026-03-15T14:15:00.000Z",
    unread: false
  }
];

export function createLaunchId(title: string) {
  return `${slugify(title) || "launch"}-${Math.random().toString(36).slice(2, 6)}`;
}
