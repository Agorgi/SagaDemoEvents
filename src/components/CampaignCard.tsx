"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { StatusChip } from "@/src/components/StatusChip";
import { ThresholdProgress } from "@/src/components/ThresholdProgress";
import { type DemoLaunch, getLaunchFundingProgress, type UserMode } from "@/src/data/launches";
import { getUserById } from "@/src/data/demo";
import { cn, formatDateRange } from "@/src/lib/utils";

type CampaignCardProps = {
  launch: DemoLaunch;
  mode: UserMode;
  href?: string;
  className?: string;
  compact?: boolean;
  reasonLine?: string;
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  saved?: boolean;
  onToggleSaved?: () => void;
};

export function CampaignCard({
  launch,
  mode,
  href,
  className,
  compact = false,
  reasonLine,
  primaryLabel,
  secondaryLabel,
  onPrimaryAction,
  onSecondaryAction,
  saved = false,
  onToggleSaved
}: CampaignCardProps) {
  const progress = getLaunchFundingProgress(launch);
  const host = getUserById(launch.hostId);
  const cardHref = href ?? `/campaigns/${launch.id}`;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[30px] border border-[#93a6ff]/18 bg-[linear-gradient(180deg,rgba(13,17,28,0.98),rgba(9,12,20,0.99))] shadow-card",
        compact ? "p-3" : "p-4",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-10 top-0 h-20 rounded-full bg-[radial-gradient(circle,rgba(109,94,243,0.24),rgba(109,94,243,0))] blur-2xl" />
      <Link className="block" href={cardHref}>
        <div className="relative overflow-hidden rounded-[24px]">
          <img
            alt={launch.title}
            className={cn(
              "w-full object-cover transition duration-500 group-hover:scale-[1.02]",
              compact ? "h-[180px]" : "h-[250px]"
            )}
            src={launch.coverImageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/18 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#1F1CB8]/20 to-transparent" />
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
            <StatusChip status={launch.status} />
            <span className="rounded-full border border-[#9ba8ff]/18 bg-[#151c32]/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/88 backdrop-blur-sm">
              Interest check
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="flex flex-wrap gap-2">
              <MetaPill label={formatDateRange(launch.startsAt)} />
              <MetaPill label={launch.city} />
              <MetaPill label={launch.fandomTags[0] ?? launch.format} />
            </div>
          </div>
        </div>
      </Link>

      <div className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={cardHref}>
              <h3 className={cn("font-semibold text-white", compact ? "text-xl" : "text-[30px] leading-[1.05]")}>
                {launch.title}
              </h3>
            </Link>
            <p className="mt-2 line-clamp-2 text-sm text-white/70">
              {reasonLine ?? launch.softLaunchSummary}
            </p>
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
              {saved ? "★" : "☆"}
            </button>
          ) : null}
        </div>

        <div className="mt-4">
          <ThresholdProgress
            current={progress.current}
            label={mode === "host" || mode === "business" ? "Momentum" : "Pledges to unlock"}
            target={progress.target}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <SignalTile label="Watching" value={String(progress.watchers)} />
          <SignalTile label="Pledged" value={String(progress.pledges)} />
          <SignalTile label="Dates" value={String(launch.dateOptions.length)} />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Avatar name={host?.name ?? "Host"} size="sm" src={host?.avatarUrl} />
          <div className="min-w-0">
            <span className="block text-sm text-white">{host?.name ?? "Host"}</span>
            <span className="block truncate text-xs text-app-muted">{launch.guestLine}</span>
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

function MetaPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-white/78">
      {label}
    </span>
  );
}

function SignalTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-[#0d1119] px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-app-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
