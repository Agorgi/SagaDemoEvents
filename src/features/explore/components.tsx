"use client";

import Link from "next/link";

import { Avatar, AvatarStack } from "@/src/components/Avatar";
import { StatusChip } from "@/src/components/StatusChip";
import {
  type EventContentFilter,
  type ExploreGenre,
  type HomeMode,
  EVENT_CONTENT_FILTERS,
  HOME_MODES
} from "@/src/features/explore/data";
import {
  type CreatorSpotlight,
  type FriendEventSpotlight,
  type GenreRailSummary
} from "@/src/features/explore/selectors";
import { type DemoEvent } from "@/src/data/demo";
import { getLaunchFundingProgress, type DemoLaunch } from "@/src/data/launches";
import { getMediaObjectPosition } from "@/src/lib/media-position";
import { APP_ROUTES } from "@/src/lib/routes";
import { cn, formatCompactNumber } from "@/src/lib/utils";

export function HomeHeader({
  firstName,
  fullName,
  subline,
  avatarUrl,
  unreadCount
}: {
  firstName: string;
  fullName: string;
  subline: string;
  avatarUrl?: string;
  unreadCount: number;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-sm text-app-muted">Hey, {firstName}</p>
        <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-white sm:text-[2.35rem]">
          {subline}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Link
          aria-label="Open updates"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.05] text-white transition hover:bg-white/[0.08]"
          href={APP_ROUTES.updates}
        >
          <BellIcon />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 inline-flex min-h-[15px] min-w-[15px] items-center justify-center rounded-full bg-app-purple px-1 text-[9px] font-bold text-white">
              {Math.min(unreadCount, 9)}
            </span>
          ) : null}
        </Link>
        <Link
          aria-label="Open profile"
          className="rounded-full transition hover:scale-[1.02]"
          href={APP_ROUTES.profile}
        >
          <Avatar className="h-11 w-11 text-xs" name={fullName} size="md" src={avatarUrl} />
        </Link>
      </div>
    </div>
  );
}

