import {
  type ProfileService,
  type ServiceCoverStyle
} from "@/src/data/creator-profiles";

export type ServiceDraft = {
  category: string;
  title: string;
  pricingLabel: string;
  shortDescription: string;
  coverStyle: ServiceCoverStyle;
  coverImage?: string;
  coverImageSourceTitle?: string;
  visibleOnPublicProfile: boolean;
};

export const SERVICE_FLOW_STORAGE_KEY = "saga-service-flow-v1";

export const serviceCategoryOptions = [
  {
    value: "portraits",
    label: "Portraits",
    description: "Photo sets, booths, and polished creator coverage."
  },
  {
    value: "promo",
    label: "Promo kit",
    description: "Launch visuals, social crops, and announcement support."
  },
  {
    value: "hosting",
    label: "Host support",
    description: "Guest flow, room energy, and on-night support."
  },
  {
    value: "coverage",
    label: "Event coverage",
    description: "Photo or video coverage for the full night."
  },
  {
    value: "styling",
    label: "Styling",
    description: "Looks, glam, and finishing touches before the room opens."
  },
  {
    value: "other",
    label: "Other",
    description: "Something more custom."
  }
] as const;

export const serviceCoverStyleOptions: Array<{
  value: ServiceCoverStyle;
  label: string;
  description: string;
}> = [
  {
    value: "violet",
    label: "Violet glow",
    description: "Soft, polished, and a little cinematic."
  },
  {
    value: "gold",
    label: "Gold halo",
    description: "Warmer and more luxe."
  },
  {
    value: "emerald",
    label: "Emerald dusk",
    description: "Clean and a bit moodier."
  },
  {
    value: "midnight",
    label: "Midnight",
    description: "Minimal, darker, and editorial."
  }
] as const;

const titleSuggestions: Record<string, string> = {
  portraits: "Portrait sessions",
  promo: "Launch promo kit",
  hosting: "Host support",
  coverage: "Event photo coverage",
  styling: "Styling support",
  other: "Custom service"
};

const pricingPlaceholders: Record<string, string> = {
  portraits: "$180 starting",
  promo: "$240 package",
  hosting: "$120 flat",
  coverage: "$260 starting",
  styling: "$150 starting",
  other: "By project"
};

const descriptionPlaceholders: Record<string, string> = {
  portraits: "Quick description for what the shoot includes and what makes your style different.",
  promo: "A short line about what people get, how fast, and what the package covers.",
  hosting: "A short line about the kind of nights you help run best.",
  coverage: "A short line about what you capture and what the turnaround feels like.",
  styling: "A short line about what you help with and how people should think about booking you.",
  other: "A short line that makes the service easy to understand at a glance."
};

const defaultCoverStyles: Record<string, ServiceCoverStyle> = {
  portraits: "gold",
  promo: "violet",
  hosting: "midnight",
  coverage: "emerald",
  styling: "gold",
  other: "violet"
};

export function createEmptyServiceDraft(): ServiceDraft {
  return {
    category: "",
    title: "",
    pricingLabel: "",
    shortDescription: "",
    coverStyle: "violet",
    visibleOnPublicProfile: true
  };
}

export function getServiceCategoryOption(category: string) {
  return serviceCategoryOptions.find((option) => option.value === category);
}

export function getDefaultServiceCoverStyle(category: string): ServiceCoverStyle {
  return defaultCoverStyles[category] ?? "violet";
}

export function getServiceTitleSuggestion(category: string) {
  return titleSuggestions[category] ?? "Custom service";
}

export function getServicePricingPlaceholder(category: string) {
  return pricingPlaceholders[category] ?? "By project";
}

export function getServiceDescriptionPlaceholder(category: string) {
  return descriptionPlaceholders[category] ?? descriptionPlaceholders.other;
}

export function buildServiceFromDraft(draft: ServiceDraft): ProfileService {
  return {
    id: `service-${Math.random().toString(36).slice(2, 8)}`,
    category: draft.category.trim() || "other",
    title: draft.title.trim() || getServiceTitleSuggestion(draft.category),
    pricingLabel: draft.pricingLabel.trim() || getServicePricingPlaceholder(draft.category),
    shortDescription: draft.shortDescription.trim(),
    coverStyle: draft.coverStyle,
    coverImage: draft.coverImage,
    visibleOnPublicProfile: draft.visibleOnPublicProfile
  };
}
