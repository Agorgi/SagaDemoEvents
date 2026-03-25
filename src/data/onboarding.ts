import { type UserMode } from "@/src/data/launches";

export type OnboardingIntent =
  | "explore"
  | "get_booked"
  | "throw_event"
  | "find_collaborators"
  | "book_talent_or_business";

export type OnboardingBranch =
  | "explorer"
  | "talent"
  | "organizer"
  | "business";

export type SocialPlatform = "instagram" | "tiktok";

export type SocialConnection =
  | {
      platform: SocialPlatform;
      mode: "connected" | "handle";
      value: string;
    }
  | null;

export type ExperienceLevel =
  | "just_starting"
  | "a_few_gigs"
  | "work_regularly"
  | "exploring";

export type TravelRadius =
  | "neighborhood"
  | "city"
  | "nearby_cities"
  | "travel";

export type OrganizerGoal =
  | "first_event"
  | "another_event"
  | "find_cohost"
  | "find_talent"
  | "explore";

export type OrganizerExperience = "never" | "a_few" | "regular";

export type OrganizerMotion = "live" | "idea" | "planning";

export type BusinessSizeFit = "under_50" | "50_150" | "150_plus" | "flexible";

export type AddOnStatus = "pending" | "accepted" | "skipped" | "completed";

export type OnboardingProfile = {
  phoneNumber: string;
  displayName: string;
  city: string;
  neighborhood?: string;
  primaryIntent?: OnboardingIntent;
  secondaryIntent?: OnboardingIntent | null;
  primaryBranch?: OnboardingBranch;
  collaborationIntent?: boolean;

  fandomTags: string[];
  eventTypePreferences: string[];
  outingStyleTags: string[];

  skills: string[];
  experienceLevel?: ExperienceLevel;
  workEventTypes: string[];
  travelRadius?: TravelRadius;
  workOpenness: string[];

  organizerGoal?: OrganizerGoal;
  organizerExperience?: OrganizerExperience;
  organizerEventTypes: string[];
  organizerSupportNeeds: string[];
  organizerHasSomethingInMotion?: OrganizerMotion;
  organizerCollabTargets: string[];

  businessType?: string;
  businessGoals: string[];
  businessSceneTags: string[];
  businessTalentNeeds: string[];
  businessSizeFit?: BusinessSizeFit;

  socials: SocialConnection[];
  portfolioLink?: string;

  hasCompletedOnboarding: boolean;
};

export type OnboardingState = OnboardingProfile & {
  completed: boolean;
  onboardingVersion: number;
  mode: UserMode | null;
  authMethod?: "phone";
  selectedIntents: OnboardingIntent[];
  answers: Record<string, unknown>;
  lastStepId?: string;
  collaborationRoute?: OnboardingBranch;
  secondaryAddOnStatus?: AddOnStatus | null;
  interestGraph: string[];
  workGraph: string[];
  organizerGraph: string[];
  businessGraph: string[];
  profileSetupCompleted: boolean;
  usedSampleProfile: boolean;
};

export type OnboardingQuestionInputType =
  | "phone"
  | "code"
  | "short-text"
  | "intent-multi"
  | "intent-priority"
  | "city-search"
  | "single-card"
  | "multi-chip"
  | "tag-search"
  | "social-connect"
  | "secondary-addon"
  | "completion";

export type OnboardingOption = {
  value: string;
  label: string;
  description?: string;
};

export type OnboardingQuestionConfig = {
  id: string;
  title: string;
  subcopy?: string;
  inputType: OnboardingQuestionInputType;
  options?: OnboardingOption[];
  maxSelections?: number;
  required?: boolean;
  skippable?: boolean;
  autoAdvance?: boolean;
  showIf?: (state: OnboardingState) => boolean;
};

export const ONBOARDING_VERSION = 2;

