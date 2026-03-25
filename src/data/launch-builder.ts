import { type CreateLaunchPayload, type LaunchFormat } from "@/src/data/launches";
import { createPosterDataUri } from "@/src/lib/demo-media";
import { formatDateLabel, formatTimeLabel, slugify } from "@/src/lib/utils";

export type LaunchModeType = "soft" | "happening";
export type LaunchJourney = "soft_launch" | "simple_happening" | "produced_happening";
export type LaunchDraftStatus = "in_progress" | "review" | "saved" | "published";

export type EventFormatOption =
  | "Cupsleeve / café meetup"
  | "Meetup / hangout"
  | "Watch party"
  | "Party / rave"
  | "Live show / performance"
  | "Market / vendor night"
  | "Tournament / competition"
  | "Themed experience / ball"
  | "Other";

export type OtherClosestFormat =
  | "Low-key hangout"
  | "Produced night"
  | "Market / competition";

export type SizeBucket =
  | "Up to 20"
  | "21–50"
  | "51–100"
  | "101–250"
  | "250+";

export type TimeWindow = "daytime" | "evening" | "late night" | "flexible";
export type VenueType =
  | "café"
  | "bar"
  | "club"
  | "studio"
  | "rooftop"
  | "gallery"
  | "outdoors"
  | "flexible"
  | "restaurant"
  | "park"
  | "lounge"
  | "home"
  | "other"
  | "warehouse"
  | "theater"
  | "convention / hall";
export type EntryStyle =
  | "free"
  | "paid"
  | "invite-only"
  | "not sure yet"
  | "free RSVP"
  | "walk-in"
  | "ticketed";
export type AgeGate = "all ages" | "18+" | "21+";
export type VenueStatus = "yes, it’s booked" | "I’m deciding between places" | "I still need one";
export type ReservationStyle = "no" | "minimum spend" | "reservation" | "both";
export type LineupStatus = "booked" | "partly booked" | "still looking" | "fully booked" | "partly booked" | "still booking";
export type VendorCount = "1–5" | "6–15" | "16+";

export type DraftDateOption = {
  id: string;
  label: string;
  iso: string;
};

export type LaunchDraftPresentation = {
  title: string;
  summary: string;
  metadataLine: string;
  dateSummary: string;
  locationSummary: string;
  entrySummary: string;
  highlightChips: string[];
  expectationLines: string[];
  posterUrl: string;
};

export type SuggestedNeed = {
  id: string;
  label: string;
  why: string;
};

export type LaunchWizardDraft = {
  id: string;
  hostId: string;
  createdAt: string;
  updatedAt: string;
  launchMode: LaunchModeType;
  format?: EventFormatOption;
  otherClosestFormat?: OtherClosestFormat;
  sizeBucket?: SizeBucket;
  fandomTags: string[];
  vibeTags: string[];
  dateOptions: DraftDateOption[];
  quickDatePresets: string[];
  timeWindow?: TimeWindow;
  confirmedDate?: string;
  startTime?: string;
  endTime?: string;
  city: string;
  neighborhood: string;
  venueStatus?: VenueStatus;
  venueType?: VenueType;
  venueTypes: VenueType[];
  venueName: string;
  entryStyle?: EntryStyle;
  priceRange?: string;
  ageGate?: AgeGate;
  expectedAttendance?: number;
  minimumPeopleNeeded?: number;
  guestExperienceSelections: string[];
  coordinationSelections: string[];
  alreadySetSelections: string[];
  reservationStyle?: ReservationStyle;
  vendorCount?: VendorCount;
  lineupStatus?: LineupStatus;
  notes: string;
  customTitle?: string;
  customSummary?: string;
  derivedJourney?: LaunchJourney;
  generatedDraft: LaunchDraftPresentation;
  suggestedNeeds: SuggestedNeed[];
  draftStatus: LaunchDraftStatus;
  lastQuestionId?: LaunchQuestionId;
};

