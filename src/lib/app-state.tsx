"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  type DemoEvent,
  type DemoUser,
  users as seedUsers
} from "@/src/data/demo";
import {
  type CreateLaunchPayload,
  type DemoInboxItem,
  type DemoLaunch,
  forecastTurnout,
  getLaunchFundingProgress,
  type UserMode,
  buildLaunchPlan,
  createSeedLaunch,
  seedInboxItems,
  seedLaunches
} from "@/src/data/launches";
import {
  createEmptyLaunchDraft,
  mapDraftToCreateLaunchPayload,
  syncLaunchDraft,
  type LaunchModeType,
  type LaunchWizardDraft
} from "@/src/data/launch-builder";
import {
  type OnboardingBranch,
  type OnboardingIntent,
  type OnboardingState,
  ONBOARDING_VERSION,
  deriveOnboardingGraphs,
  getModeForBranch,
  onboardingDefaults,
  resolveBranch
} from "@/src/data/onboarding";
import {
  demoPersonaPresets,
  getDefaultPersonaIdForMode,
  getPersonaPresetById,
  getProfileByUserId,
  seedInterestStateByPersona,
  socialActivityItems,
  type DemoPersonaPreset,
  type InterestState,
  type SocialActivityItem
} from "@/src/data/social";
import {
  businessProfiles as seedBusinessProfiles,
  getBusinessProfileById,
  getStorefrontForUser,
  listings as seedListings,
  listingInterests as seedListingInterests,
  opportunities as seedOpportunities,
  opportunityApplications as seedOpportunityApplications,
  storefronts,
  supportIntents as seedSupportIntents,
  type BusinessProfile,
  type Listing,
  type ListingInterest,
  type ListingInterestKind,
  type MatchTargetType,
  type Opportunity,
  type OpportunityApplication,
  type SupportAction,
  type SupportIntent
} from "@/src/data/economy";
import { useDemoState } from "@/src/lib/demo-state";
import {
  BUSINESS_DEMO_USER_ID,
  CREATOR_DEMO_USER_ID,
  FAN_DEMO_USER_ID,
  HOST_DEMO_USER_ID
} from "@/src/lib/host-mode";
import { createPosterDataUri } from "@/src/lib/demo-media";

type ProfileDraft = {
  name?: string;
  city?: string;
  fandoms?: string[];
  roles?: string[];
  rateRange?: string;
  bio?: string;
  portfolioLinks?: string[];
  availability?: string;
  sampleWork?: string[];
};

type SocialStateByPersona = Record<string, InterestState>;

type CompleteOnboardingPayload = Partial<OnboardingState>;

type CreateListingPayload = {
  type: Listing["type"];
  title: string;
  summary: string;
  description: string;
  priceLabel: string;
  fandomTags: string[];
  city?: string;
  imageUrl?: string;
  sublabel?: string;
};

type ImportedDataSettings = {
  instagramConnected: boolean;
  tiktokConnected: boolean;
  portfolioImportEnabled: boolean;
  visibility: "public" | "followers";
};

type PersistedAppState = {
  mode: UserMode;
  activePersonaId: string;
  onboarding: OnboardingState;
  launches: DemoLaunch[];
  launchDrafts: LaunchWizardDraft[];
  inbox: DemoInboxItem[];
  profileDrafts: Record<string, ProfileDraft>;
  hasStartedLaunch: boolean;
  socialStateByPersona: SocialStateByPersona;
  activityLog: SocialActivityItem[];
  opportunityApplications: OpportunityApplication[];
  listings: Listing[];
  listingInterests: ListingInterest[];
  businessProfiles: BusinessProfile[];
  supportIntents: SupportIntent[];
  importedDataSettings: ImportedDataSettings;
};

type AppStateValue = PersistedAppState & {
  hydrated: boolean;
  currentPersona: DemoPersonaPreset;
  currentUserId: string;
  currentUser: DemoUser & { draft?: ProfileDraft };
  currentInterestState: InterestState;
  currentProfile?: ReturnType<typeof getProfileByUserId>;
  homeCity: string;
  preferredFandoms: string[];
  users: Array<DemoUser & { draft?: ProfileDraft }>;
  launchDrafts: LaunchWizardDraft[];
  opportunities: Opportunity[];
  listings: Listing[];
  businessProfiles: BusinessProfile[];
  supportIntents: SupportIntent[];
  currentBusinessProfile?: BusinessProfile;
  currentStorefront?: ReturnType<typeof getStorefrontForUser>;
  socialActivity: SocialActivityItem[];
  savedEventIds: string[];
  interestedEventIds: string[];
  goingEventIds: string[];
  followingIds: string[];
  getApplicationsForOpportunity: (opportunityId: string) => OpportunityApplication[];
  getApplicationForCurrentUser: (opportunityId: string) => OpportunityApplication | undefined;
  applyToOpportunity: (opportunityId: string, note: string) => void;
  createListing: (payload: CreateListingPayload) => string;
  toggleListingInterest: (listingId: string, kind: ListingInterestKind) => void;
  respondToBusinessMatch: (
    businessId: string,
    targetType: MatchTargetType,
    targetId: string,
    action: SupportAction
  ) => void;
  updateBusinessProfile: (
    businessId: string,
    payload: Partial<Pick<BusinessProfile, "hostingPreferences" | "supportInterests" | "fandomInterests">>
  ) => void;
  updateImportedDataSettings: (payload: Partial<ImportedDataSettings>) => void;
  setMode: (mode: UserMode) => void;
  switchPersona: (personaId: string) => void;
  updateOnboarding: (payload: Partial<OnboardingState>) => void;
  completeOnboarding: (payload: CompleteOnboardingPayload) => void;
  resetOnboarding: () => void;
  activateSampleProfile: (mode?: UserMode) => void;
  finishProfileSetup: (payload: ProfileDraft) => void;
  startLaunchDraft: (mode: LaunchModeType) => string;
  updateLaunchDraft: (draftId: string, payload: Partial<LaunchWizardDraft>) => void;
  saveLaunchDraft: (draftId: string) => void;
  publishLaunchDraft: (draftId: string) => { launchId: string; eventId?: string } | null;
  createLaunch: (payload: CreateLaunchPayload) => string;
  updateLaunch: (launchId: string, payload: Partial<CreateLaunchPayload>) => void;
  addLaunchUpdate: (launchId: string, payload: { title: string; body: string }) => void;
  watchLaunch: (launchId: string, dateOptionId?: string) => void;
  pledgeLaunch: (launchId: string, dateOptionId: string) => void;
  acceptVenuePairing: (launchId: string, venueId: string) => string | null;
  acceptLaunchMatch: (launchId: string, roleName: string, userId: string) => void;
  removeLaunchMatch: (launchId: string, roleName: string, userId: string) => void;
  publishLaunch: (launchId: string) => string | null;
  completeLaunch: (launchId: string) => void;
  bookEvent: (eventId: string, kind: "reserve" | "ticket") => void;
  toggleSavedEvent: (eventId: string) => void;
  toggleInterestedEvent: (eventId: string) => void;
  markGoing: (eventId: string) => void;
  toggleFollow: (userId: string) => void;
  markInboxRead: (itemId: string) => void;
  resolveUser: (userId?: string) => (DemoUser & { draft?: ProfileDraft }) | undefined;
};

const STORAGE_KEY = "saga-app-state-v6";

const buildInitialSocialState = (): SocialStateByPersona =>
  structuredClone(seedInterestStateByPersona);

const initialState: PersistedAppState = {
  mode: "fan",
  activePersonaId: "persona-fan",
  onboarding: onboardingDefaults,
  launches: seedLaunches,
  launchDrafts: [],
  inbox: seedInboxItems,
  profileDrafts: {},
  hasStartedLaunch: false,
  socialStateByPersona: buildInitialSocialState(),
  activityLog: [],
  opportunityApplications: seedOpportunityApplications,
  listings: seedListings,
  listingInterests: seedListingInterests,
  businessProfiles: seedBusinessProfiles,
  supportIntents: seedSupportIntents,
  importedDataSettings: {
    instagramConnected: true,
    tiktokConnected: false,
    portfolioImportEnabled: true,
    visibility: "public"
  }
};

const AppStateContext = createContext<AppStateValue | null>(null);