export const onboardingDefaults: OnboardingState = {
  completed: false,
  hasCompletedOnboarding: false,
  onboardingVersion: ONBOARDING_VERSION,
  mode: null,
  authMethod: undefined,
  phoneNumber: "",
  displayName: "",
  city: "",
  neighborhood: "",
  primaryIntent: undefined,
  secondaryIntent: null,
  primaryBranch: undefined,
  collaborationIntent: false,
  fandomTags: [],
  eventTypePreferences: [],
  outingStyleTags: [],
  skills: [],
  experienceLevel: undefined,
  workEventTypes: [],
  travelRadius: undefined,
  workOpenness: [],
  organizerGoal: undefined,
  organizerExperience: undefined,
  organizerEventTypes: [],
  organizerSupportNeeds: [],
  organizerHasSomethingInMotion: undefined,
  organizerCollabTargets: [],
  businessType: undefined,
  businessGoals: [],
  businessSceneTags: [],
  businessTalentNeeds: [],
  businessSizeFit: undefined,
  socials: [],
  portfolioLink: "",
  selectedIntents: [],
  answers: {},
  lastStepId: undefined,
  collaborationRoute: undefined,
  secondaryAddOnStatus: null,
  interestGraph: [],
  workGraph: [],
  organizerGraph: [],
  businessGraph: [],
  profileSetupCompleted: false,
  usedSampleProfile: false
};

export const phoneCountryCode = "+1";

export const citySuggestions = [
  "Los Angeles, CA",
  "Pasadena, CA",
  "Koreatown, Los Angeles",
  "Silver Lake, Los Angeles",
  "Long Beach, CA",
  "Orange County, CA",
  "Brooklyn, NY",
  "Queens, NY"
];

export const primaryIntentOptions: OnboardingOption[] = [
  { value: "explore", label: "Find events" },
  { value: "get_booked", label: "Get booked" },
  { value: "throw_event", label: "Throw an event" },
  { value: "find_collaborators", label: "Find collaborators" },
  { value: "book_talent_or_business", label: "Book talent / represent a business" }
];

export const collaboratorRouteOptions: OnboardingOption[] = [
  { value: "organizer", label: "I’m an organizer" },
  { value: "talent", label: "I’m a creator / talent" },
  { value: "business", label: "I represent a business / venue" },
  { value: "explorer", label: "I’m mostly exploring" }
];

export const sharedTagSuggestions = [
  "anime",
  "k-pop",
  "Marvel",
  "fantasy",
  "cosplay",
  "gaming",
  "horror",
  "JJK",
  "Genshin",
  "drag",
  "queer nightlife",
  "Love and Deepspace",
  "One Piece",
  "Hoyoverse",
  "Marvel Rivals"
];

export const explorerNightOptions = [
  "cupsleeves",
  "meetups",
  "watch parties",
  "raves",
  "live shows",
  "markets",
  "tournaments",
  "themed balls",
  "low-key hangs"
];

export const explorerStyleOptions = [
  "free hangs",
  "ticketed nights",
  "daytime plans",
  "late nights",
  "solo-friendly",
  "group plans",
  "last-minute plans",
  "plan-ahead nights"
];

export const talentSkillOptions = [
  "photographer",
  "videographer",
  "DJ",
  "performer",
  "host / MC",
  "cosplay guest",
  "artist / illustrator",
  "graphic designer",
  "vendor",
  "stylist / MUA",
  "decor / set",
  "event support",
  "producer / coordinator",
  "community lead",
  "other"
];

export const talentExperienceOptions: OnboardingOption[] = [
  { value: "just_starting", label: "just starting out" },
  { value: "a_few_gigs", label: "done a few gigs" },
  { value: "work_regularly", label: "work regularly" },
  { value: "exploring", label: "mostly here to explore" }
];

export const talentEventOptions = [
  "cupsleeves",
  "meetups",
  "nightlife",
  "live shows",
  "tournaments",
  "markets",
  "themed events",
  "brand pop-ups",
  "private events"
];

export const talentOpennessOptions = [
  "paid gigs",
  "community collabs",
  "recurring work",
  "one-off opportunities",
  "last-minute bookings",
  "long-term creative partners"
];

export const travelRadiusOptions: OnboardingOption[] = [
  { value: "neighborhood", label: "same neighborhood" },
  { value: "city", label: "anywhere in my city" },
  { value: "nearby_cities", label: "nearby cities too" },
  { value: "travel", label: "willing to travel" }
];

