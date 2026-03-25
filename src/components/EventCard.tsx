"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { StatusChip } from "@/src/components/StatusChip";
import { ThresholdProgress } from "@/src/components/ThresholdProgress";
import { type LaunchStatus, type UserMode } from "@/src/data/launches";
import { type DemoEvent, getUserById } from "@/src/data/demo";
import { cn, formatDateRange, formatTimeLabel } from "@/src/lib/utils";

type EventCardProps = {
  event: DemoEvent;
  mode: UserMode;
  openRoles: number;
  thresholdCurrent: number;
  thresholdTarget: number;
  thresholdLabel?: string;
  reasonLine: string;
  socialLine?: string;
  status: LaunchStatus | "almost-there";
  href?: string;
  className?: string;
  variant?: "featured" | "stacked" | "row";
  primaryLabel: string;
  secondaryLabel?: string;
  showThreshold?: boolean;
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
  thresholdLabel,
  reasonLine,
  socialLine,
  status,
  href,
  className,
  variant = "stacked",
  primaryLabel,
  secondaryLabel,
  showThreshold = true,
  saved = false,
  onPrimaryAction,
  onSecondaryAction,
  onToggleSaved
}: EventCardProps) {
  const cardHref = href ?? `/events/${event.id}`;
  const host = getUserById(event.hostId);
  const hostName = host?.name ?? "Host";
  const meta = [
    formatDateRange(event.startsAt, event.endsAt),
    formatTimeLabel(event.startsAt),
    event.city,
    event.fandomTags[0]
  ].filter(Boolean);

  if (variant === "row") {
    return (
      <article
        className={cn(
          "group overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,23,36,0.92),rgba(10,13,20,0.96))] p-3 shadow-card transition hover:border-white/12",
          className
        )}
      >
        <div className="grid grid-cols-[108px_minmax(0,1fr)] gap-4">
          <Link className="block overflow-hidden rounded-[24px]" href={cardHref}>
            <img
              alt={event.title}
              className="h-[132px] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              src={event.posterUrl}
            />
          </Link>
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={cardHref}>
                  <h3 className="line-clamp-2 text-xl font-semibold leading-tight text-white">{event.title}</h3>
                </Link>
                <p className="mt-2 line-clamp-2 text-sm text-white/70">{reasonLine}</p>
              </div>
              <StatusChip status={status === "live" && thresholdCurrent >= thresholdTarget ? "almost-there" : status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {meta.slice(0, 3).map((item) => (
                <MetaChip key={item}>{item}</MetaChip>
              ))}
              {openRoles > 0 ? <MetaChip>{openRoles} openings</MetaChip> : null}
            </div>
            {showThreshold ? (
              <div className="mt-4">
                <ThresholdProgress
                  compact
                  current={thresholdCurrent}
                  label={thresholdLabel}
                  target={thresholdTarget}
                />
              </div>
            ) : null}
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Avatar name={hostName} size="sm" src={host?.avatarUrl} />
                <div className="min-w-0">
                  <span className="block truncate text-xs text-app-muted">{hostName}</span>
                  {socialLine ? (
                    <span className="block truncate text-[11px] text-white/54">{socialLine}</span>
                  ) : null}
                </div>
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
    <article
      className={cn(
        "group overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,23,36,0.92),rgba(10,13,20,0.96))] p-4 shadow-card transition hover:border-white/12",
        className
      )}
    >
      <Link className="block" href={cardHref}>
        <div className="relative overflow-hidden rounded-[30px]">
          <img
            alt={event.title}
            className={cn(
              "w-full object-cover transition duration-500 group-hover:scale-[1.02]",
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
          {variant === "featured" ? (
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <div className="flex flex-wrap gap-2">
                {meta.map((item) => (
                  <span
                    className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-xs font-semibold text-white"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
                {openRoles > 0 ? (
                  <span className="rounded-full border border-app-purple/25 bg-app-purple/12 px-3 py-1 text-xs font-semibold text-white">
                    {openRoles} roles open
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
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
            <p className="mt-2 line-clamp-2 text-sm text-white/70">{reasonLine}</p>
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

        {variant !== "featured" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {meta.map((item) => (
              <MetaChip key={item}>{item}</MetaChip>
            ))}
            {openRoles > 0 ? <MetaChip>{openRoles} roles open</MetaChip> : null}
          </div>
        ) : null}

        {showThreshold ? (
          <div className="mt-4">
            <ThresholdProgress current={thresholdCurrent} label={thresholdLabel} target={thresholdTarget} />
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-3">
          <Avatar name={hostName} size="sm" src={host?.avatarUrl} />
          <div className="min-w-0">
            <span className="block text-sm text-app-muted">{hostName}</span>
            {socialLine ? (
              <span className="block truncate text-xs text-white/54">{socialLine}</span>
            ) : null}
          </div>
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