function createSyntheticLaunch(event: DemoEvent) {
  const reserveCount = Math.max(12, Math.round(event.attendeesCount * 0.04));
  const ticketCount = Math.max(18, Math.round(event.attendeesCount * 0.06));

  return createSeedLaunch({
    id: `${event.id}-public`,
    eventId: event.id,
    hostId: event.hostId,
    title: event.title,
    format: event.fandomTags.some((tag) => /hunt/i.test(tag))
      ? "scavenger hunt"
      : event.fandomTags.some((tag) => /drawing|showcase/i.test(tag))
        ? "showcase"
        : "social",
    city: event.city,
    venue: event.venue,
    startsAt: event.startsAt,
    description: event.description,
    fandomTags: event.fandomTags,
    budgetRange: "$2k - $5k",
    attendanceGoal: Math.max(80, Math.round(event.attendeesCount * 0.14)),
    thresholdTarget: Math.max(40, Math.round(event.attendeesCount * 0.08)),
    reserveCount,
    ticketCount,
    status: "confirmed",
    teamRoleNames: ["Photographer", "Host Support", "Social Promo"],
    published: true,
    coverImageUrl: event.posterUrl,
    softLaunchSummary: `${event.title} already moved through its soft launch and is now a confirmed public event.`,
    vibeNote: event.subtitle
  });
}

function syncLaunches(launches: DemoLaunch[], events: DemoEvent[]) {
  const byEventId = new Set(
    launches.map((launch) => launch.eventId).filter((value): value is string => Boolean(value))
  );
  const syntheticLaunches = events
    .filter((event) => !byEventId.has(event.id))
    .map((event) => createSyntheticLaunch(event));

  return [...launches, ...syntheticLaunches].map((launch) => syncLaunchShape(launch));
}

function mergeUsers(profileDrafts: Record<string, ProfileDraft>) {
  return seedUsers.map((user) => {
    const draft = profileDrafts[user.id];
    if (!draft) {
      return user;
    }

    return {
      ...user,
      name: draft.name ?? user.name,
      city: draft.city ?? user.city,
      fandomTags: draft.fandoms ?? user.fandomTags,
      skills: draft.roles ?? user.skills,
      bio: draft.bio ?? user.bio,
      draft
    };
  });
}

function resolveCurrentUserId(personaId: string, mode: UserMode) {
  const preset = getPersonaPresetById(personaId);
  if (preset) {
    return preset.userId;
  }

  if (mode === "host") {
    return HOST_DEMO_USER_ID;
  }
  if (mode === "business") {
    return BUSINESS_DEMO_USER_ID;
  }
  if (mode === "creator") {
    return CREATOR_DEMO_USER_ID;
  }
  return FAN_DEMO_USER_ID;
}

function syncPersonaStates(input?: Partial<SocialStateByPersona>) {
  return demoPersonaPresets.reduce<SocialStateByPersona>((accumulator, persona) => {
    accumulator[persona.id] = {
      ...seedInterestStateByPersona[persona.id],
      ...(input?.[persona.id] ?? {})
    };
    return accumulator;
  }, {});
}

