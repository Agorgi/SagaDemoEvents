import {
  type DemoEvent,
  type DemoUser,
  users as seedUsers
} from "@/src/data/demo";
import {
  createSeedLaunch,
  forecastTurnout,
  getLaunchFundingProgress,
  type DemoLaunch,
  type UserMode
} from "@/src/data/launches";
import { type LaunchWizardDraft } from "@/src/data/launch-builder";
import {
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
  type InterestState,
  type SocialActivityItem
} from "@/src/data/social";
import {
  getSeedCreatorProfileById,
  type CreatorProfile
} from "@/src/data/creator-profiles";
import {
  BUSINESS_DEMO_USER_ID,
  CREATOR_DEMO_USER_ID,
  FAN_DEMO_USER_ID,
  HOST_DEMO_USER_ID
} from "@/src/lib/host-mode";
import { createPosterDataUri } from "@/src/lib/demo-media";

export type ProfileDraft = {
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

export type SocialStateByPersona = Record<string, InterestState>;

export function createSyntheticLaunch(event: DemoEvent) {
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
    coverImagePosition: event.posterPosition,
    softLaunchSummary: `${event.title} already moved through its soft launch and is now a confirmed public event.`,
    vibeNote: event.subtitle
  });
}

export function syncLaunches(launches: DemoLaunch[], events: DemoEvent[]) {
  const byEventId = new Set(
    launches.map((launch) => launch.eventId).filter((value): value is string => Boolean(value))
  );
  const syntheticLaunches = events
    .filter((event) => !byEventId.has(event.id))
    .map((event) => createSyntheticLaunch(event));

  return [...launches, ...syntheticLaunches].map((launch) => syncLaunchShape(launch));
}

export function mergeUsers(profileDrafts: Record<string, ProfileDraft>) {
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

export function normalizeCreatorProfiles(
  profiles: CreatorProfile[],
  mergedUsers: Array<DemoUser & { draft?: ProfileDraft }>
) {
  return profiles.map((profile) => {
    const user = mergedUsers.find((entry) => entry.id === profile.id);
    const socialProfile = getProfileByUserId(profile.id);

    return {
      ...profile,
      displayName: user?.draft?.name || profile.displayName || user?.name || "Saga Creator",
      handle: profile.handle || user?.handle || "@saga",
      location: user?.draft?.city || profile.location || user?.city || "Los Angeles, CA",
      bio:
        user?.draft?.bio ||
        profile.bio ||
        socialProfile?.headline ||
        user?.bio ||
        "Creator profile.",
      avatarImage: profile.avatarImage || user?.avatarUrl || "",
      coverImage: profile.coverImage || socialProfile?.coverImageUrl || user?.avatarUrl,
      tags:
        user?.draft?.fandoms?.length
          ? user.draft.fandoms
          : profile.tags.length > 0
            ? profile.tags
            : socialProfile?.fandoms.length
              ? socialProfile.fandoms
              : user?.fandomTags ?? [],
      stats: {
        ...profile.stats,
        privateRating:
          typeof profile.stats.privateRating === "number" ? profile.stats.privateRating : 4.8,
        privateServices: profile.services.length
      }
    };
  });
}

export function buildFallbackCreatorProfile(
  userId: string,
  mergedUsers: Array<DemoUser & { draft?: ProfileDraft }>
) {
  const user = mergedUsers.find((entry) => entry.id === userId);
  const socialProfile = getProfileByUserId(userId);
  const seeded = getSeedCreatorProfileById(userId);

  if (seeded) {
    return seeded;
  }

  if (!user) {
    return undefined;
  }

  return {
    id: user.id,
    displayName: user.name,
    handle: user.handle,
    location: user.city,
    bio: socialProfile?.headline ?? user.bio,
    tags: socialProfile?.fandoms ?? user.fandomTags,
    avatarImage: user.avatarUrl ?? "",
    coverImage: socialProfile?.coverImageUrl ?? user.avatarUrl,
    portfolio: [],
    savedItems: [],
    services: (socialProfile?.servicesPreview ?? []).slice(0, 2).map((service, index) => ({
      id: `service-${user.id}-${index}`,
      category: "other",
      title: service,
      pricingLabel: "By project",
      shortDescription: `${service} for fandom nights and creator-led drops.`,
      coverStyle: index % 2 === 0 ? "violet" : "gold",
      coverImagePosition: "center",
      visibleOnPublicProfile: index === 0
    })),
    stats: {
      publicPosts: user.pastEventsWorked,
      publicFollowers: user.mutuals,
      publicFollowing: user.skills.length,
      privateProjects: user.pastEventsWorked,
      privateRating: 4.7,
      privateServices: Math.max((socialProfile?.servicesPreview ?? []).length, 1)
    },
    earnings: {
      total: "$0.00",
      available: "$0",
      pending: "$0"
    }
  } satisfies CreatorProfile;
}

export function resolveCurrentUserId(personaId: string, mode: UserMode) {
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

export function syncPersonaStates(input?: Partial<SocialStateByPersona>) {
  return demoPersonaPresets.reduce<SocialStateByPersona>((accumulator, persona) => {
    accumulator[persona.id] = {
      ...seedInterestStateByPersona[persona.id],
      ...(input?.[persona.id] ?? {})
    };
    return accumulator;
  }, {});
}

export function createActivityEntry(
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

export function formatDisplayLocation(city: string, neighborhood?: string) {
  if (neighborhood?.trim()) {
    return `${neighborhood.trim()}, ${city}`;
  }

  return city;
}

export function buildProfileDraftFromOnboarding(
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

export function buildSeededOnboarding(
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

export function toBusinessType(value?: string) {
  if (value === "venue" || value === "studio" || value === "brand") {
    return value;
  }
  if (value === "café") {
    return "cafe" as const;
  }
  return undefined;
}

export function getNextLaunchStatus(launch: DemoLaunch) {
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

export function getBestNextMoveForLaunch(launch: DemoLaunch) {
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

export function buildLaunchDraftGuestLine(draft: LaunchWizardDraft) {
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

export function syncLaunchShape(launch: DemoLaunch) {
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
