export type PlatformKey = "saga" | "instagram" | "tiktok";

export type EligibilityStatus =
  | "eligible"
  | "pending_review"
  | "ineligible"
  | "disqualified"
  | "unknown";

export type LeaderboardState = "ranked" | "awaiting_verification" | "hidden";

export interface PlatformBreakdown {
  likes: number | null;
  uniqueComments: number | null;
  shares: number | null;
  score: number | null;
  lastUpdatedAt: string | null;
}

export interface GiveawaySubmission {
  id: string;
  title: string | null;
  url: string | null;
  platform: PlatformKey;
  contentType: string | null;
  thumbnailUrl: string | null;
  submittedAt: string | null;
  engagementScore: number | null;
}

export interface GiveawayEntry {
  id: string;
  entryId: string;
  rank: number | null;
  raffleZone: boolean;
  displayName: string;
  profileImageUrl: string | null;
  entryTitle: string | null;
  contentType: string | null;
  contentTypes: string[];
  totalEngagementScore: number | null;
  highIntentEngagement: number;
  eligibilityStatus: EligibilityStatus;
  leaderboardState: LeaderboardState;
  cutlineDelta: number | null;
  thumbnailUrl: string | null;
  submittedAt: string | null;
  lastVerifiedAt: string | null;
  platformBreakdown: Record<PlatformKey, PlatformBreakdown>;
  submissions: GiveawaySubmission[];
}

export interface CampaignConfig {
  slug: string;
  title: string;
  seasonLabel: string;
  subtitle: string;
  eventDateLabel: string;
  startAt: string | null;
  endAt: string | null;
  entryDeadline: string | null;
  winnerAnnouncementDate: string | null;
  timeZone: string;
  prizeCopy: string;
  poolSize: number;
  winnerCount: number;
  submissionFormUrl: string | null;
  eventDetailsUrl: string;
  buyTicketsUrl: string;
  supportInstagramUrl: string | null;
  discordUrl: string | null;
  officialRulesUrl: string | null;
  privacyUrl: string | null;
  refreshCadenceSeconds: number;
  revalidateSeconds: number;
  sheetRange: string;
}

export interface ScoringConfig {
  formulaLabel: string;
  explanation: string[];
  requiredSocialHashtag: string;
  weights: Record<
    PlatformKey,
    {
      likes: number;
      comments: number;
      shares: number;
    }
  >;
}

export type GiveawayDataSource = "database" | "mock" | "unavailable";

export interface GiveawaySnapshot {
  campaign: CampaignConfig;
  scoring: ScoringConfig;
  dataSource: GiveawayDataSource;
  status: "live" | "preview" | "fallback";
  generatedAt: string;
  lastUpdatedAt: string;
  liveRefreshSeconds: number;
  totalEntries: number;
  totalEligible: number;
  rankedEntryCount: number;
  awaitingVerificationCount: number;
  cutlineScore: number | null;
  cutlineRank: number | null;
  message: string | null;
  entries: GiveawayEntry[];
  rankedEntries: GiveawayEntry[];
  awaitingVerificationEntries: GiveawayEntry[];
  topEntries: GiveawayEntry[];
  closestToCutline: GiveawayEntry | null;
}

export const PLATFORM_KEYS = ["saga", "instagram", "tiktok"] as const satisfies readonly PlatformKey[];
