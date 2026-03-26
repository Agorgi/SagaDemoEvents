import { type Dispatch, type SetStateAction } from "react";

import {
  type DemoEvent,
  type DemoUser
} from "@/src/data/demo";
import {
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
import {
  type CreatorProfile,
  type ProfileService
} from "@/src/data/creator-profiles";
import {
  type CreateLaunchPayload,
  type DemoInboxItem,
  type DemoLaunch,
  type UserMode
} from "@/src/data/launches";
import {
  type LaunchModeType,
  type LaunchWizardDraft
} from "@/src/data/launch-builder";
import { type OnboardingState } from "@/src/data/onboarding";
import {
  type InterestState,
  type SocialActivityItem,
  type UserProfile
} from "@/src/data/social";
import {
  type MediaVerticalPosition
} from "@/src/lib/media-position";
import {
  type ProfileDraft,
  type SocialStateByPersona
} from "@/src/lib/app-state-helpers";

export type CompleteOnboardingPayload = Partial<OnboardingState>;

export type CreateListingPayload = {
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

export type ImportedDataSettings = {
  instagramConnected: boolean;
  tiktokConnected: boolean;
  portfolioImportEnabled: boolean;
  visibility: "public" | "followers";
};

export type PersistedAppState = {
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
  creatorProfiles: CreatorProfile[];
  businessProfiles: BusinessProfile[];
  supportIntents: SupportIntent[];
  importedDataSettings: ImportedDataSettings;
};

export type AppStateActions = {
  getApplicationsForOpportunity: (opportunityId: string) => OpportunityApplication[];
  getApplicationForCurrentUser: (
    opportunityId: string
  ) => OpportunityApplication | undefined;
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
    payload: Partial<
      Pick<BusinessProfile, "hostingPreferences" | "supportInterests" | "fandomInterests">
    >
  ) => void;
  updateImportedDataSettings: (payload: Partial<ImportedDataSettings>) => void;
  saveCreatorServices: (userId: string, services: ProfileService[]) => void;
  setMode: (mode: UserMode) => void;
  updateOnboarding: (payload: Partial<OnboardingState>) => void;
  completeOnboarding: (payload: CompleteOnboardingPayload) => void;
  resetOnboarding: () => void;
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
  resolveCreatorProfile: (userId?: string) => CreatorProfile | undefined;
};

export type AppStateValue = PersistedAppState & {
  hydrated: boolean;
  currentUserId: string;
  currentUser: DemoUser & { draft?: ProfileDraft };
  currentInterestState: InterestState;
  creatorProfiles: CreatorProfile[];
  currentCreatorProfile?: CreatorProfile;
  homeCity: string;
  preferredFandoms: string[];
  users: Array<DemoUser & { draft?: ProfileDraft }>;
  launchDrafts: LaunchWizardDraft[];
  opportunities: Opportunity[];
  listings: Listing[];
  businessProfiles: BusinessProfile[];
  supportIntents: SupportIntent[];
  currentBusinessProfile?: BusinessProfile;
  socialActivity: SocialActivityItem[];
  savedEventIds: string[];
  interestedEventIds: string[];
  goingEventIds: string[];
  followingIds: string[];
} & AppStateActions;

export type AppStateCreateEventPayload = {
  name: string;
  dateTime: string;
  location: string;
  description: string;
  communities: string;
  eventFormat: string;
  sourceCrew: boolean;
  posterUrl?: string;
  posterPosition?: MediaVerticalPosition;
};

export type AppStateDemoApi = {
  events: DemoEvent[];
  createEvent: (
    payload: AppStateCreateEventPayload,
    hostIdOverride?: string
  ) => string;
};

export type AppStateActionRuntime = {
  state: PersistedAppState;
  setState: Dispatch<SetStateAction<PersistedAppState>>;
  demo: AppStateDemoApi;
  currentUserId: string;
  currentUser: DemoUser & { draft?: ProfileDraft };
  currentProfile?: UserProfile;
  users: Array<DemoUser & { draft?: ProfileDraft }>;
  creatorProfiles: CreatorProfile[];
};
