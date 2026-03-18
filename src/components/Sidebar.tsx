"use client";

import { Avatar } from "@/src/components/Avatar";
import { TagChip } from "@/src/components/Chips";
import { CommunityCard } from "@/src/components/CommunityCard";
import {
  communityThreads,
  featuredTags,
  trendingCreatorIds,
  users
} from "@/src/data/demo";
import { formatCompactNumber } from "@/src/lib/utils";

export function LeftSidebar() {
  return (
    <aside className="space-y-8 xl:sticky xl:top-[96px]">
      <section>
        <h2 className="mb-4 text-[30px] font-semibold text-white">Featured Tags</h2>
        <div className="flex flex-wrap gap-2">
          {featuredTags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[30px] font-semibold text-white">Recommended Communities</h2>
        {communityThreads.map((community) => (
          <CommunityCard
            community={community}
            key={community.id}
          />
        ))}
      </section>
    </aside>
  );
}

export function RightSidebar() {
  const trendingUsers = trendingCreatorIds
    .map((id) => users.find((user) => user.id === id))
    .filter(Boolean);

  return (
    <aside className="space-y-8 xl:sticky xl:top-[96px]">
      <section className="surface-card p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[30px] font-semibold text-white">Trending Creators</h2>
        </div>
        <div className="space-y-4">
          {trendingUsers.map((user) => (
            <div className="flex items-center justify-between gap-3" key={user?.id}>
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={user?.name ?? ""} size="md" src={user?.avatarUrl} />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{user?.handle}</p>
                  <p className="truncate text-sm text-app-muted">
                    {user?.pastEventsWorked} collabs · {formatCompactNumber((user?.mutuals ?? 0) * 720)} stans
                  </p>
                </div>
              </div>
              <button
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20"
                type="button"
              >
                Stan
              </button>
            </div>
          ))}
        </div>
        <button
          className="mt-5 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
          type="button"
        >
          Show more creators
        </button>
      </section>
    </aside>
  );
}