export function HomeSearchBar({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-[26px] border border-white/8 bg-[#0d1119] px-4 py-4 text-app-muted shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition focus-within:border-white/14">
      <SearchIcon />
      <input
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-app-muted"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search events, people, fandoms..."
        type="search"
        value={value}
      />
    </label>
  );
}

export function TopModeChips({
  activeMode,
  onChange
}: {
  activeMode: HomeMode;
  onChange: (mode: HomeMode) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
      {HOME_MODES.map((mode) => (
        <button
          className={cn(
            "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition",
            activeMode === mode.id
              ? "bg-white text-[#090b10]"
              : "bg-white/[0.05] text-app-muted hover:bg-white/[0.08] hover:text-white"
          )}
          key={mode.id}
          onClick={() => onChange(mode.id)}
          type="button"
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}

export function EventContentFilters({
  activeFilter,
  onChange
}: {
  activeFilter: EventContentFilter;
  onChange: (filter: EventContentFilter) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
      {EVENT_CONTENT_FILTERS.map((filter) => (
        <button
          className={cn(
            "shrink-0 rounded-full px-3 py-2 text-[11px] font-semibold tracking-[0.01em] transition",
            activeFilter === filter.id
              ? "bg-app-purple text-white"
              : "bg-white/[0.04] text-app-muted hover:bg-white/[0.07] hover:text-white"
          )}
          key={filter.id}
          onClick={() => onChange(filter.id)}
          type="button"
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export function SectionHeader({
  icon,
  title,
  onSeeAll
}: {
  icon: "spark" | "social" | "launch" | "creator" | "genres";
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <SectionIcon icon={icon} />
        <h2 className="truncate text-base font-semibold text-white">{title}</h2>
      </div>
      {onSeeAll ? (
        <button
          className="shrink-0 text-xs font-medium text-app-muted transition hover:text-white"
          onClick={onSeeAll}
          type="button"
        >
          See all
        </button>
      ) : null}
    </div>
  );
}

export function HorizontalRail({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 pr-1 snap-x snap-mandatory subtle-scrollbar">
      {children}
    </div>
  );
}

export function HomeEventRailCard({
  event,
  metadataLine,
  socialLine,
  hostName,
  hostAvatarUrl,
  eyebrow
}: {
  event: DemoEvent;
  metadataLine: string;
  socialLine: string;
  hostName?: string;
  hostAvatarUrl?: string;
  eyebrow?: string;
}) {
  return (
    <Link
      className="group block w-[252px] shrink-0 snap-start overflow-hidden rounded-[30px] border border-white/8 bg-[#101520] shadow-card transition hover:border-white/12"
      href={`/events/${event.id}`}
    >
      <div className="relative h-[224px] overflow-hidden">
        <img
          alt={event.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          src={event.posterUrl}
          style={{ objectPosition: getMediaObjectPosition(event.posterPosition) }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-[#07090f]/14 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <StatusChip status="confirmed" />
        </div>
        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#0a0d14]/68 px-2.5 py-1 text-[10px] font-medium text-white/82 backdrop-blur-sm">
          {eyebrow ?? event.fandomTags[0] ?? "Happening"}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Happening
          </p>
          <h3 className="line-clamp-2 text-[1.1rem] font-semibold leading-tight text-white">
            {event.title}
          </h3>
          <p className="text-xs text-white/64">{metadataLine}</p>
        </div>

        {hostName ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar
                className="h-9 w-9 border-[#101520]"
                name={hostName}
                size="sm"
                src={hostAvatarUrl}
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">{hostName}</p>
                <p className="truncate text-[11px] text-app-muted">{socialLine}</p>
              </div>
            </div>

            <div className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-white/76 transition group-hover:text-white">
              View
              <ArrowUpRightIcon />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="line-clamp-1 text-[11px] text-app-muted">{socialLine}</p>
            <div className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-white/76 transition group-hover:text-white">
              View
              <ArrowUpRightIcon />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

export function SoftLaunchRailCard({
  launch,
  metadataLine,
  hostName,
  hostAvatarUrl,
  eyebrow
}: {
  launch: DemoLaunch;
  metadataLine: string;
  hostName?: string;
  hostAvatarUrl?: string;
  eyebrow?: string;
}) {
  const progress = getLaunchFundingProgress(launch);
  const progressPercent = Math.max(
    0,
    Math.min(100, (progress.current / Math.max(progress.target, 1)) * 100)
  );

  return (
    <Link
      className="group block w-[252px] shrink-0 snap-start overflow-hidden rounded-[30px] border border-[#93a6ff]/16 bg-[#101520] shadow-card transition hover:border-[#93a6ff]/24"
      href={`/campaigns/${launch.id}`}
    >
      <div className="relative h-[224px] overflow-hidden">
        <img
          alt={launch.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          src={launch.coverImageUrl}
          style={{ objectPosition: getMediaObjectPosition(launch.coverImagePosition) }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-[#07090f]/16 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#1F1CB8]/24 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-app-purple/12 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <StatusChip status="live_soft_launch" />
        </div>
        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#0a0d14]/68 px-2.5 py-1 text-[10px] font-medium text-white/82 backdrop-blur-sm">
          {eyebrow ?? launch.fandomTags[0] ?? "Soft launch"}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
            In progress
          </p>
          <h3 className="line-clamp-2 text-[1.1rem] font-semibold leading-tight text-white">
            {launch.title}
          </h3>
          <p className="text-xs text-white/64">{metadataLine}</p>
        </div>

        {hostName ? (
          <div className="flex items-center gap-2.5">
            <Avatar
              className="h-9 w-9 border-[#101520]"
              name={hostName}
              size="sm"
              src={hostAvatarUrl}
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{hostName}</p>
              <p className="truncate text-[11px] text-app-muted">Launching this with the community</p>
            </div>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-[11px] text-app-muted">
            <span>
              {formatCompactNumber(progress.current)} / {formatCompactNumber(progress.target)} reserved
            </span>
            <span className="inline-flex items-center gap-1 text-white/76 transition group-hover:text-white">
              Reserve
              <ArrowUpRightIcon />
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-app-purple to-[#5d7dff]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function FriendInterestCard({
  item,
  metadataLine,
  hostName,
  hostAvatarUrl,
  eyebrow,
  saved = false,
  onToggleSaved
}: {
  item: FriendEventSpotlight;
  metadataLine: string;
  hostName?: string;
  hostAvatarUrl?: string;
  eyebrow?: string;
  saved?: boolean;
  onToggleSaved?: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-[30px] border border-white/8 bg-[#101520] shadow-card">
      <Link className="block" href={`/events/${item.event.id}`}>
        <div className="relative h-[214px] overflow-hidden">
          <img
            alt={item.event.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            src={item.event.posterUrl}
            style={{ objectPosition: getMediaObjectPosition(item.event.posterPosition) }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-[#07090f]/18 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
          <div className="absolute left-3 top-3">
            <StatusChip status="confirmed" />
          </div>
          <div className="absolute left-3 top-[48px] inline-flex items-center gap-1 rounded-full bg-[#0a0d14]/68 px-2.5 py-1 text-[10px] font-medium text-white/82 backdrop-blur-sm">
            {eyebrow ?? item.event.fandomTags[0] ?? "Friends"}
          </div>
          {onToggleSaved ? (
            <div className="absolute right-3 top-3 z-[2]">
              <OverlayIconButton
                ariaLabel={saved ? "Unsave event" : "Save event"}
                onClick={onToggleSaved}
                selected={saved}
              >
                <BookmarkIcon />
              </OverlayIconButton>
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 p-3">
            <div className="inline-flex max-w-full items-center gap-3 rounded-full bg-[#0a0d14]/68 px-3 py-2 backdrop-blur-sm">
              <AvatarStack
                people={item.actorUsers.map((user) => ({
                  id: user.id,
                  name: user.name,
                  avatarUrl: user.avatarUrl
                }))}
              />
              <p className="line-clamp-1 text-[11px] text-white/86">{item.socialLine}</p>
            </div>
          </div>
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Friends are going
          </p>
          <Link href={`/events/${item.event.id}`}>
            <h3 className="text-[1.1rem] font-semibold leading-tight text-white">
              {item.event.title}
            </h3>
          </Link>
          <p className="text-xs text-white/64">{metadataLine}</p>
        </div>

        {hostName ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar
                className="h-9 w-9 border-[#101520]"
                name={hostName}
                size="sm"
                src={hostAvatarUrl}
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">{hostName}</p>
                <p className="truncate text-[11px] text-app-muted">Hosted in your scene</p>
              </div>
            </div>

            <div className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-white/76 transition group-hover:text-white">
              View
              <ArrowUpRightIcon />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-end">
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-white/76 transition group-hover:text-white">
              View
              <ArrowUpRightIcon />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export function CreatorWeekCard({
  creator
}: {
  creator: CreatorSpotlight;
}) {
  const isOpenToWork = creator.publicServices > 0;

  return (
    <Link
      className="group block w-[178px] shrink-0 snap-start overflow-hidden rounded-[28px] border border-white/8 bg-[#101520] p-3.5 shadow-card transition hover:border-white/12"
      href={`/profiles/${creator.user.id}`}
    >
      <div className="relative overflow-hidden rounded-[24px] bg-white/[0.04]">
        <img
          alt={creator.profile.displayName}
          className="h-[124px] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          src={creator.profile.coverImage ?? creator.profile.avatarImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090f]/72 via-[#07090f]/18 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-app-purple/12 via-transparent to-transparent" />
        {isOpenToWork ? (
          <div className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[#0a0d14]/72 px-2 py-1 text-[10px] font-medium text-white/82 backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Open
          </div>
        ) : null}
        {creator.topTag ? (
          <div className="absolute bottom-2.5 left-2.5 rounded-full bg-[#0a0d14]/68 px-2.5 py-1 text-[10px] font-medium text-white/78 backdrop-blur-sm">
            {creator.topTag}
          </div>
        ) : null}
      </div>

      <div className="-mt-7 flex justify-center">
        <Avatar
          className="h-14 w-14 border-2 border-[#101520]"
          name={creator.profile.displayName}
          size="md"
          src={creator.profile.avatarImage || creator.user.avatarUrl}
        />
      </div>

      <div className="mt-3 space-y-1.5 text-center">
        <p className="line-clamp-1 text-sm font-semibold text-white">
          {creator.profile.displayName}
        </p>
        <p className="line-clamp-1 text-xs text-white/76">{creator.craft}</p>
        <p className="line-clamp-1 text-[11px] text-app-muted">
          {creator.locationLabel}
        </p>
      </div>
    </Link>
  );
}

export function CreatorSectionRow({
  creators
}: {
  creators: CreatorSpotlight[];
}) {
  return (
    <HorizontalRail>
      {creators.map((creator) => (
        <CreatorWeekCard creator={creator} key={creator.user.id} />
      ))}
    </HorizontalRail>
  );
}

export function GenreBrowseButton({
  genre,
  summary,
  compact = false,
  active = false,
  onClick
}: {
  genre: ExploreGenre;
  summary?: GenreRailSummary;
  compact?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const statsLine =
    summary && summary.eventCount + summary.launchCount > 0
      ? `${summary.eventCount} live${summary.launchCount > 0 ? ` · ${summary.launchCount} soft launch${summary.launchCount > 1 ? "es" : ""}` : ""}`
      : genre.description;

  return (
    <button
      className={cn(
        "group relative shrink-0 overflow-hidden rounded-[28px] border text-left shadow-card transition",
        compact ? "h-[122px] w-[224px] snap-start" : "h-[148px] w-full",
        active
          ? "border-white/16 shadow-[0_20px_44px_rgba(10,12,20,0.32)]"
          : "border-white/8 hover:border-white/12"
      )}
      onClick={onClick}
      type="button"
    >
      <img
        alt={genre.label}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        src={genre.imageUrl}
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,12,20,0.18),rgba(10,12,20,0.82))]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1F1CB8]/18 via-transparent to-transparent" />
      {active ? (
        <div className="absolute inset-0 bg-gradient-to-r from-white/8 via-transparent to-transparent" />
      ) : null}

      <div className="absolute left-4 top-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/58">
        Genre
      </div>

      <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0d14]/56 text-white/78 backdrop-blur-sm transition group-hover:bg-[#0a0d14]/68">
        <ArrowUpRightIcon />
      </div>

      <div className="relative flex h-full flex-col justify-end p-4">
        <p className="text-xl font-semibold tracking-[-0.03em] text-white">
          {genre.label}
        </p>
        <p
          className={cn(
            "mt-1 max-w-[82%] text-white/72",
            compact ? "line-clamp-1 text-xs" : "line-clamp-2 text-sm"
          )}
        >
          {statsLine}
        </p>
      </div>
    </button>
  );
}

export function GenreBrowseStack({
  genres,
  genreSummaries,
  activeGenreId,
  onSelect
}: {
  genres: ExploreGenre[];
  genreSummaries?: Map<string, GenreRailSummary>;
  activeGenreId?: string | null;
  onSelect: (genre: ExploreGenre) => void;
}) {
  return (
    <div className="space-y-3">
      {genres.map((genre) => (
        <GenreBrowseButton
          active={activeGenreId === genre.id}
          genre={genre}
          key={genre.id}
          summary={genreSummaries?.get(genre.id)}
          onClick={() => onSelect(genre)}
        />
      ))}
    </div>
  );
}

function SectionIcon({
  icon
}: {
  icon: "spark" | "social" | "launch" | "creator" | "genres";
}) {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-white/88">
      {icon === "spark" ? <SparkIcon /> : null}
      {icon === "social" ? <HeartGroupIcon /> : null}
      {icon === "launch" ? <LaunchIcon /> : null}
      {icon === "creator" ? <CreatorIcon /> : null}
      {icon === "genres" ? <GridIcon /> : null}
    </span>
  );
}

function OverlayIconButton({
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
        "flex h-10 w-10 items-center justify-center rounded-full border shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-sm transition",
        selected
          ? "border-app-purple/60 bg-app-purple/20 text-white"
          : "border-white/12 bg-[#0a0d14]/72 text-white/88 hover:border-white/24"
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      type="button"
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
      <path
        d="M15.5 15.5 20 20M10.75 17a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M12 4.75a4.25 4.25 0 0 0-4.25 4.25v2.06c0 .77-.2 1.53-.58 2.21l-1.07 1.92a1 1 0 0 0 .87 1.49h10.16a1 1 0 0 0 .87-1.49l-1.07-1.92a4.54 4.54 0 0 1-.58-2.21V9A4.25 4.25 0 0 0 12 4.75Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M9.75 18.25a2.25 2.25 0 0 0 4.5 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
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

function SparkIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function HeartGroupIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 19.2 5.8 13A3.9 3.9 0 0 1 11.3 7.5L12 8.2l.7-.7A3.9 3.9 0 1 1 18.2 13L12 19.2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function LaunchIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 4v10m0 0 4-4m-4 4-4-4M6 18.5h12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function CreatorIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 12a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Zm-6 6.5A6 6 0 0 1 12 14a6 6 0 0 1 6 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M4.75 4.75h5.5v5.5h-5.5Zm9 0h5.5v5.5h-5.5Zm-9 9h5.5v5.5h-5.5Zm9 0h5.5v5.5h-5.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M8 16 16 8M10 8h6v6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}
