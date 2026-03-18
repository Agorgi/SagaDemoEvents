import type { CommentCountBasis, EligibilityStatus, FetchStatus, Platform } from "@prisma/client";

export const PLATFORM_KEYS = ["saga", "instagram", "tiktok"] as const satisfies readonly Platform[];

export const SCORE_WEIGHTS: Record<
  Platform,
  {
    likes: number;
    uniqueComments: number;
    shares: number;
  }
> = {
  saga: {
    likes: 20,
    uniqueComments: 20,
    shares: 0
  },
  instagram: {
    likes: 1,
    uniqueComments: 1,
    shares: 3
  },
  tiktok: {
    likes: 1,
    uniqueComments: 1,
    shares: 3
  }
};

export const PUBLIC_ELIGIBILITY_STATUSES = ["eligible"] as const;
export const RANKABLE_ELIGIBILITY_STATUSES = ["eligible"] as const;
export const FAILURE_FETCH_STATUSES: FetchStatus[] = [
  "auth_required",
  "review_required",
  "unsupported",
  "private_post",
  "rate_limited",
  "not_found",
  "parse_error",
  "transient_error"
];

export function normalizeEligibilityStatus(value: string | null | undefined): EligibilityStatus {
  const normalized = value?.trim().toLowerCase().replace(/\s+/g, "_");

  switch (normalized) {
    case "eligible":
    case "approved":
      return "eligible";
    case "pending":
    case "pending_review":
    case "under_review":
      return "pending_review";
    case "ineligible":
      return "ineligible";
    case "disqualified":
    case "removed":
      return "disqualified";
    default:
      return "unknown";
  }
}

export function isSuccessStatus(status: FetchStatus) {
  return status === "success";
}

export function requiresReviewStatus(status: FetchStatus) {
  return status === "review_required";
}

export function basisSupportsUniqueComments(
  basis: CommentCountBasis,
  uniqueCommenterCount: number | null
) {
  return basis === "unique" && uniqueCommenterCount !== null;
}

export const STALE_VERIFIED_HOURS = 36;

export function platformLabel(platform: Platform) {
  switch (platform) {
    case "saga":
      return "Saga";
    case "instagram":
      return "Instagram";
    case "tiktok":
      return "TikTok";
  }
}