export type LaunchQuestionId =
  | "format"
  | "sizeBucket"
  | "fandomTags"
  | "softTiming"
  | "softLocation"
  | "softThreshold"
  | "softHighlights"
  | "softAlreadySet"
  | "softCoordination"
  | "softNotes"
  | "simpleFandoms"
  | "simpleDateTime"
  | "simpleLocation"
  | "simpleAccess"
  | "simpleExpect"
  | "simpleAlreadySet"
  | "simpleNotes"
  | "producedFandoms"
  | "producedDateTime"
  | "producedVenue"
  | "producedAccess"
  | "producedExpect"
  | "producedBooked"
  | "producedCoordination"
  | "producedNotes";

export type LaunchQuestionConfig = {
  id: LaunchQuestionId;
  title: string;
  helperText?: string;
  inputType:
    | "large-card-select"
    | "size-select"
    | "tag-search"
    | "soft-dates"
    | "soft-location"
    | "soft-threshold"
    | "multi-select"
    | "already-set"
    | "textarea"
    | "happening-datetime"
    | "simple-location"
    | "simple-access"
    | "produced-venue"
    | "produced-access";
  autoAdvance?: boolean;
  options?: string[];
  showIf?: (draft: LaunchWizardDraft) => boolean;
  routeToJourney?: (draft: LaunchWizardDraft) => LaunchJourney | undefined;
};

export const launchModeCards = [
  {
    id: "soft" as const,
    title: "Soft launch",
    subtitle: "Gauge interest before it’s locked in"
  },
  {
    id: "happening" as const,
    title: "Happening",
    subtitle: "Publish something that’s already on"
  }
];

export const launchFormatOptions: EventFormatOption[] = [
  "Cupsleeve / café meetup",
  "Meetup / hangout",
  "Watch party",
  "Party / rave",
  "Live show / performance",
  "Market / vendor night",
  "Tournament / competition",
  "Themed experience / ball",
  "Other"
];

export const otherClosestFormatOptions: OtherClosestFormat[] = [
  "Low-key hangout",
  "Produced night",
  "Market / competition"
];

export const sizeBucketOptions: SizeBucket[] = ["Up to 20", "21–50", "51–100", "101–250", "250+"];
export const fandomSuggestionOptions = [
  "Genshin Impact",
  "K-pop",
  "anime rave",
  "fantasy ball",
  "Marvel",
  "Jujutsu Kaisen",
  "Love and Deepspace",
  "One Piece",
  "Hoyoverse"
];
export const timeWindowOptions: TimeWindow[] = ["daytime", "evening", "late night", "flexible"];
export const quickDatePresets = ["this month", "next month", "weekends", "weekdays"];
export const softVenueTypeOptions: VenueType[] = [
  "café",
  "bar",
  "club",
  "studio",
  "rooftop",
  "gallery",
  "outdoors",
  "flexible"
];
export const softMinimumPeopleOptions = ["20", "40", "60", "100", "150", "250+"];
export const softEntryOptions: EntryStyle[] = ["free", "paid", "invite-only", "not sure yet"];
export const simpleEntryOptions: EntryStyle[] = ["free RSVP", "paid", "invite-only", "walk-in"];
export const producedEntryOptions: EntryStyle[] = ["free", "ticketed", "invite-only"];
export const simpleVenueTypes: VenueType[] = ["café", "restaurant", "park", "lounge", "home", "other"];
export const producedVenueTypes: VenueType[] = [
  "club",
  "warehouse",
  "theater",
  "lounge",
  "gallery",
  "convention / hall",
  "outdoors"
];
export const simplePriceOptions = ["under $15", "$15–25", "$25–40", "$40+"];
export const producedPriceOptions = ["under $15", "$15–25", "$25–40", "$40–60", "$60+"];
export const ageGateOptions: AgeGate[] = ["all ages", "18+", "21+"];
export const reservationOptions: ReservationStyle[] = ["no", "minimum spend", "reservation", "both"];
export const vendorCountOptions: VendorCount[] = ["1–5", "6–15", "16+"];
export const lineupStatusOptions: LineupStatus[] = ["fully booked", "partly booked", "still booking"];

export const softHighlightOptions = [
  "DJ / music",
  "live performers",
  "host / MC",
  "photo moments",
  "games / tournament",
  "cosplay / costume moment",
  "vendors / merch",
  "food / drinks",
  "panel / Q&A",
  "decor / immersive setup",
  "giveaways / prizes"
];