export const organizerGoalOptions: OnboardingOption[] = [
  { value: "first_event", label: "throw my first event" },
  { value: "another_event", label: "launch another one" },
  { value: "find_cohost", label: "find a co-host" },
  { value: "find_talent", label: "find talent" },
  { value: "explore", label: "just explore what’s possible" }
];

export const organizerExperienceOptions: OnboardingOption[] = [
  { value: "never", label: "never done one" },
  { value: "a_few", label: "done a few" },
  { value: "regular", label: "I host regularly" }
];

export const organizerEventOptions = [
  "cupsleeves",
  "meetups",
  "watch parties",
  "raves",
  "live shows",
  "markets",
  "tournaments",
  "themed balls",
  "brand / community experiences"
];

export const organizerSupportOptions = [
  "co-hosts",
  "venue",
  "DJs / performers",
  "photographers / video",
  "vendors",
  "promotion",
  "check-in / ops",
  "decor / visuals",
  "sponsors / partners"
];

export const organizerMotionOptions: OnboardingOption[] = [
  { value: "live", label: "yes, something’s live" },
  { value: "idea", label: "I have an idea" },
  { value: "planning", label: "not yet, just planning ahead" }
];

export const organizerCollabOptions = [
  "other organizers",
  "venues / businesses",
  "creators / talent",
  "community leaders",
  "sponsors / brands"
];

export const businessTypeOptions: OnboardingOption[] = [
  { value: "venue", label: "venue" },
  { value: "cafe", label: "café" },
  { value: "bar", label: "bar" },
  { value: "club", label: "club" },
  { value: "restaurant", label: "restaurant" },
  { value: "studio", label: "studio" },
  { value: "brand", label: "brand" },
  { value: "agency", label: "agency" },
  { value: "shop", label: "shop" },
  { value: "other", label: "other" }
];

export const businessGoalOptions = [
  "host events",
  "find talent",
  "meet organizers",
  "support existing events",
  "all of the above"
];

export const businessTalentOptions = [
  "DJs",
  "performers",
  "photographers",
  "videographers",
  "artists",
  "vendors",
  "hosts / MCs",
  "event organizers",
  "community partners"
];

export const businessSizeOptions: OnboardingOption[] = [
  { value: "under_50", label: "under 50" },
  { value: "50_150", label: "50–150" },
  { value: "150_plus", label: "150+" },
  { value: "flexible", label: "flexible" }
];

export function getModeForBranch(branch?: OnboardingBranch): UserMode {
  if (branch === "organizer") {
    return "host";
  }
  if (branch === "talent") {
    return "creator";
  }
  if (branch === "business") {
    return "business";
  }
  return "fan";
}

export function getOnboardingLandingPath(branch?: OnboardingBranch) {
  if (branch === "talent") {
    return "/work?tab=jobs";
  }
  if (branch === "organizer") {
    return "/studio";
  }
  if (branch === "business") {
    return "/work?tab=businesses";
  }
  return "/explore";
}

export function resolveBranch(
  intent?: OnboardingIntent,
  collaborationRoute?: OnboardingBranch
): OnboardingBranch | undefined {
  if (!intent) {
    return undefined;
  }

  if (intent === "find_collaborators") {
    return collaborationRoute;
  }

  if (intent === "explore") {
    return "explorer";
  }
  if (intent === "get_booked") {
    return "talent";
  }
  if (intent === "throw_event") {
    return "organizer";
  }
  if (intent === "book_talent_or_business") {
    return "business";
  }

  return undefined;
}

export function labelIntent(intent?: OnboardingIntent | null) {
  switch (intent) {
    case "explore":
      return "events";
    case "get_booked":
      return "bookings";
    case "throw_event":
      return "hosting";
    case "find_collaborators":
      return "collabs";
    case "book_talent_or_business":
      return "business";
    default:
      return "next";
  }
}

export function mockVerifyPhoneCode(value: string) {
  return /^\d{6}$/.test(value.trim());
}

