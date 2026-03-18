import { events, users } from "@/src/data/demo";

export type PostingIntent = "event" | "post" | "crowd commission";
export type PostingSource = "llm" | "heuristic";

export type PostingAssistResult = {
  intent: PostingIntent;
  confidence: number;
  rationale: string;
  source: PostingSource;
  prefill: {
    event: {
      name: string;
      dateTime: string;
      location: string;
      description: string;
      communities: string;
      eventFormat: string;
      sourceCrew: boolean;
    };
    post: {
      caption: string;
      communities: string;
      audience: string;
    };
    crowdCommission: {
      title: string;
      fundingGoal: string;
      deadline: string;
      story: string;
      perks: string;
    };
  };
};

const knownCities = Array.from(new Set(events.map((event) => event.city)));
const knownCityAliases = Array.from(
  new Set(knownCities.map((city) => city.split(",")[0]?.trim()).filter(Boolean))
);
const knownCommunities = Array.from(
  new Set([
    ...events.flatMap((event) => event.fandomTags),
    ...users.flatMap((user) => user.fandomTags)
  ])
).sort((left, right) => right.length - left.length);

const eventFormats = [
  "Ticketed social",
  "Free meetup",
  "Screening",
  "Creator collab"
] as const;

function isEventFormat(value: string): value is (typeof eventFormats)[number] {
  return (eventFormats as readonly string[]).includes(value);
}

function clampConfidence(value: unknown, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(0.99, Math.max(0.2, value));
}