export const softAlreadySetOptions = [
  "venue",
  "date",
  "host",
  "DJ / performers",
  "photographer",
  "vendors",
  "decor / props",
  "artwork",
  "partners / sponsors",
  "nothing yet"
];

export const coordinationOptions = [
  "guest check-in",
  "sound",
  "lighting",
  "security",
  "vendor setup",
  "stage / program flow",
  "photography",
  "decor install"
];

export const simpleExpectOptions = [
  "freebies",
  "merch",
  "group photo",
  "games",
  "special guest",
  "photo moment",
  "dress code",
  "food / drinks",
  "giveaways"
];

export const simpleAlreadySetOptions = [
  "venue",
  "host",
  "artwork",
  "giveaway",
  "photographer",
  "merch",
  "partner",
  "nothing yet"
];

export const producedExpectOptions = [
  "DJ sets",
  "live performers",
  "MC / host",
  "vendors",
  "tournament / bracket",
  "panels",
  "photo ops",
  "decor",
  "giveaways",
  "food / drinks",
  "special guest",
  "merch"
];

export const producedAlreadySetOptions = [
  "venue",
  "lineup",
  "host",
  "vendors",
  "photographer",
  "artwork",
  "partners",
  "check-in team",
  "security",
  "nothing yet"
];

export const producedCoordinationOptions = [
  "guest check-in",
  "sound",
  "lighting",
  "security",
  "vendor load-in",
  "accessibility",
  "program flow",
  "crowd line",
  "bar flow"
];

