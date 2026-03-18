"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { OpenRolesPill, TagChip } from "@/src/components/Chips";
import { type DemoEvent, getUserById } from "@/src/data/demo";
import { cn, formatDateRange, formatTimeLabel } from "@/src/lib/utils";

type EventCardProps = {
  event: DemoEvent;
  openRoles: number;
  variant?: "feed" | "row" | "hero";
  className?: string;
  href?: string;
  joined?: boolean;
  saved?: boolean;
  applied?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimaryAction?: (event: DemoEvent) => void;
  onSecondaryAction?: (event: DemoEvent) => void;
  onToggleSaved?: (event: DemoEvent) => void;
};

export function EventCard({
  event,
  openRoles,
  variant = "feed",
  className,
  href,
  joined = false,
  saved = false,
  applied = false,
  primaryLabel = event.isFree ? "RSVP" : "Get ticket",
  secondaryLabel = openRoles > 0 ? (applied ? "Applied" : "Apply to help") : undefined,
  onPrimaryAction,
  onSecondaryAction,
  onToggleSaved
}: EventCardProps) {
  const host = getUserById(event.hostId);
  const cardHref = href ?? `/events/${event.id}`;
  const metaChips = [
    formatDateRange(event.startsAt, event.endsAt),
    formatTimeLabel(event.startsAt),
    event.city,
    event.fandomTags[0]
  ].filter(Boolean);

  if (variant === "row") {
    return (
      <article
        className={cn(
          "surface-card overflow-hidden p-3 transition hover:border-white/12",
          className
        )}
      >
        <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-4">
          <Link
            className="block overflow-hidden rounded-[22px] border border-white/8"
            href={cardHref}
          >
            <img alt={event.title} className="h-[112px] w-full object-cover" src={event.posterUrl} />
          </Link>

          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={cardHref}>
                  <h3 className="truncate text-lg font-semibold text-white">{event.title}</h3>
                </Link>
                <p className="mt-1 truncate text-sm text-app-muted">{event.subtitle}</p>
              </div>
              {onToggleSaved ? (
                <SaveButton
                  onClick={() => onToggleSaved(event)}
                  saved={saved}
                />
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {metaChips.slice(0, 3).map((item) => (
                <MetaChip key={item}>{item}</MetaChip>
              ))}
              {joined ? <MetaChip>Ticketed</MetaChip> : null}
              {applied ? <MetaChip>Applied</MetaChip> : null}
              {openRoles > 0 ? <OpenRolesPill count={openRoles} /> : null}
            </div>

            <div className="mt-3 flex items-center gap-2">
              {host ? <Avatar name={host.name} size="sm" src={host.avatarUrl} /> : null}
              <p className="truncate text-xs text-app-muted">Hosted by {host?.name ?? "Host"}</p>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "hero") {
    return (
      <article className={cn("surface-card overflow-hidden p-4", className)}>
        <Link className="block" href={cardHref}>
          <div className="relative overflow-hidden rounded-[30px] border border-white/8">
            <img
              alt={event.title}
              className="h-[320px] w-full object-cover sm:h-[420px]"
              src={event.posterUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/22 to-transparent" />
            <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <TagChip label={event.fandomTags[0] ?? "Event"} subdued />
                {openRoles > 0 ? <OpenRolesPill count={openRoles} emphasized /> : null}
              </div>
              {onToggleSaved ? (
                <SaveButton
                  floating
                  onClick={(clickEvent) => {
                    clickEvent.preventDefault();
                    onToggleSaved(event);
                  }}
                  saved={saved}
                />
              ) : null}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
              <h2 className="max-w-3xl text-3xl font-semibold text-white sm:text-5xl">
                {event.title}
              </h2>
              <p className="mt-2 max-w-2xl truncate text-sm text-white/78 sm:text-base">
                {event.subtitle}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {metaChips.map((item) => (
                  <MetaChip key={item} inverted>
                    {item}
                  </MetaChip>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                {host ? <Avatar name={host.name} size="sm" src={host.avatarUrl} /> : null}
                <p className="text-sm text-white/78">Hosted by {host?.name ?? "Host"}</p>
              </div>
            </div>
          </div>
        </Link>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ActionButton
            label={primaryLabel}
            onClick={() => onPrimaryAction?.(event)}
            primary
          />
          {secondaryLabel ? (
            <ActionButton
              disabled={applied}
              label={secondaryLabel}
              onClick={() => onSecondaryAction?.(event)}
            />
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article className={cn("surface-card overflow-hidden p-4", className)}>
      <div className="relative">
        <Link className="block" href={cardHref}>
          <div className="relative overflow-hidden rounded-[28px] border border-white/8">
            <img
              alt={event.title}
              className="h-[260px] w-full object-cover sm:h-[320px]"
              src={event.posterUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/12 to-transparent" />
            <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <TagChip label={event.fandomTags[0] ?? "Event"} subdued />
                {openRoles > 0 ? <OpenRolesPill count={openRoles} /> : null}
              </div>
              {onToggleSaved ? (
                <SaveButton
                  floating
                  onClick={(clickEvent) => {
                    clickEvent.preventDefault();
                    onToggleSaved(event);
                  }}
                  saved={saved}
                />
              ) : null}
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-4">
        <Link className="block" href={cardHref}>
          <h3 className="text-[28px] font-semibold leading-tight text-white">{event.title}</h3>
          <p
            className="mt-2 text-sm text-app-muted"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 1,
              overflow: "hidden"
            }}
          >
            {event.subtitle}
          </p>
        </Link>

        <div className="mt-4 flex flex-wrap gap-2">
          {metaChips.map((item) => (
            <MetaChip key={item}>{item}</MetaChip>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          {host ? <Avatar name={host.name} size="sm" src={host.avatarUrl} /> : null}
          <p className="text-sm text-app-muted">Hosted by {host?.name ?? "Host"}</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ActionButton
            label={primaryLabel}
            onClick={() => onPrimaryAction?.(event)}
            primary
          />
          {secondaryLabel ? (
            <ActionButton
              disabled={applied}
              label={secondaryLabel}
              onClick={() => onSecondaryAction?.(event)}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

function MetaChip({
  children,
  inverted = false
}: {
  children: React.ReactNode;
  inverted?: boolean;
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium",
        inverted
          ? "border-white/12 bg-[#0a0d14]/72 text-white backdrop-blur"
          : "border-white/8 bg-white/[0.03] text-app-muted"
      )}
    >
      {children}
    </span>
  );
}

function ActionButton({
  label,
  onClick,
  primary = false,
  disabled = false
}: {
  label: string;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={cn(
        "rounded-2xl px-4 py-3 text-sm font-semibold transition",
        primary
          ? "bg-app-purple text-white hover:bg-app-purple-hover"
          : "border border-white/10 bg-white/[0.02] text-white hover:border-white/20",
        disabled && "cursor-default border-app-success/20 bg-app-success/10 text-app-success hover:border-app-success/20"
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function SaveButton({
  saved,
  onClick,
  floating = false
}: {
  saved: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  floating?: boolean;
}) {
  return (
    <button
      aria-label={saved ? "Remove from saved" : "Save event"}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
        floating
          ? "border-white/12 bg-[#0a0d14]/72 text-white backdrop-blur hover:border-white/20"
          : "border-white/10 text-app-muted hover:border-white/20 hover:text-white"
      )}
      onClick={onClick}
      type="button"
    >
      <svg
        className={saved ? "fill-white" : "fill-none"}
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
    </button>
  );
}
