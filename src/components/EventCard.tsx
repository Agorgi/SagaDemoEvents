"use client";

import Link from "next/link";

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
  saved?: boolean;
  onPrimaryAction?: () => void;
  onToggleSaved?: () => void;
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
  saved = false,
  onPrimaryAction,
  onToggleSaved
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
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
            <StatusChip status={status} />
            {onToggleSaved ? (
              <button
                className={cn(
                  "rounded-full bg-black/35 p-2 text-white/84 backdrop-blur-sm transition hover:bg-black/55",
                  saved ? "text-white" : ""
                )}
                onClick={(event) => {
                  event.preventDefault();
                  onToggleSaved();
                }}
                type="button"
              >
                <BookmarkIcon filled={saved} />
              </button>
            ) : null}
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
          <p className="line-clamp-1 text-sm text-app-muted">{socialLine}</p>
          <p className="line-clamp-1 text-sm text-white/76">{reasonLine}</p>
        </div>

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