export const launchQuestionConfigs: LaunchQuestionConfig[] = [
  {
    id: "format",
    title: "What kind of event is this?",
    helperText: "Choose what fits best.",
    inputType: "large-card-select",
    options: launchFormatOptions,
    autoAdvance: true
  },
  {
    id: "sizeBucket",
    title: "About how many people is this for?",
    helperText: "This helps shape the draft.",
    inputType: "size-select",
    options: sizeBucketOptions,
    autoAdvance: true,
    routeToJourney: deriveJourney
  },
  {
    id: "fandomTags",
    title: "What fandom or world is this for?",
    helperText: "Pick up to three.",
    inputType: "tag-search",
    showIf: (draft) => draft.derivedJourney === "soft_launch"
  },
  {
    id: "softTiming",
    title: "When could this happen?",
    helperText: "Give people a few strong date choices.",
    inputType: "soft-dates",
    showIf: (draft) => draft.derivedJourney === "soft_launch"
  },
  {
    id: "softLocation",
    title: "Where should it happen?",
    helperText: "A neighborhood is enough for now.",
    inputType: "soft-location",
    showIf: (draft) => draft.derivedJourney === "soft_launch"
  },
  {
    id: "softThreshold",
    title: "What would make this worth launching?",
    helperText: "Pick the threshold that makes the night real.",
    inputType: "soft-threshold",
    showIf: (draft) => draft.derivedJourney === "soft_launch"
  },
  {
    id: "softHighlights",
    title: "What should be part of the night?",
    helperText: "Choose up to six.",
    inputType: "multi-select",
    options: softHighlightOptions,
    showIf: (draft) => draft.derivedJourney === "soft_launch"
  },
  {
    id: "softAlreadySet",
    title: "What’s already in place?",
    helperText: "You can edit this later.",
    inputType: "already-set",
    options: softAlreadySetOptions,
    showIf: (draft) => draft.derivedJourney === "soft_launch"
  },
  {
    id: "softCoordination",
    title: "What will need the most coordination?",
    helperText: "Choose what matters most.",
    inputType: "multi-select",
    options: coordinationOptions,
    showIf: (draft) =>
      draft.derivedJourney === "soft_launch" && needsCoordinationScreen(draft)
  },
  {
    id: "softNotes",
    title: "Anything else we should know?",
    helperText: "Keep it short.",
    inputType: "textarea",
    showIf: (draft) => draft.derivedJourney === "soft_launch"
  },
  {
    id: "simpleFandoms",
    title: "What fandom or world is this for?",
    helperText: "Pick up to three.",
    inputType: "tag-search",
    showIf: (draft) => draft.derivedJourney === "simple_happening"
  },
  {
    id: "simpleDateTime",
    title: "When is it happening?",
    helperText: "Add the date and time.",
    inputType: "happening-datetime",
    showIf: (draft) => draft.derivedJourney === "simple_happening"
  },
  {
    id: "simpleLocation",
    title: "Where is it happening?",
    helperText: "A venue or neighborhood works.",
    inputType: "simple-location",
    showIf: (draft) => draft.derivedJourney === "simple_happening"
  },
  {
    id: "simpleAccess",
    title: "How will guests join?",
    helperText: "Keep access clear.",
    inputType: "simple-access",
    showIf: (draft) => draft.derivedJourney === "simple_happening"
  },
  {
    id: "simpleExpect",
    title: "What should guests expect?",
    helperText: "Choose what will feel most visible.",
    inputType: "multi-select",
    options: simpleExpectOptions,
    showIf: (draft) => draft.derivedJourney === "simple_happening"
  },
  {
    id: "simpleAlreadySet",
    title: "What’s already set?",
    helperText: "You can edit this later.",
    inputType: "already-set",
    options: simpleAlreadySetOptions,
    showIf: (draft) => draft.derivedJourney === "simple_happening"
  },
  {
    id: "simpleNotes",
    title: "Anything guests should know?",
    helperText: "Optional.",
    inputType: "textarea",
    showIf: (draft) => draft.derivedJourney === "simple_happening"
  },
  {
    id: "producedFandoms",
    title: "What fandom or world is this for?",
    helperText: "Pick up to three.",
    inputType: "tag-search",
    showIf: (draft) => draft.derivedJourney === "produced_happening"
  },
  {
    id: "producedDateTime",
    title: "When is it happening?",
    helperText: "Add the date and time.",
    inputType: "happening-datetime",
    showIf: (draft) => draft.derivedJourney === "produced_happening"
  },
  {
    id: "producedVenue",
    title: "Is the venue locked?",
    helperText: "We only need the current status.",
    inputType: "produced-venue",
    showIf: (draft) => draft.derivedJourney === "produced_happening"
  },
  {
    id: "producedAccess",
    title: "How will people get in?",
    helperText: "Keep access simple.",
    inputType: "produced-access",
    showIf: (draft) => draft.derivedJourney === "produced_happening"
  },
  {
    id: "producedExpect",
    title: "What should be part of the night?",
    helperText: "Choose the visible pieces.",
    inputType: "multi-select",
    options: producedExpectOptions,
    showIf: (draft) => draft.derivedJourney === "produced_happening"
  },
  {
    id: "producedBooked",
    title: "What’s already booked?",
    helperText: "You can keep this lightweight.",
    inputType: "already-set",
    options: producedAlreadySetOptions,
    showIf: (draft) => draft.derivedJourney === "produced_happening"
  },
  {
    id: "producedCoordination",
    title: "What needs to be handled well?",
    helperText: "Choose the pressure points.",
    inputType: "multi-select",
    options: producedCoordinationOptions,
    showIf: (draft) => draft.derivedJourney === "produced_happening"
  },
  {
    id: "producedNotes",
    title: "Anything else we should know?",
    helperText: "Optional.",
    inputType: "textarea",
    showIf: (draft) => draft.derivedJourney === "produced_happening"
  }
];

export function createEmptyLaunchDraft(mode: LaunchModeType, hostId: string): LaunchWizardDraft {
  const now = new Date().toISOString();
  const draft: LaunchWizardDraft = {
    id: `launch-draft-${mode}-${Math.random().toString(36).slice(2, 8)}`,
    hostId,
    createdAt: now,
    updatedAt: now,
    launchMode: mode,
    fandomTags: [],
    vibeTags: [],
    dateOptions: [
      { id: "date-1", label: "", iso: "" },
      { id: "date-2", label: "", iso: "" },
      { id: "date-3", label: "", iso: "" }
    ],
    quickDatePresets: [],
    city: "",
    neighborhood: "",
    venueTypes: [],
    venueName: "",
    guestExperienceSelections: [],
    coordinationSelections: [],
    alreadySetSelections: [],
    notes: "",
    draftStatus: "in_progress",
    generatedDraft: {
      title: mode === "soft" ? "Untitled Soft Launch" : "Untitled Event",
      summary: "Start with the basics and we’ll turn it into a draft you can review.",
      metadataLine: "Date and location still taking shape",
      dateSummary: "Date to be decided",
      locationSummary: "Location to be decided",
      entrySummary: "Access details to be decided",
      highlightChips: [],
      expectationLines: [],
      posterUrl: createPosterDataUri({
        title: mode === "soft" ? "Soft Launch" : "Happening",
        subtitle: "Draft in progress",
        eyebrow: mode === "soft" ? "soft launch" : "happening",
        accent: "#1F1CB8",
        accent2: "#6D5EF3"
      })
    },
    suggestedNeeds: []
  };

  return syncLaunchDraft(draft);
}

