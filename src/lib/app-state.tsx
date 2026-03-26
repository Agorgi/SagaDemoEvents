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
  type DemoUser
} from "@/src/data/demo";
import {
  seedInboxItems,
  seedLaunches
} from "@/src/data/launches";
import {
  syncLaunchDraft,
} from "@/src/data/launch-builder";
import {
  ONBOARDING_VERSION,
  deriveOnboardingGraphs,
  getModeForBranch,
  onboardingDefaults,
  resolveBranch
} from "@/src/data/onboarding";
import {
  demoPersonaPresets,
  getPersonaPresetById,
  getProfileByUserId,
  seedInterestStateByPersona,
  socialActivityItems
} from "@/src/data/social";
import {
  seedCreatorProfiles
} from "@/src/data/creator-profiles";
import {
  businessProfiles as seedBusinessProfiles,
  listings as seedListings,
  listingInterests as seedListingInterests,
  opportunities as seedOpportunities,
  opportunityApplications as seedOpportunityApplications,
  supportIntents as seedSupportIntents
} from "@/src/data/economy";
import { useDemoState } from "@/src/lib/demo-state";
import {
  buildFallbackCreatorProfile,
  mergeUsers,
  normalizeCreatorProfiles,
  resolveCurrentUserId,
  syncLaunches,
  type SocialStateByPersona,
  syncPersonaStates
} from "@/src/lib/app-state-helpers";
import {
  createEconomyActions,
  createLaunchActions,
  createProfileActions,
  createSocialActions
} from "@/src/lib/app-state-actions";
import {
  type AppStateActionRuntime,
  type AppStateValue,
  type PersistedAppState
} from "@/src/lib/app-state-types";

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
  creatorProfiles: seedCreatorProfiles,
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
          creatorProfiles: parsed.creatorProfiles ?? initialState.creatorProfiles,
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
  const creatorProfiles = useMemo(
    () => normalizeCreatorProfiles(state.creatorProfiles, users),
    [state.creatorProfiles, users]
  );
  const currentPersona =
    getPersonaPresetById(state.activePersonaId) ?? demoPersonaPresets[0];
  const currentUserId = resolveCurrentUserId(state.activePersonaId, state.mode);
  const currentUser =
    users.find((user) => user.id === currentUserId) ?? mergeUsers({})[0];
  const currentInterestState =
    state.socialStateByPersona[currentPersona.id] ??
    seedInterestStateByPersona[currentPersona.id];
  const currentProfile = getProfileByUserId(currentUserId);
  const currentCreatorProfile =
    creatorProfiles.find((profile) => profile.id === currentUserId) ??
    buildFallbackCreatorProfile(currentUserId, users);
  const currentBusinessProfile = state.businessProfiles.find(
    (profile) => profile.ownerUserId === currentUserId
  );
  const homeCity = state.onboarding.city || currentUser.city;
  const preferredFandoms =
    state.onboarding.fandomTags.length > 0
      ? state.onboarding.fandomTags
      : state.onboarding.businessSceneTags.length > 0
        ? state.onboarding.businessSceneTags
      : currentCreatorProfile?.tags.length
        ? currentCreatorProfile.tags
        : currentProfile?.fandoms ?? currentUser.fandomTags;
  const socialActivity = useMemo(
    () =>
      [...state.activityLog, ...socialActivityItems]
        .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
        .slice(0, 24),
    [state.activityLog]
  );

  const actionRuntime: AppStateActionRuntime = {
    state,
    setState,
    demo: {
      events: demo.events,
      createEvent: demo.createEvent
    },
    currentUserId,
    currentUser,
    currentProfile,
    users,
    creatorProfiles
  };

  const profileActions = createProfileActions(actionRuntime);
  const economyActions = createEconomyActions(actionRuntime);
  const launchActions = createLaunchActions(actionRuntime);
  const socialActions = createSocialActions(actionRuntime);

  const value: AppStateValue = {
    ...state,
    hydrated,
    currentUserId,
    currentUser,
    currentInterestState,
    creatorProfiles,
    currentCreatorProfile,
    homeCity,
    preferredFandoms,
    users,
    launchDrafts: state.launchDrafts,
    opportunities: seedOpportunities,
    listings: state.listings,
    businessProfiles: state.businessProfiles,
    supportIntents: state.supportIntents,
    currentBusinessProfile,
    socialActivity,
    savedEventIds: currentInterestState.savedEventIds,
    interestedEventIds: currentInterestState.interestedEventIds,
    goingEventIds: currentInterestState.goingEventIds,
    followingIds: currentInterestState.followingIds,
    ...profileActions,
    ...economyActions,
    ...launchActions,
    ...socialActions,
    resolveUser: (userId) => users.find((user) => user.id === userId),
    resolveCreatorProfile: (userId) => {
      if (!userId) {
        return undefined;
      }

      return (
        creatorProfiles.find((profile) => profile.id === userId) ??
        buildFallbackCreatorProfile(userId, users)
      );
    }
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