export function upsertSocialConnection(
  socials: SocialConnection[],
  nextConnection: Exclude<SocialConnection, null>
) {
  const existing = socials.filter(Boolean) as Exclude<SocialConnection, null>[];
  const withoutPlatform = existing.filter(
    (item) => item.platform !== nextConnection.platform
  );
  return [...withoutPlatform, nextConnection];
}

export function deriveOnboardingGraphs(profile: OnboardingProfile) {
  const interestGraph = [
    ...profile.fandomTags,
    ...profile.eventTypePreferences,
    ...profile.outingStyleTags
  ];
  const workGraph = [...profile.skills, ...profile.workEventTypes, ...profile.workOpenness];
  const organizerGraph = [
    ...profile.organizerEventTypes,
    ...profile.organizerSupportNeeds,
    ...profile.organizerCollabTargets
  ];
  const businessGraph = [
    ...profile.businessGoals,
    ...profile.businessSceneTags,
    ...profile.businessTalentNeeds
  ];

  return {
    interestGraph: Array.from(new Set(interestGraph.filter(Boolean))),
    workGraph: Array.from(new Set(workGraph.filter(Boolean))),
    organizerGraph: Array.from(new Set(organizerGraph.filter(Boolean))),
    businessGraph: Array.from(new Set(businessGraph.filter(Boolean)))
  };
}

const sharedQuestions: OnboardingQuestionConfig[] = [
  {
    id: "phone",
    title: "Enter your phone number",
    inputType: "phone",
    required: true
  },
  {
    id: "verify",
    title: "Enter the code we sent",
    subcopy: "For the demo, any 6 digits will work.",
    inputType: "code",
    required: true
  },
  {
    id: "displayName",
    title: "What should we call you?",
    inputType: "short-text",
    required: true
  },
  {
    id: "intentSelection",
    title: "What brings you here right now?",
    inputType: "intent-multi",
    options: primaryIntentOptions,
    required: true
  },
  {
    id: "intentPriority",
    title: "What should we set up first?",
    inputType: "intent-priority",
    required: true,
    showIf: (state) => state.selectedIntents.length === 2
  },
  {
    id: "location",
    title: "Where are you based?",
    inputType: "city-search",
    required: true
  },
  {
    id: "collaborationRoute",
    title: "Who are you looking to collaborate as?",
    inputType: "single-card",
    options: collaboratorRouteOptions,
    required: true,
    showIf: (state) => state.primaryIntent === "find_collaborators"
  }
];

const explorerQuestions: OnboardingQuestionConfig[] = [
  {
    id: "explorerFandoms",
    title: "What worlds are you into?",
    inputType: "tag-search",
    maxSelections: 5,
    skippable: true
  },
  {
    id: "explorerEventTypes",
    title: "What kinds of nights are your thing?",
    inputType: "multi-chip",
    options: explorerNightOptions.map((option) => ({ value: option, label: option })),
    maxSelections: 5,
    skippable: true
  },
  {
    id: "explorerStyle",
    title: "What sounds most like you?",
    inputType: "multi-chip",
    options: explorerStyleOptions.map((option) => ({ value: option, label: option })),
    maxSelections: 4,
    skippable: true
  },
  {
    id: "explorerSocials",
    title: "Want your profile to feel more like you?",
    subcopy:
      "Add your Instagram or TikTok so friends can recognize you faster and your picks feel more personal.",
    inputType: "social-connect",
    skippable: true
  }
];