export function deriveJourney(draft: LaunchWizardDraft): LaunchJourney | undefined {
  if (!draft.format || !draft.sizeBucket) {
    return undefined;
  }

  if (draft.launchMode === "soft") {
    return "soft_launch";
  }

  const simpleFormats: EventFormatOption[] = [
    "Cupsleeve / café meetup",
    "Meetup / hangout",
    "Watch party"
  ];
  const simpleSizes: SizeBucket[] = ["Up to 20", "21–50", "51–100"];

  if (simpleFormats.includes(draft.format) && simpleSizes.includes(draft.sizeBucket)) {
    return "simple_happening";
  }

  return "produced_happening";
}

export function getLaunchQuestions(draft: LaunchWizardDraft) {
  return launchQuestionConfigs.filter((question) => {
    if (!question.showIf) {
      return true;
    }

    return question.showIf(draft);
  });
}

export function syncLaunchDraft(draft: LaunchWizardDraft): LaunchWizardDraft {
  const nextDraft = {
    ...draft,
    derivedJourney: deriveJourney(draft)
  };

  return {
    ...nextDraft,
    updatedAt: new Date().toISOString(),
    generatedDraft: buildDraftPresentation(nextDraft),
    suggestedNeeds: buildSuggestedNeeds(nextDraft)
  };
}

export function buildDraftPresentation(draft: LaunchWizardDraft): LaunchDraftPresentation {
  const fandom = draft.fandomTags[0] ?? "Fandom";
  const formatLabel = normalizeFormatLabel(draft);
  const title =
    draft.customTitle ||
    (draft.launchMode === "soft"
      ? `${fandom} ${formatLabel} Soft Launch`
      : `${fandom} ${formatLabel}`);
  const summary = draft.customSummary || buildSummary(draft, fandom, formatLabel);
  const dateSummary = buildDateSummary(draft);
  const locationSummary = buildLocationSummary(draft);
  const entrySummary = buildEntrySummary(draft);
  const metadataLine = [dateSummary, locationSummary].filter(Boolean).join(" · ");
  const highlightChips = [
    ...draft.fandomTags.slice(0, 2),
    ...draft.guestExperienceSelections.slice(0, 3)
  ].slice(0, 5);

  return {
    title,
    summary,
    metadataLine: metadataLine || "Date and location taking shape",
    dateSummary: dateSummary || "Date to be decided",
    locationSummary: locationSummary || "Location to be decided",
    entrySummary,
    highlightChips,
    expectationLines: buildExpectationLines(draft),
    posterUrl:
      draft.generatedDraft?.posterUrl ||
      createPosterDataUri({
        title,
        subtitle: metadataLine || `${fandom} · ${draft.city || "Draft"}`,
        eyebrow: draft.launchMode === "soft" ? "soft launch" : "happening",
        accent: "#1F1CB8",
        accent2: "#6D5EF3"
      })
  };
}

