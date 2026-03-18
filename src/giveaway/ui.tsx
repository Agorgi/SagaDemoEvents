"use client";

import {
  Fragment,
  type CSSProperties,
  type DetailsHTMLAttributes,
  type ReactNode,
  useEffect,
  useState
} from "react";

import clsx from "clsx";
import Image from "next/image";

import { buildTrackedUrl, getCampaignPhase } from "@/src/giveaway/config";
import type {
  GiveawayEntry,
  GiveawaySnapshot,
  GiveawaySubmission,
  PlatformKey
} from "@/src/giveaway/types";

type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: Array<Record<string, unknown>>;
};

type StarDecoration = {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  size: number;
  opacity?: number;
  delay?: string;
};

type CategoryKey = "cosplay" | "art" | "lore" | "video";

const CATEGORY_FILTERS: Array<{ value: "all" | CategoryKey | "top25"; label: string }> = [
  { value: "all", label: "All" },
  { value: "cosplay", label: "Cosplay" },
  { value: "art", label: "Art" },
  { value: "lore", label: "Lore" },
  { value: "video", label: "Video" },
  { value: "top25", label: "Top 25" }
];

const sectionBackgroundStyle: CSSProperties = {
  backgroundImage: "url('/giveaway/cos-background.png')",
  backgroundSize: "cover",
  backgroundPosition: "center"
};

const heroStars: StarDecoration[] = [
  { left: "8%", top: "18%", size: 14, opacity: 0.82 },
  { right: "10%", top: "15%", size: 16, opacity: 0.86, delay: "1.2s" },
  { left: "18%", bottom: "14%", size: 18, opacity: 0.78, delay: "2s" },
  { right: "12%", bottom: "16%", size: 18, opacity: 0.8, delay: "2.6s" },
  { left: "50%", top: "10%", size: 12, opacity: 0.58, delay: "3s" }
];

const defaultStars: StarDecoration[] = [
  { left: "9%", top: "14%", size: 14, opacity: 0.8 },
  { right: "12%", top: "12%", size: 16, opacity: 0.82, delay: "1.5s" },
  { left: "16%", bottom: "16%", size: 12, opacity: 0.7, delay: "2.2s" },
  { right: "10%", bottom: "14%", size: 14, opacity: 0.78, delay: "2.8s" }
];

const footerStars: StarDecoration[] = [
  { left: "12%", top: "30%", size: 12, opacity: 0.76 },
  { right: "14%", bottom: "26%", size: 14, opacity: 0.82, delay: "1.8s" }
];

function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.gtag?.("event", name, params);
  analyticsWindow.dataLayer?.push({
    event: name,
    ...params
  });
}

function formatNumber(value: number | null) {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function formatTimestamp(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short"
  }).format(new Date(value));
}

function formatShortDate(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone
  }).format(new Date(value));
}

function normalizeText(value: string) {
  return value.toLowerCase();
}

function deriveCategories(entry: GiveawayEntry) {
  const haystack = normalizeText(
    [entry.contentType ?? "", entry.entryTitle ?? "", entry.displayName]
      .filter(Boolean)
      .join(" ")
  );
  const categories = new Set<CategoryKey>();

  if (/(cosplay|outfit|look|makeup|prop|costume|fashion)/.test(haystack)) {
    categories.add("cosplay");
  }

  if (/(art|illustration|visual|moodboard|print|poster)/.test(haystack)) {
    categories.add("art");
  }

  if (/(lore|fiction|story|character|backstory|world)/.test(haystack)) {
    categories.add("lore");
  }

  if (/(video|reel|edit|clip|trailer|animation)/.test(haystack)) {
    categories.add("video");
  }

  return Array.from(categories);
}

function matchesCategory(entry: GiveawayEntry, category: "all" | CategoryKey | "top25") {
  if (category === "all") {
    return true;
  }

  if (category === "top25") {
    return entry.raffleZone;
  }

  return deriveCategories(entry).includes(category);
}

function matchesSearch(entry: GiveawayEntry, search: string) {
  const normalizedSearch = normalizeText(search.trim());

  if (!normalizedSearch) {
    return true;
  }

  const haystack = normalizeText(
    [
      entry.displayName,
      entry.entryTitle ?? "",
      entry.contentType ?? "",
      ...entry.submissions.map((submission) => submission.platform)
    ].join(" ")
  );

  return haystack.includes(normalizedSearch);
}

function labelForSubmissionLink(submission: GiveawaySubmission) {
  switch (submission.platform) {
    case "saga":
      return "View Saga post";
    case "instagram":
      return "View Instagram post";
    case "tiktok":
      return "View TikTok post";
  }
}

function pointsStatusLabel(entry: GiveawayEntry) {
  if (entry.leaderboardState === "awaiting_verification") {
    return "Awaiting verification";
  }

  if (entry.raffleZone) {
    return "Top 25 raffle pool";
  }

  if (entry.cutlineDelta === null) {
    return "Cutline forming";
  }

  return `${formatNumber(Math.abs(entry.cutlineDelta))} points to Top 25`;
}