const talentQuestions: OnboardingQuestionConfig[] = [
  {
    id: "talentSkills",
    title: "What do you do?",
    inputType: "multi-chip",
    options: talentSkillOptions.map((option) => ({ value: option, label: option })),
    required: true
  },
  {
    id: "talentExperience",
    title: "Where are you at right now?",
    inputType: "single-card",
    options: talentExperienceOptions,
    required: true
  },
  {
    id: "talentEventTypes",
    title: "What kinds of events do you want to work?",
    inputType: "multi-chip",
    options: talentEventOptions.map((option) => ({ value: option, label: option })),
    required: true
  },
  {
    id: "talentScenes",
    title: "What scenes fit your style?",
    inputType: "tag-search",
    maxSelections: 5,
    required: true
  },
  {
    id: "talentTravel",
    title: "How far can you work?",
    inputType: "single-card",
    options: travelRadiusOptions,
    required: true
  },
  {
    id: "talentOpenness",
    title: "What are you open to right now?",
    inputType: "multi-chip",
    options: talentOpennessOptions.map((option) => ({ value: option, label: option })),
    required: true
  },
  {
    id: "talentSocials",
    title: "Add your @ so organizers can instantly see your style",
    subcopy: "It makes it easier for the right people to trust your work and reach out.",
    inputType: "social-connect",
    skippable: true
  },
  {
    id: "talentPortfolio",
    title: "Want to add a portfolio link too?",
    inputType: "short-text",
    skippable: true,
    showIf: (state) =>
      state.skills.some((skill) =>
        [
          "photographer",
          "videographer",
          "artist / illustrator",
          "graphic designer",
          "stylist / MUA"
        ].includes(skill)
      )
  }
];

const organizerQuestions: OnboardingQuestionConfig[] = [
  {
    id: "organizerGoal",
    title: "What are you trying to do first?",
    inputType: "single-card",
    options: organizerGoalOptions,
    required: true
  },
  {
    id: "organizerExperience",
    title: "How much have you hosted?",
    inputType: "single-card",
    options: organizerExperienceOptions,
    required: true
  },
  {
    id: "organizerEventTypes",
    title: "What do you want to make?",
    inputType: "multi-chip",
    options: organizerEventOptions.map((option) => ({ value: option, label: option })),
    required: true
  },
  {
    id: "organizerScenes",
    title: "What scenes are you building for?",
    inputType: "tag-search",
    maxSelections: 5,
    required: true
  },
  {
    id: "organizerSupport",
    title: "What do you usually need help with?",
    inputType: "multi-chip",
    options: organizerSupportOptions.map((option) => ({ value: option, label: option })),
    required: true
  },
  {
    id: "organizerCollabTargets",
    title: "Who do you want to collaborate with most?",
    inputType: "multi-chip",
    options: organizerCollabOptions.map((option) => ({ value: option, label: option })),
    required: true,
    showIf: (state) => state.organizerGoal === "find_cohost"
  },
  {
    id: "organizerMotion",
    title: "Do you already have something in motion?",
    inputType: "single-card",
    options: organizerMotionOptions,
    required: true
  },
  {
    id: "organizerSocials",
    title: "Add your @ so collaborators can trust your vibe faster",
    subcopy:
      "It helps talent, co-hosts, and venues understand your style before they say yes.",
    inputType: "social-connect",
    skippable: true
  }
];

const businessQuestions: OnboardingQuestionConfig[] = [
  {
    id: "businessType",
    title: "What kind of business is this?",
    inputType: "single-card",
    options: businessTypeOptions,
    required: true
  },
  {
    id: "businessGoals",
    title: "What are you here to do?",
    inputType: "multi-chip",
    options: businessGoalOptions.map((option) => ({ value: option, label: option })),
    required: true
  },
  {
    id: "businessScenes",
    title: "What scenes fit your space or brand?",
    inputType: "tag-search",
    maxSelections: 5,
    required: true
  },
  {
    id: "businessNeeds",
    title: "Who are you usually looking for?",
    inputType: "multi-chip",
    options: businessTalentOptions.map((option) => ({ value: option, label: option })),
    required: true
  },
  {
    id: "businessSizeFit",
    title: "What size fits best?",
    inputType: "single-card",
    options: businessSizeOptions,
    required: true
  },
  {
    id: "businessSocials",
    title: "Add your @ so talent knows the space is real",
    subcopy:
      "It gives organizers and creators more confidence in your page right away.",
    inputType: "social-connect",
    skippable: true
  }
];