export function mapDraftToCreateLaunchPayload(draft: LaunchWizardDraft): CreateLaunchPayload {
  const generated = buildDraftPresentation(draft);
  const format = mapDraftFormatToLaunchFormat(draft);
  const startsAt = draft.launchMode === "soft"
    ? draft.dateOptions.find((option) => option.iso)?.iso || nextMonthFallbackIso()
    : combineDateAndTime(draft.confirmedDate, draft.startTime);

  const thresholdTarget =
    draft.launchMode === "soft"
      ? draft.minimumPeopleNeeded ?? mapSizeBucketToAttendance(draft.sizeBucket)
      : Math.max(12, Math.round(mapSizeBucketToAttendance(draft.sizeBucket) * 0.55));

  return {
    title: generated.title,
    format,
    city: draft.city || "Los Angeles, CA",
    venue: buildVenueLabel(draft),
    startsAt,
    description: generated.summary,
    fandomTags: draft.fandomTags.length > 0 ? draft.fandomTags : ["Fandom"],
    budgetRange: inferBudgetRange(draft),
    attendanceGoal: mapSizeBucketToAttendance(draft.sizeBucket),
    thresholdTarget,
    teamRoleNames: buildSuggestedNeeds(draft).map((item) => item.label),
    coverImageUrl: draft.generatedDraft.posterUrl,
    vibeNote: generated.summary,
    inspiration: draft.guestExperienceSelections.slice(0, 4),
    guestLine: buildGuestLine(draft),
    ticketPrice: mapPriceRangeToTicketPrice(draft.priceRange),
    dateOptions:
      draft.launchMode === "soft"
        ? draft.dateOptions.filter((option) => option.iso && option.label)
        : [
            {
              label: generated.dateSummary,
              iso: startsAt
            }
          ]
  };
}

export function shouldAutoAdvance(question: LaunchQuestionConfig) {
  return Boolean(question.autoAdvance);
}

export function needsCoordinationScreen(draft: LaunchWizardDraft) {
  const largeFormat =
    draft.format === "Party / rave" ||
    draft.format === "Live show / performance" ||
    draft.format === "Market / vendor night" ||
    draft.format === "Tournament / competition" ||
    draft.format === "Themed experience / ball";

  return (
    largeFormat ||
    draft.sizeBucket === "101–250" ||
    draft.sizeBucket === "250+"
  );
}

function buildSummary(draft: LaunchWizardDraft, fandom: string, formatLabel: string) {
  if (draft.launchMode === "soft") {
    return `A ${formatLabel.toLowerCase()} for ${fandom} fans in ${draft.city || "your city"}. Early supporters can pick the best date and help turn it into a confirmed night.`;
  }

  return `A ${formatLabel.toLowerCase()} for ${fandom} fans in ${draft.city || "your city"}, with the key details already taking shape.`;
}

function buildDateSummary(draft: LaunchWizardDraft) {
  if (draft.launchMode === "soft") {
    const labels = draft.dateOptions.filter((option) => option.iso).map((option) => formatDateLabel(option.iso));
    if (!labels.length) {
      return draft.quickDatePresets.join(" · ");
    }
    return `${labels.slice(0, 3).join(" · ")}${draft.timeWindow ? ` · ${toTitleCase(draft.timeWindow)}` : ""}`;
  }

  if (!draft.confirmedDate) {
    return "";
  }

  const date = formatDateLabel(draft.confirmedDate);
  const time = draft.startTime ? formatTimeLabel(combineDateAndTime(draft.confirmedDate, draft.startTime)) : "";
  return [date, time].filter(Boolean).join(" · ");
}

function buildLocationSummary(draft: LaunchWizardDraft) {
  const pieces = [draft.venueName, draft.neighborhood, draft.city].filter(Boolean);
  if (pieces.length) {
    return pieces.join(" · ");
  }
  if (draft.venueTypes.length) {
    return draft.venueTypes.join(" · ");
  }
  return "";
}

function buildEntrySummary(draft: LaunchWizardDraft) {
  const entry = draft.entryStyle ? toTitleCase(draft.entryStyle) : "Details coming soon";
  const price = draft.priceRange ? ` · ${draft.priceRange}` : "";
  const age = draft.ageGate ? ` · ${draft.ageGate}` : "";
  return `${entry}${price}${age}`;
}

function buildExpectationLines(draft: LaunchWizardDraft) {
  const lines: string[] = [];

  if (draft.guestExperienceSelections.length) {
    lines.push(`Guests can expect ${draft.guestExperienceSelections.slice(0, 4).join(", ").toLowerCase()}.`);
  }
  if (draft.alreadySetSelections.length) {
    lines.push(`Already in place: ${draft.alreadySetSelections.slice(0, 4).join(", ").toLowerCase()}.`);
  }
  if (draft.notes.trim()) {
    lines.push(draft.notes.trim());
  }

  return lines.slice(0, 3);
}