function cleanText(value: unknown, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim();
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function extractQuotedText(draft: string) {
  const quoted = draft.match(/["'“](.+?)["'”]/);
  return quoted?.[1]?.trim() ?? "";
}

function extractDateTime(draft: string) {
  const datePattern =
    /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|monday|tuesday|wednesday|thursday|friday|saturday|sunday|tonight|tomorrow|this weekend|next weekend|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))(?:\s+(?:at\s+)?\d{1,2}(?::\d{2})?\s?(?:am|pm))?/i;
  return draft.match(datePattern)?.[0]?.trim() ?? "";
}

function extractLocation(draft: string) {
  const lowered = draft.toLowerCase();
  const aliasMatch = knownCityAliases.find((city) => lowered.includes(city.toLowerCase()));
  if (aliasMatch) {
    return aliasMatch;
  }

  const cityMatch = knownCities.find((city) => lowered.includes(city.toLowerCase()));
  if (cityMatch) {
    return cityMatch;
  }

  const locationMatch = draft.match(
    /\b(?:at|in)\s+([^,.!\n]+?)(?=\s+(?:on|at|next|this|tonight|tomorrow|and)\b|[,.!\n]|$)/i
  );
  return locationMatch?.[1]?.trim() ?? "";
}

function extractFundingGoal(draft: string) {
  const amount = draft.match(/\$\s?\d[\d,]*(?:\.\d+)?\s?[kK]?/);
  return amount?.[0]?.replace(/\s+/g, "") ?? "";
}

function extractCommunities(draft: string) {
  const lowered = draft.toLowerCase();
  const matches = knownCommunities.filter((tag) => lowered.includes(tag.toLowerCase()));
  return matches.slice(0, 3).join(", ");
}

function detectEventFormat(draft: string) {
  const lowered = draft.toLowerCase();

  if (lowered.includes("free")) {
    return eventFormats[1];
  }

  if (
    lowered.includes("screening") ||
    lowered.includes("watch party") ||
    lowered.includes("premiere")
  ) {
    return eventFormats[2];
  }

  if (
    lowered.includes("collab") ||
    lowered.includes("creator") ||
    lowered.includes("guest artist")
  ) {
    return eventFormats[3];
  }

  return eventFormats[0];
}

function shouldSourceCrew(draft: string) {
  const lowered = draft.toLowerCase();
  return [
    "crew",
    "photographer",
    "dj",
    "door",
    "check-in",
    "security",
    "decor",
    "staff",
    "hire",
    "roles",
    "need help"
  ].some((keyword) => lowered.includes(keyword));
}

function buildEventName(draft: string, communities: string) {
  const quoted = extractQuotedText(draft);
  if (quoted) {
    return quoted;
  }

  const cleaned = draft
    .replace(/^(i am|i'm|thinking about|planning|hosting|want to|let's|lets)\s+/i, "")
    .split(/(?:\bin\b|\bat\b|\bon\b|\bfor\b|[.!?])/i)[0]
    ?.trim();

  if (cleaned && cleaned.length > 5) {
    return titleCase(cleaned).slice(0, 72);
  }

  if (communities) {
    const lead = communities.split(",")[0]?.trim();
    if (lead) {
      return `${lead} Meetup`;
    }
  }

  return "New fandom event";
}

function buildCampaignTitle(draft: string, communities: string) {
  const quoted = extractQuotedText(draft);
  if (quoted) {
    return quoted;
  }

  if (communities) {
    const lead = communities.split(",")[0]?.trim();
    if (lead) {
      return `Fund ${lead} commission`;
    }
  }

  return "Launch a crowd commission";
}

function inferIntent(draft: string): {
  intent: PostingIntent;
  rationale: string;
  confidence: number;
} {
  const lowered = draft.toLowerCase();

  const eventScore =
    [
      "event",
      "meetup",
      "party",
      "salon",
      "screening",
      "show",
      "night",
      "ticket",
      "venue",
      "doors",
      "host"
    ].filter((keyword) => lowered.includes(keyword)).length +
    (extractDateTime(draft) ? 2 : 0) +
    (extractLocation(draft) ? 1 : 0);

  const commissionScore =
    [
      "commission",
      "crowdfund",
      "crowd fund",
      "kickstarter",
      "campaign",
      "goal",
      "fund",
      "raise",
      "back this",
      "budget",
      "backers"
    ].filter((keyword) => lowered.includes(keyword)).length +
    (extractFundingGoal(draft) ? 2 : 0);

  if (commissionScore > eventScore && commissionScore >= 2) {
    return {
      intent: "crowd commission",
      rationale: "The draft reads like a funding ask with a clear budget or campaign signal.",
      confidence: 0.84
    };
  }

  if (eventScore >= 2) {
    return {
      intent: "event",
      rationale: "The draft includes event-shaped details like timing, venue, or host language.",
      confidence: 0.86
    };
  }

  return {
    intent: "post",
    rationale: "The draft reads more like a social update or work-in-progress share than a structured event.",
    confidence: 0.72
  };
}

export function buildPostingAssistFallback(draft: string): PostingAssistResult {
  const trimmedDraft = draft.trim();
  const communities = extractCommunities(trimmedDraft);
  const inferred = inferIntent(trimmedDraft);

  return {
    intent: inferred.intent,
    confidence: inferred.confidence,
    rationale: inferred.rationale,
    source: "heuristic",
    prefill: {
      event: {
        name: buildEventName(trimmedDraft, communities),
        dateTime: extractDateTime(trimmedDraft),
        location: extractLocation(trimmedDraft),
        description: trimmedDraft,
        communities,
        eventFormat: detectEventFormat(trimmedDraft),
        sourceCrew: shouldSourceCrew(trimmedDraft)
      },
      post: {
        caption: trimmedDraft,
        communities,
        audience: communities ? "Followers + tagged communities" : "Followers"
      },
      crowdCommission: {
        title: buildCampaignTitle(trimmedDraft, communities),
        fundingGoal: extractFundingGoal(trimmedDraft),
        deadline: extractDateTime(trimmedDraft),
        story: trimmedDraft,
        perks:
          "Early access, behind-the-scenes updates, credit on the final drop, and a premium digital pack."
      }
    }
  };
}

export function mergePostingAssistResult(
  candidate: unknown,
  fallback: PostingAssistResult,
  source: PostingSource
): PostingAssistResult {
  const parsed = typeof candidate === "object" && candidate ? candidate : {};
  const candidateResult = parsed as Partial<PostingAssistResult>;
  const candidatePrefill =
    typeof candidateResult.prefill === "object" && candidateResult.prefill
      ? (candidateResult.prefill as Record<string, unknown>)
      : {};

  const intent =
    candidateResult.intent === "event" ||
    candidateResult.intent === "post" ||
    candidateResult.intent === "crowd commission"
      ? candidateResult.intent
      : fallback.intent;

  const eventPrefill =
    typeof candidatePrefill["event"] === "object" && candidatePrefill["event"]
      ? (candidatePrefill["event"] as Record<string, unknown>)
      : {};
  const postPrefill =
    typeof candidatePrefill["post"] === "object" && candidatePrefill["post"]
      ? (candidatePrefill["post"] as Record<string, unknown>)
      : {};
  const crowdPrefill =
    typeof candidatePrefill["crowdCommission"] === "object" &&
    candidatePrefill["crowdCommission"]
      ? (candidatePrefill["crowdCommission"] as Record<string, unknown>)
      : {};
  const nextEventFormat = cleanText(
    (eventPrefill as { eventFormat?: string }).eventFormat,
    fallback.prefill.event.eventFormat
  );

  return {
    intent,
    confidence: clampConfidence(candidateResult.confidence, fallback.confidence),
    rationale: cleanText(candidateResult.rationale, fallback.rationale),
    source,
    prefill: {
      event: {
        name: cleanText((eventPrefill as { name?: string }).name, fallback.prefill.event.name),
        dateTime: cleanText(
          (eventPrefill as { dateTime?: string }).dateTime,
          fallback.prefill.event.dateTime
        ),
        location: cleanText(
          (eventPrefill as { location?: string }).location,
          fallback.prefill.event.location
        ),
        description: cleanText(
          (eventPrefill as { description?: string }).description,
          fallback.prefill.event.description
        ),
        communities: cleanText(
          (eventPrefill as { communities?: string }).communities,
          fallback.prefill.event.communities
        ),
        eventFormat: isEventFormat(nextEventFormat)
          ? nextEventFormat
          : fallback.prefill.event.eventFormat,
        sourceCrew:
          typeof (eventPrefill as { sourceCrew?: boolean }).sourceCrew === "boolean"
            ? Boolean((eventPrefill as { sourceCrew?: boolean }).sourceCrew)
            : fallback.prefill.event.sourceCrew
      },
      post: {
        caption: cleanText(
          (postPrefill as { caption?: string }).caption,
          fallback.prefill.post.caption
        ),
        communities: cleanText(
          (postPrefill as { communities?: string }).communities,
          fallback.prefill.post.communities
        ),
        audience: cleanText(
          (postPrefill as { audience?: string }).audience,
          fallback.prefill.post.audience
        )
      },
      crowdCommission: {
        title: cleanText(
          (crowdPrefill as { title?: string }).title,
          fallback.prefill.crowdCommission.title
        ),
        fundingGoal: cleanText(
          (crowdPrefill as { fundingGoal?: string }).fundingGoal,
          fallback.prefill.crowdCommission.fundingGoal
        ),
        deadline: cleanText(
          (crowdPrefill as { deadline?: string }).deadline,
          fallback.prefill.crowdCommission.deadline
        ),
        story: cleanText(
          (crowdPrefill as { story?: string }).story,
          fallback.prefill.crowdCommission.story
        ),
        perks: cleanText(
          (crowdPrefill as { perks?: string }).perks,
          fallback.prefill.crowdCommission.perks
        )
      }
    }
  };
}
