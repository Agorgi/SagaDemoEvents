"use client";

import { StarRatingValue } from "@/src/components/StarRatingValue";
import { type ProfileService } from "@/src/data/creator-profiles";
import { getServiceCategoryOption } from "@/src/data/service-flow";
import { getMediaObjectPosition } from "@/src/lib/media-position";
import { cn } from "@/src/lib/utils";

const serviceCardThemes = {
  violet: {
    background:
      "radial-gradient(circle at top left, rgba(123,132,255,0.28), transparent 34%), linear-gradient(180deg, rgba(19,25,44,0.98), rgba(12,16,28,1))",
    glow: "rgba(123,132,255,0.26)",
    orb: "rgba(255,255,255,0.08)"
  },
  gold: {
    background:
      "radial-gradient(circle at top right, rgba(240,196,83,0.2), transparent 32%), linear-gradient(180deg, rgba(28,20,38,0.98), rgba(13,13,22,1))",
    glow: "rgba(240,196,83,0.22)",
    orb: "rgba(160,102,255,0.12)"
  },
  emerald: {
    background:
      "radial-gradient(circle at 22% 18%, rgba(80,212,168,0.2), transparent 30%), linear-gradient(180deg, rgba(15,28,30,0.98), rgba(10,16,20,1))",
    glow: "rgba(80,212,168,0.2)",
    orb: "rgba(123,132,255,0.16)"
  },
  midnight: {
    background:
      "radial-gradient(circle at 80% 8%, rgba(255,255,255,0.08), transparent 26%), linear-gradient(180deg, rgba(16,18,28,0.98), rgba(8,10,18,1))",
    glow: "rgba(116,128,173,0.18)",
    orb: "rgba(255,255,255,0.06)"
  }
} as const;

const fallbackThemeOrder = ["violet", "gold", "emerald"] as const;

function pickTheme(seed: string) {
  const normalized = seed.trim();
  const total = Array.from(normalized).reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return serviceCardThemes[fallbackThemeOrder[total % fallbackThemeOrder.length]];
}

export function ProfileServiceCard({
  service,
  mode = "public",
  categoryLabel,
  creatorHandle,
  className
}: {
  service: ProfileService;
  mode?: "public" | "private" | "preview";
  categoryLabel?: string;
  creatorHandle?: string;
  className?: string;
}) {
  const theme =
    service.coverStyle && serviceCardThemes[service.coverStyle]
      ? serviceCardThemes[service.coverStyle]
      : pickTheme(`${categoryLabel ?? service.category ?? ""}-${service.title}-${service.pricingLabel}`);
  const showReviewState = mode === "public" && (service.reviewScore || service.reviewCount);
  const resolvedCategoryLabel =
    categoryLabel ?? getServiceCategoryOption(service.category ?? "")?.label ?? "Service";
  const previewLabel =
    mode === "preview"
      ? service.visibleOnPublicProfile
        ? "Will show on your public page"
        : "Saved privately for now"
      : mode === "private"
        ? service.visibleOnPublicProfile
          ? "Public"
          : "Private"
        : null;

  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/8 bg-[#111622] p-3 shadow-[0_20px_44px_rgba(0,0,0,0.22)]",
        className
      )}
    >
      <div
        className="relative h-[152px] overflow-hidden rounded-[24px] border border-white/8"
        style={{ background: theme.background }}
      >
        {service.coverImage ? (
          <>
            <img
              alt={service.title}
              className="absolute inset-0 h-full w-full object-cover"
              src={service.coverImage}
              style={{ objectPosition: getMediaObjectPosition(service.coverImagePosition) }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,18,0.08),rgba(8,10,18,0.38)_45%,rgba(8,10,18,0.92))]" />
          </>
        ) : null}
        <div
          className="absolute -right-8 top-[-20px] h-28 w-28 rounded-full blur-3xl"
          style={{ background: theme.glow }}
        />
        <div
          className="absolute -left-4 bottom-[-18px] h-24 w-24 rounded-full blur-2xl"
          style={{ background: theme.orb }}
        />

        <div className="relative flex h-full flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/78 backdrop-blur-sm">
              {resolvedCategoryLabel}
            </span>
            {previewLabel ? (
              <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/76 backdrop-blur-sm">
                {previewLabel}
              </span>
            ) : null}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/58">
              {creatorHandle ? `From ${creatorHandle}` : "Saga creator service"}
            </p>
            <p className="mt-2 max-w-[16ch] text-[1.35rem] font-semibold leading-tight text-white">
              {service.title}
            </p>
          </div>
        </div>
      </div>

      <div className="px-1 pb-1 pt-4">
        <p className="text-sm font-semibold text-white">{service.pricingLabel}</p>
        {service.shortDescription ? (
          <p className="mt-2 text-sm leading-6 text-app-muted">{service.shortDescription}</p>
        ) : null}

        {showReviewState ? (
          <div className="mt-4 flex items-center gap-2 text-xs text-app-muted">
            {service.reviewScore ? (
              <StarRatingValue rating={service.reviewScore} variant="inline" />
            ) : null}
            {service.reviewCount ? <span>{service.reviewCount} reviews</span> : null}
          </div>
        ) : mode === "preview" ? (
          <p className="mt-4 text-xs uppercase tracking-[0.14em] text-app-muted">
            New service preview
          </p>
        ) : null}
      </div>
    </div>
  );
}
