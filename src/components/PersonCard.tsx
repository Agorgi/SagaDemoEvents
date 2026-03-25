"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { TagChip } from "@/src/components/Chips";
import { type DemoUser } from "@/src/data/demo";
import { getProfileByUserId } from "@/src/data/social";

export function PersonCard({
  user,
  href,
  subtitle,
  tags,
  isFollowing = false,
  onFollow,
  compact = false
}: {
  user: DemoUser;
  href: string;
  subtitle: string;
  tags: string[];
  isFollowing?: boolean;
  onFollow?: () => void;
  compact?: boolean;
}) {
  const profile = getProfileByUserId(user.id);

  return (
    <div className={`surface-card overflow-hidden ${compact ? "p-3" : "p-4"}`}>
      <div className="relative overflow-hidden rounded-[24px] border border-white/8 bg-[#0d1119]">
        <Link className="block" href={href}>
          <div className="relative h-[110px]">
            {profile?.coverImageUrl ? (
              <img alt={user.name} className="h-full w-full object-cover" src={profile.coverImageUrl} />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/32 to-transparent" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {profile?.roleBadges?.slice(0, compact ? 1 : 2).map((badge) => (
                <span
                  className="rounded-full border border-white/12 bg-black/28 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white"
                  key={badge}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </Link>

        <div className="px-4 pb-4">
          <div className="-mt-7 flex items-end justify-between gap-3">
            <Link className="min-w-0 flex-1" href={href}>
              <div className="flex items-end gap-3">
                <Avatar
                  className={compact ? "h-14 w-14 border-[3px] border-[#0d1119]" : "h-16 w-16 border-[3px] border-[#0d1119]"}
                  name={user.name}
                  size="md"
                  src={user.avatarUrl}
                />
                <div className="min-w-0 pb-1">
                  <p className="truncate font-semibold text-white">{user.name}</p>
                  <p className="truncate text-sm text-app-muted">{subtitle}</p>
                </div>
              </div>
            </Link>
            {onFollow ? (
              <button
                className={`rounded-2xl ${isFollowing ? "border border-white/10 bg-white/[0.03] text-white" : "bg-app-purple text-white"} px-3 py-2 text-xs font-semibold transition hover:border-white/20 hover:bg-app-purple-hover`}
                onClick={onFollow}
                type="button"
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            ) : null}
          </div>

          {profile?.headline ? (
            <p className="mt-3 line-clamp-2 text-sm text-white/72">{profile.headline}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, compact ? 2 : 3).map((tag) => (
              <TagChip key={tag} label={tag} subdued />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