function createActivityEntry(
  overrides: Partial<SocialActivityItem> & Pick<SocialActivityItem, "title" | "body" | "href">
): SocialActivityItem {
  return {
    id: `activity-log-${Math.random().toString(36).slice(2, 8)}`,
    kind: overrides.kind ?? "event",
    actorIds: overrides.actorIds ?? [],
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

function formatDisplayLocation(city: string, neighborhood?: string) {
  if (neighborhood?.trim()) {
    return `${neighborhood.trim()}, ${city}`;
  }

  return city;
}

function buildProfileDraftFromOnboarding(
  onboarding: OnboardingState,
  currentDraft?: ProfileDraft
): ProfileDraft {
  const fandoms =
    onboarding.fandomTags.length > 0
      ? onboarding.fandomTags
      : onboarding.businessSceneTags.length > 0
        ? onboarding.businessSceneTags
        : currentDraft?.fandoms;

  const roles =
    onboarding.skills.length > 0
      ? onboarding.skills
      : onboarding.organizerEventTypes.length > 0
        ? ["host", ...onboarding.organizerEventTypes.slice(0, 2)]
        : onboarding.businessTalentNeeds.length > 0
          ? ["business", ...onboarding.businessTalentNeeds.slice(0, 2)]
          : currentDraft?.roles;

  const socialLine = onboarding.socials
    .filter(Boolean)
    .map((entry) => entry?.value)
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");

  const bioSource =
    onboarding.primaryBranch === "organizer"
      ? `Building ${onboarding.organizerEventTypes.slice(0, 2).join(" and ") || "fandom nights"} in ${onboarding.city}.`
      : onboarding.primaryBranch === "talent"
        ? `Open to ${onboarding.workOpenness.slice(0, 2).join(" and ") || "the right gigs"} across ${onboarding.workEventTypes.slice(0, 2).join(" and ") || "live events"}.`
        : onboarding.primaryBranch === "business"
          ? `Looking for ${onboarding.businessTalentNeeds.slice(0, 2).join(" and ") || "the right talent"} that fits ${onboarding.businessSceneTags.slice(0, 2).join(" and ") || "the local scene"}.`
          : `Into ${onboarding.fandomTags.slice(0, 3).join(", ") || "nights worth leaving the house for"}.`;

  return {
    ...currentDraft,
    name: onboarding.displayName || currentDraft?.name,
    city: formatDisplayLocation(onboarding.city, onboarding.neighborhood) || currentDraft?.city,
    fandoms,
    roles,
    portfolioLinks: onboarding.portfolioLink
      ? [onboarding.portfolioLink]
      : currentDraft?.portfolioLinks,
    availability:
      onboarding.travelRadius?.replaceAll("_", " ") || currentDraft?.availability,
    bio: socialLine ? `${bioSource} ${socialLine}` : bioSource
  };
}

function buildSeededOnboarding(
  partial: Partial<OnboardingState>,
  fallbackMode: UserMode
): OnboardingState {
  const primaryBranch =
    partial.primaryBranch ??
    resolveBranch(partial.primaryIntent, partial.collaborationRoute) ??
    (fallbackMode === "host"
      ? "organizer"
      : fallbackMode === "creator"
        ? "talent"
        : fallbackMode === "business"
          ? "business"
          : "explorer");
  const mode = getModeForBranch(primaryBranch);
  const baseProfile: OnboardingState = {
    ...onboardingDefaults,
    ...partial,
    mode,
    primaryBranch,
    completed: true,
    hasCompletedOnboarding: true,
    onboardingVersion: ONBOARDING_VERSION,
    profileSetupCompleted: true,
    authMethod: "phone"
  };
  const graphs = deriveOnboardingGraphs(baseProfile);

  return {
    ...baseProfile,
    ...graphs
  };
}

function toBusinessType(value?: string) {
  if (value === "venue" || value === "studio" || value === "brand") {
    return value;
  }
  if (value === "café") {
    return "cafe" as const;
  }
  return undefined;
}

function getNextLaunchStatus(launch: DemoLaunch) {
  if (launch.status === "completed" || launch.status === "expired") {
    return launch.status;
  }
  if (launch.eventId) {
    return "confirmed" as const;
  }
  if (launch.selectedVenueId) {
    return "paired" as const;
  }
  if (!launch.published) {
    return "draft" as const;
  }

  const progress = getLaunchFundingProgress(launch);
  if (progress.current >= progress.target) {
    return "funded" as const;
  }
  if (progress.current >= Math.round(progress.target * 0.82)) {
    return "near_goal" as const;
  }
  return "live_soft_launch" as const;
}

function getBestNextMoveForLaunch(launch: DemoLaunch) {
  if (launch.status === "draft") {
    return "Launch soft launch";
  }
  if (launch.status === "live_soft_launch" || launch.status === "near_goal") {
    return "Share soft launch";
  }
  if (launch.status === "funded") {
    return "Choose venue";
  }
  if (launch.status === "paired") {
    return "Confirm event";
  }
  if (launch.status === "confirmed") {
    return "Open event page";
  }
  if (launch.status === "completed") {
    return "Review payouts";
  }
  return launch.plan.bestNextMove;
}

function buildLaunchDraftGuestLine(draft: LaunchWizardDraft) {
  if (draft.alreadySetSelections.includes("host")) {
    return "Host already attached.";
  }
  if (
    draft.alreadySetSelections.includes("DJ / performers") ||
    draft.alreadySetSelections.includes("lineup")
  ) {
    return "Part of the lineup is already in place.";
  }
  if (draft.alreadySetSelections.includes("vendors")) {
    return "Vendor lineup is starting to take shape.";
  }
  return "Built from your answers and ready to share.";
}

function syncLaunchShape(launch: DemoLaunch) {
  const safePledges = launch.pledges ?? [];
  const safeDateOptions = launch.dateOptions ?? [];
  const voteCounts = safePledges.reduce<Record<string, number>>((accumulator, pledge) => {
    if (pledge.dateOptionId) {
      accumulator[pledge.dateOptionId] = (accumulator[pledge.dateOptionId] ?? 0) + 1;
    }
    return accumulator;
  }, {});

  const dateOptions = safeDateOptions.map((option) => ({
    ...option,
    votes: voteCounts[option.id] ?? 0
  }));

  const nextLaunch = {
    ...launch,
    coverImageUrl:
      launch.coverImageUrl ??
      createPosterDataUri({
        title: launch.title,
        subtitle: `${launch.fandomTags[0] ?? launch.format} · ${launch.city}`,
        eyebrow: "soft launch",
        accent: "#1F1CB8",
        accent2: "#6D5EF3"
      }),
    softLaunchSummary: launch.softLaunchSummary ?? launch.description,
    vibeNote: launch.vibeNote ?? launch.description,
    inspiration: launch.inspiration ?? [],
    guestLine: launch.guestLine ?? "",
    ticketPrice: launch.ticketPrice ?? launch.plan.ticketPlan[1]?.price ?? 24,
    dateOptions,
    pledges: safePledges,
    updates: launch.updates ?? [],
    venueCandidates: launch.venueCandidates ?? []
  };
  const nextStatus = getNextLaunchStatus(nextLaunch);

  return {
    ...nextLaunch,
    status: nextStatus,
    plan: {
      ...nextLaunch.plan,
      turnoutOutlook: forecastTurnout({
        attendanceGoal: nextLaunch.plan.thresholdTarget,
        reserveCount: nextLaunch.reserveCount,
        ticketCount: nextLaunch.ticketCount,
        fandomTags: nextLaunch.fandomTags,
        city: nextLaunch.city
      }),
      bestNextMove: getBestNextMoveForLaunch({
        ...nextLaunch,
        status: nextStatus
      })
    }
  };
}

export function AppStateProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const demo = useDemoState();
  const [state, setState] = useState<PersistedAppState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const didHydrate = useRef(false);

  useEffect(() => {
    if (didHydrate.current) {
      return;
    }
    didHydrate.current = true;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedAppState>;
        const parsedOnboarding = {
          ...onboardingDefaults,
          ...parsed.onboarding
        };
        const upgradedOnboarding = {
          ...parsedOnboarding,
          onboardingVersion: ONBOARDING_VERSION,
          completed:
            parsedOnboarding.completed || parsedOnboarding.hasCompletedOnboarding || false,
          hasCompletedOnboarding:
            parsedOnboarding.hasCompletedOnboarding || parsedOnboarding.completed || false,
          mode:
            parsedOnboarding.mode ??
            getModeForBranch(
              resolveBranch(parsedOnboarding.primaryIntent, parsedOnboarding.collaborationRoute)
            ),
          ...deriveOnboardingGraphs(parsedOnboarding)
        };
        setState({
          mode: parsed.mode ?? initialState.mode,
          activePersonaId: parsed.activePersonaId ?? initialState.activePersonaId,
          onboarding: upgradedOnboarding,
          launches: syncLaunches(parsed.launches ?? initialState.launches, demo.events),
          launchDrafts: (parsed.launchDrafts ?? initialState.launchDrafts).map((draft) =>
            syncLaunchDraft(draft)
          ),
          inbox: parsed.inbox ?? initialState.inbox,
          profileDrafts: parsed.profileDrafts ?? initialState.profileDrafts,
          hasStartedLaunch: parsed.hasStartedLaunch ?? initialState.hasStartedLaunch,
          socialStateByPersona: syncPersonaStates(parsed.socialStateByPersona),
          activityLog: parsed.activityLog ?? [],
          opportunityApplications:
            parsed.opportunityApplications ?? initialState.opportunityApplications,
          listings: parsed.listings ?? initialState.listings,
          listingInterests: parsed.listingInterests ?? initialState.listingInterests,
          businessProfiles: parsed.businessProfiles ?? initialState.businessProfiles,
          supportIntents: parsed.supportIntents ?? initialState.supportIntents,
          importedDataSettings:
            parsed.importedDataSettings ?? initialState.importedDataSettings
        });
      } else {
        setState((current) => ({
          ...current,
          launches: syncLaunches(current.launches, demo.events),
          launchDrafts: current.launchDrafts.map((draft) => syncLaunchDraft(draft))
        }));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setState(initialState);
    } finally {
      setHydrated(true);
    }
  }, [demo.events]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    setState((current) => {
      const nextLaunches = syncLaunches(current.launches, demo.events);
      return nextLaunches === current.launches
        ? current
        : {
            ...current,
            launches: nextLaunches
          };
    });
  }, [demo.events, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("[app-state] Unable to persist app state", error);
    }
  }, [hydrated, state]);

  const users = useMemo(() => mergeUsers(state.profileDrafts), [state.profileDrafts]);
  const currentPersona =
    getPersonaPresetById(state.activePersonaId) ?? demoPersonaPresets[0];
  const currentUserId = resolveCurrentUserId(state.activePersonaId, state.mode);
  const currentUser =
    users.find((user) => user.id === currentUserId) ?? mergeUsers({})[0];
  const currentInterestState =
    state.socialStateByPersona[currentPersona.id] ??
    seedInterestStateByPersona[currentPersona.id];
  const currentProfile = getProfileByUserId(currentUserId);
  const currentBusinessProfile = state.businessProfiles.find(
    (profile) => profile.ownerUserId === currentUserId
  );
  const currentStorefront = getStorefrontForUser(currentUserId);
  const homeCity = state.onboarding.city || currentUser.city;
  const preferredFandoms =
    state.onboarding.fandomTags.length > 0
      ? state.onboarding.fandomTags
      : state.onboarding.businessSceneTags.length > 0
        ? state.onboarding.businessSceneTags
      : currentProfile?.fandoms ?? currentUser.fandomTags;
  const socialActivity = useMemo(
    () =>
      [...state.activityLog, ...socialActivityItems]
        .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
        .slice(0, 24),
    [state.activityLog]
  );

  function commitBooking(eventId: string, kind: "reserve" | "ticket") {
    const event = demo.events.find((item) => item.id === eventId);
    if (!event) {
      return;
    }

    setState((current) => {
      const personaState = current.socialStateByPersona[current.activePersonaId];
      const nextPersonaState: InterestState = {
        ...personaState,
        goingEventIds: personaState.goingEventIds.includes(eventId)
          ? personaState.goingEventIds
          : [eventId, ...personaState.goingEventIds],
        interestedEventIds: personaState.interestedEventIds.filter((id) => id !== eventId)
      };

      return {
        ...current,
        socialStateByPersona: {
          ...current.socialStateByPersona,
          [current.activePersonaId]: nextPersonaState
        },
        launches: current.launches.map((launch) =>
          launch.eventId === eventId
            ? {
                ...launch,
                reserveCount:
                  kind === "reserve" ? launch.reserveCount + 1 : launch.reserveCount,
                ticketCount:
                  kind === "ticket" ? launch.ticketCount + 1 : launch.ticketCount
              }
            : launch
        ),
        inbox: [
          {
            id: `inbox-ticket-${eventId}-${kind}-${Date.now()}`,
            kind: "tickets",
            title: kind === "ticket" ? "Ticket confirmed" : "Reserve saved",
            body:
              kind === "ticket"
                ? "Your ticket is now in Plans."
                : "You will see this event in your Plans.",
            href: "/my-events",
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ],
        activityLog: [
          createActivityEntry({
            kind: "event",
            actorIds: [currentUserId],
            title:
              kind === "ticket"
                ? `You are going to ${event.title}`
                : `You reserved ${event.title}`,
            body:
              kind === "ticket"
                ? "The event is now pinned in your Plans."
                : "You will be first to know when tickets finalize.",
            href: `/events/${eventId}`,
            eventId,
            imageUrl: event.posterUrl
          }),
          ...current.activityLog
        ]
      };
    });
  }

  const value: AppStateValue = {
    ...state,
    hydrated,
    currentPersona,
    currentUserId,
    currentUser,
    currentInterestState,
    currentProfile,
    homeCity,
    preferredFandoms,
    users,
    launchDrafts: state.launchDrafts,
    opportunities: seedOpportunities,
    listings: state.listings,
    businessProfiles: state.businessProfiles,
    supportIntents: state.supportIntents,
    currentBusinessProfile,
    currentStorefront,
    socialActivity,
    savedEventIds: currentInterestState.savedEventIds,
    interestedEventIds: currentInterestState.interestedEventIds,
    goingEventIds: currentInterestState.goingEventIds,
    followingIds: currentInterestState.followingIds,
    getApplicationsForOpportunity: (opportunityId) =>
      state.opportunityApplications.filter(
        (application) => application.opportunityId === opportunityId
      ),
    getApplicationForCurrentUser: (opportunityId) =>
      state.opportunityApplications.find(
        (application) =>
          application.opportunityId === opportunityId &&
          application.userId === currentUserId
      ),
    applyToOpportunity: (opportunityId, note) => {
      const opportunity = seedOpportunities.find((item) => item.id === opportunityId);
      if (!opportunity) {
        return;
      }

      const trimmedNote = note.trim();

      setState((current) => {
        const existing = current.opportunityApplications.find(
          (application) =>
            application.opportunityId === opportunityId &&
            application.userId === currentUserId
        );

        const nextApplication: OpportunityApplication = existing
          ? {
              ...existing,
              note: trimmedNote || existing.note,
              status: "submitted",
              submittedAt: new Date().toISOString()
            }
          : {
              id: `application-${opportunityId}-${currentUserId}`,
              opportunityId,
              userId: currentUserId,
              status: "submitted",
              note: trimmedNote || "Interested and available for the timing listed.",
              submittedAt: new Date().toISOString()
            };

        return {
          ...current,
          mode: "creator",
          opportunityApplications: existing
            ? current.opportunityApplications.map((application) =>
                application.id === existing.id ? nextApplication : application
              )
            : [nextApplication, ...current.opportunityApplications],
          inbox: [
            {
              id: `inbox-opportunity-${opportunityId}-${Date.now()}`,
              kind: "team",
              title: "Application sent",
              body: `${opportunity.title} is now in your work queue.`,
              href: "/work?tab=opportunities",
              createdAt: new Date().toISOString(),
              unread: true
            },
            ...current.inbox
          ],
          activityLog: [
            createActivityEntry({
              kind: "creator",
              actorIds: [currentUserId],
              title: `Applied to ${opportunity.title}`,
              body: opportunity.summary,
              href: `/opportunities/${opportunityId}`
            }),
            ...current.activityLog
          ]
        };
      });
    },
    createListing: (payload) => {
      const slug = payload.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const id = `listing-${slug || "new"}-${Math.random().toString(36).slice(2, 6)}`;
      const storefront =
        getStorefrontForUser(currentUserId) ??
        storefronts.find((item) => item.ownerUserId === currentUserId);

      const listing: Listing = {
        id,
        creatorUserId: currentUserId,
        storefrontId: storefront?.id ?? `storefront-${currentUserId}`,
        type: payload.type,
        title: payload.title,
        summary: payload.summary,
        description: payload.description,
        priceLabel: payload.priceLabel,
        city: payload.city ?? currentUser.city,
        imageUrl:
          payload.imageUrl ??
          currentProfile?.coverImageUrl ??
          currentUser.avatarUrl ??
          createPosterDataUri({
            title: payload.title,
            subtitle: payload.summary,
            eyebrow: payload.type,
            accent: "#1F1CB8",
            accent2: "#6D5EF3"
          }),
        fandomTags: payload.fandomTags,
        sublabel:
          payload.sublabel ??
          (payload.type === "service"
            ? "Service"
            : payload.type === "commission"
              ? "Commission"
              : payload.type === "resale"
                ? "Resale"
                : "Merch"),
        schema: {
          entityType: "listing",
          subtypes: [payload.type],
          location: payload.city ?? currentUser.city,
          summary: payload.summary,
          coreSkills: currentUser.skills.slice(0, 4),
          operationalStrengths: currentUser.skills.slice(0, 3),
          primaryInterests: payload.fandomTags,
          franchiseInterests: payload.fandomTags,
          audienceOrientation: ["fans", "hosts", "creators"],
          eventFormats: ["social", "pop-up"],
          embeddingTags: [...payload.fandomTags, payload.type],
          confidenceNotes: [
            "Created from the demo flow.",
            "Visible on the creator profile and Work hub right away."
          ]
        }
      };

      setState((current) => ({
        ...current,
        mode: "creator",
        listings: [listing, ...current.listings],
        inbox: [
          {
            id: `inbox-listing-${id}`,
            kind: "updates",
            title: "Listing is live",
            body: `${listing.title} now appears on your storefront.`,
            href: `/listings/${id}`,
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ],
        activityLog: [
          createActivityEntry({
            kind: "creator",
            actorIds: [currentUserId],
            title: `New listing: ${listing.title}`,
            body: listing.summary,
            href: `/listings/${id}`,
            imageUrl: listing.imageUrl
          }),
          ...current.activityLog
        ]
      }));

      return id;
    },
    toggleListingInterest: (listingId, kind) => {
      const listing = state.listings.find((item) => item.id === listingId);
      if (!listing) {
        return;
      }

      setState((current) => {
        const existing = current.listingInterests.find(
          (interest) => interest.listingId === listingId && interest.userId === currentUserId
        );
        const nextInterest: ListingInterest = {
          id: existing?.id ?? `listing-interest-${listingId}-${currentUserId}`,
          listingId,
          userId: currentUserId,
          kind,
          createdAt: new Date().toISOString()
        };

        return {
          ...current,
          listingInterests: existing
            ? current.listingInterests.map((interest) =>
                interest.id === existing.id ? nextInterest : interest
              )
            : [nextInterest, ...current.listingInterests],
          inbox: [
            {
              id: `inbox-listing-interest-${listingId}-${Date.now()}`,
              kind: "updates",
              title:
                kind === "mock_purchased"
                  ? "Order noted"
                  : kind === "requested"
                    ? "Request sent"
                    : "Saved to shop list",
              body:
                kind === "mock_purchased"
                  ? `${listing.title} is now tracked in your activity.`
                  : kind === "requested"
                    ? `Your request for ${listing.title} was saved.`
                    : `${listing.title} is now pinned for later.`,
              href: `/listings/${listingId}`,
              createdAt: new Date().toISOString(),
              unread: true
            },
            ...current.inbox
          ]
        };
      });
    },
    respondToBusinessMatch: (businessId, targetType, targetId, action) => {
      const business = getBusinessProfileById(businessId, state.businessProfiles);
      if (!business) {
        return;
      }

      setState((current) => {
        const existing = current.supportIntents.find(
          (intent) =>
            intent.businessId === businessId &&
            intent.targetType === targetType &&
            intent.targetId === targetId
        );

        const nextIntent: SupportIntent = {
          id: existing?.id ?? `support-${businessId}-${targetType}-${targetId}`,
          businessId,
          targetType,
          targetId,
          action,
          createdAt: new Date().toISOString()
        };

        const nextLaunches = current.launches.map((launch) =>
          launch.id === targetId && targetType === "launch"
            ? {
                ...launch,
                updates: [
                  {
                    id: `${launch.id}-business-${Date.now()}`,
                    title:
                      action === "hosting"
                        ? `${business.name} wants to host`
                        : `${business.name} wants to support`,
                    body:
                      action === "hosting"
                        ? "A venue-side partner expressed interest in holding the room if the launch keeps momentum."
                        : "A business-side partner wants to support the launch if it continues building signal.",
                    createdAt: new Date().toISOString()
                  },
                  ...launch.updates
                ]
              }
            : launch
        );

        return {
          ...current,
          supportIntents: existing
            ? current.supportIntents.map((intent) =>
                intent.id === existing.id ? nextIntent : intent
              )
            : [nextIntent, ...current.supportIntents],
          launches: nextLaunches,
          inbox: [
            {
              id: `inbox-business-${businessId}-${targetId}-${Date.now()}`,
              kind: "updates",
              title:
                action === "hosting"
                  ? "Hosting intent sent"
                  : action === "supporting"
                    ? "Support intent sent"
                    : "Saved to contenders",
              body: `${business.name} now has this match on its slate.`,
              href: `/businesses/${businessId}`,
              createdAt: new Date().toISOString(),
              unread: true
            },
            ...current.inbox
          ],
          activityLog: [
            createActivityEntry({
              kind: "creator",
              actorIds: [currentUserId],
              title:
                action === "hosting"
                  ? `${business.name} wants to host this`
                  : action === "supporting"
                    ? `${business.name} wants to support this`
                    : `${business.name} saved a match`,
              body: "Business-side matches stay explainable and lightweight in this prototype.",
              href: `/businesses/${businessId}`
            }),
            ...current.activityLog
          ]
        };
      });
    },
    updateBusinessProfile: (businessId, payload) => {
      setState((current) => ({
        ...current,
        businessProfiles: current.businessProfiles.map((profile) =>
          profile.id === businessId
            ? {
                ...profile,
                hostingPreferences:
                  payload.hostingPreferences ?? profile.hostingPreferences,
                supportInterests:
                  payload.supportInterests ?? profile.supportInterests,
                fandomInterests:
                  payload.fandomInterests ?? profile.fandomInterests
              }
            : profile
        )
      }));
    },
    updateImportedDataSettings: (payload) => {
      setState((current) => ({
        ...current,
        importedDataSettings: {
          ...current.importedDataSettings,
          ...payload
        }
      }));
    },
    setMode: (mode) =>
      setState((current) => ({
        ...current,
        mode,
        activePersonaId: getDefaultPersonaIdForMode(mode)
      })),
    switchPersona: (personaId) => {
      const preset = getPersonaPresetById(personaId);
      if (!preset) {
        return;
      }

      setState((current) => ({
        ...current,
        activePersonaId: personaId,
        mode: preset.mode
      }));
    },
    updateOnboarding: (payload) => {
      setState((current) => {
        const merged = {
          ...current.onboarding,
          ...payload
        };
        const primaryBranch =
          merged.primaryBranch ??
          resolveBranch(merged.primaryIntent, merged.collaborationRoute);
        const mode = merged.mode ?? getModeForBranch(primaryBranch);

        return {
          ...current,
          onboarding: {
            ...merged,
            primaryBranch,
            mode,
            onboardingVersion: ONBOARDING_VERSION,
            ...deriveOnboardingGraphs(merged)
          }
        };
      });
    },
    completeOnboarding: (payload) => {
      setState((current) => {
        const merged = {
          ...current.onboarding,
          ...payload
        };
        const primaryBranch =
          merged.primaryBranch ??
          resolveBranch(merged.primaryIntent, merged.collaborationRoute);
        const mode = merged.mode ?? getModeForBranch(primaryBranch);
        const nextPersonaId = getDefaultPersonaIdForMode(mode);
        const nextUserId = resolveCurrentUserId(nextPersonaId, mode);
        const completedOnboarding: OnboardingState = {
          ...merged,
          primaryBranch,
          mode,
          authMethod: "phone",
          completed: true,
          hasCompletedOnboarding: true,
          profileSetupCompleted: true,
          usedSampleProfile: merged.usedSampleProfile ?? false,
          onboardingVersion: ONBOARDING_VERSION,
          secondaryAddOnStatus:
            merged.secondaryIntent && merged.secondaryAddOnStatus === "accepted"
              ? "completed"
              : merged.secondaryAddOnStatus ?? null,
          ...deriveOnboardingGraphs(merged)
        };

        return {
          ...current,
          mode,
          activePersonaId: nextPersonaId,
          onboarding: completedOnboarding,
          profileDrafts: {
            ...current.profileDrafts,
            [nextUserId]: buildProfileDraftFromOnboarding(
              completedOnboarding,
              current.profileDrafts[nextUserId]
            )
          },
          businessProfiles:
            mode === "business"
              ? current.businessProfiles.map((profile) =>
                  profile.ownerUserId === nextUserId
                    ? {
                        ...profile,
                        city: completedOnboarding.city || profile.city,
                        area: completedOnboarding.neighborhood || profile.area,
                        businessType:
                          toBusinessType(completedOnboarding.businessType) ??
                          profile.businessType,
                        fandomInterests:
                          completedOnboarding.businessSceneTags.length > 0
                            ? completedOnboarding.businessSceneTags
                            : profile.fandomInterests,
                        supportInterests:
                          completedOnboarding.businessGoals.length > 0
                            ? completedOnboarding.businessGoals
                            : profile.supportInterests,
                        hostingPreferences:
                          completedOnboarding.businessTalentNeeds.length > 0
                            ? completedOnboarding.businessTalentNeeds
                            : profile.hostingPreferences,
                        summary: completedOnboarding.businessGoals.length > 0
                          ? `Looking for ${completedOnboarding.businessGoals.slice(0, 2).join(" and ")} in ${completedOnboarding.city || profile.city}.`
                          : profile.summary
                      }
                    : profile
                )
              : current.businessProfiles
        };
      });
    },
    resetOnboarding: () => {
      setState((current) => {
        const demoUserIds = [
          FAN_DEMO_USER_ID,
          CREATOR_DEMO_USER_ID,
          HOST_DEMO_USER_ID,
          BUSINESS_DEMO_USER_ID
        ];

        const nextProfileDrafts = Object.fromEntries(
          Object.entries(current.profileDrafts).filter(([userId]) => !demoUserIds.includes(userId))
        );

        return {
          ...current,
          mode: "fan",
          activePersonaId: "persona-fan",
          onboarding: onboardingDefaults,
          profileDrafts: nextProfileDrafts,
          businessProfiles: seedBusinessProfiles
        };
      });
    },
    activateSampleProfile: (mode = "fan") => {
      const partial =
        mode === "host"
          ? {
              displayName: "Zo Park",
              city: "Pasadena, CA",
              primaryIntent: "throw_event" as OnboardingIntent,
              primaryBranch: "organizer" as OnboardingBranch,
              organizerGoal: "another_event" as const,
              organizerExperience: "regular" as const,
              organizerEventTypes: ["raves", "themed balls"],
              fandomTags: ["Cosplay", "Fantasy"],
              socials: [{ platform: "instagram" as const, mode: "connected" as const, value: "@zo.afterdark" }]
            }
          : mode === "creator"
            ? {
                displayName: "Aphex",
                city: "Los Angeles, CA",
                primaryIntent: "get_booked" as OnboardingIntent,
                primaryBranch: "talent" as OnboardingBranch,
                skills: ["photographer", "social promo"],
                workEventTypes: ["live shows", "nightlife"],
                fandomTags: ["Cosplay", "JJK", "Marvel"],
                travelRadius: "city" as const,
                socials: [{ platform: "instagram" as const, mode: "connected" as const, value: "@aphex.scene" }],
                portfolioLink: "portfolio.example/saga"
              }
            : mode === "business"
              ? {
                  displayName: "Neon Shrine",
                  city: "Los Angeles, CA",
                  primaryIntent: "book_talent_or_business" as OnboardingIntent,
                  primaryBranch: "business" as OnboardingBranch,
                  businessType: "venue",
                  businessGoals: ["host events", "find talent"],
                  businessTalentNeeds: ["DJs", "photographers", "event organizers"],
                  businessSceneTags: ["Anime", "Gaming", "Nightlife"],
                  socials: [{ platform: "instagram" as const, mode: "connected" as const, value: "@neonshrine.la" }]
                }
              : {
                  displayName: "Kai",
                  city: "Los Angeles, CA",
                  primaryIntent: "explore" as OnboardingIntent,
                  primaryBranch: "explorer" as OnboardingBranch,
                  fandomTags: ["Jujutsu Kaisen", "Cosplay", "Love and Deepspace"],
                  eventTypePreferences: ["meetups", "watch parties"],
                  outingStyleTags: ["solo-friendly", "plan-ahead nights"],
                  socials: [{ platform: "instagram" as const, mode: "handle" as const, value: "@kai.afterhours" }]
                };

      const completed = buildSeededOnboarding(
        {
          ...partial,
          usedSampleProfile: true
        },
        mode
      );
      const nextPersonaId = getDefaultPersonaIdForMode(mode);
      const nextUserId = resolveCurrentUserId(nextPersonaId, mode);

      setState((current) => ({
        ...current,
        mode,
        activePersonaId: nextPersonaId,
        onboarding: completed,
        profileDrafts: {
          ...current.profileDrafts,
          [nextUserId]: buildProfileDraftFromOnboarding(
            completed,
            current.profileDrafts[nextUserId]
          )
        }
      }));
    },
    finishProfileSetup: (payload) => {
      setState((current) => ({
        ...current,
        onboarding: {
          ...current.onboarding,
          profileSetupCompleted: true
        },
        profileDrafts: {
          ...current.profileDrafts,
          [currentUserId]: {
            ...current.profileDrafts[currentUserId],
            ...payload
          }
        }
      }));
    },
    startLaunchDraft: (mode) => {
      const draft = createEmptyLaunchDraft(mode, currentUserId);

      setState((current) => ({
        ...current,
        mode: "host",
        activePersonaId: "persona-host",
        launchDrafts: [draft, ...current.launchDrafts.filter((item) => item.id !== draft.id)]
      }));

      return draft.id;
    },
    updateLaunchDraft: (draftId, payload) => {
      setState((current) => ({
        ...current,
        mode: "host",
        activePersonaId: "persona-host",
        launchDrafts: current.launchDrafts.map((draft) =>
          draft.id === draftId
            ? syncLaunchDraft({
                ...draft,
                ...payload,
                draftStatus:
                  payload.draftStatus ??
                  (draft.draftStatus === "published" ? "published" : draft.draftStatus)
              })
            : draft
        )
      }));
    },
    saveLaunchDraft: (draftId) => {
      setState((current) => ({
        ...current,
        mode: "host",
        activePersonaId: "persona-host",
        launchDrafts: current.launchDrafts.map((draft) =>
          draft.id === draftId
            ? syncLaunchDraft({
                ...draft,
                draftStatus: "saved"
              })
            : draft
        )
      }));
    },
    publishLaunchDraft: (draftId) => {
      const draft = state.launchDrafts.find((item) => item.id === draftId);
      if (!draft) {
        return null;
      }

      const syncedDraft = syncLaunchDraft(draft);
      const payload = mapDraftToCreateLaunchPayload(syncedDraft);
      const launchId = `launch-${payload.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "new"}-${Math.random().toString(36).slice(2, 6)}`;

      const eventId =
        syncedDraft.launchMode === "happening"
          ? demo.createEvent(
              {
                name: payload.title,
                dateTime: payload.startsAt,
                location: payload.venue,
                description: payload.description,
                communities: payload.fandomTags.join(", "),
                eventFormat: payload.format,
                sourceCrew: payload.teamRoleNames.length > 0,
                posterUrl: payload.coverImageUrl
              },
              HOST_DEMO_USER_ID
            )
          : undefined;

      const nextLaunch = createSeedLaunch({
        id: launchId,
        eventId,
        hostId: HOST_DEMO_USER_ID,
        title: payload.title,
        format: payload.format,
        city: payload.city,
        venue: payload.venue,
        startsAt: payload.startsAt,
        description: payload.description,
        fandomTags: payload.fandomTags,
        budgetRange: payload.budgetRange,
        attendanceGoal: payload.attendanceGoal,
        thresholdTarget: payload.thresholdTarget,
        reserveCount: syncedDraft.launchMode === "soft" ? 0 : Math.max(8, Math.round(payload.attendanceGoal * 0.08)),
        ticketCount: syncedDraft.launchMode === "happening" ? Math.max(18, Math.round(payload.attendanceGoal * 0.14)) : 0,
        status: syncedDraft.launchMode === "soft" ? "live_soft_launch" : "confirmed",
        teamRoleNames: payload.teamRoleNames,
        published: true,
        coverImageUrl: payload.coverImageUrl,
        softLaunchSummary: syncedDraft.generatedDraft.summary,
        vibeNote: syncedDraft.generatedDraft.summary,
        inspiration: syncedDraft.guestExperienceSelections.slice(0, 4),
        guestLine: buildLaunchDraftGuestLine(syncedDraft),
        ticketPrice: payload.ticketPrice,
        dateOptions: payload.dateOptions,
        updates: [
          {
            title: syncedDraft.launchMode === "soft" ? "Soft launch is live" : "Event is live",
            body:
              syncedDraft.launchMode === "soft"
                ? "Fans can now back the idea, pick a date, and help turn it into a confirmed night."
                : "The event is now published and ready to share.",
            createdAt: new Date().toISOString()
          }
        ]
      });

      setState((current) => ({
        ...current,
        mode: "host",
        activePersonaId: "persona-host",
        hasStartedLaunch: true,
        launches: [nextLaunch, ...current.launches],
        launchDrafts: current.launchDrafts.map((item) =>
          item.id === draftId
            ? syncLaunchDraft({
                ...item,
                draftStatus: "published"
              })
            : item
        ),
        inbox: [
          {
            id: `inbox-draft-publish-${launchId}`,
            kind: "updates",
            title: syncedDraft.launchMode === "soft" ? "Soft launch published" : "Event published",
            body:
              syncedDraft.launchMode === "soft"
                ? `${payload.title} is now live for early support.`
                : `${payload.title} is now live as a confirmed event.`,
            href: syncedDraft.launchMode === "soft" ? `/campaigns/${launchId}` : `/events/${eventId}`,
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ],
        activityLog: [
          createActivityEntry({
            kind: "event",
            actorIds: [HOST_DEMO_USER_ID],
            title: syncedDraft.launchMode === "soft" ? `${payload.title} soft launch is live` : `${payload.title} is live`,
            body: syncedDraft.generatedDraft.summary,
            href: syncedDraft.launchMode === "soft" ? `/campaigns/${launchId}` : `/events/${eventId}`,
            imageUrl: payload.coverImageUrl
          }),
          ...current.activityLog
        ]
      }));

      return { launchId, eventId };
    },
    createLaunch: (payload) => {
      const id = `launch-${payload.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "new"}-${Math.random().toString(36).slice(2, 6)}`;
      const plan = buildLaunchPlan(payload);

      setState((current) => ({
        ...current,
        mode: "host",
        activePersonaId: "persona-host",
        hasStartedLaunch: true,
        launches: [
          {
            id,
            hostId: HOST_DEMO_USER_ID,
            title: payload.title,
            format: payload.format,
            city: payload.city,
            venue: payload.venue,
            startsAt: payload.startsAt,
            description: payload.description,
            fandomTags: payload.fandomTags,
            budgetRange: payload.budgetRange,
            attendanceGoal: payload.attendanceGoal,
            coverImageUrl:
              payload.coverImageUrl ||
              createSeedLaunch({
                id: `${id}-cover`,
                hostId: HOST_DEMO_USER_ID,
                title: payload.title,
                format: payload.format,
                city: payload.city,
                venue: payload.venue,
                startsAt: payload.startsAt,
                description: payload.description,
                fandomTags: payload.fandomTags,
                budgetRange: payload.budgetRange,
                attendanceGoal: payload.attendanceGoal,
                thresholdTarget: payload.thresholdTarget,
                reserveCount: 0,
                ticketCount: 0,
                status: "draft",
                teamRoleNames: payload.teamRoleNames,
                published: false
              }).coverImageUrl,
            reserveCount: 0,
            ticketCount: 0,
            published: false,
            status: "draft",
            teamRoleNames: payload.teamRoleNames,
            acceptedTeam: [],
            plan,
            softLaunchSummary: `${payload.title} is still gathering signal. Fans can lock interest, choose a date, and help push it into venue pairing.`,
            vibeNote: payload.vibeNote,
            inspiration: payload.inspiration,
            guestLine: payload.guestLine,
            ticketPrice: payload.ticketPrice,
            dateOptions: payload.dateOptions.map((option, index) => ({
              id: `${id}-date-${index + 1}`,
              label: option.label,
              iso: option.iso,
              votes: 0
            })),
            pledges: [],
            updates: [
              {
                id: `${id}-update-1`,
                title: "Draft ready",
                body: "The concept is staged. Launch it when the copy, dates, and vibe feel right.",
                createdAt: new Date().toISOString()
              }
            ],
            venueCandidates: [],
            payouts: {
              ticketSales: 0,
              merchSales: 0,
              costs: [
                { label: "Venue hold", amount: 420 },
                { label: "Decor reserve", amount: 180 }
              ],
              contributorPayouts: payload.teamRoleNames.map((roleName, index) => ({
                roleName,
                amount: 160 + index * 40
              })),
              hostNet: 0,
              repeatNote:
                "Once this run closes, copy it to the next city with the same team core."
            },
            runOfShow: [
              { time: "4:00 PM", label: "Venue load-in", owner: "Host" },
              { time: "5:30 PM", label: "Team check", owner: "Ops" },
              { time: "7:00 PM", label: "Doors", owner: "Check-in" },
              { time: "9:00 PM", label: "Hero beat", owner: "Photo" }
            ]
          },
          ...current.launches
        ]
      }));

      return id;
    },
    updateLaunch: (launchId, payload) => {
      setState((current) => ({
        ...current,
        launches: current.launches.map((launch) => {
          if (launch.id !== launchId) {
            return launch;
          }

          const nextLaunch = {
            ...launch,
            title: payload.title ?? launch.title,
            format: payload.format ?? launch.format,
            city: payload.city ?? launch.city,
            venue: payload.venue ?? launch.venue,
            startsAt: payload.startsAt ?? launch.startsAt,
            description: payload.description ?? launch.description,
            fandomTags: payload.fandomTags ?? launch.fandomTags,
            budgetRange: payload.budgetRange ?? launch.budgetRange,
            attendanceGoal: payload.attendanceGoal ?? launch.attendanceGoal,
            teamRoleNames: payload.teamRoleNames ?? launch.teamRoleNames,
            ticketPrice: payload.ticketPrice ?? launch.ticketPrice,
            vibeNote: payload.vibeNote ?? launch.vibeNote,
            inspiration: payload.inspiration ?? launch.inspiration,
            guestLine: payload.guestLine ?? launch.guestLine
          };

          return syncLaunchShape({
            ...nextLaunch,
            plan: buildLaunchPlan({
              title: nextLaunch.title,
              format: nextLaunch.format,
              city: nextLaunch.city,
              venue: nextLaunch.venue,
              startsAt: nextLaunch.startsAt,
              description: nextLaunch.description,
              fandomTags: nextLaunch.fandomTags,
              budgetRange: nextLaunch.budgetRange,
              attendanceGoal: nextLaunch.attendanceGoal,
              thresholdTarget: payload.thresholdTarget ?? launch.plan.thresholdTarget,
              teamRoleNames: nextLaunch.teamRoleNames,
              ticketPrice: nextLaunch.ticketPrice,
              vibeNote: nextLaunch.vibeNote,
              inspiration: nextLaunch.inspiration,
              guestLine: nextLaunch.guestLine,
              dateOptions: nextLaunch.dateOptions.map((option) => ({
                label: option.label,
                iso: option.iso
              })),
              coverImageUrl: nextLaunch.coverImageUrl
            })
          });
        })
      }));
    },
    addLaunchUpdate: (launchId, payload) => {
      const cleanTitle = payload.title.trim();
      const cleanBody = payload.body.trim();
      if (!cleanTitle || !cleanBody) {
        return;
      }

      setState((current) => {
        const launch = current.launches.find((item) => item.id === launchId);
        if (!launch) {
          return current;
        }

        return {
          ...current,
          launches: current.launches.map((item) =>
            item.id === launchId
              ? {
                  ...item,
                  updates: [
                    {
                      id: `${launchId}-host-update-${Date.now()}`,
                      title: cleanTitle,
                      body: cleanBody,
                      createdAt: new Date().toISOString()
                    },
                    ...item.updates
                  ]
                }
              : item
          ),
          inbox: [
            {
              id: `inbox-launch-update-${launchId}-${Date.now()}`,
              kind: "updates",
              title: cleanTitle,
              body: cleanBody,
              href: `/campaigns/${launchId}`,
              createdAt: new Date().toISOString(),
              unread: true
            },
            ...current.inbox
          ],
          activityLog: [
            createActivityEntry({
              kind: "event",
              actorIds: [currentUserId],
              title: cleanTitle,
              body: cleanBody,
              href: `/campaigns/${launchId}`
            }),
            ...current.activityLog
          ]
        };
      });
    },
    watchLaunch: (launchId, dateOptionId) => {
      setState((current) => ({
        ...current,
        launches: current.launches.map((launch) => {
          if (launch.id !== launchId || launch.eventId) {
            return launch;
          }

          const existingPledge = launch.pledges.find(
            (pledge) => pledge.userId === currentUserId
          );
          if (existingPledge?.kind === "watching" && existingPledge.dateOptionId === dateOptionId) {
            return launch;
          }

          const nextPledges = existingPledge
            ? launch.pledges.map((pledge) =>
                pledge.userId === currentUserId
                  ? {
                      ...pledge,
                      kind: "watching" as const,
                      dateOptionId: dateOptionId ?? pledge.dateOptionId,
                      amount: 0
                    }
                  : pledge
              )
            : [
                ...launch.pledges,
                {
                  userId: currentUserId,
                  kind: "watching" as const,
                  dateOptionId,
                  amount: 0,
                  createdAt: new Date().toISOString()
                }
              ];

          const nextLaunch = syncLaunchShape({
            ...launch,
            reserveCount:
              existingPledge?.kind === "watching"
                ? launch.reserveCount
                : existingPledge?.kind === "pledged"
                  ? launch.reserveCount + 1
                  : launch.reserveCount + 1,
            ticketCount:
              existingPledge?.kind === "pledged" ? Math.max(0, launch.ticketCount - 1) : launch.ticketCount,
            pledges: nextPledges,
            updates: [
              {
                id: `${launch.id}-watch-${Date.now()}`,
                title: "New watcher joined",
                body: "A fan saved the concept and chose a preferred date.",
                createdAt: new Date().toISOString()
              },
              ...launch.updates
            ]
          });

          return nextLaunch;
        }),
        inbox: [
          {
            id: `inbox-watch-${launchId}-${Date.now()}`,
            kind: "updates",
            title: "Watching soft launch",
            body: "We’ll keep you posted as this idea gains momentum.",
            href: `/campaigns/${launchId}`,
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ],
        activityLog: [
          createActivityEntry({
            kind: "event",
            actorIds: [currentUserId],
            title: "Watching a soft launch",
            body: "You’ll see updates when the date picture or momentum changes.",
            href: `/campaigns/${launchId}`
          }),
          ...current.activityLog
        ]
      }));
    },
    pledgeLaunch: (launchId, dateOptionId) => {
      setState((current) => ({
        ...current,
        launches: current.launches.map((launch) => {
          if (launch.id !== launchId || launch.eventId) {
            return launch;
          }

          const existingPledge = launch.pledges.find(
            (pledge) => pledge.userId === currentUserId
          );
          if (existingPledge?.kind === "pledged" && existingPledge.dateOptionId === dateOptionId) {
            return launch;
          }

          const nextPledges = existingPledge
            ? launch.pledges.map((pledge) =>
                pledge.userId === currentUserId
                  ? {
                      ...pledge,
                      kind: "pledged" as const,
                      dateOptionId,
                      amount: launch.ticketPrice
                    }
                  : pledge
              )
            : [
                ...launch.pledges,
                {
                  userId: currentUserId,
                  kind: "pledged" as const,
                  dateOptionId,
                  amount: launch.ticketPrice,
                  createdAt: new Date().toISOString()
                }
              ];

          const nextLaunch = syncLaunchShape({
            ...launch,
            reserveCount:
              existingPledge?.kind === "watching"
                ? Math.max(0, launch.reserveCount - 1)
                : launch.reserveCount,
            ticketCount:
              existingPledge?.kind === "pledged" ? launch.ticketCount : launch.ticketCount + 1,
            pledges: nextPledges,
            updates: [
              {
                id: `${launch.id}-pledge-${Date.now()}`,
                title: "New reserve came in",
                body: "A supporter reserved a spot and helped push the event toward confirmation.",
                createdAt: new Date().toISOString()
              },
              ...launch.updates
            ]
          });

          return nextLaunch;
        }),
        inbox: [
          {
            id: `inbox-pledge-${launchId}-${Date.now()}`,
            kind: "tickets",
            title: "Reserve saved",
            body: "Your spot is pending until the launch clears threshold and confirms.",
            href: `/campaigns/${launchId}`,
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ],
        activityLog: [
          createActivityEntry({
            kind: "event",
            actorIds: [currentUserId],
            title: "Reserved a soft launch",
            body: "You picked a date and helped move the event toward venue pairing.",
            href: `/campaigns/${launchId}`
          }),
          ...current.activityLog
        ]
      }));
    },
    acceptVenuePairing: (launchId, venueId) => {
      const launch = state.launches.find((item) => item.id === launchId);
      if (!launch) {
        return null;
      }

      const venue = launch.venueCandidates.find((candidate) => candidate.id === venueId);
      if (!venue) {
        return null;
      }

      const eventId =
        launch.eventId ??
        demo.createEvent(
          {
            name: launch.title,
            dateTime:
              launch.dateOptions.find((option) => option.id === launch.pledges.find((pledge) => pledge.kind === "pledged")?.dateOptionId)?.iso ??
              launch.startsAt,
            location: `${venue.name}, ${launch.city}`,
            description: launch.description,
            communities: launch.fandomTags.join(", "),
            eventFormat: launch.format,
            sourceCrew: launch.teamRoleNames.length > 0,
            posterUrl: launch.coverImageUrl
          },
          HOST_DEMO_USER_ID
        );

      setState((current) => ({
        ...current,
        launches: current.launches.map((item) => {
          if (item.id !== launchId) {
            return item;
          }

          return syncLaunchShape({
            ...item,
            selectedVenueId: venueId,
            venue: `${venue.name}, ${venue.area}`,
            eventId,
            published: true,
            status: "confirmed",
            updates: [
              {
                id: `${item.id}-venue-${Date.now()}`,
                title: "Venue paired",
                body: `${venue.name} was selected and the event is now confirmed.`,
                createdAt: new Date().toISOString()
              },
              ...item.updates
            ]
          });
        }),
        inbox: [
          {
            id: `inbox-confirm-${launchId}`,
            kind: "updates",
            title: "Event confirmed",
            body: `${launch.title} now has a venue and a locked public page.`,
            href: `/events/${eventId}`,
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ],
        activityLog: [
          createActivityEntry({
            kind: "event",
            actorIds: [HOST_DEMO_USER_ID],
            title: `${launch.title} is confirmed`,
            body: `${venue.name} is locked and the public event page is live.`,
            href: `/events/${eventId}`,
            eventId
          }),
          ...current.activityLog
        ],
        hasStartedLaunch: true
      }));

      return eventId;
    },
    acceptLaunchMatch: (launchId, roleName, userId) => {
      setState((current) => ({
        ...current,
        launches: current.launches.map((launch) =>
          launch.id === launchId
            ? {
                ...launch,
                acceptedTeam: launch.acceptedTeam.some(
                  (entry) => entry.roleName === roleName && entry.userId === userId
                )
                  ? launch.acceptedTeam
                  : [...launch.acceptedTeam, { roleName, userId }]
              }
            : launch
        )
      }));
    },
    removeLaunchMatch: (launchId, roleName, userId) => {
      setState((current) => ({
        ...current,
        launches: current.launches.map((launch) =>
          launch.id === launchId
            ? {
                ...launch,
                acceptedTeam: launch.acceptedTeam.filter(
                  (entry) => !(entry.roleName === roleName && entry.userId === userId)
                )
              }
            : launch
        )
      }));
    },
    publishLaunch: (launchId) => {
      const launch = state.launches.find((item) => item.id === launchId);
      if (!launch) {
        return null;
      }

      if (launch.published) {
        return launch.eventId ?? launch.id;
      }

      setState((current) => ({
        ...current,
        launches: current.launches.map((item) =>
          item.id === launchId
            ? syncLaunchShape({
                ...item,
                published: true,
                status: "live_soft_launch",
                updates: [
                  {
                    id: `${item.id}-launch-${Date.now()}`,
                    title: "Soft launch is live",
                    body: "Fans can now watch it, reserve early, and vote on the best date.",
                    createdAt: new Date().toISOString()
                  },
                  ...item.updates
                ]
              })
            : item
        ),
        inbox: [
          {
            id: `inbox-publish-${launchId}`,
            kind: "updates",
            title: "Soft launch published",
            body: `${launch.title} is now live as an interest check.`,
            href: `/studio/${launchId}`,
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ],
        activityLog: [
          createActivityEntry({
            kind: "event",
            actorIds: [HOST_DEMO_USER_ID],
            title: `${launch.title} soft launch is live`,
            body: "The campaign is now visible in Home and Discover.",
            href: `/campaigns/${launchId}`,
            imageUrl: launch.coverImageUrl
          }),
          ...current.activityLog
        ],
        hasStartedLaunch: true
      }));

      return launch.id;
    },
    completeLaunch: (launchId) => {
      setState((current) => ({
        ...current,
        launches: current.launches.map((launch) =>
          launch.id === launchId
            ? {
                ...launch,
                status: "completed",
                payouts: {
                  ...launch.payouts,
                  hostNet: Math.max(
                    320,
                    launch.payouts.ticketSales +
                      launch.payouts.merchSales -
                      launch.payouts.costs.reduce((sum, item) => sum + item.amount, 0) -
                      launch.payouts.contributorPayouts.reduce(
                        (sum, item) => sum + item.amount,
                        0
                      )
                  )
                }
              }
            : launch
        ),
        inbox: [
          {
            id: `inbox-payouts-${launchId}`,
            kind: "payments",
            title: "Payouts ready",
            body: "Launch closed. Review the payout summary next.",
            href: `/studio/${launchId}?tab=payouts`,
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ]
      }));
    },
    bookEvent: (eventId, kind) => commitBooking(eventId, kind),
    toggleSavedEvent: (eventId) => {
      const event = demo.events.find((item) => item.id === eventId);
      if (!event) {
        return;
      }

      setState((current) => {
        const personaState = current.socialStateByPersona[current.activePersonaId];
        const isSaved = personaState.savedEventIds.includes(eventId);
        return {
          ...current,
          socialStateByPersona: {
            ...current.socialStateByPersona,
            [current.activePersonaId]: {
              ...personaState,
              savedEventIds: isSaved
                ? personaState.savedEventIds.filter((id) => id !== eventId)
                : [eventId, ...personaState.savedEventIds]
            }
          },
          activityLog: isSaved
            ? current.activityLog
            : [
                createActivityEntry({
                  kind: "event",
                  actorIds: [currentUserId],
                  title: `Saved ${event.title}`,
                  body: "It is now waiting in Plans.",
                  href: `/events/${eventId}`,
                  eventId,
                  imageUrl: event.posterUrl
                }),
                ...current.activityLog
              ]
        };
      });
    },
    toggleInterestedEvent: (eventId) => {
      const event = demo.events.find((item) => item.id === eventId);
      if (!event) {
        return;
      }

      setState((current) => {
        const personaState = current.socialStateByPersona[current.activePersonaId];
        const isInterested = personaState.interestedEventIds.includes(eventId);
        return {
          ...current,
          socialStateByPersona: {
            ...current.socialStateByPersona,
            [current.activePersonaId]: {
              ...personaState,
              interestedEventIds: isInterested
                ? personaState.interestedEventIds.filter((id) => id !== eventId)
                : [eventId, ...personaState.interestedEventIds],
              goingEventIds: personaState.goingEventIds.filter((id) => id !== eventId)
            }
          },
          activityLog: isInterested
            ? current.activityLog
            : [
                createActivityEntry({
                  kind: "event",
                  actorIds: [currentUserId],
                  title: `Interested in ${event.title}`,
                  body: "We will keep it high in your feed and Plans.",
                  href: `/events/${eventId}`,
                  eventId,
                  imageUrl: event.posterUrl
                }),
                ...current.activityLog
              ]
        };
      });
    },
    markGoing: (eventId) => commitBooking(eventId, "ticket"),
    toggleFollow: (userId) => {
      const target = users.find((user) => user.id === userId);
      if (!target || userId === currentUserId) {
        return;
      }

      setState((current) => {
        const personaState = current.socialStateByPersona[current.activePersonaId];
        const isFollowing = personaState.followingIds.includes(userId);
        return {
          ...current,
          socialStateByPersona: {
            ...current.socialStateByPersona,
            [current.activePersonaId]: {
              ...personaState,
              followingIds: isFollowing
                ? personaState.followingIds.filter((id) => id !== userId)
                : [userId, ...personaState.followingIds]
            }
          },
          activityLog: isFollowing
            ? current.activityLog
            : [
                createActivityEntry({
                  kind: "follow",
                  actorIds: [currentUserId],
                  title: `Following ${target.name}`,
                  body: "Their events, posts, and updates will show up higher in Home.",
                  href: `/profiles/${userId}`
                }),
                ...current.activityLog
              ]
        };
      });
    },
    markInboxRead: (itemId) => {
      setState((current) => ({
        ...current,
        inbox: current.inbox.map((item) =>
          item.id === itemId ? { ...item, unread: false } : item
        )
      }));
    },
    resolveUser: (userId) => users.find((user) => user.id === userId)
  };

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return context;
}
