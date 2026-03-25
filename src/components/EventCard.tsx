"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { StatusChip } from "@/src/components/StatusChip";
import { type DemoEvent } from "@/src/data/demo";
import { cn } from "@/src/lib/utils";

type EventCardProps = {
  event: DemoEvent;
  status?: "confirmed" | "completed" | "live";
  href?: string;
  className?: string;
  variant?: "feed" | "compact";
  primaryLabel: string;
  metadataLine: string;
  reasonLine: string;
  socialLine: string;
  hostName?: string;
  hostAvatarUrl?: string;
  hostSubline?: string;
  saved?: boolean;
  onPrimaryAction?: () => void;
  onToggleSaved?: () => void;
  onShareAction?: () => void;
};

export function EventCard({
  event,
  status = "confirmed",
  href,
  className,
  variant = "feed",
  primaryLabel,
  metadataLine,
  reasonLine,
  socialLine,
  hostName,
  hostAvatarUrl,
  hostSubline,
  saved = false,
  onPrimaryAction,
  onToggleSaved,
  onShareAction
}: EventCardProps) {
  const cardHref = href ?? `/events/${event.id}`;

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,21,34,0.94),rgba(10,13,20,0.98))] shadow-card transition hover:border-white/12",
        className
      )}
    >
      <Link className="block" href={cardHref}>
        <div className="relative overflow-hidden">
          <img
            alt={event.title}
            className={cn(
              "w-full object-cover transition duration-500 group-hover:scale-[1.02]",
              variant === "compact" ? "h-[220px]" : "h-[280px] sm:h-[320px]"
            )}
            src={event.posterUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/14 to-transparent" />
          <div className="absolute left-4 top-4">
            <StatusChip status={status} />
          </div>
        </div>
      </Link>

      <div className="space-y-3 p-4 sm:p-5">
        <div className="space-y-1.5">
          <Link href={cardHref}>
            <h3 className="line-clamp-2 text-2xl font-semibold leading-tight text-white sm:text-[28px]">
              {event.title}
            </h3>
          </Link>
          <p className="text-sm text-white/68">{metadataLine}</p>
          <p className="line-clamp-1 text-sm text-white/76">{reasonLine}</p>
        </div>

        {hostName || onToggleSaved || onShareAction ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {hostName ? (
                <>
                  <Avatar name={hostName} size="sm" src={hostAvatarUrl} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{hostName}</p>
                    <p className="truncate text-xs text-app-muted">{hostSubline ?? socialLine}</p>
                  </div>
                </>
              ) : (
                <p className="line-clamp-1 text-sm text-app-muted">{socialLine}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onToggleSaved ? (
                <IconActionButton
                  ariaLabel={saved ? "Unsave event" : "Save event"}
                  onClick={onToggleSaved}
                  selected={saved}
                >
                  <BookmarkIcon />
                </IconActionButton>
              ) : null}
              {onShareAction ? (
                <IconActionButton ariaLabel="Share event" onClick={onShareAction}>
                  <ShareIcon />
                </IconActionButton>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="line-clamp-1 text-sm text-app-muted">{socialLine}</p>
        )}

        <button
          className="min-h-[46px] w-full rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
          onClick={onPrimaryAction}
          type="button"
        >
          {primaryLabel}
        </button>
      </div>
    </article>
  );
}

function IconActionButton({
  ariaLabel,
  children,
  onClick,
  selected = false
}: {
  ariaLabel: string;
  children: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border transition",
        selected
          ? "border-app-purple/60 bg-app-purple/12 text-white"
          : "border-white/10 bg-white/[0.03] text-white/82 hover:border-white/20"
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function BookmarkIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
      <path
        d="M7 4.75C7 4.336 7.336 4 7.75 4h8.5c.414 0 .75.336.75.75v14.432c0 .617-.694.976-1.195.618L12 16.922 7.945 19.8c-.501.358-1.195-.001-1.195-.618V4.75Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 15V5m0 0 3.5 3.5M12 5 8.5 8.5M6.75 13.5v3.75c0 .414.336.75.75.75h9c.414 0 .75-.336.75-.75V13.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}
