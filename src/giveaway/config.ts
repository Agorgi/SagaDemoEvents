import type { CampaignConfig, ScoringConfig } from "@/src/giveaway/types";

function positiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function nullableString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function nullableStringWithDefault(
  value: string | undefined,
  fallback: string | null
) {
  if (value === undefined) {
    return fallback;
  }

  return nullableString(value);
}

const DEFAULT_SUBMISSION_FORM_URL =
  "https://docs.google.com/forms/d/1_J8E0JDxah0QvfkB5DZNNUCw00wuMlTKFx6OqWYuEH8/viewform";

export const scoringConfig: ScoringConfig = {
  weights: {
    saga: {
      likes: 20,
      comments: 20,
      shares: 0
    },
    instagram: {
      likes: 1,
      comments: 1,
      shares: 3
    },
    tiktok: {
      likes: 1,
      comments: 1,
      shares: 3
    }
  },
  formulaLabel:
    "Score = (Saga likes × 20) + (Saga unique comments × 20) + (Instagram likes) + (Instagram unique comments) + (Instagram shares × 3) + (TikTok likes) + (TikTok unique comments) + (TikTok shares × 3).",
  explanation: [
    "Direct post URLs are required for accurate scoring. Handles alone are never used to guess metrics.",
    "If a platform cannot provide unique commenter identity through the configured official integration, that entry stays in admin review until manual scoring is supplied.",
    "If a fetch fails after a previous success, the public leaderboard keeps the last successful snapshot until a fresher score is available."
  ],
  requiredSocialHashtag: "#SagaCoSLA"
};

export const activeCampaign: CampaignConfig = {
  slug: process.env.CAMPAIGN_SLUG ?? "court-of-stars-la-2026",
  title: process.env.CAMPAIGN_TITLE ?? "Court of Stars Giveaway: Los Angeles",
  seasonLabel: process.env.CAMPAIGN_SEASON_LABEL ?? "Los Angeles",
  subtitle:
    process.env.CAMPAIGN_SUBTITLE ??
    "Submit a Court of Stars-inspired entry, earn points through engagement, and track your standing on the official live leaderboard.",
  eventDateLabel:
    process.env.CAMPAIGN_EVENT_DATE_LABEL ?? "Los Angeles • July 18–19, 2026",
  startAt: nullableString(process.env.CAMPAIGN_START_AT),
  endAt: nullableString(process.env.CAMPAIGN_END_AT),
  entryDeadline: nullableString(process.env.CAMPAIGN_ENTRY_DEADLINE),
  winnerAnnouncementDate: nullableString(
    process.env.CAMPAIGN_WINNER_ANNOUNCEMENT_DATE
  ),
  timeZone: process.env.CAMPAIGN_TIME_ZONE ?? "America/Los_Angeles",
  prizeCopy:
    process.env.CAMPAIGN_PRIZE_COPY ??
    "6 tickets total — 1 Tier 2, 2 Tier 1, 3 General Admission",
  poolSize: positiveInt(process.env.TOP_POOL_SIZE, 25),
  winnerCount: positiveInt(process.env.WINNER_COUNT, 6),
  submissionFormUrl: nullableStringWithDefault(
    process.env.NEXT_PUBLIC_SUBMISSION_FORM_URL,
    DEFAULT_SUBMISSION_FORM_URL
  ),
  eventDetailsUrl:
    process.env.NEXT_PUBLIC_EVENT_DETAILS_URL ?? "https://courtofstars.try-saga.com/",
  buyTicketsUrl:
    process.env.NEXT_PUBLIC_BUY_TICKETS_URL ?? "https://tixfox.co/e/E0S4tCkzag",
  supportInstagramUrl: nullableStringWithDefault(
    process.env.NEXT_PUBLIC_SUPPORT_INSTAGRAM_URL,
    "https://instagram.com/trysaga_"
  ),
  discordUrl: nullableString(process.env.NEXT_PUBLIC_DISCORD_URL),
  officialRulesUrl: process.env.NEXT_PUBLIC_RULES_URL?.trim() || null,
  privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_URL?.trim() || null,
  refreshCadenceSeconds: 60,
  revalidateSeconds: 180,
  sheetRange: process.env.GOOGLE_SHEET_RANGE ?? "Leaderboard!A:AZ"
};

export function buildTrackedUrl(
  url: string | null,
  content: string,
  source = "court_of_stars"
) {
  if (!url) {
    return null;
  }

  if (!/^https?:\/\//i.test(url)) {
    return url;
  }

  const tracked = new URL(url);
  tracked.searchParams.set("utm_source", source);
  tracked.searchParams.set("utm_medium", "giveaway_site");
  tracked.searchParams.set("utm_campaign", activeCampaign.slug);
  tracked.searchParams.set("utm_content", content);

  return tracked.toString();
}

export function getCampaignPhase(now = new Date(), campaign = activeCampaign) {
  if (!campaign.startAt || !campaign.endAt) {
    return "live" as const;
  }

  const start = new Date(campaign.startAt);
  const end = new Date(campaign.endAt);

  if (now < start) {
    return "upcoming" as const;
  }

  if (now > end) {
    return "closed" as const;
  }

  return "live" as const;
}