function buildSuggestedNeeds(draft: LaunchWizardDraft): SuggestedNeed[] {
  const buckets: Record<string, string[]> = {
    "Cupsleeve / café meetup": ["host", "photographer", "artwork", "giveaways"],
    "Meetup / hangout": ["host", "check-in", "photo moment"],
    "Watch party": ["host", "check-in", "photo moment"],
    "Party / rave": ["DJ/performers", "check-in", "photographer", "lighting"],
    "Live show / performance": ["lineup", "sound", "MC", "check-in", "photo/video"],
    "Market / vendor night": ["vendor coordinator", "check-in", "photographer", "vendor outreach"],
    "Tournament / competition": ["bracket host", "check-in", "prizes", "tech/setup"],
    "Themed experience / ball": ["host/MC", "decor", "photography", "check-in", "performer support"],
    Other: ["host", "photographer", "check-in"]
  };

  const formatKey = draft.format ?? "Other";
  const base = buckets[formatKey] ?? buckets.Other;

  return base.map((label, index) => ({
    id: `${slugify(label)}-${index + 1}`,
    label,
    why:
      draft.launchMode === "soft"
        ? `${label} will matter once the launch clears and the night starts locking in.`
        : `${label} is one of the main moving parts for this format.`
  }));
}

function normalizeFormatLabel(draft: LaunchWizardDraft) {
  if (draft.format === "Other" && draft.otherClosestFormat) {
    return draft.otherClosestFormat;
  }
  return draft.format ?? "Event";
}

function mapDraftFormatToLaunchFormat(draft: LaunchWizardDraft): LaunchFormat {
  switch (draft.format) {
    case "Cupsleeve / café meetup":
    case "Meetup / hangout":
    case "Watch party":
      return "social";
    case "Party / rave":
    case "Live show / performance":
    case "Themed experience / ball":
      return "showcase";
    case "Market / vendor night":
      return "pop-up";
    case "Tournament / competition":
      return "workshop";
    default:
      return draft.launchMode === "soft" ? "social" : "other";
  }
}

function mapSizeBucketToAttendance(sizeBucket?: SizeBucket) {
  switch (sizeBucket) {
    case "Up to 20":
      return 20;
    case "21–50":
      return 50;
    case "51–100":
      return 100;
    case "101–250":
      return 180;
    case "250+":
      return 300;
    default:
      return 60;
  }
}

function mapPriceRangeToTicketPrice(priceRange?: string) {
  switch (priceRange) {
    case "under $15":
      return 12;
    case "$15–25":
      return 20;
    case "$25–40":
      return 32;
    case "$40–60":
      return 48;
    case "$60+":
      return 68;
    case "$40+":
      return 45;
    default:
      return 24;
  }
}

function inferBudgetRange(draft: LaunchWizardDraft) {
  if (draft.sizeBucket === "250+") {
    return "$8k - $15k";
  }
  if (draft.sizeBucket === "101–250") {
    return "$4k - $8k";
  }
  if (draft.launchMode === "soft") {
    return "$2k - $5k";
  }
  return "$1k - $3k";
}

function buildGuestLine(draft: LaunchWizardDraft) {
  if (draft.alreadySetSelections.includes("host")) {
    return "Host already in place.";
  }
  if (draft.alreadySetSelections.includes("DJ / performers") || draft.alreadySetSelections.includes("lineup")) {
    return "Lineup is partially taking shape.";
  }
  return "Built from the answers you gave in the launch flow.";
}

function buildVenueLabel(draft: LaunchWizardDraft) {
  if (draft.venueName) {
    return [draft.venueName, draft.neighborhood || draft.city].filter(Boolean).join(", ");
  }

  if (draft.venueTypes.length) {
    return `${toTitleCase(draft.venueTypes[0])} in ${draft.neighborhood || draft.city || "your city"}`;
  }

  return draft.city || "Location TBD";
}

function combineDateAndTime(date?: string, time?: string) {
  if (!date) {
    return nextMonthFallbackIso();
  }
  return `${date}T${time || "19:00"}`;
}

function nextMonthFallbackIso() {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(nextMonth.getDate() + 14);
  nextMonth.setHours(19, 0, 0, 0);
  return nextMonth.toISOString().slice(0, 16);
}

function toTitleCase(value: string) {
  return value
    .split(/[\s/-]+/)
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}