const secondaryAddOnPrompt: OnboardingQuestionConfig = {
  id: "secondaryAddonPrompt",
  title: "Want to set up your other side too?",
  subcopy: "It’ll take about 20 seconds.",
  inputType: "secondary-addon",
  showIf: (state) => Boolean(state.secondaryIntent)
};

const finishScreens: Record<OnboardingBranch, OnboardingQuestionConfig> = {
  explorer: {
    id: "finishExplorer",
    title: "You’re in",
    subcopy: "We’ll start with events that fit your scene.",
    inputType: "completion"
  },
  talent: {
    id: "finishTalent",
    title: "You’re set",
    subcopy: "We’ll start showing you jobs and people that fit your lane.",
    inputType: "completion"
  },
  organizer: {
    id: "finishOrganizer",
    title: "You’re set",
    subcopy: "You can start building right away.",
    inputType: "completion"
  },
  business: {
    id: "finishBusiness",
    title: "You’re set",
    subcopy: "We’ll start with talent and event fits that match your space.",
    inputType: "completion"
  }
};

export function getPrimaryBranchQuestions(branch?: OnboardingBranch) {
  if (branch === "talent") {
    return talentQuestions;
  }
  if (branch === "organizer") {
    return organizerQuestions;
  }
  if (branch === "business") {
    return businessQuestions;
  }
  return explorerQuestions;
}

export function getSecondaryAddOnQuestions(intent?: OnboardingIntent | null) {
  if (!intent) {
    return [] as OnboardingQuestionConfig[];
  }

  if (intent === "get_booked") {
    const questions: OnboardingQuestionConfig[] = [
      {
        id: "addonTalentSkills",
        title: "What do you do?",
        inputType: "multi-chip",
        options: talentSkillOptions.map((option) => ({ value: option, label: option })),
        required: true
      },
      {
        id: "addonTalentSocials",
        title: "Add your @ so organizers can instantly see your style",
        inputType: "social-connect",
        skippable: true
      }
    ];
    return questions;
  }

  if (intent === "throw_event") {
    const questions: OnboardingQuestionConfig[] = [
      {
        id: "addonOrganizerEventTypes",
        title: "What do you want to make?",
        inputType: "multi-chip",
        options: organizerEventOptions.map((option) => ({ value: option, label: option })),
        required: true
      },
      {
        id: "addonOrganizerSocials",
        title: "Add your @ so collaborators can trust your vibe faster",
        inputType: "social-connect",
        skippable: true
      }
    ];
    return questions;
  }

  if (intent === "book_talent_or_business") {
    const questions: OnboardingQuestionConfig[] = [
      {
        id: "addonBusinessType",
        title: "What kind of business is this?",
        inputType: "single-card",
        options: businessTypeOptions,
        required: true
      },
      {
        id: "addonBusinessSocials",
        title: "Add your @ so talent knows the space is real",
        inputType: "social-connect",
        skippable: true
      }
    ];
    return questions;
  }

  if (intent === "explore" || intent === "find_collaborators") {
    const questions: OnboardingQuestionConfig[] = [
      {
        id: "addonExplorerFandoms",
        title: "What worlds are you into?",
        inputType: "tag-search",
        maxSelections: 5,
        required: true
      },
      {
        id: "addonExplorerEventTypes",
        title: "What kinds of nights are your thing?",
        inputType: "multi-chip",
        options: explorerNightOptions.map((option) => ({ value: option, label: option })),
        required: true
      }
    ];
    return questions;
  }

  return [] as OnboardingQuestionConfig[];
}

export function getOnboardingQuestions(state: OnboardingState) {
  const branch =
    state.primaryBranch ??
    resolveBranch(state.primaryIntent, state.collaborationRoute);
  const questions = [...sharedQuestions];
  questions.push(...getPrimaryBranchQuestions(branch));

  if (state.secondaryIntent) {
    questions.push(secondaryAddOnPrompt);
    if (state.secondaryAddOnStatus === "accepted") {
      questions.push(...getSecondaryAddOnQuestions(state.secondaryIntent));
    }
  }

  if (branch) {
    questions.push(finishScreens[branch]);
  }

  return questions.filter((question) => (question.showIf ? question.showIf(state) : true));
}