function entryAnchorId(entry: GiveawayEntry) {
  return `entry-${entry.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function primarySubmission(entry: GiveawayEntry) {
  return entry.submissions[0] ?? null;
}

function scrollToSection(id: string) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  element.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function DecorativeStars({ stars }: { stars: StarDecoration[] }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {stars.map((star, index) => (
        <div
          key={`${star.left ?? star.right ?? "star"}-${index}`}
          className="absolute"
          style={{
            left: star.left,
            right: star.right,
            top: star.top,
            bottom: star.bottom,
            opacity: star.opacity ?? 0.85
          }}
        >
          <Image
            src="/giveaway/cos-star.png"
            alt=""
            width={star.size}
            height={star.size}
            className="motion-safe:animate-drift"
            style={{ animationDelay: star.delay ?? "0s" }}
          />
        </div>
      ))}
    </div>
  );
}

function SectionShell({
  id,
  stars,
  children,
  className
}: {
  id?: string;
  stars: StarDecoration[];
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={clsx("relative overflow-hidden border-t border-[rgba(240,204,119,0.05)]", className)}
      style={sectionBackgroundStyle}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,4,11,0.8),rgba(3,4,11,0.9))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(35,71,154,0.22),transparent_40%),radial-gradient(circle_at_bottom,rgba(9,14,38,0.48),transparent_45%)]" />
      <DecorativeStars stars={stars} />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(240,204,119,0.14)] bg-[rgba(9,12,24,0.45)] px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.3em] text-[#f0d89f]">
      <Image src="/giveaway/cos-star.png" alt="" width={12} height={12} className="h-3 w-3" />
      <span>{children}</span>
    </div>
  );
}

function MetaBadge({
  children,
  highlight
}: {
  children: ReactNode;
  highlight?: boolean;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs",
        highlight
          ? "border-[rgba(240,204,119,0.22)] bg-[rgba(240,204,119,0.09)] text-[#f7dc9d]"
          : "border-white/10 bg-[rgba(255,255,255,0.04)] text-slate-200"
      )}
    >
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  accent
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-[24px] border px-4 py-4 backdrop-blur-sm",
        accent
          ? "border-[rgba(240,204,119,0.18)] bg-[rgba(240,204,119,0.08)]"
          : "border-white/10 bg-[rgba(7,10,18,0.68)]"
      )}
    >
      <div className="text-[0.64rem] uppercase tracking-[0.24em] text-slate-400">{label}</div>
      <div className="mt-3 text-lg font-semibold text-white sm:text-xl">{value}</div>
    </div>
  );
}

function ExternalAction({
  href,
  children,
  variant = "primary",
  className,
  onClick
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "text";
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className={clsx(
        "inline-flex items-center justify-center gap-2 text-sm font-semibold transition duration-200",
        variant === "primary"
          ? "rounded-full bg-[linear-gradient(135deg,#f6d589,#c09040)] px-5 py-3 text-[#1a1205] shadow-[0_14px_34px_rgba(192,144,64,0.26)] hover:brightness-105"
          : variant === "secondary"
            ? "rounded-full border border-white/12 bg-[rgba(10,14,26,0.58)] px-5 py-3 text-white hover:border-[rgba(240,204,119,0.24)]"
            : variant === "ghost"
              ? "rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-2 text-white hover:border-[rgba(240,204,119,0.22)]"
              : "text-white/82 hover:text-white",
        className
      )}
    >
      {children}
      {variant === "text" ? null : <span aria-hidden="true">↗</span>}
    </a>
  );
}

function ScrollAction({
  targetId,
  children,
  variant = "secondary",
  className
}: {
  targetId: string;
  children: ReactNode;
  variant?: "secondary" | "ghost";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => scrollToSection(targetId)}
      className={clsx(
        "inline-flex items-center justify-center gap-2 text-sm font-semibold transition duration-200",
        variant === "secondary"
          ? "rounded-full border border-white/12 bg-[rgba(10,14,26,0.58)] px-5 py-3 text-white hover:border-[rgba(240,204,119,0.24)]"
          : "rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-2 text-white hover:border-[rgba(240,204,119,0.22)]",
        className
      )}
    >
      {children}
    </button>
  );
}

function Thumbnail({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[rgba(7,10,20,0.92)]">
        <Image src="/giveaway/cos-star.png" alt="" width={34} height={34} />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />;
}

function ProfileAvatar({
  src,
  name,
  className
}: {
  src: string | null;
  name: string;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (src) {
    return (
      <div
        className={clsx(
          "overflow-hidden rounded-full border border-[rgba(240,204,119,0.16)] bg-[rgba(255,255,255,0.04)]",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`${name} profile`} loading="lazy" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex items-center justify-center rounded-full border border-[rgba(240,204,119,0.16)] bg-[linear-gradient(135deg,rgba(25,42,110,0.8),rgba(191,145,69,0.8))] text-[0.65rem] font-semibold text-white",
        className
      )}
      aria-label={`${name} profile`}
    >
      {initials}
    </div>
  );
}

function DetailPanel({
  entry,
  timeZone
}: {
  entry: GiveawayEntry;
  timeZone: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[rgba(6,9,17,0.78)] p-4 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[160px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.03)] aspect-[4/5] max-w-[160px]">
          <Thumbnail
            src={entry.thumbnailUrl}
            alt={`Featured entry thumbnail for ${entry.displayName}`}
          />
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            {entry.contentTypes.map((badge) => (
              <MetaBadge key={badge}>{badge}</MetaBadge>
            ))}
            {entry.entryTitle ? <MetaBadge highlight>{entry.entryTitle}</MetaBadge> : null}
            <MetaBadge>
              {entry.leaderboardState === "ranked"
                ? `${formatNumber(entry.totalEngagementScore)} points`
                : "Awaiting verification"}
            </MetaBadge>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Rank"
              value={entry.rank !== null ? `#${entry.rank}` : "Awaiting verification"}
              accent={entry.raffleZone}
            />
            <StatCard label="Status" value={pointsStatusLabel(entry)} />
            <StatCard
              label="Last verified"
              value={
                entry.lastVerifiedAt
                  ? formatShortDate(entry.lastVerifiedAt, timeZone)
                  : "Awaiting verification"
              }
            />
          </div>

          {entry.submissions.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {entry.submissions.map((submission) =>
                submission.url ? (
                  <a
                    key={submission.id}
                    href={submission.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(8,12,24,0.58)] px-3 py-1.5 text-xs text-slate-200 hover:border-[rgba(240,204,119,0.22)]"
                  >
                    {labelForSubmissionLink(submission)}
                    <span aria-hidden="true">↗</span>
                  </a>
                ) : null
              )}
            </div>
          ) : null}
        </div>
      </div>

      {entry.submissions.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {entry.submissions.map((submission) => (
            <article
              key={submission.id}
              className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4"
            >
              <div className="overflow-hidden rounded-[18px] border border-white/10 bg-[rgba(8,12,20,0.7)] aspect-[4/5]">
                <Thumbnail
                  src={submission.thumbnailUrl}
                  alt={`${submission.title ?? "Contest post"} by ${entry.displayName}`}
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-white">
                    {submission.title ?? entry.entryTitle ?? "Contest post"}
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    {submission.platform.toUpperCase()}
                    {submission.submittedAt
                      ? ` • ${formatShortDate(submission.submittedAt, timeZone)}`
                      : ""}
                  </div>
                </div>
                <div className="text-sm font-semibold text-[#f4d790]">
                  {submission.engagementScore !== null
                    ? `${formatNumber(submission.engagementScore)} pts`
                    : "Awaiting verification"}
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-400">{submission.contentType ?? "Contest entry"}</div>
              {submission.url ? (
                <a
                  href={submission.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-[#f5ddad] hover:text-white"
                >
                  {labelForSubmissionLink(submission)}
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CutlineDivider({
  chaser
}: {
  chaser: GiveawayEntry | null;
}) {
  return (
    <div className="my-4 rounded-[22px] border border-[rgba(240,204,119,0.18)] bg-[linear-gradient(90deg,rgba(240,204,119,0.12),rgba(255,255,255,0.02))] px-4 py-4 text-sm text-slate-100">
      <div className="text-[0.68rem] uppercase tracking-[0.24em] text-[#f0d89f]">
        Top 25 cutoff
      </div>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          The Top 25 eligible entries above this line are currently in the raffle pool.
        </div>
        {chaser ? (
          <div className="text-sm text-[#f5ddad]">
            Closest to the line: {chaser.displayName} needs{" "}
            {formatNumber(Math.abs(chaser.cutlineDelta ?? 0))} points
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LeaderboardRow({
  entry,
  expanded,
  onToggleDetails,
  onCopyLink,
  copied,
  timeZone
}: {
  entry: GiveawayEntry;
  expanded: boolean;
  onToggleDetails: (entryId: string) => void;
  onCopyLink: (entry: GiveawayEntry) => void;
  copied: boolean;
  timeZone: string;
}) {
  return (
    <>
      <div
        className={clsx(
          "grid gap-4 rounded-[24px] border p-4 md:grid-cols-[100px_minmax(0,1fr)_160px_180px_160px]",
          entry.raffleZone
            ? "border-[rgba(240,204,119,0.18)] bg-[rgba(240,204,119,0.08)]"
            : "border-white/10 bg-[rgba(7,10,18,0.68)]"
        )}
      >
        <div>
          <div className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
            {entry.rank !== null ? `Rank #${entry.rank}` : "Pending"}
          </div>
          <div className="mt-2 text-sm text-slate-300">
            {entry.raffleZone
              ? "Top 25"
              : entry.leaderboardState === "ranked"
                ? "Full ranking"
                : "Awaiting verification"}
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex gap-4">
            <div className="h-20 w-16 shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)]">
              <Thumbnail
                src={entry.thumbnailUrl}
                alt={`Entry thumbnail for ${entry.displayName}`}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <ProfileAvatar
                  src={entry.profileImageUrl}
                  name={entry.displayName}
                  className="h-8 w-8 shrink-0"
                />
                <div className="truncate text-base font-semibold text-white">
                  {entry.displayName}
                </div>
              </div>
              {entry.entryTitle ? (
                <div className="mt-1 text-sm text-slate-300">{entry.entryTitle}</div>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                {entry.contentTypes.map((badge) => (
                  <MetaBadge key={badge}>{badge}</MetaBadge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xl font-semibold text-white">
            {entry.leaderboardState === "ranked"
              ? formatNumber(entry.totalEngagementScore)
              : "Awaiting verification"}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {entry.lastVerifiedAt
              ? formatTimestamp(entry.lastVerifiedAt, timeZone)
              : "Awaiting first verified score"}
          </div>
        </div>

        <div>
          <span
            className={clsx(
              "inline-flex rounded-full border px-3 py-1 text-[11px] font-medium",
              entry.raffleZone
                ? "border-[rgba(240,204,119,0.2)] bg-[rgba(240,204,119,0.08)] text-[#f4dcad]"
                : "border-white/10 bg-[rgba(255,255,255,0.04)] text-slate-200"
            )}
          >
            {pointsStatusLabel(entry)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onToggleDetails(entry.id)}
            className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs font-medium text-white hover:border-[rgba(240,204,119,0.22)]"
          >
            View details
          </button>
          <button
            type="button"
            onClick={() => onCopyLink(entry)}
            className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs font-medium text-white hover:border-[rgba(240,204,119,0.22)]"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-3">
          <DetailPanel entry={entry} timeZone={timeZone} />
        </div>
      ) : null}
    </>
  );
}

function AccordionItem({
  question,
  analyticsId,
  children,
  ...rest
}: {
  question: string;
  analyticsId: string;
  children: ReactNode;
} & DetailsHTMLAttributes<HTMLDetailsElement>) {
  return (
    <details
      {...rest}
      onToggle={(event) => {
        if (event.currentTarget.open) {
          trackEvent("faq_open", {
            id: analyticsId
          });
        }

        rest.onToggle?.(event);
      }}
      className="group rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-white">
        <span>{question}</span>
        <span className="text-[#f0d89f] transition group-open:rotate-45">+</span>
      </summary>
      <div className="mt-4 text-sm leading-7 text-slate-300">{children}</div>
    </details>
  );
}

function HeroSection({
  snapshot,
  now
}: {
  snapshot: GiveawaySnapshot;
  now: Date;
}) {
  const countdownTarget = snapshot.campaign.entryDeadline ?? snapshot.campaign.endAt;
  const showCountdown = Boolean(countdownTarget);
  const phase = getCampaignPhase(now, snapshot.campaign);
  const trackedHeroSagaUrl = buildTrackedUrl("https://app.try-saga.com", "hero_post_on_saga");
  const trackedBuyTicketsUrl = buildTrackedUrl(
    snapshot.campaign.buyTicketsUrl,
    "hero_buy_tickets"
  );
  const trackedEventDetailsUrl = buildTrackedUrl(
    snapshot.campaign.eventDetailsUrl,
    "hero_event_details"
  );

  return (
    <SectionShell id="intro" stars={heroStars} className="min-h-screen">
      <div className="flex min-h-screen items-center justify-center py-16 sm:py-20">
        <div className="relative mx-auto max-w-3xl text-center">
          <div
            aria-hidden="true"
            className="cos-halo absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
          />
          <div className="relative">
            <SectionEyebrow>Court of Stars Giveaway: Los Angeles</SectionEyebrow>
            <div className="mx-auto mt-8 w-full max-w-[25rem] sm:max-w-[36rem] lg:max-w-[46rem]">
              <Image
                src="/giveaway/cos-hero-image.png"
                alt="Court of Stars"
                width={4500}
                height={1413}
                priority
                className="mx-auto w-full drop-shadow-[0_24px_42px_rgba(0,0,0,0.42)]"
              />
            </div>
            <p className="mx-auto mt-7 max-w-2xl text-balance text-base leading-8 text-slate-200 sm:text-lg">
              Create something inspired by Court of Stars. To enter, post your entry on Saga and
              submit it through the giveaway form. Share it on Instagram or TikTok with
              <span className="mx-1 font-semibold text-[#f4d790]">#SagaCoSLA</span>
              for extra points. Each approved entry is scored separately, and the Top 25 entries
              enter the raffle pool.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {trackedHeroSagaUrl ? (
                <ExternalAction
                  href={trackedHeroSagaUrl}
                  onClick={() => trackEvent("hero_cta_click", { target: "post_on_saga" })}
                >
                  Post on Saga
                </ExternalAction>
              ) : null}
              <ScrollAction targetId="leaderboard">View leaderboard</ScrollAction>
              <ExternalAction
                href={trackedEventDetailsUrl ?? snapshot.campaign.eventDetailsUrl}
                variant="secondary"
                onClick={() => trackEvent("event_details_click", { placement: "hero" })}
              >
                View event details
              </ExternalAction>
            </div>

            <div className="mt-4">
              <ExternalAction
                href={trackedBuyTicketsUrl ?? snapshot.campaign.buyTicketsUrl}
                variant="text"
                onClick={() => trackEvent("buy_ticket_click", { placement: "hero" })}
              >
                Buy LA tickets
              </ExternalAction>
            </div>

            {showCountdown && countdownTarget ? (
              <div className="mx-auto mt-10 max-w-xl rounded-[24px] border border-white/10 bg-[rgba(7,10,18,0.68)] p-4 backdrop-blur-sm">
                <div className="text-[0.68rem] uppercase tracking-[0.24em] text-[#f0d89f]">
                  {phase === "upcoming" ? "Giveaway opens" : "Entries close"}
                </div>
                <div className="mt-3 text-lg font-semibold text-white">
                  {formatTimestamp(countdownTarget, snapshot.campaign.timeZone)}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function ContestAtGlanceSection({ snapshot }: { snapshot: GiveawaySnapshot }) {
  const trackedSubmissionUrl = buildTrackedUrl(
    snapshot.campaign.submissionFormUrl,
    "glance_enter_giveaway"
  );

  return (
    <SectionShell stars={defaultStars} className="py-16 sm:py-20">
      <div className="max-w-4xl">
        <SectionEyebrow>Contest at a glance</SectionEyebrow>
        <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
          What this giveaway requires
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
          The contest is entry-based. Each approved submission is scored on its own, and direct
          post URLs are required for accurate ranking.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          {
            title: "Required to enter",
            items: [
              "Post a Court of Stars-inspired entry on Saga",
              "Submit your entry through the form"
            ]
          },
          {
            title: "Earn extra points",
            items: ["Share on Instagram, TikTok, or Reels", "Use #SagaCoSLA on those posts"]
          },
          {
            title: "Accepted formats",
            items: ["Saga posts", "Instagram grid posts", "TikTok videos", "Reels"]
          },
          {
            title: "Not counted",
            items: ["Instagram Stories", "TikTok Stories", "Handle-only submissions"]
          },
          {
            title: "Good to know",
            items: [
              "Multiple entries allowed",
              `Top ${snapshot.campaign.poolSize} entries enter the raffle pool`
            ]
          }
        ].map((card) => (
          <article
            key={card.title}
            className="rounded-[24px] border border-white/10 bg-[rgba(7,10,18,0.68)] p-5 backdrop-blur-sm"
          >
            <div className="text-[0.66rem] uppercase tracking-[0.24em] text-[#f0d89f]">
              {card.title}
            </div>
            <div className="mt-4 space-y-2 text-sm leading-7 text-slate-200">
              {card.items.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <MetaBadge highlight>#SagaCoSLA</MetaBadge>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText("#SagaCoSLA");
            trackEvent("share_link_click", { target: "copy_hashtag" });
          }}
          className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-white hover:border-[rgba(240,204,119,0.22)]"
        >
          Copy hashtag
        </button>
        {trackedSubmissionUrl ? (
          <ExternalAction href={trackedSubmissionUrl} variant="ghost">
            Enter now
          </ExternalAction>
        ) : null}
      </div>
    </SectionShell>
  );
}

function HowItWorksSection({ snapshot }: { snapshot: GiveawaySnapshot }) {
  const steps = [
    {
      title: "Create on Saga",
      body: "Make a Court of Stars-inspired post. This is the required starting point for every scored entry."
    },
    {
      title: "Submit your entry",
      body: "Send us the Saga link and any matching Instagram or TikTok links through the giveaway form."
    },
    {
      title: "Share on social",
      body: "Post on Instagram, TikTok, or Reels with #SagaCoSLA to earn additional points when official or manual metrics are available."
    },
    {
      title: "Climb the leaderboard",
      body: `Each approved entry is ranked separately. The Top ${snapshot.campaign.poolSize} eligible entries enter the raffle pool.`
    }
  ];

  return (
    <SectionShell stars={defaultStars} className="py-16 sm:py-20">
      <SectionEyebrow>How the giveaway works</SectionEyebrow>
      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="rounded-[24px] border border-white/10 bg-[rgba(7,10,18,0.68)] p-5"
          >
            <div className="text-[0.66rem] uppercase tracking-[0.24em] text-[#f0d89f]">
              Step {index + 1}
            </div>
            <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{step.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function LeaderboardSection({
  snapshot,
  search,
  categoryFilter,
  onSearch,
  onCategoryChange,
  expandedEntryId,
  onToggleDetails,
  onCopyLink,
  copiedEntryId
}: {
  snapshot: GiveawaySnapshot;
  search: string;
  categoryFilter: "all" | CategoryKey | "top25";
  onSearch: (value: string) => void;
  onCategoryChange: (value: "all" | CategoryKey | "top25") => void;
  expandedEntryId: string | null;
  onToggleDetails: (entryId: string) => void;
  onCopyLink: (entry: GiveawayEntry) => void;
  copiedEntryId: string | null;
}) {
  const filteredRankedEntries = snapshot.rankedEntries.filter(
    (entry) => matchesSearch(entry, search) && matchesCategory(entry, categoryFilter)
  );
  const filteredAwaitingVerificationEntries = snapshot.awaitingVerificationEntries.filter(
    (entry) => matchesSearch(entry, search) && matchesCategory(entry, categoryFilter)
  );

  return (
    <SectionShell id="leaderboard" stars={defaultStars} className="py-16 sm:py-20">
      <div className="max-w-4xl">
        <SectionEyebrow>Leaderboard</SectionEyebrow>
        <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">Live leaderboard</h2>
        <p className="mt-4 text-base leading-8 text-slate-300">
          Your entry rank is based on total points from approved post URLs and verified engagement.
          The Top {snapshot.campaign.poolSize} eligible entries enter the raffle pool.
        </p>
        <div className="mt-4">
          <MetaBadge highlight>Top {snapshot.campaign.poolSize} raffle pool — Star Circle</MetaBadge>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current Top 25 cutoff"
          value={snapshot.cutlineScore !== null ? `${formatNumber(snapshot.cutlineScore)} points` : "Forming"}
          accent
        />
        <StatCard label="Eligible entries" value={formatNumber(snapshot.totalEligible)} />
        <StatCard
          label="Awaiting verification"
          value={formatNumber(snapshot.awaitingVerificationCount)}
        />
        <StatCard
          label="Last updated"
          value={formatTimestamp(snapshot.lastUpdatedAt, snapshot.campaign.timeZone)}
        />
      </div>

      <div className="mt-8 rounded-[28px] border border-white/10 bg-[rgba(8,11,20,0.88)] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="block lg:max-w-sm lg:flex-1">
            <span className="sr-only">Search entries</span>
            <input
              value={search}
              onChange={(event) => {
                onSearch(event.target.value);
                trackEvent("leaderboard_search", {
                  query_length: event.target.value.length
                });
              }}
              placeholder="Search entries"
              className="w-full rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => {
                  onCategoryChange(filter.value);
                  trackEvent("leaderboard_filter", {
                    filter: filter.value
                  });
                }}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm transition",
                  categoryFilter === filter.value
                    ? "border-[rgba(240,204,119,0.22)] bg-[rgba(240,204,119,0.08)] text-[#f5ddad]"
                    : "border-white/10 bg-[rgba(255,255,255,0.04)] text-white"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {filteredRankedEntries.map((entry, index) => {
            const nextEntry = filteredRankedEntries[index + 1] ?? null;
            const showCutlineDivider = entry.raffleZone && Boolean(nextEntry && !nextEntry.raffleZone);

            return (
              <Fragment key={entry.id}>
                <div id={entryAnchorId(entry)}>
                  <LeaderboardRow
                    entry={entry}
                    expanded={expandedEntryId === entry.id}
                    onToggleDetails={onToggleDetails}
                    onCopyLink={onCopyLink}
                    copied={copiedEntryId === entry.id}
                    timeZone={snapshot.campaign.timeZone}
                  />
                </div>
                {showCutlineDivider ? <CutlineDivider chaser={nextEntry} /> : null}
              </Fragment>
            );
          })}

          {filteredRankedEntries.length === 0 ? (
            <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 text-sm text-slate-300">
              No ranked entries match the current filters.
            </div>
          ) : null}
        </div>

        {filteredAwaitingVerificationEntries.length > 0 ? (
          <div className="mt-8 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[0.68rem] uppercase tracking-[0.24em] text-[#f0d89f]">
                  Awaiting verification
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white">Visible, but not ranked yet</h3>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-300">
                These entries are eligible and publicly visible, but they do not have a fully
                verified score yet.
              </p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {filteredAwaitingVerificationEntries.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-[22px] border border-white/10 bg-[rgba(7,10,18,0.7)] p-4"
                >
                  <div className="flex gap-4">
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)]">
                      <Thumbnail
                        src={entry.thumbnailUrl}
                        alt={`Entry thumbnail awaiting verification for ${entry.displayName}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <ProfileAvatar
                          src={entry.profileImageUrl}
                          name={entry.displayName}
                          className="h-8 w-8 shrink-0"
                        />
                        <div className="text-base font-semibold text-white">{entry.displayName}</div>
                      </div>
                      {entry.entryTitle ? (
                        <div className="mt-1 text-sm text-slate-300">{entry.entryTitle}</div>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {entry.contentTypes.map((badge) => (
                          <MetaBadge key={badge}>{badge}</MetaBadge>
                        ))}
                      </div>
                      <div className="mt-3 inline-flex rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-1 text-[11px] text-slate-200">
                        {pointsStatusLabel(entry)}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

function WinnersSection({ snapshot }: { snapshot: GiveawaySnapshot }) {
  return (
    <SectionShell stars={defaultStars} className="py-16 sm:py-20">
      <SectionEyebrow>How winners are chosen</SectionEyebrow>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "Entries earn points",
            body: "Each approved entry is scored separately using verified engagement from its direct post URLs."
          },
          {
            title: `Top ${snapshot.campaign.poolSize} enter the raffle`,
            body: "The highest-ranked eligible entries form the final raffle pool."
          },
          {
            title: `${snapshot.campaign.winnerCount} winners are drawn`,
            body: "Prize assignment happens manually after the raffle draw. Higher final ranking determines ticket tier among the selected winners."
          }
        ].map((step) => (
          <article
            key={step.title}
            className="rounded-[24px] border border-white/10 bg-[rgba(7,10,18,0.68)] p-5"
          >
            <h3 className="text-xl font-semibold text-white">{step.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{step.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          "1 Tier 2 ticket",
          "2 Tier 1 tickets",
          "3 General Admission tickets"
        ].map((item) => (
          <div
            key={item}
            className="rounded-[24px] border border-[rgba(240,204,119,0.18)] bg-[rgba(240,204,119,0.08)] px-5 py-5 text-center text-base font-semibold text-white"
          >
            {item}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function InspirationSection({ snapshot }: { snapshot: GiveawaySnapshot }) {
  const featuredEntries = snapshot.topEntries.slice(0, 3);

  return (
    <SectionShell stars={defaultStars} className="py-16 sm:py-20">
      <SectionEyebrow>What can you create?</SectionEyebrow>
      <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
        A broad canvas is welcome here
      </h2>
      <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
        The giveaway is intentionally open-ended. Any Court of Stars-inspired creation can work as
        long as it fits the giveaway rules and uses direct post URLs for scoring.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          {
            title: "Cosplay & Looks",
            body: "Show the outfit, styling, makeup, prop work, or full look you would bring into Court of Stars."
          },
          {
            title: "Fan Art & Illustrations",
            body: "Create posters, digital art, sketches, or finished illustrations inspired by the world and mood of the event."
          },
          {
            title: "Fanfiction & Micro-fiction",
            body: "Write scenes, journals, letters, short fiction, or dramatic snippets that feel like they belong in the Court."
          },
          {
            title: "Original Characters & Lore",
            body: "Invent a courtier, rival, or royal guest and build their backstory, aesthetic, and place in the world."
          },
          {
            title: "Event Styling / Moodboards",
            body: "Build visual references, styling studies, decor boards, invitations, or dream looks that capture the atmosphere."
          }
        ].map((card) => (
          <article
            key={card.title}
            className="rounded-[24px] border border-white/10 bg-[rgba(7,10,18,0.68)] p-5"
          >
            <h3 className="text-lg font-semibold text-white">{card.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{card.body}</p>
          </article>
        ))}
      </div>

      {featuredEntries.length > 0 ? (
        <div className="mt-10">
          <div className="text-[0.68rem] uppercase tracking-[0.24em] text-[#f0d89f]">
            Featured live entries
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {featuredEntries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4"
              >
                <div className="overflow-hidden rounded-[18px] border border-white/10 bg-[rgba(8,12,20,0.7)] aspect-[4/5]">
                  <Thumbnail
                    src={entry.thumbnailUrl}
                    alt={`${entry.entryTitle ?? "Featured entry"} by ${entry.displayName}`}
                  />
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <ProfileAvatar
                    src={entry.profileImageUrl}
                    name={entry.displayName}
                    className="h-9 w-9 shrink-0"
                  />
                  <div>
                    <div className="font-medium text-white">{entry.displayName}</div>
                    <div className="text-sm text-slate-400">
                      {entry.entryTitle ?? "Court of Stars entry"}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </SectionShell>
  );
}

function PointsSection({ snapshot }: { snapshot: GiveawaySnapshot }) {
  return (
    <SectionShell stars={defaultStars} className="py-16 sm:py-20">
      <SectionEyebrow>How points work</SectionEyebrow>
      <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
        Points come from approved posts and engagement
      </h2>
      <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
        Each entry is scored independently. More approved entries can help you climb, but every
        rank on the board belongs to a specific submitted entry.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "Eligible posts earn points",
            body: "Only direct post URLs are scoreable. Handles alone are not enough to rank an entry."
          },
          {
            title: "Community engagement matters",
            body: "Likes, unique comments, and shares increase your score based on the official weighting per platform."
          },
          {
            title: "Multiple entries can climb separately",
            body: "If you submit three eligible entries, each one can appear independently on the leaderboard."
          }
        ].map((card) => (
          <article
            key={card.title}
            className="rounded-[24px] border border-white/10 bg-[rgba(7,10,18,0.68)] p-5"
          >
            <h3 className="text-xl font-semibold text-white">{card.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{card.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-8">
        <AccordionItem question="See full scoring rules" analyticsId="full_scoring_rules">
          <div className="space-y-3">
            <div>{snapshot.scoring.formulaLabel}</div>
            {snapshot.scoring.explanation.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </AccordionItem>
      </div>
    </SectionShell>
  );
}

function FaqSection({ snapshot }: { snapshot: GiveawaySnapshot }) {
  return (
    <SectionShell stars={defaultStars} className="py-16 sm:py-20">
      <SectionEyebrow>FAQ</SectionEyebrow>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <AccordionItem question="Do I have to post on Saga to enter?" analyticsId="faq_saga_required">
          Yes. Posting a Court of Stars-inspired entry on Saga and submitting that entry through the
          form are the required steps for entry.
        </AccordionItem>
        <AccordionItem question="Are Instagram and TikTok required?" analyticsId="faq_social_optional">
          No. Instagram and TikTok are optional extra-point channels. They help only when you submit
          direct post URLs and use #SagaCoSLA where required.
        </AccordionItem>
        <AccordionItem question="Do Stories count?" analyticsId="faq_stories">
          No. Instagram Stories and TikTok Stories do not count toward the giveaway.
        </AccordionItem>
        <AccordionItem question="Can I submit more than one entry?" analyticsId="faq_multiple_entries">
          Yes. Multiple entries are allowed, and each approved entry is tracked separately on the
          leaderboard.
        </AccordionItem>
        <AccordionItem question="Am I ranked by creator or by entry?" analyticsId="faq_entry_ranking">
          The leaderboard in this version ranks entries, not creators. If one creator submits three
          approved entries, those can appear as three separate leaderboard items.
        </AccordionItem>
        <AccordionItem question="How do points affect the raffle?" analyticsId="faq_points_raffle">
          Points determine which eligible entries make the Top {snapshot.campaign.poolSize}. That
          Top {snapshot.campaign.poolSize} becomes the raffle pool.
        </AccordionItem>
        <AccordionItem question="When are winners announced?" analyticsId="faq_winner_announcement">
          Winners are announced after entries close, scoring is finalized, and the raffle pool is
          locked. If a public date is configured, it will appear in the event details or official
          rules.
        </AccordionItem>
      </div>
    </SectionShell>
  );
}

function FooterSection({ snapshot }: { snapshot: GiveawaySnapshot }) {
  const trackedSubmissionUrl = buildTrackedUrl(
    snapshot.campaign.submissionFormUrl,
    "footer_enter_giveaway"
  );
  const trackedEventDetailsUrl = buildTrackedUrl(
    snapshot.campaign.eventDetailsUrl,
    "footer_event_details"
  );
  const trackedBuyTicketsUrl = buildTrackedUrl(
    snapshot.campaign.buyTicketsUrl,
    "footer_buy_tickets"
  );

  return (
    <SectionShell stars={footerStars} className="pb-28 pt-16 sm:pb-16">
      <div className="rounded-[28px] border border-white/10 bg-[rgba(8,11,20,0.88)] p-6 sm:p-8">
        <div className="max-w-2xl">
          <SectionEyebrow>Need help?</SectionEyebrow>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            Final links before you jump in
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-300">
            Use the giveaway form for official entry, review the event details before you create,
            and buy tickets directly if you already know you want to attend.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {trackedSubmissionUrl ? <ExternalAction href={trackedSubmissionUrl}>Enter the giveaway</ExternalAction> : null}
          <ExternalAction
            href={trackedEventDetailsUrl ?? snapshot.campaign.eventDetailsUrl}
            variant="secondary"
          >
            View event details
          </ExternalAction>
          <ExternalAction
            href={trackedBuyTicketsUrl ?? snapshot.campaign.buyTicketsUrl}
            variant="secondary"
          >
            Buy tickets
          </ExternalAction>
          {snapshot.campaign.supportInstagramUrl ? (
            <ExternalAction
              href={snapshot.campaign.supportInstagramUrl}
              variant="ghost"
              className="sm:ml-auto"
            >
              Instagram support
            </ExternalAction>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-xs text-slate-400">
          {snapshot.campaign.officialRulesUrl ? (
            <a
              href={snapshot.campaign.officialRulesUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              Official rules
            </a>
          ) : null}
          {snapshot.campaign.privacyUrl ? (
            <a
              href={snapshot.campaign.privacyUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              Privacy
            </a>
          ) : null}
          <span>Organized with Saga</span>
        </div>
      </div>
    </SectionShell>
  );
}

function MobileStickyBar({ snapshot }: { snapshot: GiveawaySnapshot }) {
  const trackedSubmissionUrl = buildTrackedUrl(
    snapshot.campaign.submissionFormUrl,
    "mobile_enter_giveaway"
  );
  const trackedBuyTicketsUrl = buildTrackedUrl(
    snapshot.campaign.buyTicketsUrl,
    "mobile_buy_tickets"
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[rgba(4,5,10,0.9)] p-3 backdrop-blur-lg md:hidden">
      <div className="mx-auto flex max-w-5xl gap-2">
        {trackedSubmissionUrl ? (
          <a
            href={trackedSubmissionUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-full bg-[linear-gradient(135deg,#f6d589,#c09040)] px-3 py-3 text-center text-sm font-semibold text-[#1a1205]"
          >
            Enter
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => scrollToSection("leaderboard")}
          className="flex-1 rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-3 text-sm font-semibold text-white"
        >
          Leaderboard
        </button>
        <a
          href={trackedBuyTicketsUrl ?? snapshot.campaign.buyTicketsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-3 text-center text-sm font-semibold text-white"
        >
          Tickets
        </a>
      </div>
    </div>
  );
}

export function GiveawayExperience({
  initialSnapshot
}: {
  initialSnapshot: GiveawaySnapshot;
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | CategoryKey | "top25">("all");
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [copiedEntryId, setCopiedEntryId] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    document.body.dataset.route = "giveaway";

    return () => {
      delete document.body.dataset.route;
    };
  }, []);

  useEffect(() => {
    const refreshId = window.setInterval(async () => {
      try {
        const response = await fetch("/api/giveaway", {
          cache: "no-store"
        });

        if (!response.ok) {
          return;
        }

        const nextSnapshot = (await response.json()) as GiveawaySnapshot;
        setSnapshot(nextSnapshot);
        setNow(new Date());
      } catch {
        // Ignore refresh errors to keep the last known public state visible.
      }
    }, snapshot.liveRefreshSeconds * 1000);

    return () => window.clearInterval(refreshId);
  }, [snapshot.liveRefreshSeconds]);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");

    if (!hash) {
      return;
    }

    const match = snapshot.entries.find((entry) => entryAnchorId(entry) === hash);

    if (match) {
      setExpandedEntryId(match.id);
    }
  }, [snapshot.entries]);

  const handleCopyLink = async (entry: GiveawayEntry) => {
    const shareUrl = `${window.location.origin}/giveaway#${entryAnchorId(entry)}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedEntryId(entry.id);
      trackEvent("share_link_click", {
        entry_id: entry.entryId
      });
      window.setTimeout(() => setCopiedEntryId(null), 1600);
    } catch {
      window.location.hash = entryAnchorId(entry);
      setCopiedEntryId(entry.id);
      window.setTimeout(() => setCopiedEntryId(null), 1600);
    }
  };

  return (
    <div className="bg-[#05060b] text-white">
      <HeroSection snapshot={snapshot} now={now} />
      <ContestAtGlanceSection snapshot={snapshot} />
      <HowItWorksSection snapshot={snapshot} />
      <LeaderboardSection
        snapshot={snapshot}
        search={search}
        categoryFilter={categoryFilter}
        onSearch={setSearch}
        onCategoryChange={setCategoryFilter}
        expandedEntryId={expandedEntryId}
        onToggleDetails={(entryId) => {
          setExpandedEntryId((current) => (current === entryId ? null : entryId));
          trackEvent("creator_detail_open", {
            entry_id: entryId
          });
        }}
        onCopyLink={handleCopyLink}
        copiedEntryId={copiedEntryId}
      />
      <WinnersSection snapshot={snapshot} />
      <InspirationSection snapshot={snapshot} />
      <PointsSection snapshot={snapshot} />
      <FaqSection snapshot={snapshot} />
      <FooterSection snapshot={snapshot} />
      <MobileStickyBar snapshot={snapshot} />
    </div>
  );
}
