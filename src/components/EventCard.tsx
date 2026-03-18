"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { StatusChip } from "@/src/components/StatusChip";
import { ThresholdProgress } from "@/src/components/ThresholdProgress";
import { type UserMode } from "@/src/data/launches";
import { type DemoEvent, getUserById } from "@/src/data/demo";
import { cn, formatDateRange, formatTimeLabel } from "@/src/lib/utils";

type EventCardProps = {
  event: DemoEvent;
  mode: UserMode;
  openRoles: number;
  thresholdCurrent: number;
  thresholdTarget: number;
  reasonLine: string;
  status: "draft" | "planning" | "recruiting" | "validating" | "live" | "completed" | "almost-there";
  href?: string;
  className?: string;
  variant?: "featured" | "stacked" | "row";
  primaryLabel: string;
  secondaryLabel?: string;
  saved?: boolean;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onToggleSaved?: () => void;
};

export function EventCard({
  event,
  mode,
  openRoles,
  thresholdCurrent,
  thresholdTarget,
  reasonLine,
  status,
  href,
  className,
  variant = "stacked",
  primaryLabel,
  secondaryLabel = "See details",
  saved = false,
  onPrimaryAction,
  onSecondaryAction,
  onToggleSaved
}: EventCardProps) {
  const cardHref = href ?? `/events/${event.id}`;
  const hostName = getUserById(event.hostId)?.name ?? "Host";
  const meta = [
    formatDateRange(event.startsAt, event.endsAt),
    formatTimeLabel(event.startsAt),
    event.city,
    event.fandomTags[0]
  ].filter(Boolean);

  if (variant === "row") {
    return (
      <article className={cn("surface-card overflow-hidden p-3", className)}>
        <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4">
          <Link className="block overflow-hidden rounded-[22px]" href={cardHref}>
            <img alt={event.title} className="h-[116px] w-full object-cover" src={event.posterUrl} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={cardHref}>
                  <h3 className="truncate text-lg font-semibold text-white">{event.title}</h3>
                </Link>
                <p className="mt-1 truncate text-sm text-app-muted">{reasonLine}</p>
              </div>
              <StatusChip status={status === "live" && thresholdCurrent >= thresholdTarget ? "almost-there" : status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {meta.slice(0, 3).map((item) => (
                <MetaChip key={item}>{item}</MetaChip>
              ))}
              {openRoles > 0 ? <MetaChip>{openRoles} openings</MetaChip> : null}
            </div>
            <div className="mt-4">
              <ThresholdProgress compact current={thresholdCurrent} target={thresholdTarget} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Avatar name={hostName} size="sm" />
                <span className="text-xs text-app-muted">{hostName}</span>
              </div>
              <div className="flex items-center gap-3">
                {onToggleSaved ? (
                  <button
                    className={cn(
                      "rounded-full border p-2 transition",
                      saved
                        ? "border-app-purple/30 bg-app-purple/12 text-white"
                        : "border-white/10 text-app-muted hover:border-white/20 hover:text-white"
                    )}
                    onClick={onToggleSaved}
                    type="button"
                  >
                    <BookmarkIcon filled={saved} />
                  </button>
                ) : null}
                <button
                  className="rounded-2xl bg-app-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                  onClick={onPrimaryAction}
                  type="button"
                >
                  {primaryLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn("surface-card overflow-hidden p-4", className)}>
      <Link className="block" href={cardHref}>
        <div className="relative overflow-hidden rounded-[30px]">
          <img
            alt={event.title}
            className={cn(
              "w-full object-cover",
              variant === "featured" ? "h-[360px] sm:h-[420px]" : "h-[260px] sm:h-[320px]"
            )}
            src={event.posterUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/18 to-transparent" />
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
            <StatusChip status={status === "live" && thresholdCurrent >= thresholdTarget ? "almost-there" : status} />
            {openRoles > 0 && mode === "creator" ? (
              <span className="rounded-full border border-app-purple/25 bg-app-purple/12 px-3 py-1 text-xs font-semibold text-white">
                {openRoles} openings
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={cardHref}>
              <h3 className={cn("font-semibold text-white", variant === "featured" ? "text-4xl" : "text-[28px]")}>
                {event.title}
              </h3>
            </Link>
            <p className="mt-2 line-clamp-1 text-sm text-app-muted">{reasonLine}</p>
          </div>
          {onToggleSaved ? (
            <button
              className={cn(
                "rounded-full border p-2 transition",
                saved
                  ? "border-app-purple/30 bg-app-purple/12 text-white"
                  : "border-white/10 text-app-muted hover:border-white/20 hover:text-white"
              )}
              onClick={onToggleSaved}
              type="button"
            >
              <BookmarkIcon filled={saved} />
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {meta.map((item) => (
            <MetaChip key={item}>{item}</MetaChip>
          ))}
          {openRoles > 0 ? <MetaChip>{openRoles} roles open</MetaChip> : null}
        </div>

        <div className="mt-4">
          <ThresholdProgress current={thresholdCurrent} target={thresholdTarget} />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Avatar name={hostName} size="sm" />
          <span className="text-sm text-app-muted">{hostName}</span>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <button
            className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            onClick={onPrimaryAction}
            type="button"
          >
            {primaryLabel}
          </button>
          {secondaryLabel ? (
            <button
              className="text-sm font-semibold text-app-muted transition hover:text-white"
              onClick={onSecondaryAction}
              type="button"
            >
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs font-medium text-app-muted">
      {children}
    </span>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={filled ? "fill-white" : "fill-none"}
      height="18"
      viewBox="0 0 24 24"
      width="18"
    >
      <path
        d="M7 4.75h10a1.25 1.25 0 0 1 1.25 1.25v13.5l-6.25-3.6-6.25 3.6V6A1.25 1.25 0 0 1 7 4.75Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}
